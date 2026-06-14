/**
 * OSM Anti-Tactic Engine v2
 *
 * Changes from v1:
 * - Formation detection handles any text format: "433", "4-3-3", "4 3 3",
 *   "433B", "4-3-3(B)", "4231", "4-2-3-1", and fully custom formations.
 * - AI Fallback: unknown/non-standard formations → Gemini 2.5 Flash generates
 *   a logical counter-tactic on the fly.
 * - All outputs enforce Kozmik Oda Layer 1 home/away hard constraints.
 * - Still fully deterministic for matrix paths (no Math.random()).
 */

import { GoogleGenAI } from "@google/genai";
import type {
  OpponentFormation,
  RecommendedFormation,
  TacticalPlayStyle,
  CounterTacticResult,
  LineTactics,
} from "../types/agentTypes";

// ── Public detection result type ──────────────────────────────────────────────

export interface FormationDetectionResult {
  /** Normalized formation code if in our standard matrix; null for custom formations. */
  formation: OpponentFormation | null;
  /** Raw matched string from the text — set even when formation is null. */
  rawStr: string | null;
  /** True only when formation is non-null (i.e., found in ANTI_TACTIC_MATRIX). */
  isKnown: boolean;
}

// ── Local implementation types ────────────────────────────────────────────────

interface SliderRange {
  pressMin: number; pressMax: number;
  styleMin: number; styleMax: number;
  tempoMin: number; tempoMax: number;
}

interface CounterOption {
  formation: RecommendedFormation;
  playStyle: TacticalPlayStyle;
  sliders: SliderRange;
  rationale: string;
}

interface MatrixEntry {
  opponentStyle: TacticalPlayStyle;
  primary: CounterOption;
  secondary: CounterOption;
}

// ── Kozmik Oda Layer 1 constraint sets ───────────────────────────────────────

const HOME_VALID  = new Set<RecommendedFormation>(["4-3-3", "5-2-3"]);
const AWAY_BANNED = new Set<RecommendedFormation>(["4-3-3"]);

// ── Deterministic hash (salts 60001-60003 — no collision with weeklyTactics 50001-50003) ──

function weekSi(seed: number, salt: number, mn: number, mx: number): number {
  let h = ((seed * 1664525) ^ (salt * 1013904223)) >>> 0;
  h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) >>> 0;
  h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return mn + (h % (mx - mn + 1));
}

// ── Slider profiles per recommended formation ─────────────────────────────────

const SLIDER_PROFILES: Record<RecommendedFormation, SliderRange> = {
  "4-5-1":   { pressMin:  5, pressMax: 25, styleMin: 20, styleMax: 40, tempoMin: 50, tempoMax: 65 },
  "4-3-3":   { pressMin: 55, pressMax: 79, styleMin: 55, styleMax: 75, tempoMin: 60, tempoMax: 79 },
  "4-2-3-1": { pressMin: 35, pressMax: 55, styleMin: 40, styleMax: 60, tempoMin: 50, tempoMax: 65 },
  "4-4-2":   { pressMin: 30, pressMax: 50, styleMin: 50, styleMax: 70, tempoMin: 50, tempoMax: 65 },
  "5-2-3":   { pressMin:  5, pressMax: 20, styleMin: 20, styleMax: 35, tempoMin: 60, tempoMax: 75 },
  "5-3-2":   { pressMin:  5, pressMax: 15, styleMin: 15, styleMax: 30, tempoMin: 55, tempoMax: 70 },
};

// ── Anti-Tactic Matrix ────────────────────────────────────────────────────────

