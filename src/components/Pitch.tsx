import { motion, AnimatePresence } from "framer-motion";
import type { LineTactic } from "../data/tactics";

interface PitchProps {
  lineup: string[];
  lineTactics?: LineTactic;
  formation?: string;
  pressure?: number;
  style?: number;
  tempo?: number;
}

function buildPlayers(lineup: string[]) {
  const rows = lineup.length;
  return lineup.flatMap((row, rowIndex) => {
    const positions = row.split(/\s+/).filter(Boolean);
    const count = positions.length;
    // rowIndex 0 = attack end (top), last = GK (bottom)
    const yPct = rows === 1 ? 88 : 10 + (80 * rowIndex) / (rows - 1);
    return positions.map((pos, colIndex) => ({
      pos,
      x: count === 1 ? 50 : 10 + (80 * colIndex) / (count - 1),
      y: yPct,
    }));
  });
}

function nodeStyle(pos: string): { border: string; glow: string } {
  const p = pos.toUpperCase();
  if (p === "GK")
    return { border: "#60a5fa", glow: "0 0 0 1px rgba(96,165,250,0.25),0 0 12px rgba(96,165,250,0.6)" };
  if (["LB", "RB", "CB"].includes(p))
    return { border: "#4ade80", glow: "0 0 0 1px rgba(74,222,128,0.25),0 0 12px rgba(74,222,128,0.55)" };
  if (["CAM", "CDM", "CM", "LM", "RM"].includes(p))
    return { border: "#fbbf24", glow: "0 0 0 1px rgba(251,191,36,0.25),0 0 12px rgba(251,191,36,0.55)" };
  if (["ST", "LW", "RW", "CF"].includes(p))
    return { border: "#f87171", glow: "0 0 0 1px rgba(248,113,113,0.25),0 0 12px rgba(248,113,113,0.6)" };
  return { border: "#94a3b8", glow: "0 0 8px rgba(148,163,184,0.4)" };
}

function shortTactic(value: string): string {
  if (value === "attack") return "ATK";
  if (value === "holdPos") return "HLD";
  if (value === "defHelp") return "HLP";
  if (value === "stayBack") return "BCK";
  return value.slice(0, 3).toUpperCase();
}

// ── Formation animation classification ────────────────────────────────────────
type FormationClass = "attacking" | "balanced" | "defensive";

const FORMATION_MAP: Record<string, FormationClass> = {
  // Attacking — wing play, 3 forwards, high-line press
  "3-4-3": "attacking", "4-3-3": "attacking", "4-2-3-1": "attacking",
  "3-5-2": "attacking", "4-1-2-3": "attacking", "4-3-2-1": "attacking",
  // Balanced — counter-attack, possession, 2-striker variants
  "4-4-2": "balanced",  "4-5-1": "balanced",   "5-2-3": "balanced",
  "5-3-2": "balanced",  "5-3-1-1": "balanced",  "4-1-4-1": "balanced",
  "4-4-1-1": "balanced", "4-2-4": "balanced",
  // Defensive — park the bus, 5/6 at back
  "5-4-1": "defensive", "6-3-1": "defensive",  "5-5": "defensive",
  "6-4": "defensive",   "6-3": "defensive",    "5-4": "defensive",
};

