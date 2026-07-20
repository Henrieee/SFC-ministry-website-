"use client";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NEXT_EVENT } from "@/lib/nextEvent";

export type EventDetails = {
  title: string;
  date: string;
  venue: string;
  dateLabel: string;
};

export function useEventDetails(eventId: string) {
  const [event, setEvent] = useState<EventDetails>(NEXT_EVENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, "events", eventId);
    const unsubscribe = onSnapshot(ref, (snap) => {
      const data = snap.data();
      if (data) {
        let dateVal = data.date ?? NEXT_EVENT.date;
        if (
          dateVal &&
          typeof dateVal === "object" &&
          "toDate" in dateVal &&
          typeof (dateVal as { toDate: () => Date }).toDate === "function"
        ) {
          dateVal = (dateVal as { toDate: () => Date }).toDate().toISOString();
        }

        setEvent({
          title: data.title ?? NEXT_EVENT.title,
          date: dateVal,
          venue: data.venue ?? NEXT_EVENT.venue,
          dateLabel: data.dateLabel ?? NEXT_EVENT.dateLabel,
        });
      } else {
        setEvent(NEXT_EVENT);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [eventId]);

  return { event, loading };
}
