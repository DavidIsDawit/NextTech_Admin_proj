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

    if (result.status === "success") {
      const list = Array.isArray(result.data)
        ? result.data
        : result.data?.testimonials || result.data?.items || [];

      result.data = list.map(normalizeTestimonial);
      result.total = result.total ?? result.totalTestimonials ?? result.totalCount ?? result.totalItems ?? result.count ?? list.length;
    }

    return result;
  } catch (error) {
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
    throw error;
  }
};

/**
 * Search testimonials.
 */
// export const searchTestimonials = async (name) => {
//   try {
//     const response = await api.get("/testimonial/search", { params: { name } });
//     const result = response.data;

//     if (result.status === "success" && Array.isArray(result.data)) {
//       result.data = result.data.map(normalizeTestimonial);
//     } else if (result.status === "success" && result.data?.testimonials) {
//       result.data.testimonials = result.data.testimonials.map(normalizeTestimonial);
//     }

//     return result;
//   } catch (error) {
//     throw error;
//   }
// };
export const searchTestimonials = async (name) => {
  try {
    const response = await api.get("/testimonial/search", {
      params: { name },
    });

    const result = response.data;

    // Normalise into the same { status, data, total } shape the list component expects
    const list = Array.isArray(result.data?.testimonials)
      ? result.data.testimonials
      : Array.isArray(result.data)
        ? result.data
        : [];

    return {
      status: result.status || "success",
      data: list.map(normalizeTestimonial),
      total: result.total ?? result.totalTestimonials ?? list.length,
    };
  } catch (error) {
    throw error;
  }
};
export default {
  getAllTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  searchTestimonials
};

export const getSpecialties = async () => {
    const response = await api.get("/testimonials/specialties");

    const result = response.data;

    return {
        status: result.status,
        data: result.specialties,
        total: result.totalSpecialties,
    };
};


export const getStatuses = async () => {
    const response = await api.get("/testimonials/statuses");

    const result = response.data;
    
    return { status: result.status, 
        data: result.statuses, 
        total: result.totalStatuses, };
};



export const filterTestimonialsByStatus = async (status) => {
    const { data } = await api.get("/testimonials/filter-by-status", {
        params: { status },
    });

    const list = data.testimonials || data.testimonial || data.data || [];
    return {
        status: data.status,
        data: (Array.isArray(list) ? list : []).map(normalizeTestimonial),
        total: data.totalcount ?? data.totalCount ?? data.totalTestimonials ?? list.length,
    };
};

// export const filterTestimonialsBySpecialty = async (specialty) => {
//     const { data } = await api.get("/testimonials/filter-by-specialty", {
//         params: { specialty },
//     });

//     return {
//         status: data.status,
//         data: data.testimonial.map(normalizeTestimonial),
//         total: data.totalCount,
//     };
// };
export const filterTestimonialsBySpecialty = async (specialty) => {
    const { data } = await api.get("/testimonials/filter-by-specialty", {
        params: { specialty },
    });   

    const list = data.testimonials || data.testimonial || data.data || [];
    return {
        status: data.status,
        data: (Array.isArray(list) ? list : []).map(normalizeTestimonial),
        total: data.totalTestimonials ?? data.totalcount ?? data.totalCount ?? list.length,
    };
};