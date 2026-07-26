import { useState } from "react";
import {
  Stethoscope, ArrowRight, Activity, Brain, CreditCard, BarChart2,
  Plus, CheckCircle, Github, ShieldCheck,
} from "lucide-react";
import { db, firebaseReady } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function EKGLine({ className = "" }) {
  return (
    <svg viewBox="0 0 600 80" className={className} preserveAspectRatio="none">
      <polyline
        points="0,40 90,40 110,10 130,70 150,40 250,40 270,15 288,64 306,40 400,40 420,20 438,58 456,40 600,40"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

const FINDINGS = [
  {
    label: "SYMPTOM",
    title: "You review the same mistake five times and it still doesn't stick.",
    body: "Passive re-reading feels productive but doesn't build recall. Without a structured log, the same trap catches you on the next block.",
  },
  {
    label: "SYMPTOM",
    title: "You don't actually know which system is failing you.",
    body: "\"I should do more Renal\" is a feeling, not a plan. Without real numbers, study time goes to whatever felt hardest yesterday.",
  },
  {
    label: "SYMPTOM",
    title: "Flashcards pile up and reviews get skipped.",
    body: "No spaced-repetition schedule means cards you knew cold get reviewed too often, and the ones you're shaky on drift out of rotation.",
  },
];

const TREATMENTS = [
  {
    icon: Plus,
    color: "from-cyan-600 to-teal-700",
    title: "Structured Mistake Log",
    body: "Every wrong question becomes a record: source, system, mistake type, the concept actually being tested, and a takeaway in your own words.",
  },
  {
    icon: BarChart2,
    color: "from-rose-600 to-pink-700",
    title: "Weak-Area Analytics",
    body: "A weakness score (errors × error rate) ranks your systems automatically, so \"study more Renal\" becomes \"Renal is #1, here's why.\"",
  },
  {
    icon: CreditCard,
    color: "from-amber-600 to-orange-700",
    title: "Spaced-Repetition Flashcards",
    body: "An SM-2 scheduling algorithm decides what's due today, so review time goes to what you're actually forgetting.",
  },
  {
    icon: Brain,
    color: "from-purple-600 to-indigo-700",
    title: "AI Mentor",
    body: "Ask for a vignette on your weakest system, a study plan, or a mistake-pattern breakdown — like a senior explaining boards logic at 1am.",
  },
];

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setStatus("loading");
    try {
      if (firebaseReady) {
        await addDoc(collection(db, "waitlist"), {
          email: email.trim(),
          createdAt: serverTimestamp(),
        });
      }
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="flex items-center gap-2 bg-green-900/30 border border-green-700/40 rounded-xl px-4 py-3 text-sm text-green-300 max-w-md">
        <CheckCircle size={16} className="flex-shrink-0" />
        You're on the list — we'll email you when the app launches.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your.name@email.com"
        className="flex-1 bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
      >
        {status === "loading" ? "Joining…" : "Join the waitlist"}
        {status !== "loading" && <ArrowRight size={16} />}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-400 sm:absolute">Something went wrong — try again in a moment.</p>
      )}
    </form>
  );
}