const ANTI_TACTIC_MATRIX: Record<OpponentFormation, MatrixEntry> = {

  "4-3-3": {
    opponentStyle: "wing_play",
    primary: {
      formation: "4-5-1", playStyle: "shoot_on_sight",
      sliders: SLIDER_PROFILES["4-5-1"],
      rationale: "4-5-1 (Şut) — 5 ortasaha kanatları kapatır; düşük baskıyla geri çekilip şutla cevap verir.",
    },
    secondary: {
      formation: "4-2-3-1", playStyle: "counter_attack",
      sliders: SLIDER_PROFILES["4-2-3-1"],
      rationale: "4-2-3-1 (Kontr) — orta sahayı sıkıştırır, kanat geçişlerini dengeler.",
    },
  },

  "4-4-2": {
    opponentStyle: "passing_game",
    primary: {
      formation: "4-3-3", playStyle: "wing_play",
      sliders: SLIDER_PROFILES["4-3-3"],
      rationale: "4-3-3 (Kanat) — yüksek baskı ve hızlı kanat geçişiyle 4-4-2'nin düz bloğunu deler.",
    },
    secondary: {
      formation: "4-2-3-1", playStyle: "counter_attack",
      sliders: SLIDER_PROFILES["4-2-3-1"],
      rationale: "4-2-3-1 (Kontr) — orta sahayı yoğunlaştırarak pas hatlarını keser.",
    },
  },

  "4-5-1": {
    opponentStyle: "shoot_on_sight",
    primary: {
      formation: "4-4-2", playStyle: "passing_game",
      sliders: SLIDER_PROFILES["4-4-2"],
      rationale: "4-4-2 (Pas) — çift forvet baskısı ve geniş pas ağıyla kompakt 4-5-1'i açar.",
    },
    secondary: {
      formation: "5-3-2", playStyle: "counter_attack",
      sliders: SLIDER_PROFILES["5-3-2"],
      rationale: "5-3-2 (Kontr) — savunma hatlarını tutar, hızlı kontrlarla sonuç arar.",
    },
  },

  "4-2-3-1": {
    opponentStyle: "shoot_on_sight",
    primary: {
      formation: "4-4-2", playStyle: "passing_game",
      sliders: SLIDER_PROFILES["4-4-2"],
      rationale: "4-4-2 (Pas) — 4-2-3-1'in çift pivot üstünlüğünü sayısal blokla kırar.",
    },
    secondary: {
      formation: "5-2-3", playStyle: "counter_attack",
      sliders: SLIDER_PROFILES["5-2-3"],
      rationale: "5-2-3 (Kontr) — kanatları kapatır, açıklardan hızlı kontr başlatır.",
    },
  },

  "5-3-2": {
    opponentStyle: "counter_attack",
    primary: {
      formation: "5-2-3", playStyle: "counter_attack",
      sliders: SLIDER_PROFILES["5-2-3"],
      rationale: "5-2-3 (Kontr) — aynı savunma döngüsünde üstün kontr denklemini kurar.",
    },
    secondary: {
      formation: "4-3-3", playStyle: "wing_play",
      sliders: SLIDER_PROFILES["4-3-3"],
      rationale: "4-3-3 (Kanat) — yüksek baskıyla savunma bloğunu iter, kanatlardan geçiş açar.",
    },
  },

  "5-2-3": {
    opponentStyle: "counter_attack",
    primary: {
      formation: "5-2-3", playStyle: "counter_attack",
      sliders: SLIDER_PROFILES["5-2-3"],
      rationale: "5-2-3 (Kontr) — aynaya karşı kontr; savunma dengesini koru ve hızlı çık.",
    },
    secondary: {
      formation: "4-3-3", playStyle: "wing_play",
      sliders: SLIDER_PROFILES["4-3-3"],
      rationale: "4-3-3 (Kanat) — kanatlardan baskı yaparak savunma bloğunu deler.",
    },
  },

  "5-4-1": {
    opponentStyle: "counter_attack",
    primary: {
      formation: "5-2-3", playStyle: "counter_attack",
      sliders: SLIDER_PROFILES["5-2-3"],
      rationale: "5-2-3 (Kontr) — aşırı savunmacı 5-4-1'e karşı sabırlı pozisyon ve kontr.",
    },
    secondary: {
      formation: "4-3-3", playStyle: "wing_play",
      sliders: SLIDER_PROFILES["4-3-3"],
      rationale: "4-3-3 (Kanat) — savunma duvarını kanat baskısıyla yırt.",
    },
  },

  "3-4-3": {
    opponentStyle: "wing_play",
    primary: {
      formation: "4-5-1", playStyle: "shoot_on_sight",
      sliders: SLIDER_PROFILES["4-5-1"],
      rationale: "4-5-1 (Şut) — 3-4-3'ün geniş kanat açılımını 5 ortasahayla bloke eder.",
    },
    secondary: {
      formation: "4-4-2", playStyle: "passing_game",
      sliders: SLIDER_PROFILES["4-4-2"],
      rationale: "4-4-2 (Pas) — 3 stoperin zayıflığını kanat paslarıyla parçalar.",
    },
  },

  "3-5-2": {
    opponentStyle: "long_ball",
    primary: {
      formation: "4-5-1", playStyle: "shoot_on_sight",
      sliders: SLIDER_PROFILES["4-5-1"],
      rationale: "4-5-1 (Şut) — 3-5-2'nin kanat koridorlarını kapatır, uzun topa kompakt durur.",
    },
    secondary: {
      formation: "4-4-2", playStyle: "passing_game",
      sliders: SLIDER_PROFILES["4-4-2"],
      rationale: "4-4-2 (Pas) — pas oyunuyla 3-5-2'nin uzun top avantajını elinden alır.",
    },
  },
};

