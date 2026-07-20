"use client";
import { useEffect, useState } from "react";
import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Devotional = {
  id: string;
  title: string;
  passage: string;
  reading: string;
  lesson: string;
  speaker?: string;
};

const FALLBACK_DEVOTIONALS: Devotional[] = [
  {
    id: "d2",
    title: "Run With Endurance",
    passage: "Hebrews 12:1",
    reading: "Therefore, since we are surrounded by so great a cloud of witnesses, let us also lay aside every weight, and sin which so easily ensnares us, and let us run with endurance the race that is set before us.",
    lesson: "A striker who stops chasing a through-ball never scores. Faith calls us to keep running the race marked out for us, eyes fixed ahead, even when our legs are heavy and the clock seems against us.",
  },
  {
    id: "d4",
    title: "Racing Your Own Line",
    passage: "Philippians 3:14",
    reading: "I press toward the goal for the prize of the upward call of God in Christ Jesus.",
    lesson: "Every driver has their own racing line — the fastest path through the corner, found through practice and trust in the car. God has a line for each of us too; our job is to trust His engineering, not everyone else's.",
  },
];

const DEVOTIONS_LIMIT = 5;

export default function DevotionalsPage() {
  const [selected, setSelected] = useState<Devotional | null>(null);
  const [devotionals, setDevotionals] = useState<Devotional[]>(FALLBACK_DEVOTIONALS);

  useEffect(() => {
    const q = query(collection(db, "devotions"), orderBy("createdAt", "desc"), limit(DEVOTIONS_LIMIT));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Devotional, "id">) }));
      setDevotionals(docs.length > 0 ? docs : FALLBACK_DEVOTIONALS);
    });
    return () => unsub();
  }, []);

  const featuredDevotion = devotionals[0] ?? null;
  const olderDevotionals = devotionals.slice(1);

  // --- Prayer request form state ---
  const [prayerAnon, setPrayerAnon] = useState(false);
  const [prayerName, setPrayerName] = useState("");
  const [prayerText, setPrayerText] = useState("");
  const [prayerSubmitted, setPrayerSubmitted] = useState(false);
  const [prayerSubmitting, setPrayerSubmitting] = useState(false); // Safeguard state

  async function handlePrayerSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prayerText.trim() || prayerSubmitting) return;

    setPrayerSubmitting(true);

    try {
      await addDoc(collection(db, "prayerRequests"), {
        name: prayerAnon ? null : prayerName,
        text: prayerText,
        anon: prayerAnon,
        submittedAt: serverTimestamp(),
      });
      setPrayerSubmitted(true);
    } catch (err) {
      console.error("Error submitting prayer:", err);
    } finally {
      setPrayerSubmitting(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-5 py-16 text-center">
      <span className="font-mono-sfc text-xs uppercase tracking-widest text-[var(--sfc-red)] font-bold">
        📖 Devotions
      </span>
      <h1 className="font-display text-3xl md:text-4xl my-4">Faith meets the game</h1>
      <p className="text-[var(--text-dim)] mb-10 max-w-md mx-auto">
        Weekly sports-themed scripture reflections for football and Formula One fans. A new devotion is added every week.
      </p>

      {featuredDevotion ? (
        <section className="mb-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 text-left">
This week&apos;s devotion{featuredDevotion.speaker ? ` — led by ${featuredDevotion.speaker}` : ""}
          <h2 className="font-display text-2xl mt-2">{featuredDevotion.title}</h2>
          <div className="mt-4 text-xs text-[var(--text-dim)]">{featuredDevotion.passage}</div>
          <div className="mt-6 font-mono-sfc text-sm">Bible reading</div>
          <p className="mt-2 text-[var(--text-dim)] italic">{featuredDevotion.reading}</p>
          <div className="mt-6 font-mono-sfc text-sm">Lesson</div>
          <p className="mt-2 text-[var(--text-dim)]">{featuredDevotion.lesson}</p>
        </section>
      ) : null}

      <div className="grid gap-5 text-left">
        {olderDevotionals.map((d) => (
          <article key={d.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-lg">{d.title}</div>
                <div className="text-xs text-[var(--text-dim)]">
                  {d.passage}
                  {d.speaker ? ` · Led by ${d.speaker}` : ""}
                </div>
                <p className="mt-3 text-[var(--text-dim)]">{(d.lesson ?? "").slice(0, 140)}{(d.lesson ?? "").length > 140 ? "…" : ""}</p>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => setSelected(d)}
                  className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide bg-[var(--sfc-red)] text-white hover:opacity-90 transition"
                >
                  Read
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Prayer request */}
      <div className="text-left mt-10">
        <span className="font-mono-sfc text-xs uppercase tracking-widest text-[var(--sfc-red)] font-bold">
          Prayer request
        </span>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 mt-4">
          {prayerSubmitted ? (
            <p className="text-sm text-green-400 font-medium">
              ✓ We&apos;ve received your request and are praying with you.

            </p>
          ) : (
            <form onSubmit={handlePrayerSubmit} className="space-y-4">
              <label className="flex items-center gap-2 text-sm w-fit cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={prayerAnon}
                  disabled={prayerSubmitting}
                  onChange={(e) => setPrayerAnon(e.target.checked)}
                />
                Submit anonymously
              </label>

              {!prayerAnon && (
                <div>
                  <label className="block font-mono-sfc text-[10px] uppercase text-[var(--text-dim)] mb-1">
                    Your name
                  </label>
                  <input
                    type="text"
                    value={prayerName}
                    disabled={prayerSubmitting}
                    onChange={(e) => setPrayerName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm disabled:opacity-50"
                  />
                </div>
              )}

              <div>
                <label className="block font-mono-sfc text-[10px] uppercase text-[var(--text-dim)] mb-1">
                  Your request
                </label>
                <textarea
                  value={prayerText}
                  disabled={prayerSubmitting}
                  onChange={(e) => setPrayerText(e.target.value)}
                  placeholder="Share what&apos;s on your heart…"

                  rows={4}
                  className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm resize-y disabled:opacity-50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={prayerSubmitting}
                className="w-full bg-[var(--sfc-red)] text-white rounded-full py-3 text-xs font-bold uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed transition hover:opacity-90"
              >
                {prayerSubmitting ? "Submitting..." : "Submit prayer request"}
              </button>
              <p className="text-[11px] text-[var(--text-dim)]">
                Only ministry admins can view submitted requests.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Devotional Reader Modal */}
      {selected && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setSelected(null)} // Closes if you click outside the box
        >
          <div 
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 max-w-2xl w-full text-left max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the box
          >
            <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
              <div>
                <div className="font-display text-xl">{selected.title}</div>
                <div className="text-xs text-[var(--text-dim)] mt-1">
                  {selected.passage}
                  {selected.speaker ? ` · Led by ${selected.speaker}` : ""}
                </div>
              </div>
              <button 
                onClick={() => setSelected(null)} 
                className="text-xs uppercase font-mono-sfc font-bold tracking-wider text-[var(--sfc-red)] hover:opacity-80"
              >
                Dismiss
              </button>
            </div>
            <div className="mt-6 font-mono-sfc text-xs uppercase tracking-wider text-[var(--sfc-red)] font-bold">Bible reading</div>
<div className="mt-2 text-[var(--text-dim)] italic bg-[var(--surface2)] p-4 rounded-xl border border-[var(--border)] line-leading-relaxed">
&ldquo;{selected.reading}&rdquo;

            </div>
            <div className="mt-6 font-mono-sfc text-xs uppercase tracking-wider text-[var(--sfc-red)] font-bold">Lesson</div>
            <div className="mt-2 text-[var(--text)] leading-relaxed pb-2">{selected.lesson}</div>
          </div>
        </div>
      )}
    </main>
  );
}