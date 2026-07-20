"use client";
import { FormEvent, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NEXT_EVENT } from "@/lib/nextEvent";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function eatDateTimeLocalFromIso(iso: string) {
  const date = new Date(iso);
  const utcMs = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
  // Using 3 hours offset for EAT
  const eat = new Date(utcMs + 3 * 60 * 60 * 1000);
  return `${eat.getUTCFullYear()}-${pad(eat.getUTCMonth() + 1)}-${pad(eat.getUTCDate())}T${pad(
    eat.getUTCHours()
  )}:${pad(eat.getUTCMinutes())}`;
}

function isoFromEatDateTimeLocal(value: string) {
  return new Date(`${value}:00+03:00`).toISOString();
}

export default function AdminEventEditor() {
  const [title, setTitle] = useState(NEXT_EVENT.title);
  const [dateInput, setDateInput] = useState(eatDateTimeLocalFromIso(NEXT_EVENT.date));
  const [dateLabel, setDateLabel] = useState(NEXT_EVENT.dateLabel);
  const [venue, setVenue] = useState(NEXT_EVENT.venue);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    
    const updatedDate = isoFromEatDateTimeLocal(dateInput);
    
    await setDoc(
      doc(db, "events", "next-event"),
      {
        title,
        date: updatedDate,
        dateLabel,
        venue,
        attending: 0,
      },
      { merge: true }
    );
    
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 mb-10 shadow-sm">
      <div className="border-b border-[var(--border)] pb-5 mb-6">
        <h2 className="font-display text-xl text-[var(--text)]">Edit Next Event</h2>
        <p className="text-xs text-[var(--text-dim)] mt-1">Configure details for the upcoming site-wide event.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1 pl-1">Event Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:border-[var(--sfc-red)] outline-none transition"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1 pl-1">Event Date (EAT)</label>
            <input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:border-[var(--sfc-red)] outline-none transition"
            />
          </div>
          <div>
            <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1 pl-1">Display Label</label>
            <input
              value={dateLabel}
              onChange={(e) => setDateLabel(e.target.value)}
              className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:border-[var(--sfc-red)] outline-none transition"
              placeholder="e.g. This Saturday"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1 pl-1">Venue</label>
          <input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:border-[var(--sfc-red)] outline-none transition"
            placeholder="e.g. Main Auditorium"
          />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={status === "saving"}
            className="rounded-full bg-[var(--sfc-red)] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
          >
            {status === "saving" ? "Saving..." : "Save Event Details"}
          </button>
          
          {status === "saved" && (
            <span className="text-xs font-bold text-green-500 animate-in fade-in duration-300">
              ✓ Event updated
            </span>
          )}
        </div>
      </form>
    </div>
  );
}