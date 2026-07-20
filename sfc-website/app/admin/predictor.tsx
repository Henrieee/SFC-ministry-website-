"use client";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type FootballFixture = {
  id: string;
  home: string;
  away: string;
  date: string;
  actualHome?: number;
  actualAway?: number;
  resultEntered?: boolean;
};

type F1Race = {
  id: string;
  name: string;
  date: string;
  actualPole?: string;
  actualWinner?: string;
  actualFastestLap?: string;
  actualDotd?: string;
  resultEntered?: boolean;
};

function outcome(home: number, away: number) {
  if (home > away) return "H";
  if (home < away) return "A";
  return "D";
}

export default function AdminPredictorManager() {
  const [fixtures, setFixtures] = useState<FootballFixture[]>([]);
  const [races, setRaces] = useState<F1Race[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "footballFixtures"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setFixtures(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FootballFixture, "id">) })));
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

  async function scoreFootballFixture(fixture: FootballFixture, actualHome: number, actualAway: number) {
    setBusy(fixture.id);
    await setDoc(
      doc(db, "footballFixtures", fixture.id),
      { actualHome, actualAway, resultEntered: true },
      { merge: true }
    );

    const predictionsSnap = await getDocs(
      query(collection(db, "footballPredictions"), where("fixtureId", "==", fixture.id))
    );

    const actualOutcome = outcome(actualHome, actualAway);

    for (const predDoc of predictionsSnap.docs) {
      const data = predDoc.data() as {
        uid: string;
        displayName: string;
        homeScore: number;
        awayScore: number;
        points?: number;
      };
      if (typeof data.points === "number") continue;

      let points = 0;
      if (data.homeScore === actualHome && data.awayScore === actualAway) {
        points = 3;
      } else if (outcome(data.homeScore, data.awayScore) === actualOutcome) {
        points = 1;
      }

      await updateDoc(doc(db, "footballPredictions", predDoc.id), { points });
      await setDoc(
        doc(db, "leaderboard", data.uid),
        { displayName: data.displayName, points: increment(points) },
        { merge: true }
      );
    }
    setBusy(null);
  }

  async function scoreF1Race(
    race: F1Race,
    actualPole: string,
    actualWinner: string,
    actualFastestLap: string,
    actualDotd: string
  ) {
    setBusy(race.id);
    await setDoc(
      doc(db, "formulaOneRaces", race.id),
      { actualPole, actualWinner, actualFastestLap, actualDotd, resultEntered: true },
      { merge: true }
    );

    const predictionsSnap = await getDocs(
      query(collection(db, "f1Predictions"), where("raceId", "==", race.id))
    );

    const norm = (s: string) => s.trim().toLowerCase();

    for (const predDoc of predictionsSnap.docs) {
      const data = predDoc.data() as {
        uid: string;
        displayName: string;
        pole: string;
        winner: string;
        fastestLap: string;
        dotd: string;
        points?: number;
      };
      if (typeof data.points === "number") continue;

      let points = 0;
      if (norm(data.pole) === norm(actualPole)) points += 1;
      if (norm(data.winner) === norm(actualWinner)) points += 1;
      if (norm(data.fastestLap) === norm(actualFastestLap)) points += 1;
      if (norm(data.dotd) === norm(actualDotd)) points += 1;

      await updateDoc(doc(db, "f1Predictions", predDoc.id), { points });
      await setDoc(
        doc(db, "leaderboard", data.uid),
        { displayName: data.displayName, points: increment(points) },
        { merge: true }
      );
    }
    setBusy(null);
  }

  return (
    <div className="mb-10 animate-fade-in space-y-12">
      <div className="border-b border-[var(--border)] pb-5">
        <h2 className="font-display text-xl text-[var(--text)]">Predictor Results & Scoring</h2>
        <p className="text-xs text-[var(--text-dim)] mt-1">Manage game outcomes and trigger automated global leaderboard updates.</p>
      </div>

      <section>
        <div className="mb-6">
          <h3 className="font-display text-base text-[var(--text)] flex items-center gap-2">⚽ Football Fixture Results</h3>
          <p className="text-xs text-[var(--text-dim)] mt-0.5">Input final scores to trigger automatic points allocation.</p>
        </div>
        <div className="grid gap-4">
          {fixtures.map((fixture) => (
            <FootballResultRow key={fixture.id} fixture={fixture} busy={busy === fixture.id} onScore={scoreFootballFixture} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6">
          <h3 className="font-display text-base text-[var(--text)] flex items-center gap-2">🏁 Formula One Race Results</h3>
          <p className="text-xs text-[var(--text-dim)] mt-0.5">Finalize race weekend events and award championship points.</p>
        </div>
        <div className="grid gap-4">
          {races.map((race) => (
            <F1ResultRow key={race.id} race={race} busy={busy === race.id} onScore={scoreF1Race} />
          ))}
        </div>
      </section>
    </div>
  );
}

function FootballResultRow({
  fixture,
  busy,
  onScore,
}: {
  fixture: FootballFixture;
  busy: boolean;
  onScore: (fixture: FootballFixture, actualHome: number, actualAway: number) => Promise<void>;
}) {
  const [home, setHome] = useState(fixture.actualHome?.toString() ?? "");
  const [away, setAway] = useState(fixture.actualAway?.toString() ?? "");

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="text-sm font-bold text-[var(--text)] tracking-tight">{fixture.home} <span className="text-[var(--text-dim)] font-normal text-xs px-1">vs</span> {fixture.away}</div>
          <div className="font-mono-sfc text-[11px] text-[var(--text-dim)] mt-0.5">{new Date(fixture.date).toLocaleString()}</div>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={home}
            onChange={(e) => setHome(e.target.value)}
            className="w-16 rounded-xl bg-[var(--surface2)] border border-[var(--border)] px-3 py-2 text-center text-sm font-bold text-[var(--text)] focus:border-[var(--sfc-red)] outline-none transition"
          />
          <span className="text-[var(--text-dim)] text-xs font-bold">VS</span>
          <input
            type="number"
            min="0"
            value={away}
            onChange={(e) => setAway(e.target.value)}
            className="w-16 rounded-xl bg-[var(--surface2)] border border-[var(--border)] px-3 py-2 text-center text-sm font-bold text-[var(--text)] focus:border-[var(--sfc-red)] outline-none transition"
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.03)] pt-4">
        {fixture.resultEntered ? (
          <span className="text-[10px] font-bold text-green-500 bg-green-950/30 px-2 py-1 rounded-md uppercase tracking-wider">Result Stored</span>
        ) : <div />}
        <button
          disabled={busy || home === "" || away === ""}
          onClick={() => onScore(fixture, Number(home), Number(away))}
          className="rounded-full bg-[var(--sfc-red)] text-white font-bold text-xs uppercase tracking-wider py-2 px-5 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
        >
          {fixture.resultEntered ? "Update Results" : "Save & Score"}
        </button>
      </div>
    </div>
  );
}

