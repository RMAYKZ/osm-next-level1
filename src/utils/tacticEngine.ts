import { useCallback, useMemo } from "react";
import type { AntiTactic, TacticDNA, Location, Strength } from "../data/tactics";
import { TACTICAL_DNA_REGISTRY } from "../data/tacticalDNARegistry";

// ── Internals ─────────────────────────────────────────────────────────────────

// FNV-1a 32-bit — deterministic, avalanche-friendly, zero dependencies.
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// ── Week Identification ───────────────────────────────────────────────────────

/**
 * Returns the ISO 8601 week number (1–53) for the given date.
 * Rolls over exactly at Monday 00:00 UTC — identical for all users in the same week.
 */
export function getISOWeekNumber(date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7; // Sun=7 so the boundary is Monday
  d.setUTCDate(d.getUTCDate() + 4 - day); // shift to nearest Thursday (ISO anchor)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

/**
 * Returns a year-scoped week key, e.g. "2026-24".
 * Unique across years — week 1 of 2026 ≠ week 1 of 2027.
 */
export function getYearWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-${week}`;
}

// ── Formation Constraints (Deterministic Stability Framework) ─────────────────

/**
 * Stability profile for one formation archetype.
 *
 * weeklyDelta   — maximum units of change applied to any field per week.
 * pressure/style/tempo — optional hard Golden Range bounds.
 *   When set, these override the TacticalDNA registry for clamping.
 *   When absent, the engine falls back to the registry then [20, 80].
 */
export interface FormationConstraint {
  weeklyDelta: number;
  pressure?: { min: number; max: number };
  style?:    { min: number; max: number };
  tempo?:    { min: number; max: number };
}

/**
 * Per-formation stability rules.
 *
 * 4-3-3   — explicit Golden Ranges (Pressure 50–77, Style 50–70, Tempo max 79).
 *            Weekly delta 3 keeps adjustments professional, not wild.
 * 5-2-3   — ultra-stable counter archetype; drifts ≤ 2 units/week.
 * 4-5-1 / 4-2-3-1 / 5-3-2 — moderate drift, ≤ 5 units/week.
 * All others — default safety delta 5, hard-clamped to [20, 80].
 */
export const FORMATION_CONSTRAINTS: Record<string, FormationConstraint> = {
  "4-3-3": {
    weeklyDelta: 3,
    pressure: { min: 50, max: 77 },
    style:    { min: 50, max: 70 },
    tempo:    { min: 55, max: 79 }, // MAX 79 per spec; 55 is the sensible floor
  },
  "5-2-3": {
    weeklyDelta: 2, // 1–2 unit drift: the most stable counter archetype
  },
  "4-5-1": {
    weeklyDelta: 5,
  },
  "4-2-3-1": {
    weeklyDelta: 5,
  },
  "5-3-2": {
    weeklyDelta: 5,
  },
};

/** Safety net for any formation not listed in FORMATION_CONSTRAINTS. */
const DEFAULT_FORMATION_CONSTRAINT: FormationConstraint = {
  weeklyDelta: 5,
  pressure: { min: 20, max: 80 },
  style:    { min: 20, max: 80 },
  tempo:    { min: 20, max: 80 },
};

export function getFormationConstraint(formation: string): FormationConstraint {
  return FORMATION_CONSTRAINTS[formation] ?? DEFAULT_FORMATION_CONSTRAINT;
}

// ── DNA Boundary System ───────────────────────────────────────────────────────

/** Pressure can never drop below this in any DNA profile, not even auto-derived. */
const PRESSURE_FLOOR = 20;

/** Oscillation half-width used when no registry entry or inline dna is present. */
const AUTO_MARGIN = 10;

function enforcePressureFloor(dna: TacticDNA): TacticDNA {
  if (dna.pressure.min >= PRESSURE_FLOOR) return dna;
  return {
    ...dna,
    pressure: {
      min: PRESSURE_FLOOR,
      max: Math.max(dna.pressure.max, PRESSURE_FLOOR),
    },
  };
}

/**
 * Resolves the DNA bounds for a tactic (used as the fallback clamping layer).
 * Priority: inline tactic.dna → TacticalDNA registry → auto-derived from base ± 10.
 * Pressure.min is always ≥ 20 regardless of source.
 */
export function deriveTacticDNA(tactic: AntiTactic): TacticDNA {
  if (tactic.dna) return enforcePressureFloor(tactic.dna);

  const registryKey = `${tactic.formation}|${tactic.location}|${tactic.strength}`;
  const registered  = TACTICAL_DNA_REGISTRY[registryKey];
  if (registered) return registered;

  const band = (base: number) => ({
    min: Math.max(0, base - AUTO_MARGIN),
    max: Math.min(100, base + AUTO_MARGIN),
  });
  return enforcePressureFloor({
    pressure: band(tactic.pressure),
    style:    band(tactic.style),
    tempo:    band(tactic.tempo),
  });
}

/** Returns the registry lookup key for a tactic — useful for diagnostics. */
export function getTacticRegistryKey(tactic: AntiTactic): string {
  return `${tactic.formation}|${tactic.location}|${tactic.strength}`;
}

// ── Stability Loop ────────────────────────────────────────────────────────────

/**
 * Derives a deterministic signed offset from a YYYY-WW-scoped seed string.
 *
 * Magnitude: FNV("…|mag") % (maxDelta + 1)  →  integer in [0, maxDelta]
 * Sign:      FNV("…|sgn") % 2               →  +1 or -1
 *
 * The two separate FNV hashes mean magnitude and sign are independent —
 * no correlation between them. Zero Math.random() anywhere.
 */
function deterministicOffset(seed: string, maxDelta: number): number {
  const magnitude = fnv1a(`${seed}|mag`) % (maxDelta + 1);
  const sign      = fnv1a(`${seed}|sgn`) % 2 === 0 ? 1 : -1;
  return sign * magnitude;
}

/**
 * Returns a new AntiTactic with pressure, style, and tempo evolved via the
 * Deterministic Stability Loop, seeded by the YYYY-WW week key.
 *
 * Per-field algorithm:
 *   a) Start from the raw base value stored in tactics.ts.
 *   b) Apply a deterministic signed offset: base ± FNV(matchupKey|YYYY-WW|field),
 *      bounded to the formation's weeklyDelta (e.g. ≤ 2 for 5-2-3, ≤ 5 for 4-5-1).
 *   c) Resolve Golden Range bounds: FormationConstraint field → DNA registry → [20, 80].
 *   d) Safety firewall: Math.min(max, Math.max(min, calculated)).
 *
 * Guarantees:
 *   - No Math.random() — identical output for every user in the same calendar week.
 *   - Each field has an independent FNV seed; pressure/style/tempo never move in lock-step.
 *   - 4-3-3 pressure always stays [50, 77]; tempo never exceeds 79.
 *   - 5-2-3 never drifts more than 2 units from its base value.
 *   - 4-5-1 / 4-2-3-1 / 5-3-2 drift ≤ 5 units.
 *   - Unknown formations are safety-clamped to [20, 80].
 *   - Results are clean integers — no floats leak through.
 *   - Base data in tactics.ts is never mutated.
 */
export function getEvolvedTactic(tactic: AntiTactic, yearWeekKey?: string): AntiTactic {
  const ywKey = yearWeekKey ?? getYearWeekKey(); // "YYYY-WW" — rolls over each Monday
  const dna    = deriveTacticDNA(tactic);          // fallback bounds
  const fc     = getFormationConstraint(tactic.formation);

  // Unique per matchup — ensures two tactics with the same formation but different
  // opponents/locations/strengths evolve on different trajectories.
  const matchupKey = `${tactic.opponentId}|${tactic.location}|${tactic.strength}`;

  const evolveField = (base: number, field: 'pressure' | 'style' | 'tempo'): number => {
    // FormationConstraint field takes precedence; DNA registry is the fallback.
    const bounds = fc[field] ?? dna[field];

    // Step b: deterministic signed offset, hard-capped to this formation's weeklyDelta.
    const offset = deterministicOffset(`${matchupKey}|${ywKey}|${field}`, fc.weeklyDelta);

    // Step d: safety firewall — Math.min(max, Math.max(min, calculated)).
    return Math.min(bounds.max, Math.max(bounds.min, base + offset));
  };

  return {
    ...tactic,
    pressure: evolveField(tactic.pressure, 'pressure'),
    style:    evolveField(tactic.style,    'style'),
    tempo:    evolveField(tactic.tempo,    'tempo'),
  };
}

// ── Meta Tactic Rotation ──────────────────────────────────────────────────────

/**
 * Picks one item from `allTactics` deterministically: index = weekNumber % length.
 * Advances automatically every Monday — zero manual updates.
 */
export function getWeeklyMetaTactic<T>(allTactics: readonly T[], weekNumber?: number): T {
  const week = weekNumber ?? getISOWeekNumber();
  return allTactics[week % allTactics.length];
}

// ── Weekly Slider Boundaries (mirrors AntiTacticFinder engine) ───────────────

/** Same Monday-reset numeric seed as AntiTacticFinder: year * 100 + ISO week. */
function getWeekSeed(): number {
  const now = new Date();
  const d   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const y0  = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const wk  = Math.ceil((((d.getTime() - y0.getTime()) / 86400000) + 1) / 7);
  return d.getUTCFullYear() * 100 + wk;
}

function weekSi(seed: number, salt: number, mn: number, mx: number): number {
  let h = ((seed * 1664525) ^ (salt * 1013904223)) >>> 0;
  h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) >>> 0;
  h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return mn + (h % (mx - mn + 1));
}

type WR = { pMn: number; pMx: number; sMn: number; sMx: number; tMn: number; tMx: number };

const WEEKLY_RANGES: {
  away_523: Record<string, WR>;
  home_523: Record<string, WR>;
  home_433: Partial<Record<string, WR>>;
} = {
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

/**
 * Returns deterministic weekly slider values for 5-2-3 (home/away, any strength)
 * and home 4-3-3 (stronger/equal), using the same Monday-reset seed and boundary
 * ranges as the AntiTacticFinder engine. Salts 50001–50003 are reserved for this
 * consumer to avoid collisions with AntiTacticFinder's per-entry salts (1–~1750).
 * Returns null for any formation/context not covered by a managed range — callers
 * should fall back to the evolved tactic values in that case.
 */
export function getWeeklyMetaSliders(
  formation: string,
  location: Location,
  strength: Strength,
  seed = getWeekSeed(),
): { pressure: number; style: number; tempo: number } | null {
  const is523 = formation === "5-2-3";
  const is433 = formation === "4-3-3";
  let r: WR | undefined;
  if      (is523 && location === "away")  r = WEEKLY_RANGES.away_523[strength];
  else if (is523 && location === "home")  r = WEEKLY_RANGES.home_523[strength];
  else if (is433 && location === "home" && (strength === "stronger" || strength === "equal"))
                                          r = WEEKLY_RANGES.home_433[strength];
  if (!r) return null;
  return {
    pressure: weekSi(seed, 50001, r.pMn, r.pMx),
    style:    weekSi(seed, 50002, r.sMn, r.sMx),
    tempo:    weekSi(seed, 50003, r.tMn, r.tMx),
  };
}

// ── TacticDatabase Bridge ─────────────────────────────────────────────────────

/**
 * Evolves p/s/t slider values for a TacticEntry (tacticDatabase.ts shape).
 * Same Deterministic Stability Loop as getEvolvedTactic, but adapted for
 * TacticEntry field names (p/s/t → pressure/style/tempo internally).
 *
 * @param fm       Formation string, optionally variant-suffixed: "4-3-3-A" → "4-3-3"
 * @param oppKey   Opponent key from TacticEntry, used as matchup discriminator
 * @param location "home" | "away"
 * @param strength "stronger" | "equal" | "weaker"
 * @param base     Raw {p, s, t} from TacticEntry (or TacticEntry.optionB)
 * @param ywKey    Optional year-week override (default: current week)
 */
export function evolveTDSliders(
  fm: string,
  oppKey: string,
  location: string,
  strength: string,
  base: { p: number; s: number; t: number },
  ywKey = getYearWeekKey(),
): { p: number; s: number; t: number } {
  const formation = fm.replace(/-[A-Z]$/, '');  // "4-3-3-A" → "4-3-3"
  const fc = getFormationConstraint(formation);
  const matchupKey = `${oppKey}|${location}|${strength}`;

  const evolveVal = (baseVal: number, field: 'pressure' | 'style' | 'tempo'): number => {
    const bounds = fc[field] ?? { min: 20, max: 80 };
    const offset = deterministicOffset(`${matchupKey}|${ywKey}|${field}`, fc.weeklyDelta);
    return Math.min(bounds.max, Math.max(bounds.min, baseVal + offset));
  };

  return {
    p: evolveVal(base.p, 'pressure'),
    s: evolveVal(base.s, 'style'),
    t: evolveVal(base.t, 'tempo'),
  };
}

// ── React Hook ────────────────────────────────────────────────────────────────

/**
 * Stable hook for consuming evolved tactic values in React components.
 *
 * - weekNumber is computed once on mount (useMemo with []) — never re-derived.
 * - evolve is a stable useCallback reference — safe in prop/dep arrays.
 * - Call evolve(rawTactic) to receive this week's stability-loop values.
 *
 * Example:
 *   const { evolve } = useTacticEngine();
 *   const displayed = useMemo(() => result ? evolve(result) : null, [result, evolve]);
 */
export function useTacticEngine() {
  const weekNumber  = useMemo(getISOWeekNumber, []);
  const yearWeekKey = useMemo(getYearWeekKey,   []);

  const evolve = useCallback(
    (tactic: AntiTactic): AntiTactic => getEvolvedTactic(tactic, yearWeekKey),
    [yearWeekKey],
  );

  return { weekNumber, evolve } as const;
}
