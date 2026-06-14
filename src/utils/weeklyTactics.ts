import type { AntiTactic } from "../data/tactics";
import { getEvolvedTactic } from "./tacticEngine";

// FNV-1a 32-bit — kept here for getSuccessRate (not exported from engine)
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Mulberry32 PRNG — used only by getSuccessRate below
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Kept for components that display the "2026-W24" formatted string
export function getISOWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/**
 * Returns a stable pseudo-random success rate (74–95%) for any string key.
 * Keyed on tactic identity only — does not rotate weekly so the number
 * feels like discovered data, not noise.
 */
export function getSuccessRate(key: string): number {
  const seed = fnv1a(`successRate|${key}`);
  const rng = mulberry32(seed);
  return 74 + Math.floor(rng() * 22); // 74–95 inclusive
}

/**
 * Backward-compatible wrapper — delegates to the new sine-wave engine.
 * Existing components importing this function continue to work unchanged.
 * The engine guarantees: deterministic by week, DNA-clamped, no Math.random().
 */
export function getWeeklyDynamicTactics(tactic: AntiTactic): AntiTactic {
  return getEvolvedTactic(tactic);
}

// Re-export engine primitives for callers that want the new API directly
export { getEvolvedTactic } from "./tacticEngine";
