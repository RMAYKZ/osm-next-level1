// ─────────────────────────────────────────────────────────────────────────────
// Football-Data.org sync service
//
// The token is read from VITE_FOOTBALL_DATA_TOKEN in .env.local (never committed).
// Add this line to your .env.local:
//   VITE_FOOTBALL_DATA_TOKEN=<your_token>
//
// NOTE: Vite VITE_ variables are embedded in the built bundle and are visible
// in browser DevTools. This service is intended to be called only from the
// password-protected admin panel.
// ─────────────────────────────────────────────────────────────────────────────

import { getDb } from "../lib/firebase";

// Competitions available on the free Football-Data.org plan
const ALLOWED_COMPETITIONS = new Set(["PL", "CL", "WC", "BL1", "PD", "SA", "FL1"]);

interface FdTeam {
  name: string;
  shortName?: string;
}

interface FdMatch {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: FdTeam;
  awayTeam: FdTeam;
  competition: { name: string; code: string };
}

export interface SyncResult {
  added: number;
  skipped: number;
  total: number;
  filtered: number;
}

// ── Date helpers in Europe/Istanbul timezone ─────────────────────────────────

function toIstanbulDate(utcStr: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date(utcStr));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("day")}/${get("month")}/${get("year")}`; // "12/06/2026"
}

function toIstanbulTime(utcStr: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(utcStr)); // "21:00"
}

function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
  }).format(new Date()); // "2026-06-12"
}

// ── Main sync function ────────────────────────────────────────────────────────

export async function fetchAndSyncTodayMatches(): Promise<SyncResult> {
  const token = (import.meta.env.VITE_FOOTBALL_DATA_TOKEN as string | undefined)?.trim();
  if (!token) {
    throw new Error(
      "VITE_FOOTBALL_DATA_TOKEN is not set. Add it to your .env.local file and restart the dev server."
    );
  }

  const dateISO = todayISO();
  const res = await fetch(
    `https://api.football-data.org/v4/matches?dateFrom=${dateISO}&dateTo=${dateISO}`,
    { headers: { "X-Auth-Token": token } }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `football-data.org responded with HTTP ${res.status}${text ? `: ${text.slice(0, 120)}` : ""}`
    );
  }

  const body = (await res.json()) as { matches: FdMatch[] };
  const eligible = body.matches.filter((m) => ALLOWED_COMPETITIONS.has(m.competition.code));

  const [{ doc, getDoc, setDoc, serverTimestamp }, db] = await Promise.all([
    import("firebase/firestore"),
    getDb(),
  ]);

  let added = 0;
  let skipped = 0;

  for (const m of eligible) {
    // Use football-data.org's own match ID as the Firestore document key
    // to guarantee idempotency — re-running sync never creates duplicates.
    const docId = `fd_${m.id}`;
    const ref = doc(db, "matches", docId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      skipped++;
      continue;
    }

    await setDoc(ref, {
      teamA: m.homeTeam.shortName ?? m.homeTeam.name,
      teamB: m.awayTeam.shortName ?? m.awayTeam.name,
      competition: m.competition.name,
      matchDate: toIstanbulDate(m.utcDate),  // "DD/MM/YYYY"
      matchTime: toIstanbulTime(m.utcDate),  // "HH:MM" Istanbul time
      status: "open",
      omerPick: "",
      source: "football-data.org",
      fdMatchId: m.id,
      votesHome: 0,
      votesDraw: 0,
      votesAway: 0,
      totalVotes: 0,
      createdAt: serverTimestamp(),
    });
    added++;
  }

  return {
    added,
    skipped,
    total: body.matches.length,
    filtered: eligible.length,
  };
}
