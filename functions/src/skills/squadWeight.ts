export interface DifficultyMatrix {
  ratio: number;
  label: string;
  suggestedStrength: "stronger" | "equal" | "weaker";
}

/** Compares squad values to produce a precise difficulty matrix. */
export function calculateSquadWeight(
  userValue: number,
  opponentValue: number,
): DifficultyMatrix {
  const ratio = userValue / Math.max(opponentValue, 1);

  let label: string;
  let suggestedStrength: DifficultyMatrix["suggestedStrength"];

  if (ratio >= 1.15) {
    label = "Rakip belirgin şekilde zayıf — baskı uygula";
    suggestedStrength = "stronger";
  } else if (ratio >= 0.85) {
    label = "Dengeli maç — temkinli oyna";
    suggestedStrength = "equal";
  } else {
    label = "Rakip güçlü — önce savun";
    suggestedStrength = "weaker";
  }

  return { ratio: Math.round(ratio * 100) / 100, label, suggestedStrength };
}
