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
        throw error;
    }
};

/**
 * Search services by query.
 * @param {string} query
 */
export const searchServices = async (title, params = {}) => {
    try {
        const response = await api.get("/service/search", { params: { title, ...params } });
        const result = response.data;

        if (result.status === "success" && Array.isArray(result.data)) {
            result.data = result.data.map(normalizeService);
        } else if (result.status === "success" && result.data?.services) {
            result.data.services = result.data.services.map(normalizeService);
        }

        return result;
    } catch (error) {
        throw error;
    }
};

export const getCategories = async () => {
    const response = await api.get("/services/categories");

    const result = response.data;

    return {
        status: result.status,
        data: result.categories,
        total: result.totalCategories,
    };
};


export const getStatuses = async () => {
    const response = await api.get("/statuses");

    const result = response.data;
    
    return { status: result.status, 
        data: result.statuses, 
        total: result.totalStatuses, };
};



export const filterServicesByStatus = async (status, params = {}) => {
    const { data } = await api.get("/filter/status", {
        params: { status, ...params },
    });

    return {
        status: data.status,
        data: data.services.map(normalizeService),
        total: data.totalServices,
    };
};

export const filterServicesByCategory = async (category, params = {}) => {
    const { data } = await api.get("/services/filter", {
        params: { category, ...params },
    });   

    return {
        status: data.status,
        data: data.services.map(normalizeService),
        total: data.totalServices,
    };
};


