import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { getSecureItem, setSecureItem, removeSecureItem } from "../utils/storageUtils";
import { shouldRestoreSession, clearPersistence } from "../utils/authSession";

let memoryAccessToken = null;

export const setAccessToken = (token) => {
  memoryAccessToken = token;
};

export const getAccessToken = () => {
  return memoryAccessToken;
};

export const clearToken = () => {
  memoryAccessToken = null;
};

export const setToken = (token) => {
  memoryAccessToken = token;
};

/* =====================
   CROSS-TAB SYNC
===================== */
const authChannel = new BroadcastChannel("auth_sync");

export const syncLogout = () => {
  authChannel.postMessage({ type: "logout" });
  cleanupAuth();
};

// Use Vite env var with fallback to local IP
// export const BASE_URL = import.meta.env.VITE_PUBLIC_URL;

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 10000, // 10 seconds default timeout (increased from 5s for local network stability)
});

/* =====================
   REQUEST INTERCEPTOR
===================== */
api.interceptors.request.use((config) => {
  if (config.url.includes("/user/login")) {
    return config;
  }

  if (config.url.includes("/refresh-token")) {
    const refreshToken = getSecureItem("refreshToken");
    if (refreshToken) {
      config.headers["refresh-token"] = refreshToken;
    }
    // We don't attach the access token to the refresh request usually
  } else {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // CSRF Protection: Read XSRF-TOKEN from cookie and set header
  const xsrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  if (xsrfToken && config.method !== 'get') {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
  }

  return config;
}, (error) => Promise.reject(error));

/* =====================
   RESPONSE INTERCEPTOR - Safe Refresh with Queue
===================== */
let isRefreshing = false;
let failedQueue = [];
let suppressRefreshFailRedirect = false;
let initPromise = null;

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const isValidationOrDuplicate = (msg, data) => {
  if (!msg) return false;
  const lowerMsg = msg.toLowerCase();
  return (
    msg.includes('E11000') ||
    lowerMsg.includes('duplicate') ||
    lowerMsg.includes('validation failed') ||
    lowerMsg.includes('already exists') ||
    lowerMsg.includes('is not unique') ||
    lowerMsg.includes('invalid') ||
    data?.errors ||
    data?.fields
  );
};

api.interceptors.response.use(
  (response) => {
    // If response is successful but backend returns fail status (for 200 OK responses)
    if (response.data?.status === "fail" || response.data?.status === "error") {
      const msg = response.data.message || "";

      // CRITICAL: Reject the promise so that components enter their catch blocks
      // where field-level error mapping (mapBackendErrors) can take place.
      return Promise.reject({
        response,
        message: msg,
        isLogicError: true
      });
    }
    return response;
  },
  async (err) => {
    const originalRequest = err.config;

    const isServerError = err.response?.status >= 500;
    const isNetworkError = !err.response && (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || err.message?.includes('timeout'));

    // Retry logic for 5xx and network/timeout errors (handles Render cold starts)
    if (isServerError || isNetworkError) {
      const retryCount = originalRequest._retryCount || 0;
      const maxRetries = 2;

      if (retryCount < maxRetries) {
        originalRequest._retryCount = retryCount + 1;
        // Exponential backoff: 2s, 4s
        const delay = Math.pow(2, retryCount + 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return api(originalRequest);
      }

      // All retries exhausted → redirect to server error page
      if (window.location.pathname !== "/server-error") {
        window.location.href = "/server-error";
      }
      return Promise.reject(err);
    }

    if (
      (err.response?.status === 401 || err.response?.status === 403) &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/user/login") &&
      !originalRequest.url.includes("/refresh-token")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await api.get("/refresh-token");
        const authHeader = refreshRes.headers.authorization;
        const refreshHeader = refreshRes.headers["refresh-token"];

        if (refreshHeader) {
          const storageType = window.localStorage.getItem("nt_remember_me") === "true" ? "local" : "session";
          setSecureItem("refreshToken", refreshHeader, { storage: storageType });
        }

        if (authHeader?.startsWith("Bearer ")) {
          const newToken = authHeader.replace("Bearer ", "");
          setAccessToken(newToken);
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }

        // FALLBACK: Check response body for the token
        const bodyToken = refreshRes.data?.accessToken || refreshRes.data?.data?.accessToken || refreshRes.data?.token;
        if (bodyToken) {
          setAccessToken(bodyToken);
          api.defaults.headers.common["Authorization"] = `Bearer ${bodyToken}`;
          processQueue(null, bodyToken);
          originalRequest.headers.Authorization = `Bearer ${bodyToken}`;
          return api(originalRequest);
        }

        throw new Error("No token in refresh response");
      } catch (refreshError) {
        processQueue(refreshError, null);
        syncLogout();

        if (!suppressRefreshFailRedirect && window.location.pathname !== "/admin/login") {
          window.location.href = "/admin/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

/* =====================
   PROACTIVE REFRESH
===================== */
let refreshTimer = null;

const startProactiveRefresh = () => {
  const token = getAccessToken();
  if (!token) return;

  try {
    const decodedToken = jwtDecode(token);
    const expiryTime = decodedToken.exp * 1000;
    const now = Date.now();
    const timeLeft = expiryTime - now;

    // Refresh 5 minutes before expiry
    const refreshTime = timeLeft - 5 * 60 * 1000;

    if (refreshTime > 0) {
      if (refreshTimer) clearTimeout(refreshTimer);

      refreshTimer = setTimeout(async () => {
        try {
          const refreshRes = await api.get("/refresh-token");
          const authHeader = refreshRes.headers.authorization;
          if (authHeader?.startsWith("Bearer ")) {
            const newToken = authHeader.replace("Bearer ", "");
            setAccessToken(newToken);
          }
          startProactiveRefresh();
        } catch {
          // Silent fail - reactive refresh will handle
        }
      }, refreshTime);
    }
  } catch {
    // Silent fail for invalid tokens
  }
};

export const initAuth = () => {
  // Use a singleton promise to prevent concurrent calls from triggering multiple refreshes
  // (Common in React Strict Mode during bootstrap)
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const existingToken = getAccessToken();

      if (!existingToken) {
        // Check if we should restore the session using the authSession utility
        if (!shouldRestoreSession()) {
          // New browser session AND "Remember Me" was NOT checked.
          // Do NOT auto-refresh. Clean up potentially stale tokens.
          cleanupAuth();
          return;
        }

        suppressRefreshFailRedirect = true;
        try {
          const refreshRes = await api.get("/refresh-token");
          const authHeader = refreshRes.headers.authorization;
          const refreshHeader = refreshRes.headers["refresh-token"];

          if (refreshHeader) {
            const storageType = window.localStorage.getItem("nt_remember_me") === "true" ? "local" : "session";
            setSecureItem("refreshToken", refreshHeader, { storage: storageType });
          }

          if (authHeader?.startsWith("Bearer ")) {
            const newToken = authHeader.replace("Bearer ", "");
            setAccessToken(newToken);
          } else {
            // FALLBACK: Check response body for the token
            const bodyToken = refreshRes.data?.accessToken || refreshRes.data?.data?.accessToken || refreshRes.data?.token;
            if (bodyToken) {
              setAccessToken(bodyToken);
            }
          }
        } catch {
          // If refresh fails, cleanup locally (no broadcast needed during initial boot)
          cleanupAuth();
        } finally {
          suppressRefreshFailRedirect = false;
        }
      }

      // Hydrate role if we have an access token but no role cached yet.
      const tokenAfterInit = getAccessToken();
      if (tokenAfterInit && !getSecureItem("userRole")) {
        try {
          const meRes = await api.get("/getme");
          const user = meRes?.data?.user || meRes?.user || null;
          const role = user?.role;
          if (role) setSecureItem("userRole", role);

          // Keep the first-login password flow consistent even when auth is restored via refresh cookie.
          const firstTimeLogin = user?.firstTimeLogin;
          if (typeof firstTimeLogin !== "undefined") {
            const flag = firstTimeLogin === true || firstTimeLogin === "true" ? "true" : "false";
            setSecureItem("firstTimeLogin", flag);
          }
        } catch {
          // Ignore: role will be resolved again after next successful refresh/login.
        }
      }

      startProactiveRefresh();
    } finally {
      // Keep the promise if it succeeded? Usually we clear it if we want to allow re-init,
      // but for boot-up, we want it to persist. 
      // We clear it so that if a user logs out and logs back in, initAuth can be called again if needed.
      initPromise = null;
    }
  })();

  return initPromise;
};

export const cleanupAuth = () => {
  if (refreshTimer) clearTimeout(refreshTimer);
  clearPersistence();
  setAccessToken(null);
  removeSecureItem("refreshToken");
  removeSecureItem("userRole");
  removeSecureItem("firstTimeLogin");
};


// Helper to build a full image URL.
// In development, routes through the Vite /img proxy to avoid CORS/403.
// /img/foo/bar.png  →  proxy  →  http://192.168.1.16:8000/public/foo/bar.png
export const buildImageUrl = (relativePath) => {
  if (!relativePath) return null;
  if (/^https?:\/\//.test(relativePath)) return relativePath; // already absolute

  // Remove only the leading root storage prefix if the backend stored a path like
  // /public/... or /Public/... or /img/.... Preserve the actual image folders below it.
  let cleanPath = relativePath.replace(/^\/+/, '');
  cleanPath = cleanPath.replace(/^(img|public)\//i, '');
  // cleanPath = cleanPath.replace(/^(img|public)$/i, '');

  return `/img/${cleanPath}`;
};

export default api;