import type { WonderkidEntry } from "../types/agentTypes";

// Expand this list with a real database query when ready.
const WONDERKID_DB: WonderkidEntry[] = [
  { name: "Endrick",            position: "ST",  age: 18, potential: 95, nationality: "Brezilya" },
  { name: "Lamine Yamal",       position: "RW",  age: 17, potential: 97, nationality: "İspanya" },
  { name: "Warren Zaïre-Emery", position: "CM",  age: 18, potential: 92, nationality: "Fransa" },
  { name: "Arda Güler",         position: "CAM", age: 19, potential: 93, nationality: "Türkiye" },
  { name: "Kobbie Mainoo",      position: "CM",  age: 19, potential: 90, nationality: "İngiltere" },
  { name: "Pau Cubarsí",        position: "CB",  age: 17, potential: 91, nationality: "İspanya" },
  { name: "Alejandro Garnacho", position: "LW",  age: 19, potential: 91, nationality: "Arjantin" },
  { name: "Mathys Tel",         position: "LW",  age: 19, potential: 91, nationality: "Fransa" },
  { name: "Savinho",            position: "RW",  age: 20, potential: 90, nationality: "Brezilya" },
  { name: "Willian Pacho",      position: "CB",  age: 22, potential: 89, nationality: "Ekvador" },
];

export function getWonderkidList(): WonderkidEntry[] {
  return WONDERKID_DB;
}

/** OSM transfer market: optimal listing = value × 1.12 (max market tolerance). */
export function calculateOptimalPrice(playerValue: number): number {
  return Math.round(playerValue * 1.12);
}

/** Fast liquidation floor = value × 0.88 (quick buyer attraction). */
export function calculateQuickSale(playerValue: number): number {
  return Math.round(playerValue * 0.88);
}
