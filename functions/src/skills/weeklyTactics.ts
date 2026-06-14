import type { Location, Strength, Formation } from "../types/agentTypes";

interface SliderRange {
  pMn: number; pMx: number;
  sMn: number; sMx: number;
  tMn: number; tMx: number;
}

// Mirrors the Golden Ranges in tacticEngine.ts and AntiTacticFinder.tsx exactly.
const WEEKLY_RANGES: Record<string, Record<string, SliderRange>> = {
  away_523: {
    stronger: { pMn: 10, pMx: 19, sMn: 20, sMx: 29, tMn: 60, tMx: 69 },
    equal:    { pMn:  5, pMx: 19, sMn: 20, sMx: 25, tMn: 60, tMx: 75 },
    weaker:   { pMn:  5, pMx: 10, sMn: 20, sMx: 23, tMn: 60, tMx: 69 },
  },
  home_523: {
    stronger: { pMn: 20, pMx: 35, sMn: 20, sMx: 25, tMn: 60, tMx: 69 },
    equal:    { pMn: 20, pMx: 25, sMn: 20, sMx: 29, tMn: 60, tMx: 75 },
    weaker:   { pMn: 10, pMx: 25, sMn: 20, sMx: 25, tMn: 60, tMx: 69 },
  },
  home_433: {
    stronger: { pMn: 60, pMx: 79, sMn: 50, sMx: 70, tMn: 50, tMx: 79 },
    equal:    { pMn: 50, pMx: 65, sMn: 50, sMx: 60, tMn: 50, tMx: 65 },
  },
};

// Same deterministic hash used by AntiTacticFinder — Monday-reset, zero Math.random().
function weekSi(seed: number, salt: number, mn: number, mx: number): number {
  let h = ((seed * 1664525) ^ (salt * 1013904223)) >>> 0;
  h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) >>> 0;
  h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return mn + (h % (mx - mn + 1));
}

/**
 * Outputs deterministic weekly Press/Style/Tempo values for the given context.
 * Returns null for formation/location/strength combos not covered by managed ranges.
 */
export function getWeeklyTactics(
  weekSeed: number,
  formation: Formation,
  location: Location,
  strength: Strength,
): { press: number; style: number; tempo: number } | null {
  let key = "";
  if      (formation === "5-2-3" && location === "away") key = "away_523";
  else if (formation === "5-2-3" && location === "home") key = "home_523";
  else if (formation === "4-3-3" && location === "home") key = "home_433";
  else return null;

  const range = WEEKLY_RANGES[key]?.[strength as string];
  if (!range) return null;

  return {
    press: weekSi(weekSeed, 50001, range.pMn, range.pMx),
    style: weekSi(weekSeed, 50002, range.sMn, range.sMx),
    tempo: weekSi(weekSeed, 50003, range.tMn, range.tMx),
  };
}
