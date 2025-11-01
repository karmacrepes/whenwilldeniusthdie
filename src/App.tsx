import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Skull,
  Dice5,
  Share2,
  RefreshCw,
  Calendar as CalendarIcon,
  Swords,
  Sparkles,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

// ---------------------------------------------
// whenwilldeniutshdie.com — playful single-file app
// No spoilers. No malice. Just RNG-driven, affectionate parody.
// ---------------------------------------------

// Seeded RNG helpers (deterministic, shareable)
function cyrb128(str: string) {
  let h1 = 1779033703,
    h2 = 3144134277,
    h3 = 1013904242,
    h4 = 2773480762;
  for (let i = 0, k: number; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, h1 >>> 0, h2 >>> 0, h3 >>> 0];
}
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeRng(seedStr: string) {
  const [a] = cyrb128(seedStr);
  return mulberry32(a);
}

function between(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function fmtDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getQuerySeed(): string | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  return url.searchParams.get("seed");
}

function setQuerySeed(seed: string) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("seed", seed);
  window.history.replaceState({}, "", url.toString());
}

// Silly, spoiler-safe causes (non-graphic, affectionate)
const CAUSES = [
  "outlives everyone by pure stubbornness (never)",
  "misreads a prophecy; prophecy leaves in protest",
  "duels a weather pattern and wins — retirement ensues",
  "critical failure while dramatically pointing at a map",
  "plot armor upgrade patches in; devs forget to nerf it",
  "caught by a scheduling conflict with destiny",
  "slips on a cursed banana in a very serious meeting",
  "loses a staring contest with a Door (the Door wins)",
  "trips over foreshadowing in chapter three thousand",
  "retires to open a tiny sea-salt and chess café",
  "becomes a recurring metaphor; corporeal form optional",
  "paper cut from an epic contract (heals instantly, phew)",
  "vanishes into a side quest that became a franchise",
  "absconds with the soundtrack; story pauses respectfully",
  "goes fishing, befriends the storm, forgets to perish",
];

// Tone badges
const BADGES = [
  { label: "totally scientific", class: "bg-emerald-600/15 text-emerald-400" },
  { label: "low-spoiler", class: "bg-blue-600/15 text-blue-400" },
  { label: "affectionate parody", class: "bg-pink-600/15 text-pink-400" },
  { label: "rng certified", class: "bg-purple-600/15 text-purple-400" },
];

// Build a prophecy from a seed
function buildProphecy(seed: string) {
  const rng = makeRng(seed);

  const doomPercent = between(rng, 0, 100);
  const confidence = between(rng, 40, 97);
  const cause = pick(rng, CAUSES);

  // Date range: tomorrow .. 50 years from now
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() + 1);
  const end = new Date(now);
  end.setFullYear(end.getFullYear() + 50);
  const spanDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const dayOffset = between(rng, 0, spanDays);
  const predicted = new Date(start.getTime() + dayOffset * 24 * 60 * 60 * 1000);

  // Occasionally declare "never" because comedy
  const never = doomPercent < 7 || /never/i.test(cause);

  // Build 12-month risk timeline
  const points = [] as { month: string; risk: number }[];
  const base = doomPercent;
  for (let i = 0; i < 12; i++) {
    // gentle wobbles
    const wobble = Math.floor(rng() * 30) - 15; // -15..15
    const risk = Math.max(0, Math.min(100, base + wobble + Math.sin((i / 12) * Math.PI * 2) * 10));
    const month = new Date(now.getFullYear(), now.getMonth() + i, 1);
    points.push({ month: month.toLocaleString(undefined, { month: "short" }), risk: Math.round(risk) });
  }

  return {
    doomPercent,
    confidence,
    cause,
    predicted,
    never,
    points,
  };
}