function F1ResultRow({
  race,
  busy,
  onScore,
}: {
  race: F1Race;
  busy: boolean;
  onScore: (race: F1Race, actualPole: string, actualWinner: string, actualFastestLap: string, actualDotd: string) => Promise<void>;
}) {
  const [pole, setPole] = useState(race.actualPole ?? "");
  const [winner, setWinner] = useState(race.actualWinner ?? "");
  const [fastestLap, setFastestLap] = useState(race.actualFastestLap ?? "");
  const [dotd, setDotd] = useState(race.actualDotd ?? "");

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
      <div className="mb-4">
        <div className="text-sm font-bold text-[var(--text)]">{race.name}</div>
        <div className="font-mono-sfc text-[11px] text-[var(--text-dim)] mt-0.5">{new Date(race.date).toLocaleString()}</div>
      </div>
      
      <div className="grid gap-3 sm:grid-cols-2 mb-5">
        {[
          { label: "Pole Position", val: pole, set: setPole },
          { label: "Race Winner", val: winner, set: setWinner },
          { label: "Fastest Lap", val: fastestLap, set: setFastestLap },
          { label: "Driver of the Day", val: dotd, set: setDotd },
        ].map((input) => (
          <div key={input.label}>
             <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1 pl-1">{input.label}</label>
             <input value={input.val} onChange={(e) => input.set(e.target.value)} className="w-full rounded-xl bg-[var(--surface2)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text)] focus:border-[var(--sfc-red)] outline-none transition" />
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.03)] pt-4">
        {race.resultEntered ? (
          <span className="text-[10px] font-bold text-green-500 bg-green-950/30 px-2 py-1 rounded-md uppercase tracking-wider">Result Stored</span>
        ) : <div />}
        <button
          disabled={busy || !pole.trim()}
          onClick={() => onScore(race, pole, winner, fastestLap, dotd)}
          className="rounded-full bg-[var(--sfc-red)] text-white font-bold text-xs uppercase tracking-wider py-2 px-5 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
        >
          {race.resultEntered ? "Update Results" : "Save & Score"}
        </button>
      </div>
    </div>
  );
}