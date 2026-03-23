/**
 * User API
 * Authentication, profile, and user management operations.
 * Endpoints are proxied through /api (→ http://192.168.1.16:8000/api)
 */

import api from "./api";
import { setSecureItem, removeSecureItem } from "../utils/storageUtils";

/* ------------------------------------------------------------------
   AUTH – Login
   POST /api/user/login
   Body: { email, password }
   Returns: { status, data: { role, firstTimeLogin } }
 Side effects: authenticates and stores:
              - `accessToken` session-only in the frontend
              - `userRole` and `firstTimeLogin` in session storage (short-lived UI state)
------------------------------------------------------------------ */
export const login = async (email, password, rememberMe = false) => {
  // Backend does not accept `rememberMe`. Keep it as a frontend-only signal.
  const response = await api.post("/user/login", { email, password });

  // Access token is returned in the Authorization header
  const authHeader = response.headers.authorization;
  
  // Determine storage based on Remember Me preference
  const tokenStorage = rememberMe ? "local" : "session";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    // Avoid stale auth state across storage modes by clearing any existing items first.
    removeSecureItem("accessToken");
    removeSecureItem("userRole");
    removeSecureItem("firstTimeLogin");
    setSecureItem("accessToken", token, { storage: tokenStorage });
  }

  if (response.data?.status === "success") {
    const { role, firstTimeLogin } = response.data.data;
    // Persist role and flags in the same storage as the token for consistency.
    setSecureItem("userRole", role, { storage: tokenStorage });
    setSecureItem("firstTimeLogin", firstTimeLogin ? "true" : "false", { storage: tokenStorage });
  }

  return response.data;
};

/* ------------------------------------------------------------------
   AUTH – Init & Cleanup helpers
------------------------------------------------------------------ */
export { initAuth, cleanupAuth } from "./api";

/* ------------------------------------------------------------------
   READ – current user (self)
   GET /api/getme
   Returns: { status, user: {} }
------------------------------------------------------------------ */
export const getMe = async () => {
  const response = await api.get("/getme");
  return response.data;
};

/* ------------------------------------------------------------------
   READ – user by ID
   GET /api/getUser/:id
   Returns: { status, data: { user: {} } }
------------------------------------------------------------------ */
export const getUserById = async (id) => {
  const response = await api.get(`/getUser/${id}`);
  return response.data;
};

/* ------------------------------------------------------------------
   UPDATE – user by ID  (Admin only)
   PUT /api/updateUser/:id
   Body: { name, email, phoneNumber, location, bio, employeId, department, role }
   Returns: { status, user: {} }
   ⚠️  This endpoint is restricted to Admin role.
------------------------------------------------------------------ */
export const updateUser = async (id, data) => {
  const response = await api.put(`/updateUser/${id}`, data);
  return response.data;
};

/* ------------------------------------------------------------------
   UPDATE – password (any logged-in user)
   PATCH /api/update-password
   Body: { currentPassword, newPassword, confirmPassword }
   Returns: { status, message }
------------------------------------------------------------------ */
export const updatePassword = async (data) => {
  const response = await api.patch("/update-password", data);
  return response.data;
};

/* ------------------------------------------------------------------
   UPDATE – profile photo (any logged-in user)
   POST /api/upload-photo   (multipart/form-data)
   Body: FormData with field "photo" (file)
   Returns: { status, data: { photo: "path/to/photo.jpg" } }
------------------------------------------------------------------ */
export const uploadPhoto = async (formData) => {
  const response = await api.post("/upload-photo", formData);
  return response.data;
};

/* ------------------------------------------------------------------
   AUTH – Forgot Password
   POST /api/forgot-password
   Body: { email }
   Returns: { status, message }
------------------------------------------------------------------ */
export const forgotPassword = async (email) => {
  const response = await api.post("/forgot-password", { email });
  return response.data;
};

/* ------------------------------------------------------------------
   AUTH – Reset Password
   POST /api/reset-password/:token
   Body: { newPassword, confirmPassword }
   Returns: { status, message }
------------------------------------------------------------------ */
export const resetPassword = async (token, data) => {
  const response = await api.post(`/reset-password/${token}`, data);
  return response.data;
};
