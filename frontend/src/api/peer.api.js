import api from "./axios.js";

export const createPeerSession = (data) => api.post("/peer/create", data);
export const joinPeerSession = (roomId) => api.post(`/peer/join/${roomId}`);
export const endPeerSession = (sessionId) =>
  api.post(`/peer/${sessionId}/end`);
export const getSessionByRoom = (roomId) => api.get(`/peer/${roomId}`);
