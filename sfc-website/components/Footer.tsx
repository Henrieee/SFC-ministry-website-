import Link from "next/link";
import Image from "next/image";
export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--bg)] py-10">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1.4fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="relative h-11 w-11 overflow-hidden rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
                 <Image src="/SFC-Logo.jpeg" alt="SFC logo" fill className="object-cover" />
              </div>
              <div>
St. Andrew&apos;s Fan Club
                <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-dim)]">
                  PCEA Nairobi
                </p>
              </div>
            </div>
            
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-[var(--sfc-red)] text-[11px] uppercase tracking-[0.24em] font-semibold mb-4">
                Explore
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/football" className="text-[var(--text-dim)] hover:text-[var(--text)]">
                    Football
                  </Link>
                </li>
                <li>
                  <Link href="/formula-one" className="text-[var(--text-dim)] hover:text-[var(--text)]">
                    Formula One
                  </Link>
                </li>
                <li>
                  <Link href="/devotionals" className="text-[var(--text-dim)] hover:text-[var(--text)]">
                    Devotionals
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[var(--sfc-red)] text-[11px] uppercase tracking-[0.24em] font-semibold mb-4">
                Community
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/predictor" className="text-[var(--text-dim)] hover:text-[var(--text)]">
                    Fan Zone
                  </Link>
                </li>
                <li>
                  <Link href="/get-involved" className="text-[var(--text-dim)] hover:text-[var(--text)]">
                    Volunteer
                  </Link>
                </li>
                
                <li>
                  <Link href="/about" className="text-[var(--text-dim)] hover:text-[var(--text)]">
                    About / Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex items-end justify-end">
            <Link
              href="/admin-login"
              className="inline-flex items-center justify-center rounded-full border border-[var(--sfc-red)] bg-[rgba(220,38,38,0.05)] px-4 py-2 text-[var(--sfc-red)] text-[11px] font-semibold uppercase tracking-[0.24em] transition hover:bg-[var(--sfc-red)] hover:text-white"
            >
              Admin
            </Link>
          </div>
        </div>
        <div className="mt-10 border-t border-[var(--border)] pt-6 text-sm text-[var(--text-dim)] flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
St. Andrew&apos;s Fan Club — a ministry of PCEA St. Andrew&apos;s Church, Nairobi.
          
        </div>
      </div>
    </footer>
  );
}