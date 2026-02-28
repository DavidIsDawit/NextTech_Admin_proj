import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

// fixed base URL for backend; ensures image paths are resolvable even if env var is missing
export const BASE_URL = "http://192.168.1.16:8000";

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

export const getMe = async () => {
  try {
    const response = await api.get("/getme");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post("/user/login", { email, password });

    // Access token is in the Authorization header as per Postman docs
    const authHeader = response.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      localStorage.setItem("accessToken", token);
    }

    // User info is in response body
    if (response.data?.status === "success") {
      const { role, firstTimeLogin } = response.data.data;
      localStorage.setItem("userRole", role);
      // store flag so UI guards can read it without duplicating code
      localStorage.setItem("firstTimeLogin", firstTimeLogin ? "true" : "false");
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePassword = async (data) => {
  try {
    // Postman: PATCH /api/update-password
    const response = await api.patch("/update-password", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (id, data) => {
  try {
    // Postman: PUT /api/updateUser/:id
    const response = await api.put(`/updateUser/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const uploadPhoto = async (formData) => {
  try {
    // Postman: POST /api/upload-photo
    const response = await api.post("/upload-photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/* =====================
   CERTIFICATES API
===================== */
// helper that mirrors the "full URL" logic normally handled on the server
// (some APIs may already return an absolute URL, so we handle both cases).
export const buildImageUrl = (relativePath) => {
  if (!relativePath) return null;
  if (/^https?:\/\//.test(relativePath)) return relativePath; // already absolute

  const base = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
  const cleanPath = relativePath.replace(/^\/+/, '');
  return `${base}${cleanPath}`;
};

export const getAllCertificates = async (params) => {
  try {
    const response = await api.get("/getAllCertificates", { params });
    const data = response.data;

    // post‑process returned certificates so each item has a usable image URL
    if (data.status === "success" && Array.isArray(data.certificates)) {
      data.certificates = data.certificates.map((c) => {
        if (c.certificateImage) {
          c.certificateImage = buildImageUrl(c.certificateImage);
        }
        return c;
      });
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const getCertificate = async (id) => {
  try {
    const response = await api.get(`/getCertificate/${id}`);
    const data = response.data;

    if (
      data.status === "success" &&
      data.data &&
      data.data.certificate
    ) {
      const cert = data.data.certificate;
      if (cert.certificateImage) {
        cert.certificateImage = buildImageUrl(cert.certificateImage);
      }
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const createCertificate = async (formData) => {
  try {
    const response = await api.post("/createCertificates", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const data = response.data;
    // if the backend returned the certificate object, ensure its image is full URL
    if (
      data.status === "success" &&
      data.data &&
      data.data.certificate &&
      data.data.certificate.certificateImage
    ) {
      data.data.certificate.certificateImage = buildImageUrl(
        data.data.certificate.certificateImage
      );
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCertificate = async (id, formData) => {
  try {
    const response = await api.put(`/updateCertificate/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const data = response.data;
    if (
      data.status === "success" &&
      data.certificate &&
      data.certificate.certificateImage
    ) {
      data.certificate.certificateImage = buildImageUrl(
        data.certificate.certificateImage
      );
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCertificate = async (id) => {
  try {
    const response = await api.delete(`/deleteCertificate/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/* =====================
   FAQ API
===================== */

export const getAllFAQs = async (params) => {
  try {
    const response = await api.get("/getAllFAQs", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFAQ = async (id) => {
  try {
    const response = await api.get(`/getFAQS/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createFAQ = async (formData) => {
  try {
    const response = await api.post("/createFAQ", formData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateFAQ = async (id, formData) => {
  try {
    const response = await api.put(`/updateFAQ/${id}`, formData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/* =====================
   COUNTER API
===================== */

export const getAllCounters = async (params) => {
  try {
    const response = await api.get("/getAllCounters", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCounter = async (id) => {
  try {
    const response = await api.get(`/counters/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createCounter = async (data) => {
  try {
    const response = await api.post("/createCounter", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCounter = async (id, data) => {
  try {
    const response = await api.put(`/updateCounter/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCounterDropdown = async () => {
  try {
    const response = await api.get("/counters/dropdown");
    return response.data;
  } catch (error) {
    throw error;
  }
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