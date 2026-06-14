import type { ChatMessage, MatchIntent } from "../types/agentTypes";
import { calculateSquadWeight } from "../skills/squadWeight";
import { detectOpponentFormation } from "../skills/matchAnalysisUtils";

const HOME_KW  = ["iç saha", "evde", "home", "ev maçı", "kendi sahamızda", "iç sahada"];
const AWAY_KW  = ["deplasman", "dışarıda", "away", "konuk", "deplasmanda"];
const STRONG_OPPONENT_KW = ["güçlü rakip", "zor rakip", "büyük takım", "büyük rakip", "güçlü takım"];
const WEAK_OPPONENT_KW   = ["zayıf rakip", "kolay maç", "alt takım", "küçük rakip", "zayıf takım"];
const CELEBRATION_KW     = ["taktik tuttu", "sahaya gömdüm", "kazandık", "süper maç", "mükemmel maç", "harika maç"];
const TRANSFER_KW        = ["transfer", "alım", "satım", "oyuncu", "piyasa", "scout", "genç oyuncu", "borsacı", "wonderkid"];
const SPY_KW             = ["casus", "haberci", "rakip analizi", "gözlem", "hakem", "rakip formasyonu", "casus raporu"];

const COLOR_MAP: Record<string, string> = {
  kırmızı: "red", sarı: "yellow", yeşil: "green", turuncu: "orange",
  red: "red", yellow: "yellow", green: "green", orange: "orange",
};

function extractNumbers(text: string): number[] {
  return (text.match(/\d+(?:[.,]\d+)?/g) ?? []).map(n => parseFloat(n.replace(",", ".")));
}

function detectRefereeColor(lower: string): string | null {
  for (const [keyword, colorEn] of Object.entries(COLOR_MAP)) {
    if (lower.includes(keyword)) return colorEn;
  }
  return null;
}

/**
 * Gateway analyst: inspects intent, detects language, isolates match parameters,
 * and extracts opponent formation for the Anti-Tactic Matrix.
 * Now captures both normalized formation AND raw text for AI fallback.
 */
export function runGozlemci(messages: ChatMessage[]): MatchIntent {
  const lastUser = messages.filter(m => m.role === "user").at(-1)?.content ?? "";
  const lower = lastUser.toLowerCase();
  const isTurkish = /[çğışöüÇĞİŞÖÜ]/.test(lastUser) || lower.includes("maç") || lower.includes("taktik");

  const location: MatchIntent["location"] =
    HOME_KW.some(k => lower.includes(k)) ? "home" :
    AWAY_KW.some(k => lower.includes(k)) ? "away" : "unknown";

  let strength: MatchIntent["strength"] =
    STRONG_OPPONENT_KW.some(k => lower.includes(k)) ? "weaker" :
    WEAK_OPPONENT_KW.some(k => lower.includes(k))   ? "stronger" :
    (lower.includes("dengeli") || lower.includes("eşit")) ? "equal" : "unknown";

  const formation: MatchIntent["formation"] =
    lower.includes("4-3-3") ? "4-3-3" :
    lower.includes("5-2-3") ? "5-2-3" :
    location === "home"     ? "4-3-3" : "5-2-3";

  const nums = extractNumbers(lastUser);
  const squadValueUser     = nums.length >= 2 ? nums[0] : null;
  const squadValueOpponent = nums.length >= 2 ? nums[1] : null;
  if (squadValueUser !== null && squadValueOpponent !== null) {
    strength = calculateSquadWeight(squadValueUser, squadValueOpponent).suggestedStrength;
  }

  // Formation detection v2 — returns { formation, rawStr, isKnown }
  // formation: normalized OpponentFormation or null for custom/unknown
  // rawStr: raw text match even for non-standard formations (used by AI fallback in Casus)
  const { formation: opponentFormation, rawStr: rawOpponentFormation } =
    detectOpponentFormation(lastUser);

  return {
    location,
    strength,
    formation,
    language: isTurkish ? "tr" : "en",
    celebrationTrigger: CELEBRATION_KW.some(k => lower.includes(k)),
    transferQuery: TRANSFER_KW.some(k => lower.includes(k)),
    spyQuery: SPY_KW.some(k => lower.includes(k)),
    refereeColor: detectRefereeColor(lower),
    squadValueUser,
    squadValueOpponent,
    opponentFormation,
    rawOpponentFormation,
  };
}
