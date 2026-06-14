// ═══════════════════════════════════════════════════════════════════════════
//  HIGH-RISK TACTICAL ENGINE — DATA
//  COMPLETELY ISOLATED from main tactics.ts / extras.ts / WeeklyMeta data.
//  Do NOT import anything from tactics.ts into this file.
// ═══════════════════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────────────────────

export type RefereeColor = "orange" | "red";
export type FormationCategory = "defensive" | "offensive";

export interface SliderRange {
  min: number;
  max: number;
  recommended: number;
}

export interface HighRiskTackling {
  tr: string;
  en: string;
  hu: string;
  ar: string;
  pt: string;
}

export interface HighRiskTactic {
  id: string;
  formation: string;
  category: FormationCategory;
  emoji: string;
  name: string;
  nameEn: string;
  pressure: SliderRange;
  style: SliderRange;
  tempo: SliderRange;
  notes: string;
  notesEn: string;
  countersFormation?: string;
  awayOnly?: boolean;
}

// ── Defensive formations that receive enforced High-Risk slider ranges ────────
export const DEFENSIVE_FORMATIONS = [
  "5-2-3", "5-3-1-1", "5-3-2", "4-5-1", "4-2-3-1",
] as const;

// ── Offensive formations EXCLUDED from low pressure/style in High-Risk Mode ──
export const OFFENSIVE_EXCLUSIONS = [
  "4-3-3", "4-2-4", "3-4-3", "3-3-4",
] as const;

// ── Enforced slider ranges for defensive formations in High-Risk Mode ─────────
export const HIGH_RISK_RULES = {
  pressure: { min: 5,  max: 15 },
  style:    { min: 20, max: 35 },
  tempo:    { min: 60, max: 75 },
} as const;

// ── Tackling recommendation by referee color (all 5 languages) ───────────────
export const REFEREE_TACKLING: Record<RefereeColor, HighRiskTackling> = {
  orange: {
    tr: "Çok Agresif",
    en: "Very Aggressive",
    hu: "Nagyon Agresszív",
    ar: "عدواني جداً",
    pt: "Muito Agressivo",
  },
  red: {
    tr: "Agresif",
    en: "Aggressive",
    hu: "Agresszív",
    ar: "عدواني",
    pt: "Agressivo",
  },
};

// ── Validation — prevents offensive formations from using low sliders ─────────
export function validateHighRiskUsage(
  formation: string,
  pressure: number,
  style: number,
): { valid: boolean; reason?: string } {
  if ((OFFENSIVE_EXCLUSIONS as readonly string[]).includes(formation)) {
    if (pressure < 30 || style < 40) {
      return {
        valid: false,
        reason: `"${formation}" is an offensive formation. High-Risk Mode does NOT allow low Pressure/Style for this formation (min Pressure: 30, min Style: 40).`,
      };
    }
  }
  return { valid: true };
}

