import type { TacticDNA } from './tactics';

/**
 * Authoritative Golden Range registry.
 * Key: `${formation}|${location}|${strength}` — maps every tactic archetype
 * to its permissible oscillation band.
 *
 * Invariants (enforced by the guard below):
 *   • pressure.min ≥ 20  — zeroes are forbidden.
 *   • min ≤ max on every field.
 *
 * To add a new archetype, append an entry here. The engine picks it up
 * automatically — no other code needs to change.
 */
export const TACTICAL_DNA_REGISTRY: Readonly<Record<string, TacticDNA>> = {
  // ── 5-2-3 Counter Attack ──────────────────────────────────────────────────
  "5-2-3|away|weaker":   { pressure: { min: 20, max: 40 }, style: { min: 10, max: 35 }, tempo: { min: 50, max: 80 } },
  "5-2-3|away|equal":    { pressure: { min: 25, max: 45 }, style: { min: 10, max: 35 }, tempo: { min: 60, max: 80 } },
  "5-2-3|away|stronger": { pressure: { min: 30, max: 50 }, style: { min: 15, max: 40 }, tempo: { min: 65, max: 85 } },
  "5-2-3|home|weaker":   { pressure: { min: 20, max: 45 }, style: { min: 20, max: 45 }, tempo: { min: 60, max: 80 } },
  "5-2-3|home|equal":    { pressure: { min: 25, max: 45 }, style: { min: 20, max: 45 }, tempo: { min: 62, max: 82 } },
  "5-2-3|home|stronger": { pressure: { min: 28, max: 50 }, style: { min: 20, max: 50 }, tempo: { min: 65, max: 85 } },

  // ── 5-3-2 Counter Attack ──────────────────────────────────────────────────
  "5-3-2|away|weaker":   { pressure: { min: 20, max: 38 }, style: { min: 20, max: 35 }, tempo: { min: 60, max: 78 } },
  "5-3-2|home|weaker":   { pressure: { min: 20, max: 38 }, style: { min: 15, max: 30 }, tempo: { min: 60, max: 80 } },
  "5-3-2|home|equal":    { pressure: { min: 56, max: 72 }, style: { min: 56, max: 72 }, tempo: { min: 67, max: 82 } },
  "5-3-2|home|stronger": { pressure: { min: 57, max: 74 }, style: { min: 55, max: 70 }, tempo: { min: 63, max: 78 } },

  // ── 4-5-1 Defensive Block ─────────────────────────────────────────────────
  "4-5-1|away|weaker":   { pressure: { min: 20, max: 38 }, style: { min: 20, max: 35 }, tempo: { min: 58, max: 75 } },
  "4-5-1|home|weaker":   { pressure: { min: 28, max: 45 }, style: { min: 20, max: 35 }, tempo: { min: 55, max: 72 } },
  "4-5-1|home|equal":    { pressure: { min: 28, max: 45 }, style: { min: 28, max: 45 }, tempo: { min: 56, max: 73 } },
  "4-5-1|home|stronger": { pressure: { min: 58, max: 75 }, style: { min: 55, max: 70 }, tempo: { min: 68, max: 85 } },

  // ── 4-3-3 Wing Play ───────────────────────────────────────────────────────
  "4-3-3|away|stronger": { pressure: { min: 55, max: 75 }, style: { min: 50, max: 70 }, tempo: { min: 58, max: 78 } },
  "4-3-3|home|weaker":   { pressure: { min: 20, max: 38 }, style: { min: 28, max: 48 }, tempo: { min: 65, max: 82 } },
  "4-3-3|home|equal":    { pressure: { min: 45, max: 68 }, style: { min: 55, max: 75 }, tempo: { min: 58, max: 78 } },
  "4-3-3|home|stronger": { pressure: { min: 60, max: 78 }, style: { min: 63, max: 80 }, tempo: { min: 68, max: 85 } },
};

// ── Dev-time integrity guard ──────────────────────────────────────────────────
// Throws at module load in development so registry violations are caught
// immediately, never silently. Stripped from production builds (dead branch).
if (process.env.NODE_ENV !== 'production') {
  for (const [key, dna] of Object.entries(TACTICAL_DNA_REGISTRY)) {
    if (dna.pressure.min < 20) {
      throw new Error(
        `[TacticalDNA] Registry violation — "${key}": pressure.min=${dna.pressure.min} must be ≥ 20`,
      );
    }
    for (const field of ['pressure', 'style', 'tempo'] as const) {
      if (dna[field].min > dna[field].max) {
        throw new Error(
          `[TacticalDNA] Registry violation — "${key}": ${field}.min(${dna[field].min}) > ${field}.max(${dna[field].max})`,
        );
      }
    }
  }
}
