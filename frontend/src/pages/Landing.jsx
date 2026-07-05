import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";

const features = [
  {
    icon: "🤖",
    title: "AI Interview Mode",
    desc: "Gemini asks adaptive follow-up questions based on your answers — no fixed scripts.",
  },
  {
    icon: "🎥",
    title: "Peer Interview Mode",
    desc: "Real video calls with fellow students. Share a link, start practicing instantly.",
  },
  {
    icon: "📄",
    title: "Resume-Aware Questions",
    desc: "Upload your PDF. Gemini reads it and tailors questions to your actual experience.",
  },
  {
    icon: "📊",
    title: "Detailed AI Reports",
    desc: "Per-question scores, strengths, weaknesses, and sample answers after every session.",
  },
  {
    icon: "🎤",
    title: "Voice Answers",
    desc: "Speak naturally. Web Speech API transcribes your answers in real time.",
  },
  {
    icon: "📈",
    title: "Progress Tracking",
    desc: "Watch your average score improve across sessions on your personal dashboard.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-600/10 blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <span className="badge-brand mb-6 inline-block">
            AI + Peer Mock Interviews
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
            Ace your next{" "}
            <span className="text-brand-400">engineering interview</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Practice with an AI that adapts to every answer, or go head-to-head
            with a peer over video. Get structured feedback after every session.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base px-8 py-3">
              Get started free
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3">
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-surface-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            Everything you need to prepare
          </h2>
          <p className="text-gray-400 text-center mb-14 max-w-xl mx-auto">
            Built specifically for engineering students targeting their first or
            next big role.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card hover:border-brand-600/50 transition-colors">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start practicing?
          </h2>
          <p className="text-gray-400 mb-8">
            Free to use. No credit card required.
          </p>
          <Link to="/register" className="btn-primary text-base px-10 py-3">
            Create your account
          </Link>
        </div>
      </section>

      <footer className="border-t border-surface-600 py-6 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} InterviewVerse. Built for engineering students.
      </footer>
    </div>
  );
}
