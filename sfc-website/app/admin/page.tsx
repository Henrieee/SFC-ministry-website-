"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { useAdminAuth } from "@/hooks/useAdminAuth";

// Manager Sub-Components
import AdminEventEditor from "@/app/admin/event";
import AdminEventsManager from "@/app/admin/events";
import AdminSportsManager from "@/app/admin/sports";
import AdminPredictorManager from "@/app/admin/predictor";
import AdminDevotionalsManager from "@/app/admin/devotionals";
import AdminMinistryTeamManager from "@/app/admin/ministry-team";

type Volunteer = { id: string; name: string; contact: string; ministries: string[] };
type PrayerRequest = { id: string; name: string | null; text: string; anon: boolean };
type AdminTab = "events" | "sports" | "predictor" | "devotionals" | "ministry" | "comms";

export default function AdminPage() {
  const { user, loading } = useAdminAuth();
  const router = useRouter();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<AdminTab>("events");
  
  // Database States
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/admin-login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const unsubV = onSnapshot(
      query(collection(db, "volunteers"), orderBy("submittedAt", "desc")),
      (snap) => setVolunteers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Volunteer)))
    );
    const unsubP = onSnapshot(
      query(collection(db, "prayerRequests"), orderBy("submittedAt", "desc")),
      (snap) => setPrayers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PrayerRequest)))
    );
    return () => {
      unsubV();
      unsubP();
    };
  }, [user]);

  async function handleSignOut() {
    await signOut(auth);
    router.push("/admin-login");
  }

  if (loading || !user) {
    return (
      <main className="max-w-3xl mx-auto px-5 py-24 text-sm text-[var(--text-dim)]">
        Checking access…
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-5 py-16">
      {/* Top Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 border-b border-[var(--border)] pb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(255,255,255,0.03)] border border-[var(--border)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)]">
            🛡️ Control Tower
          </div>
          <h1 className="font-display text-3xl mt-2">Admin Dashboard</h1>
          <p className="text-sm text-[var(--text-dim)] mt-0.5">Global configuration panels & interaction monitors.</p>
        </div>
        <button
          onClick={handleSignOut}
          className="sm:self-start rounded-full bg-[var(--surface2)] border border-[var(--border)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--text)] hover:brightness-110 transition"
        >
          Sign out
        </button>
      </div>

      {/* Tabs Sub-Navigation Bar */}
      <div className="flex flex-wrap gap-1.5 mb-8 border-b border-[var(--border)] pb-px">
        {(
          [
            { id: "events", label: "🗓️ Events" },
            { id: "sports", label: "⚽ Sports leagues" },
            { id: "predictor", label: "📊 Predictor game" },
            { id: "devotionals", label: "📖 Devotionals" },
            { id: "sidebar-ministry", idVal: "ministry", label: "👥 Ministry Team" },
            { id: "comms", label: "📢 Requests & Volts" },
          ] as { id: string; idVal?: AdminTab; label: string }[]
        ).map((tab) => {
          const targetTab = tab.idVal || (tab.id as AdminTab);
          const isSelected = activeTab === targetTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(targetTab)}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px ${
                isSelected
                  ? "border-[var(--sfc-red)] text-[var(--text)] font-extrabold"
                  : "border-transparent text-[var(--text-dim)] hover:text-[var(--text)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Viewport Section Container */}
      <div className="space-y-8">
        {activeTab === "events" && (
          <div className="space-y-8 animate-fade-in">
            <AdminEventEditor />
            <AdminEventsManager />
          </div>
        )}

        {activeTab === "sports" && <AdminSportsManager />}

        {activeTab === "predictor" && <AdminPredictorManager />}

        {activeTab === "devotionals" && <AdminDevotionalsManager />}

        {activeTab === "ministry" && <AdminMinistryTeamManager />}

        {activeTab === "comms" && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="font-display text-xl mb-1">Volunteers ({volunteers.length})</h2>
              <p className="text-xs text-[var(--text-dim)] mb-4">Latest community sign-up lists.</p>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
                {volunteers.length === 0 && (
                  <p className="text-sm text-[var(--text-dim)] py-2">No sign-ups yet.</p>
                )}
                {volunteers.map((v) => (
                  <div key={v.id} className="py-3 border-b border-[var(--border)] last:border-0">
                    <div className="text-sm font-bold text-[var(--text)]">
                      {v.name} <span className="text-[var(--text-dim)] font-normal">— {v.contact}</span>
                    </div>
                    <div className="text-xs text-[var(--text-dim)] mt-1">{v.ministries.join(", ")}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-display text-xl mb-1">Prayer Requests ({prayers.length})</h2>
              <p className="text-xs text-[var(--text-dim)] mb-4">Submitted requests from the community prayer wall.</p>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
                {prayers.length === 0 && (
                  <p className="text-sm text-[var(--text-dim)] py-2">No requests yet.</p>
                )}
                {prayers.map((p) => (
                  <div key={p.id} className="py-3 border-b border-[var(--border)] last:border-0">
                    <div className="text-xs font-mono-sfc text-[var(--sfc-red)] uppercase mb-1 font-bold tracking-wider">
                      {p.anon ? "📿 Anonymous Request" : `🙏 ${p.name}`}
                    </div>
                    <div className="text-sm text-[var(--text)] leading-relaxed">{p.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}