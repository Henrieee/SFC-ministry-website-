"use client";
import { useEffect, useState } from "react";
import { doc, onSnapshot, runTransaction, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useUserAuth } from "@/hooks/useUserAuth";

export type MemberProfile = {
  displayName?: string;
  memberNumber?: string;
  photoURL?: string;
};

export function useMembership() {
  const { user, loading: authLoading, signIn, signOutUser } = useUserAuth();
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [loadingMember, setLoadingMember] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      queueMicrotask(() => {
        setMember(null);
        setLoadingMember(false);
      });
      return;
    }
    const memberRef = doc(db, "users", user.uid);
    const unsub = onSnapshot(memberRef, (snap) => {
      setMember(snap.exists() ? (snap.data() as MemberProfile) : null);
      setLoadingMember(false);
    });
    return () => unsub();
  }, [user]);


  useEffect(() => {
    if (!user) return;
    if (loadingMember) return;
    if (member?.memberNumber) return;

    async function assign() {
      const userRef = doc(db, "users", user!.uid);
      const counterRef = doc(db, "counters", "members");
      await runTransaction(db, async (tx) => {
        const userSnap = await tx.get(userRef);
        if (userSnap.data()?.memberNumber) return;
        const counterSnap = await tx.get(counterRef);
        const current = counterSnap.exists() ? ((counterSnap.data()?.count as number) ?? 0) : 0;
        const next = current + 1;
        const memberNumber = "SFC-" + String(next).padStart(2, "0");
        tx.set(counterRef, { count: next }, { merge: true });
        tx.set(userRef, { memberNumber }, { merge: true });
      });
    }
    assign().catch((err) => console.error("Failed to assign member number", err));
  }, [user, loadingMember, member]);

  async function saveDisplayName(name: string) {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), { displayName: name }, { merge: true });
  }

  async function uploadPhoto(file: File) {
    if (!user) return;
    setUploading(true);
    try {
      console.log("[useMembership] uploadPhoto start", { uid: user.uid, fileName: file.name, size: file.size });
      const storageRef = ref(storage, `memberPhotos/${user.uid}.jpg`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      console.log("[useMembership] got downloadURL");
      await setDoc(doc(db, "users", user.uid), { photoURL: url }, { merge: true });
      console.log("[useMembership] saved photoURL to users");
    } catch (err) {
      // Keep uploading spinner from getting stuck even on failures.
      console.error("[useMembership] uploadPhoto failed", err);
    } finally {
      setUploading(false);
    }
  }

  return {
    user,
    authLoading,
    signIn,
    signOutUser,
    member,
    loadingMember,
    uploading,
    uploadPhoto,
    saveDisplayName,
  };
}