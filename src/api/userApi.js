/**
 * User API
 * Authentication, profile, and user management operations.
 * Endpoints are proxied through /api (→ http://192.168.1.16:8000/api)
 */

import api, { setAccessToken } from "./api";
import { getSecureItem, setSecureItem, removeSecureItem } from "../utils/storageUtils";
import { setRememberMe, clearPersistence } from "../utils/authSession";
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
  const response = await api.post("/user/login", { email, password });

  // Access token is returned in the Authorization header
  const authHeader = response.headers.authorization;
  
  const bodyToken = response.data?.accessToken || response.data?.data?.accessToken || response.data?.token;

  if ((authHeader && authHeader.startsWith("Bearer ")) || bodyToken) {
    const token = authHeader?.startsWith("Bearer ") 
      ? authHeader.replace("Bearer ", "") 
      : bodyToken;
    
    // Clear any stale local auth state
    clearPersistence();
    setAccessToken(null);
    removeSecureItem("userRole");
    removeSecureItem("firstTimeLogin");
    
    // Set new access token in memory
    setAccessToken(token);
    
    // Note: Refresh token is handled automatically by the browser via HttpOnly cookie
  }

  if (response.data?.status === "success") {
    const { role, firstTimeLogin } = response.data.data;
    
    // Always use localStorage since we use authSession for lifecycle control now
    const storageType = "local";
    
    setSecureItem("userRole", role, { storage: storageType });
    setSecureItem("firstTimeLogin", firstTimeLogin ? "true" : "false", { storage: storageType });

    // Save refresh token from response if present
    const refreshHeader = response.headers["refresh-token"];
    const bodyRefreshToken = response.data?.refreshToken || response.data?.data?.refreshToken;
    const tokenToSave = refreshHeader || bodyRefreshToken;
    if (tokenToSave) {
        // Use session cookie if not remembered
        const rTokenStorage = rememberMe ? "local" : "session";
        setSecureItem("refreshToken", tokenToSave, { storage: rTokenStorage });
    }

    // Handle "Remember Me" persistence flag using custom utility
    setRememberMe(rememberMe);
  }

  return response.data;
};

/* ------------------------------------------------------------------
   AUTH – Init & Cleanup helpers
------------------------------------------------------------------ */
export { initAuth, cleanupAuth } from "./api";

/** Helper to normalize user fields (handling name vs fullName inconsistency) */
export const normalizeUser = (user) => {
  if (user) {
    user.name = user.name || user.fullName;
  }
  return user;
};

/* ------------------------------------------------------------------
   READ – current user (self)
   GET /api/getme
   Returns: { status, user: {} }
------------------------------------------------------------------ */
export const getMe = async () => {
  const response = await api.get("/getme");
  const data = response.data;
  if (data?.user) {
    normalizeUser(data.user);
  }
  return data;
};

/* ------------------------------------------------------------------
   READ – user by ID
   GET /api/getUser/:id
   Returns: { status, data: { user: {} } }
------------------------------------------------------------------ */
export const getUserById = async (id) => {
  const response = await api.get(`/getUser/${id}`);
  const data = response.data;
  if (data?.data?.user) {
    normalizeUser(data.data.user);
  }
  return data;
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
  const responseData = response.data;
  if (responseData?.user) {
    normalizeUser(responseData.user);
  }
  return responseData;
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

/* ------------------------------------------------------------------
   READ – all users
   GET /api/getAllUsers
------------------------------------------------------------------ */
export const getAllUsers = async (params = {}) => {
  const response = await api.get("/getAllUsers", { params });
  const data = response.data;
  if (data?.users) {
    data.users = data.users.map(normalizeUser);
  } else if (data?.data?.users) {
    data.data.users = data.data.users.map(normalizeUser);
  } else if (Array.isArray(data?.data)) {
    data.data = data.data.map(normalizeUser);
  }
  return data;
};

/* ------------------------------------------------------------------
   SEARCH – users
   GET /api/searchUsers
------------------------------------------------------------------ */
export const searchUsers = async (name, params = {}) => {
  const response = await api.get("/users/search", { params: { name, ...params } });
  const data = response.data;
  if (data?.users) {
    data.users = data.users.map(normalizeUser);
  } else if (data?.data?.users) {
    data.data.users = data.data.users.map(normalizeUser);
  } else if (Array.isArray(data?.data)) {
    data.data = data.data.map(normalizeUser);
  }
  return data;
};

/* ------------------------------------------------------------------
   FILTER – users by role
   GET /api/filterUsersByRole
------------------------------------------------------------------ */
export const filterUsersByRole = async (role, params = {}) => {
  const response = await api.get("/users/filter", { params: { role, ...params } });
  const data = response.data;
  if (data?.users) {
    data.users = data.users.map(normalizeUser);
  } else if (data?.data?.users) {
    data.data.users = data.data.users.map(normalizeUser);
  } else if (Array.isArray(data?.data)) {
    data.data = data.data.map(normalizeUser);
  }
  return data;
};

/* ------------------------------------------------------------------
   CREATE – user
   POST /api/createUser
------------------------------------------------------------------ */
// export const createUser = async (userData) => {
//   const response = await api.post("/createUser", userData);
//   const data = response.data;
//   if (data?.user) {
//     normalizeUser(data.user);
//   }
//   return data;
// };

export const createUser = async (userData) => {
    console.log("Before request");

    try {
        const response = await api.post("/createUser", userData);
        console.log("After request");
        return response.data;
    } catch (err) {
        console.log("Caught error:", err);
        throw err;
    }
};


/* ------------------------------------------------------------------
   DELETE – user
   DELETE /api/deleteUser/:id
------------------------------------------------------------------ */
export const deleteUser = async (id) => {
  const response = await api.delete(`/deleteUser/${id}`);
  return response.data;
};

/* ------------------------------------------------------------------
   GET ROLES
   GET /api/rolesDropDown
------------------------------------------------------------------ */
export const getRoles = async () => {
  const response = await api.get("/rolesDropDown");
  return response.data;
};