// ── Line tactics per recommended formation ────────────────────────────────────

export const LINE_TACTICS: Record<RecommendedFormation, LineTactics> = {
  "5-2-3":   { forwards: "attack_only",       midfielders: "protect_defense",  defenders: "deep_protection", offsideTrap: false, marking: "zonal" },
  "4-3-3":   { forwards: "attack_only",       midfielders: "stay_in_position", defenders: "high_line",       offsideTrap: true,  marking: "man"   },
  "4-5-1":   { forwards: "attack_and_defend", midfielders: "protect_defense",  defenders: "deep_protection", offsideTrap: false, marking: "zonal" },
  "4-2-3-1": { forwards: "attack_only",       midfielders: "stay_in_position", defenders: "deep_protection", offsideTrap: false, marking: "zonal" },
  "4-4-2":   { forwards: "attack_and_defend", midfielders: "stay_in_position", defenders: "deep_protection", offsideTrap: false, marking: "zonal" },
  "5-3-2":   { forwards: "attack_only",       midfielders: "protect_defense",  defenders: "defend_deep",     offsideTrap: false, marking: "zonal" },
};

// ── Constraint fallbacks ──────────────────────────────────────────────────────

const HOME_FALLBACK: CounterOption = {
  formation: "5-2-3",
  playStyle: "counter_attack",
  sliders: SLIDER_PROFILES["5-2-3"],
  rationale: "Ev maçı kısıtı: birincil ve ikincil seçenekler ev maçında geçersiz — 5-2-3 Kontr devreye girdi.",
};

const AWAY_FALLBACK: CounterOption = {
  formation: "5-2-3",
  playStyle: "counter_attack",
  sliders: SLIDER_PROFILES["5-2-3"],
  rationale: "Deplasman kısıtı: 4-3-3 deplasmanda yasak — 5-2-3 Kontr güvenli alternatif.",
};

// ── Formation detection (v2) ──────────────────────────────────────────────────

// Maps pure digit strings to normalized OSM formation codes.
const DIGIT_TO_FORMATION: Record<string, OpponentFormation> = {
  "343":  "3-4-3",
  "352":  "3-5-2",
  "4231": "4-2-3-1",
  "433":  "4-3-3",
  "442":  "4-4-2",
  "451":  "4-5-1",
  "523":  "5-2-3",
  "532":  "5-3-2",
  "541":  "5-4-1",
};

function extractDigits(s: string): string {
  return s.replace(/[^0-9]/g, "");
}

/**
 * Flexible formation detector — handles any format a user might type:
 *   "4-3-3", "433", "4 3 3", "4.3.3", "433B", "4-3-3(A)", "4231", "4-2-3-1"
 *   and fully unknown/custom formations like "3-1-4-2" or "631".
 *
 * Returns both the normalized formation (if in our standard set) AND the raw
 * matched text so Casus can fall back to Claude for non-standard formations.
 */
