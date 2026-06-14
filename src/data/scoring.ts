// Puan sistemi sabitleri
export const POINTS_CORRECT = 10; // Sonuç tahmini doğru olunca verilen puan
export const POINTS_WRONG = 0;

export type Choice = "teamA" | "draw" | "teamB";

export interface UserPrediction {
  id: string;
  matchId: string;
  userId: string;
  userNick: string;
  userCountry: string;
  choice: Choice;
  awardedPoints?: number;
  createdAt?: number;
}

export interface UserStats {
  totalPoints: number;
  correctPredictions: number;
  totalPredictions: number;
  updatedAt?: number;
}

export const emptyStats = (): UserStats => ({
  totalPoints: 0,
  correctPredictions: 0,
  totalPredictions: 0,
});

// Maç sonucunu choice'a çevir (örn: ev 2, deplasman 1 → "teamA")
export function resultToChoice(homeScore: number, awayScore: number): Choice {
  if (homeScore > awayScore) return "teamA";
  if (homeScore < awayScore) return "teamB";
  return "draw";
}
