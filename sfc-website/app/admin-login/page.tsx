"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

type ViewMode = "login" | "reset";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ViewMode>("login");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? "unknown";
      console.error("Admin login error:", code, e);
      if (code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please wait a moment before trying again.");
      } else if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setError("Incorrect email or password.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/user-disabled") {
        setError("This account has been disabled.");
      } else {
        setError(`Login failed (${code}). Please try again.`);
      }
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent! Check your inbox (and spam folder).");
      setLoading(false);
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? "unknown";
      console.error("Password reset error:", code, e);
      if (code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment before trying again.");
      } else {
        setError(`Failed to send reset email (${code}). Try again later.`);
      }
      setLoading(false);
    }
  }

  function switchToReset() {
    setView("reset");
    setError("");
    setSuccess("");
  }

  function switchToLogin() {
    setView("login");
    setError("");
    setSuccess("");
  }

  if (view === "reset") {
    return (
      <main className="max-w-sm mx-auto px-5 py-24">
        <h1 className="font-display text-2xl mb-6">Reset password</h1>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block font-mono-sfc text-[10px] uppercase text-[var(--text-dim)] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm disabled:opacity-50"
              placeholder="Enter your admin email"
              required
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          {success && <p className="text-xs text-green-400">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--sfc-red)] text-white rounded-full py-2.5 text-xs font-bold uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed transition hover:opacity-90"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>

          <button
            type="button"
            onClick={switchToLogin}
            className="w-full text-center text-xs text-[var(--text-dim)] hover:text-[var(--text)] transition underline underline-offset-2"
          >
            ← Back to login
          </button>
        </form>
      </main>
    );
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
            disabled={loading}
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
            disabled={loading}
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm disabled:opacity-50"
            required
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--sfc-red)] text-white rounded-full py-2.5 text-xs font-bold uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed transition hover:opacity-90"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <button
          type="button"
          onClick={switchToReset}
          className="w-full text-center text-xs text-[var(--text-dim)] hover:text-[var(--text)] transition underline underline-offset-2"
        >
          Forgot password?
        </button>
      </form>
    </main>
  );
}

