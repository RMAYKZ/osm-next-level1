export interface SavedTactic {
  id: string;
  uid: string;
  savedAt: number;
  weekNum: number;
  yearWeekKey: string;

  comboKey: string;
  location: 'home' | 'away';
  strength: 'stronger' | 'equal' | 'weaker';

  opponentKey: string;
  opponentLabel: string;

  counterFormation: string;
  gamePlan: string;
  gamePlanIcon: string;

  pressure: number;
  style: number;
  tempo: number;

  forwards: string;
  midfield: string;
  defence: string;
  offside: boolean;
  marking: string;

  badge: string;
  successRate: number;
  option: 'A' | 'B';
}
