import Transcript from "../models/Transcript.model.js";

/**
 * Handles real-time transcript appending during a peer session.
 * The frontend's Web Speech API emits speech chunks as they are recognised;
 * we persist them to the DB so the evaluator has a complete transcript.
 */
export const registerTranscriptHandlers = (io, socket) => {
  /**
   * Event: "transcript-turn"
   * Payload: { sessionId, role: "candidate"|"interviewer", text }
   *
   * Emitted by the AI Observer on the candidate's browser as speech
   * is recognised, or by the interviewer's question input.
   */
  socket.on("transcript-turn", async ({ sessionId, role, text }) => {
    if (!sessionId || !role || !text?.trim()) return;

    try {
      await Transcript.findOneAndUpdate(
        { session: sessionId },
        {
          $push: {
            turns: { role, text: text.trim(), timestamp: new Date() },
          },
        }
      );

      // Broadcast to the room so both participants see live captions
      const { roomId } = socket.data;
      if (roomId) {
        socket.to(roomId).emit("transcript-update", { role, text, timestamp: Date.now() });
      }
    } catch (err) {
      console.error("[transcript] Failed to save turn:", err.message);
    }
  });
};
