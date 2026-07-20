"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Countdown from "@/components/Countdown";

type F1Race = {
  id: string;
  name: string;
  circuit: string;
  date: string;
  sessions: string;
  baseCount: number;
};

type DriverStanding = {
  id: string;
  position: number;
  driver: string;
  team: string;
  points: number;
};

function getFallbackRaces(): F1Race[] {
  return [
    {
      id: "r1",
      name: "Belgian Grand Prix",
      circuit: "Circuit de Spa-Francorchamps",
      date: new Date(Date.now() + 2 * 86400000).toISOString(),
      sessions: "FP1 · FP2 · Qualifying · Sprint · Race",
      baseCount: 88,
    },
    {
      id: "r2",
      name: "Dutch Grand Prix",
      circuit: "Circuit Zandvoort",
      date: new Date(Date.now() + 23 * 86400000).toISOString(),
      sessions: "FP1 · FP2 · FP3 · Qualifying · Race",
      baseCount: 41,
    },
  ];
}

const FALLBACK_STANDINGS: DriverStanding[] = [
  { id: "1", position: 1, driver: "K. Antonelli", team: "Mercedes", points: 179 },
  { id: "2", position: 2, driver: "G. Russell", team: "Mercedes", points: 154 },
  { id: "3", position: 4, driver: "L. Hamilton", team: "Ferrari", points: 147 },
  { id: "4", position: 3, driver: "C. Leclerc", team: "Ferrari", points: 108 },
  { id: "5", position: 5, driver: "L. Norris", team: "McLaren", points: 97 },
];

function RaceCard({ race }: { race: F1Race }) {
  const mounted = true;

  return (
    <div className="rounded-[32px] overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-[0_30px_80px_-50px_rgba(0,0,0,0.75)] flex flex-col justify-between w-full">
      <div>
        {/* Header Ribbon */}
        <div className="relative bg-[rgba(255,255,255,0.03)] border-b border-[var(--border)] px-5 sm:px-6 py-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(227,27,35,0.18)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--sfc-red)]">
            Grand Prix Weekend
          </span>
          <div className="absolute right-5 sm:right-6 top-1/2 -translate-y-1/2 rounded-full bg-[rgba(248,248,248,0.06)] p-3 text-xl">
            🏎️
          </div>
        </div>
        
        {/* Race Information */}
        <div className="px-5 sm:px-6 py-6">
          <h2 className="font-display text-xl sm:text-2xl leading-tight tracking-tight text-[var(--text)]">
            {race.name}
          </h2>
          
          <div className="mt-4 space-y-1.5 text-xs sm:text-sm text-[var(--text-dim)]">
            <div className="flex items-center gap-1.5 font-medium text-[var(--text)]">
              📍 {race.circuit}
            </div>
            <div className="flex items-center gap-1.5 opacity-80 pl-5">
              📅 {mounted ? (
                new Date(race.date).toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
              ) : (
                "Loading date..."
              )}
            </div>
            {/* Added flex-wrap here so long session lists don't break the layout */}
            <div className="flex flex-wrap items-center gap-1.5 opacity-60 pl-5 text-[11px] font-mono-sfc uppercase tracking-wider">
              <span>⚙️</span>
              <span>{race.sessions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Footer Box */}
      <div className="px-5 sm:px-6 pb-6 mt-2">
        <div className="rounded-2xl bg-[var(--surface2)] border border-[var(--border)] p-3.5 text-center w-full overflow-hidden">
          <div className="font-mono-sfc text-xs uppercase tracking-widest text-[var(--sfc-red)] font-bold mb-1">
            Lights Out Countdown
          </div>
          <div className="font-mono-sfc text-sm sm:text-base font-bold text-[var(--text)] break-words">
            <Countdown targetDate={race.date} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FormulaOnePage() {
  const [races, setRaces] = useState<F1Race[]>(() => getFallbackRaces());
  const [standings, setStandings] = useState<DriverStanding[]>(FALLBACK_STANDINGS);

  useEffect(() => {
    const q = query(collection(db, "formulaOneRaces"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<F1Race, "id">) }));
      setRaces(docs.length > 0 ? docs : getFallbackRaces());
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "driverStandings"), orderBy("position", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DriverStanding, "id">) }));
      setStandings(docs.length > 0 ? docs : FALLBACK_STANDINGS);
    });
    return () => unsub();
  }, []);

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-5 py-12 sm:py-16 overflow-x-hidden">
      {/* Page Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-3 rounded-full bg-[rgba(255,255,255,0.05)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--sfc-red)] font-bold">
          <span>🏁</span>
          Formula One
        </div>
        <h1 className="font-display text-4xl sm:text-5xl mt-6 mb-4">Race calendar</h1>
        <p className="max-w-2xl text-[var(--text-dim)] text-base sm:text-lg leading-relaxed">
          Practice, qualifying and race day — join the community for every grand prix weekend screening.
        </p>
      </div>

      {/* Race Grid Container */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mb-16 w-full">
        {races.map((r) => (
          <RaceCard key={r.id} race={r} />
        ))}
      </div>

      {/* Championship Standings Block */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.03)] border border-[var(--border)] px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--sfc-red)]">
          Season Standings
        </div>
      </div>
      
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.75)] overflow-hidden w-full">
        <h2 className="font-display text-xl sm:text-2xl mb-4 text-[var(--text)]">
          Drivers&apos; Championship
        </h2>
        
        {/* Table Wrapper locked to 100% width with internal scrolling */}
        <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
          <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="text-[var(--text-dim)] text-xs uppercase border-b border-[var(--border)]">
                <th className="pb-3 pl-2 w-12">Pos</th>
                <th className="pb-3 px-3">Driver</th>
                <th className="pb-3 px-3">Team</th>
                <th className="pb-3 pr-2 text-right w-16">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing) => (
                <tr key={standing.id} className="border-b border-[rgba(255,255,255,0.04)] last:border-0 hover:bg-[rgba(255,255,255,0.01)] transition">
                  <td className="py-3.5 pl-2 font-mono-sfc font-bold text-[var(--text-dim)]">
                    {standing.position === 1 ? "🥇" : standing.position === 2 ? "🥈" : standing.position === 3 ? "🥉" : standing.position}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-[var(--text)]">{standing.driver}</td>
                  <td className="py-3.5 px-3 text-[var(--text-dim)]">{standing.team}</td>
                  <td className="py-3.5 pr-2 font-mono-sfc text-right font-bold text-[var(--text)]">{standing.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}