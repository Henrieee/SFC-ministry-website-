"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NEXT_EVENT } from "@/lib/nextEvent";

export type UpcomingEvent = {
  id: string;
  title: string;
  date: string;
  venue: string;
  dateLabel: string;
  category?: string;
};

/** Normalise a date value that might be a string, number, or Firestore Timestamp */
function normaliseDate(raw: unknown): string {
  if (!raw) return NEXT_EVENT.date;
  if (typeof raw === "string") return raw;
  if (typeof raw === "number") return new Date(raw).toISOString();
  if (
    typeof raw === "object" &&
    raw !== null &&
    "toDate" in raw &&
    typeof (raw as { toDate: () => Date }).toDate === "function"
  ) {
    return (raw as { toDate: () => Date }).toDate().toISOString();
  }
  return NEXT_EVENT.date;
}

type Unsubscriber = () => void;

export function useUpcomingEvents(max = 3) {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const unsubs: Unsubscriber[] = [];

    // 1️⃣ Events collection
    const eventsQ = query(collection(db, "events"), orderBy("date", "asc"));
    const unsubEvents = onSnapshot(eventsQ, (snap) => {
      if (cancelled) return;
      const items: UpcomingEvent[] = [];

      snap.forEach((d) => {
        const data = d.data();
        const { id: _discard, ...rest } = data;
        items.push({
          id: d.id,
          title: rest.title ?? NEXT_EVENT.title,
          date: normaliseDate(rest.date),
          venue: rest.venue ?? NEXT_EVENT.venue,
          dateLabel: rest.dateLabel ?? NEXT_EVENT.dateLabel,
          category: rest.category ?? "Event",
        });
      });
      setEvents((prev) => mergeAndSort(prev, items, max));
      setLoading(false);
    });
    unsubs.push(unsubEvents);

    // 2️⃣ Football fixtures collection
    const fixturesQ = query(collection(db, "footballFixtures"), orderBy("date", "asc"));
    const unsubFixtures = onSnapshot(fixturesQ, (snap) => {
      if (cancelled) return;
      const items: UpcomingEvent[] = [];

      snap.forEach((d) => {
        const data = d.data() as { home?: string; away?: string; league?: string; date?: unknown; venue?: string };
        items.push({
          id: d.id,
          title: `⚽ ${data.home ?? "TBD"} vs ${data.away ?? "TBD"}`,
          date: normaliseDate(data.date),
          venue: data.venue ?? NEXT_EVENT.venue,
          dateLabel: data.league ?? "Football",
          category: "Football",
        });
      });
      setEvents((prev) => mergeAndSort(prev, items, max));
      setLoading(false);
    });
    unsubs.push(unsubFixtures);

    // 3️⃣ Formula One races collection
    const racesQ = query(collection(db, "formulaOneRaces"), orderBy("date", "asc"));
    const unsubRaces = onSnapshot(racesQ, (snap) => {
      if (cancelled) return;
      const items: UpcomingEvent[] = [];

      snap.forEach((d) => {
        const data = d.data() as { name?: string; circuit?: string; date?: unknown; sessions?: string };
        items.push({
          id: d.id,
          title: `🏁 ${data.name ?? "Grand Prix"}`,
          date: normaliseDate(data.date),
          venue: data.circuit ?? NEXT_EVENT.venue,
          dateLabel: data.sessions ?? "Formula One",
          category: "Formula One",
        });
      });
      setEvents((prev) => mergeAndSort(prev, items, max));
      setLoading(false);
    });
    unsubs.push(unsubRaces);

    return () => {
      cancelled = true;
      unsubs.forEach((fn) => fn());
    };
  }, [max]);

  return { events, loading };
}

/**
 * Merge new items from one collection into the full list, sort by date,
 * and trim/pad to the requested maximum.
 */
function mergeAndSort(
  current: UpcomingEvent[],
  incoming: UpcomingEvent[],
  max: number,
): UpcomingEvent[] {
  // Build a map keyed by id so we can replace items from the same doc
  const map = new Map<string, UpcomingEvent>();

  // Keep everything that isn't being replaced
  for (const item of current) {
    // Only keep items that aren't about to be overwritten
    if (!incoming.find((n) => n.id === item.id)) {
      map.set(item.id, item);
    }
  }

  // Insert / replace with incoming items (memoised by id)
  for (const item of incoming) {
    map.set(item.id, item);
  }

  const sorted = Array.from(map.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Pad with placeholders only when there are absolutely no real items, using a far-future date so they sort last
  if (sorted.length === 0) {
    while (sorted.length < max) {
      sorted.push({
        id: `placeholder-${sorted.length}`,
        ...NEXT_EVENT,
        date: "2099-12-31T23:59:59.000Z",
        category: "Event",
      });
    }
  }

  return sorted.slice(0, max);
}
