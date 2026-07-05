import mongoose from "mongoose";

/**
 * One Transcript document per session.
 * Stores the full ordered conversation for Gemini evaluation.
 *
 * Role:
 *   "interviewer" — AI or human interviewer
 *   "candidate"   — the person being interviewed
 */
const turnSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["interviewer", "candidate"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const transcriptSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: true,
      unique: true, // one transcript per session
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    turns: {
      type: [turnSchema],
      default: [],
    },
    // Raw text assembled for Gemini prompt (built on session end)
    fullText: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Transcript = mongoose.model("Transcript", transcriptSchema);
export default Transcript;
