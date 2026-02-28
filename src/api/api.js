import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

// Use Vite env var with fallback to local IP
export const BASE_URL = import.meta.env.VITE_PUBLIC_URL;

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
  (response) => {
    // If response is successful but backend returns fail status (for 200 OK responses)
    if (response.data?.status === "fail" || response.data?.status === "error") {
      toast.error(response.data.message || "An error occurred");
    }
    return response;
  },
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

    // Handle Backend Error Messages (4xx, 403, 400 etc)
    if (err.response?.data?.message) {
      toast.error(err.response.data.message);
    } else if (err.response?.status >= 500) {
      toast.error("Internal Server Error", {
        description: "The server encountered a problem and couldn't process your request.",
        id: "server-error-toast",
      });
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
  localStorage.removeItem("firstTimeLogin");
};


// Helper to build a full image URL.
// In development, routes through the Vite /img proxy to avoid CORS/403.
// /img/foo/bar.png  →  proxy  →  http://192.168.1.16:8000/public/foo/bar.png
export const buildImageUrl = (relativePath) => {
  if (!relativePath) return null;
  if (/^https?:\/\//.test(relativePath)) return relativePath; // already absolute

  // Strip any leading slashes, and also remove any leading "img/" or "public/"
  // that the backend may have stored in the DB, to avoid double segments like /img/public/...
  let cleanPath = relativePath.replace(/^\/+/, '');
  cleanPath = cleanPath.replace(/^(img\/|public\/)/, '');

  return `/img/${cleanPath}`;
};

/*==============================
   Testimonial Api
 =============================== */
 export const getAllTestimonials = async (params) => {
    try {
      const res = await api.get("/getAllTestimonials", {
                params: { page, limit, sort },
                });
                return res.data;
            } catch (error) {
        throw error;
      } 
 } ;

export default api;