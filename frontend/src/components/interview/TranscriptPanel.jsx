/**
 * Renders an ordered list of transcript turns.
 * transcript: [{ role: "interviewer" | "candidate", text: string }]
 */
export default function TranscriptPanel({ transcript }) {
  if (!transcript || transcript.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600 text-sm">
        Interview transcript will appear here.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {transcript.map((turn, i) => {
        const isInterviewer = turn.role === "interviewer";
        return (
          <div
            key={i}
            className={`flex gap-3 ${isInterviewer ? "" : "flex-row-reverse"}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-medium ${
                isInterviewer
                  ? "bg-brand-600/30 text-brand-300"
                  : "bg-surface-600 text-gray-300"
              }`}
              aria-hidden="true"
            >
              {isInterviewer ? "AI" : "Me"}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                isInterviewer
                  ? "bg-surface-700 text-gray-200 rounded-tl-sm"
                  : "bg-brand-600/20 text-gray-100 rounded-tr-sm"
              }`}
            >
              {turn.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
