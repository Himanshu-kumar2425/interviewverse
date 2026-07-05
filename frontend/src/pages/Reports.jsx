import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyReports } from "../api/report.api.js";
import PageLayout from "../components/common/PageLayout.jsx";
import Spinner from "../components/common/Spinner.jsx";

const scoreColor = (score) => {
  if (score >= 70) return "text-green-400";
  if (score >= 45) return "text-yellow-400";
  return "text-red-400";
};

const scoreBg = (score) => {
  if (score >= 70) return "bg-green-900/20 border-green-700/30";
  if (score >= 45) return "bg-yellow-900/20 border-yellow-700/30";
  return "bg-red-900/20 border-red-700/30";
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReports()
      .then(({ data }) => setReports(data.reports))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <p className="text-gray-400 mt-1">
          All your interview evaluation reports in one place.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl">📭</span>
          <p className="text-gray-400 mt-4">No reports yet.</p>
          <Link to="/interview/ai" className="btn-primary mt-6 inline-block">
            Start your first interview
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map((r) => (
            <ReportCard key={r._id} report={r} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}

function ReportCard({ report }) {
  const { overallScore, session, strengths, weaknesses, createdAt } = report;
  const duration = session?.durationSeconds
    ? `${Math.round(session.durationSeconds / 60)} min`
    : "—";

  return (
    <div className={`card border flex flex-col gap-4 ${scoreBg(overallScore)}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300 capitalize">
            {session?.mode === "ai" ? "🤖" : "🎥"} {session?.topic} interview
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
            · {duration}
          </p>
        </div>
        <span className={`text-2xl font-bold ${scoreColor(overallScore)}`}>
          {overallScore}
        </span>
      </div>

      {strengths?.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Strengths
          </p>
          <ul className="text-xs text-gray-400 space-y-0.5">
            {strengths.slice(0, 2).map((s, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-green-500">✓</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {weaknesses?.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            To improve
          </p>
          <ul className="text-xs text-gray-400 space-y-0.5">
            {weaknesses.slice(0, 2).map((w, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-red-400">✗</span> {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        to={`/reports/${session?._id}`}
        className="btn-secondary text-sm text-center mt-auto"
      >
        View full report →
      </Link>
    </div>
  );
}
