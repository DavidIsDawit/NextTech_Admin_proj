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

/**
 * Search news.
 */
export const searchNews = async (title, params = {}) => {
    try {
        const response = await api.get("/news/search", { params: { title, ...params } });
        const result = response.data;

        if (result.status === "success" && Array.isArray(result.data)) {
            result.data = result.data.map(normalizeNews);
        } else if (result.status === "success" && result.data?.news) {
            result.data.news = result.data.news.map(normalizeNews);
        }

        return result;
    } catch (error) {
        throw error;
    }
};

export const getCategories = async () => {
    const response = await api.get("/news/categories");

    const result = response.data;

    return {
        status: result.status,
        data: result.categories,
        total: result.totalCategories,
    };
};


export const getStatuses = async () => {
    const response = await api.get("/news/statuses");

    const result = response.data;

    return {
        status: result.status,
        data: result.statuses,
        total: result.totalStatuses,
    };
};



export const filterNewsByStatus = async (status, params = {}) => {
    try {
        const { data } = await api.get("/news/filter-by-status", {
            params: { status: String(status).toLowerCase(), ...params },
        });

        const list = data.news || data.data || [];
        return {
            status: data.status || "success",
            data: (Array.isArray(list) ? list : []).map(normalizeNews),
            total: data.totalnews ?? data.totalNews ?? data.total ?? list.length,
        };
    } catch (error) {
        try {
            const allRes = await getAllNews(params);
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

export const filterNewsByCategory = async (catagory, params = {}) => {
    try {
        const { data } = await api.get("/news/filter-by-category", {
            params: { catagory, category: catagory, ...params },
        });

        const list = data.news || data.data || [];
        return {
            status: data.status || "success",
            data: (Array.isArray(list) ? list : []).map(normalizeNews),
            total: data.totalNews ?? data.totalnews ?? data.total ?? list.length,
        };
    } catch (error) {
        try {
            const allRes = await getAllNews(params);
            if (allRes && (allRes.status === "success" || Array.isArray(allRes.data))) {
                const list = allRes.data || [];
                const filtered = list.filter((item) => {
                    const itemCat = item.catagory || item.category || "";
                    return itemCat.toLowerCase() === String(catagory).toLowerCase();
                });
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



