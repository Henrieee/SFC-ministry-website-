"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserProfile = {
  displayName: string;
  email?: string;
};

export function useUserAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      try {
        setUser(u);

        if (u) {
          const snap = await getDoc(doc(db, "users", u.uid));
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          } else {
            // New user – create a profile with email from auth
            const email = u.email ?? "";
            if (email) {
              await setDoc(doc(db, "users", u.uid), {
                displayName: u.displayName ?? "",
                email,
                updatedAt: serverTimestamp(),
              }, { merge: true });
              setProfile({ displayName: u.displayName ?? "", email });
            } else {
              setProfile(null);
            }
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        // Prevent the UI from getting stuck on “Loading…” if Firestore fails.
        console.error("useUserAuth: failed to load user profile", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);


  async function signIn() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function signOutUser() {
    await signOut(auth);
  }

  async function saveDisplayName(name: string) {
    if (!user) return;
    const email = user.email ?? "";
    await setDoc(doc(db, "users", user.uid), {
      displayName: name,
      email,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    setProfile({ displayName: name, email });
  }

  return { user, profile, loading, signIn, signOutUser, saveDisplayName };
}