import api, { buildImageUrl } from "./api";

/** Normalize news object by building absolute image URLs. */
export const normalizeNews = (news) => {
    if (news?.imageCover) {
        news.imageCover = buildImageUrl(news.imageCover);
    }
    if (news?.image) {
        news.image = buildImageUrl(news.image);
    }
    if (Array.isArray(news?.images)) {
        news.images = news.images.map(img => buildImageUrl(img));
    }
    return news;
};

/*==============================
   News API
 =============================== */

/**
 * Get all news with optional pagination and sorting.
 */
export const getAllNews = async (params = {}) => {
    try {
        const response = await api.get("/AllNews", { params });
        const result = response.data;

        // Postman: { status: "success", totalNews: 12, data: { news: [...] } }
        const newsArray = result.data?.news || (Array.isArray(result.data) ? result.data : []);

        if (result.status === "success") {
            if (result.data?.news) {
                result.data.news = result.data.news.map(normalizeNews);
            } else if (Array.isArray(result.data)) {
                result.data = result.data.map(normalizeNews);
            }
        }

        return result;
    } catch (error) {
        throw error;
    }
};

/**
 * Get a single news by ID.
 */
export const getNewsById = async (id) => {
    try {
        const response = await api.get(`/news/${id}`);
        const result = response.data;

        if (result.status === "success" && result.data) {
            result.data = normalizeNews(result.data);
        }

        return result;
    } catch (error) {
        throw error;
    }
};

/**
 * Create a new news entry.
 */
export const createNews = async (formData) => {
    try {
        const response = await api.post("/news", formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Update an existing news entry.
 */
export const updateNews = async (id, formData) => {
    try {
        const response = await api.put(`/news/${id}`, formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete a news entry.
 */
export const deleteNews = async (id) => {
    try {
        const response = await api.delete(`/DeleteNews/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