export default function Landing({ onTryDemo, onAdmin }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-body">
      {/* Top bar — sticky, so the way into the app is always one click away */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-900">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
              <Stethoscope size={16} className="text-white" />
            </div>
            <span className="font-display font-semibold text-lg">Medical Mentor</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onAdmin}
              className="hidden sm:flex text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors items-center gap-1.5"
            >
              <ShieldCheck size={13} /> admin
            </button>
            <button
              onClick={onTryDemo}
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              Try Live Demo <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Floating CTA — stays on screen while scrolling on any device */}
      <button
        onClick={onTryDemo}
        className="fixed bottom-5 right-5 z-40 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold pl-4 pr-5 py-3 rounded-full shadow-lg shadow-cyan-950/50 flex items-center gap-2 transition-colors"
      >
        <Activity size={15} /> Try Live Demo
      </button>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-10 pb-20 grid lg:grid-cols-[1.15fr_1fr] gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono text-cyan-300 tracking-wide">BUILT FOR UWORLD / NBME PREP · PAKISTAN</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight">
            Every wrong answer is data.
            <br />
            <span className="text-cyan-400">We turn it into your board pass.</span>
          </h1>

          <p className="text-slate-400 text-lg mt-6 leading-relaxed">
            Medical Mentor logs your mistakes, tells you exactly which system is failing you,
            and builds a spaced-repetition deck automatically — so review time goes to what
            you actually forget, not what feels productive.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={onTryDemo}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
            >
              Open the app <ArrowRight size={17} />
            </button>
            <a
              href="#waitlist"
              className="border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold px-6 py-3.5 rounded-xl transition-colors text-center"
            >
              Join the waitlist
            </a>
          </div>
          <p className="text-xs text-slate-600 mt-3">No sign-up needed to explore — the demo opens instantly.</p>
        </div>

        {/* Live preview of the actual product, not a stock illustration */}
        <button onClick={onTryDemo} className="group relative mx-auto w-full max-w-[280px] text-left">
          <div className="absolute -inset-4 bg-cyan-500/10 blur-3xl rounded-full" />
          <div className="relative bg-slate-900 border border-slate-800 rounded-[2rem] p-2 shadow-2xl shadow-black/50 group-hover:border-cyan-700/60 transition-colors">
            <div className="bg-slate-950 rounded-[1.6rem] overflow-hidden border border-slate-800/80">
              {/* mini status bar */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                    <Stethoscope size={9} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white">Medical Mentor</span>
                </div>
                <span className="text-[9px] text-slate-500 bg-slate-800/80 rounded-full px-1.5 py-0.5">25% acc</span>
              </div>
              {/* mini hero card */}
              <div className="mx-3 mb-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-3">
                <p className="text-[8px] font-bold text-cyan-400 tracking-wider">MEDICAL MENTOR</p>
                <p className="text-xs font-bold text-white mt-0.5">Good evening, Imran</p>
                <p className="text-[9px] text-slate-500 mt-0.5">3 flashcards due</p>
                <EKGLine className="w-full h-5 mt-1.5" />
              </div>
              {/* mini stat cards */}
              <div className="grid grid-cols-2 gap-1.5 px-3 mb-2">
                <div className="bg-slate-800/60 rounded-lg p-2">
                  <p className="text-sm font-bold text-white leading-none">25%</p>
                  <p className="text-[8px] text-slate-500 mt-0.5">Accuracy</p>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2">
                  <p className="text-sm font-bold text-white leading-none">3</p>
                  <p className="text-[8px] text-slate-500 mt-0.5">Cards due</p>
                </div>
              </div>
              {/* mini critical focus */}
              <div className="mx-3 mb-3 bg-red-950/50 border border-red-900/40 rounded-lg p-2.5">
                <p className="text-[8px] font-bold text-red-400 tracking-wider mb-1">CRITICAL FOCUS</p>
                <p className="text-[11px] font-semibold text-white">Renal</p>
                <div className="h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: "44%" }} />
                </div>
              </div>
              {/* mini nav */}
              <div className="flex justify-between px-3 pb-3 pt-1 border-t border-slate-800/80">
                {["Home","Log","Cards","Mentor","More"].map((n,i) => (
                  <span key={n} className={`text-[7px] font-medium ${i===0 ? "text-cyan-400" : "text-slate-600"}`}>{n}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
            Tap to explore the real app <ArrowRight size={13} />
          </div>
        </button>
      </section>

      {/* Diagnosis / problem */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-900">
        <p className="text-xs font-mono text-slate-500 tracking-widest mb-2">CHIEF COMPLAINT</p>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold max-w-xl mb-10">
          Sound familiar? Most students study the same way and get the same result.
        </h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {FINDINGS.map((f) => (
            <div key={f.title} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <p className="text-[10px] font-mono text-red-400 tracking-widest mb-2">{f.label}</p>
              <p className="font-semibold text-white leading-snug mb-2">{f.title}</p>
              <p className="text-sm text-slate-400 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Treatment / features */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-900">
        <p className="text-xs font-mono text-slate-500 tracking-widest mb-2">TREATMENT PLAN</p>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold max-w-xl mb-10">
          Four tools that turn scattered review into a system.
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {TREATMENTS.map((t) => (
            <div key={t.title} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex gap-4">
              <div className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center`}>
                <t.icon size={19} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">{t.title}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{t.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mid-page reminder CTA */}
      <section className="max-w-5xl mx-auto px-6">
        <button
          onClick={onTryDemo}
          className="w-full bg-gradient-to-r from-cyan-950/60 to-slate-900/60 border border-cyan-900/40 hover:border-cyan-700/60 rounded-2xl p-5 flex items-center justify-between gap-4 transition-colors group"
        >
          <span className="text-sm sm:text-base font-semibold text-white text-left">
            Skip the reading — go tap through the actual product right now.
          </span>
          <span className="flex-shrink-0 flex items-center gap-1.5 text-sm font-bold text-cyan-400 group-hover:text-cyan-300">
            Open the app <ArrowRight size={15} />
          </span>
        </button>
      </section>

      {/* Founder note */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-900">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-8 max-w-2xl">
          <p className="text-xs font-mono text-slate-500 tracking-widest mb-3">PROGNOSIS</p>
          <p className="text-lg text-slate-200 leading-relaxed">
            "I built this because I was tired of watching brilliant classmates burn out on
            passive review. Every mistake you log here makes the system smarter about what
            you personally need to fix next — not a generic study plan, yours."
          </p>
          <p className="text-sm text-slate-500 mt-4">— Founder, Medical Mentor</p>
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="max-w-5xl mx-auto px-6 py-20 border-t border-slate-900">
        <p className="text-xs font-mono text-slate-500 tracking-widest mb-2">NEXT STEPS</p>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-3">
          The app is coming. Get early access.
        </h2>
        <p className="text-slate-400 mb-6 max-w-lg">
          This site is the demo. The mobile app — with your real question log, live AI
          mentor, and full flashcard deck — launches next. Join the list and we'll email you.
        </p>
        <WaitlistForm />
        <button onClick={onTryDemo} className="mt-4 text-xs font-semibold text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1.5">
          Prefer to just look around first? Open the app <ArrowRight size={12} />
        </button>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-10 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <span>© {new Date().getFullYear()} Medical Mentor. Built for medical students, by medical students.</span>
        <button onClick={onAdmin} className="hover:text-slate-400 transition-colors flex items-center gap-1.5">
          <ShieldCheck size={13} /> Admin login
        </button>
      </footer>
    </div>
  );
}
