/**
 * FAQ API
 * All CRUD operations for the FAQ resource.
 * Endpoints are proxied through /api (→ http://192.168.1.16:8000/api)
 */

import api from "./api";

/* ------------------------------------------------------------------
   READ – list
   GET /api/getAllFAQs?catagory=...&status=...
   Returns: { status, data: [] }
------------------------------------------------------------------ */
export const getAllFAQs = async (params = {}) => {
    try {
        const response = await api.get("/getAllFAQs", { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/* ------------------------------------------------------------------
   READ – single
   GET /api/getFAQS/:id
   Returns: { status, data: { faq: {} } }
------------------------------------------------------------------ */
export const getFAQ = async (id) => {
    try {
        const response = await api.get(`/getFAQS/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/* ------------------------------------------------------------------
   CREATE
   POST /api/createFAQ
   Body: { question, answer, catagory, status }
   Returns: { status, data: { faq: {} } }
------------------------------------------------------------------ */
export const createFAQ = async (data) => {
    try {
        const response = await api.post("/createFAQ", data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/* ------------------------------------------------------------------
   UPDATE
   PUT /api/updateFAQ/:id
   Body: any subset of create fields
   Returns: { status, data: { faq: {} } }
------------------------------------------------------------------ */
export const updateFAQ = async (id, data) => {
    try {
        const response = await api.put(`/updateFAQ/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/* ------------------------------------------------------------------
   DELETE
   (Not yet available in backend — placeholder for when added)
   DELETE /api/deleteFAQ/:id
   Returns: { status, message }
------------------------------------------------------------------ */
export const deleteFAQ = async (id) => {
    try {
        const response = await api.delete(`/deleteFAQ/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
