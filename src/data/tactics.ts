// ⚡ OSM NEXT LEVEL — EXCLUSIVE MASTER DATA BY OMEROVVVVV (UPDATED 26/27)
export type LineTactic = {
  forwards: "attack" | "holdPos" | "defHelp";
  midfield: "attack" | "holdPos" | "defHelp";
  defence: "attack" | "holdPos" | "stayBack";
  offsides: boolean;
  marking: "area" | "man";
};

export interface OpponentTactic {
  id: string;
  name: string;
  formation: string;
  style: string;
  emoji: string;
}

export const opponentTactics: OpponentTactic[] = [
  { id: "433A", name: "4-3-3 A (Wing Play / Passing)", formation: "4-3-3", style: "Wing Play / Passing", emoji: "⚽" },
  { id: "433B", name: "4-3-3 B (Wing Play / Passing)", formation: "4-3-3", style: "Wing Play / Passing", emoji: "🎯" },
  { id: "442",  name: "4-4-2 A/B (Passing Game)",       formation: "4-4-2", style: "Passing Game",        emoji: "🛡️" },
  { id: "4231", name: "4-2-3-1 (Shoot on Sight)",       formation: "4-2-3-1", style: "Shoot on Sight",   emoji: "🔥" },
  { id: "451",  name: "4-5-1 (Shoot on Sight)",          formation: "4-5-1", style: "Shoot on Sight",     emoji: "🔰" },
  { id: "523",  name: "5-2-3 A/B (Counter Attack)",      formation: "5-2-3", style: "Counter Attack",     emoji: "⚡" },
  { id: "541",  name: "5-4-1 A/B (Shoot on Sight / Counter)", formation: "5-4-1", style: "Shoot on Sight", emoji: "🏰" },
  { id: "631",  name: "6-3-1 A/B (Counter Attack)",      formation: "6-3-1", style: "Park the Bus",       emoji: "🚌" },
  { id: "532",  name: "5-3-2 (Counter Attack)",           formation: "5-3-2", style: "Counter Attack",    emoji: "🔱" },
  { id: "5311", name: "5-3-1-1 (Counter Attack)",         formation: "5-3-1-1", style: "Counter Attack", emoji: "⚓" },
];

export type Location = "home" | "away";
export type Strength = "stronger" | "equal" | "weaker";

/**
 * Defines the oscillation boundaries for a tactic's numeric fields.
 * Values produced by the engine are strictly clamped to these ranges,
 * ensuring a defensive tactic never drifts into an attacking personality.
 *
 * When omitted from a tactic entry the engine auto-derives bounds from the
 * base values (base ± AUTO_MARGIN, clamped to [0, 100]).
 *
 * Example — a disciplined counter tactic:
 *   dna: {
 *     pressure: { min: 10, max: 30 },
 *     style:    { min: 5,  max: 25 },
 *     tempo:    { min: 60, max: 79 },
 *   }
 */
export interface TacticDNA {
  pressure: { min: number; max: number };
  style:    { min: number; max: number };
  tempo:    { min: number; max: number };
}

export interface AntiTactic {
  opponentId: string;
  location: Location;
  strength: Strength;
  recommendedFormation: string;
  formation: string;
  pressure: number;
  style: number;
  tempo: number;
  lineTactics: LineTactic;
  lineup: string[];
  note: string;
  /** Optional personality boundary. Auto-derived from base values when absent. */
  dna?: TacticDNA;
}

