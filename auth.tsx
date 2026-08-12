"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { COMPANY } from "@/lib/brand";

export interface Session {
  name: string;
  email: string;
  employeeId: string;
  signedInAt: string;
}

const STORAGE_KEY = "nimbuspost.session.v1";

interface AuthValue {
  session: Session | null;
  ready: boolean;
  signIn: (input: { name: string; email: string; employeeId: string }) =>
    | { ok: true }
    | { ok: false; error: string };
  signOut: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function validateEmail(email: string): string | null {
  const value = email.trim().toLowerCase();
  if (!value) return "Email is required.";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(value)) return "Enter a valid email address.";
  if (!value.endsWith(`@${COMPANY.emailDomain}`)) {
    return `Use your @${COMPANY.emailDomain} email address.`;
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSession(JSON.parse(raw) as Session);
    } catch {
      /* corrupt or unavailable storage — treat as signed out */
    }
    setReady(true);
  }, []);

  const signIn = useCallback<AuthValue["signIn"]>((input) => {
    const emailError = validateEmail(input.email);
    if (emailError) return { ok: false, error: emailError };

    const employeeId = input.employeeId.trim();
    if (!employeeId) return { ok: false, error: "Employee ID is required." };

    const email = input.email.trim().toLowerCase();
    const next: Session = {
      name:
        input.name.trim() ||
        email
          .split("@")[0]
          .replace(/[._-]+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      employeeId,
      signedInAt: new Date().toISOString(),
    };
    setSession(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* non-fatal: session just won't survive a reload */
    }
    return { ok: true };
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ session, ready, signIn, signOut }),
    [session, ready, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
