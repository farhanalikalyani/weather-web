import { useEffect, useState } from "react";
import {
  ShieldCheck, LogOut, ArrowLeft, Plus, Trash2, Megaphone, Users, AlertTriangle, CheckCircle,
} from "lucide-react";
import { auth, db, firebaseReady, ADMIN_EMAIL } from "../firebase";
import {
  onAuthStateChanged, signInWithEmailAndPassword, signOut,
  createUserWithEmailAndPassword, sendPasswordResetEmail,
} from "firebase/auth";
import {
  collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp,
} from "firebase/firestore";

function LoginForm() {
  const [mode, setMode] = useState("signin"); // signin | signup | reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const notAdmin = () => "Only the approved admin account can access this panel.";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const trimmedEmail = email.trim();

    if (trimmedEmail !== ADMIN_EMAIL) {
      setError(notAdmin());
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        const cred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        if (cred.user.email !== ADMIN_EMAIL) {
          await signOut(auth);
          setError(notAdmin());
        }
      } else if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        if (cred.user.email !== ADMIN_EMAIL) {
          await signOut(auth);
          setError(notAdmin());
        }
      } else if (mode === "reset") {
        await sendPasswordResetEmail(auth, trimmedEmail);
        setInfo("Password reset email sent — check the inbox for " + trimmedEmail);
      }
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setError("An account already exists for this email — try signing in instead.");
      else if (err.code === "auth/weak-password") setError("Password should be at least 6 characters.");
      else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") setError("Incorrect email or password.");
      else if (err.code === "auth/user-not-found") setError("No account exists yet for this email — use \"Create admin account\" first.");
      else setError("Something went wrong — try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck size={20} className="text-cyan-400" />
          <h1 className="text-lg font-bold">Admin {mode === "signup" ? "sign up" : mode === "reset" ? "reset password" : "sign in"}</h1>
        </div>

        {!firebaseReady && (
          <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 text-xs text-amber-200/80 mb-4 flex gap-2">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            Firebase isn't configured yet in src/firebase.js — sign-in won't work until it is.
            See the README for setup steps.
          </div>
        )}

        <p className="text-xs text-slate-500 mb-4">
          Access is restricted to a single approved account. Everyone else — including anyone
          who tries to sign up here — will be rejected automatically.
        </p>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="imrannazeert@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
          />
          {mode !== "reset" && (
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
          {info && (
            <p className="text-xs text-green-400 flex items-center gap-1.5">
              <CheckCircle size={13} /> {info}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? "Working…" : mode === "signup" ? "Create admin account" : mode === "reset" ? "Send reset email" : "Sign in"}
          </button>
        </form>

        <div className="flex items-center justify-between mt-4 text-xs">
          {mode === "signin" ? (
            <>
              <button onClick={() => { setMode("reset"); setError(""); setInfo(""); }} className="text-slate-500 hover:text-slate-300 transition-colors">
                Forgot password?
              </button>
              <button onClick={() => { setMode("signup"); setError(""); setInfo(""); }} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                First time? Create admin account
              </button>
            </>
          ) : (
            <button onClick={() => { setMode("signin"); setError(""); setInfo(""); }} className="text-slate-500 hover:text-slate-300 transition-colors">
              ← Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ user, onExit }) {
  const [tab, setTab] = useState("materials");
  const [materials, setMaterials] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [form, setForm] = useState({ title: "", body: "", link: "" });

  useEffect(() => {
    const q1 = query(collection(db, "materials"), orderBy("createdAt", "desc"));
    const unsub1 = onSnapshot(q1, (snap) => setMaterials(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const q2 = query(collection(db, "waitlist"), orderBy("createdAt", "desc"));
    const unsub2 = onSnapshot(q2, (snap) => setWaitlist(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsub1(); unsub2(); };
  }, []);

  const addMaterial = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    await addDoc(collection(db, "materials"), {
      title: form.title.trim(),
      body: form.body.trim(),
      link: form.link.trim() || null,
      date: new Date().toISOString().split("T")[0],
      createdAt: serverTimestamp(),
    });
    setForm({ title: "", body: "", link: "" });
  };

  const removeMaterial = async (id) => {
    await deleteDoc(doc(db, "materials", id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <ShieldCheck size={18} className="text-cyan-400" />
          <span className="font-semibold">Admin — {user.email}</span>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5"
        >
          <LogOut size={14} /> Sign out
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-8">
          {[
            { id: "materials", label: "Updates & Materials", icon: Megaphone },
            { id: "waitlist", label: `Waitlist (${waitlist.length})`, icon: Users },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border transition-colors ${
                tab === t.id
                  ? "bg-cyan-800/60 border-cyan-600/50 text-cyan-300"
                  : "bg-slate-900/60 border-slate-700/40 text-slate-400"
              }`}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        {tab === "materials" && (
          <div className="space-y-8">
            <form onSubmit={addMaterial} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3">
              <p className="text-sm font-semibold text-white">Post an update or resource</p>
              <p className="text-xs text-slate-500">
                This appears instantly in the "Updates" tab of the app for every visitor —
                announcements, new study material, launch news, whatever the site needs to say.
              </p>
              <input
                required
                placeholder="Title (e.g. 'New Renal flashcard pack is live')"
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-slate-950/60 border border-slate-700/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
              />
              <textarea
                required
                rows={3}
                placeholder="Details…"
                value={form.body}
                onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))}
                className="w-full bg-slate-950/60 border border-slate-700/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 resize-none"
              />
              <input
                placeholder="Optional link (https://…)"
                value={form.link}
                onChange={(e) => setForm(f => ({ ...f, link: e.target.value }))}
                className="w-full bg-slate-950/60 border border-slate-700/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
              />
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
              >
                <Plus size={15} /> Publish
              </button>
            </form>

            <div className="space-y-2">
              {materials.map((m) => (
                <div key={m.id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{m.title}</p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{m.body}</p>
                    <p className="text-[11px] text-slate-600 mt-1">{m.date}</p>
                  </div>
                  <button
                    onClick={() => removeMaterial(m.id)}
                    className="flex-shrink-0 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {materials.length === 0 && (
                <p className="text-sm text-slate-600 text-center py-6">Nothing posted yet.</p>
              )}
            </div>
          </div>
        )}

        {tab === "waitlist" && (
          <div className="space-y-2">
            {waitlist.map((w) => (
              <div key={w.id} className="bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300">
                {w.email}
              </div>
            ))}
            {waitlist.length === 0 && (
              <p className="text-sm text-slate-600 text-center py-6">No signups yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPanel({ onExit }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out

  useEffect(() => {
    if (!firebaseReady) { setUser(null); return; }
    return onAuthStateChanged(auth, (u) => {
      setUser(u && u.email === ADMIN_EMAIL ? u : null);
    });
  }, []);

  if (user === undefined) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 text-sm">Loading…</div>;
  }
  if (!user) return <LoginForm />;
  return <AdminDashboard user={user} onExit={onExit} />;
}
