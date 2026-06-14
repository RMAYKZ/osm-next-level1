import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { premiumCodes } from "../data/extras";
import { validcodes } from "../data/validcodes";
import { getDb } from "../lib/firebase";

// ── Google Sheets config ──────────────────────────────────────────────
const SHEETS_ID  = import.meta.env.VITE_SHEETS_ID  as string | undefined;
const SHEETS_KEY = import.meta.env.VITE_SHEETS_KEY as string | undefined;

const STORAGE_KEY = "osm-next-level-premium";
const DEVICE_KEY  = "osm-device-id";
const DEVICE_COOKIE = "osm-did";

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

// ── Remote codes cache (Google Sheets) ───────────────────────────────
let _cachedCodes: string[] | null = null;
let _fetchOnce: Promise<string[]> | null = null;

async function getRemoteCodes(): Promise<string[]> {
  if (_cachedCodes !== null) return _cachedCodes;
  if (_fetchOnce) return _fetchOnce;
  if (!SHEETS_ID || !SHEETS_KEY) return [];

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}` +
    `/values/Sayfa1!A:A?key=${SHEETS_KEY}`;

  _fetchOnce = fetch(url)
    .then(r => {
      if (!r.ok) throw new Error(`Sheets ${r.status}`);
      return r.json() as Promise<{ values?: string[][] }>;
    })
    .then(data => {
      const codes = (data.values ?? []).flat()
        .map(c => c.trim().toUpperCase())
        .filter(Boolean);
      _cachedCodes = codes;
      return codes;
    })
    .catch(err => {
      console.warn("[Premium] Remote codes unavailable:", err.message);
      _fetchOnce = null;
      return [] as string[];
    });

  return _fetchOnce;
}

if (SHEETS_ID && SHEETS_KEY) getRemoteCodes();

// ── Firestore: check + claim code ────────────────────────────────────
// Returns:
//   'ok'      — code is valid and claimed for this device
//   'taken'   — code already claimed by a different device
//   'skip'    — Firestore unavailable, proceed without locking
type ClaimResult = "ok" | "taken" | "skip";

async function checkAndClaimCode(code: string, deviceId: string): Promise<ClaimResult> {
  try {
    const db = await getDb();
    const { doc, getDoc, setDoc, serverTimestamp } = await import("firebase/firestore");

    const ref  = doc(db, "usedCodes", code);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data() as { deviceId: string };
      return data.deviceId === deviceId ? "ok" : "taken";
    }

    // Unclaimed — write this device as the owner
    await setDoc(ref, { deviceId, usedAt: serverTimestamp() });
    return "ok";
  } catch (err) {
    console.warn("[Premium] Firestore unavailable, skipping device lock:", err);
    return "skip";
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
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });
  const [unlocking, setUnlocking] = useState(false);

  const unlock = useCallback(async (code: string): Promise<UnlockResult> => {
    setUnlocking(true);
    try {
      const normalized = code.trim().toUpperCase();
      const deviceId   = getDeviceId();

      // 1. Check local codes (instant)
      const localAll = [...premiumCodes, ...validcodes];
      const localValid = localAll.some(c => c.toUpperCase() === normalized);

      // 2. Check remote codes (Google Sheets)
      let remoteValid = false;
      if (!localValid) {
        const remote = await getRemoteCodes();
        remoteValid = remote.includes(normalized);
      }

      if (!localValid && !remoteValid) return "invalid";

      // 3. Code is valid — check device lock via Firestore
      const claim = await checkAndClaimCode(normalized, deviceId);
      if (claim === "taken") return "taken";

      // 4. Unlock!
      localStorage.setItem(STORAGE_KEY, "true");
      setIsPremium(true);
      return "ok";
    } finally {
      setUnlocking(false);
    }
  }, []);

  const lock = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsPremium(false);
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
