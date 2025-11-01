
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Feather,
  Share2,
  BookOpen,
  Swords,
  Calendar as CalendarIcon,
  Sparkles,
  Eye,
  EyeOff,
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

/** Innworld‑styled RNG prophecy generator for Deniusth (spoilers allowed) **/

// Seeded RNG helpers
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
const between = (rng: () => number, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;
const pick = <T,>(rng: () => number, arr: T[]): T =>
  arr[Math.floor(rng() * arr.length)];
const pad = (n: number) => n.toString().padStart(2, "0");
const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const getQuerySeed = () => {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  return url.searchParams.get("seed");
};
const setQuerySeed = (seed: string) => {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("seed", seed);
  window.history.replaceState({}, "", url.toString());
};

// Innworld‑flavored causes (some with spoilers from New Lands arc)
type Cause = { text: string; spoiler?: boolean };
const CAUSES: Cause[] = [
  // Light/no‑spoiler Innworld vibes
  { text: "Refuses to retire; accountant raises Named‑Rank premiums until even fate gives up." },
  { text: "Duelist of Strings challenges a literal fate‑thread; becomes a metaphor and wanders off." },
  { text: "Scrying crash mid‑aria; error code: 'Destiny Not Found'." },
  { text: "Door duel. The Door wins. Eventually." },
  { text: "Commissioned to play for a city—accidentally inspires three revolutions and leaves before taxes arrive." },

  // Spoiler‑y (New Lands era and related cast)
  { text: "Barnethei schedules ‘just one’ retirement concert at the Haven; paperwork crit fails (permanent vacation).", spoiler: true },
  { text: "Colthei convinces him to solo during a storm on the New Lands. The storm solos back.", spoiler: true },
  { text: "Kraken‑Eater encore, strings vs. tentacles II. This time the audience brings towels.", spoiler: true },
  { text: "Valeterisa attempts to mathematically optimize a solo; a planar entity applauds and takes him to a seminar.", spoiler: true },
  { text: "Mihaela, Viecel, Eldertuin, Val—er—friends throw a 'please retire' party; he narrowly survives the speeches.", spoiler: true },
  { text: "Explorer’s Haven serves 'retire already' cake. It’s a trap: forms in triplicate.", spoiler: true },
  { text: "New Lands mana‑drain makes the violin sullen; Deniusth declares a tactical nap measured in decades.", spoiler: true },
  { text: "He out‑stares a Named rank, a Door, and destiny—only to trip over a dramatic entrance.", spoiler: true },
];

function buildProphecy(seed: string, spoilers: boolean) {
  const rng = makeRng(seed);

  const doomPercent = between(rng, 0, 100);
  const confidence = between(rng, 40, 97);

  const pool = CAUSES.filter(c => spoilers || !c.spoiler);
  const cause = pick(rng, pool).text;

  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() + 1);
  const end = new Date(now);
  end.setFullYear(end.getFullYear() + 50);
  const spanDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const dayOffset = between(rng, 0, spanDays);
  const predicted = new Date(start.getTime() + dayOffset * 24 * 60 * 60 * 1000);

  const never = doomPercent < 10 || /never/i.test(cause);

  const points: { month: string; risk: number }[] = [];
  const base = doomPercent;
  for (let i = 0; i < 12; i++) {
    const wobble = Math.floor(rng() * 30) - 15;
    const risk = Math.max(0, Math.min(100, base + wobble + Math.sin((i / 12) * Math.PI * 2) * 10));
    const month = new Date(now.getFullYear(), now.getMonth() + i, 1);
    points.push({ month: month.toLocaleString(undefined, { month: "short" }), risk: Math.round(risk) });
  }

  return { doomPercent, confidence, cause, predicted, never, points };
}

