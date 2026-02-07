import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

export const BASE_URL = "http://192.168.1.16:8001/";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

/* =====================
   REQUEST INTERCEPTOR
===================== */
api.interceptors.request.use((config) => {
  if (config.url.includes("/user/login") || config.url.includes("/refresh-token")) {
    return config;
  }

  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => Promise.reject(error));

/* =====================
   RESPONSE INTERCEPTOR - Safe Refresh with Queue
===================== */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (err) => {
    const originalRequest = err.config;

    // Handle Network Errors (Server Down)
    if (!err.response && (err.code === 'ERR_NETWORK' || err.message === 'Network Error')) {
      toast.error("Network Error: Server appears to be offline", {
        description: "Please check if your backend service is running.",
        id: "network-error-toast",
      });
      return Promise.reject(err);
    }

    // Handle Server Errors (500s)
    if (err.response?.status >= 500) {
      toast.error("Internal Server Error", {
        description: "The server encountered a problem and couldn't process your request.",
        id: "server-error-toast",
      });
      return Promise.reject(err);
    }

    if (
      err.response?.status === 401 &&
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
        if (!authHeader?.startsWith("Bearer ")) {
          throw new Error("Invalid refresh response");
        }

        const newToken = authHeader.replace("Bearer ", "");

        localStorage.setItem("accessToken", newToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userRole");

        if (window.location.pathname !== "/admin/login") {
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
  const token = localStorage.getItem("accessToken");
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
          await api.get("/refresh-token");
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
  startProactiveRefresh();
};

export const cleanupAuth = () => {
  if (refreshTimer) clearTimeout(refreshTimer);
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userRole");
};

export default api;