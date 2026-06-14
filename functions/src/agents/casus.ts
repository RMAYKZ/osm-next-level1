import type { MatchIntent, TacticalIntel } from "../types/agentTypes";
import { getRefereeStrictness } from "../skills/spyReport";
import { resolveCounterTactic, generateAICounterTactic } from "../skills/matchAnalysisUtils";
import { getSystemDate } from "../skills/systemDate";

/**
 * Spy & Referee Analyst: evaluates field conditions, opponent strategy counters,
 * and disciplinary risks.
 *
 * Counter-tactic resolution priority:
 *   1. Known formation in ANTI_TACTIC_MATRIX → deterministic matrix result (zero API calls)
 *   2. Unknown/custom formation detected → AI fallback via Gemini 2.5 Flash
 *   3. No formation detected → counterTactic remains null
 *
 * All paths enforce Kozmik Oda Layer 1 home/away constraints.
 */
export async function runCasus(intent: MatchIntent, apiKey: string): Promise<TacticalIntel> {

  // ── Referee analysis ──────────────────────────────────────────────────────
  let refereeRisk: TacticalIntel["refereeRisk"] = null;
  let aggressionValue: number | null = null;
  if (intent.refereeColor) {
    const ref = getRefereeStrictness(intent.refereeColor);
    refereeRisk = ref.riskLabel;
    aggressionValue = ref.aggressionValue;
  }

  // ── Spy report (wired to Firestore when documents are available) ──────────
  const spyFindings: string | null = null;

  // ── Squad difficulty ratio ────────────────────────────────────────────────
  const difficultyRatio =
    intent.squadValueUser !== null && intent.squadValueOpponent !== null
      ? Math.round((intent.squadValueUser / Math.max(intent.squadValueOpponent, 1)) * 100) / 100
      : null;

  // ── Anti-Tactic Matrix + AI Fallback resolution ───────────────────────────
  let counterTactic: TacticalIntel["counterTactic"] = null;

  if (intent.location !== "unknown") {
    if (intent.opponentFormation) {
      // Path 1: known standard formation → deterministic matrix (no API call)
      const { weekSeed } = getSystemDate();
      counterTactic = resolveCounterTactic(
        intent.opponentFormation,
        intent.location,
        weekSeed,
      );
    } else if (intent.rawOpponentFormation) {
      // Path 2: non-standard/custom formation → Claude AI generates the counter
      try {
        counterTactic = await generateAICounterTactic(
          intent.rawOpponentFormation,
          intent.location,
          apiKey,
        );
      } catch {
        // AI fallback failed silently — İmparator will handle the missing intel
      }
    }
  }

  return { refereeRisk, aggressionValue, spyFindings, difficultyRatio, counterTactic };
}
