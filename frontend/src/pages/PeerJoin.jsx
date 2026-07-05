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

      // Connect socket first (needed for signaling), but DON'T announce
      // ourselves to the room yet — wait until PeerJS is fully registered.
      socket.connect();

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

      // Only tell the candidate "I'm here" once our PeerJS ID
      // has actually finished registering with the broker.
      peer.on("open", () => {
        socket.emit("join-room", {
          roomId,
          userId: user._id,
          role: "interviewer",
        });
      });

      setRoomSession(data.session);
      setStage(STAGES.CALL);
    } catch (err