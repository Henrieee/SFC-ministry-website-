"use client";
import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type MinistryTeamItem = {
  role: string;
  name: string;
  photoUrl: string;
  order: number;
};

type MinistryRoleKey =
  | "ministryCoordinator"
  | "footballLead"
  | "formulaOneLead"
  | "devotionLead"
  | "financeOfficer"
  | "marketingLead";

const ROLE_DOCS: Array<{ key: MinistryRoleKey; roleLabel: string }> = [
  { key: "ministryCoordinator", roleLabel: "Ministry Coordinator" },
  { key: "footballLead", roleLabel: "Football Lead" },
  { key: "formulaOneLead", roleLabel: "Formula One Lead" },
  { key: "devotionLead", roleLabel: "Devotion Lead" },
  { key: "financeOfficer", roleLabel: "Finance Officer" },
  { key: "marketingLead", roleLabel: "Marketing Lead" },
];

function stableInitialsFromName(name: string) {
  const cleaned = (name || "").trim();
  if (!cleaned) return "";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

export default function AdminMinistryTeamManager() {
  const [items, setItems] = useState<Record<MinistryRoleKey, MinistryTeamItem>>(() => {
    const base = {} as Record<MinistryRoleKey, MinistryTeamItem>;
    for (const r of ROLE_DOCS) {
      base[r.key] = { role: r.roleLabel, name: "", photoUrl: "", order: 0 };
    }
    return base;
  });

  const [busyKey, setBusyKey] = useState<MinistryRoleKey | null>(null);

  useEffect(() => {
    const q = query(collection(db, "ministryTeam"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems((prev) => {
        const next = { ...prev };
        for (const docSnap of snap.docs) {
          const data = docSnap.data() as Partial<MinistryTeamItem> & { role?: string };
          const key = docSnap.id as MinistryRoleKey;
          if (!next[key]) continue;
          next[key] = {
            role: ROLE_DOCS.find((r) => r.key === key)?.roleLabel ?? next[key].role,
            name: typeof data.name === "string" ? data.name : "",
            photoUrl: typeof data.photoUrl === "string" ? data.photoUrl : "",
            order: typeof data.order === "number" ? data.order : next[key].order,
          };
        }
        return next;
      });
    });
    return () => unsub();
  }, []);

  const orderedRoles = useMemo(() => {
    return ROLE_DOCS.map((r, idx) => ({ ...r, order: idx }));
  }, []);

  async function handleSaveRole(key: MinistryRoleKey, data: { name: string; photoUrl: string }) {
    setBusyKey(key);
    const roleLabel = ROLE_DOCS.find((r) => r.key === key)?.roleLabel ?? items[key].role;

    await setDoc(
      doc(db, "ministryTeam", key),
      {
        role: roleLabel,
        name: data.name,
        photoUrl: data.photoUrl,
        order: orderedRoles.find((r) => r.key === key)?.order ?? items[key].order,
      },
      { merge: true }
    );
    setBusyKey(null);
  }

  return (
    <div className="mb-10 animate-fade-in space-y-12">
      <div className="border-b border-[var(--border)] pb-5">
        <h2 className="font-display text-xl text-[var(--text)]">Ministry Team</h2>
        <p className="text-xs text-[var(--text-dim)] mt-1">Configure profile details for the homepage leadership section cards.</p>
      </div>

      <div className="grid gap-6">
        {orderedRoles.map(({ key, roleLabel, order }) => {
          const item = items[key];
          return (
            <MinistryTeamRoleEditor
              key={key}
              roleLabel={roleLabel}
              order={order}
              item={item}
              busy={busyKey === key}
              onSave={(name, photoUrl) => handleSaveRole(key, { name, photoUrl })}
            />
          );
        })}
      </div>
    </div>
  );
}

function MinistryTeamRoleEditor({
  roleLabel,
  order,
  item,
  busy,
  onSave,
}: {
  roleLabel: string;
  order: number;
  item: MinistryTeamItem;
  busy: boolean;
  onSave: (name: string, photoUrl: string) => Promise<void>;
}) {
  const [name, setName] = useState(item.name);
  const [photoUrl, setPhotoUrl] = useState(item.photoUrl);

  useEffect(() => {
    queueMicrotask(() => {
      setName(item.name);
      setPhotoUrl(item.photoUrl);
    });
  }, [item.name, item.photoUrl]);


  const initials = stableInitialsFromName(name);

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
        <div>
          <h3 className="font-display text-sm text-[var(--text)]">{roleLabel}</h3>
          <div className="font-mono-sfc text-[10px] text-[var(--sfc-red)] uppercase tracking-wider mt-0.5">Order index: {order + 1}</div>
        </div>
        <div className="w-14 h-14 rounded-2xl border border-[var(--border)] bg-[var(--surface2)] overflow-hidden flex items-center justify-center shrink-0">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={roleLabel} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-lg text-[var(--text-dim)]">{initials || "—"}</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1 pl-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl bg-[var(--surface2)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text)] focus:border-[var(--sfc-red)] outline-none transition"
            placeholder="e.g. Brian Otieno"
          />
        </div>
        <div>
          <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1 pl-1">Photo URL</label>
          <input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="w-full rounded-xl bg-[var(--surface2)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text)] focus:border-[var(--sfc-red)] outline-none transition"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex pt-4 mt-4 border-t border-[rgba(255,255,255,0.03)]">
        <button
          type="button"
          disabled={busy}
          onClick={() => onSave(name, photoUrl)}
          className="rounded-full bg-[var(--sfc-red)] px-5 py-2 text-white text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}