function classifyFormation(formation: string, style: number): FormationClass {
  const base = formation.split(/[\s(]/)[0];
  if (FORMATION_MAP[base]) return FORMATION_MAP[base];
  // Style-value fallback: high style = attacking, very low = defensive
  if (style >= 52) return "attacking";
  if (style <= 18) return "defensive";
  return "balanced";
}

export default function Pitch({ lineup, lineTactics, formation, pressure = 50, style = 50, tempo = 50 }: PitchProps) {
  const players = buildPlayers(lineup);
  const formClass = classifyFormation(formation ?? "", style);

  return (
    <div
      className="relative w-full overflow-hidden rounded-[1.35rem]"
      style={{
        aspectRatio: "3/4",
        boxShadow:
          "0 0 0 1px rgba(0,255,180,0.35), 0 0 32px rgba(0,255,180,0.08), 0 8px 32px rgba(0,0,0,0.55)",
      }}
    >
      {/* Grass base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg,#0a4a18 0%,#0f6127 18%,#126e2c 36%,#0f6127 54%,#0a5520 72%,#083d16 100%)",
        }}
      />

      {/* Lawn stripe pattern */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg,rgba(255,255,255,0.07) 0px,rgba(255,255,255,0.07) 14px,transparent 14px,transparent 28px)",
        }}
      />

      {/* Depth vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 30%, rgba(0,255,140,0.05) 0%, transparent 70%), linear-gradient(180deg,rgba(0,0,0,0.22) 0%,transparent 30%,transparent 70%,rgba(0,0,0,0.28) 100%)",
        }}
      />

      {/* Field markings */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 133"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="neon-line" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer boundary — neon cyan */}
        <rect
          x="2" y="2" width="96" height="129" rx="1.5"
          fill="none"
          stroke="rgba(0,255,200,0.9)"
          strokeWidth="0.7"
          filter="url(#neon-line)"
        />
        {/* Outer boundary secondary glow */}
        <rect
          x="2" y="2" width="96" height="129" rx="1.5"
          fill="none"
          stroke="rgba(0,255,200,0.25)"
          strokeWidth="2.2"
        />

        {/* Halfway line */}
        <line x1="2" y1="66.5" x2="98" y2="66.5" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" />

        {/* Center circle */}
        <circle cx="50" cy="66.5" r="11" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.42" />
        <circle cx="50" cy="66.5" r="0.9" fill="rgba(255,255,255,0.85)" />

        {/* Attack penalty area (top) */}
        <rect x="26" y="2" width="48" height="18" fill="rgba(0,255,180,0.03)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" />
        {/* Attack goal area */}
        <rect x="36" y="2" width="28" height="7.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.35" />
        {/* Attack penalty spot */}
        <circle cx="50" cy="16" r="0.75" fill="rgba(255,255,255,0.75)" />
        {/* Attack penalty arc */}
        <path d="M 37 20 Q 50 27 63 20" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="0.38" />

        {/* Defense penalty area (bottom) */}
        <rect x="26" y="113" width="48" height="18" fill="rgba(0,255,180,0.03)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" />
        {/* Defense goal area */}
        <rect x="36" y="123.5" width="28" height="7.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.35" />
        {/* Defense penalty spot */}
        <circle cx="50" cy="117" r="0.75" fill="rgba(255,255,255,0.75)" />
        {/* Defense penalty arc */}
        <path d="M 37 113 Q 50 106 63 113" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="0.38" />

        {/* Neon corner dots */}
        <circle cx="2" cy="2" r="1.6" fill="rgba(0,255,200,0.8)" />
        <circle cx="98" cy="2" r="1.6" fill="rgba(0,255,200,0.8)" />
        <circle cx="2" cy="131" r="1.6" fill="rgba(0,255,200,0.8)" />
        <circle cx="98" cy="131" r="1.6" fill="rgba(0,255,200,0.8)" />
      </svg>

      {/* Player nodes */}
      <div className="absolute inset-0">
        {players.map((player, index) => {
          const ns = nodeStyle(player.pos);
          return (
            <motion.div
              key={index}
              layout
              animate={{ left: `${player.x}%`, top: `${player.y}%` }}
              initial={{ opacity: 0, scale: 0.4 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false }}
              transition={{
                layout: { type: "spring", stiffness: 320, damping: 26 },
                opacity: { duration: 0.28, delay: index * 0.022 },
                scale: { type: "spring", stiffness: 400, damping: 22, delay: index * 0.022 },
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl border text-[0.5rem] font-black text-white"
                style={{
                  borderColor: ns.border,
                  boxShadow: ns.glow,
                  background: "rgba(4,6,18,0.88)",
                  backdropFilter: "blur(6px)",
                  letterSpacing: "0.03em",
                }}
              >
                {player.pos}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Formation animation overlay */}
      <AnimatePresence mode="wait">
        {formClass === "attacking" && <NeonFlowOverlay key="atk" />}
        {formClass === "balanced"  && <PulseOverlay    key="bal" />}
        {formClass === "defensive" && <ShieldOverlay   key="def" />}
      </AnimatePresence>

      {/* Stats row — top left */}
      <div className="absolute left-2 top-2 flex gap-1 text-[8px] font-black">
        <StatBadge label="P" value={pressure} color="#f87171" />
        <StatBadge label="S" value={style} color="#fbbf24" />
        <StatBadge label="T" value={tempo} color="#60a5fa" />
      </div>

      {/* Line tactics — bottom */}
      {lineTactics && (
        <div className="absolute bottom-1.5 left-1.5 right-1.5 grid grid-cols-5 gap-0.5 text-[7px] font-black">
          <TacticChip label="FWD" value={shortTactic(lineTactics.forwards)} />
          <TacticChip label="MID" value={shortTactic(lineTactics.midfield)} />
          <TacticChip label="DEF" value={shortTactic(lineTactics.defence)} />
          <TacticChip label="OFF" value={lineTactics.offsides ? "ON" : "OFF"} />
          <TacticChip label="MRK" value={lineTactics.marking === "area" ? "ZN" : "MN"} />
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="rounded border border-white/12 px-1.5 py-0.5 text-center"
      style={{ background: "rgba(0,0,0,0.6)", color }}
    >
      {label}:{value}
    </div>
  );
}

function TacticChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded px-1 py-0.5 text-center"
      style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="text-[5.5px] text-stone-500">{label}</div>
      <div className="text-white/85">{value}</div>
    </div>
  );
}

// ── NEON FLOW — attacking formations ──────────────────────────────────────────
const FLOW_PARTICLES = [
  { x: 18, delay: 0,    dur: 2.2, size: 2.5, color: "#22d3ee" },
  { x: 32, delay: 0.45, dur: 1.9, size: 2,   color: "#60a5fa" },
  { x: 50, delay: 0.9,  dur: 2.5, size: 3,   color: "#67e8f9" },
  { x: 65, delay: 0.2,  dur: 2.0, size: 2,   color: "#22d3ee" },
  { x: 78, delay: 0.7,  dur: 2.3, size: 2.5, color: "#93c5fd" },
  { x: 42, delay: 1.1,  dur: 1.8, size: 2,   color: "#60a5fa" },
  { x: 58, delay: 1.5,  dur: 2.1, size: 2,   color: "#67e8f9" },
  { x: 25, delay: 1.8,  dur: 2.4, size: 2,   color: "#93c5fd" },
] as const;

function NeonFlowOverlay() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      {FLOW_PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}, 0 0 ${p.size * 7}px ${p.color}80`,
          }}
          animate={{ top: ["8%", "90%"], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.08, 0.88, 1],
          }}
        />
      ))}
      {/* Attack-end ambient glow */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
        animate={{ opacity: [0.06, 0.22, 0.06] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "linear-gradient(to top, rgba(34,211,238,0.35), transparent)" }}
      />
    </motion.div>
  );
}

// ── PULSE — balanced / counter-attack formations ───────────────────────────────
const PULSE_RINGS = [
  { delay: 0,   dur: 2.8 },
  { delay: 0.9, dur: 2.8 },
  { delay: 1.8, dur: 2.8 },
] as const;

function PulseOverlay() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      {PULSE_RINGS.map((r, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: "52%",
            height: "34%",
            border: "1.5px solid rgba(251,191,36,0.65)",
            boxShadow: "0 0 10px rgba(251,191,36,0.25)",
          }}
          animate={{ scale: [0.2, 1.7], opacity: [0.75, 0] }}
          transition={{ duration: r.dur, delay: r.delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
      {/* Center pulse dot */}
      <motion.div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#fbbf24",
          boxShadow: "0 0 8px #fbbf24, 0 0 18px rgba(251,191,36,0.5)",
        }}
        animate={{ opacity: [0.55, 1, 0.55], scale: [0.85, 1.25, 0.85] }}
        transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

// ── STATIC SHIELD — defensive formations ──────────────────────────────────────
const SHIELD_DOTS = [[8, 5], [92, 5], [8, 24], [92, 24]] as [number, number][];

function ShieldOverlay() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      {/* GK-end defensive gradient */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[28%]"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "linear-gradient(to bottom, rgba(74,222,128,0.18), transparent)" }}
      />
      {/* Horizontal shield barrier */}
      <motion.div
        className="absolute inset-x-0"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          top: "26%",
          height: 1.5,
          background: "rgba(74,222,128,0.8)",
          boxShadow: "0 0 10px rgba(74,222,128,0.7), 0 0 28px rgba(74,222,128,0.3)",
        }}
      />
      {/* Corner sentinel dots */}
      {SHIELD_DOTS.map(([x, y], i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 4,
            height: 4,
            left: `${x}%`,
            top: `${y}%`,
            background: "#4ade80",
            boxShadow: "0 0 8px #4ade80, 0 0 18px rgba(74,222,128,0.5)",
          }}
          animate={{ opacity: [0.35, 1, 0.35], scale: [0.75, 1.35, 0.75] }}
          transition={{ duration: 1.8, delay: i * 0.28, repeat: Infinity }}
        />
      ))}
    </motion.div>
  );
}