export function detectOpponentFormation(text: string): FormationDetectionResult {
  // Match 3-digit formations: "433", "4-3-3", "4 3 3", "433B", "4-3-3 B"
  // Match 4-digit formations: "4231", "4-2-3-1", "4 2 3 1"
  // Handles separators: dash, space, dot, slash
  // Handles variant suffix: A or B (case-insensitive), immediately after digits
  const re = /\b\d(?:[-\s./]?\d){2,3}[abAB]?(?![0-9])\b/g;
  const matches: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    matches.push(m[0]);
  }

  if (matches.length === 0) return { formation: null, rawStr: null, isKnown: false };

  // Sort matches: prefer 4-digit formations over 3-digit (prevents "433" matching "4-2-3-1")
  const sorted = [...matches].sort((a, b) => extractDigits(b).length - extractDigits(a).length);

  for (const match of sorted) {
    const digits = extractDigits(match);
    const formation = DIGIT_TO_FORMATION[digits];
    if (formation) return { formation, rawStr: match, isKnown: true };
  }

  // Unknown/custom formation found — return raw string for AI fallback
  return { formation: null, rawStr: sorted[0], isKnown: false };
}

// ── Matrix resolver ───────────────────────────────────────────────────────────

/**
 * Resolves the optimal counter-tactic from the static matrix for a known opponent
 * formation. Enforces Kozmik Oda Layer 1 constraints on every path.
 *
 * Constraint resolution order:
 *   HOME → primary (if home-valid) → secondary (if home-valid) → HOME_FALLBACK (5-2-3)
 *   AWAY → primary (if not banned) → secondary (if not banned) → AWAY_FALLBACK (5-2-3)
 */
export function resolveCounterTactic(
  opponentFormation: OpponentFormation,
  location: "home" | "away",
  weekSeed: number,
): CounterTacticResult {
  const entry = ANTI_TACTIC_MATRIX[opponentFormation];
  const originalCounter = entry.primary.formation;

  let selected: CounterOption;
  let constraintApplied: CounterTacticResult["constraintApplied"] = "none";

  if (location === "home") {
    if (HOME_VALID.has(entry.primary.formation)) {
      selected = entry.primary;
    } else if (HOME_VALID.has(entry.secondary.formation)) {
      selected = entry.secondary;
      constraintApplied = "home_override";
    } else {
      selected = HOME_FALLBACK;
      constraintApplied = "home_override";
    }
  } else {
    if (!AWAY_BANNED.has(entry.primary.formation)) {
      selected = entry.primary;
    } else if (!AWAY_BANNED.has(entry.secondary.formation)) {
      selected = entry.secondary;
      constraintApplied = "away_override";
    } else {
      selected = AWAY_FALLBACK;
      constraintApplied = "away_override";
    }
  }

  const r = selected.sliders;
  return {
    opponentFormation,
    customOpponentFormation: undefined,
    opponentStyle: entry.opponentStyle,
    recommendedFormation: selected.formation,
    playStyle: selected.playStyle,
    resolvedSliders: {
      press: weekSi(weekSeed, 60001, r.pressMin, r.pressMax),
      style: weekSi(weekSeed, 60002, r.styleMin, r.styleMax),
      tempo: weekSi(weekSeed, 60003, r.tempoMin, r.tempoMax),
    },
    lineTactics: LINE_TACTICS[selected.formation],
    rationale: selected.rationale,
    constraintApplied,
    originalCounter,
    source: "matrix",
  };
}

// ── AI Fallback ───────────────────────────────────────────────────────────────

const VALID_COUNTER_FORMATIONS = new Set([
  "4-3-3", "4-4-2", "4-5-1", "4-2-3-1", "5-2-3", "5-3-2",
]);
const VALID_PLAY_STYLES = new Set([
  "shoot_on_sight", "wing_play", "passing_game", "counter_attack", "long_ball",
]);

function clamp(v: number): number {
  return Math.min(100, Math.max(0, Math.round(v)));
}

