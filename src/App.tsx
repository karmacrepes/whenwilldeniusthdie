import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Feather, Share2, BookOpen, Calendar as CalendarIcon, Sparkles, Eye, EyeOff, UserPlus, BarChart2,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine, BarChart, Bar,
} from "recharts";
import { DAY_NAMES, MONTHS, monthLabel, dayLabel, DAYS_PER_MONTH } from "./calendar";
import { fetchData, postSubmission, type Submission } from "./api";

/** v3: Crowd-sourced predictions; graph uses ONLY user data. Innworld calendar everywhere. */

type FormState = {
  username: string;
  cause: string;
  probability: number;
  era: string;
  year?: number;
  month_index: number;
  day_of_month: number;
  day_of_week_index: number;
};

const DEFAULT_FORM: FormState = {
  username: "",
  cause: "",
  probability: 50,
  era: "AF",
  year: undefined,
  month_index: 9,      // Evium as default
  day_of_month: 1,
  day_of_week_index: 1,
};

export default function App() {
  const character = "Deniusth";
  const [spoilers, setSpoilers] = useState(true);
  const [data, setData] = useState<{ submissions: Submission[]; aggregates: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const r = await fetchData(character);
      setData(r);
      setErr(null);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        character,
        username: form.username.trim(),
        cause: form.cause.trim(),
        probability: Math.max(0, Math.min(100, Math.round(form.probability))),
        era: form.era.trim() || "AF",
        year: form.year ?? undefined,
        month_index: form.month_index,
        month_name: monthLabel(form.month_index),
        day_of_month: form.day_of_month,
        day_of_week_index: form.day_of_week_index,
        day_of_week_name: dayLabel(form.day_of_week_index),
      };
      await postSubmission(payload as any);
      await load();
      setForm({ ...DEFAULT_FORM, username: form.username }); // keep name for convenience
    } catch (e: any) {
      alert(e?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Build chart datasets purely from server data
  const monthAverages = useMemo(() => {
    if (!data) return [];
    const map = new Map<number, { month_name: string; sum: number; count: number }>();
    for (const a of data.aggregates) {
      map.set(a.month_index, { month_name: a.month_name, sum: a.avg_probability * a.count, count: a.count });
    }
    // Ensure stable x-axis: always 1..16; show 0 if missing
    return MONTHS.map(m => ({
      month_index: m.index,
      month_name: m.name,
      avg_probability: map.has(m.index) ? Math.round((map.get(m.index)!.sum / map.get(m.index)!.count) * 10) / 10 : 0,
      count: map.get(m.index)?.count ?? 0,
    }));
  }, [data]);

  const recent = data?.submissions ?? [];

  return (
    <div className="min-h-screen w-full paper-bg">
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 160, damping: 16 }} className="p-2 rounded-md border bg-white/80" aria-hidden>
              <Feather className="w-6 h-6" color="#7a1e0a" />
            </motion.div>
            <div>
              <h1 className="display-serif text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: "#7a1e0a" }}>
                whenwill{character.toLowerCase()}die<span className="opacity-70">.com</span>
              </h1>
              <p className="text-stone-700 text-sm md:text-base">
                Crowd‑sourced Innworld divinations. Real data only — no mock prophecies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => setSpoilers(s => !s)} className="btn-ghost" aria-pressed={spoilers} title="Toggle spoilers">
              {spoilers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {spoilers ? "Spoilers: ON" : "Spoilers: OFF"}
            </button>
            <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="btn-ghost">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </header>

        <div className="my-4 hr-quill rounded" />

        {/* Submit form */}
        <section className="paper-card rounded-lg p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="w-5 h-5" />
            <h2 className="display-serif text-xl font-bold">Add your prediction</h2>
          </div>

          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="col-span-1 flex flex-col gap-1">
              <span className="text-sm text-stone-700">Username</span>
              <input required maxLength={50} value={form.username} onChange={e=>setForm({...form, username: e.target.value})} className="border rounded-md p-2 bg-white/80" placeholder="e.g., Maestro42" />
            </label>

            <label className="col-span-1 flex flex-col gap-1">
              <span className="text-sm text-stone-700">Probability (0–100%)</span>
              <input type="number" min={0} max={100} value={form.probability} onChange={e=>setForm({...form, probability: Number(e.target.value)})} className="border rounded-md p-2 bg-white/80" />
            </label>

            <label className="col-span-1 flex flex-col gap-1">
              <span className="text-sm text-stone-700">Era</span>
              <input value={form.era} onChange={e=>setForm({...form, era: e.target.value})} className="border rounded-md p-2 bg-white/80" placeholder="AF" />
            </label>

            <label className="col-span-1 flex flex-col gap-1">
              <span className="text-sm text-stone-700">Year (optional)</span>
              <input type="number" min={0} max={99999} value={form.year ?? ""} onChange={e=>setForm({...form, year: e.target.value ? Number(e.target.value) : undefined})} className="border rounded-md p-2 bg-white/80" placeholder="e.g., 1523" />
            </label>

            <label className="col-span-1 flex flex-col gap-1">
              <span className="text-sm text-stone-700">Month</span>
              <select value={form.month_index} onChange={e=>setForm({...form, month_index: Number(e.target.value)})} className="border rounded-md p-2 bg-white/80">
                {MONTHS.map(m => (<option key={m.index} value={m.index}>{m.index}. {m.name}</option>))}
              </select>
            </label>

            <label className="col-span-1 flex flex-col gap-1">
              <span className="text-sm text-stone-700">Day of Month (1–32)</span>
              <input type="number" min={1} max={DAYS_PER_MONTH} value={form.day_of_month} onChange={e=>setForm({...form, day_of_month: Number(e.target.value)})} className="border rounded-md p-2 bg-white/80" />
            </label>

            <label className="col-span-3 md:col-span-1 flex flex-col gap-1">
              <span className="text-sm text-stone-700">Day of Week</span>
              <select value={form.day_of_week_index} onChange={e=>setForm({...form, day_of_week_index: Number(e.target.value)})} className="border rounded-md p-2 bg-white/80">
                {DAY_NAMES.map(d => (<option key={d.index} value={d.index}>{d.index}. {d.name}</option>))}
              </select>
            </label>

            <label className="col-span-3 flex flex-col gap-1">
              <span className="text-sm text-stone-700">Cause (be fun; spoilers allowed)</span>
              <textarea required maxLength={280} value={form.cause} onChange={e=>setForm({...form, cause: e.target.value})} className="border rounded-md p-2 bg-white/80" placeholder="e.g., 'Attempts to solo a storm on the New Lands. The storm solos back.'"/>
            </label>

            <div className="col-span-3 flex items-center gap-3">
              <button className="btn-primary" disabled={submitting}>
                <UserPlus className="w-4 h-4" />
                {submitting ? "Submitting..." : "Submit prediction"}
              </button>
              <span className="text-xs text-stone-600">Your entry becomes part of the live chart. No RNG, no mock data.</span>
            </div>
          </form>
        </section>

        {/* Charts from REAL data */}
        <section className="grid grid-cols-1 md:grid-cols-5 gap-5 mt-6">
          <div className="paper-card rounded-lg p-6 md:col-span-3">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-5 h-5" />
              <h3 className="display-serif text-lg font-semibold">Average predicted probability by Innworld month</h3>
            </div>
            {loading ? (
              <div className="animate-pulse h-56 rounded bg-stone-200" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthAverages}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5dccb" />
                    <XAxis dataKey="month_index" tickFormatter={(i) => String(i)} stroke="#705d43" />
                    <YAxis stroke="#705d43" domain={[0, 100]} />
                    <Tooltip formatter={(v:any, n:any, p:any)=>[`${v}%`, `Avg (n=${p?.payload?.count ?? 0})`]} contentStyle={{ background: "#fffdf8", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, color: "#2b2b2b" }} labelFormatter={(i:any)=>MONTHS[i-1]?.name || `Month ${i}`} />
                    <Bar dataKey="avg_probability" />
                    <ReferenceLine y={50} stroke="#b3862b" strokeDasharray="4 4" />
                  </BarChart>
                </ResponsiveContainer>
                {monthAverages.every(m=>m.count===0) && (
                  <p className="text-stone-600 mt-3 text-sm">No submissions yet. Be the first to add a prediction!</p>
                )}
              </div>
            )}
          </div>

          <div className="paper-card rounded-lg p-6 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5" />
              <h3 className="display-serif text-lg font-semibold">Latest submissions</h3>
            </div>
            {loading ? (
              <div className="animate-pulse h-40 rounded bg-stone-200" />
            ) : (
              <ul className="space-y-3 max-h-72 overflow-auto pr-1">
                {recent.map(s => (
                  <li key={s.id} className="rounded border bg-white/70 p-3">
                    <div className="text-sm">
                      <span className="font-semibold">{s.username}</span> ·{" "}
                      <span>{s.era} {s.year ? s.year : "—"}, {s.month_name}, day {s.day_of_month} ({s.day_of_week_name})</span>
                    </div>
                    <div className="text-stone-700">{s.cause}</div>
                    <div className="text-xs text-stone-600 mt-1">P({character}) = {s.probability}%</div>
                  </li>
                ))}
                {recent.length===0 && <p className="text-stone-600 text-sm">No submissions yet.</p>}
              </ul>
            )}
          </div>
        </section>

        <footer className="mt-8 md:mt-10 text-sm text-stone-600">
          <p>Fan‑made parody. Not affiliated with the author of <em>The Wandering Inn</em>. Data displayed is user‑submitted.</p>
        </footer>
      </div>
    </div>
  );
}