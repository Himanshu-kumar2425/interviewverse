import { createContext, useContext, useState, useCallback } from "react";
import {
  startSession,
  submitAnswer,
  endSession,
} from "../api/interview.api.js";

const InterviewContext = createContext(null);

export const InterviewProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [transcript, setTranscript] = useState([]); // [{role, text}]
  const [isLoading, setIsLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  const start = useCallback(async (topic, mode = "ai") => {
    setIsLoading(true);
    setIsEnded(false);
    setTranscript([]);
    try {
      const { data } = await startSession({ topic, mode });
      setSession(data.session);
      setCurrentQuestion(data.firstQuestion);
      if (data.firstQuestion) {
        setTranscript([{ role: "interviewer", text: data.firstQuestion.text }]);
      }
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const answer = useCallback(
    async (answerText, inputMode = "text") => {
      if (!session || !currentQuestion) return;
      setIsLoading(true);
      try {
        // Optimistically add the candidate turn to local transcript
        setTranscript((prev) => [
          ...prev,
          { role: "candidate", text: answerText },
        ]);

        const { data } = await submitAnswer(session._id, {
          questionId: currentQuestion._id,
          answerText,
          inputMode,
        });

        if (data.sessionEnded || !data.nextQuestion) {
          setIsEnded(true);
          setCurrentQuestion(null);
        } else {
          setCurrentQuestion(data.nextQuestion);
          setTranscript((prev) => [
            ...prev,
            { role: "interviewer", text: data.nextQuestion.text },
          ]);
        }

        return data;
      } finally {
        setIsLoading(false);
      }
    },
    [session, currentQuestion]
  );

  const end = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      await endSession(session._id);
      setIsEnded(true);
      return session._id;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const reset = useCallback(() => {
    setSession(null);
    setCurrentQuestion(null);
    setTranscript([]);
    setIsEnded(false);
    setIsLoading(false);
  }, []);

  return (
    <InterviewContext.Provider
      value={{
        session,
        currentQuestion,
        transcript,
        isLoading,
        isEnded,
        start,
        answer,
        end,
        reset,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error("useInterview must be used within InterviewProvider");
  return ctx;
};