function useSeed(initialName = "Deniutsh") {
  const [seed, setSeed] = useState<string>("");

  useEffect(() => {
    const fromQuery = getQuerySeed();
    const daily = `${initialName}-${new Date().toDateString()}`; // stable today
    const s = fromQuery || daily;
    setSeed(s);
    if (!fromQuery) setQuerySeed(encodeURIComponent(s));
  }, [initialName]);

  const reseed = () => {
    const s = `${initialName}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setSeed(s);
    setQuerySeed(encodeURIComponent(s));
  };

  return { seed, reseed };
}

export default function App() {
  const character = "Deniutsh"; // spelled per request
  const { seed, reseed } = useSeed(character);
  const prophecy = useMemo(() => (seed ? buildProphecy(seed) : null), [seed]);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
      alert("Link copy failed — you can copy from the address bar.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div initial={{ rotate: -10, scale: 0.9 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 14 }} className="p-2 rounded-2xl bg-slate-800/70 shadow-inner">
              <Skull className="w-6 h-6" aria-hidden />
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">whenwill{character.toLowerCase()}die<span className="opacity-70">.com</span></h1>
              <p className="text-slate-400 text-sm md:text-base">Bad predictions, good vibes. 100% spoiler-safe and extremely scientific.*</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {BADGES.slice(0, 3).map((b) => (
              <span key={b.label} className={`hidden md:inline-block text-xs px-2.5 py-1 rounded-full border border-white/5 ${b.class}`}>{b.label}</span>
            ))}
          </div>
        </header>

        {/* Hero */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-5">
          {/* Prophecy Card */}
          <motion.div layout className="md:col-span-3 rounded-2xl bg-slate-900/60 border border-white/5 shadow-xl overflow-hidden">
            <div className="p-5 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <CalendarIcon className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-semibold">The Prophecy</h2>
              </div>

              {!prophecy ? (
                <div className="animate-pulse h-24 bg-slate-800/40 rounded-xl" />
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-slate-400 text-sm">Predicted date for <span className="font-semibold text-slate-200">{character}</span>:</p>
                      <p className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        {prophecy.never ? "NEVER (probably)" : fmtDate(prophecy.predicted)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs">Confidence</p>
                      <p className="text-xl font-bold">{prophecy.confidence}%</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-800/60 p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-slate-300"><Sparkles className="w-4 h-4" /><span className="text-sm">Cause (spoiler-free):</span></div>
                    <p className="mt-1 text-base md:text-lg">{prophecy.cause}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button onClick={reseed} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[.99] transition shadow-md">
                      <Dice5 className="w-4 h-4" />
                      Spin prophecy
                    </button>
                    <button onClick={share} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 transition">
                      <Share2 className="w-4 h-4" />
                      Copy shareable link
                    </button>
                    {copied && <span className="text-sm text-emerald-400">Link copied!</span>}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 md:px-6 py-3 text-[11px] text-slate-400/80 bg-slate-950/40 border-t border-white/5 flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              *This is a parody for a fictional character. No spoilers, no ill will. Refresh for new RNG!
            </div>
          </motion.div>

          {/* Doom Meter */}
          <motion.div layout className="md:col-span-2 rounded-2xl bg-slate-900/60 border border-white/5 shadow-xl p-5 md:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Skull className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-semibold">Doom‑O‑Meter</h2>
            </div>
            {!prophecy ? (
              <div className="animate-pulse h-20 bg-slate-800/40 rounded-xl" />
            ) : (
              <div>
                <div className="text-4xl font-black tracking-tight">{prophecy.doomPercent}<span className="text-slate-400 text-xl">%</span></div>
                <div className="h-3 w-full bg-slate-800/60 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500"
                    style={{ width: `${prophecy.doomPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-400">Totally legitimate risk estimate derived from tea leaves, vibes, and one (1) dice roll.</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  {BADGES.map((b) => (
                    <span key={b.label} className={`text-center px-2 py-1 rounded-lg border border-white/5 ${b.class}`}>{b.label}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </section>

        {/* Timeline Chart */}
        <section className="mt-6 rounded-2xl bg-slate-900/60 border border-white/5 shadow-xl p-5 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Swords className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold">Prophetic Timeline (next 12 months)</h2>
          </div>
          {!prophecy ? (
            <div className="animate-pulse h-56 bg-slate-800/40 rounded-xl" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prophecy.points} margin={{ left: 8, right: 12, top: 12, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" allowDecimals={false} domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }} labelStyle={{ color: "#cbd5e1" }} />
                  <Line type="monotone" dataKey="risk" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 3, stroke: "#111827" }} activeDot={{ r: 5 }} />
                  <ReferenceLine y={50} stroke="#334155" strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-8 md:mt-10 text-sm text-slate-400">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <p>
              Built with love for readers. Character names are property of their creator. This page is a joke and avoids spoilers.
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 transition">
                <RefreshCw className="w-4 h-4" />
                Back to top
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}