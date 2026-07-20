"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
const LINKS = [
  { href: "/", label: "Home" },
  { href: "/football", label: "Football" },
  { href: "/formula-one", label: "Formula One" },
  { href: "/devotionals", label: "Devotionals" },
  { href: "/predictor", label: "Fan Zone" },
  { href: "/get-involved", label: "Support" },
   { href: "/about", label: "About Us" },
];
export default function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("sfc-theme");
    queueMicrotask(() => {
      setTheme(savedTheme === "light" ? "light" : "dark");
    });
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("sfc-theme", theme);
  }, [theme]);

  useEffect(() => {
    queueMicrotask(() => setMenuOpen(false));
  }, [pathname]);


  return (
    <header className="sticky top-0 z-50 bg-[var(--bg)]/90 backdrop-blur border-b border-[var(--border)]">
      <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
            <Image src="/SFC-Logo.jpeg" alt="SFC logo" fill className="object-cover" />
          </div>
          <div className="leading-tight">
St. Andrew&apos;s Fan Club
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-xs font-bold uppercase tracking-wide">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-[var(--text-dim)] hover:text-[var(--text)] ${pathname === l.href ? "text-[var(--text)]" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--text)] transition hover:bg-[var(--surface2)]"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--text)] transition hover:bg-[var(--surface2)]"
            aria-label="Toggle menu"
            title="Menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          {menuOpen && (
            <nav className="md:hidden absolute right-0 top-full mt-2 w-48 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg overflow-hidden flex flex-col">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-4 py-3 text-sm font-bold uppercase tracking-wide border-b border-[var(--border)] last:border-0 ${
                    pathname === l.href ? "text-[var(--text)] bg-[var(--surface2)]" : "text-[var(--text-dim)] hover:bg-[var(--surface2)]"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}