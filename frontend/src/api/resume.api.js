import api from "./axios.js";

export const uploadResume = (formData) =>
  api.post("/resumes/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getActiveResume = () => api.get("/resumes/active");
export const getAllResumes = () => api.get("/resumes");
export const deleteResume = (id) => api.delete(`/resumes/${id}`);
