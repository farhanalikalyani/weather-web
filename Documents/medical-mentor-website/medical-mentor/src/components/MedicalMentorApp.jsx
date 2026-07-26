import { useState, useEffect, useRef, useCallback } from "react";
import {
  Home, BookOpen, MessageSquare, CreditCard, BarChart2,
  Plus, Send, ChevronRight, AlertTriangle, CheckCircle,
  Brain, Zap, Target, TrendingUp, Clock, Star,
  RotateCcw, X, Menu, Stethoscope, Activity, Megaphone, ShieldCheck
} from "lucide-react";
import {
  SYSTEMS, SUBJECTS, DIFFICULTIES, MISTAKE_TYPES,
  initialQuestionLog, initialWeakAreas, initialFlashcards,
  getMockResponse,
} from "../mockData";
import { db, firebaseReady } from "../firebase";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";

// ─── UTILITY ─────────────────────────────────────────────────────────────────

function pct(n) { return Math.round(n * 100); }
function today() { return new Date().toISOString().split("T")[0]; }
function nextDate(days) {
  const d = new Date(); d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// ─── MICRO COMPONENTS ────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className={`bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 flex items-start gap-3`}>
      <div className={`rounded-xl p-2 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-white leading-none">{value}</div>
        <div className="text-xs text-slate-400 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

function Badge({ children, color = "slate" }) {
  const map = {
    red: "bg-red-900/60 text-red-300 border-red-700/50",
    yellow: "bg-yellow-900/60 text-yellow-300 border-yellow-700/50",
    green: "bg-green-900/60 text-green-300 border-green-700/50",
    cyan: "bg-cyan-900/60 text-cyan-300 border-cyan-700/50",
    slate: "bg-slate-700/60 text-slate-300 border-slate-600/50",
    purple: "bg-purple-900/60 text-purple-300 border-purple-700/50",
  };
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md border ${map[color]}`}>
      {children}
    </span>
  );
}

function MarkdownText({ text }) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return <p key={i} className="font-bold text-white">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith("• ")) {
          return <p key={i} className="text-slate-300 pl-3">• {renderInline(line.slice(2))}</p>;
        }
        if (line.startsWith("**") && line.includes("**")) {
          return <p key={i} className="text-slate-200">{renderInline(line)}</p>;
        }
        if (line === "---") return <hr key={i} className="border-slate-600 my-2" />;
        if (line.startsWith("🎯 ") || line.startsWith("🧠 ") || line.startsWith("✅ ") || line.startsWith("📊") || line.startsWith("🔍")) {
          return <p key={i} className="font-semibold text-cyan-300 mt-2">{line}</p>;
        }
        if (line === "") return <div key={i} className="h-1" />;
        return <p key={i} className="text-slate-200">{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i} className="text-white font-semibold">{p.slice(2, -2)}</strong>
      : p
  );
}

// ─── PULSE LINE SVG ──────────────────────────────────────────────────────────

