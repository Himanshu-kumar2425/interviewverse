import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../context/AuthContext.jsx";
import { getMyReports } from "../api/report.api.js";
import PageLayout from "../components/common/PageLayout.jsx";
import Spinner from "../components/common/Spinner.jsx";

const topicBadgeClass = {
  dsa: "badge-indigo",
  hr: "badge-green",
  resume: "badge-yellow",
  fullstack: "badge-red",
  general: "badge bg-surface-600 text-gray-300",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReports()
      .then(({ data }) => setReports(data.reports))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Build chart data — last 10 sessions, oldest first
  const chartData = [...reports]
    .reverse()
    .slice(-10)
    .map((r, i) => ({
      session: `#${i + 1}`,
      score: r.overallScore,
      topic: r.session?.topic,
    }));

  const recentActivity = reports.slice(0, 5);

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-400 mt-1">
          Track your progress and jump into your next interview.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total interviews"
          value={user?.stats?.totalInterviews ?? 0}
          icon="🎯"
        />
        <StatCard
          label="Average score"
          value={`${user?.stats?.averageScore ?? 0} / 100`}
          icon="⭐"
        />
        <StatCard
          label="AI sessions"
          value={reports.filter((r) => r.session?.mode === "ai").length}
          icon="🤖"
        />
        <StatCard
          label="Peer sessions"
          value={reports.filter((r) => r.session?.mode === "peer").length}
          icon="🎥"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Performance chart */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-6">
            Score trend (last 10 sessions)
          </h2>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Spinner />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
              No sessions yet. Start your first interview!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a38" />
                <XAxis
                  dataKey="session"
                  stroke="#6b7280"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#6b7280"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#16161d",
                    border: "1px solid #2a2a38",
                    borderRadius: "8px",
                    color: "#f3f4f6",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: "#6366f1", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick actions */}
        <div className="card flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-white mb-2">
            Start practicing
          </h2>
          <Link to="/interview/ai" className="btn-primary text-center">
            🤖 AI Interview
          </Link>
          <Link to="/interview/peer" className="btn-secondary text-center">
            🎥 Peer Interview
          </Link>
          <Link to="/resume" className="btn-secondary text-center">
            📄 Upload Resume
          </Link>
          <Link to="/reports" className="btn-secondary text-center">
            📊 View All Reports
          </Link>
        </div>
      </div>

      {/* Recent activity */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">
          Recent activity
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : recentActivity.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">
            No interviews yet.
          </p>
        ) : (
          <div className="divide-y divide-surface-600">
            {recentActivity.map((r) => (
              <div
                key={r._id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {r.session?.mode === "ai" ? "🤖" : "🎥"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-200 capitalize">
                      {r.session?.topic} interview
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(r.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-semibold ${
                      r.overallScore >= 70
                        ? "text-green-400"
                        : r.overallScore >= 45
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {r.overallScore}/100
                  </span>
                  <Link
                    to={`/reports/${r.session?._id}`}
                    className="text-xs text-brand-400 hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="card flex flex-col gap-2">
      <span className="text-2xl">{icon}</span>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}
