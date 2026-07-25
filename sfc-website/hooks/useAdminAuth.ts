"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

const ADMIN_EMAILS = ["henrygachau139@gmail.com", "standsfanclub@gmail.com"];

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      const isAllowed = !!u && !!u.email && ADMIN_EMAILS.includes(u.email);
      setUser(isAllowed ? u : null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, loading };
}