import { useState, useEffect } from "react";

/**
 * Lightweight toast — use the exported `toast` helper directly.
 * Example: import { toast } from "../components/common/Toast.jsx"
 *          toast.success("Saved!")
 */

// Global queue
let listeners = [];
let toastId = 0;

const notify = (message, type = "info") => {
  const id = ++toastId;
  listeners.forEach((fn) => fn({ id, message, type }));
};

export const toast = {
  success: (msg) => notify(msg, "success"),
  error: (msg) => notify(msg, "error"),
  info: (msg) => notify(msg, "info"),
};

const typeStyles = {
  success: "bg-green-900/80 border-green-700 text-green-200",
  error: "bg-red-900/80 border-red-700 text-red-200",
  info: "bg-surface-700 border-surface-600 text-gray-200",
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(
        () => setToasts((prev) => prev.filter((x) => x.id !== t.id)),
        4000
      );
    };
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((fn) => fn !== handler);
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`border rounded-lg px-4 py-3 text-sm shadow-lg backdrop-blur-sm animate-fade-in ${typeStyles[t.type]}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
