"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserAuth } from "@/hooks/useUserAuth";

const MINISTRIES = [
  "Media", "Photography", "Snacks", "Setup", "Cleanup",
  "Security", "Hospitality", "Worship", "Tech", "Other",
];

const FAQS = [
  {
    category: "Predictor League",
    questions: [
      {
        q: "How are points calculated for match predictions?",
        a: "Points are awarded based on accuracy: 3 points for a perfect scoreline lock, 1 point for predicting the correct match outcome (Win/Draw/Loss) but wrong goal count, and 0 points otherwise.",
      },
      {
        q: "When do prediction windows close?",
        a: "All locks seal exactly 5 minutes before the scheduled kick-off or Grand Prix formation lap. No modifications can be processed after the countdown hits zero.",
      },
    ],
  },
  {
    category: "Fan Zone & Account",
    questions: [
      {
        q: "Why can't I see my real name on the live leaderboard?",
        a: "Make sure you have updated your 'Display Name' in your profile setup. If you just changed it, pull-to-refresh or wait up to 30 seconds for the global leaderboard cache to sync.",
      },
      {
        q: "What are the tier milestones for the Community Hub fire streak?",
        a: "The global flame levels up across 5 visual tiers (Classic Orange, Plasma Blue, Neon Violet, Emerald Ghost, and Cosmic Flare) for every 10 community submissions locked into the hub.",
      },
    ],
  },
];

export default function SupportAndInvolvedPage() {
  const { user, profile } = useUserAuth();

  // --- 🛠️ Support Form State ---
  const [ticketCategory, setTicketCategory] = useState("General Query");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // --- 🙌 Volunteer Form State ---
  const [volName, setVolName] = useState("");
  const [volContact, setVolContact] = useState("");
  const [volMinistries, setVolMinistries] = useState<string[]>([]);
  const [volSubmitted, setVolSubmitted] = useState(false);

  // --- 📂 FAQ Accordion State ---
  const [openFaqIndex, setOpenFaqIndex] = useState<string | null>(null);

  // Safe client-side auth data initialization
  useEffect(() => {
    const email = user?.email;
    if (email) queueMicrotask(() => setTicketEmail(email));

    const displayName = profile?.displayName;
    if (displayName) queueMicrotask(() => setVolName(displayName));

    const contact = user?.email || user?.phoneNumber || "";
    if (contact) queueMicrotask(() => setVolContact(contact));
  }, [user, profile]);


  const toggleFaq = (id: string) => {
    setOpenFaqIndex(openFaqIndex === id ? null : id);
  };

  const toggleMinistry = (m: string) => {
    setVolMinistries((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  async function handleTicketSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketMessage.trim() || !ticketEmail.trim()) return;

    setTicketSubmitting(true);
    try {
      await addDoc(collection(db, "supportTickets"), {
        uid: user?.uid || "anonymous",
        displayName: profile?.displayName || "Guest Explorer",
        email: ticketEmail,
        category: ticketCategory,
        message: ticketMessage.trim(),
        status: "open",
        createdAt: serverTimestamp(),
      });

      setTicketSuccess(true);
      setTicketMessage("");
      setTimeout(() => setTicketSuccess(false), 5000);
    } catch (err) {
      console.error("Error logging support ticket: ", err);
    } finally {
      setTicketSubmitting(false);
    }
  }

  async function handleVolunteerSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!volName.trim() || volMinistries.length === 0) return;

    try {
      await addDoc(collection(db, "volunteers"), {
        uid: user?.uid || "anonymous",
        name: volName.trim(),
        contact: volContact.trim(),
        ministries: volMinistries,
        submittedAt: serverTimestamp(),
      });

      setVolSubmitted(true);
      setTimeout(() => {
        window.location.href = "/fan-zone";
      }, 1500);
    } catch (err) {
      console.error("Error signing up volunteer: ", err);
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-5 py-16">
      {/* Consolidated Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-3 rounded-full bg-[rgba(255,255,255,0.05)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--sfc-red)] font-bold">
          <span>🤝</span>
          Hub Operations
        </div>
        <h1 className="font-display text-4xl sm:text-5xl mt-6 mb-4">Support &amp; Stewardship</h1>
        <p className="max-w-2xl text-[var(--text-dim)] text-base sm:text-lg leading-relaxed">
          Get assistance with score computations, contribute financially to our local fellowship initiatives, or register to serve inside active community task forces.
        </p>
      </div>

      {/* Financial Giving Banner (Spans Full Width now) */}
      <div className="bg-gradient-to-br from-[rgba(200,16,46,0.08)] to-transparent border border-[var(--border)] rounded-[24px] p-6 sm:p-8 mb-12">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="max-w-xl">
            <h2 className="font-display text-xl mb-2 text-[var(--text)] flex items-center gap-2">
              <span>💳</span> Financial Giving
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-dim)] leading-relaxed">
              Your structural tithes help scale local screening experiences, matchday hospitality operations, and outreach fellowships. Thank you for sowing back into our core family framework.
            </p>
          </div>
          
          <div className="shrink-0 w-full md:w-auto">
            <div className="grid grid-cols-2 gap-4 max-w-sm mb-3">
              <div className="bg-[var(--surface2)] border border-[var(--border)] rounded-xl p-4">
                <div className="font-mono-sfc text-[9px] uppercase tracking-wider text-[var(--text-dim)] mb-1">
                  M-Pesa Paybill
                </div>
                <div className="font-display text-xl font-bold text-[var(--text)]">903800</div>
              </div>
              <div className="bg-[var(--surface2)] border border-[var(--border)] rounded-xl p-4">
                <div className="font-mono-sfc text-[9px] uppercase tracking-wider text-[var(--text-dim)] mb-1">
                  Target Account
                </div>
                <div className="font-display text-xl font-bold text-[var(--sfc-red)]">SFC</div>
              </div>
            </div>
            <p className="text-[10px] text-[var(--text-dim)] font-mono-sfc text-left md:text-right">