// ═══════════════════════════════════════════════════════════════════════════
//  HighRiskTacticsList — the isolated data array.
//
//  HOW TO ADD A NEW TACTIC IN THE FUTURE:
//  1. Copy one complete object block below.
//  2. Change id (must be unique), formation, name, nameEn, emoji, notes.
//  3. Set slider ranges — defensive formations MUST follow HIGH_RISK_RULES
//     (pressure 5-15, style 20-35, tempo 60-75).
//  4. Set category: "defensive" or "offensive".
//  5. Push the new object into the array. Done.
// ═══════════════════════════════════════════════════════════════════════════
export const HighRiskTacticsList: HighRiskTactic[] = [

  // ── DEFENSIVE FORMATIONS (enforced slider ranges apply) ──────────────────

  {
    id: "hr-523",
    formation: "5-2-3",
    category: "defensive",
    emoji: "🛡️",
    name: "Çelik Sur",
    nameEn: "Steel Fortress",
    pressure:  { min: 5,  max: 15, recommended: 8  },
    style:     { min: 20, max: 35, recommended: 25 },
    tempo:     { min: 60, max: 75, recommended: 65 },
    notes:    "En savunmacı diziliş. 5 defansör rakibin her saldırısını söndürür. 3 forvet aniden açılan kontra ataklara hazır bekler. Düşük baskı ile enerji koruması yapılır.",
    notesEn:  "Most defensive setup. 5 defenders extinguish every attack. 3 forwards stand ready for sudden counter-attacks. Low pressure conserves energy for rapid transitions.",
  },

  {
    id: "hr-5311",
    formation: "5-3-1-1",
    category: "defensive",
    emoji: "🏰",
    name: "İşgal Altı Kale",
    nameEn: "Occupied Castle",
    pressure:  { min: 5,  max: 15, recommended: 10 },
    style:     { min: 20, max: 35, recommended: 28 },
    tempo:     { min: 60, max: 75, recommended: 68 },
    notes:    "Orta sahada 3+1 kompakt blok. Rakibin tüm pas koridorlarını sistemli olarak kapatır. Destekçi forvet açılan boşluklara hızla koşar. Savunma kökenli çıkışlar bu formasyonun gücüdür.",
    notesEn:  "3+1 compact midfield block. Systematically closes all passing lanes. Supporting forward bursts into space. Defensive counter transitions are this formation's weapon.",
  },

  {
    id: "hr-532",
    formation: "5-3-2",
    category: "defensive",
    emoji: "⚔️",
    name: "Çift Kılıç",
    nameEn: "Twin Blade",
    pressure:  { min: 5,  max: 15, recommended: 12 },
    style:     { min: 20, max: 35, recommended: 30 },
    tempo:     { min: 60, max: 75, recommended: 70 },
    notes:    "2 forvetle deplasmanda gol tehdidi oluştururken 5 defansörle savunma sağlamlığını korur. Yüksek tempo ile hızlı çıkışlar yaratılır. En dengeli Yüksek Risk dizilişi.",
    notesEn:  "Maintains defensive solidity with 5 defenders while threatening with 2 forwards on the break. High tempo creates rapid outlets. Most balanced High-Risk setup.",
  },

  {
    id: "hr-451",
    formation: "4-5-1",
    category: "defensive",
    emoji: "🔒",
    name: "Orta Saha Kilit",
    nameEn: "Midfield Lock",
    pressure:  { min: 5,  max: 15, recommended: 8  },
    style:     { min: 20, max: 35, recommended: 22 },
    tempo:     { min: 60, max: 75, recommended: 62 },
    notes:    "5 ortasaha oyuncusuyla rakibin pas yollarını tamamen keser. Tek forvet bireysel kabiliyetiyle ani çıkış fırsatları arar. Rakibe hiç alan bırakılmaz.",
    notesEn:  "5 midfielders completely cut opponent passing lanes. Single forward relies on individual quality for breakaway opportunities. Opponent given zero space.",
  },

  {
    id: "hr-4231",
    formation: "4-2-3-1",
    category: "defensive",
    emoji: "🎯",
    name: "Kontrollü Barikat",
    nameEn: "Controlled Barricade",
    pressure:  { min: 5,  max: 15, recommended: 13 },
    style:     { min: 20, max: 35, recommended: 32 },
    tempo:     { min: 60, max: 75, recommended: 72 },
    notes:    "2 savunma ortasahası ile bölgeyi kilitler. Arkasındaki 3 oyuncuya dayanma noktası sağlar. Süratle geçiş yaparak rakibi pozisyon almadan yakalar. Bu formasyonda tempo kritiktir.",
    notesEn:  "2 defensive midfielders lock the zone, providing a foundation for the 3 behind them. Rapid transitions catch the opponent before they can settle. Tempo is critical here.",
  },

  // ── AWAY COUNTER-TACTICS — 5-2-3 vs specific opponent formations ────────────
  //  awayOnly: true  → match context shows Away badge only (not Home + Away)
  //  countersFormation  → displayed in the formation card as "VS X-X-X"
  //  Style values intentionally deviate from HIGH_RISK_RULES (user-specified exact values)

  {
    id: "hr-523-away-vs451",
    formation: "5-2-3",
    category: "defensive",
    emoji: "✈️",
    name: "4-5-1 Deplasman Kırıcı",
    nameEn: "4-5-1 Away Counter",
    pressure:  { min: 12, max: 18, recommended: 15 },
    style:     { min: 1,  max: 5,  recommended: 3  },
    tempo:     { min: 64, max: 70, recommended: 67 },
    notes:    "Rakibin 4-5-1 kale duvarını DEPLASMANDA yıkmak için özel tasarlandı. Stil değeri 3 — kazanmak yerine skoru koruma ve keskin kontra ataklara odaklanır. 5 defansör tam hat tutarken 3 forvet anlık boşluklarda vurur.",
    notesEn:  "Engineered specifically to neutralize the opponent's 4-5-1 wall on the road. Style at 3 — priorities score protection and sharp counter-attacks over possession. 5 defenders hold the line; 3 forwards strike the instant space opens.",
    countersFormation: "4-5-1",
    awayOnly: true,
  },

  {
    id: "hr-523-away-vs433",
    formation: "5-2-3",
    category: "defensive",
    emoji: "✈️",
    name: "4-3-3 Deplasman Kilidi",
    nameEn: "4-3-3 Away Lock",
    pressure:  { min: 5,  max: 12, recommended: 8  },
    style:     { min: 18, max: 24, recommended: 21 },
    tempo:     { min: 64, max: 70, recommended: 67 },
    notes:    "Yüksek baskılı 4-3-3'ü DEPLASMANDA bloke etmek için optimize edildi. Çok düşük baskı rakibin hücum döngüsünü kırar ve enerji korur. Dengeli stil ile kontra atak hazırlığı sağlanır.",
    notesEn:  "Optimized to shut down the high-press 4-3-3 on the road. Very low pressure disrupts the opponent's attacking cycle and conserves energy. Balanced style maintains counter-attack readiness.",
    countersFormation: "4-3-3",
    awayOnly: true,
  },

  {
    id: "hr-523-away-vs541",
    formation: "5-2-3",
    category: "defensive",
    emoji: "✈️",
    name: "5-4-1 Deplasman Bariyeri",
    nameEn: "5-4-1 Away Barrier",
    pressure:  { min: 9,  max: 15, recommended: 12 },
    style:     { min: 17, max: 23, recommended: 20 },
    tempo:     { min: 66, max: 72, recommended: 69 },
    notes:    "Rakibin savunmacı 5-4-1 blokunu DEPLASMANDA geçmek için geliştirildi. Yüksek tempo rakip blok arasında geçiş hızı oluşturur. Baskı ve stil dengesi skoru korurken ani çıkış fırsatlarını canlı tutar.",
    notesEn:  "Developed to break through the opponent's defensive 5-4-1 block on the road. High tempo creates transition speed against the compact block. Balanced pressure and style protect the score while keeping breakaway opportunities alive.",
    countersFormation: "5-4-1",
    awayOnly: true,
  },

  // ── OFFENSIVE EXCLUSION (explicitly documented — validation will block misuse) ─

  {
    id: "hr-433-excluded",
    formation: "4-3-3",
    category: "offensive",
    emoji: "🚫",
    name: "Yüksek Baskı [YASAK]",
    nameEn: "High Press [EXCLUDED]",
    pressure:  { min: 30, max: 99, recommended: 55 },
    style:     { min: 40, max: 99, recommended: 60 },
    tempo:     { min: 50, max: 99, recommended: 65 },
    notes:    "4-3-3 Yüksek Risk Modunda düşük Baskı/Stil değerleriyle KULLANILAMAZ. Bu formasyon ofansif değerleri zorunlu kılar: minimum Baskı 30, minimum Stil 40. Yanlış sliderlar maçı kaybettirir.",
    notesEn:  "4-3-3 CANNOT be used with low Pressure/Style in High-Risk Mode. This formation requires offensive values: minimum Pressure 30, minimum Style 40. Wrong sliders will lose the match.",
  },
];
