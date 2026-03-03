import api, { buildImageUrl } from "./api";

/** Normalize service object by building absolute image URLs. */
export const normalizeService = (service) => {
    if (service?.imageCover) {
        service.imageCover = buildImageUrl(service.imageCover);
    }
    if (service?.image) {
        service.image = buildImageUrl(service.image);
    }
    if (Array.isArray(service?.images)) {
        service.images = service.images.map((img) => buildImageUrl(img));
    }
    return service;
};

/*==============================
   Service API
 =============================== */

/**
 * Get all services with optional pagination.
 * @param {object} params { page, limit }
 */
export const getAllServices = async (params = {}) => {
    try {
        const response = await api.get("/services", { params });
        const result = response.data;

        // Based on Postman: result = { status: "success", data: { services: [...] } }
        if (result.status === "success" && result.data?.services) {
            result.data.services = result.data.services.map(normalizeService);
        }

        return result;
    } catch (error) {
        console.error("Error fetching services:", error);
        throw error;
    }
};

/**
 * Get a single service by ID.
 */
export const getService = async (id) => {
    try {
        const response = await api.get(`/services/${id}`);
        const result = response.data;

        if (result.status === "success" && result.data?.service) {
            result.data.service = normalizeService(result.data.service);
        }

        return result;
    } catch (error) {
        console.error(`Error fetching service ${id}:`, error);
        throw error;
    }
};

/**
 * Create a new service.
 * @param {FormData} formData
 */
export const createService = async (formData) => {
    try {
        const response = await api.post("/services", formData);
        return response.data;
    } catch (error) {
        console.error("Error creating service:", error);
        throw error;
    }
};

/**
 * Update an existing service.
 * @param {string} id
 * @param {FormData} formData
 */
export const updateService = async (id, formData) => {
    try {
        const response = await api.put(`/services/${id}`, formData);
        return response.data;
    } catch (error) {
        console.error(`Error updating service ${id}:`, error);
        throw error;
    }
};

/**
 * Delete a service by ID.
 */
export const deleteService = async (id) => {
    try {
        const response = await api.delete(`/services/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting service ${id}:`, error);
        throw error;
    }
};
