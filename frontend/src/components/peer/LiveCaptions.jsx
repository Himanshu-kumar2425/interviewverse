import { useEffect, useRef, useState } from "react";
import socket from "../../lib/socket.js";

/**
 * AI Observer — transcribes the candidate's speech live using Web Speech API
 * and emits turns to the backend via Socket.IO.
 *
 * Also displays a live captions panel for both participants.
 */
export default function LiveCaptions({ captions, sessionId }) {
  const [observerActive, setObserverActive] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const text = event.results[i][0].transcript.trim();
          if (text && sessionId) {
            socket.emit("transcript-turn", {
              sessionId,
              role: "candidate",
              text,
            });
          }
        }
      }
    };

    recognition.onend = () => {
      // Auto-restart if still active
      if (observerActive) recognition.start();
    };

    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [sessionId, observerActive]);

  const toggleObserver = () => {
    if (!recognitionRef.current) return;
    if (observerActive) {
      recognitionRef.current.stop();
      setObserverActive(false);
    } else {
      recognitionRef.current.start();
      setObserverActive(true);
    }
  };

  const captionsEndRef = useRef(null);
  useEffect(() => {
    captionsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [captions]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-300">
          Live Captions (AI Observer)
        </h3>
        {supported ? (
          <button
            onClick={toggleObserver}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              observerActive
                ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                : "bg-surface-700 text-gray-400 hover:text-gray-200"
            }`}
          >
            {observerActive ? "⏹ Stop Observer" : "▶ Start Observer"}
          </button>
        ) : (
          <span className="text-xs text-yellow-400">Not supported in this browser</span>
        )}
      </div>

      <div className="h-40 overflow-y-auto bg-surface-900/50 rounded-lg p-3 space-y-2">
        {captions.length === 0 ? (
          <p className="text-xs text-gray-600 text-center pt-8">
            Captions will appear here once the observer is active.
          </p>
        ) : (
          captions.map((c, i) => (
            <div key={i} className="flex gap-2 text-xs">
              <span
                className={`font-semibold flex-shrink-0 ${
                  c.role === "interviewer" ? "text-brand-400" : "text-green-400"
                }`}
              >
                {c.role === "interviewer" ? "Interviewer" : "You"}:
              </span>
              <span className="text-gray-300">{c.text}</span>
            </div>
          ))
        )}
        <div ref={captionsEndRef} />
      </div>
    </div>
  );
}
