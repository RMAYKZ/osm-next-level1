import type { ChatMessage, OrchestratorContext, TacticCardData, TacticSession } from "../types/agentTypes";

function clampSlider(v: number): number { return Math.min(100, Math.max(0, Math.round(v))); }

function applySessionModifiers(
  sliders: { press: number; style: number; tempo: number },
  session: TacticSession,
): { press: number; style: number; tempo: number } {
  let { press, style, tempo } = sliders;

  // Strength modifiers — riskier when stronger, more defensive when weaker
  if (session.strength === "stronger") { press = clampSlider(press + 8); style = clampSlider(style + 6); tempo = clampSlider(tempo + 4); }
  if (session.strength === "weaker")   { press = clampSlider(press - 8); style = clampSlider(style - 6); tempo = clampSlider(tempo - 4); }

  // Camp modifiers — opponent has physical/tactical advantage
  if (session.campStatus === "kamp")            { press = clampSlider(press - 5); }
  if (session.campStatus === "gizli_antrenman") { press = clampSlider(press - 9); style = clampSlider(style - 5); tempo = clampSlider(tempo + 6); }

  return { press, style, tempo };
}
import { runGozlemci }    from "../agents/gozlemci";
import { runIstatistikci } from "../agents/istatistikci";
import { runCasus }        from "../agents/casus";
import { runBorsaci }      from "../agents/borsaci";
import { runAmigo }        from "../agents/amigo";
import { runImparator }    from "../agents/imparator";
import { buildSystemContext } from "./kozmikOda";

/**
 * Başkan — Ruflo Swarm Orchestrator.
 *
 * Intercepts incoming messages and routes them through the full coaching staff
 * pipeline before a single token reaches the LLM, producing a single consolidated
 * response enriched with tactical, contextual, and historical intelligence.
 *
 * Stage 1  (sync)     — Gözlemci + İstatistikçi: intent + data (no I/O)
 * Stage 2  (parallel) — Casus, Borsacı, Amigo: independent async enrichment
 * Stage 3  (sync)     — KozmikOda assembles system context
 * Stage 4  (async)    — İmparator generates the Claude-powered final reply
 */
const VALID_LANGS = new Set(["tr", "en", "hu", "ar", "pt"]);

export async function orchestrate(
  messages: ChatMessage[],
  userId: string,
  apiKey: string,
  lang?: string,
  tacticSession?: TacticSession,
): Promise<{ reply: string; tacticCard: TacticCardData | null }> {
  // Stage 1 — synchronous, no I/O
  const matchIntent  = runGozlemci(messages);

  // Override language with client-supplied value when valid (site language > text detection)
  if (lang && VALID_LANGS.has(lang)) {
    (matchIntent as { language: string }).language = lang;
  }
  const dataContext  = runIstatistikci(matchIntent);

  // Stage 2 — parallel async enrichment
  // apiKey forwarded to Casus for the AI fallback path (custom formation detection)
  const [tacticalIntel, transferContext, userHistory] = await Promise.all([
    runCasus(matchIntent, apiKey),
    runBorsaci(matchIntent),
    runAmigo(userId, matchIntent, messages),
  ]);

  const ctx: OrchestratorContext = {
    matchIntent,
    dataContext,
    tacticalIntel,
    transferContext,
    userHistory,
  };

  // Stage 3 — build the 7-layer Kozmik Oda system context
  const systemContext = buildSystemContext(ctx, tacticSession);

  // Stage 4 — İmparator generates the LLM response
  const reply = await runImparator(messages, ctx, systemContext, apiKey);

  // Build structured tactic card if the matrix resolved a counter-tactic
  const ct = ctx.tacticalIntel.counterTactic;
  let tacticCard: TacticCardData | null = ct ? {
    opponentFormation: ct.opponentFormation ?? ct.customOpponentFormation ?? "?",
    location: ctx.matchIntent.location,
    recommendedFormation: ct.recommendedFormation,
    playStyleKey: ct.playStyle,
    press: ct.resolvedSliders.press,
    style: ct.resolvedSliders.style,
    tempo: ct.resolvedSliders.tempo,
    lineTactics: ct.lineTactics,
    rationale: ct.rationale,
    source: ct.source,
  } : null;

  // Apply session-based slider modifiers (strength + camp adjustments)
  if (tacticCard && tacticSession) {
    const adj = applySessionModifiers(
      { press: tacticCard.press, style: tacticCard.style, tempo: tacticCard.tempo },
      tacticSession,
    );
    tacticCard = { ...tacticCard, ...adj };
  }

  return { reply, tacticCard };
}
