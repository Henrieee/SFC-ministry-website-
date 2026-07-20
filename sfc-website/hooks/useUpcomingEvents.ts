"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NEXT_EVENT } from "@/lib/nextEvent";

export type UpcomingEvent = {
  id: string;
  title: string;
  date: string;
  venue: string;
  dateLabel: string;
};

export function useUpcomingEvents(max = 3) {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const col = collection(db, "events");
    const q = query(col, orderBy("date", "asc"), limit(max));
    const unsub = onSnapshot(q, (snap) => {
      const items: UpcomingEvent[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        let dateVal = data.date ?? NEXT_EVENT.date;
        // normalize Firestore Timestamp to ISO string
        if (
          dateVal &&
          typeof dateVal === "object" &&
          "toDate" in dateVal &&
          typeof (dateVal as { toDate: () => Date }).toDate === "function"
        ) {
          dateVal = (dateVal as { toDate: () => Date }).toDate().toISOString();
        }

        items.push({
          id: doc.id,
          title: data.title ?? NEXT_EVENT.title,
          date: dateVal,
          venue: data.venue ?? NEXT_EVENT.venue,
          dateLabel: data.dateLabel ?? NEXT_EVENT.dateLabel,
        });
      });
      // If there are fewer than `max` events, pad with defaults so UI stays stable
      while (items.length < max) {
        items.push({ id: `placeholder-${items.length}`, ...NEXT_EVENT });
      }
      setEvents(items.slice(0, max));
      setLoading(false);
    });

    return () => unsub();
  }, [max]);

  return { events, loading };
}
