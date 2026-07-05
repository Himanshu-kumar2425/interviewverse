import api from "./axios.js";

export const getMyReports = () => api.get("/reports");
export const getReportBySession = (sessionId) =>
  api.get(`/reports/${sessionId}`);
export const submitHumanFeedback = (sessionId, data) =>
  api.post(`/reports/${sessionId}/human-feedback`, data);
