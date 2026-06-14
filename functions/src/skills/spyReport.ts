export interface SpyReportResult {
  findings: string[];
  riskLevel: "low" | "medium" | "high";
  structuralFlaws: string[];
}

export interface RefereeProfile {
  color: string;
  tacklingRisk: number;
  aggressionValue: number;
  riskLabel: "low" | "medium" | "high";
  notes: string;
}

const REFEREE_DATA: Record<string, Omit<RefereeProfile, "color">> = {
  green:  { tacklingRisk: 15, aggressionValue: 20, riskLabel: "low",    notes: "Agresif baskı güvenli — serbest oyna." },
  yellow: { tacklingRisk: 35, aggressionValue: 50, riskLabel: "medium", notes: "Temkinli ol, gereksiz ihlalden kaçın." },
  orange: { tacklingRisk: 55, aggressionValue: 65, riskLabel: "medium", notes: "Disiplin kritik — baskıyı düşür." },
  red:    { tacklingRisk: 80, aggressionValue: 85, riskLabel: "high",   notes: "Agresif taktik kesinlikle yasak — maksimum disiplin." },
};

/** Extracts training camp states, secret trainings, and structural flaws from raw report data. */
export function analyzeSpyReport(reportData: Record<string, unknown>): SpyReportResult {
  const findings: string[] = [];
  const flaws: string[] = [];

  if (reportData.secretTraining === true)
    findings.push("Gizli antrenman tespit edildi — rakip motivasyonu yüksek.");
  if (Array.isArray(reportData.injuredPlayers) && reportData.injuredPlayers.length > 2) {
    findings.push(`${reportData.injuredPlayers.length} sakatlık mevcut — rakip kadrosu zayıf.`);
    flaws.push("Anahtar oyuncu eksikliği var.");
  }
  if (reportData.lowMorale === true)
    findings.push("Rakip morali düşük — baskı taktiği etkili olabilir.");
  if (reportData.formationFlaw)
    flaws.push(`Formasyon açığı: ${String(reportData.formationFlaw)}`);

  return {
    findings,
    riskLevel: findings.length === 0 ? "low" : findings.length <= 2 ? "medium" : "high",
    structuralFlaws: flaws,
  };
}

/** Cross-references referee color with precise tackling risk and aggression values. */
export function getRefereeStrictness(refereeColor: string): RefereeProfile {
  const data = REFEREE_DATA[refereeColor.toLowerCase().trim()] ?? REFEREE_DATA["yellow"];
  return { color: refereeColor, ...data };
}
