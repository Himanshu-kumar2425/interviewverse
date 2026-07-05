import mongoose from "mongoose";

/**
 * Modes:
 *   "ai"   — solo AI-driven session
 *   "peer" — two-person video session
 *
 * Topics (used in AI mode):
 *   "dsa" | "hr" | "resume" | "fullstack"
 *
 * Status:
 *   "pending"    — created, not started
 *   "active"     — in progress
 *   "completed"  — ended, report generated
 *   "abandoned"  — user left before finishing
 */
const interviewSessionSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interviewer: {
      // null for AI mode; peer's userId for peer mode
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    mode: {
      type: String,
      enum: ["ai", "peer"],
      required: true,
    },
    topic: {
      type: String,
      enum: ["dsa", "hr", "resume", "fullstack", "general"],
      default: "general",
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "abandoned"],
      default: "pending",
    },
    // Peer mode — room coordination
    roomId: {
      type: String,
      default: null,
      index: true,
    },
    // Which resume was active during this session
    resumeSnapshot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const InterviewSession = mongoose.model(
  "InterviewSession",
  interviewSessionSchema
);
export default InterviewSession;