function applyLayer1Constraint(
  rawFormation: string,
  location: "home" | "away",
): { formation: RecommendedFormation; constraintApplied: CounterTacticResult["constraintApplied"] } {
  const f = (VALID_COUNTER_FORMATIONS.has(rawFormation) ? rawFormation : "5-2-3") as RecommendedFormation;
  if (location === "home" && !HOME_VALID.has(f)) {
    return { formation: "5-2-3", constraintApplied: "home_override" };
  }
  if (location === "away" && AWAY_BANNED.has(f)) {
    return { formation: "5-2-3", constraintApplied: "away_override" };
  }
  return { formation: f, constraintApplied: "none" };
}

/**
 * AI Fallback — called when the opponent plays a non-standard formation not found
 * in the static matrix. Uses Gemini 2.5 Flash to generate a logical counter-tactic.
 *
 * Always enforces Kozmik Oda Layer 1 before returning. If the model returns a
 * formation that violates the constraint, it is silently corrected to 5-2-3.
 */
export async function generateAICounterTactic(
  rawFormation: string,
  location: "home" | "away",
  apiKey: string,
): Promise<CounterTacticResult> {
  const ai = new GoogleGenAI({ apiKey });

  const locationRule =
    location === "home"
      ? "EV MAÇI KURALI (MUTLAK): counterFormation YALNIZCA '4-3-3' veya '5-2-3' olabilir."
      : "DEPLASMAN KURALI (MUTLAK): counterFormation ASLA '4-3-3' olamaz. '4-5-1', '4-4-2', '4-2-3-1', '5-2-3' veya '5-3-2' kullan.";

  const prompt = `OSM taktik uzmanısın. Rakip "${rawFormation}" formasyonu oynuyor. Maç yeri: ${location === "home" ? "Ev" : "Deplasman"}.
${locationRule}

JSON döndür (tam olarak bu alanlar):
{"opponentStyle":"wing_play|passing_game|shoot_on_sight|counter_attack|long_ball","counterFormation":"4-3-3|4-4-2|4-5-1|4-2-3-1|5-2-3|5-3-2","counterStyle":"wing_play|passing_game|shoot_on_sight|counter_attack|long_ball","press":0,"style":0,"tempo":0,"rationale":"Türkçe 1-2 cümle"}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 300,
      thinkingConfig: { thinkingBudget: 0 }, // no thinking — direct JSON output
    },
  });

  const text = response.text ?? "{}";

  // With responseMimeType:"application/json" Gemini returns raw JSON, but we still
  // defensively extract the object in case the model wraps it.
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Gemini returned no valid JSON for formation fallback");

  const data = JSON.parse(jsonMatch[0]) as {
    opponentStyle?: string;
    counterFormation?: string;
    counterStyle?: string;
    press?: number;
    style?: number;
    tempo?: number;
    rationale?: string;
  };

  const { formation: recommendedFormation, constraintApplied } = applyLayer1Constraint(
    data.counterFormation ?? "5-2-3",
    location,
  );

  const opponentStyle = (
    VALID_PLAY_STYLES.has(data.opponentStyle ?? "") ? data.opponentStyle : "passing_game"
  ) as TacticalPlayStyle;

  const counterStyle = (
    VALID_PLAY_STYLES.has(data.counterStyle ?? "") ? data.counterStyle : "counter_attack"
  ) as TacticalPlayStyle;

  return {
    opponentFormation: null,
    customOpponentFormation: rawFormation,
    opponentStyle,
    recommendedFormation,
    playStyle: counterStyle,
    resolvedSliders: {
      press: clamp(data.press ?? 30),
      style: clamp(data.style ?? 40),
      tempo: clamp(data.tempo ?? 55),
    },
    lineTactics: LINE_TACTICS[recommendedFormation] ?? {
      forwards:    "attack_and_defend",
      midfielders: "stay_in_position",
      defenders:   "deep_protection",
      offsideTrap: false,
      marking:     "zonal",
    },
    rationale: data.rationale ?? `${rawFormation} formasyonuna karşı Gemini 2.5 Flash analizi.`,
    constraintApplied,
    originalCounter: recommendedFormation,
    source: "ai_fallback",
  };
}
