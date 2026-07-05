import { body } from "express-validator";
import InterviewSession from "../models/InterviewSession.model.js";
import Question from "../models/Question.model.js";
import Answer from "../models/Answer.model.js";
import Transcript from "../models/Transcript.model.js";
import Resume from "../models/Resume.model.js";
import { getNextQuestion, evaluateTranscript } from "../utils/geminiHelpers.js";
import { asyncHandler } from "../middleware/error.middleware.js";
import { finalizeReport } from "./report.controller.js";

export const startSessionValidators = [
  body("topic")
    .isIn(["dsa", "hr", "resume", "fullstack", "general"])
    .withMessage("Invalid topic"),
  body("mode").isIn(["ai", "peer"]).withMessage("Invalid mode"),
];

// ── Session lifecycle ─────────────────────────────────────────────────────────

/**
 * POST /api/interviews/start
 * Creates a session and returns the first AI question.
 */
export const startSession = asyncHandler(async (req, res) => {
  const { topic, mode = "ai" } = req.body;

  const activeResume = await Resume.findOne({
    user: req.user._id,
    isActive: true,
    isParsed: true,
  });

  const session = await InterviewSession.create({
    candidate: req.user._id,
    mode,
    topic,
    status: "active",
    startedAt: new Date(),
    resumeSnapshot: activeResume?._id || null,
  });

  // Create empty transcript
  await Transcript.create({ session: session._id, candidate: req.user._id });

  // Get first question from Gemini (AI mode only)
  let firstQuestion = null;
  if (mode === "ai") {
    const questionText = await getNextQuestion({
      topic,
      resumeData: activeResume?.parsedData || null,
      history: [],
    });

    const q = await Question.create({
      session: session._id,
      sequence: 1,
      text: questionText,
      source: "ai",
      type: "opening",
      topic,
    });

    // Append interviewer turn to transcript
    await Transcript.findOneAndUpdate(
      { session: session._id },
      {
        $push: {
          turns: { role: "interviewer", text: questionText },
        },
      }
    );

    firstQuestion = { _id: q._id, text: q.text, sequence: q.sequence };
  }

  res.status(201).json({ session, firstQuestion });
});

/**
 * POST /api/interviews/:sessionId/answer
 * Saves the candidate's answer, generates and returns the next question.
 */
export const submitAnswer = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { questionId, answerText, inputMode = "text", durationSeconds = 0 } = req.body;

  const session = await InterviewSession.findOne({
    _id: sessionId,
    candidate: req.user._id,
    status: "active",
  });
  if (!session) {
    return res.status(404).json({ message: "Active session not found" });
  }

  const question = await Question.findOne({ _id: questionId, session: sessionId });
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  // Save the answer
  await Answer.create({
    session: sessionId,
    question: questionId,
    candidate: req.user._id,
    text: answerText,
    inputMode,
    durationSeconds,
  });

  // Add candidate turn to transcript
  await Transcript.findOneAndUpdate(
    { session: sessionId },
    { $push: { turns: { role: "candidate", text: answerText } } }
  );

  // Build conversation history for Gemini
  const transcript = await Transcript.findOne({ session: sessionId });
  const history = transcript.turns.map((t) => ({
    role: t.role === "interviewer" ? "model" : "user",
    parts: [{ text: t.text }],
  }));

  // Check if session should wrap up (Gemini signals end via closing phrase)
  const questionCount = await Question.countDocuments({ session: sessionId });
  const shouldEnd =
    answerText.toLowerCase().includes("thank you, that concludes") ||
    questionCount >= 10;

  if (shouldEnd) {
    return res.json({ nextQuestion: null, sessionEnded: true });
  }

  // Get next question
  const activeResume = session.resumeSnapshot
    ? await Resume.findById(session.resumeSnapshot)
    : null;

  const nextQuestionText = await getNextQuestion({
    topic: session.topic,
    resumeData: activeResume?.parsedData || null,
    history,
  });

  // Detect end signal from Gemini
  const isClosing = nextQuestionText
    .toLowerCase()
    .includes("that concludes our interview");

  const nextQ = await Question.create({
    session: sessionId,
    sequence: questionCount + 1,
    text: nextQuestionText,
    source: "ai",
    type: isClosing ? "closing" : "followup",
    topic: session.topic,
  });

  await Transcript.findOneAndUpdate(
    { session: sessionId },
    { $push: { turns: { role: "interviewer", text: nextQuestionText } } }
  );

  res.json({
    nextQuestion: { _id: nextQ._id, text: nextQ.text, sequence: nextQ.sequence },
    sessionEnded: isClosing,
  });
});

/**
 * POST /api/interviews/:sessionId/end
 * Ends the session and triggers Gemini evaluation.
 */
export const endSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await InterviewSession.findOne({
    _id: sessionId,
    candidate: req.user._id,
    status: "active",
  });
  if (!session) {
    return res.status(404).json({ message: "Active session not found" });
  }

  const endedAt = new Date();
  const durationSeconds = Math.round(
    (endedAt - session.startedAt) / 1000
  );

  await InterviewSession.findByIdAndUpdate(sessionId, {
    status: "completed",
    endedAt,
    durationSeconds,
  });

  // Build fullText for transcript
  const transcript = await Transcript.findOne({ session: sessionId });
  const fullText = transcript.turns
    .map(
      (t) =>
        `${t.role === "interviewer" ? "Interviewer" : "Candidate"}: ${t.text}`
    )
    .join("\n\n");

  await Transcript.findByIdAndUpdate(transcript._id, { fullText });

  // Generate report async — respond immediately
  res.json({ message: "Session ended. Report is being generated.", sessionId });

  // Fire and forget
  finalizeReport(sessionId, fullText, session.topic, req.user._id).catch(
    (err) => console.error("Report generation failed:", err.message)
  );
});

/**
 * GET /api/interviews
 * All sessions for the logged-in user.
 */
export const getMySessions = asyncHandler(async (req, res) => {
  const sessions = await InterviewSession.find({ candidate: req.user._id })
    .sort({ createdAt: -1 })
    .populate("resumeSnapshot", "originalName");

  res.json({ sessions });
});

/**
 * GET /api/interviews/:sessionId
 */
export const getSession = asyncHandler(async (req, res) => {
  const session = await InterviewSession.findOne({
    _id: req.params.sessionId,
    candidate: req.user._id,
  }).populate("resumeSnapshot", "originalName");

  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  const questions = await Question.find({ session: session._id }).sort("sequence");
  const answers = await Answer.find({ session: session._id });

  res.json({ session, questions, answers });
});