function PulseLine() {
  return (
    <svg viewBox="0 0 200 40" className="w-full h-8 opacity-40" preserveAspectRatio="none">
      <polyline
        points="0,20 30,20 40,5 50,35 60,20 90,20 100,8 108,32 116,20 150,20 160,12 168,28 176,20 200,20"
        fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── SCREENS ─────────────────────────────────────────────────────────────────

function HomeDashboard({ questionLog, weakAreas, flashcards, setScreen, studentName, updates }) {
  const total = questionLog.length;
  const correct = questionLog.filter(q => q.correct).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const dueCards = flashcards.filter(f => f.due).length;
  const weakest = weakAreas[0];
  const recentMistakes = questionLog.filter(q => !q.correct).slice(-3).reverse();
  const streak = 7; // mock — replace with real streak tracking once accounts exist
  const latestUpdate = updates?.[0];

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-5">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope size={16} className="text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Medical Mentor</span>
          </div>
          <h1 className="text-xl font-bold text-white">Good evening, {studentName}</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {dueCards > 0 ? `${dueCards} flashcards due — keep the streak alive.` : "All cards reviewed. Log a mistake to keep learning."}
          </p>
          <div className="mt-3">
            <PulseLine />
          </div>
        </div>
        <div className="absolute top-3 right-4 text-5xl font-black text-slate-700/40 select-none">
          {accuracy}%
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Day Streak" value={`${streak}d`} sub="keep it going" icon={Zap} color="bg-amber-600" />
        <StatCard label="Questions Logged" value={total} sub="this session" icon={BookOpen} color="bg-emerald-600" />
      </div>

      {latestUpdate && (
        <button
          onClick={() => setScreen("updates")}
          className="w-full text-left bg-purple-950/40 border border-purple-800/40 rounded-2xl p-4 hover:bg-purple-950/60 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1">
            <Megaphone size={14} className="text-purple-300" />
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Latest Update</span>
          </div>
          <p className="text-sm font-semibold text-white truncate">{latestUpdate.title}</p>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{latestUpdate.body}</p>
        </button>
      )}

      {/* Weakest system */}
      {weakest && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-400" />
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Critical Focus</span>
            </div>
            <Badge color="red">Rank #{weakest.rank}</Badge>
          </div>
          <p className="text-white font-semibold">{weakest.system}</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${pct(weakest.accuracy)}%` }} />
            </div>
            <span className="text-sm font-bold text-red-300">{pct(weakest.accuracy)}%</span>
          </div>
          <button
            onClick={() => setScreen("chat")}
            className="mt-3 w-full text-center text-xs font-semibold text-red-300 bg-red-900/30 hover:bg-red-900/50 transition-colors py-2 rounded-xl"
          >
            Quiz me on {weakest.system} →
          </button>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Log a Mistake", icon: Plus, screen: "log", color: "from-cyan-600 to-teal-700" },
            { label: "AI Mentor Chat", icon: MessageSquare, screen: "chat", color: "from-purple-600 to-indigo-700" },
            { label: "Review Flashcards", icon: CreditCard, screen: "flashcards", color: "from-amber-600 to-orange-700" },
            { label: "Weak Areas", icon: BarChart2, screen: "weakareas", color: "from-rose-600 to-pink-700" },
          ].map(a => (
            <button
              key={a.screen}
              onClick={() => setScreen(a.screen)}
              className={`bg-gradient-to-br ${a.color} rounded-2xl p-4 text-left flex flex-col gap-2 hover:opacity-90 active:scale-95 transition-all`}
            >
              <a.icon size={20} className="text-white/90" />
              <span className="text-sm font-semibold text-white leading-tight">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent mistakes */}
      {recentMistakes.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Recent Mistakes</h2>
          <div className="space-y-2">
            {recentMistakes.map(q => (
              <div key={q.id} className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-900/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X size={12} className="text-red-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{q.topic}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge color="cyan">{q.system}</Badge>
                    <Badge color="slate">{q.mistake_type}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const BLANK_FORM = {
  source:"UWorld", form_block:"", question_number:"", system:"Cardiovascular",
  subject:"Physiology", topic:"", difficulty:"Medium", user_answer:"",
  correct_answer:"", mistake_type:"Concept Gap", key_concept:"", takeaway:"", pearl:""
};

function LogMistakeScreen({ onSubmit }) {
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.topic || !form.user_answer || !form.correct_answer) return;
    onSubmit(form);
    setForm({ ...BLANK_FORM });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Field = ({ label, children }) => (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );

  const inputCls = "w-full bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-colors";
  const selectCls = inputCls + " appearance-none cursor-pointer";

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h2 className="text-lg font-bold text-white">Log a Mistake</h2>
        <p className="text-sm text-slate-400 mt-0.5">Turn every wrong answer into a learning asset.</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-900/40 border border-green-700/40 rounded-xl p-3 text-sm text-green-300">
          <CheckCircle size={16} /> Logged successfully — Weak Areas updated.
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Source">
            <select value={form.source} onChange={e => set("source", e.target.value)} className={selectCls}>
              {["UWorld","NBME","Other"].map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Difficulty">
            <select value={form.difficulty} onChange={e => set("difficulty", e.target.value)} className={selectCls}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Form / Block">
            <input value={form.form_block} onChange={e => set("form_block", e.target.value)} placeholder="Block 3" className={inputCls} />
          </Field>
          <Field label="Q Number">
            <input type="number" value={form.question_number} onChange={e => set("question_number", e.target.value)} placeholder="47" className={inputCls} />
          </Field>
        </div>

        <Field label="System">
          <select value={form.system} onChange={e => set("system", e.target.value)} className={selectCls}>
            {SYSTEMS.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>

        <Field label="Subject">
          <select value={form.subject} onChange={e => set("subject", e.target.value)} className={selectCls}>
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>

        <Field label="Topic *">
          <input value={form.topic} onChange={e => set("topic", e.target.value)} placeholder="e.g. Frank-Starling Mechanism" className={inputCls} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Your Answer *">
            <input value={form.user_answer} onChange={e => set("user_answer", e.target.value.toUpperCase())} placeholder="C" maxLength={1} className={inputCls} />
          </Field>
          <Field label="Correct Answer *">
            <input value={form.correct_answer} onChange={e => set("correct_answer", e.target.value.toUpperCase())} placeholder="A" maxLength={1} className={inputCls} />
          </Field>
        </div>

        <Field label="Mistake Type">
          <select value={form.mistake_type} onChange={e => set("mistake_type", e.target.value)} className={selectCls}>
            {MISTAKE_TYPES.map(m => <option key={m}>{m}</option>)}
          </select>
        </Field>

        <Field label="Key Concept (what was really being tested)">
          <textarea value={form.key_concept} onChange={e => set("key_concept", e.target.value)} rows={2} placeholder="The fundamental mechanism or concept this question tested..." className={inputCls + " resize-none"} />
        </Field>

        <Field label="Takeaway — in your own words">
          <textarea value={form.takeaway} onChange={e => set("takeaway", e.target.value)} rows={2} placeholder="How you'll remember this next time (don't copy UWorld)..." className={inputCls + " resize-none"} />
        </Field>

        <Field label="High-Yield Pearl">
          <textarea value={form.pearl} onChange={e => set("pearl", e.target.value)} rows={2} placeholder="The board-testable fact or clinical hook..." className={inputCls + " resize-none"} />
        </Field>

        <button
          onClick={handleSubmit}
          disabled={!form.topic || !form.user_answer || !form.correct_answer}
          className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Save to Question Log
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function FlashcardScreen({ flashcards, onRate }) {
  const due = flashcards.filter(f => f.due);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionRatings, setSessionRatings] = useState([]);

  const card = due[idx];

  const handleRate = (rating) => {
    onRate(card.id, rating);
    setSessionRatings(r => [...r, { topic: card.topic, rating }]);
    setFlipped(false);
    setTimeout(() => {
      if (idx + 1 >= due.length) setDone(true);
      else setIdx(i => i + 1);
    }, 200);
  };

  const restart = () => { setIdx(0); setFlipped(false); setDone(false); setSessionRatings([]); };

  if (due.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-900/40 border border-green-700/40 flex items-center justify-center">
          <CheckCircle size={28} className="text-green-400" />
        </div>
        <h2 className="text-lg font-bold text-white">All caught up!</h2>
        <p className="text-sm text-slate-400 max-w-xs">No cards are due right now. Log a mistake and convert it to a flashcard to keep the deck growing.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center py-8 space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-cyan-900/40 border border-cyan-700/40 flex items-center justify-center">
          <Star size={28} className="text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Session Complete!</h2>
          <p className="text-sm text-slate-400 mt-1">You reviewed {sessionRatings.length} cards</p>
        </div>
        <div className="w-full space-y-2">
          {sessionRatings.map((r, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-800/60 rounded-xl px-4 py-2.5">
              <span className="text-sm text-slate-300">{r.topic}</span>
              <Badge color={r.rating >= 4 ? "green" : r.rating >= 3 ? "yellow" : "red"}>
                {["","Again","Hard","Good","Easy","Perfect"][r.rating]}
              </Badge>
            </div>
          ))}
        </div>
        <button onClick={restart} className="flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
          <RotateCcw size={14} /> Review again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Flashcards</h2>
          <p className="text-sm text-slate-400">{idx + 1} of {due.length} due</p>
        </div>
        <div className="flex gap-1">
          {due.map((_, i) => (
            <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i < idx ? "bg-cyan-500" : i === idx ? "bg-white" : "bg-slate-700"}`} />
          ))}
        </div>
      </div>

      {/* Card with 3D flip */}
      <div
        className="cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => !flipped && setFlipped(true)}
      >
        <div
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            position: "relative",
            minHeight: "280px",
          }}
        >
          {/* Front */}
          <div
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
            className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <Badge color="cyan">{card.system}</Badge>
              <span className="text-xs text-slate-500 font-mono">{card.id}</span>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Question</p>
              <p className="text-base text-slate-100 leading-relaxed">{card.front}</p>
            </div>
            <div className="mt-4 text-center">
              <span className="text-xs text-slate-500 italic">tap card to reveal answer</span>
            </div>
          </div>

          {/* Back */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
            className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-800/40 rounded-2xl p-6 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain size={14} className="text-cyan-400" />
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{card.topic}</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-1.5">
                {card.back.split("\n").map((line, i) => {
                  if (line.startsWith("•")) return <p key={i} className="text-sm text-slate-300 pl-2">{line}</p>;
                  if (line === "") return <div key={i} className="h-1" />;
                  return <p key={i} className={`text-sm ${i === 0 ? "font-semibold text-white" : "text-slate-300"}`}>{line}</p>;
                })}
              </div>
              {card.memory_trick && (
                <div className="mt-3 bg-amber-900/30 border border-amber-700/30 rounded-xl p-3">
                  <p className="text-xs font-bold text-amber-400 mb-1">🧠 Memory Trick</p>
                  <p className="text-xs text-amber-200/80 italic">{card.memory_trick}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rating buttons — only show when flipped */}
      <div className={`transition-all duration-300 ${flipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center mb-3">How well did you know this?</p>
        <div className="grid grid-cols-5 gap-2">
          {[
            { r:1, label:"Again", color:"bg-red-800/60 border-red-700/40 text-red-300 hover:bg-red-700/60" },
            { r:2, label:"Hard",  color:"bg-orange-800/60 border-orange-700/40 text-orange-300 hover:bg-orange-700/60" },
            { r:3, label:"Good",  color:"bg-yellow-800/60 border-yellow-700/40 text-yellow-300 hover:bg-yellow-700/60" },
            { r:4, label:"Easy",  color:"bg-green-800/60 border-green-700/40 text-green-300 hover:bg-green-700/60" },
            { r:5, label:"✓✓",   color:"bg-cyan-800/60 border-cyan-700/40 text-cyan-300 hover:bg-cyan-700/60" },
          ].map(({ r, label, color }) => (
            <button
              key={r}
              onClick={() => handleRate(r)}
              className={`border rounded-xl py-2.5 text-xs font-bold transition-colors ${color}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function ChatScreen({ weakAreas }) {
  const weakest = weakAreas[0]?.system || "Renal";
  const INIT = [
    { id:1, role:"bot", text:`Hey! I'm your Medical Mentor AI.\n\nI know your weakest system right now is **${weakest}** — want me to quiz you on it? Just say **"quiz me"** and I'll generate a clinical vignette.\n\nOr try: *"my weak topics"*, *"review my mistakes"*, or *"mentor mode"*.` }
  ];

  const [messages, setMessages] = useState(INIT);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const userMsg = { id: Date.now(), role: "user", text };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setTyping(true);
    const delay = 1200 + Math.random() * 800;
    setTimeout(() => {
      const response = getMockResponse(text);
      setTyping(false);
      setMessages(m => [...m, { id: Date.now() + 1, role: "bot", text: response }]);
    }, delay);
  }, [input]);

  const quickCmd = (cmd) => { setInput(cmd); inputRef.current?.focus(); };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Quick commands */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide flex-shrink-0">
        {["quiz me","my weak topics","review my mistakes","mentor mode"].map(c => (
          <button
            key={c}
            onClick={() => quickCmd(c)}
            className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/50 text-slate-300 hover:border-cyan-600/60 hover:text-cyan-300 transition-colors capitalize"
          >
            {c}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "bot" && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-600 to-teal-700 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                <Brain size={13} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-cyan-700/60 border border-cyan-600/30 text-white rounded-tr-sm"
                  : "bg-slate-800/80 border border-slate-700/40 text-slate-200 rounded-tl-sm"
              }`}
            >
              {m.role === "bot" ? <MarkdownText text={m.text} /> : <p>{m.text}</p>}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-600 to-teal-700 flex items-center justify-center mr-2 mt-1">
              <Brain size={13} className="text-white" />
            </div>
            <div className="bg-slate-800/80 border border-slate-700/40 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                {[0,1,2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-slate-400"
                    style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-3 flex-shrink-0">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask me anything or say 'quiz me'…"
          className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
        />
        <button
          onClick={send}
          disabled={!input.trim() || typing}
          className="w-11 h-11 rounded-2xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 flex items-center justify-center transition-colors flex-shrink-0"
        >
          <Send size={16} className={input.trim() && !typing ? "text-white" : "text-slate-500"} />
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function WeakAreasScreen({ weakAreas }) {
  const maxScore = Math.max(...weakAreas.map(w => w.weakness_score));

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h2 className="text-lg font-bold text-white">Weak Areas</h2>
        <p className="text-sm text-slate-400 mt-0.5">Systems ranked by error frequency × error rate.</p>
      </div>

      <div className="space-y-3">
        {weakAreas.map((w, i) => {
          const acc = pct(w.accuracy);
          const color = acc < 60 ? "bg-red-500" : acc < 75 ? "bg-yellow-500" : "bg-emerald-500";
          const textColor = acc < 60 ? "text-red-300" : acc < 75 ? "text-yellow-300" : "text-emerald-300";
          const borderColor = acc < 60 ? "border-red-800/40" : acc < 75 ? "border-yellow-800/40" : "border-emerald-800/40";

          return (
            <div key={w.system} className={`bg-slate-800/60 border ${borderColor} rounded-2xl p-4`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">#{i + 1}</span>
                    <span className="text-base font-semibold text-white">{w.system}</span>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-slate-500">
                    <span>{w.total} questions</span>
                    <span>·</span>
                    <span>{w.incorrect} wrong</span>
                  </div>
                </div>
                <span className={`text-xl font-black ${textColor}`}>{acc}%</span>
              </div>

              <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full ${color} rounded-full transition-all`}
                  style={{ width: `${acc}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="w-full h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-400/40 rounded-full"
                    style={{ width: `${(w.weakness_score / maxScore) * 100}%` }}
                  />
                </div>
                <span className="ml-3 text-xs text-slate-500 flex-shrink-0">Score: {w.weakness_score.toFixed(1)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-4 text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-400">How Weakness Score works</p>
        <p>Score = incorrect count × (1 − accuracy). High score = many errors AND consistently low accuracy.</p>
        <div className="flex gap-4 mt-2 pt-2 border-t border-slate-700/30">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/>&lt;60% — Critical</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"/>60–75% — Moderate</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>&gt;75% — Strong</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function QuestionLogScreen({ questionLog }) {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? questionLog
    : filter === "Incorrect" ? questionLog.filter(q => !q.correct)
    : questionLog.filter(q => q.correct);

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h2 className="text-lg font-bold text-white">Question Log</h2>
        <p className="text-sm text-slate-400 mt-0.5">{questionLog.length} entries total</p>
      </div>

      <div className="flex gap-2">
        {["All","Incorrect","Correct"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              filter === f
                ? "bg-cyan-800/60 border-cyan-600/50 text-cyan-300"
                : "bg-slate-800/60 border-slate-700/40 text-slate-400 hover:text-slate-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(q => (
          <div key={q.id} className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-lg ${q.correct ? "text-green-400" : "text-red-400"}`}>
                  {q.correct ? "✓" : "✗"}
                </span>
                <Badge color="cyan">{q.system}</Badge>
                {q.mistake_type && <Badge color="slate">{q.mistake_type}</Badge>}
              </div>
              <span className="text-xs text-slate-600 flex-shrink-0">{q.date}</span>
            </div>
            <p className="text-sm font-semibold text-white">{q.topic}</p>
            {q.pearl && (
              <div className="mt-2 bg-slate-900/60 rounded-xl p-2.5">
                <p className="text-xs text-slate-400"><span className="text-amber-400 font-semibold">Pearl: </span>{q.pearl}</p>
              </div>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
              <span>{q.source}</span>
              <span>·</span>
              <span>You: <strong className="text-slate-400">{q.user_answer}</strong></span>
              <span>·</span>
              <span>Correct: <strong className="text-slate-400">{q.correct_answer}</strong></span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-sm">
            No {filter.toLowerCase()} entries yet.
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function UpdatesScreen({ updates, loading }) {
  return (
    <div className="space-y-4 pb-6">
      <div>
        <h2 className="text-lg font-bold text-white">Updates & Materials</h2>
        <p className="text-sm text-slate-400 mt-0.5">Posted by the Medical Mentor team.</p>
      </div>

      {!firebaseReady && (
        <div className="bg-amber-950/30 border border-amber-800/40 rounded-2xl p-4 text-xs text-amber-200/80">
          Live updates aren't connected yet — this section will fill up automatically once Firebase is configured and the admin posts something.
        </div>
      )}

      {loading && <p className="text-sm text-slate-500">Loading…</p>}

      {!loading && updates.length === 0 && (
        <div className="text-center py-10 text-slate-500 text-sm">
          No updates yet. Check back soon.
        </div>
      )}

      <div className="space-y-3">
        {updates.map(u => (
          <div key={u.id} className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Megaphone size={13} className="text-purple-400" />
              <span className="text-xs text-slate-500">{u.date}</span>
            </div>
            <p className="text-sm font-semibold text-white">{u.title}</p>
            <p className="text-sm text-slate-300 mt-1 whitespace-pre-line">{u.body}</p>
            {u.link && (
              <a href={u.link} target="_blank" rel="noreferrer" className="inline-block mt-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300">
                Open resource →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id:"home",      label:"Home",      icon:Home },
  { id:"log",       label:"Log",       icon:Plus },
  { id:"flashcards",label:"Cards",     icon:CreditCard },
  { id:"chat",      label:"Mentor",    icon:MessageSquare },
  { id:"weakareas", label:"Weakness",  icon:BarChart2 },
  { id:"updates",   label:"Updates",   icon:Megaphone },
];

// ─── APP ROOT ────────────────────────────────────────────────────────────────

export default function MedicalMentorApp({ studentName = "there", onAdmin }) {
  const [screen, setScreen] = useState("home");
  const [questionLog, setQuestionLog] = useState(initialQuestionLog);
  const [weakAreas, setWeakAreas] = useState(initialWeakAreas);
  const [flashcards, setFlashcards] = useState(initialFlashcards);
  const [updates, setUpdates] = useState([]);
  const [updatesLoading, setUpdatesLoading] = useState(firebaseReady);

  // Live materials/updates from Firestore, posted by the admin panel.
  useEffect(() => {
    if (!firebaseReady) return;
    const q = query(collection(db, "materials"), orderBy("createdAt", "desc"), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      setUpdates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setUpdatesLoading(false);
    }, () => setUpdatesLoading(false));
    return () => unsub();
  }, []);

  // Recalculate weak areas whenever question log changes
  const updateWeakAreas = useCallback((log) => {
    const map = {};
    log.forEach(q => {
      if (!map[q.system]) map[q.system] = { total: 0, incorrect: 0 };
      map[q.system].total++;
      if (!q.correct) map[q.system].incorrect++;
    });
    const entries = Object.entries(map).map(([system, { total, incorrect }]) => {
      const accuracy = total > 0 ? (total - incorrect) / total : 1;
      const weakness_score = parseFloat((incorrect * (1 - accuracy)).toFixed(2));
      return { system, total, incorrect, accuracy, weakness_score, rank: 0 };
    });
    entries.sort((a, b) => b.weakness_score - a.weakness_score);
    entries.forEach((e, i) => e.rank = i + 1);
    setWeakAreas(prev => {
      const existing = prev.filter(w => !entries.find(e => e.system === w.system));
      return [...entries, ...existing].sort((a,b) => b.weakness_score - a.weakness_score).map((e,i) => ({...e, rank: i+1}));
    });
  }, []);

  const handleLogSubmit = (form) => {
    const correct = form.user_answer.toUpperCase() === form.correct_answer.toUpperCase();
    const newEntry = {
      id: `QID-${String(questionLog.length + 1).padStart(3, "0")}`,
      ...form,
      correct,
      date: today(),
      review_date: nextDate(7),
    };
    const updated = [...questionLog, newEntry];
    setQuestionLog(updated);
    updateWeakAreas(updated);
  };

  const handleCardRate = (cardId, rating) => {
    setFlashcards(cards => cards.map(c => {
      if (c.id !== cardId) return c;
      const newEF = Math.max(1.3, c.ef + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)));
      const newN = c.repetition + 1;
      const interval = rating === 1 ? 1 : newN === 1 ? 1 : newN === 2 ? 6 : Math.round(c.interval * newEF);
      const nextReview = nextDate(interval);
      return { ...c, ef: newEF, repetition: newN, interval, last_reviewed: today(), next_review: nextReview, due: false, difficulty_rating: rating };
    }));
  };

  const screenMap = {
    home:      <HomeDashboard questionLog={questionLog} weakAreas={weakAreas} flashcards={flashcards} setScreen={setScreen} studentName={studentName} updates={updates} />,
    log:       <LogMistakeScreen onSubmit={handleLogSubmit} />,
    flashcards:<FlashcardScreen flashcards={flashcards} onRate={handleCardRate} />,
    chat:      <ChatScreen weakAreas={weakAreas} />,
    weakareas: <WeakAreasScreen weakAreas={weakAreas} />,
    updates:   <UpdatesScreen updates={updates} loading={updatesLoading} />,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col max-w-md mx-auto relative">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
            <Stethoscope size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-white">Medical Mentor</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-800/60 rounded-full px-2.5 py-1 border border-slate-700/40">
            <Activity size={11} className="text-cyan-400" />
            <span className="text-xs text-slate-400">
              {Math.round(questionLog.filter(q=>q.correct).length / Math.max(1, questionLog.length) * 100)}% accuracy
            </span>
          </div>
          {onAdmin && (
            <button onClick={onAdmin} className="text-slate-600 hover:text-slate-400 transition-colors" title="Admin">
              <ShieldCheck size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-4 pt-2 pb-20">
        {screenMap[screen] || screenMap.home}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-slate-900/95 backdrop-blur border-t border-slate-800/80 flex z-50">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setScreen(id)}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
              screen === id ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon size={19} strokeWidth={screen === id ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium leading-tight">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
