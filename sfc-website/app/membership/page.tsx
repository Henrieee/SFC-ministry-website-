"use client";
import { useState } from "react";

function generateMemberId(name: string) {
  const sum = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  const id = Math.abs((sum * 97) % 99999);
  return "SFC-" + String(id).padStart(5, "0");
}

export default function MembershipCardPage() {
  const [nameInput, setNameInput] = useState("");
  const [savedName, setSavedName] = useState("");

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setSavedName(nameInput.trim());
  }

  const displayName = savedName || "Your Name";
  const memberId = generateMemberId(displayName);

  return (
    <main className="max-w-md mx-auto px-5 py-16">
      <span className="font-mono-sfc text-xs uppercase tracking-widest text-[var(--sfc-red)] font-bold">
        Digital membership
      </span>
      <h1 className="font-display text-3xl my-4">My SFC Card</h1>

      <form onSubmit={handleGenerate} className="mb-8">
        <label className="block font-mono-sfc text-[10px] uppercase text-[var(--text-dim)] mb-1">
          Your name
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g. Brian Otieno"
            className="flex-1 bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm"
          />
          <button
            type="submit"
            className="bg-[var(--sfc-red)] text-white rounded-lg px-5 text-xs font-bold uppercase tracking-wide"
          >
            Generate
          </button>
        </div>
      </form>

      {/* The card itself */}
      <div className="rounded-2xl p-6 relative overflow-hidden border border-[rgba(200,16,46,0.35)] bg-gradient-to-br from-[#1a1a1c] to-[#0B0B0C]">
        <div className="flex justify-between items-start mb-8">
          <span className="font-mono-sfc text-[10px] uppercase text-white/60">SFC Member</span>
          <div
            className="w-12 h-12 rounded-md"
            style={{
              backgroundImage:
                "repeating-conic-gradient(#F5F5F5 0% 25%, #111 0% 50%)",
              backgroundSize: "8px 8px",
            }}
          />
        </div>
        <div className="font-display text-xl text-white">{displayName}</div>
        <div className="font-mono-sfc text-xs text-white/60 mt-1">ID {memberId}</div>
        <span className="inline-block mt-3 font-mono-sfc text-[10px] uppercase tracking-wide bg-[var(--sfc-red)] text-white px-3 py-1 rounded-full">
          Fan Club Member
        </span>
      </div>

      <p className="text-[11px] text-[var(--text-dim)] mt-4">
        Apple/Google Wallet pass support is planned for a later phase — this shows the card design for now.
      </p>
    </main>
  );
}
