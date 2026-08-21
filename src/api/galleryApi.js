import api, { buildImageUrl } from "./api";

/** Normalize gallery object by building absolute image URLs. */
export const normalizeGallery = (item) => {
    if (item?.coverImage) {
        item.coverImage = buildImageUrl(item.coverImage);
    }
    if (item?.image) {
        item.image = buildImageUrl(item.image);
    }
    if (Array.isArray(item?.images)) {
        item.images = item.images.map(img => buildImageUrl(img));
    }
    return item;
};

/*==============================
   Gallery API
 =============================== */

/**
 * Get all gallery items.
 */
export const getAllGallery = async (params = {}) => {
    try {
        const response = await api.get("/getAllGallery", { params });
        const result = response.data;

        if (result.status === "success" && Array.isArray(result.data)) {
            result.data = result.data.map(normalizeGallery);
        }

        return result;
    } catch (error) {
        throw error;
    }
};

/**
 * Get a single gallery item by ID.
 */
export const getGallery = async (id) => {
    try {
        const response = await api.get(`/getGallery/${id}`);
        const result = response.data;

        if (result.status === "success" && result.data) {
            result.data = normalizeGallery(result.data);
        }

        return result;
    } catch (error) {
        throw error;
    }
};

/**
 * Add a new gallery item.
 */
export const addGallery = async (formData) => {
    try {
        const response = await api.post("/addGallery", formData);
        const result = response.data;

        if (result.status === "success" && result.data) {
            result.data = normalizeGallery(result.data);
        }

        return result;
    } catch (error) {
        throw error;
    }
};

/**
 * Update an existing gallery item.
 */
export const updateGallery = async (id, formData) => {
    try {
        const response = await api.put(`/updateGallery/${id}`, formData);
        const result = response.data;

        if (result.status === "success" && result.data) {
            result.data = normalizeGallery(result.data);
        }

        return result;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete a gallery item.
 */
export const deleteGallery = async (id) => {
    try {
        const response = await api.delete(`/deleteGallery/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Search gallery.
 */
export const searchGallery = async (title, params = {}) => {
    const response = await api.get("/gallery/search", {
        params: { title, ...params },
    });

    const result = response.data;

    return {
        status: result.status,
        data: (result.galleries || []).map(normalizeGallery),
        total: result.totalGalleries ?? (result.galleries || []).length,
    };
};

export const getCategories = async () => {
    const response = await api.get("/gallery/categories");

    const result = response.data;

    return {
        status: result.status,
        data: result.categories || [],
        total: result.totalCategories,
    };
};

export const getStatuses = async () => {
    const response = await api.get("/gallery/statuses");

    const result = response.data;

    return {
        status: result.status,
        data: result.statuses || [],
        total: result.totalStatuses,
    };
};

export const filterGalleryByStatuses = async (status, params = {}) => {
    const { data } = await api.get("/gallery/filter-by-status", {
        params: { status, ...params },
    });

    return {
        status: data.status,
        data: (data.galleries || []).map(normalizeGallery),
        total: data.totalGalleries ?? (data.galleries || []).length,
    };
};

export const filterGalleryByCategory = async (category, params = {}) => {
    const { data } = await api.get("/gallery/filter-by-category", {
        params: { category, ...params },
    });

    return {
        status: data.status,
        data: (data.galleries || []).map(normalizeGallery),
        total: data.totalGalleries ?? (data.galleries || []).length,
    };
};