function useSeed(initialName = "Deniusth") {
  const [seed, setSeed] = useState<string>("");
  useEffect(() => {
    const fromQuery = getQuerySeed();
    const daily = `${initialName}-${new Date().toDateString()}`;
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
  const character = "Deniusth";
  const { seed, reseed } = useSeed(character);
  const [spoilers, setSpoilers] = useState(true);
  const prophecy = useMemo(() => (seed ? buildProphecy(seed, spoilers) : null), [seed, spoilers]);
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
    <div className="min-h-screen w-full paper-bg">
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 16 }}
              className="p-2 rounded-md border bg-white/80"
              aria-hidden
            >
              <Feather className="w-6 h-6" color="#7a1e0a" />
            </motion.div>
            <div>
              <h1 className="display-serif text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: "#7a1e0a" }}>
                whenwill{character.toLowerCase()}die<span className="opacity-70">.com</span>
              </h1>
              <p className="text-stone-700 text-sm md:text-base">A very serious Innworld divination engine. Contains jokes. May contain spoilers.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setSpoilers((s) => !s)}
              className="btn-ghost"
              aria-pressed={spoilers}
              title="Toggle spoilers"
            >
              {spoilers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {spoilers ? "Spoilers: ON" : "Spoilers: OFF"}
            </button>
            <button onClick={share} className="btn-ghost">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </header>

        <div className="my-4 hr-quill rounded" />

        {/* Hero blurb */}
        <section className="paper-card rounded-lg p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5" />
            <h2 className="display-serif text-xl font-bold">Reading the Threads</h2>
          </div>
          <p className="dropcap text-stone-800 leading-relaxed">
            The Duelist of Strings steps onto a new stage in the New Lands; the audience includes storms, doors, and destiny itself.
            Our reputable augurs roll dice, squint at tea leaves, and consult a Door before presenting this very accurate forecast.
          </p>
        </section>

        {/* Forecast & Meter */}
        <section className="grid grid-cols-1 md:grid-cols-5 gap-5 mt-6">
          {/* Prophecy */}
          <div className="paper-card rounded-lg p-6 md:col-span-3">
            <div className="flex items-center gap-2 mb-3">
              <CalendarIcon className="w-5 h-5" />
              <h3 className="display-serif text-lg font-semibold">The Divination</h3>
            </div>
            {!prophecy ? (
              <div className="animate-pulse h-24 rounded bg-stone-200" />
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-stone-600 text-sm">
                      Predicted fate‑date for <span className="font-semibold">{character}</span>:
                    </p>
                    <p className="text-3xl md:text-4xl display-serif font-extrabold tracking-tight" style={{ color: "#7a1e0a" }}>
                      {prophecy.never ? "NEVER (probably)" : fmtDate(prophecy.predicted)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-stone-500 text-xs">Confidence</p>
                    <p className="text-xl font-bold">{prophecy.confidence}%</p>
                  </div>
                </div>

                <div className="rounded-md border bg-white/70 p-4">
                  <div className="flex items-center gap-2 text-stone-700">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm">Most likely cause:</span>
                  </div>
                  <p className="mt-1 text-base md:text-lg">{prophecy.cause}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={reseed} className="btn-primary">
                    <Swords className="w-4 h-4" />
                    Spin a new fate
                  </button>
                  {copied && <span className="text-sm text-emerald-700">Link copied!</span>}
                </div>
              </div>
            )}
          </div>

          {/* Fate Thread Tension */}
          <div className="paper-card rounded-lg p-6 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Feather className="w-5 h-5" />
              <h3 className="display-serif text-lg font-semibold">Fate Thread Tension</h3>
            </div>
            {!prophecy ? (
              <div className="animate-pulse h-20 rounded bg-stone-200" />
            ) : (
              <div>
                <div className="text-4xl display-serif font-black tracking-tight" style={{ color: "#b3862b" }}>
                  {prophecy.doomPercent}
                  <span className="text-stone-500 text-xl">%</span>
                </div>
                <div className="h-3 w-full bg-stone-200 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${prophecy.doomPercent}%`,
                      background:
                        "linear-gradient(90deg, #b3862b, #7a1e0a)",
                    }}
                  />
                </div>
                <p className="mt-2 text-sm text-stone-600">
                  Totally legitimate estimate based on tea leaves, vibes, and a Door’s opinion.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Timeline */}
        <section className="paper-card rounded-lg p-6 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Swords className="w-5 h-5" />
            <h3 className="display-serif text-lg font-semibold">Next Twelve Moons</h3>
          </div>
          {!prophecy ? (
            <div className="animate-pulse h-56 rounded bg-stone-200" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prophecy.points} margin={{ left: 8, right: 12, top: 12, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5dccb" />
                  <XAxis dataKey="month" stroke="#705d43" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#705d43" allowDecimals={false} domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#fffdf8", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, color: "#2b2b2b" }} labelStyle={{ color: "#2b2b2b" }} />
                  <Line type="monotone" dataKey="risk" stroke="#7a1e0a" strokeWidth={3} dot={{ r: 3, stroke: "#cdbfa5" }} activeDot={{ r: 5 }} />
                  <ReferenceLine y={50} stroke="#b3862b" strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-8 md:mt-10 text-sm text-stone-600">
          <p>
            Fan‑made parody. Not affiliated with the author of <em>The Wandering Inn</em>. Names belong to their creator. Spoilers may appear when enabled.
          </p>
        </footer>
      </div>
    </div>
  );
}
