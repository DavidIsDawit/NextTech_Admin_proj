import api from "./api";

/**
 * Fetch website traffic/visitor data
 * @returns {Promise<Object>} The API response containing visitor chart data
 */
export const getVisitData = async () => {
    try {
        const response = await api.get("/visit");
        return response.data;
    } catch (error) {
        console.error("Error fetching visit data:", error);
        throw error;
    }
};
