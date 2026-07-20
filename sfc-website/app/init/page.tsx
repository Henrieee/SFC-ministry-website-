"use client";
import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function InitFirestorePage() {
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    async function init() {
      setStatus("working");
      try {
        await setDoc(doc(db, "events", "next-event"), { attending: 112 }, { merge: true });
        setStatus("done");
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        // show the error so the developer can debug env/config issues
        console.error(err);
        setStatus("error: " + message);
      }
    }
    init();
  }, []);

  return (
    <main className="max-w-3xl mx-auto px-5 py-16">
      <h1 className="font-display text-2xl mb-4">Initialize Firestore</h1>
      <p className="mb-2">This route will create or merge the document <code>events/next-event</code> with an initial <code>attending</code> value.</p>
      <div className="rounded-md p-4 bg-[var(--surface)] border border-[var(--border)]">
        <div className="font-mono-sfc text-sm">Status: <strong>{status}</strong></div>
        <p className="text-xs text-[var(--text-dim)] mt-3">Ensure your `.env.local` has real Firebase values and restart the dev server before visiting this page.</p>
      </div>
    </main>
  );
}
