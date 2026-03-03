/**
 * Extracts the most user-friendly error message from a backend Axios error.
 *
 * Handles common backend error shapes:
 *   1. { message: "..." }
 *   2. { errors: [ { message: "..." }, ... ] }   (e.g. mongoose validation)
 *   3. Plain JS / network errors
 *
 * @param {unknown} error - The caught error object
 * @param {string} fallback - Fallback message if nothing can be extracted
 * @returns {string}
 */
export const extractErrorMessage = (error, fallback = "An error occurred") => {
    const data = error?.response?.data;

    if (!data) {
        // Network error, timeout, etc.
        return error?.message || fallback;
    }

    // Single message field (most common)
    if (data.message) return data.message;

    // Mongoose / express-validator array of validation errors
    if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors
            .map((e) => e.message || e.msg || String(e))
            .filter(Boolean)
            .join(", ");
    }

    return fallback;
};
