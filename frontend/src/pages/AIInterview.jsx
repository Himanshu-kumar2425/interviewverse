import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useInterview } from "../context/InterviewContext.jsx";
import PageLayout from "../components/common/PageLayout.jsx";
import Spinner from "../components/common/Spinner.jsx";
import { toast } from "../components/common/Toast.jsx";
import ToastContainer from "../components/common/Toast.jsx";
import VoiceInput from "../components/interview/VoiceInput.jsx";
import TranscriptPanel from "../components/interview/TranscriptPanel.jsx";

const TOPICS = [
  { id: "dsa", label: "DSA", icon: "🧮", desc: "Data structures & algorithms" },
  { id: "hr", label: "HR", icon: "💼", desc: "Behavioural & situational" },
  { id: "resume", label: "Resume", icon: "📄", desc: "Deep-dive on your CV" },
  { id: "fullstack", label: "Full Stack", icon: "🌐", desc: "Frontend, backend & systems" },
  { id: "general", label: "General", icon: "⚡", desc: "Mixed topics" },
];

const STAGES = { SETUP: "setup", ACTIVE: "active", ENDED: "ended" };

export default function AIInterview() {
  const navigate = useNavigate();
  const { session, currentQuestion, transcript, isLoading, isEnded, start, answer, end, reset } =
    useInterview();

  const [stage, setStage] = useState(STAGES.SETUP);
  const [selectedTopic, setSelectedTopic] = useState("dsa");
  const [answerText, setAnswerText] = useState("");
  const [inputMode, setInputMode] = useState("text"); // "text" | "voice"
  const bottomRef = useRef(null);

  // Scroll transcript to bottom on new turns
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Watch for session end via context
  useEffect(() => {
    if (isEnded && stage === STAGES.ACTIVE) {
      setStage(STAGES.ENDED);
    }
  }, [isEnded, stage]);

  const handleStart = async () => {
    try {
      await start(selectedTopic, "ai");
      setStage(STAGES.ACTIVE);
    } catch {
      toast.error("Failed to start session. Check your connection.");
    }
  };

  const handleSubmitAnswer = async () => {
    const text = answerText.trim();
    if (!text) return;
    setAnswerText("");
    try {
      await answer(text, inputMode);
    } catch {
      toast.error("Failed to submit answer. Please try again.");
    }
  };

  const handleVoiceResult = (text) => {
    setAnswerText(text);
    setInputMode("voice");
  };

  const handleEnd = async () => {
    if (!window.confirm("End this interview session?")) return;
    try {
      const sessionId = await end();
      setStage(STAGES.ENDED);
    } catch {
      toast.error("Failed to end session.");
    }
  };

  const handleViewReport = () => {
    if (session?._id) {
      navigate(`/reports/${session._id}`);
    }
  };

  const handleNewInterview = () => {
    reset();
    setStage(STAGES.SETUP);
    setAnswerText("");
  };

  return (
    <PageLayout>
      <ToastContainer />

      {/* ── SETUP ──────────────────────────────────────────────────── */}
      {stage === STAGES.SETUP && (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">AI Interview</h1>
          <p className="text-gray-400 mb-8">
            Gemini asks one question at a time and adapts based on your answers.
          </p>

          <div className="card mb-6">
            <h2 className="text-base font-semibold text-gray-200 mb-4">
              Choose a topic
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTopic(t.id)}
                  className={`rounded-xl p-4 text-left border transition-all ${
                    selectedTopic === t.id
                      ? "border-brand-500 bg-brand-600/10"
                      : "border-surface-600 bg-surface-700 hover:border-brand-600/40"
                  }`}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <p className="font-medium text-sm text-white mt-2">{t.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="card mb-6 bg-brand-900/20 border-brand-700/40">
            <h3 className="text-sm font-semibold text-brand-300 mb-2">
              Before you start
            </h3>
            <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
              <li>8–10 adaptive questions per session</li>
              <li>Answer via text or use the microphone</li>
              <li>Your resume is used if you&apos;ve uploaded one</li>
              <li>A detailed report is generated after the session</li>
            </ul>
          </div>

          <button
            onClick={handleStart}
            disabled={isLoading}
            className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
          >
            {isLoading ? <Spinner size="sm" /> : "🚀"}
            {isLoading ? "Starting…" : "Start Interview"}
          </button>
        </div>
      )}

      {/* ── ACTIVE ─────────────────────────────────────────────────── */}
      {stage === STAGES.ACTIVE && (
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div>
              <span className="badge-brand capitalize">{selectedTopic}</span>
              <span className="ml-2 text-xs text-gray-500">AI Interview</span>
            </div>
            <button
              onClick={handleEnd}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              End session
            </button>
          </div>

          {/* Transcript */}
          <div className="card h-[50vh] overflow-y-auto flex flex-col gap-4">
            <TranscriptPanel transcript={transcript} />
            <div ref={bottomRef} />
          </div>

          {/* Current question banner */}
          {currentQuestion && (
            <div className="rounded-xl bg-brand-600/10 border border-brand-700/50 px-5 py-4">
              <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
                Current question
              </p>
              <p className="text-gray-100 leading-relaxed">{currentQuestion.text}</p>
            </div>
          )}

          {/* Answer input */}
          <div className="card space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => setInputMode("text")}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  inputMode === "text"
                    ? "bg-brand-600 text-white"
                    : "bg-surface-700 text-gray-400 hover:text-gray-200"
                }`}
              >
                ⌨️ Text
              </button>
              <button
                onClick={() => setInputMode("voice")}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  inputMode === "voice"
                    ? "bg-brand-600 text-white"
                    : "bg-surface-700 text-gray-400 hover:text-gray-200"
                }`}
              >
                🎤 Voice
              </button>
            </div>

            {inputMode === "voice" ? (
              <VoiceInput onResult={handleVoiceResult} />
            ) : null}

            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) handleSubmitAnswer();
              }}
              placeholder="Type your answer here… (Ctrl+Enter to submit)"
              rows={4}
              className="input-field resize-none font-mono text-sm"
            />

            <button
              onClick={handleSubmitAnswer}
              disabled={isLoading || !answerText.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? <Spinner size="sm" /> : null}
              {isLoading ? "Thinking…" : "Submit Answer →"}
            </button>
          </div>
        </div>
      )}

      {/* ── ENDED ──────────────────────────────────────────────────── */}
      {stage === STAGES.ENDED && (
        <div className="max-w-lg mx-auto text-center">
          <div className="card py-12">
            <span className="text-6xl">🎉</span>
            <h2 className="text-2xl font-bold text-white mt-4 mb-2">
              Interview complete!
            </h2>
            <p className="text-gray-400 mb-8">
              Your report is being generated by Gemini. It should be ready
              in a few seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={handleViewReport} className="btn-primary px-8">
                📊 View Report
              </button>
              <button onClick={handleNewInterview} className="btn-secondary px-8">
                Start New Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
