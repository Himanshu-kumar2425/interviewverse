/**
 * Handles WebRTC signaling events for peer interview rooms.
 *
 * Flow:
 *   1. Candidate creates a session → gets roomId
 *   2. Both users call socket.emit("join-room", { roomId, userId, role })
 *   3. When interviewer joins, candidate is notified and PeerJS connection begins
 *   4. ICE candidates / offers / answers are relayed through here as a fallback
 *      (PeerJS handles most of this, but we keep the room membership here)
 */
export const registerPeerHandlers = (io, socket) => {
  // ── Join a peer room ──────────────────────────────────────────────────────
  socket.on("join-room", ({ roomId, userId, role }) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.userId = userId;
    socket.data.role = role; // "candidate" | "interviewer"

    // Notify everyone else in the room that a new participant joined
    socket.to(roomId).emit("user-joined", { userId, role, socketId: socket.id });

    console.log(`[peer] ${role} ${userId} joined room ${roomId}`);
  });

  // ── Leave / hang up ───────────────────────────────────────────────────────
  socket.on("leave-room", ({ roomId, userId }) => {
    socket.to(roomId).emit("user-left", { userId, socketId: socket.id });
    socket.leave(roomId);
    console.log(`[peer] ${userId} left room ${roomId}`);
  });

  // ── WebRTC signaling relay (fallback for PeerJS) ──────────────────────────
  socket.on("signal", ({ to, signal }) => {
    io.to(to).emit("signal", { from: socket.id, signal });
  });

  // ── Interviewer typed a question (optional real-time feature) ─────────────
  socket.on("interviewer-question", ({ roomId, text }) => {
    socket.to(roomId).emit("new-question", { text, timestamp: Date.now() });
  });

  // Auto-leave on disconnect
  socket.on("disconnect", () => {
    const { roomId, userId } = socket.data;
    if (roomId && userId) {
      socket.to(roomId).emit("user-left", { userId, socketId: socket.id });
    }
  });
};
