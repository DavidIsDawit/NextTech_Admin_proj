/**
 * Portfolio API
 * Endpoints for Project Portfolio management.
 * Auth is handled globally by the axios interceptor in api.js.
 */

import api, { buildImageUrl } from "./api";

/** Normalize image paths in portfolio objects. */
const normalizePortfolio = (item) => {
    if (item?.thumbinal) {
        item.thumbinal = buildImageUrl(item.thumbinal);
    }
    if (item?.images && Array.isArray(item.images)) {
        item.images = item.images.map(img => buildImageUrl(img));
    }
    return item;
};

/** List all portfolios (paginated). */
export const getAllPortfolios = async ({ page = 1, limit = 10, sort = "latest" } = {}) => {
    try {
        const response = await api.get("/getAllPortfolios", {
            params: { page, limit, sort },
        });
        const result = response.data;

        // Flexible response mapping: handles both wrapped and flat array responses
        let portfoliosList = result.portfolios
            || result.data?.portfolios
            || (Array.isArray(result.data) ? result.data : []);

        if (Array.isArray(portfoliosList)) {
            const normalized = portfoliosList.map(normalizePortfolio);
            if (result.portfolios) result.portfolios = normalized;
            else if (result.data?.portfolios) result.data.portfolios = normalized;
            else if (Array.isArray(result.data)) result.data = normalized;
        }

        return result;
    } catch (error) {
        throw error;
    }
};

/** Get a single portfolio by ID. */
export const getPortfolio = async (id) => {
    try {
        const response = await api.get(`/getPortfolio/${id}`);
        const result = response.data;
        if (result.status === "success" && result.data?.portfolio) {
            result.data.portfolio = normalizePortfolio(result.data.portfolio);
        }
        return result;
    } catch (error) {
        throw error;
    }
};

/** Create a new portfolio (multipart/form-data). */
export const createPortfolio = async (formData) => {
    try {
        const response = await api.post("/createPortfolio", formData);
        const result = response.data;
        if (result.status === "success" && result.data?.portfolio) {
            normalizePortfolio(result.data.portfolio);
        }
        return result;
    } catch (error) {
        throw error;
    }
};

/** Update a portfolio (multipart/form-data). */
export const updatePortfolio = async (id, formData) => {
    try {
        const response = await api.put(`/updatePortfolio/${id}`, formData);
        const result = response.data;
        if (result.status === "success" && result.data?.portfolio) {
            normalizePortfolio(result.data.portfolio);
        }
        return result;
    } catch (error) {
        throw error;
    }
};

/** Delete a portfolio. */
export const deletePortfolio = async (id) => {
    try {
        const response = await api.delete(`/deletePortfolio/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
