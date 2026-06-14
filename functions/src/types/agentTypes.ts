// ── Counter-Tactic Engine Types ───────────────────────────────────────────────

/** Every formation an opponent can play (full OSM coverage). */
export type OpponentFormation =
  | "4-3-3" | "4-4-2" | "4-5-1" | "4-2-3-1"
  | "5-2-3" | "5-3-2" | "5-4-1"
  | "3-4-3" | "3-5-2";

/** Formations the engine is allowed to recommend as counters. */
export type RecommendedFormation =
  | "4-3-3" | "4-4-2" | "4-5-1" | "4-2-3-1"
  | "5-2-3" | "5-3-2";

/** OSM in-game play styles. */
export type TacticalPlayStyle =
  | "shoot_on_sight" | "wing_play" | "passing_game"
  | "counter_attack" | "long_ball";

export type ForwardTactic    = "attack_only" | "attack_and_defend" | "wide_play";
export type MidfielderTactic = "protect_defense" | "stay_in_position" | "attack_and_defend";
export type DefenderTactic   = "deep_protection" | "defend_deep" | "high_line";
export type MarkingType      = "man" | "zonal";

export interface LineTactics {
  forwards:    ForwardTactic;
  midfielders: MidfielderTactic;
  defenders:   DefenderTactic;
  offsideTrap: boolean;
  marking:     MarkingType;
}

/** Full output of the anti-tactic matrix resolver for a single match-up. */
export interface CounterTacticResult {
  /** Normalized formation code if known; null for non-standard/custom formations. */
  opponentFormation: OpponentFormation | null;
  /** Raw formation text when opponentFormation is null (used for display and AI fallback). */
  customOpponentFormation?: string;
  opponentStyle: TacticalPlayStyle;
  recommendedFormation: RecommendedFormation;
  playStyle: TacticalPlayStyle;
  resolvedSliders: { press: number; style: number; tempo: number };
  lineTactics: LineTactics;
  rationale: string;
  /** "none" = primary counter used as-is; *_override = KozmikOda constraint pivoted the choice. */
  constraintApplied: "none" | "home_override" | "away_override";
  /** The raw primary counter before location constraint was applied. */
  originalCounter: RecommendedFormation;
  /** Whether this result came from the static matrix or the Claude AI fallback. */
  source: "matrix" | "ai_fallback";
}

/** Collected variables from the interactive wizard, used for slider modifiers. */
export interface TacticSession {
  opponentFormation: string;
  location: "home" | "away";
  strength: "stronger" | "equal" | "weaker";
  campStatus: "kamp" | "gizli_antrenman" | "yok";
}

/** Structured tactic card payload sent to the frontend for rich UI rendering. */
export interface TacticCardData {
  opponentFormation: string;
  location: "home" | "away" | "unknown";
  recommendedFormation: string;
  playStyleKey: TacticalPlayStyle;
  press: number;
  style: number;
  tempo: number;
  lineTactics: LineTactics;
  rationale: string;
  source: "matrix" | "ai_fallback";
}

// ── Core Agent Types ──────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type Location  = "home" | "away" | "unknown";
export type Strength  = "stronger" | "equal" | "weaker" | "unknown";
export type Formation = "5-2-3" | "4-3-3" | "unknown";

export interface MatchIntent {
  location: Location;
  strength: Strength;
  formation: Formation;
  language: "tr" | "en" | "hu" | "ar" | "pt";
  celebrationTrigger: boolean;
  transferQuery: boolean;
  spyQuery: boolean;
  refereeColor: string | null;
  squadValueUser: number | null;
  squadValueOpponent: number | null;
  /** Normalized opponent formation if it matches a known standard; null otherwise. */
  opponentFormation: OpponentFormation | null;
  /** Raw formation text from the message — set even for unknown/custom formations. */
  rawOpponentFormation: string | null;
}

export interface DataContext {
  weekSeed: number;
  weekNumber: number;
  currentDate: string;
  sliders: { press: number; style: number; tempo: number } | null;
}

export interface TacticalIntel {
  refereeRisk: "low" | "medium" | "high" | null;
  aggressionValue: number | null;
  spyFindings: string | null;
  difficultyRatio: number | null;
  /** Resolved by Anti-Tactic Matrix (known formation) or AI fallback (custom formation). */
  counterTactic: CounterTacticResult | null;
}

export interface WonderkidEntry {
  name: string;
  position: string;
  age: number;
  potential: number;
  nationality: string;
}

export interface TransferContext {
  active: boolean;
  wonderkids: WonderkidEntry[];
  optimalPrice: number | null;
  quickSalePrice: number | null;
}

export interface UserHistoryEntry {
  tacticUsed: string;
  sliders: { press: number; style: number; tempo: number };
  matchDate: string;
  outcome: "win" | "draw" | "loss" | "unknown";
}

export interface UserHistory {
  successCount: number;
  lastTactic: string | null;
  recentEntries: UserHistoryEntry[];
  celebrationMode: boolean;
}

export interface OrchestratorContext {
  matchIntent: MatchIntent;
  dataContext: DataContext;
  tacticalIntel: TacticalIntel;
  transferContext: TransferContext;
  userHistory: UserHistory;
}
