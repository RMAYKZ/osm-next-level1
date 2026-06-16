import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { premiumCodes } from "../data/extras";
import { validcodes } from "../data/validcodes";
import { getDb } from "../lib/firebase";
import { useAuth } from "./AuthContext";

const STORAGE_KEY    = "osm-next-level-premium";
const PREMIUM_CODE_KEY = "osm-premium-code";
const DEVICE_KEY     = "osm-device-id";
const DEVICE_COOKIE  = "osm-did";

// Site owner's account always has premium access, on any device, with no
// code needed — signing in with this email is itself the "permanent grant".
const OWNER_EMAIL = "omer@osmnextlevel.com";

// ── Device ID — stored in both localStorage + cookie for resilience ───
function getDeviceId(): string {
  // 1. Try cookie (survives localStorage clears)
  const m = document.cookie.match(new RegExp(`${DEVICE_COOKIE}=([^;]+)`));
  if (m) return m[1];

  // 2. Try localStorage
  const stored = localStorage.getItem(DEVICE_KEY);
  if (stored) {
    const exp = 365 * 24 * 3600;
    document.cookie = `${DEVICE_COOKIE}=${stored}; max-age=${exp}; SameSite=Strict`;
    return stored;
  }

  // 3. Generate new ID
  const id = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

  const exp = 365 * 24 * 3600;
  localStorage.setItem(DEVICE_KEY, id);
  document.cookie = `${DEVICE_COOKIE}=${id}; max-age=${exp}; SameSite=Strict`;
  return id;
}

// ── Firestore: check + claim code ────────────────────────────────────
// Returns:
//   'ok'      — code is valid and claimed for this device
//   'taken'   — code already claimed by a different device
//   'skip'    — Firestore unavailable, proceed without locking
type ClaimResult = "ok" | "taken" | "skip";

async function checkAndClaimCode(code: string, deviceId: string): Promise<ClaimResult> {
  try {
    const db = await getDb();
    const { doc, getDoc, setDoc, updateDoc, serverTimestamp } = await import("firebase/firestore");

    const ref  = doc(db, "usedCodes", code);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data() as { deviceId: string };
      if (data.deviceId === deviceId) return "ok";
      // Different device ID (e.g. browser data cleared) — re-claim for this device.
      // Last writer wins: legitimate owner can always reclaim their purchased code.
      await updateDoc(ref, { deviceId, reClaimedAt: serverTimestamp() });
      return "ok";
    }

    // Unclaimed — write this device as the owner
    await setDoc(ref, { deviceId, usedAt: serverTimestamp() });
    return "ok";
  } catch (err) {
    console.warn("[Premium] Firestore unavailable, skipping device lock:", err);
    return "skip";
  }
}

// ── Firestore: check if a claimed code has been revoked or expired ────────
async function checkRevocation(code: string): Promise<boolean> {
  try {
    const db = await getDb();
    const { doc, getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, "usedCodes", code));
    if (!snap.exists()) return false;
    const data = snap.data() as { revoked?: boolean; expiresAt?: { toDate: () => Date } };
    if (data.revoked === true) return true;
    if (data.expiresAt && data.expiresAt.toDate() < new Date()) return true;
    return false;
  } catch {
    return false;
  }
}

// ── Context types ─────────────────────────────────────────────────────
export type UnlockResult = "ok" | "invalid" | "taken";

interface PremiumContextType {
  isPremium: boolean;
  unlocking: boolean;
  unlock: (code: string) => Promise<UnlockResult>;
  lock: () => void;
}

const PremiumContext = createContext<PremiumContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────────────
export function PremiumProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isOwner = user?.email?.toLowerCase() === OWNER_EMAIL;
  const [unlockedByCode, setIsPremium] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });
  const isPremium = isOwner || unlockedByCode;
  const [unlocking, setUnlocking] = useState(false);

  const unlock = useCallback(async (code: string): Promise<UnlockResult> => {
    setUnlocking(true);
    try {
      const normalized = code.trim().toUpperCase();
      const deviceId   = getDeviceId();

      // 1. Check local codes (instant)
      const localAll = [...premiumCodes, ...validcodes];
      const localValid = localAll.some(c => c.toUpperCase() === normalized);

      if (!localValid) return "invalid";

      // 2. Code is valid — check device lock via Firestore
      const claim = await checkAndClaimCode(normalized, deviceId);
      if (claim === "taken") return "taken";

      // 3. Unlock!
      localStorage.setItem(STORAGE_KEY, "true");
      localStorage.setItem(PREMIUM_CODE_KEY, normalized);
      setIsPremium(true);
      return "ok";
    } finally {
      setUnlocking(false);
    }
  }, []);

  const lock = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PREMIUM_CODE_KEY);
    setIsPremium(false);
  }, []);

  // On mount: check if the stored code has been revoked or expired in Firestore
  useEffect(() => {
    const storedCode = localStorage.getItem(PREMIUM_CODE_KEY);
    if (!storedCode || localStorage.getItem(STORAGE_KEY) !== "true") return;
    checkRevocation(storedCode).then(revoked => {
      if (revoked) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(PREMIUM_CODE_KEY);
        setIsPremium(false);
      }
    });
  }, []);

  return (
    <PremiumContext.Provider value={{ isPremium, unlocking, unlock, lock }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium must be used inside PremiumProvider");
  return ctx;
}