export const antiTactics: AntiTactic[] = [
  // ── AWAY SCENARIOS ──
  // vs 4-3-3 A
  { opponentId: "433A", location: "away", strength: "weaker",   recommendedFormation: "5-2-3 A (Counter Attack)",   formation: "5-2-3", pressure: 20, style: 11, tempo: 65, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away underdog vs 4-3-3 A: park the 5-back block and absorb pressure. Strike on the counter." },
  { opponentId: "433A", location: "away", strength: "equal",    recommendedFormation: "5-2-3 A (Counter Attack)",   formation: "5-2-3", pressure: 32, style: 16, tempo: 66, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away equal vs 4-3-3 A: controlled counter-press. Hold shape, burst forward on turnovers." },
  { opponentId: "433A", location: "away", strength: "stronger", recommendedFormation: "5-2-3 A (Counter Attack)",   formation: "5-2-3", pressure: 39, style: 26, tempo: 75, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away stronger vs 4-3-3 A: punish with rapid transitions. Win the flanks, break quickly." },
  { opponentId: "433A", location: "away", strength: "weaker",   recommendedFormation: "5-3-2 (Counter Attack)",     formation: "5-3-2", pressure: 22, style: 9,  tempo: 69, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC MC", "ST ST"], note: "Away weaker vs 4-3-3 A (alt): ultra-compact 5-3-2 block denies width — absorb and counter late." },
  // vs 5-3-1-1
  { opponentId: "5311", location: "away", strength: "weaker",   recommendedFormation: "5-2-3 A (Counter Attack)",   formation: "5-2-3", pressure: 8,  style: 11, tempo: 62, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away weaker vs 5-3-1-1: patience is the weapon. They park — absorb and counter-punch on the break." },
  { opponentId: "5311", location: "away", strength: "equal",    recommendedFormation: "5-2-3 A (Counter Attack)",   formation: "5-2-3", pressure: 11, style: 32, tempo: 70, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away equal vs 5-3-1-1: crack their defensive shell with controlled width and quick transitions." },
  { opponentId: "5311", location: "away", strength: "stronger", recommendedFormation: "5-2-3 A (Counter Attack)",   formation: "5-2-3", pressure: 24, style: 20, tempo: 74, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away stronger vs 5-3-1-1: exploit the space behind their defensive line with fast counter runs." },
  // vs 5-3-2
  { opponentId: "532", location: "away", strength: "stronger",  recommendedFormation: "5-2-3 A (Counter Attack)",   formation: "5-2-3", pressure: 36, style: 16, tempo: 66, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away stronger vs 5-3-2: break their compact block with quick counter combinations. Use your quality." },
  { opponentId: "532", location: "away", strength: "equal",     recommendedFormation: "5-2-3 A (Counter Attack)",   formation: "5-2-3", pressure: 25, style: 9,  tempo: 60, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away equal vs 5-3-2: mirror discipline — out-counter them with better shape and tempo." },
  { opponentId: "532", location: "away", strength: "stronger",  recommendedFormation: "5-2-3 A (Counter Attack)",   formation: "5-2-3", pressure: 35, style: 15, tempo: 75, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away stronger vs 5-3-2 (alt): high tempo counter — overload transitions before they reset." },
  // vs 5-2-3
  { opponentId: "523", location: "away", strength: "weaker",    recommendedFormation: "5-2-3 A (Counter Attack)",   formation: "5-2-3", pressure: 9,  style: 22, tempo: 65, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away weaker vs 5-2-3: out-counter the counter. They attack — absorb and punish faster on the break." },
  { opponentId: "523", location: "away", strength: "equal",     recommendedFormation: "5-2-3 A (Counter Attack)",   formation: "5-2-3", pressure: 16, style: 9,  tempo: 72, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away equal vs 5-2-3: sharp decision-making wins this. Take the midfield duel on turnovers." },
  { opponentId: "523", location: "away", strength: "stronger",  recommendedFormation: "5-2-3 A (Counter Attack)",   formation: "5-2-3", pressure: 32, style: 16, tempo: 77, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away stronger vs 5-2-3: increase pressure incrementally and convert your superiority into transition goals." },
  // vs 4-2-3-1
  { opponentId: "4231", location: "away", strength: "weaker",   recommendedFormation: "5-2-3 A (Counter Attack)",   formation: "5-2-3", pressure: 15, style: 3,  tempo: 67, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away weaker vs 4-2-3-1 SoS: 5-back low-block is essential. Zero pressure — wait for the one chance." },
  { opponentId: "4231", location: "away", strength: "equal",    recommendedFormation: "5-2-3 A (Counter Attack)",   formation: "5-2-3", pressure: 32, style: 12, tempo: 70, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away equal vs 4-2-3-1: neutralise their long shots with a 5-back counter setup. Stay compact." },
  { opponentId: "4231", location: "away", strength: "stronger", recommendedFormation: "5-2-3 A (Counter Attack)",   formation: "5-2-3", pressure: 49, style: 19, tempo: 79, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away stronger vs 4-2-3-1: pin them back in their half. Counter-press and dominate the transition space." },
  // vs 4-5-1
  { opponentId: "451", location: "away", strength: "weaker",    recommendedFormation: "5-2-3 A (Counter Attack)",   formation: "5-2-3", pressure: 15, style: 3,  tempo: 67, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away weaker vs 4-5-1: 5-2-3 counter shuts down their midfield overload. Be patient — the chance will come." },
  { opponentId: "451", location: "away", strength: "equal",     recommendedFormation: "5-2-3 A/B (Counter Attack)", formation: "5-2-3", pressure: 32, style: 12, tempo: 70, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away equal vs 4-5-1: match their 5-mid with your 5-back shape. Counter through the wider channels." },
  { opponentId: "451", location: "away", strength: "stronger",  recommendedFormation: "5-2-3 A (Counter Attack)",   formation: "5-2-3", pressure: 49, style: 19, tempo: 79, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away stronger vs 4-5-1: strangle their build-up with a high-tempo counter system. Exploit transitions." },
  // vs 4-3-3 B
  { opponentId: "433B", location: "away", strength: "weaker",   recommendedFormation: "5-2-3 A (Counter Attack)",   formation: "5-2-3", pressure: 20, style: 11, tempo: 65, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away weaker vs 4-3-3 B: same lock-down approach — 5-back compact block, counter on the break." },
  { opponentId: "433B", location: "away", strength: "equal",    recommendedFormation: "5-2-3 A (Counter Attack)",   formation: "5-2-3", pressure: 32, style: 16, tempo: 66, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away equal vs 4-3-3 B: controlled possession disruption. Force errors, then counter with clinical precision." },
  { opponentId: "433B", location: "away", strength: "stronger", recommendedFormation: "5-2-3 A (Counter Attack)",   formation: "5-2-3", pressure: 39, style: 26, tempo: 75, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away stronger vs 4-3-3 B: dominant counter-attack. Push the pace and exploit every transition." },
  { opponentId: "433B", location: "away", strength: "weaker",   recommendedFormation: "5-3-2 (Counter Attack)",     formation: "5-3-2", pressure: 22, style: 9,  tempo: 69, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC MC", "ST ST"], note: "Away weaker vs 4-3-3 B (alt): ultra-compact 5-3-2 block eliminates their wing threat entirely." },
  // vs 4-4-2
  { opponentId: "442", location: "away", strength: "weaker",    recommendedFormation: "4-5-1 (Shoot on Sight)",     formation: "4-5-1", pressure: 25, style: 15, tempo: 65, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "DM MC MC MC MC", "ST"], note: "Away weaker vs 4-4-2 Passing: 4-5-1 Shoot on Sight neutralises their midfield possession dominance." },
  { opponentId: "442", location: "away", strength: "equal",     recommendedFormation: "5-2-3 A/B (Counter Attack)", formation: "5-2-3", pressure: 16, style: 12, tempo: 62, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away equal vs 4-4-2: disrupt their passing rhythm and exploit open space through quick counters." },
  { opponentId: "442", location: "away", strength: "stronger",  recommendedFormation: "4-3-3 B (Wing Play)",        formation: "4-3-3", pressure: 66, style: 56, tempo: 66, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "MC MC MC", "MR ST ML"], note: "Away stronger vs 4-4-2: attack their exposed flanks with 4-3-3 B wing play. Win the wide battles." },
  { opponentId: "442", location: "away", strength: "equal",     recommendedFormation: "5-2-3 A/B (Counter Attack)", formation: "5-2-3", pressure: 32, style: 21, tempo: 66, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away equal vs 4-4-2 (alt): 5-2-3 absorbs their passing game and counters with precision." },
  // vs 5-4-1
  { opponentId: "541", location: "away", strength: "weaker",    recommendedFormation: "5-2-3 A/B (Counter Attack)", formation: "5-2-3", pressure: 13, style: 11, tempo: 62, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away weaker vs 5-4-1: extreme patience required. Let them sit — counter the moment they overcommit." },
  { opponentId: "541", location: "away", strength: "equal",     recommendedFormation: "5-2-3 A/B (Counter Attack)", formation: "5-2-3", pressure: 33, style: 13, tempo: 73, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away equal vs 5-4-1: balanced counter breaks their defensive shell. Trust the system." },
  { opponentId: "541", location: "away", strength: "stronger",  recommendedFormation: "5-2-3 A/B (Counter Attack)", formation: "5-2-3", pressure: 33, style: 21, tempo: 60, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away stronger vs 5-4-1: controlled dominance. Counter from a position of strength — don't overcommit." },
  // vs 6-3-1
  { opponentId: "631", location: "away", strength: "weaker",    recommendedFormation: "5-2-3 A/B (Counter Attack)", formation: "5-2-3", pressure: 20, style: 17, tempo: 70, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away weaker vs 6-3-1: exploit transition speed against their rigid 6-man defensive line." },
  { opponentId: "631", location: "away", strength: "equal",     recommendedFormation: "5-2-3 A/B (Counter Attack)", formation: "5-2-3", pressure: 36, style: 24, tempo: 74, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away equal vs 6-3-1: counter system exploits gaps behind their heavy defensive structure." },
  { opponentId: "631", location: "away", strength: "stronger",  recommendedFormation: "4-3-3 A/B (Wing Play)",     formation: "4-3-3", pressure: 60, style: 50, tempo: 70, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "MC MC MC", "MR ST ML"], note: "Away stronger vs 6-3-1: blast through 6 defenders with 4-3-3 wing play. Width is the decisive key." },
  // Extra away equal/weaker scenarios
  { opponentId: "451", location: "away", strength: "equal",     recommendedFormation: "5-2-3 A/B (Counter Attack)", formation: "5-2-3", pressure: 15, style: 3,  tempo: 70, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away equal vs 4-5-1 (alt): 5-2-3 out-shapes their midfield block. Control the counter momentum." },
  { opponentId: "451", location: "away", strength: "weaker",    recommendedFormation: "5-2-3 A/B (Counter Attack)", formation: "5-2-3", pressure: 11, style: 9,  tempo: 69, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away weaker vs 4-5-1 (alt): compact 5-2-3 is your best defensive shield and counter platform." },
  { opponentId: "4231", location: "away", strength: "equal",    recommendedFormation: "5-2-3 A/B (Counter Attack)", formation: "5-2-3", pressure: 15, style: 3,  tempo: 70, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away equal vs 4-2-3-1 (alt): counter their Shoot on Sight with a disciplined 5-back shape." },
  { opponentId: "4231", location: "away", strength: "weaker",   recommendedFormation: "5-2-3 A/B (Counter Attack)", formation: "5-2-3", pressure: 11, style: 9,  tempo: 70, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Away weaker vs 4-2-3-1 SoS (alt): survive their long-shot pressure with an ultra-low 5-back block." },

  // ── HOME SCENARIOS ──
  // vs 5-2-3
  { opponentId: "523", location: "home", strength: "weaker",    recommendedFormation: "5-2-3 A/B (Counter Attack)", formation: "5-2-3", pressure: 26, style: 32, tempo: 70, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Home weaker vs 5-2-3: out-counter their counter — compact shape, fast transitions, use the home atmosphere." },
  { opponentId: "523", location: "home", strength: "equal",     recommendedFormation: "5-2-3 A/B (Counter Attack)", formation: "5-2-3", pressure: 29, style: 29, tempo: 75, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Home equal vs 5-2-3: aggressive counter — use home advantage to press higher and convert transitions." },
  { opponentId: "523", location: "home", strength: "stronger",  recommendedFormation: "4-3-3 A/B (Wing Play)",     formation: "4-3-3", pressure: 55, style: 70, tempo: 65, lineTactics: { forwards: "attack", midfield: "holdPos", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "MC MC MC", "MR ST ML"], note: "Home stronger vs 5-2-3: 95% win rate. Pin them in their half with 4-3-3 wing dominance — full throttle." },
  // vs 5-4-1
  { opponentId: "541", location: "home", strength: "weaker",    recommendedFormation: "5-2-3 A/B (Counter Attack)", formation: "5-2-3", pressure: 29, style: 21, tempo: 65, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Home weaker vs 5-4-1: use the home factor — 5-2-3 counter cracks their defensive block from inside." },
  // vs 4-2-3-1
  { opponentId: "4231", location: "home", strength: "equal",    recommendedFormation: "4-3-3 B (Wing Play)",       formation: "4-3-3", pressure: 65, style: 70, tempo: 75, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "MC MC MC", "MR ST ML"], note: "Home equal vs 4-2-3-1: dominate from the flanks. 4-3-3 B wing play at home is lethal." },
  { opponentId: "4231", location: "home", strength: "stronger", recommendedFormation: "4-3-3 B (Wing Play)",       formation: "4-3-3", pressure: 69, style: 69, tempo: 79, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "MC MC MC", "MR ST ML"], note: "Home stronger vs 4-2-3-1: destroy their Shoot on Sight with relentless wing play. No mercy. Full throttle." },
  { opponentId: "4231", location: "home", strength: "weaker",   recommendedFormation: "5-2-3 A (Counter Attack)",  formation: "5-2-3", pressure: 22, style: 8,  tempo: 68, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Home weaker vs 4-2-3-1 SoS: even at home, respect their long shots. Counter is the safer path." },
  // vs 4-5-1
  { opponentId: "451", location: "home", strength: "weaker",    recommendedFormation: "5-2-3 A (Counter Attack)",  formation: "5-2-3", pressure: 34, style: 12, tempo: 62, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Home weaker vs 4-5-1: use 5-2-3 counter to neutralise their 5-mid wall — precision over power." },
  { opponentId: "451", location: "home", strength: "equal",     recommendedFormation: "5-2-3 A (Counter Attack)",  formation: "5-2-3", pressure: 33, style: 33, tempo: 63, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Home equal vs 4-5-1: home advantage fuels the counter. Break through their wide midfield." },
  { opponentId: "451", location: "home", strength: "stronger",  recommendedFormation: "4-3-3 A/B (Wing Play)",    formation: "4-3-3", pressure: 66, style: 61, tempo: 76, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "MC MC MC", "MR ST ML"], note: "Home stronger vs 4-5-1: punish their Shoot on Sight with explosive 4-3-3 wing play. Own the flanks." },
  // vs 5-4-1 (stronger/equal)
  { opponentId: "541", location: "home", strength: "stronger",  recommendedFormation: "4-3-3 A/B (Wing Play)",    formation: "4-3-3", pressure: 72, style: 70, tempo: 62, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "MC MC MC", "MR ST ML"], note: "Home stronger vs 5-4-1: dominate the flanks and dismantle their 9-man defensive structure." },
  { opponentId: "541", location: "home", strength: "equal",     recommendedFormation: "4-3-3 A/B (Wing Play)",    formation: "4-3-3", pressure: 60, style: 55, tempo: 65, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "MC MC MC", "MR ST ML"], note: "Home equal vs 5-4-1: wing play forces their defensive block wide — exploit the central gaps." },
  // vs 6-3-1
  { opponentId: "631", location: "home", strength: "equal",     recommendedFormation: "4-3-3 A (Wing Play)",      formation: "4-3-3", pressure: 55, style: 65, tempo: 70, lineTactics: { forwards: "attack", midfield: "holdPos", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "MC MC MC", "MR ST ML"], note: "Home equal vs 6-3-1 Bus: high style rating overpowers a fully parked opponent. Be patient and wide." },
  { opponentId: "631", location: "home", strength: "weaker",    recommendedFormation: "5-2-3 A (Counter Attack)",  formation: "5-2-3", pressure: 39, style: 20, tempo: 79, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Home weaker vs 6-3-1: park your own bus and wait for the counter. 5-2-3 is your shield." },
  // vs 5-3-2
  { opponentId: "532", location: "home", strength: "stronger",  recommendedFormation: "4-3-3 A (Wing Play)",      formation: "4-3-3", pressure: 65, style: 60, tempo: 70, lineTactics: { forwards: "attack", midfield: "holdPos", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "MC MC MC", "MR ST ML"], note: "Home stronger vs 5-3-2: stretch their 5-back with wide play. Wings create the decisive chance." },
  { opponentId: "532", location: "home", strength: "equal",     recommendedFormation: "4-3-3 A (Wing Play)",      formation: "4-3-3", pressure: 65, style: 65, tempo: 75, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "MC MC MC", "MR ST ML"], note: "Home equal vs 5-3-2: high tempo + wing play suffocates their compact shape. Force the breakthrough." },
  { opponentId: "532", location: "home", strength: "equal",     recommendedFormation: "4-3-3 A (Wing Play)",      formation: "4-3-3", pressure: 55, style: 60, tempo: 75, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "MC MC MC", "MR ST ML"], note: "Home equal vs 5-3-2 (alt): overwhelm their defensive structure with sustained wing pressure." },
  { opponentId: "532", location: "home", strength: "weaker",    recommendedFormation: "5-2-3 A (Counter Attack)",  formation: "5-2-3", pressure: 26, style: 16, tempo: 70, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Home weaker vs 5-3-2: don't gamble. Absorb their attacks and counter with precision." },
  // vs 5-3-1-1
  { opponentId: "5311", location: "home", strength: "weaker",   recommendedFormation: "5-2-3 A (Counter Attack)",  formation: "5-2-3", pressure: 19, style: 15, tempo: 65, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Home weaker vs 5-3-1-1: their counter vs your counter — patience separates the winner." },
  { opponentId: "5311", location: "home", strength: "equal",    recommendedFormation: "5-2-3 A (Counter Attack)",  formation: "5-2-3", pressure: 32, style: 21, tempo: 65, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Home equal vs 5-3-1-1: 5-2-3 A holds the home ground — steady counter wins the match." },
  { opponentId: "5311", location: "home", strength: "stronger", recommendedFormation: "4-3-3 A/B (Wing Play)",    formation: "4-3-3", pressure: 75, style: 60, tempo: 60, lineTactics: { forwards: "attack", midfield: "holdPos", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "MC MC MC", "MR ST ML"], note: "Home stronger vs 5-3-1-1: unload with 4-3-3 wing play. Punish their defensive parking with width." },
  // vs 6-3-1 equal (alt)
  { opponentId: "631", location: "home", strength: "equal",     recommendedFormation: "4-3-3 A (Wing Play)",      formation: "4-3-3", pressure: 50, style: 60, tempo: 75, lineTactics: { forwards: "attack", midfield: "holdPos", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "MC MC MC", "MR ST ML"], note: "Home equal vs 6-3-1 Bus (alt): sustained high style breaks the bus. Trust the wide overloads." },
  { opponentId: "631", location: "home", strength: "equal",     recommendedFormation: "4-3-3 A (Wing Play)",      formation: "4-3-3", pressure: 50, style: 70, tempo: 75, lineTactics: { forwards: "attack", midfield: "holdPos", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "MC MC MC", "MR ST ML"], note: "Home equal vs 6-3-1 Bus (B): max style dismantles their defensive parking. Win the flanks first." },
  // vs 4-4-2
  { opponentId: "442", location: "home", strength: "weaker",    recommendedFormation: "5-2-3 A/B (Counter Attack)", formation: "5-2-3", pressure: 22, style: 21, tempo: 72, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Home weaker vs 4-4-2: even at home, counter is safer against their passing game. Compact shape wins." },
  { opponentId: "442", location: "home", strength: "stronger",  recommendedFormation: "4-3-3 A/B (Wing Play)",    formation: "4-3-3", pressure: 66, style: 60, tempo: 76, lineTactics: { forwards: "attack", midfield: "holdPos", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "MC MC MC", "MR ST ML"], note: "Home stronger vs 4-4-2: their passing game is vulnerable on the wings. Exploit that weakness ruthlessly." },
  { opponentId: "442", location: "home", strength: "equal",     recommendedFormation: "4-3-3 A/B (Wing Play)",    formation: "4-3-3", pressure: 55, style: 60, tempo: 60, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "MC MC MC", "MR ST ML"], note: "Home equal vs 4-4-2: 4-3-3 A/B outpaces their passing game — win the midfield transition battle." },
  // vs 4-3-3 A/B (home)
  { opponentId: "433A", location: "home", strength: "equal",    recommendedFormation: "4-3-3 A (Wing Play)",      formation: "4-3-3", pressure: 52, style: 60, tempo: 60, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "MC MC MC", "MR ST ML"], note: "Home equal vs 4-3-3 A: mirror the formation and dominate with superior wing mechanics and tempo." },
  { opponentId: "433A", location: "home", strength: "weaker",   recommendedFormation: "5-2-3 (Counter Attack)",   formation: "5-2-3", pressure: 22, style: 32, tempo: 72, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Home weaker vs 4-3-3 A: use 5-2-3 counter to negate their wing threat and absorb pressure." },
  { opponentId: "433A", location: "home", strength: "stronger", recommendedFormation: "4-3-3 A/B (Wing Play)",   formation: "4-3-3", pressure: 65, style: 70, tempo: 75, lineTactics: { forwards: "attack", midfield: "holdPos", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "MC MC MC", "MR ST ML"], note: "Home stronger vs 4-3-3 A: overwhelm with wing dominance — press high and punish their structure." },
  { opponentId: "433B", location: "home", strength: "equal",    recommendedFormation: "4-3-3 A (Wing Play)",      formation: "4-3-3", pressure: 52, style: 60, tempo: 60, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DL", "MC MC MC", "MR ST ML"], note: "Home equal vs 4-3-3 B: outflank their wing play with superior tactical execution and tempo." },
  { opponentId: "433B", location: "home", strength: "weaker",   recommendedFormation: "5-2-3 (Counter Attack)",   formation: "5-2-3", pressure: 22, style: 32, tempo: 72, lineTactics: { forwards: "attack", midfield: "defHelp", defence: "stayBack", offsides: false, marking: "area" }, lineup: ["GK", "DR DC DC DC DL", "MC MC", "MR ST ML"], note: "Home weaker vs 4-3-3 B: 5-2-3 counter disrupts their 4-3-3 shape — even at home as underdogs." },
];

export const siteMeta = {
  owner: "omerovvvvv",
  crew: "SOA Crew (Former World No. 1)",
  legacy: "From 2009 to 2026... I've seen it all.",
  location: "United Kingdom",
  social: {
    facebook: "https://www.facebook.com/omercarla",
    instagram: "https://www.instagram.com/carlaomer/",
    youtube: "https://www.youtube.com/@OSMNextLevel",
  },
  motto: "THE BEST OR NOTHING!",
  disclaimer: "No single tactic wins every match in this game — no unbeatable setup exists. The engine updates constantly, and all tactics here are tested 2026 strategies from top-tier tournament play.",
};
