import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Peer from "peerjs";
import socket from "../lib/socket.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getSessionByRoom, joinPeerSession, endPeerSession } from "../api/peer.api.js";
import Spinner from "../components/common/Spinner.jsx";
import Navbar from "../components/common/Navbar.jsx";
import { toast } from "../components/common/Toast.jsx";
import ToastContainer from "../components/common/Toast.jsx";

const STAGES = { LOADING: "loading", PREVIEW: "preview", CALL: "call", ENDED: "ended" };

export default function PeerJoin() {
  const { roomId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stage, setStage] = useState(STAGES.LOADING);
  const [roomSession, setRoomSession] = useState(null);
  const [joining, setJoining] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/login?redirect=/peer/join/${roomId}`);
    }
  }, [user, authLoading, roomId, navigate]);

  useEffect(() => {
    if (!user) return;
    getSessionByRoom(roomId)
      .then(({ data }) => {
        setRoomSession(data.session);
        setStage(STAGES.PREVIEW);
      })
      .catch(() => {
        toast.error("Room not found or already started.");
        setStage(STAGES.PREVIEW);
      });
  }, [roomId, user]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const { data } = await joinPeerSession(roomId);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      socket.connect();
      socket.emit("join-room", {
        roomId,
        userId: user._id,
        role: "interviewer",
      });

      const peer = new Peer(user._id, {
        host: "0.peerjs.com",
        port: 443,
        secure: true,
      });
      peerRef.current = peer;

      peer.on("call", (call) => {
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          if (remoteVideoRef.current)
            remoteVideoRef.current.srcObject = remoteStream;
        });
      });

      setRoomSession(data.session);
      setStage(STAGES.CALL);
    } catch (err) {
      toast.error("Failed to join: " + err.message);
    } finally {
      setJoining(false);
    }
  };

  // ── Re-attach local stream once the video element mounts (after stage → CALL) ──
  useEffect(() => {
    if (stage === STAGES.CALL && localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [stage]);

  const handleEnd = async () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.destroy();
    socket.emit("leave-room", { roomId, userId: user?._id });
    socket.disconnect();

    try {
      await endPeerSession(roomSession._id);
    } catch {
      // silently ignore
    }

    setStage(STAGES.ENDED);
  };

  const handleSubmitFeedback = () => {
    navigate(`/reports/${roomSession?._id}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ToastContainer />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8">
        {(stage === STAGES.LOADING || authLoading) && (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {stage === STAGES.PREVIEW && (
          <div className="max-w-md mx-auto">
            <div className="card text-center space-y-5">
              <span className="text-5xl">🎥</span>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Join Peer Interview
                </h1>
                <p className="text-gray-400 mt-1 text-sm">Room: {roomId}</p>
              </div>
              {roomSession && (
                <div className="bg-surface-700 rounded-lg px-4 py-3 text-sm text-left space-y-1">
                  <p className="text-gray-400">
                    <span className="text-gray-300 font-medium">Candidate:</span>{" "}
                    {roomSession.candidate?.name}
                  </p>
                  <p className="text-gray-400">
                    <span className="text-gray-300 font-medium">Topic:</span>{" "}
                    <span className="capitalize">{roomSession.topic}</span>
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Make sure your camera and microphone are enabled before joining.
              </p>
              <button
                onClick={handleJoin}
                disabled={joining}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                {joining ? <Spinner size="sm" /> : "📹"}
                {joining ? "Joining…" : "Join as Interviewer"}
              </button>
            </div>
          </div>
        )}

        {stage === STAGES.CALL && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VideoTile label={`You (${user?.name})`} videoRef={localVideoRef} muted />
              <VideoTile label="Candidate" videoRef={remoteVideoRef} />
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleEnd}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
              >
                ⏹ End Interview
              </button>
            </div>
          </div>
        )}

        {stage === STAGES.ENDED && (
          <div className="max-w-md mx-auto text-center">
            <div className="card py-12 space-y-5">
              <span className="text-5xl">✅</span>
              <h2 className="text-2xl font-bold text-white">Interview ended</h2>
              <p className="text-gray-400 text-sm">
                Submit your feedback and notes for the candidate.
              </p>
              <button
                onClick={handleSubmitFeedback}
                className="btn-primary px-8"
              >
                Submit Feedback →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
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