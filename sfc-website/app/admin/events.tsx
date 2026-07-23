"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, addDoc, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NEXT_EVENT } from "@/lib/nextEvent";

type AdminEventDoc = {
  id: string;
  title?: string;
  date?: string;
  venue?: string;
  dateLabel?: string;
  category?: string;
};

export default function AdminEventsManager() {
  const [events, setEvents] = useState<AdminEventDoc[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");


  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => {
        const { id: _discard, ...data } = d.data();
        return { id: d.id, ...data };
      }));
    });
    return () => unsub();
  }, []);

  async function handleAdd() {
    try {
      setError("");
      const created = await addDoc(collection(db, "events"), {
        ...NEXT_EVENT,
        title: "New Event",
      });
      setEditingId(created.id);
    } catch (err) {
      console.error("Failed to add event:", err);
      setError("Unable to create new event. Please try again.");
    }
  }

  async function handleSave(id: string, data: Omit<AdminEventDoc, "id">) {
    try {
      setError("");
      await setDoc(doc(db, "events", id), data, { merge: true });
      setEditingId(null);
    } catch (err) {
      console.error("Failed to save event:", err);
      setError("Unable to save event changes. Please try again.");
    }
  }


  async function handleDelete(id: string) {
    if (!confirm("Delete this event permanently?")) return;
    try {
      setError("");
      await deleteDoc(doc(db, "events", id));
    } catch (err) {
      console.error("Failed to delete event:", err);
      setError("Unable to delete event. Please try again.");
    }
  }

  return (
    <div className="mb-10 animate-fade-in px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border)] pb-5 mb-8 gap-4">
        <div>
          <h2 className="font-display text-xl text-[var(--text)]">Events Manager</h2>
          <p className="text-xs text-[var(--text-dim)] mt-1">Manage site-wide upcoming events.</p>
        </div>
        <button 
          onClick={handleAdd} 
          className="w-full sm:w-auto rounded-full bg-[var(--sfc-red)] px-6 py-3 text-white text-sm font-bold uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition"
        >
          Add New Event
        </button>
      </div>

      {error && (
        <p className="bg-red-950/30 border border-red-900/50 text-red-400 text-xs font-bold rounded-xl px-4 py-3 mb-6">{error}</p>
      )}

      <div className="grid gap-4">
        {events.filter(ev => ev.id !== "next-event").map((ev) => (
          <div key={ev.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
            {editingId === ev.id ? (
              <EventEditor 
                ev={ev} 
                onSave={(d: AdminEventDoc) => handleSave(ev.id, d)}
                onCancel={() => setEditingId(null)} 
                onDelete={() => handleDelete(ev.id)} 
              />
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-bold text-[var(--text)] text-base">{ev.title}</div>
                  <div className="text-xs text-[var(--text-dim)] mt-1">{ev.dateLabel} • {ev.venue}</div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <button 
                    onClick={() => setEditingId(ev.id)} 
                    className="flex-1 sm:flex-none justify-center rounded-full px-5 py-2.5 bg-[var(--surface2)] text-xs font-bold text-[var(--text)] hover:bg-[var(--border)] transition"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(ev.id)} 
                    className="flex-1 sm:flex-none justify-center rounded-full px-5 py-2.5 bg-transparent border border-[var(--border)] text-xs font-bold text-red-400 hover:bg-red-950/20 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EventEditor({ ev, onSave, onCancel, onDelete }: { ev: AdminEventDoc; onSave: (d: AdminEventDoc) => Promise<void>; onCancel: () => void; onDelete: () => Promise<void> }) {
  const [title, setTitle] = useState(ev.title ?? "");
  const [dateInput, setDateInput] = useState(ev.date ?? "");
  const [venue, setVenue] = useState(ev.venue ?? "");
  const [dateLabel, setDateLabel] = useState(ev.dateLabel ?? "");
  const [category, setCategory] = useState(ev.category ?? "");


  // Shared input class for consistency and touch-friendly sizing
  const inputClass = "w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-sm text-[var(--text)] focus:border-[var(--sfc-red)] outline-none transition";
  const labelClass = "block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1 pl-1";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
onSave({ id: ev.id, title, date: dateInput, venue, dateLabel, category });
      }}
      className="space-y-4"
    >
      <div>
        <label className={labelClass}>Event Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Date (ISO Format)</label>
          <input value={dateInput} onChange={(e) => setDateInput(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Display Label</label>
        <input value={dateLabel} onChange={(e) => setDateLabel(e.target.value)} className={inputClass} placeholder="e.g. This Saturday" />
      </div>

      <div>
        <label className={labelClass}>Venue</label>
        <input value={venue} onChange={(e) => setVenue(e.target.value)} className={inputClass} />
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.03)] mt-6 gap-3">
        <button 
           type="button" 
           onClick={onDelete} 
           className="text-xs font-bold text-red-400 hover:text-red-300 transition px-4 py-2"
        >
          Delete Event
        </button>
        <div className="flex gap-3 w-full sm:w-auto">
          <button type="button" onClick={onCancel} className="flex-1 sm:flex-none rounded-full px-6 py-3 bg-[var(--surface2)] text-xs font-bold hover:bg-[var(--border)] transition">Cancel</button>
          <button type="submit" className="flex-1 sm:flex-none rounded-full bg-[var(--sfc-red)] px-6 py-3 text-white text-xs font-bold uppercase tracking-wider hover:brightness-110 transition">Save Changes</button>
        </div>
      </div>
    </form>
  );
}
