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
export const getAllCertificates = async ({ page = 1, sort = "recent" } = {}) => {
    try {
        const response = await api.get("/getAllCertificates", {
            params: { page, sort },
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

/* ------------------------------------------------------------------
   READ – single
   GET /api/getCertificate/:id
   Returns: { status, data: { certificate: {} } }
------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------
   CREATE
   POST /api/createCertificates   (multipart/form-data)
   Body fields: title, issuedBy, issueDate, status, certificateImage (file)
   Returns: { status, data: { certificate: {} } }
------------------------------------------------------------------ */
export const createCertificate = async (formData) => {
    try {
        const response = await api.post("/createCertificates", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        const data = response.data;

        if (data.status === "success" && data.data?.certificate) {
            normalizeCert(data.data.certificate);
        }

        return data;
    } catch (error) {
        throw error;
    }
};

/* ------------------------------------------------------------------
   UPDATE
   PUT /api/updateCertificate/:id   (multipart/form-data)
   Body: any subset of create fields
   Returns: { status, certificate: {} }
------------------------------------------------------------------ */
export const updateCertificate = async (id, formData) => {
    try {
        const response = await api.put(`/updateCertificate/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        const data = response.data;

        if (data.status === "success" && data.certificate) {
            normalizeCert(data.certificate);
        }

        return data;
    } catch (error) {
        throw error;
    }
};

/* ------------------------------------------------------------------
   DELETE
   DELETE /api/deleteCertificate/:id
   Returns: { status, message }
------------------------------------------------------------------ */
export const deleteCertificate = async (id) => {
    try {
        const response = await api.delete(`/deleteCertificate/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
