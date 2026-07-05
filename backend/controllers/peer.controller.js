import { nanoid } from "nanoid";
import InterviewSession from "../models/InterviewSession.model.js";
import Transcript from "../models/Transcript.model.js";
import { asyncHandler } from "../middleware/error.middleware.js";
import { finalizeReport } from "./report.controller.js";

/**
 * POST /api/peer/create
 * Candidate creates a peer session and gets back a room ID + shareable link.
 */
export const createPeerSession = asyncHandler(async (req, res) => {
  const { topic = "general" } = req.body;

  const roomId = nanoid(10); // e.g. "V1StGXR8_Z"

  const session = await InterviewSession.create({
    candidate: req.user._id,
    mode: "peer",
    topic,
    status: "pending",
    roomId,
  });

  const joinLink = `${process.env.CLIENT_URL}/peer/join/${roomId}`;

  res.status(201).json({ session, roomId, joinLink });
});

/**
 * POST /api/peer/join/:roomId
 * Interviewer joins an existing peer session.
 */
export const joinPeerSession = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const session = await InterviewSession.findOne({ roomId, status: "pending" });
  if (!session) {
    return res.status(404).json({ message: "Room not found or already started" });
  }

  if (session.candidate.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: "You cannot join your own session as interviewer" });
  }

  await InterviewSession.findByIdAndUpdate(session._id, {
    interviewer: req.user._id,
    status: "active",
    startedAt: new Date(),
  });

  await Transcript.create({
    session: session._id,
    candidate: session.candidate,
  });

  const updatedSession = await InterviewSession.findById(session._id)
    .populate("candidate", "name email avatar")
    .populate("interviewer", "name email avatar");

  res.json({ session: updatedSession, roomId });
});

/**
 * POST /api/peer/:sessionId/end
 * Either participant can end the call; triggers AI evaluation of transcript.
 */
export const endPeerSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await InterviewSession.findOne({
    _id: sessionId,
    status: "active",
    $or: [{ candidate: req.user._id }, { interviewer: req.user._id }],
  });

  if (!session) {
    return res.status(404).json({ message: "Active peer session not found" });
  }

  const endedAt = new Date();
  await InterviewSession.findByIdAndUpdate(sessionId, {
    status: "completed",
    endedAt,
    durationSeconds: Math.round((endedAt - session.startedAt) / 1000),
  });

  const transcript = await Transcript.findOne({ session: sessionId });

  let fullText = "";
  if (transcript && transcript.turns.length > 0) {
    fullText = transcript.turns
      .map(
        (t) =>
          `${t.role === "interviewer" ? "Interviewer" : "Candidate"}: ${t.text}`
      )
      .join("\n\n");

    await Transcript.findByIdAndUpdate(transcript._id, { fullText });
  }

  res.json({ message: "Peer session ended. Report being generated.", sessionId });

  if (fullText) {
    finalizeReport(
      sessionId,
      fullText,
      session.topic,
      session.candidate.toString()
    ).catch((err) => console.error("Peer report generation failed:", err.message));
  }
});

/**
 * GET /api/peer/:roomId
 * Fetch session info by room ID (used by frontend on join page).
 */
export const getSessionByRoom = asyncHandler(async (req, res) => {
  const session = await InterviewSession.findOne({ roomId: req.params.roomId })
    .populate("candidate", "name email avatar")
    .populate("interviewer", "name email avatar");

  if (!session) {
    return res.status(404).json({ message: "Room not found" });
  }

  res.json({ session });
});
