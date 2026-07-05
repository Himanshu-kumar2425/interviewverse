import { useState, useRef, useEffect } from "react";

/**
 * Web Speech API speech-to-text component.
 * Calls onResult(transcript) when speech recognition produces a final result.
 */
export default function VoiceInput({ onResult }) {
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
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
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      setInterimText(interim);
      if (final) {
        onResult(final.trim());
        setInterimText("");
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [onResult]);

  const toggle = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  if (!supported) {
    return (
      <p className="text-xs text-yellow-400">
        Speech recognition is not supported in this browser. Use Chrome or Edge.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all shadow-lg ${
          listening
            ? "bg-red-600 hover:bg-red-700 animate-pulse"
            : "bg-brand-600 hover:bg-brand-700"
        }`}
        aria-label={listening ? "Stop recording" : "Start recording"}
      >
        {listening ? "⏹" : "🎤"}
      </button>
      <p className="text-xs text-gray-400">
        {listening ? "Listening… speak your answer" : "Click to start speaking"}
      </p>
      {interimText && (
        <p className="text-sm italic text-gray-400 text-center max-w-md">
          {interimText}
        </p>
      )}
    </div>
  );
}
