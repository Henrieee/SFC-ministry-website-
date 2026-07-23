"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserAuth } from "@/hooks/useUserAuth";
import { EPL_TEAMS, useFanZonePoll } from "@/hooks/useFanZonePoll";

type FootballFixture = {
  id: string;
  home: string;
  away: string;
  date: string;
};

type F1Race = {
  id: string;
  name: string;
  date: string;
};

type LeaderboardEntry = {
  id: string;
  displayName: string;
  points: number;
};

export default function PredictorPage() {
  const { user, profile, loading, signIn, signOutUser, saveDisplayName } = useUserAuth();

  // 🔒 Safe Hydration State
  const mounted = true;


  // Predictor state
  const [fixtures, setFixtures] = useState<FootballFixture[]>([]);
  const [races, setRaces] = useState<F1Race[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const q = query(collection(db, "footballFixtures"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setFixtures(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FootballFixture, "id">) }))
      );
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "formulaOneRaces"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setRaces(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<F1Race, "id">) })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "leaderboard"), orderBy("points", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setLeaderboard(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LeaderboardEntry, "id">) }))
      );
    });
    return () => unsub();
  }, []);

  const [nameInput, setNameInput] = useState("");

  const [selectedFixtureId, setSelectedFixtureId] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [footballSaved, setFootballSaved] = useState(false);

  const [selectedRaceId, setSelectedRaceId] = useState("");
  const [pole, setPole] = useState("");
  const [winner, setWinner] = useState("");
  const [fastestLap, setFastestLap] = useState("");
  const [dotd, setDotd] = useState("");
  const [f1Saved, setF1Saved] = useState(false);

  async function handleFootballSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile || !selectedFixtureId || homeScore === "" || awayScore === "") return;

    await setDoc(doc(db, "footballPredictions", `${user.uid}_${selectedFixtureId}`), {
      uid: user.uid,
      displayName: profile.displayName,
      fixtureId: selectedFixtureId,
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
      submittedAt: serverTimestamp(),
    });

    setFootballSaved(true);
    setTimeout(() => setFootballSaved(false), 2500);
    setHomeScore("");
    setAwayScore("");
  }

  async function handleF1Submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile || !selectedRaceId || !pole.trim()) return;

    await setDoc(doc(db, "f1Predictions", `${user.uid}_${selectedRaceId}`), {
      uid: user.uid,
      displayName: profile.displayName,
      raceId: selectedRaceId,
      pole,
      winner,
      fastestLap,
      dotd,
      submittedAt: serverTimestamp(),
    });

    setF1Saved(true);
    setTimeout(() => setF1Saved(false), 2500);
    setPole("");
    setWinner("");
    setFastestLap("");
    setDotd("");
  }

  // Fan Zone state
  const { topFive, totalVotes, myVote, processing, loadingAuth, loadingTotals, vote, user: fanUser } =
    useFanZonePoll();

  const [selectedTeam, setSelectedTeam] = useState("");

  // 🔥 Dynamic Flame Geometry & Color Calculation logic
  const flameOpacity = Math.min(0.25 + totalVotes * 0.04, 1);
  const flameScale = Math.min(0.8 + totalVotes * 0.02, 1.35);
  const glowBlurRadius = Math.min(2 + totalVotes * 0.35, 10);

  // Compute tier jumps every 10 locked points
  const colorTierIndex = Math.floor(totalVotes / 10);
  const flameGradients = [
    { id: "streakClassic", textClass: "text-orange-500", labelColor: "text-orange-400" },  // Tiers 0-9
    { id: "streakPlasma",  textClass: "text-blue-500",   labelColor: "text-blue-400" },    // Tiers 10-19
    { id: "streakViolet",  textClass: "text-fuchsia-500",labelColor: "text-fuchsia-400" }, // Tiers 20-29
    { id: "streakEmerald", textClass: "text-emerald-500",labelColor: "text-emerald-400" }, // Tiers 30-39
    { id: "streakCosmic",  textClass: "text-yellow-500", labelColor: "text-yellow-400" },  // Tiers 40+
  ];
  const activeGradient = flameGradients[colorTierIndex % flameGradients.length];

  return (
    <main className="max-w-5xl mx-auto px-5 py-16">
      {/* Page Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-3 rounded-full bg-[rgba(255,255,255,0.05)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--sfc-red)] font-bold">
          <span>🏆</span>
          Predictor League
        </div>
        <h1 className="font-display text-4xl sm:text-5xl mt-6 mb-4">Make your predictions</h1>
        <p className="max-w-2xl text-[var(--text-dim)] text-base sm:text-lg leading-relaxed">
          Predict scorelines and race weekend milestones. Earn points, move up ranks, and claim community bragging rights.
        </p>
      </div>

      {/* Auth Gating Component UI blocks */}
      {loading && (
        <div className="flex items-center justify-center p-12 border border-[var(--border)] bg-[var(--surface)] rounded-[32px]">
          <p className="text-sm text-[var(--text-dim)] tracking-wider uppercase animate-pulse">Loading Hub Data...</p>
        </div>
      )}

      {!loading && !user && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[32px] p-8 text-center max-w-xl mx-auto shadow-[0_30px_80px_-50px_rgba(0,0,0,0.75)]">
          <div className="text-4xl mb-4">🔐</div>
          <h3 className="font-display text-xl mb-2 text-[var(--text)]">Unlock the Predictor Panel</h3>
          <p className="text-sm text-[var(--text-dim)] mb-6 max-w-sm mx-auto">
            Sign in with your Google account to log predictions, see where you land on the live leaderboard, and vote in weekly polls.
          </p>
          <button
            onClick={signIn}
            className="bg-[var(--sfc-red)] text-white rounded-full py-3 px-8 text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all duration-200"
          >
            Sign in with Google
          </button>
        </div>
      )}

      {!loading && user && !profile && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[32px] p-8 max-w-xl mx-auto shadow-[0_30px_80px_-50px_rgba(0,0,0,0.75)]">
          <div className="text-3xl mb-3">👋</div>
          <h3 className="font-display text-xl mb-2 text-[var(--text)]">What should we call you?</h3>
          <p className="text-sm text-[var(--text-dim)] mb-6 leading-relaxed">
            Please <strong>use your real name</strong> (e.g., First Name &amp; Surname initial) so other members of the SFC family can recognize you on the live scoreboard!
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (nameInput.trim()) saveDisplayName(nameInput.trim());
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your full name"
              maxLength={24}
              className="flex-1 bg-[var(--surface2)] border border-[var(--border)] rounded-full px-5 py-3 text-sm text-[var(--text)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--sfc-red)] transition"
            />
            <button
              type="submit"
              className="bg-[var(--sfc-red)] text-white rounded-full py-3 px-8 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition shrink-0"
            >
              Join Leaderboard
            </button>
          </form>
        </div>
      )}

      {!loading && user && profile && (
        <>
          {/* Active Status Ribbon */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--surface)] border border-[var(--border)] rounded-[24px] p-5 mb-10 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <div className="text-sm text-[var(--text-dim)]">
                Active Player Account: <span className="font-bold text-[var(--text)]">{profile.displayName}</span>
              </div>
            </div>
            <button onClick={signOutUser} className="text-xs text-[var(--text-dim)] hover:text-[var(--sfc-red)] underline underline-offset-4 transition">
              Sign out session
            </button>
          </div>

          {/* Interactive Split Grid */}
          <div className="grid lg:grid-cols-12 gap-8 mb-16">
            
            {/* Left Hand Submissions Column */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Football Box */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[32px] p-6 sm:p-8 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.75)]">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xl">⚽</span>
                  <h2 className="font-display text-lg text-[var(--text)]">Football Match Forecast</h2>
                </div>
                
                <form onSubmit={handleFootballSubmit} className="space-y-4">
                  <div>
                    <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Fixture Matchup</label>
                    <select
                      value={selectedFixtureId}
                      onChange={(e) => setSelectedFixtureId(e.target.value)}
                      className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition appearance-none cursor-pointer"
                    >
                      <option value="">Select an upcoming match...</option>
                      {fixtures.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.home} vs {f.away} {mounted ? `— ${new Date(f.date).toLocaleDateString([], { month: "short", day: "numeric" })}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Home Goals</label>
                      <input
                        type="number"
                        min="0"
                        value={homeScore}
                        onChange={(e) => setHomeScore(e.target.value)}
                        placeholder="0"
                        className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] text-center focus:outline-none focus:border-[var(--sfc-red)] transition"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Away Goals</label>
                      <input
                        type="number"
                        min="0"
                        value={awayScore}
                        onChange={(e) => setAwayScore(e.target.value)}
                        placeholder="0"
                        className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] text-center focus:outline-none focus:border-[var(--sfc-red)] transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[var(--sfc-red)] text-white rounded-full py-3 text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-[0.99] transition-all"
                  >
                    Submit Score Prediction
                  </button>

                  {footballSaved && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl p-3 text-xs text-center font-medium animate-fade-in">
                      ✨ Prediction successfully captured — good luck!
                    </div>
                  )}
                </form>
              </div>

              {/* Formula 1 Box */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[32px] p-6 sm:p-8 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.75)]">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xl">🏁</span>
                  <h2 className="font-display text-lg text-[var(--text)]">Motorsport Weekend Forecast</h2>
                </div>
                
                <form onSubmit={handleF1Submit} className="space-y-4">
                  <div>
                    <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Grand Prix Race</label>
                    <select
                      value={selectedRaceId}
                      onChange={(e) => setSelectedRaceId(e.target.value)}
                      className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition appearance-none cursor-pointer"
                    >
                      <option value="">Select a Grand Prix weekend...</option>
                      {races.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} {mounted ? `— ${new Date(r.date).toLocaleDateString([], { month: "short", day: "numeric" })}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Pole Position</label>
                      <input
                        type="text"
                        value={pole}
                        onChange={(e) => setPole(e.target.value)}
                        placeholder="Driver last name"
                        className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition"
                      />
                    </div>

                    <div>
                      <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Podium Winner</label>
                      <input
                        type="text"
                        value={winner}
                        onChange={(e) => setWinner(e.target.value)}
                        placeholder="Driver last name"
                        className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition"
                      />
                    </div>

                    <div>
                      <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Fastest Lap</label>
                      <input
                        type="text"
                        value={fastestLap}
                        onChange={(e) => setFastestLap(e.target.value)}
                        placeholder="Driver last name"
                        className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition"
                      />
                    </div>

                    <div>
                      <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Driver of Day</label>
                      <input
                        type="text"
                        value={dotd}
                        onChange={(e) => setDotd(e.target.value)}
                        placeholder="Driver last name"
                        className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[var(--sfc-red)] text-white rounded-full py-3 text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-[0.99] transition-all"
                  >
                    Submit F1 Predictions
                  </button>

                  {f1Saved && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl p-3 text-xs text-center font-medium animate-fade-in">
                      🏎️ Race predictions safely recorded — grid points pending!
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Right Hand Leaderboard Panel */}
            <div className="lg:col-span-5">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[32px] p-6 sm:p-8 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.75)] sticky top-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-base text-[var(--text)]">Season Standings</h2>
                  <span className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-mono-sfc">Global</span>
                </div>
                
                {leaderboard.length === 0 ? (
                  <p className="text-sm text-[var(--text-dim)] py-8 text-center border border-dashed border-[var(--border)] rounded-2xl bg-[rgba(255,255,255,0.01)]">
                    No points recorded yet.<br/>Be the first to submit a forecast!
                  </p>
                ) : (
                  <div className="space-y-1">
                    {leaderboard.map((u, i) => (
                      <div
                        key={u.id}
                        className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-[rgba(255,255,255,0.02)] transition"
                      >
                        <div className="font-mono-sfc text-[var(--text-dim)] w-5 text-xs text-center font-bold">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[var(--surface2)] border border-[var(--border)] flex items-center justify-center font-display text-[10px] text-[var(--text)] font-semibold shrink-0">
                          {u.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-[var(--text)] truncate">{u.displayName}</div>
                        </div>
                        <div className="font-mono-sfc text-xs text-[var(--sfc-red)] font-bold bg-[rgba(227,27,35,0.08)] px-2.5 py-1 rounded-full shrink-0">
                          {u.points} pts
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* 📸 Fan Zone Hub Section Header */}
          <div className="mt-20 mb-8 border-t border-[var(--border)] pt-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.03)] border border-[var(--border)] px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--sfc-red)]">
              📸 Fan Zone
            </div>
            <h2 className="font-display text-3xl sm:text-4xl mt-4 mb-2">Community Hub</h2>
            <p className="text-[var(--text-dim)] max-w-xl text-sm sm:text-base">
              Interact with the community beyond match setups. Cast local title votes, review notices, and access club assets.
            </p>

            {/* Live Community Pulse Status Bar (Dynamic Reacting Streak Fire Engine) */}
            <div className="flex gap-3 mt-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.02)] border border-[var(--border)] px-3.5 py-1.5 text-xs text-[var(--text-dim)] shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                <div 
                  className="relative flex items-center justify-center w-4 h-4 shrink-0 transition-all duration-500 ease-out"
                  style={{
                    transform: `scale(${flameScale})`,
                    opacity: flameOpacity
                  }}
                >
                  {/* Dynamic Gradient Engine Defs */}
                  <svg className="absolute w-0 h-0 invisible">
                    <defs>
                      <linearGradient id="streakClassic" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#dc2626" />
                        <stop offset="50%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#facc15" />
                      </linearGradient>
                      <linearGradient id="streakPlasma" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#1e3a8a" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#93c5fd" />
                      </linearGradient>
                      <linearGradient id="streakViolet" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#701a75" />
                        <stop offset="50%" stopColor="#d946ef" />
                        <stop offset="100%" stopColor="#fbcfe8" />
                      </linearGradient>
                      <linearGradient id="streakEmerald" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#064e3b" />
                        <stop offset="50%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#a7f3d0" />
                      </linearGradient>
                      <linearGradient id="streakCosmic" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#4c1d95" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#fde047" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Adaptive Glow Layer Behind */}
                  <svg 
                    className={`absolute w-4 h-4 blur-[3px] opacity-70 scale-125 animate-[pulse_0.6s_infinite_alternate] ${activeGradient.textClass}`} 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                    style={{ filter: `blur(${glowBlurRadius}px)` }}
                  >
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                  </svg>

                  {/* TikTok Core Streak Flame */}
                  <svg 
                    className="relative w-4 h-4 animate-[bounce_0.8s_infinite_alternate]" 
                    viewBox="0 0 24 24" 
                    fill={`url(#${activeGradient.id})`}
                  >
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                  </svg>
                </div>
                <div>
                  <span className={`font-bold font-mono-sfc mr-1 transition-colors duration-500 ${activeGradient.labelColor}`}>
                    {totalVotes}
                  </span> 
                  Predictions Locked
                </div>
              </div>
            </div>
          </div>



          {/* Dashboard Grid Layout Split Container */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Live Dynamic Poll Column */}
            <div className="lg:col-span-7">
              <h3 className="font-mono-sfc text-xs uppercase tracking-widest text-[var(--text-dim)] font-bold mb-4 pl-1">Active Community Poll</h3>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[32px] p-6 sm:p-8 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.75)]">
                <div className="font-display text-base sm:text-lg mb-6 text-[var(--text)]">Who wins the English Premier League title race this season?</div>

                {topFive.length === 0 && (
                  <p className="text-sm text-[var(--text-dim)] py-4 pl-1">No community votes submitted yet. Launch your option below!</p>
                )}

                <div className="space-y-3">
                  {topFive.map(({ team, count }) => {
                    const pct = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
                    return (
                      <div
                        key={team}
                        className="w-full flex items-center gap-4 border border-[var(--border)] bg-[rgba(255,255,255,0.01)] rounded-xl p-3.5"
                      >
                        <span className="w-24 sm:w-32 text-xs sm:text-sm font-semibold truncate text-[var(--text)]">{team}</span>
                        <div className="flex-1 h-2 bg-[var(--surface2)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--sfc-red)] rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-mono-sfc text-xs text-[var(--text)] font-bold w-12 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>

                {fanUser && myVote && (
                  <p className="text-xs text-[var(--text-dim)] mt-4 pl-1 font-medium">
                    Your submitted selection: <span className="text-[var(--text)] font-semibold">{myVote}</span>
                  </p>
                )}

                {fanUser && !myVote && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (selectedTeam) {
                        vote(selectedTeam);
                        setSelectedTeam("");
                      }
                    }}
                    className="flex flex-col sm:flex-row gap-3 mt-6 border-t border-[var(--border)] pt-5"
                  >
                    <select
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      disabled={processing || loadingTotals || loadingAuth}
                      className="flex-1 bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition cursor-pointer disabled:opacity-50"
                    >
                      <option value="">Select your chosen champion...</option>
                      {EPL_TEAMS.map((team) => (
                        <option key={team} value={team}>
                          {team}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={processing || loadingTotals || loadingAuth || !selectedTeam}
                      className="rounded-full bg-[var(--sfc-red)] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-40 hover:brightness-110 transition"
                    >
                      Lock Vote
                    </button>
                  </form>
                )}

                {processing && (
                  <p className="text-xs text-[var(--sfc-red)] font-mono-sfc mt-3 pl-1 animate-pulse">Syncing selection onto server database...</p>
                )}
              </div>
            </div>

            {/* Community Chat Column */}
            <div className="lg:col-span-5">
              <h3 className="font-mono-sfc text-xs uppercase tracking-widest text-[var(--text-dim)] font-bold mb-4 pl-1">Community Chat</h3>
              <div className="relative overflow-hidden bg-[var(--surface)] border border-[var(--border)] rounded-[32px] p-6 sm:p-8 flex flex-col justify-between group shadow-[0_30px_80px_-50px_rgba(0,0,0,0.75)] h-[calc(100%-2rem)]">
                <div className="absolute -inset-y-0 -right-16 w-32 bg-indigo-600/10 blur-3xl transform rotate-12 pointer-events-none" />

                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-indigo-400 font-bold mb-3 font-mono-sfc">
                    Live Sync
                  </div>
                  <h2 className="font-display text-lg mb-1.5 text-[var(--text)] flex items-center gap-2">
                    <span>💬</span> Instant Clubhouse
                  </h2>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                    Looking for direct, real-time coordination with managers during match setups, game day threads, or live score lock counters? Jump into our server.
                  </p>
                </div>

                <div className="mt-6 z-10">
                  
                    <a href="https://discord.gg/WWQM8fXYv"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl py-3 px-4 transition-all duration-200 transform active:scale-[0.99] shadow-md shadow-indigo-900/20"
                  >
                    Launch Community Discord
                  </a>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
      
    </main>
  );
}