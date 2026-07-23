"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

type MinistryTeamDoc = {
  role: string;
  name: string;
  photoUrl: string;
  order: number;
  cropZoom?: number;
  cropX?: number;
  cropY?: number;
};

type RoleKey =
  | "ministryCoordinator"
  | "sportsLiaison"
  | "footballLead"
  | "formulaOneLead"
  | "devotionLead"
  | "marketingLead";

const FALLBACK_ROLES: Array<{ key: RoleKey; role: string; initials: string }> = [
  { key: "ministryCoordinator", role: "Ministry Coordinator", initials: "MC" },
  { key: "footballLead", role: "Football Lead", initials: "FL" },
  { key: "formulaOneLead", role: "Formula One Lead", initials: "F1" },
  { key: "devotionLead", role: "Devotion Lead", initials: "DL" },
  { key: "marketingLead", role: "Marketing Lead", initials: "ML" },
  { key: "sportsLiaison", role: "Sports Liaison", initials: "SL" },
];

function initialsFromName(name: string) {
  const cleaned = (name || "").trim();
  if (!cleaned) return "";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

export default function AboutSection() {
  const [team, setTeam] = useState<Record<RoleKey, MinistryTeamDoc | null>>(() => {
    const base = {} as Record<RoleKey, MinistryTeamDoc | null>;
    for (const r of FALLBACK_ROLES) base[r.key] = null;
    return base;
  });

  useEffect(() => {
    // Do NOT rely on orderBy/order for correctness; we just need the doc fields for known role keys.
    const q = query(collection(db, "ministryTeam"));
    const unsub = onSnapshot(q, (snap) => {
      setTeam(() => {
        const next = {} as Record<RoleKey, MinistryTeamDoc | null>;
        for (const r of FALLBACK_ROLES) next[r.key] = null;

        const allowedKeys = new Set<RoleKey>(FALLBACK_ROLES.map((r) => r.key));

        for (const docSnap of snap.docs) {
          const key = docSnap.id as RoleKey;
          if (!allowedKeys.has(key)) continue;

          const data = docSnap.data() as Partial<MinistryTeamDoc>;
          next[key] = {
            role: data.role ?? FALLBACK_ROLES.find((r) => r.key === key)?.role ?? "",
            name: typeof data.name === "string" ? data.name : "",
            photoUrl: typeof data.photoUrl === "string" ? data.photoUrl : "",
            order: typeof data.order === "number" ? data.order : 0,
            cropZoom: typeof data.cropZoom === "number" ? data.cropZoom : 1,
            cropX: typeof data.cropX === "number" ? data.cropX : 0,
            cropY: typeof data.cropY === "number" ? data.cropY : 0,
          };
        }

        return next;
      });
    });

    return () => unsub();
  }, []);

  const ordered = useMemo(() => {
    return FALLBACK_ROLES.map((r, idx) => {
      const doc = team[r.key];
      return {
        key: r.key,
        role: doc?.role || r.role,
        name: doc?.name || "",
        photoUrl: doc?.photoUrl || "",
        initials: initialsFromName(doc?.name || "") || r.initials,
        order: idx,
        cropZoom: doc?.cropZoom ?? 1,
        cropX: doc?.cropX ?? 0,
        cropY: doc?.cropY ?? 0,
      };
    }).sort((a, b) => a.order - b.order);
  }, [team]);

  return (
    <section className="max-w-3xl mx-auto px-5 pb-16">
      <span className="font-mono-sfc text-xs uppercase tracking-widest text-[var(--sfc-red)] font-bold">
        About SFC
      </span>
      <h1 className="font-display text-3xl md:text-4xl my-4">Mission &amp; vision</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="font-display text-base mb-2">Mission</h2>
          <p className="text-sm text-[var(--text-dim)] mb-6">
            To create a Christ-centred community where football fans, Formula One
            enthusiasts, and sports lovers experience authentic fellowship, grow in
            faith, and encounter Jesus.
          </p>
          <h2 className="font-display text-base mb-2">Vision</h2>
          <p className="text-sm text-[var(--text-dim)] mb-6">
            A ministry where every matchday and every race weekend becomes an open
            door into the life of the church.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a
              href="https://wa.me/254757022022"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[var(--sfc-red)] text-white rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wide"
            >
              WhatsApp us
            </a>
            <a
              href="tel:+254757022022"
              className="border border-[var(--border)] rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wide"
            >
              Call us
            </a>
          </div>
        </div>

        <div>
          <div className="rounded-2xl overflow-hidden border border-[var(--border)] h-64">
            <iframe
src="https://www.google.com/maps?q=PCEA+St+Andrew&apos;s+Church+Nairobi&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
            />
          </div>
          <p className="text-xs text-[var(--text-dim)] mt-2">
PCEA St. Andrew&apos;s Church, Nairobi
          </p>
        </div>
      </div>

      <span className="font-mono-sfc text-xs uppercase tracking-widest text-[var(--sfc-red)] font-bold">
        Leadership
      </span>
      <h2 className="font-display text-2xl my-3">Ministry team</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ordered.map((l) => (
          <div
            key={l.key}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-[var(--surface2)] border border-[var(--border)] overflow-hidden flex items-center justify-center font-display text-lg mx-auto mb-3">
              {l.photoUrl ? (
                <div className="w-full h-full overflow-hidden rounded-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={l.photoUrl}
                    alt={l.role}
                    className="w-full h-full"
                    style={{
                      objectFit: "cover",
                      transform: `scale(${l.cropZoom}) translate(${l.cropX}px, ${l.cropY}px)`,
                    }}
                  />
                </div>
              ) : (
                <span>{l.initials}</span>
              )}
            </div>
            <div className="text-sm font-bold">{l.role}</div>
            <div className="text-[11px] text-[var(--text-dim)]">{l.name || "—"}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

