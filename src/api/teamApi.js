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
        console.error("Error fetching teams:", error);
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
        console.error(`Error fetching team member ${id}:`, error);
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
        console.error("Error creating team member:", error);
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
        console.error(`Error updating team member ${id}:`, error);
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
        console.error(`Error deleting team member ${id}:`, error);
        throw error;
    }
};
