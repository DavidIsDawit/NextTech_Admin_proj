import api, { buildImageUrl } from "./api";

/** Normalize team member object by building absolute image URLs. */
export const normalizeTeam = (member) => {
    if (member?.image) {
        member.image = buildImageUrl(member.image);
    }
    return member;
};

/*==============================
   Team API
 =============================== */

/**
 * Get all team members with optional pagination and sorting.
 * @param {object} params { page, limit, sort }
 */
export const getAllTeams = async (params = {}) => {
    try {
        const response = await api.get("/getAllTeams", { params });
        const result = response.data;

        // Postman: { status: "success", totalTeams: 12, data: [...] }
        if (result.status === "success" && Array.isArray(result.data)) {
            result.data = result.data.map(normalizeTeam);
        }

        return result;
    } catch (error) {
        throw error;
    }
};

/**
 * Get a single team member by ID.
 */
export const getTeamMember = async (id) => {
    try {
        const response = await api.get(`/team/${id}`);
        const result = response.data;

        if (result.status === "success" && result.data?.team) {
            result.data.team = normalizeTeam(result.data.team);
        }

        return result;
    } catch (error) {
        throw error;
    }
};

/**
 * Create a new team member.
 */
export const createTeamMember = async (formData) => {
    try {
        const response = await api.post("/createTeamOne", formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Update an existing team member.
 */
export const updateTeamMember = async (id, formData) => {
    try {
        const response = await api.put(`/updateTeam/${id}`, formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete a team member.
 */
export const deleteTeamMember = async (id) => {
    try {
        const response = await api.delete(`/deleteTeam/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Search team members.
 */
// export const searchTeams = async (name) => {
//     try {
//         const response = await api.get("/team/search", { params: { name} });
//         const result = response.data;

//         if (result.status === "success" && Array.isArray(result.data)) {
//             result.data = result.teams.map(normalizeTeam);
//         } else if (result.status === "success" && result.data?.teams) {
//             result.data.teams = result.data.teams.map(normalizeTeam);
//         }

//         return result;
//     } catch (error) {
//         throw error;
//     }
// };
export const searchTeams = async (name, params = {}) => {
    const response = await api.get("/team/search", {
        params: { name, ...params }
    });

    const result = response.data;

    return {
        status: result.status,
        data: result.data.teams.map(normalizeTeam),
        total: result.results
    };
};
export const getSpecialties = async () => {
    const response = await api.get("/team/specialties");

    const result = response.data;

    return {
        status: result.status,
        data: result.specialties,
        total: result.totalSpecialties,
    };
};
export const getStatuses = async () => {
    const response = await api.get("/team/statuses");

    const result = response.data;
    
    return { status: result.status, 
        data: result.statuses, 
        total: result.totalStatuses, };
};



export const filterTeamsByStatus = async (status, params = {}) => {
    try {
        const { data } = await api.get("/team/filter-by-status", {
            params: { status: String(status).toLowerCase(), ...params },
        });

        const list = data.team || data.teams || data.teamMembers || data.data || [];
        return {
            status: data.status || "success",
            data: (Array.isArray(list) ? list : []).map(normalizeTeam),
            total: data.totalTeamMembers ?? data.total ?? list.length,
        };
    } catch (error) {
        try {
            const allRes = await getAllTeams(params);
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

export const filterTeamsBySpecialty = async (specialty, params = {}) => {
    try {
        const { data } = await api.get("/team/filter-by-specialty", {
            params: { specialty, ...params },
        });

        const list = data.team || data.teams || data.teamMembers || data.data || [];
        return {
            status: data.status || "success",
            data: (Array.isArray(list) ? list : []).map(normalizeTeam),
            total: data.totalTeamMembers ?? data.total ?? list.length,
        };
    } catch (error) {
        try {
            const allRes = await getAllTeams(params);
            if (allRes && (allRes.status === "success" || Array.isArray(allRes.data))) {
                const list = allRes.data || [];
                const filtered = list.filter((item) => {
                    const itemSpec = item.specality || item.specialty || "";
                    return itemSpec.toLowerCase() === String(specialty).toLowerCase();
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


