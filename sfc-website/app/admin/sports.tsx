"use client";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type FootballFixture = {
  id: string;
  league: string;
  home: string;
  away: string;
  date: string;
  venue: string;
  baseCount: number;
};

type F1Race = {
  id: string;
  name: string;
  circuit: string;
  date: string;
  sessions: string;
  baseCount: number;
};

type DriverStanding = {
  id: string;
  position: number;
  driver: string;
  team: string;
  points: number;
};

const DEFAULT_FIXTURE = {
  league: "Premier League",
  home: "Arsenal",
  away: "Chelsea",
  date: new Date(Date.now() + 7 * 86400000).toISOString(),
  venue: "Fellowship Hall",
  baseCount: 100,
};

const DEFAULT_RACE = {
  name: "British Grand Prix",
  circuit: "Silverstone Circuit",
  date: new Date(Date.now() + 7 * 86400000).toISOString(),
  sessions: "FP1 · FP2 · FP3 · Qualifying · Race",
  baseCount: 60,
};

const DEFAULT_STANDING = {
  position: 1,
  driver: "M. Verstappen",
  team: "Red Bull",
  points: 244,
};

export default function AdminSportsManager() {
  const [fixtures, setFixtures] = useState<FootballFixture[]>([]);
  const [editingFixtureId, setEditingFixtureId] = useState<string | null>(null);

  const [races, setRaces] = useState<F1Race[]>([]);
  const [editingRaceId, setEditingRaceId] = useState<string | null>(null);

  const [standings, setStandings] = useState<DriverStanding[]>([]);
  const [editingStandingId, setEditingStandingId] = useState<string | null>(null);

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

  useEffect(() => {
    const q = query(collection(db, "driverStandings"), orderBy("position", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setStandings(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DriverStanding, "id">) })));
    });
    return () => unsub();
  }, []);

  async function handleAddFixture() {
    const created = await addDoc(collection(db, "footballFixtures"), {
      ...DEFAULT_FIXTURE,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setEditingFixtureId(created.id);
  }

  async function handleSaveFixture(id: string, data: Omit<FootballFixture, "id">) {
    await setDoc(
      doc(db, "footballFixtures", id),
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    setEditingFixtureId(null);
  }

  async function handleDeleteFixture(id: string) {
    if (!confirm("Delete this fixture?")) return;
    await deleteDoc(doc(db, "footballFixtures", id));
  }

  async function handleAddRace() {
    const created = await addDoc(collection(db, "formulaOneRaces"), {
      ...DEFAULT_RACE,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setEditingRaceId(created.id);
  }

  async function handleSaveRace(id: string, data: Omit<F1Race, "id">) {
    await setDoc(
      doc(db, "formulaOneRaces", id),
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    setEditingRaceId(null);
  }

  async function handleDeleteRace(id: string) {
    if (!confirm("Delete this race?")) return;
    await deleteDoc(doc(db, "formulaOneRaces", id));
  }

  async function handleAddStanding() {
    const created = await addDoc(collection(db, "driverStandings"), {
      ...DEFAULT_STANDING,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setEditingStandingId(created.id);
  }

  async function handleSaveStanding(id: string, data: Omit<DriverStanding, "id">) {
    await setDoc(
      doc(db, "driverStandings", id),
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    setEditingStandingId(null);
  }

  async function handleDeleteStanding(id: string) {
    if (!confirm("Delete this standings row?")) return;
    await deleteDoc(doc(db, "driverStandings", id));
  }

  return (
    <div className="mb-10 space-y-12 animate-fade-in">
      {/* Subheader Title Banner */}
      <div className="border-b border-[var(--border)] pb-5">
        <h2 className="font-display text-xl text-[var(--text)]">Manage Football & Formula One</h2>
        <p className="text-xs text-[var(--text-dim)] mt-1">Configure active matching schedules and driver standings variables.</p>
      </div>

      {/* SECTION: FOOTBALL FIXTURES */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display text-base text-[var(--text)] flex items-center gap-2">⚽ Football Fixtures</h3>
            <p className="text-xs text-[var(--text-dim)] mt-0.5">Deploy or adjust active matching rosters across leagues.</p>
          </div>
          <button 
            onClick={handleAddFixture} 
            className="rounded-full bg-[var(--sfc-red)] text-white font-mono-sfc text-xs font-bold uppercase tracking-wider py-2.5 px-5 hover:brightness-110 active:scale-[0.98] transition self-start sm:self-auto"
          >
            Add Fixture
          </button>
        </div>

        <div className="grid gap-4">
          {fixtures.map((fixture) => (
            <div key={fixture.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm transition hover:border-[rgba(255,255,255,0.08)]">
              {editingFixtureId === fixture.id ? (
                <FixtureEditor
                  fixture={fixture}
                  onSave={(data) => handleSaveFixture(fixture.id, data)}
                  onCancel={() => setEditingFixtureId(null)}
                  onDelete={() => handleDeleteFixture(fixture.id)}
                />
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-[var(--text)] tracking-tight">{fixture.home} <span className="text-[var(--text-dim)] font-normal text-xs px-1">vs</span> {fixture.away}</div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-[var(--text-dim)]">
                      <span className="font-medium text-[var(--text)]">{fixture.league}</span>
                      <span className="opacity-40">•</span>
                      <span>📍 {fixture.venue}</span>
                      <span className="opacity-40">•</span>
                      <span className="font-mono-sfc text-[11px] font-medium text-[var(--sfc-red)]">{new Date(fixture.date).toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'})}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border-t border-[rgba(255,255,255,0.03)] sm:border-t-0 pt-3 sm:pt-0">
                    <button onClick={() => setEditingFixtureId(fixture.id)} className="rounded-xl px-4 py-1.5 bg-[var(--surface2)] text-xs font-bold text-[var(--text)] border border-[var(--border)] hover:brightness-110 transition">Edit</button>
                    <button onClick={() => handleDeleteFixture(fixture.id)} className="rounded-xl px-4 py-1.5 bg-red-950/40 border border-red-900/30 text-xs font-bold text-red-400 hover:bg-red-900/40 transition">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION: F1 RACES */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display text-base text-[var(--text)] flex items-center gap-2">🏁 Formula One Races</h3>
            <p className="text-xs text-[var(--text-dim)] mt-0.5">Manage full weekend event blocks and hosting timelines.</p>
          </div>
          <button 
            onClick={handleAddRace} 
            className="rounded-full bg-[var(--sfc-red)] text-white font-mono-sfc text-xs font-bold uppercase tracking-wider py-2.5 px-5 hover:brightness-110 active:scale-[0.98] transition self-start sm:self-auto"
          >
            Add Race
          </button>
        </div>

        <div className="grid gap-4">
          {races.map((race) => (
            <div key={race.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm transition hover:border-[rgba(255,255,255,0.08)]">
              {editingRaceId === race.id ? (
                <RaceEditor
                  race={race}
                  onSave={(data) => handleSaveRace(race.id, data)}
                  onCancel={() => setEditingRaceId(null)}
                  onDelete={() => handleDeleteRace(race.id)}
                />
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-[var(--text)] tracking-tight">{race.name}</div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-[var(--text-dim)]">
                      <span className="font-medium text-[var(--text)]">🏎️ {race.circuit}</span>
                      <span className="opacity-40">•</span>
                      <span className="font-mono-sfc text-[11px] font-medium text-[var(--sfc-red)]">{new Date(race.date).toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'})}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border-t border-[rgba(255,255,255,0.03)] sm:border-t-0 pt-3 sm:pt-0">
                    <button onClick={() => setEditingRaceId(race.id)} className="rounded-xl px-4 py-1.5 bg-[var(--surface2)] text-xs font-bold text-[var(--text)] border border-[var(--border)] hover:brightness-110 transition">Edit</button>
                    <button onClick={() => handleDeleteRace(race.id)} className="rounded-xl px-4 py-1.5 bg-red-950/40 border border-red-900/30 text-xs font-bold text-red-400 hover:bg-red-900/40 transition">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION: F1 DRIVER STANDINGS */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display text-base text-[var(--text)] flex items-center gap-2">📊 F1 Driver Standings</h3>
            <p className="text-xs text-[var(--text-dim)] mt-0.5">Control live global positioning scores for championship lookups.</p>
          </div>
          <button 
            onClick={handleAddStanding} 
            className="rounded-full bg-[var(--sfc-red)] text-white font-mono-sfc text-xs font-bold uppercase tracking-wider py-2.5 px-5 hover:brightness-110 active:scale-[0.98] transition self-start sm:self-auto"
          >
            Add Row
          </button>
        </div>

        <div className="grid gap-4">
          {standings.map((standing) => (
            <div key={standing.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm transition hover:border-[rgba(255,255,255,0.08)]">
              {editingStandingId === standing.id ? (
                <StandingEditor
                  standing={standing}
                  onSave={(data) => handleSaveStanding(standing.id, data)}
                  onCancel={() => setEditingStandingId(null)}
                  onDelete={() => handleDeleteStanding(standing.id)}
                />
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="font-mono-sfc text-sm font-bold text-[var(--sfc-red)] bg-[rgba(255,255,255,0.02)] border border-[var(--border)] h-9 w-9 rounded-xl flex items-center justify-center shrink-0">
                      #{standing.position}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--text)] tracking-tight">{standing.driver}</div>
                      <div className="text-xs text-[var(--text-dim)] mt-0.5">{standing.team}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-[rgba(255,255,255,0.03)] sm:border-t-0 pt-3 sm:pt-0">
                    <div className="font-mono-sfc font-bold text-sm text-[var(--text)] px-2">{standing.points} <span className="text-[var(--text-dim)] text-xs font-normal">pts</span></div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingStandingId(standing.id)} className="rounded-xl px-4 py-1.5 bg-[var(--surface2)] text-xs font-bold text-[var(--text)] border border-[var(--border)] hover:brightness-110 transition">Edit</button>
                      <button onClick={() => handleDeleteStanding(standing.id)} className="rounded-xl px-4 py-1.5 bg-red-950/40 border border-red-900/30 text-xs font-bold text-red-400 hover:bg-red-900/40 transition">Delete</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function FixtureEditor({ fixture, onSave, onCancel, onDelete }: {
  fixture: FootballFixture;
  onSave: (data: Omit<FootballFixture, "id">) => Promise<void>;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [league, setLeague] = useState(fixture.league);
  const [home, setHome] = useState(fixture.home);
  const [away, setAway] = useState(fixture.away);
  const [date, setDate] = useState(fixture.date);
  const [venue, setVenue] = useState(fixture.venue);
  const [baseCount, setBaseCount] = useState(fixture.baseCount);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ league, home, away, date, venue, baseCount });
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">League</label>
          <input value={league} onChange={(e) => setLeague(e.target.value)} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition" />
        </div>
        <div>
          <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Venue</label>
          <input value={venue} onChange={(e) => setVenue(e.target.value)} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Home team</label>
          <input value={home} onChange={(e) => setHome(e.target.value)} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition" />
        </div>
        <div>
          <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Away team</label>
          <input value={away} onChange={(e) => setAway(e.target.value)} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Date (ISO)</label>
          <input value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition font-mono-sfc" />
        </div>
        <div>
          <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Base count</label>
          <input
            type="number"
            value={baseCount}
            onChange={(e) => setBaseCount(Number(e.target.value))}
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition font-mono-sfc"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pt-2 border-t border-[rgba(255,255,255,0.03)]">
        <button type="submit" className="rounded-full bg-[var(--sfc-red)] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 transition">Save Changes</button>
        <button type="button" onClick={onCancel} className="rounded-full px-5 py-2 bg-[var(--surface2)] border border-[var(--border)] text-xs font-bold uppercase tracking-wider text-[var(--text)] hover:brightness-110 transition">Cancel</button>
        <button type="button" onClick={onDelete} className="rounded-full px-5 py-2 bg-red-700 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 transition ml-auto">Delete</button>
      </div>
    </form>
  );
}

function RaceEditor({ race, onSave, onCancel, onDelete }: {
  race: F1Race;
  onSave: (data: Omit<F1Race, "id">) => Promise<void>;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(race.name);
  const [circuit, setCircuit] = useState(race.circuit);
  const [date, setDate] = useState(race.date);
  const [sessions, setSessions] = useState(race.sessions);
  const [baseCount, setBaseCount] = useState(race.baseCount);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ name, circuit, date, sessions, baseCount });
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Race</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition" />
        </div>
        <div>
          <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Circuit</label>
          <input value={circuit} onChange={(e) => setCircuit(e.target.value)} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition" />
        </div>
      </div>
      <div>
        <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Sessions</label>
        <input value={sessions} onChange={(e) => setSessions(e.target.value)} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition text-xs" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Date (ISO)</label>
          <input value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition font-mono-sfc" />
        </div>
        <div>
          <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Base count</label>
          <input
            type="number"
            value={baseCount}
            onChange={(e) => setBaseCount(Number(e.target.value))}
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition font-mono-sfc"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pt-2 border-t border-[rgba(255,255,255,0.03)]">
        <button type="submit" className="rounded-full bg-[var(--sfc-red)] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 transition">Save Changes</button>
        <button type="button" onClick={onCancel} className="rounded-full px-5 py-2 bg-[var(--surface2)] border border-[var(--border)] text-xs font-bold uppercase tracking-wider text-[var(--text)] hover:brightness-110 transition">Cancel</button>
        <button type="button" onClick={onDelete} className="rounded-full px-5 py-2 bg-red-700 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 transition ml-auto">Delete</button>
      </div>
    </form>
  );
}

function StandingEditor({ standing, onSave, onCancel, onDelete }: {
  standing: DriverStanding;
  onSave: (data: Omit<DriverStanding, "id">) => Promise<void>;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [position, setPosition] = useState(standing.position);
  const [driver, setDriver] = useState(standing.driver);
  const [team, setTeam] = useState(standing.team);
  const [points, setPoints] = useState(standing.points);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ position, driver, team, points });
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Position</label>
          <input
            type="number"
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition font-mono-sfc"
          />
        </div>
        <div>
          <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Driver Name</label>
          <input value={driver} onChange={(e) => setDriver(e.target.value)} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition" />
        </div>
        <div>
          <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Racing Team</label>
          <input value={team} onChange={(e) => setTeam(e.target.value)} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition" />
        </div>
      </div>
      <div>
        <label className="block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5 pl-1">Championship Points</label>
        <input
          type="number"
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
          className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--sfc-red)] transition font-mono-sfc"
        />
      </div>
      <div className="flex flex-wrap gap-2 pt-2 border-t border-[rgba(255,255,255,0.03)]">
        <button type="submit" className="rounded-full bg-[var(--sfc-red)] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 transition">Save Row</button>
        <button type="button" onClick={onCancel} className="rounded-full px-5 py-2 bg-[var(--surface2)] border border-[var(--border)] text-xs font-bold uppercase tracking-wider text-[var(--text)] hover:brightness-110 transition">Cancel</button>
        <button type="button" onClick={onDelete} className="rounded-full px-5 py-2 bg-red-700 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 transition ml-auto">Delete</button>
      </div>
    </form>
  );
}