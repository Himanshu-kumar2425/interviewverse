import api from "./axios.js";

export const startSession = (data) => api.post("/interviews/start", data);
export const submitAnswer = (sessionId, data) =>
  api.post(`/interviews/${sessionId}/answer`, data);
export const endSession = (sessionId) =>
  api.post(`/interviews/${sessionId}/end`);
export const getMySessions = () => api.get("/interviews");
export const getSession = (sessionId) => api.get(`/interviews/${sessionId}`);
