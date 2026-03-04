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

/**
 * Maps backend validation errors to a flat object of field-level messages.
 * 
 * Supports various formats:
 *   - { errors: { field: "msg" } }
 *   - { errors: [ { path: "field", msg: "msg" }, ... ] }
 *   - { message: "field: msg" }
 *   - { error: "msg about field" }
 * 
 * @param {unknown} error - The caught Axios error object
 * @returns {Record<string, string>} Object mapping field names to error messages
 */
export const mapBackendErrors = (error) => {
    const data = error?.response?.data;
    const mappedErrors = {};

    if (!data) return mappedErrors;

    const rawErrors = data.errors || data.error || data.validationErrors || data.fields;

    // Helper to safely set error and handle common typos/aliases
    const addError = (field, msg) => {
        if (!field || !msg) return;
        // Clean field name from backticks if present: `title` -> title
        const cleanField = field.replace(/`/g, '').trim();
        const cleanMsg = typeof msg === 'string' ? msg : (msg.message || msg.msg || String(msg));

        mappedErrors[cleanField] = cleanMsg;
        // Handle common typos bidirectionally
        if (cleanField === 'catagory') mappedErrors['category'] = cleanMsg;
        if (cleanField === 'category') mappedErrors['catagory'] = cleanMsg;
        if (cleanField === 'image') mappedErrors['certificateImage'] = cleanMsg;
        if (cleanField === 'certificateImage') mappedErrors['image'] = cleanMsg;
        if (cleanField === 'imageCover') mappedErrors['image'] = cleanMsg;
        if (cleanField === 'testimony') mappedErrors['review'] = cleanMsg;
        if (cleanField === 'review') mappedErrors['testimony'] = cleanMsg;
        if (cleanField === 'specialty') mappedErrors['speciality'] = cleanMsg;
        if (cleanField === 'speciality') mappedErrors['specialty'] = cleanMsg;
    };

    // 1. Handle Object format: { field1: "msg", ... }
    if (rawErrors && typeof rawErrors === 'object' && !Array.isArray(rawErrors)) {
        Object.entries(rawErrors).forEach(([field, msg]) => addError(field, msg));
    }

    // 2. Handle Array format: [ { path: "field", msg: "msg" }, ... ]
    if (Array.isArray(rawErrors)) {
        rawErrors.forEach(err => {
            const field = err.path || err.param || err.field || err.name;
            const msg = err.msg || err.message || String(err);
            addError(field, msg);
        });
    }

    // 3. Handle String format or fallback to data.message
    const strError = (typeof rawErrors === 'string' ? rawErrors : '') || (typeof data.message === 'string' ? data.message : '');

    if (strError) {
        const lowerMsg = strError.toLowerCase();

        // Use global regex to find all "Path `fieldname`" occurrences in the message
        // This is more reliable than splitting (splitting removes the delimiter)
        const pathMatches = [...strError.matchAll(/Path\s+`([^`]+)`[^.]*\./g)];

        if (pathMatches.length > 0) {
            // For each field mentioned, add the FULL raw backend message as the error
            pathMatches.forEach(match => {
                addError(match[1], strError);
            });
        } else if (lowerMsg.includes('invalid input data') || lowerMsg.includes('validation failed')) {
            // Fallback: keyword-based field detection using the full raw message
            if (lowerMsg.includes('title')) addError('title', strError);
            if (lowerMsg.includes('question')) addError('question', strError);
            if (lowerMsg.includes('answer')) addError('answer', strError);
            if (lowerMsg.includes('categor')) addError('category', strError);
            if (lowerMsg.includes('name')) addError('name', strError);
            if (lowerMsg.includes('author')) addError('author', strError);
            if (lowerMsg.includes('imagecover')) addError('imageCover', strError);
            if (lowerMsg.includes('happenedon')) addError('happenedOn', strError);
            if (lowerMsg.includes('testimony')) addError('testimony', strError);
            if (lowerMsg.includes('review')) addError('review', strError);
            if (lowerMsg.includes('specialty') || lowerMsg.includes('speciality')) addError('specialty', strError);
        } else {
            // General string matching fallback
            if (lowerMsg.includes('question')) addError('question', strError);
            if (lowerMsg.includes('answer')) addError('answer', strError);
            if (lowerMsg.includes('categor')) addError('category', strError);
            if (lowerMsg.includes('title')) addError('title', strError);
            if (lowerMsg.includes('name')) addError('name', strError);
            if (lowerMsg.includes('author')) addError('author', strError);
            if (lowerMsg.includes('happenedon')) addError('happenedOn', strError);
            if (lowerMsg.includes('testimony')) addError('testimony', strError);
            if (lowerMsg.includes('review')) addError('review', strError);
            if (lowerMsg.includes('specialty') || lowerMsg.includes('speciality')) addError('speciality', strError);
        }
    }

    return mappedErrors;
};
