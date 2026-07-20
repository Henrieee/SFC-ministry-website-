"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // 1. Added loading state

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true); // 2. Turn loading indicator on
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch {
      setError("Incorrect email or password.");
      setLoading(false); // 3. Turn loading off if there's an error so they can try again
    }
  }

  return (
    <main className="max-w-sm mx-auto px-5 py-24">
      <h1 className="font-display text-2xl mb-6">Admin login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block font-mono-sfc text-[10px] uppercase text-[var(--text-dim)] mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading} // 4. Disable input while logging in
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm disabled:opacity-50"
            required
          />
        </div>
        <div>
          <label className="block font-mono-sfc text-[10px] uppercase text-[var(--text-dim)] mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading} // 5. Disable input while logging in
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm disabled:opacity-50"
            required
          />
        </div>
        
        {error && <p className="text-xs text-red-400">{error}</p>}
        
        <button
          type="submit"
          disabled={loading} // 6. Disable button to prevent double-submitting
          className="w-full bg-[var(--sfc-red)] text-white rounded-full py-2.5 text-xs font-bold uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed transition hover:opacity-90"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </main>
  );
}