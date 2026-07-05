import { registerPeerHandlers } from "./peer.socket.js";
import { registerTranscriptHandlers } from "./transcript.socket.js";

/**
 * Entry point for all Socket.IO namespaces and event handlers.
 * Called once from server.js with the io instance.
 */
export const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    registerPeerHandlers(io, socket);
    registerTranscriptHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
