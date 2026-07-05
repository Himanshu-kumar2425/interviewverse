/**
 * Circular score gauge using SVG.
 */
export default function ScoreGauge({ score }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 70 ? "#4ade80" : score >= 45 ? "#facc15" : "#f87171";

  return (
    <div className="flex-shrink-0 flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 120 120" aria-label={`Score: ${score} out of 100`}>
        {/* Background track */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#2a2a38"
          strokeWidth="10"
        />
        {/* Progress */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
        />
        <text
          x="60"
          y="60"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-white text-2xl font-bold"
          style={{ fontSize: "22px", fontWeight: "700", fill: "white" }}
        >
          {score}
        </text>
      </svg>
      <p className="text-xs text-gray-500 mt-1">Overall score</p>
    </div>
  );
}
