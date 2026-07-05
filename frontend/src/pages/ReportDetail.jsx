import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getReportBySession } from "../api/report.api.js";
import { submitHumanFeedback } from "../api/report.api.js";
import { useAuth } from "../context/AuthContext.jsx";
import PageLayout from "../components/common/PageLayout.jsx";
import Spinner from "../components/common/Spinner.jsx";
import { toast } from "../components/common/Toast.jsx";
import ToastContainer from "../components/common/Toast.jsx";
import ScoreGauge from "../components/report/ScoreGauge.jsx";
import QuestionCard from "../components/report/QuestionCard.jsx";

export default function ReportDetail() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notReady, setNotReady] = useState(false);

  // Human feedback form state
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    let attempts = 0;

    const fetchReport = async () => {
      try {
        const { data } = await getReportBySession(sessionId);
        setReport(data.report);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 404 && attempts < 6) {
          // Report not ready yet — retry every 5 seconds
          attempts++;
          setTimeout(fetchReport, 5000);
        } else {
          setNotReady(true);
          setLoading(false);
        }
      }
    };

    fetchReport();
  }, [sessionId]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await submitHumanFeedback(sessionId, { rating, notes });
      toast.success("Feedback submitted!");
      // Refresh
      const { data } = await getReportBySession(sessionId);
      setReport(data.report);
    } catch {
      toast.error("Failed to submit feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Spinner size="lg" />
          <p className="text-gray-400">Generating your report with Gemini…</p>
        </div>
      </PageLayout>
    );
  }

  if (notReady || !report) {
    return (
      <PageLayout>
        <div className="text-center py-20">
          <span className="text-5xl">⏳</span>
          <p className="text-gray-300 mt-4 font-medium">Report not available yet.</p>
          <p className="text-gray-500 text-sm mt-1">
            This can take up to a minute after the session ends.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary mt-6"
          >
            Refresh
          </button>
        </div>
      </PageLayout>
    );
  }

  const isInterviewer =
    report.session?.mode === "peer" &&
    report.session?.interviewer === user?._id;

  return (
    <PageLayout>
      <ToastContainer />

      {/* Back */}
      <Link to="/reports" className="text-sm text-brand-400 hover:underline mb-6 inline-block">
        ← Back to reports
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
        <ScoreGauge score={report.overallScore} />
        <div>
          <h1 className="text-3xl font-bold text-white capitalize">
            {report.session?.topic} Interview
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            {report.session?.mode === "ai" ? "🤖 AI Mode" : "🎥 Peer Mode"} ·{" "}
            {new Date(report.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {report.session?.durationSeconds
              ? ` · ${Math.round(report.session.durationSeconds / 60)} min`
              : ""}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Strengths */}
        <div className="card">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-green-400 mb-3">
            Strengths
          </h2>
          {report.strengths?.length > 0 ? (
            <ul className="space-y-2">
              {report.strengths.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-300">
                  <span className="text-green-400 mt-0.5">✓</span> {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">None identified.</p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="card">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-red-400 mb-3">
            Weaknesses
          </h2>
          {report.weaknesses?.length > 0 ? (
            <ul className="space-y-2">
              {report.weaknesses.map((w, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-300">
                  <span className="text-red-400 mt-0.5">✗</span> {w}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">None identified.</p>
          )}
        </div>

        {/* Improvements */}
        <div className="card">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-yellow-400 mb-3">
            Suggested Improvements
          </h2>
          {report.suggestedImprovements?.length > 0 ? (
            <ul className="space-y-2">
              {report.suggestedImprovements.map((imp, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-300">
                  <span className="text-yellow-400 mt-0.5">→</span> {imp}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">None provided.</p>
          )}
        </div>
      </div>

      {/* Per-question breakdown */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">
          Per-question breakdown
        </h2>
        <div className="space-y-4">
          {(report.perQuestionFeedback || []).map((q, i) => (
            <QuestionCard key={i} index={i + 1} item={q} />
          ))}
        </div>
      </div>

      {/* Human feedback section — only shown if peer mode and user is interviewer */}
      {report.session?.mode === "peer" && isInterviewer && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Your Feedback (Interviewer)
          </h2>
          {report.humanFeedback ? (
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">
                <span className="text-gray-500 font-medium">Rating:</span>{" "}
                {"⭐".repeat(report.humanFeedback.rating)}
              </p>
              <p className="text-gray-300 text-sm">
                <span className="text-gray-500 font-medium">Notes:</span>{" "}
                {report.humanFeedback.notes || "—"}
              </p>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Rating (1–5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className={`text-2xl transition-transform hover:scale-110 ${
                        n <= rating ? "opacity-100" : "opacity-30"
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Observations about the candidate's performance…"
                  className="input-field resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submittingFeedback}
                className="btn-primary flex items-center gap-2"
              >
                {submittingFeedback ? <Spinner size="sm" /> : null}
                {submittingFeedback ? "Submitting…" : "Submit Feedback"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Human feedback display for candidate in peer mode */}
      {report.session?.mode === "peer" && !isInterviewer && report.humanFeedback && (
        <div className="card mb-8 bg-brand-900/10 border-brand-700/30">
          <h2 className="text-lg font-bold text-white mb-3">
            Interviewer Feedback
          </h2>
          <p className="text-sm text-gray-400 mb-1">
            Rating: {"⭐".repeat(report.humanFeedback.rating)}
          </p>
          {report.humanFeedback.notes && (
            <p className="text-sm text-gray-300">{report.humanFeedback.notes}</p>
          )}
        </div>
      )}
    </PageLayout>
  );
}
