import mongoose from "mongoose";

/**
 * Matches the strict JSON schema that the Gemini Evaluator prompt produces.
 * Also holds optional human-interviewer feedback for peer sessions.
 */
const perQuestionFeedbackSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    candidateAnswer: { type: String, required: true },
    score: { type: Number, min: 0, max: 10, required: true },
    feedback: { type: String, required: true },
    sampleAnswer: { type: String, default: "" },
  },
  { _id: false }
);

const humanFeedbackSchema = new mongoose.Schema(
  {
    rating: { type: Number, min: 1, max: 5 },
    notes: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: true,
      unique: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // --- Gemini Evaluator output ---
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    perQuestionFeedback: {
      type: [perQuestionFeedbackSchema],
      default: [],
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    suggestedImprovements: {
      type: [String],
      default: [],
    },
    // --- Optional human interviewer feedback (peer mode) ---
    humanFeedback: {
      type: humanFeedbackSchema,
      default: null,
    },
    // Raw Gemini JSON stored for debugging / re-processing
    rawGeminiOutput: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
export default Report;