PCEA St. Andrew&apos;s Church — Paybill 903800, Account: SFC.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Content Split Grid */}
      <div className="grid lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: FAQs & Core Help Desk Requests */}
        <div className="lg:col-span-7 space-y-10">
          {/* FAQ Block */}
          <div className="space-y-4">
            <h3 className="font-mono-sfc text-xs uppercase tracking-widest text-[var(--text-dim)] font-bold pl-1">
              Frequently Asked Documentation
            </h3>
            <div className="space-y-2.5">
              {FAQS.map((cat, catIdx) => (
                <div key={catIdx} className="space-y-2">
                  <h4 className="text-[10px] font-bold text-[var(--sfc-red)] uppercase tracking-widest font-mono-sfc pt-2 pl-1">
                    {cat.category}
                  </h4>
                  {cat.questions.map((faq, faqIdx) => {
                    const uniqueId = `${catIdx}-${faqIdx}`;
                    const isOpen = openFaqIndex === uniqueId;
                    return (
                      <div
                        key={faqIdx}
                        className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden transition-all duration-300"
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(uniqueId)}
                          className="w-full flex items-center justify-between gap-4 p-4 text-left text-xs font-semibold text-[var(--text)] hover:bg-[rgba(255,255,255,0.01)] transition"
                        >
                          <span>{faq.q}</span>
                          <span className={`text-[var(--text-dim)] text-[9px] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                            ▼
                          </span>
                        </button>
                        <div
                          className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            isOpen ? "max-h-48 border-t border-[rgba(255,255,255,0.02)]" : "max-h-0"
                          }`}
                        >
                          <p className="p-4 text-xs leading-relaxed text-[var(--text-dim)] bg-[rgba(0,0,0,0.15)]">
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Support Ticket Desk */}
          <div className="space-y-4">
            <h3 className="font-mono-sfc text-xs uppercase tracking-widest text-[var(--text-dim)] font-bold pl-1">
              File a Support Ticket
            </h3>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[24px] p-6 shadow-sm">
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono-sfc text-[9px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      required
                      value={ticketEmail}
                      onChange={(e) => setTicketEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition"
                    />
                  </div>
                  <div>
                    <label className="block font-mono-sfc text-[9px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">
                      Classification
                    </label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition cursor-pointer appearance-none"
                    >
                      <option value="General Query">General Query</option>
                      <option value="Predictor Calculation Error">Predictor Score Calculation</option>
                      <option value="Account Authorization">Profile Sync &amp; Auth</option>
                      <option value="Feature Suggestion">Feature Suggestion</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono-sfc text-[9px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">
                    Describe your query
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Provide background context so our administration team can audit parameters..."
                    className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--sfc-red)] transition resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={ticketSubmitting}
                  className="w-full bg-[var(--sfc-red)] disabled:opacity-40 text-white rounded-full py-2.5 text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-[0.99] transition-all"
                >
                  {ticketSubmitting ? "Transmitting Log..." : "Transmit Log Request"}
                </button>

                {ticketSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-3 text-xs text-center font-medium animate-fade-in">
                    🚀 Ticket filed successfully! Support will process queries shortly.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Ministry Action Service Sign-up Interface */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="space-y-4">
            <h3 className="font-mono-sfc text-xs uppercase tracking-widest text-[var(--text-dim)] font-bold pl-1">
              Active Stewardship Registry
            </h3>
            
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[24px] p-6 shadow-md">
              <div className="mb-4">
                <h4 className="font-display text-base text-[var(--text)] mb-1">Volunteer Sign-up</h4>
                <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                  Serve where you are gifted, and actively build the infrastructure of our local assemblies.
                </p>
              </div>

              {volSubmitted ? (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl p-4 text-xs text-center font-medium space-y-1">
                  <div>✨ Alignment log capture successful!</div>
                  <div className="text-[var(--text-dim)] font-normal">Redirecting back to central fan hub zone...</div>
                </div>
              ) : (
                <form onSubmit={handleVolunteerSubmit} className="space-y-4">
                  <div>
                    <label className="block font-mono-sfc text-[9px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={volName}
                      onChange={(e) => setVolName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-sfc text-[9px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">
                      Phone or Email
                    </label>
                    <input
                      type="text"
                      required
                      value={volContact}
                      onChange={(e) => setVolContact(e.target.value)}
                      placeholder="07XX XXX XXX or account email"
                      className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-sfc text-[9px] uppercase tracking-wider text-[var(--text-dim)] mb-2 pl-1">
                      Select areas of deployment
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {MINISTRIES.map((m) => {
                        const isChecked = volMinistries.includes(m);
                        return (
                          <label
                            key={m}
                            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs cursor-pointer select-none border transition ${
                              isChecked
                                ? "bg-[rgba(227,27,35,0.06)] border-[var(--sfc-red)] text-[var(--text)]"
                                : "bg-[var(--surface2)] border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleMinistry(m)}
                              className="accent-[var(--sfc-red)] scale-100 rounded"
                            />
                            {m}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={volMinistries.length === 0}
                    className="w-full bg-[var(--sfc-red)] text-white font-bold rounded-full py-3 text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.99] disabled:opacity-40 transition-all mt-2"
                  >
                    Sign Up to Serve
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}