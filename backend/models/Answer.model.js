import mongoose from "mongoose";

/**
 * InputMode:
 *   "text"  — typed in text area
 *   "voice" — Web Speech API → text transcript
 */
const answerSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: true,
      index: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    inputMode: {
      type: String,
      enum: ["text", "voice"],
      default: "text",
    },
    durationSeconds: {
      type: Number,
      default: 0, // how long the candidate took to answer
    },
  },
  { timestamps: true }
);

const Answer = mongoose.model("Answer", answerSchema);
export default Answer;
