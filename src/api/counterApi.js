/**
 * Counter API
 * All CRUD operations for the Counter resource.
 * Endpoints are proxied through /api (→ http://192.168.1.16:8000/api)
 */

import api from "./api";

/* ------------------------------------------------------------------
   READ – list (paginated)
   GET /api/getAllCounters?page=1&sort=recent
   Returns: { status, data: { counters: [] }, count }
------------------------------------------------------------------ */
export const getAllCounters = async ({ page = 1, sort = "recent" } = {}) => {
    try {
        const response = await api.get("/getAllCounters", { params: { page, sort } });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/* ------------------------------------------------------------------
   READ – single
   GET /api/counters/:id
   Returns: { status, data: { counter: {} } }
------------------------------------------------------------------ */
export const getCounter = async (id) => {
    try {
        const response = await api.get(`/counters/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/* ------------------------------------------------------------------
   READ – dropdown (valid counter name options)
   GET /api/counters/dropdown
   Returns: { status, data: { validNames: [] } }
------------------------------------------------------------------ */
export const getCounterDropdown = async () => {
    try {
        const response = await api.get("/counters/dropdown");
        return response.data;
    } catch (error) {
        throw error;
    }
};

/* ------------------------------------------------------------------
   CREATE
   POST /api/createCounter
   Body: { name, value, status }
   Returns: { status, data: { counter: {} } }
------------------------------------------------------------------ */
export const createCounter = async (data) => {
    try {
        const response = await api.post("/createCounter", data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/* ------------------------------------------------------------------
   UPDATE
   PUT /api/updateCounter/:id
   Body: { value, status }  (name cannot be changed after creation)
   Returns: { status, data: { counter: {} } }
------------------------------------------------------------------ */
export const updateCounter = async (id, data) => {
    try {
        const response = await api.put(`/updateCounter/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/* ------------------------------------------------------------------
   DELETE
   (Not yet available in backend — placeholder for when added)
   DELETE /api/deleteCounter/:id
   Returns: { status, message }
------------------------------------------------------------------ */
export const deleteCounter = async (id) => {
    try {
        const response = await api.delete(`/deleteCounter/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
