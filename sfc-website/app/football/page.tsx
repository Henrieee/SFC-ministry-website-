"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Countdown from "@/components/Countdown";

type FootballFixture = {
  id: string;
  league: string;
  home: string;
  away: string;
  date: string;
  venue: string;
  baseCount: number;
};

function getFallbackFixtures(): FootballFixture[] {
  return [
    {
      id: "f1",
      league: "Premier League",
      home: "Arsenal",
      away: "Chelsea",
      date: new Date(Date.now() + 4 * 86400000).toISOString(),
      venue: "Fellowship Hall",
      baseCount: 112,
    },
    {
      id: "f2",
      league: "Premier League",
      home: "Man United",
      away: "Tottenham",
      date: new Date(Date.now() + 18 * 86400000).toISOString(),
      venue: "Fellowship Hall",
      baseCount: 64,
    },
  ];
}

const FILTERS = [
  "Premier League",
  "Champions League",
  "FA Cup",
  "Europa League",
  "International",
  "Kenya Premier League",
];

const FALLBACK_FILTER = "Premier League";

function FixtureCard({ fixture }: { fixture: FootballFixture }) {
  return (
    <div className="rounded-[32px] overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-[0_30px_80px_-50px_rgba(0,0,0,0.75)] flex flex-col justify-between">
      <div>
        {/* Header Ribbon */}
        <div className="relative bg-[rgba(255,255,255,0.03)] border-b border-[var(--border)] px-6 py-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(227,27,35,0.18)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--sfc-red)]">
            {fixture.league}
          </span>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-[rgba(248,248,248,0.06)] p-3 text-xl">
            ⚽
          </div>
        </div>
        
        {/* Match Details */}
        <div className="px-6 py-6">
          <div className="font-display text-xl sm:text-2xl leading-tight tracking-tight">
            <span className="text-[var(--text)]">{fixture.home}</span>
            <span className="mx-3 text-[var(--text-dim)] font-normal text-lg sm:text-xl">vs</span>
            <span className="text-[var(--text)]">{fixture.away}</span>
          </div>
          
          <div className="mt-4 space-y-1 text-xs sm:text-sm text-[var(--text-dim)]">
            <div className="flex items-center gap-1.5 font-medium text-[var(--text)]">
              📅 {new Date(fixture.date).toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="flex items-center gap-1.5 opacity-80">
              📍 {fixture.venue}
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Footer Box */}
      <div className="px-6 pb-6 mt-2">
        <div className="rounded-2xl bg-[var(--surface2)] border border-[var(--border)] p-3.5 text-center">
          <div className="font-mono-sfc text-xs uppercase tracking-widest text-[var(--sfc-red)] font-bold mb-1">
            Kickoff Countdown
          </div>
          <div className="font-mono-sfc text-base font-bold text-[var(--text)]">
            <Countdown targetDate={fixture.date} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FootballPage() {
  const [activeFilter, setActiveFilter] = useState(FALLBACK_FILTER);
  const [fixtures, setFixtures] = useState<FootballFixture[]>(() => getFallbackFixtures());

  useEffect(() => {
    const q = query(collection(db, "footballFixtures"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FootballFixture, "id">) }));
      setFixtures(docs.length > 0 ? docs : getFallbackFixtures());
    });
    return () => unsub();
  }, []);

  const visibleFixtures = fixtures.filter((fixture) => fixture.league === activeFilter);

  return (
    <main className="max-w-6xl mx-auto px-5 py-16">
      {/* Page Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-3 rounded-full bg-[rgba(255,255,255,0.05)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--sfc-red)] font-bold">
          <span>⚽</span>
          Football
        </div>
        <h1 className="font-display text-4xl sm:text-5xl mt-6 mb-4">Fixtures &amp; watch parties</h1>
        <p className="max-w-3xl text-[var(--text-dim)] text-base sm:text-lg leading-relaxed">
          Premier League, Champions League, FA Cup, Europa League and international football — every screening in one place.
        </p>
      </div>

      {/* 📱 Updated Filter Tabs: Grid layout on mobile, Flex row on tablets/desktops */}
      <div className="mb-10 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-200 w-full sm:w-auto ${
              activeFilter === filter
                ? "bg-[var(--sfc-red)] text-white shadow-md"
                : "bg-[rgba(255,255,255,0.05)] text-[var(--text-dim)] border border-transparent hover:border-[var(--border)] hover:bg-[rgba(255,255,255,0.08)]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Fixtures Layout */}
      {visibleFixtures.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {visibleFixtures.map((fixture) => (
            <FixtureCard key={fixture.id} fixture={fixture} />
          ))}
        </div>
      ) : (
        /* Empty State Content Block */
        <div className="rounded-[32px] border border-dashed border-[var(--border)] p-12 text-center bg-[rgba(255,255,255,0.01)]">
          <div className="text-3xl mb-3">📡</div>
          <h3 className="font-display text-lg text-[var(--text)] mb-1">No Watch Parties Scheduled</h3>
          <p className="text-sm text-[var(--text-dim)] max-w-sm mx-auto">
We don&apos;t have any upcoming {activeFilter} match screenings planned at the moment. Check back soon or browse other leagues!
          </p>
        </div>
      )}
    </main>
  );
}