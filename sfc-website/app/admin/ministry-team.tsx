"use client";
import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type MinistryTeamItem = {
  role: string;
  name: string;
  photoUrl: string;
  order: number;
  cropZoom?: number;
  cropX?: number;
  cropY?: number;
};

type MinistryRoleKey = "ministryCoordinator" | "footballLead" | "formulaOneLead" | "devotionLead" | "marketingLead" | "sportsLiaison";

const ROLE_DOCS: Array<{ key: MinistryRoleKey; roleLabel: string }> = [
  { key: "ministryCoordinator", roleLabel: "Ministry Coordinator" },
  { key: "footballLead", roleLabel: "Football Lead" },
  { key: "formulaOneLead", roleLabel: "Formula One Lead" },
  { key: "devotionLead", roleLabel: "Devotion Lead" },
  { key: "marketingLead", roleLabel: "Marketing Lead" },
  { key: "sportsLiaison", roleLabel: "Sports Liaison" },
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
  const [items, setItems] = useState<Record<string, MinistryTeamItem>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const q = query(collection(db, "ministryTeam"), orderBy("order", "asc"));
    return onSnapshot(q, (snap) => {
      const next: Record<string, MinistryTeamItem> = {};
      ROLE_DOCS.forEach(r => {
        next[r.key] = { role: r.roleLabel, name: "", photoUrl: "", order: 0 };
      });
      snap.docs.forEach(docSnap => {
        const data = docSnap.data();
        next[docSnap.id] = {
          role: data.role || ROLE_DOCS.find(r => r.key === docSnap.id)?.roleLabel || "",
          name: data.name || "",
          photoUrl: data.photoUrl || "",
          order: data.order || 0,
          cropZoom: typeof data.cropZoom === "number" ? data.cropZoom : 1,
          cropX: typeof data.cropX === "number" ? data.cropX : 0,
          cropY: typeof data.cropY === "number" ? data.cropY : 0,
        };
      });
      setItems(next);
    });
  }, []);

  async function handleSaveRole(key: string, name: string, photoUrl: string, cropZoom: number, cropX: number, cropY: number) {
    setBusyKey(key);
    setError("");
    try {
      await setDoc(doc(db, "ministryTeam", key), {
        role: ROLE_DOCS.find(r => r.key === key)?.roleLabel,
        name,
        photoUrl,
        order: ROLE_DOCS.findIndex(r => r.key === key),
        cropZoom,
        cropX,
        cropY,
      }, { merge: true });
    } catch (err) {
      console.error("Failed to save ministry role", err);
      setError(`Unable to update ${ROLE_DOCS.find(r => r.key === key)?.roleLabel || key}.`);
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="mb-10 animate-fade-in space-y-12">
      <div className="border-b border-[var(--border)] pb-5">
        <h2 className="font-display text-xl text-[var(--text)]">Ministry Team</h2>
        <p className="text-xs text-[var(--text-dim)] mt-1">Configure profile details for the homepage leadership section.</p>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-xl px-4 py-3">{error}</p>
      )}

      <div className="grid gap-6">
        {ROLE_DOCS.map(({ key, roleLabel }) => (
          <MinistryTeamRoleEditor
            key={key}
            roleLabel={roleLabel}
            item={items[key] || { role: roleLabel, name: "", photoUrl: "", order: 0 }}
            busy={busyKey === key}
            onSave={(name: string, photoUrl: string, cropZoom: number, cropX: number, cropY: number) => handleSaveRole(key, name, photoUrl, cropZoom, cropX, cropY)}
          />
        ))}
      </div>
    </div>
  );
}

type MinistryTeamRoleEditorProps = {
  roleLabel: string;
  item: MinistryTeamItem;
  busy: boolean;
  onSave: (name: string, photoUrl: string, cropZoom: number, cropX: number, cropY: number) => void;
};

const sliderClass =
  "w-full h-1.5 appearance-none rounded-full bg-[var(--surface2)] outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--sfc-red)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--surface)] [&::-webkit-slider-thumb]:cursor-pointer";

function MinistryTeamRoleEditor({ roleLabel, item, busy, onSave }: MinistryTeamRoleEditorProps) {
  const [name, setName] = useState(item.name);
  const [photoUrl, setPhotoUrl] = useState(item.photoUrl);
  const [cropZoom, setCropZoom] = useState(item.cropZoom ?? 1);
  const [cropX, setCropX] = useState(item.cropX ?? 0);
  const [cropY, setCropY] = useState(item.cropY ?? 0);
  const [imgError, setImgError] = useState(false);
  const [showCrop, setShowCrop] = useState(false);

  useEffect(() => {
    setName(item.name);
    setPhotoUrl(item.photoUrl);
    setCropZoom(item.cropZoom ?? 1);
    setCropX(item.cropX ?? 0);
    setCropY(item.cropY ?? 0);
    setImgError(false);
  }, [item.name, item.photoUrl, item.cropZoom, item.cropX, item.cropY]);

  const showInitials = !photoUrl || imgError;
  const initials = stableInitialsFromName(name) || "—";

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-display text-sm text-[var(--text)]">{roleLabel}</h3>
        <div className="w-14 h-14 rounded-full bg-[var(--surface2)] border border-[var(--border)] overflow-hidden flex items-center justify-center">
          {showInitials ? (
            <span className="text-lg font-bold">{initials}</span>
          ) : (
            <div className="w-full h-full overflow-hidden">
              <img
                src={photoUrl}
                alt={`${roleLabel} photo`}
                className="w-full h-full"
                style={{
                  objectFit: "cover",
                  transform: `scale(${cropZoom}) translate(${cropX}px, ${cropY}px)`,
                }}
                onError={() => setImgError(true)}
              />
            </div>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl bg-[var(--surface2)] border border-[var(--border)] px-4 py-2.5 text-sm" placeholder="Name" />
        <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} className="w-full rounded-xl bg-[var(--surface2)] border border-[var(--border)] px-4 py-2.5 text-sm" placeholder="/leaders/filename.jpg" />
      </div>

      {/* Photo crop section — toggled by button */}
      {photoUrl && !imgError && (
        <div className="mt-5 pt-5 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={() => setShowCrop(v => !v)}
            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-dim)] hover:text-[var(--text)] transition"
          >
            <span className={showCrop ? "rotate-90" : ""}>▶</span>
            Photo Crop
          </button>

          {showCrop && (
            <div className="mt-4 space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] text-[var(--text-dim)] mb-1">
                    <span>Zoom</span>
                    <span className="font-bold text-[var(--text)]">{cropZoom.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={cropZoom}
                    onChange={e => setCropZoom(Number(e.target.value))}
                    className={sliderClass}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-[var(--text-dim)] mb-1">
                    <span>Pan X</span>
                    <span className="font-bold text-[var(--text)]">{cropX > 0 ? "+" : ""}{cropX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={cropX}
                    onChange={e => setCropX(Number(e.target.value))}
                    className={sliderClass}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-[var(--text-dim)] mb-1">
                    <span>Pan Y</span>
                    <span className="font-bold text-[var(--text)]">{cropY > 0 ? "+" : ""}{cropY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={cropY}
                    onChange={e => setCropY(Number(e.target.value))}
                    className={sliderClass}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        disabled={busy}
        onClick={() => onSave(name, photoUrl, cropZoom, cropX, cropY)}
        className="mt-4 rounded-full bg-[var(--sfc-red)] px-6 py-2 text-white text-xs font-bold uppercase hover:brightness-110"
      >
        {busy ? "Saving..." : "Update"}
      </button>
    </div>
  );
}
