import type { AntiTactic } from "./tactics";

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL HOME META — supersedes per-matchup advice for all home scenarios.
// opponentId "__master__" marks this as a universal (non-opponent-specific) entry
// so it never conflicts with registry look-ups in AntiTacticFinder.
// ─────────────────────────────────────────────────────────────────────────────
export const MASTER_HOME_META: AntiTactic = {
  opponentId: "__master__",
  location:   "home",
  strength:   "stronger",
  recommendedFormation: "4-5-1 (Shoot on Sight)",
  formation:  "4-5-1",
  pressure:   9,
  style:      33,
  tempo:      44,
  lineTactics: {
    forwards: "attack",
    midfield: "defHelp",
    defence:  "stayBack",
    offsides: false,
    marking:  "area",
  },
  lineup: ["GK", "DR DC DC DL", "DM MC MC MC MC", "ST"],
  note: "The Ultimate Home Lockdown. Neutralises all opposition strategies by dictating the pace and maintaining a rigid defensive block.",
  // Fixed DNA — engine never evolves these values so they remain exactly as specified.
  dna: {
    pressure: { min: 9,  max: 9  },
    style:    { min: 33, max: 33 },
    tempo:    { min: 44, max: 44 },
  },
};

export const MASTER_HOME_WIN_RATE = 95;
export const MASTER_HOME_STATUS   = "ELITE / MUST-USE" as const;
