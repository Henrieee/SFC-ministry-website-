"use client";
import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Countdown from "@/components/Countdown";
import { useAttendance } from "@/hooks/useAttendance";
import { useEventDetails } from "@/hooks/useEventDetails";
import { useUpcomingEvents } from "@/hooks/useUpcomingEvents";
import EventCard from "@/components/EventCard";

const EVENT_ID = "next-event";
const DEFAULT_TITLE = "Upcoming Event";

const QUICK_LINKS = [
  { href: "/football", icon: "⚽", label: "Football" },
  { href: "/formula-one", icon: "🏎️", label: "Formula One" },
  { href: "/devotionals", icon: "📖", label: "Devotionals" },
  { href: "/predictor", icon: "🏆", label: "Fan Zone" },
  { href: "/get-involved", icon: "🙌", label: "Support" },
  { href: "/about", icon: "ℹ️", label: "About" },
];

type LeaderEntry = {
  id: string;
  displayName: string;
  points: number;
};

export default function Home() {
  const { event } = useEventDetails(EVENT_ID);
  const { count, attending, processing, toggleAttendance } = useAttendance(EVENT_ID, 0);
  
  // Fetch 4 events so we definitely have 3 left after filtering out the current "Next Event"
  const { events: upcoming, loading: upcomingLoading } = useUpcomingEvents(4);

  const [leader, setLeader] = useState<LeaderEntry | null>(null);

  useEffect(() => {
    const q = query(collection(db, "leaderboard"), orderBy("points", "desc"), limit(1));
    const unsub = onSnapshot(q, (snap) => {
      const top = snap.docs[0];
      setLeader(top ? { id: top.id, ...(top.data() as Omit<LeaderEntry, "id">) } : null);
    });
    return () => unsub();
  }, []);

  return (
  <div className="home-hero">
      <main className="max-w-3xl mx-auto px-5 pt-6 pb-16">
        <span className="font-mono-sfc text-xs uppercase tracking-widest text-[var(--sfc-red)] font-bold">
          PCEA St. Andrew&apos;s Church, Nairobi
        </span>
        
        <h1 className="font-display text-4xl md:text-6xl leading-none my-4 text-[var(--text)]">
          Where the thrill of sport meets the <span className="text-[var(--sfc-red)]">greatest story</span>.
        </h1>
        
        <p className="text-[var(--text-dim)] mb-8 max-w-md">
          Football. Formula One. Fellowship. Real Fun.
          Every watch party is a doorway to community and to Christ.
        </p>

        {/* Next Event Card */}
        {event.title === DEFAULT_TITLE && event.venue === "TBD" ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 max-w-sm">
            <span className="font-mono-sfc text-[11px] uppercase tracking-wider text-[var(--sfc-red)] font-bold">
              Next Event
            </span>
            <div className="mt-4 text-sm text-[var(--text-dim)] leading-relaxed">
              No upcoming event scheduled — check back soon!
            </div>
          </div>
        ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 max-w-sm">
          <span className="font-mono-sfc text-[11px] uppercase tracking-wider text-[var(--sfc-red)] font-bold">
            Next Event
          </span>
          <div className="font-display text-lg my-2 text-[var(--text)]">{event?.title ?? "Loading event..."}</div>
          <div className="text-xs text-[var(--text-dim)] mb-2">{event?.venue ?? "TBD"}</div>
          <div className="text-[var(--text-dim)] text-[10px] uppercase tracking-[0.3em] mb-4">
            {event?.dateLabel ?? "Coming Soon"}
          </div>
          
          {event?.date && <Countdown targetDate={event.date} />}
          
          <div className="flex items-center justify-between mt-4">
            <div className="font-mono-sfc text-xs text-[var(--text-dim)]">
              <b className="text-[var(--text)] text-sm">{count === null ? "…" : count}</b> Attending
            </div>
            <button
              onClick={toggleAttendance}
              disabled={processing}
              className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wide transition-all ${
                attending ? "bg-green-700 text-white" : "bg-[var(--sfc-red)] text-white"
              } ${processing ? "opacity-60 cursor-not-allowed" : "hover:brightness-110 active:scale-[0.98]"}`}
            >
              {processing ? "Saving…" : attending ? "✓ Attending" : "Attending"}
            </button>
          </div>
        </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link 
            href="/predictor"
            className="inline-flex items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--border)] px-5 py-3 text-sm font-bold text-[var(--text)] transition hover:bg-[var(--sfc-red)] hover:text-white hover:border-[var(--sfc-red)] active:scale-[0.98]"
          >
            Make your prediction
          </Link>
          <Link 
            href="/about"
            className="inline-flex items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--border)] px-5 py-3 text-sm font-bold text-[var(--text)] transition hover:bg-[var(--surface2)] active:scale-[0.98]"
          >
            Visit us
          </Link>
        </div>

        {/* Explore Grid */}
        <div className="mt-10">
          <h3 className="font-display text-lg mb-4 text-[var(--text)]">Explore SFC</h3>
          <div className="quick-grid">
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="quick-card">
                <div className="ic">{link.icon}</div>
                <div className="lbl text-[var(--text)]">{link.label}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Events Section */}
        <div className="mt-8">
          <h3 className="font-display text-lg mb-4 text-[var(--text)]">Upcoming Watch Parties</h3>
          {/* Changed sm:grid-cols-2 to sm:grid-cols-3 to fit the third card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {upcomingLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-40 rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4 animate-pulse" />
                ))
              : (upcoming || [])
                  .filter((ev) => ev.id !== EVENT_ID)
                  .slice(0, 3) // Ensures exactly 3 cards maximum show up
                  .map((ev) => <EventCard key={ev.id} ev={ev} />)}
          </div>
        </div>
      </main>
    </div>
  );
}