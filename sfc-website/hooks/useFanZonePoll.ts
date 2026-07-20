"use client";

import { useEffect, useMemo, useState } from "react";
import {
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

const POLL_ID = "fan-zone";
const POLL_DOC_ID = "title-race";

export const EPL_TEAMS = [
  "Arsenal",
  "Aston Villa",
  "Bournemouth",
  "Brentford",
  "Brighton & Hove Albion",
  "Chelsea",
  "Coventry City",
  "Crystal Palace",
  "Everton",
  "Fulham",
  "Hull City",
  "Ipswich Town",
  "Leeds United",
  "Liverpool",
  "Manchester City",
  "Manchester United",
  "Newcastle United",
  "Nottingham Forest",
  "Sunderland",
  "Tottenham Hotspur",
];

type PollTotals = Record<string, number>;

export function useFanZonePoll() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [totals, setTotals] = useState<PollTotals>({});
  const [loadingTotals, setLoadingTotals] = useState(true);

  const [myVote, setMyVote] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const totalsRef = useMemo(() => {
    // Stored at: fanZonePoll/{POLL_ID}/polls/{POLL_DOC_ID}
    return doc(db, "fanZonePoll", POLL_ID, "polls", POLL_DOC_ID);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(totalsRef, (snap) => {
      const data = snap.data() as { totals?: PollTotals } | undefined;
      setTotals(data?.totals ?? {});
      setLoadingTotals(false);
    });
    return () => unsub();
  }, [totalsRef]);

  useEffect(() => {
    if (!user) {
      // If user logs out, clear user's vote.
      queueMicrotask(() => setMyVote(null));
      return;
    }

    // We store user vote in: fanZonePoll/{POLL_ID}/votes/{uid}
    const voteRef = doc(db, "fanZonePoll", POLL_ID, "votes", user.uid);
    const unsub = onSnapshot(voteRef, (snap) => {
      const data = snap.data() as { team?: string } | undefined;
      setMyVote(data?.team ?? null);
    });

    return () => unsub();
  }, [user]);

  async function vote(team: string) {
    if (!user) return;
    if (processing) return;
    if (myVote) return;
    if (!EPL_TEAMS.includes(team)) return;

    setProcessing(true);
    try {
      const userVoteRef = doc(db, "fanZonePoll", POLL_ID, "votes", user.uid);

      await runTransaction(db, async (tx) => {
        // All reads must happen before any writes in a Firestore transaction.
        const totalsSnap = await tx.get(totalsRef);
        const existingVoteSnap = await tx.get(userVoteRef);

        if (existingVoteSnap.exists()) {
          // already voted
          return;
        }

        const currentTotals = (totalsSnap.exists() ? (totalsSnap.data()?.totals as PollTotals | undefined) : {}) ?? {};
        const updatedTotals: PollTotals = {
          ...currentTotals,
          [team]: (currentTotals[team] ?? 0) + 1,
        };

        tx.set(
          totalsRef,
          { totals: updatedTotals, updatedAt: serverTimestamp() },
          { merge: true }
        );
        tx.set(
          userVoteRef,
          { team, votedAt: serverTimestamp() },
          { merge: true }
        );
      });
    } finally {
      setProcessing(false);
    }
  }

  const totalVotes = useMemo(() => {
    return Object.values(totals).reduce((sum, v) => sum + v, 0);
  }, [totals]);

  const topFive = useMemo(() => {
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([team, count]) => ({ team, count }));
  }, [totals]);

  return {
    totals,
    topFive,
    totalVotes,
    myVote,
    processing,
    loadingAuth,
    loadingTotals,
    vote,
    user,
  };
}