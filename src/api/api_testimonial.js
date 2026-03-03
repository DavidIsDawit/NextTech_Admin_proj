import api, { buildImageUrl } from "./api";

/** Normalise image path on a single testimonial object (mutates in-place). */
export const normalizeTestimonial = (testimonial) => {
  if (testimonial?.image) {
    testimonial.image = buildImageUrl(testimonial.image);
  }
  return testimonial;
};

/*==============================
   Testimonial Api
 =============================== */

/**
 * Get all testimonials with optional pagination.
 */
export const getAllTestimonials = async (params = {}) => {
  try {
    const response = await api.get("/getAllTestimonials", { params });
    const result = response.data;

    if (result.status === "success" && Array.isArray(result.data)) {
      result.data = result.data.map(normalizeTestimonial);
    }

    return result;
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    throw error;
  }
};

/**
 * Get a single testimonial by ID.
 */
export const getTestimonial = async (id) => {
  try {
    const response = await api.get(`/getTestimonial/${id}`);
    const result = response.data;

    if (result.status === "success" && result.data?.testimonial) {
      result.data.testimonial = normalizeTestimonial(result.data.testimonial);
    }

    return result;
  } catch (error) {
    console.error(`Error fetching testimonial ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new testimonial.
 */
export const createTestimonial = async (formData) => {
  try {
    const response = await api.post("/createTestimonial", formData);
    return response.data;
  } catch (error) {
    console.error("Error creating testimonial:", error);
    throw error;
  }
};

/**
 * Update an existing testimonial.
 */
export const updateTestimonial = async (id, formData) => {
  try {
    const response = await api.put(`/updateTestimonial/${id}`, formData);
    const result = response.data;

    if (result.status === "success" && result.data?.testimonial) {
      result.data.testimonial = normalizeTestimonial(result.data.testimonial);
    }

    return result;
  } catch (error) {
    console.error(`Error updating testimonial ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a testimonial.
 */
export const deleteTestimonial = async (id) => {
  try {
    const response = await api.delete(`/deleteTestimonial/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting testimonial ${id}:`, error);
    throw error;
  }
};

export default {
  getAllTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
};