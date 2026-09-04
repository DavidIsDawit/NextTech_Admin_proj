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
        const response = await api.post("/AddPartners", formData);
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
   (CRITICAL: Not yet available in backend — this will return 404)
   PUT /api/UpdatePartners/:id   (multipart/form-data)
   Body: any subset of create fields
   Returns: { status, data: { partner: {} } }
------------------------------------------------------------------ */
export const updatePartner = async (id, formData) => {
    try {
        const response = await api.put(`/UpdatePartner/${id}`, formData);
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

/* ------------------------------------------------------------------
   SEARCH
   GET /api/searchPartners
------------------------------------------------------------------ */
export const searchPartners = async (name, params = {}) => {
    try {
        const response = await api.get("/partner/search", { params: { name, ...params } });
        const result = response.data;

        if (result.status === "success" && Array.isArray(result.data)) {
            result.data = result.data.map(normalizePartner);
        } else if (result.status === "success" && result.data?.partners) {
            result.data.partners = result.data.partners.map(normalizePartner);
        }

        return result;
    } catch (error) {
        throw error;
    }
};

export const getStatuses = async () => {
    const response = await api.get("/partners/statuses");

    const result = response.data;
    
    return { status: result.status, 
        data: result.statuses, 
        total: result.totalStatuses, };
};

export const filterPartnersByStatus = async (status, params = {}) => {
    try {
        const { data } = await api.get("/partners/filter", {
            params: { status, ...params },
        });

        const list = data.partners || data.partner || data.data || [];
        return {
            status: data.status || "success",
            data: (Array.isArray(list) ? list : []).map(normalizePartner),
            total: data.totalPartners ?? data.total ?? list.length,
        };
    } catch (error) {
        try {
            const allRes = await getAllPartners(params);
            if (allRes && (allRes.status === "success" || Array.isArray(allRes.data))) {
                const list = allRes.data || [];
                const filtered = list.filter((item) =>
                    (item.status || "").toLowerCase() === String(status).toLowerCase()
                );
                return {
                    status: "success",
                    data: filtered,
                    total: filtered.length,
                };
            }
        } catch {
            // Ignore fallback error
        }
        throw error;
    }
};
