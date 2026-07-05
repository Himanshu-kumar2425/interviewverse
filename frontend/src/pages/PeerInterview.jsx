import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Peer from "peerjs";
import socket from "../lib/socket.js";
import { useAuth } from "../context/AuthContext.jsx";
import { createPeerSession, endPeerSession } from "../api/peer.api.js";
import PageLayout from "../components/common/PageLayout.jsx";
import Spinner from "../components/common/Spinner.jsx";
import { toast } from "../components/common/Toast.jsx";
import ToastContainer from "../components/common/Toast.jsx";
import LiveCaptions from "../components/peer/LiveCaptions.jsx";

const STAGES = { SETUP: "setup", WAITING: "waiting", CALL: "call", ENDED: "ended" };

export default function PeerInterview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stage, setStage] = useState(STAGES.SETUP);
  const [topic, setTopic] = useState("general");
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState([]);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const { data } = await createPeerSession({ topic });
      setSessionData(data);
      setStage(STAGES.WAITING);
      socket.connect();
      socket.emit("join-room", {
        roomId: data.roomId,
        userId: user._id,
        role: "candidate",
      });
    } catch {
      toast.error("Failed to create session.");
    } finally {
      setLoading(false);
    }
  };

  // ── Re-attach local stream once the video element mounts (after stage → CALL) ──
  useEffect(() => {
    if (stage === STAGES.CALL && localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [stage]);

  useEffect(() => {
    if (stage !== STAGES.WAITING) return;

    socket.on("user-joined", ({ userId }) => {
      toast.info("Interviewer joined! Starting video call…");
      initCallAsCandidate(userId);
    });

    return () => socket.off("user-joined");
  }, [stage, sessionData]);

  useEffect(() => {
    socket.on("transcript-update", ({ role, text }) => {
      setCaptions((prev) => [...prev, { role, text }]);
    });
    return () => socket.off("transcript-update");
  }, []);

  useEffect(() => {
    socket.on("user-left", () => {
      toast.info("The other participant left the call.");
    });
    return () => socket.off("user-left");
  }, []);

  const initCallAsCandidate = async (interviewerUserId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const peer = new Peer(user._id, {
        host: "0.peerjs.com",
        port: 443,
        secure: true,
      });

      peerRef.current = peer;

      peer.on("open", () => {
        const call = peer.call(interviewerUserId, stream);
        call.on("stream", (remoteStream) => {
          if (remoteVideoRef.current)
            remoteVideoRef.current.srcObject = remoteStream;
        });
      });

      peer.on("call", (call) => {
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          if (remoteVideoRef.current)
            remoteVideoRef.current.srcObject = remoteStream;
        });
      });

      setStage(STAGES.CALL);
    } catch (err) {
      toast.error("Could not access camera/microphone: " + err.message);
    }
  };

  const handleEnd = async () => {
    if (!window.confirm("End this peer interview?")) return;

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();
    socket.emit("leave-room", {
      roomId: sessionData?.roomId,
      userId: user._id,
    });
    socket.disconnect();

    try {
      await endPeerSession(sessionData.session._id);
      setStage(STAGES.ENDED);
    } catch {
      toast.error("Failed to end session on server.");
      setStage(STAGES.ENDED);
    }
  };

  const handleViewReport = () =>
    navigate(`/reports/${sessionData?.session?._id}`);

  return (
    <PageLayout>
      <ToastContainer />

      {stage === STAGES.SETUP && (
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Peer Interview</h1>
          <p className="text-gray-400 mb-8">
            Create a session and share the link with your interviewer.
          </p>
          <div className="card space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Topic
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input-field"
              >
                <option value="general">General</option>
                <option value="dsa">DSA</option>
                <option value="hr">HR / Behavioural</option>
                <option value="fullstack">Full Stack</option>
                <option value="resume">Resume</option>
              </select>
            </div>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {loading ? <Spinner size="sm" /> : "🎥"}
              {loading ? "Creating…" : "Create Session"}
            </button>
          </div>
        </div>
      )}

      {stage === STAGES.WAITING && sessionData && (
        <div className="max-w-lg mx-auto">
          <div className="card text-center space-y-5">
            <div className="flex items-center justify-center">
              <Spinner size="lg" />
            </div>
            <h2 className="text-xl font-bold text-white">Waiting for interviewer…</h2>
            <p className="text-gray-400 text-sm">
              Share this link with your interviewer:
            </p>
            <div className="flex items-center gap-2 bg-surface-700 rounded-lg px-4 py-3">
              <code className="text-brand-300 text-sm flex-1 break-all">
                {sessionData.joinLink}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sessionData.joinLink);
                  toast.success("Link copied!");
                }}
                className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                aria-label="Copy link"
              >
                📋
              </button>
            </div>
            <p className="text-xs text-gray-600">
              Room ID: <span className="text-gray-400 font-mono">{sessionData.roomId}</span>
            </p>
          </div>
        </div>
      )}

      {stage === STAGES.CALL && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VideoTile label="You (Candidate)" videoRef={localVideoRef} muted />
            <VideoTile label="Interviewer" videoRef={remoteVideoRef} />
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleEnd}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
            >
              ⏹ End Interview
            </button>
          </div>

          <LiveCaptions
            captions={captions}
            sessionId={sessionData?.session?._id}
          />
        </div>
      )}

      {stage === STAGES.ENDED && (
        <div className="max-w-lg mx-auto text-center">
          <div className="card py-12">
            <span className="text-6xl">✅</span>
            <h2 className="text-2xl font-bold text-white mt-4 mb-2">
              Session ended
            </h2>
            <p className="text-gray-400 mb-8">
              Your AI evaluation report is being generated from the transcript.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={handleViewReport} className="btn-primary px-8">
                📊 View Report
              </button>
              <button
                onClick={() => setStage(STAGES.SETUP)}
                className="btn-secondary px-8"
              >
                New Session
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

function VideoTile({ label, videoRef, muted = false }) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-surface-800 aspect-video">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover"
      />
      <span className="absolute bottom-3 left-3 text-xs text-white bg-black/50 px-2 py-1 rounded-md">
        {label}
      </span>
    </div>
  );
}