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
        // Clean field name from backticks/quotes
        const rawField = field.replace(/[`"]/g, '').trim();
        // Strip common index suffixes like _1, _text, etc.
        const cleanField = rawField.replace(/(_1|_index|_unique|_text)$/i, '');

        const cleanMsg = typeof msg === 'string' ? msg : (msg.message || msg.msg || String(msg));

        // Write the error under the original casing (as backend sent it)
        mappedErrors[cleanField] = cleanMsg;

        // Targeted redirects: handle known backend field name → frontend field name mismatches.
        // These are ONE-WAY mappings, not a fan-out, to avoid showing errors on unrelated fields.
        const cleanFieldLower = cleanField.toLowerCase();

        // Backend "certificateName" → CertificateForm uses "title"
        if (cleanFieldLower === 'certificatename') {
            mappedErrors['title'] = cleanMsg;
            mappedErrors['certificateName'] = cleanMsg;
        }
        // Backend "projectName" → PortfolioForm uses "title"
        if (cleanFieldLower === 'projectname') {
            mappedErrors['title'] = cleanMsg;
            mappedErrors['projectName'] = cleanMsg;
        }
        // Backend "partnerName" → PartnerForm uses "partnerName" (exact)
        if (cleanFieldLower === 'partnername') {
            mappedErrors['partnerName'] = cleanMsg;
        }
        // Frontend forms using "name" as the unique field (Team, Testimonial, Counter)
        if (cleanFieldLower === 'name') {
            mappedErrors['name'] = cleanMsg;
        }
        // Forms using "title" (Services, News, Portfolio)
        if (cleanFieldLower === 'title') {
            mappedErrors['title'] = cleanMsg;
        }
        // FAQ uses "question"
        if (cleanFieldLower === 'question') {
            mappedErrors['question'] = cleanMsg;
        }

        // Group 2: Categorization (typo-safe)
        if (cleanFieldLower === 'catagory' || cleanFieldLower === 'category') {
            mappedErrors['catagory'] = cleanMsg;
            mappedErrors['category'] = cleanMsg;
        }

        // Group 3: Images & Media — use original casing variants
        const imageFieldsLower = ['image', 'imagecover', 'thumbnail', 'thumbinal', 'certificateimage', 'certificate', 'coverimage', 'images'];
        const imageFieldsOrig = ['image', 'imageCover', 'thumbnail', 'thumbinal', 'certificateImage', 'certificate', 'coverImage', 'images'];
        const imgIdx = imageFieldsLower.indexOf(cleanFieldLower);
        if (imgIdx !== -1) {
            imageFieldsOrig.forEach(f => {
                mappedErrors[f] = cleanMsg;
            });
        }

        // Group 4: Descriptions
        const descFieldsLower = ['description', 'descriptionone', 'subdescriptionone', 'testimony', 'review', 'certificatetype', 'answer'];
        const descFieldsOrig = ['description', 'descriptionOne', 'subdescriptionOne', 'testimony', 'review', 'certificateType', 'answer'];
        const descIdx = descFieldsLower.indexOf(cleanFieldLower);
        if (descIdx !== -1) {
            descFieldsOrig.forEach(f => {
                mappedErrors[f] = cleanMsg;
            });
        }

        // Group 5: Dates
        if (['happendon', 'happingdate', 'date'].includes(cleanFieldLower)) {
            mappedErrors['happenedOn'] = cleanMsg;
            mappedErrors['happingDate'] = cleanMsg;
            mappedErrors['date'] = cleanMsg;
        }
        if (['certificatefrom', 'issuedby'].includes(cleanFieldLower)) {
            mappedErrors['certificateFrom'] = cleanMsg;
            mappedErrors['issuedBy'] = cleanMsg;
        }
        if (['issuedate'].includes(cleanFieldLower)) {
            mappedErrors['IssueDate'] = cleanMsg;
            mappedErrors['issueDate'] = cleanMsg;
        }
        if (['specialty', 'speciality', 'specality'].includes(cleanFieldLower)) {
            mappedErrors['specialty'] = cleanMsg;
            mappedErrors['speciality'] = cleanMsg;
            mappedErrors['specality'] = cleanMsg;
        }
    };

    // 1. Handle Object format: { field1: "msg", ... }
    if (rawErrors && typeof rawErrors === 'object' && !Array.isArray(rawErrors)) {
        Object.entries(rawErrors).forEach(([field, msg]) => addError(field, msg));
    }

    // 2. Handle Array format
    if (Array.isArray(rawErrors)) {
        rawErrors.forEach(err => {
            if (typeof err === 'string') {
                // Backend sends fields as array of strings like ['title']
                // Use the main message as the error message for that field
                addError(err, data.message || `${err} already exists.`);
            } else {
                const field = err.path || err.param || err.field || err.name;
                const msg = err.msg || err.message || String(err);
                addError(field, msg);
            }
        });
    }

    // 3. Handle String format or fallback to data.message
    const strError = (typeof rawErrors === 'string' ? rawErrors : '') || (typeof data.message === 'string' ? data.message : '');

    if (strError) {
        const lowerMsg = strError.toLowerCase();

        // 3a. Parse 'Duplicate fields: fieldName' format (sent by this backend)
        const dupFieldsMatch = strError.match(/duplicate fields?:\s*([^.]+)/i);
        if (dupFieldsMatch) {
            const fieldList = dupFieldsMatch[1].split(',').map(f => f.trim()).filter(Boolean);
            fieldList.forEach(field => {
                addError(field, `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please use a unique value.`);
            });
            if (Object.keys(mappedErrors).length > 0) return mappedErrors;
        }

        // 3b. Check for MongoDB Duplicate Key Error (E11000)
        if (strError.includes('E11000') || lowerMsg.includes('duplicate key')) {
            const dupKeyMatch = strError.match(/dup key:\s*{\s*"?([^:"]+)"?:/);
            if (dupKeyMatch) {
                let field = dupKeyMatch[1].trim();
                field = field.replace(/^[^.]+\./, ''); // e.g. remove "users."
                addError(field, `${field.charAt(0).toUpperCase() + field.slice(1)} already exists and must be unique.`);
                return mappedErrors;
            } else {
                // Fallback keywords
                if (lowerMsg.includes('email')) addError('email', 'This email already exists.');
                else if (lowerMsg.includes('name')) addError('name', 'This name already exists.');
                else if (lowerMsg.includes('title')) addError('title', 'This title already exists.');
                else if (lowerMsg.includes('question')) addError('question', 'This question already exists.');
                else {
                    addError('general', 'A record with this unique value already exists.');
                }
                return mappedErrors;
            }
        }

        // 3b. Try to parse Mongoose-style multi-field error strings
        // Example: "News validation failed: title: Path `title` is required., happenedOn: Path `happenedOn` is required."
        // We look for patterns like "fieldname: Path `fieldname` ..." or just "fieldname: message"
        const segments = strError.split(/,\s+(?=[a-zA-Z0-9_]+:)/); // Split by comma-space if followed by "field:"

        let foundSpecific = false;
        segments.forEach(segment => {
            // Clean the segment from "Validation failed: " prefix if it's the first one
            const cleanSegment = segment.replace(/.*validation failed:\s*/i, '').trim();

            // Match "field: message"
            const match = cleanSegment.match(/^([^:]+):\s*(.*)$/);
            if (match) {
                const field = match[1].trim();
                const msg = match[2].trim();
                addError(field, msg);
                foundSpecific = true;
            }
        });

        if (!foundSpecific) {
            // 3b. Fallback to existing keyword-based detection if splitting didn't yield results
            const pathMatches = [...strError.matchAll(/Path\s+`([^`]+)`[^.]*\./g)];

            if (pathMatches.length > 0) {
                pathMatches.forEach(match => {
                    addError(match[1], strError);
                });
            } else {
                // General keyword matching for single-string error messages
                const matchesAny = (words) => words.some(w => lowerMsg.includes(w));

                if (matchesAny(['title', 'project name'])) addError('title', strError);
                if (matchesAny(['question'])) addError('question', strError);
                if (matchesAny(['answer'])) addError('answer', strError);
                if (matchesAny(['categor'])) addError('category', strError);
                if (matchesAny(['name', 'author'])) {
                    addError('name', strError);
                    addError('title', strError);
                }
                if (lowerMsg.includes('thumbinal')) {
                    addError('thumbinal', strError);
                } else if (lowerMsg.includes('gallery') || lowerMsg.includes('images')) {
                    addError('images', strError);
                } else if (lowerMsg.includes('cover')) {
                    addError('imageCover', strError);
                } else if (lowerMsg.includes('certificate')) {
                    addError('certificate', strError);
                    addError('certificateImage', strError);
                    addError('image', strError);
                } else if (matchesAny(['image', 'photo'])) {
                    addError('image', strError);
                    addError('thumbinal', strError);
                    addError('imageCover', strError);
                    addError('certificate', strError);
                    addError('certificateImage', strError);
                }
                if (matchesAny(['date', 'happened'])) {
                    addError('issueDate', strError);
                    addError('happingDate', strError);
                }
                if (matchesAny(['testimony', 'review'])) {
                    addError('testimony', strError);
                    addError('review', strError);
                }
                if (matchesAny(['specialty', 'speciality', 'role', 'position'])) {
                    addError('specialty', strError);
                }
                if (matchesAny(['issued by', 'issuedby', 'issuer', 'organization', 'from'])) {
                    addError('issuedBy', strError);
                }
                if (matchesAny(['description', 'content', 'body', 'text'])) {
                    addError('description', strError);
                    addError('descriptionOne', strError);
                    addError('subdescriptionOne', strError);
                }
                if (matchesAny(['client', 'customer'])) addError('client', strError);
                if (matchesAny(['sector'])) addError('sector', strError);
                if (matchesAny(['result'])) addError('resultOne', strError);
                if (matchesAny(['requirement'])) addError('requirement', strError);
            }
        }
    }

    return mappedErrors;
};
