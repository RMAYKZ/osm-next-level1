import type { Location, Strength } from "../data/tactics";

export interface MetaPreference {
  opponentId: string;
  location: Location;
  strength: Strength;
}

// Module-level singleton — written by WeeklyMeta on CTA click,
// consumed once by AntiTacticFinder on mount to pre-select the matchup.
let pending: MetaPreference | null = null;

export function setMetaPreference(pref: MetaPreference): void {
  pending = pref;
}

export function consumeMetaPreference(): MetaPreference | null {
  const p = pending;
  pending = null;
  return p;
}
