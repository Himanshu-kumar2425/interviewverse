import { useState } from "react";

/**
 * Collapsible card for a single per-question feedback item.
 */
export default function QuestionCard({ index, item }) {
  const [expanded, setExpanded] = useState(false);
  const { questionText, candidateAnswer, score, feedback, sampleAnswer } = item;

  const scoreColor =
    score >= 7 ? "text-green-400 bg-green-900/20" :
    score >= 4 ? "text-yellow-400 bg-yellow-900/20" :
    "text-red-400 bg-red-900/20";

  return (
    <div className="card border border-surface-600 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start justify-between gap-4 text-left group"
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-xs font-mono text-gray-500 mt-1 flex-shrink-0">
            Q{index}
          </span>
          <p className="text-sm text-gray-200 leading-relaxed">{questionText}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${scoreColor}`}>
            {score}/10
          </span>
          <span className="text-gray-500 group-hover:text-gray-300 transition-colors">
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-5 space-y-4 border-t border-surface-600 pt-4">
          {/* Candidate's answer */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              Your Answer
            </p>
            <p className="text-sm text-gray-300 leading-relaxed bg-surface-700/50 rounded-lg px-3 py-2">
              {candidateAnswer}
            </p>
          </div>

          {/* AI feedback */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-400 mb-1.5">
              Feedback
            </p>
            <p className="text-sm text-gray-300 leading-relaxed">{feedback}</p>
          </div>

          {/* Sample answer */}
          {sampleAnswer && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-400 mb-1.5">
                Sample Answer
              </p>
              <p className="text-sm text-gray-300 leading-relaxed bg-green-900/10 border border-green-700/20 rounded-lg px-3 py-2">
                {sampleAnswer}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
