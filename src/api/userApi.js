/**
 * User API
 * Authentication, profile, and user management operations.
 * Endpoints are proxied through /api (→ http://192.168.1.16:8000/api)
 */

import api from "./api";

/* ------------------------------------------------------------------
   AUTH – Login
   POST /api/user/login
   Body: { email, password }
   Returns: { status, data: { role, firstTimeLogin } }
   Side effects: saves accessToken, userRole, firstTimeLogin to localStorage
------------------------------------------------------------------ */
export const login = async (email, password, rememberMe = false) => {
    try {
        const response = await api.post("/user/login", { email, password });

        // Access token is returned in the Authorization header
        const authHeader = response.headers.authorization;
        const storage = rememberMe ? localStorage : sessionStorage;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.replace("Bearer ", "");
            storage.setItem("accessToken", token);
        }

        if (response.data?.status === "success") {
            const { role, firstTimeLogin } = response.data.data;
            storage.setItem("userRole", role);
            storage.setItem("firstTimeLogin", firstTimeLogin ? "true" : "false");
        }

        return response.data;
    } catch (error) {
        throw error;
    }
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
    try {
        const response = await api.get("/getme");
        return response.data;
    } catch (error) {
        throw error;
    }
};

/* ------------------------------------------------------------------
   READ – user by ID
   GET /api/getUser/:id
   Returns: { status, data: { user: {} } }
------------------------------------------------------------------ */
export const getUserById = async (id) => {
    try {
        const response = await api.get(`/getUser/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/* ------------------------------------------------------------------
   UPDATE – user by ID  (Admin only)
   PUT /api/updateUser/:id
   Body: { name, email, phoneNumber, location, bio, employeId, department, role }
   Returns: { status, user: {} }
   ⚠️  This endpoint is restricted to Admin role.
------------------------------------------------------------------ */
export const updateUser = async (id, data) => {
    try {
        const response = await api.put(`/updateUser/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/* ------------------------------------------------------------------
   UPDATE – password (any logged-in user)
   PATCH /api/update-password
   Body: { currentPassword, newPassword, confirmPassword }
   Returns: { status, message }
------------------------------------------------------------------ */
export const updatePassword = async (data) => {
    try {
        const response = await api.patch("/update-password", data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/* ------------------------------------------------------------------
   UPDATE – profile photo (any logged-in user)
   POST /api/upload-photo   (multipart/form-data)
   Body: FormData with field "photo" (file)
   Returns: { status, data: { photo: "path/to/photo.jpg" } }
------------------------------------------------------------------ */
export const uploadPhoto = async (formData) => {
    try {
        const response = await api.post("/upload-photo", formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/* ------------------------------------------------------------------
   AUTH – Forgot Password
   POST /api/forgot-password
   Body: { email }
   Returns: { status, message }
------------------------------------------------------------------ */
export const forgotPassword = async (email) => {
    try {
        const response = await api.post("/forgot-password", { email });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/* ------------------------------------------------------------------
   AUTH – Reset Password
   POST /api/reset-password/:token
   Body: { newPassword, confirmPassword }
   Returns: { status, message }
------------------------------------------------------------------ */
export const resetPassword = async (token, data) => {
    try {
        const response = await api.post(`/reset-password/${token}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};
