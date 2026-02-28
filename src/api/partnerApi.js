/**
 * Partner API
 * All CRUD operations for the Partner resource.
 * Endpoints are proxied through /api (→ http://192.168.1.16:8000/api)
 */

import api, { buildImageUrl } from "./api";

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------ */
/** Normalise image path on a single partner object (mutates in-place). */
const normalizePartner = (partner) => {
    if (partner?.partnerImage) {
        partner.partnerImage = buildImageUrl(partner.partnerImage);
    }
    return partner;
};

/* ------------------------------------------------------------------
   READ – list (paginated)
   GET /api/GetPartners?page=1&limit=10&sort=recent
   Returns: { status, totalPartners, data: [] }
------------------------------------------------------------------ */
export const getAllPartners = async ({ page = 1, limit = 10, sort = "recent" } = {}) => {
    try {
        const response = await api.get("/GetPartners", {
            params: { page, limit, sort },
        });
        const result = response.data;

        if (result.status === "success" && Array.isArray(result.data)) {
            result.data = result.data.map(normalizePartner);
        }

        return result;
    } catch (error) {
        throw error;
    }
};

/* ------------------------------------------------------------------
   CREATE
   POST /api/Addpartners   (multipart/form-data)
   Body fields: partnerName, status, partnerImage (file)
   Returns: { status, data: { partner: {} } }
------------------------------------------------------------------ */
export const createPartner = async (formData) => {
    try {
        const response = await api.post("/Addpartners", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        const result = response.data;

        if (result.status === "success" && result.data?.partner) {
            normalizePartner(result.data.partner);
        }

        return result;
    } catch (error) {
        throw error;
    }
};

/* ------------------------------------------------------------------
   UPDATE
   PUT /api/UpdatePartners/:id   (multipart/form-data)
   Body: any subset of create fields
   Returns: { status, data: { partner: {} } }
------------------------------------------------------------------ */
export const updatePartner = async (id, formData) => {
    try {
        const response = await api.put(`/UpdatePartners/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        const result = response.data;

        if (result.status === "success" && result.data?.partner) {
            normalizePartner(result.data.partner);
        }

        return result;
    } catch (error) {
        throw error;
    }
};

/* ------------------------------------------------------------------
   DELETE
   DELETE /api/DeletePartners/:id
   Returns: { status, message }
------------------------------------------------------------------ */
export const deletePartner = async (id) => {
    try {
        const response = await api.delete(`/DeletePartners/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
