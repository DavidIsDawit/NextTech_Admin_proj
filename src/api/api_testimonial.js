import api  from "./api";
/*==============================
   Testimonial Api
 =============================== */
 export const getAllTestimonials = async (params) => {
    try {
      const res = await api.get("/getAllTestimonials", {
                params: {  },
                });
                return res.data;
            } catch (error) {
        throw error;
      } 
 } ;
 export default getAllTestimonials