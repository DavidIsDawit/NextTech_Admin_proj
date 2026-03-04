import api, { buildImageUrl } from "./api";

/** Normalize gallery object by building absolute image URLs. */
export const normalizeGallery = (item) => {
    if (item?.coverImage) {
        item.coverImage = buildImageUrl(item.coverImage);
    }
    if (item?.image) {
        item.image = buildImageUrl(item.images);
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
        console.error("Error fetching gallery:", error);
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
        console.error(`Error fetching gallery item ${id}:`, error);
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
        console.error("Error adding gallery item:", error);
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
        console.error(`Error updating gallery item ${id}:`, error);
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
        console.error(`Error deleting gallery item ${id}:`, error);
        throw error;
    }
};
