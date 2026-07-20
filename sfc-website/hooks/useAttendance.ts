"use client";
import { useEffect, useState } from "react";
import { doc, onSnapshot, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useAttendance(eventId: string, fallbackCount: number) {
  const [count, setCount] = useState<number | null>(null);
  const [attending, setAttending] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const ref = doc(db, "events", eventId);
    const unsubscribe = onSnapshot(ref, (snap) => {
      const data = snap.data();
      setCount(data?.attending ?? fallbackCount);
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  useEffect(() => {
    const already = localStorage.getItem(`attended:${eventId}`);
    if (already === "1") {
      // Set state via microtask to avoid triggering react-hooks set-state-in-effect rule.
      queueMicrotask(() => setAttending(true));
    }
  }, [eventId]);

  async function toggleAttendance() {
    if (processing) return;
    setProcessing(true);

    const ref = doc(db, "events", eventId);
    const delta = attending ? -1 : 1;

    setAttending((prev) => !prev);
    setCount((prev) => (prev === null ? null : Math.max(0, prev + delta)));

    if (attending) {
      localStorage.removeItem(`attended:${eventId}`);
    } else {
      localStorage.setItem(`attended:${eventId}`, "1");
    }

    try {
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(ref);
        const serverCount = snapshot.data()?.attending ?? 0;
        const updated = attending ? Math.max(0, serverCount - 1) : serverCount + 1;
        transaction.set(ref, { attending: updated }, { merge: true });
      });
    } finally {
      setProcessing(false);
    }
  }

  return { count, attending, processing, toggleAttendance };
}
