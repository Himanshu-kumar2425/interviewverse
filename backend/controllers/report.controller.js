import { body } from "express-validator";
import Report from "../models/Report.model.js";
import InterviewSession from "../models/InterviewSession.model.js";
import User from "../models/User.model.js";
import { evaluateTranscript } from "../utils/geminiHelpers.js";
import { asyncHandler } from "../middleware/error.middleware.js";

/**
 * Called internally after a session ends.
 * Not an Express handler — exported for use by interview controller.
 */
export const finalizeReport = async (sessionId, fullTranscript, topic, userId) => {
  const { parsed, raw } = await evaluateTranscript(fullTranscript, topic);

  const report = await Report.create({
    session: sessionId,
    candidate: userId,
    overallScore: parsed.overallScore,
    perQuestionFeedback: parsed.perQuestionFeedback,
    strengths: parsed.strengths,
    weaknesses: parsed.weaknesses,
    suggestedImprovements: parsed.suggestedImprovements,
    rawGeminiOutput: raw,
  });

  // Update user aggregate stats
  const allReports = await Report.find({ candidate: userId });
  const totalInterviews = allReports.length;
  const averageScore =
    allReports.reduce((sum, r) => sum + r.overallScore, 0) / totalInterviews;

  await User.findByIdAndUpdate(userId, {
    "stats.totalInterviews": totalInterviews,
    "stats.averageScore": Math.round(averageScore),
  });

  return report;
};

// ── Express handlers ──────────────────────────────────────────────────────────

/**
 * GET /api/reports
 * All reports for the logged-in user.
 */
export const getMyReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ candidate: req.user._id })
    .sort({ createdAt: -1 })
    .populate("session", "topic mode createdAt durationSeconds");

  res.json({ reports });
});

/**
 * GET /api/reports/:sessionId
 * Report for a specific session.
 */
export const getReportBySession = asyncHandler(async (req, res) => {
  const report = await Report.findOne({
    session: req.params.sessionId,
    candidate: req.user._id,
  }).populate("session", "topic mode createdAt durationSeconds startedAt endedAt");

  if (!report) {
    return res.status(404).json({ message: "Report not found or not ready yet" });
  }

  res.json({ report });
});

/**
 * POST /api/reports/:sessionId/human-feedback
 * Interviewer submits their rating + notes after a peer session.
 */
export const submitHumanFeedback = asyncHandler(async (req, res) => {
  const { rating, notes } = req.body;

  // Verify requester is the interviewer for this session
  const session = await InterviewSession.findOne({
    _id: req.params.sessionId,
    interviewer: req.user._id,
  });

  if (!session) {
    return res.status(403).json({ message: "Only the session interviewer can submit feedback" });
  }

  const report = await Report.findOneAndUpdate(
    { session: req.params.sessionId },
    {
      humanFeedback: {
        rating,
        notes: notes || "",
        submittedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  res.json({ report });
});

export const humanFeedbackValidators = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("notes").optional().isString(),
];
