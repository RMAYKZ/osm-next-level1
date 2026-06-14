export interface ManagerProfile {
  uid: string;
  nick: string;
  countryCode: string;
  favoriteFormation: string;
  osmNick: string;
  createdAt?: number;
  updatedAt?: number;
}

export const FORMATIONS = [
  "4-3-3",
  "4-4-2",
  "4-2-3-1",
  "4-5-1",
  "5-2-3",
  "5-3-2",
  "5-4-1",
  "5-3-1-1",
  "6-3-1",
  "3-5-2",
  "3-4-3",
];

export function emptyProfile(uid: string): ManagerProfile {
  return {
    uid,
    nick: "",
    countryCode: "TR",
    favoriteFormation: "5-2-3",
    osmNick: "",
  };
}
