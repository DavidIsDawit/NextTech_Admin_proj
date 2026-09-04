/**
 * Certificate API
 * All CRUD operations for the Certificate resource.
 * Endpoints are proxied through /api (→ http://192.168.1.16:8000/api)
 */

import api, { buildImageUrl } from "./api";

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------ */
/** Normalise image path on a single certificate object (mutates in-place). */
const normalizeCert = (cert) => {
    if (cert?.certificateImage) {
        cert.certificateImage = buildImageUrl(cert.certificateImage);
    }
    return cert;
};

/* ------------------------------------------------------------------
   READ – list (paginated)
   GET /api/getAllCertificates?page=1&sort=recent
   Returns: { status, certificates: [], totalCertificates, currentPage, totalPages }
------------------------------------------------------------------ */
export const getAllCertificates = async (params = {}) => {
    try {
        const response = await api.get("/getAllCertificates", {
            params,
        });
        const data = response.data;

        if (data.status === "success" && Array.isArray(data.certificates)) {
            data.certificates = data.certificates.map(normalizeCert);
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

        if (data.status === "success" && data.data?.certificate) {
            normalizeCert(data.data.certificate);
        }

        return data;
    } catch (error) {
        throw error;
    }
};

export const createCertificate = async (formData) => {
    try {
        const response = await api.post("/createCertificates", formData);
        const data = response.data;

        if (data.status === "success" && data.data?.certificate) {
            normalizeCert(data.data.certificate);
        }

        return data;
    } catch (error) {
        throw error;
    }
};

export const updateCertificate = async (id, formData) => {
    try {
        const response = await api.put(`/updateCertificate/${id}`, formData);
        const data = response.data;

        if (data.status === "success" && data.certificate) {
            normalizeCert(data.certificate);
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

export const searchCertificates = async (name, params = {}) => {
    const response = await api.get(`/Certificates/search`,
        { params: { name, ...params } }
    );
    return response.data;
};

export const getStatuses = async () => {
    const response = await api.get("/certificates/statuses");
    const result = response.data;
    return {
        status: result.status,
        data: result.statuses,
        total: result.totalStatuses,
    };
};

export const filterCertificatesByStatus = async (status, params = {}) => {
    try {
        const formattedStatus = String(status).charAt(0).toUpperCase() + String(status).slice(1).toLowerCase();
        const { data } = await api.get("/certificates/filter-by-status", {
            params: { status: formattedStatus, ...params },
        });

        const list = data.certificates || data.certificate || data.data || [];
        return {
            status: data.status || "success",
            data: (Array.isArray(list) ? list : []).map(normalizeCert),
            total: data.totalCertificates ?? data.total ?? list.length,
        };
    } catch (error) {
        try {
            const allRes = await getAllCertificates(params);
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