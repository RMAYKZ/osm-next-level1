import React, { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type ArrowColor = "red" | "blue" | "gold" | "orange";

interface ArrowDef {
  d: string;
  color: ArrowColor;
  sw: number;
  arrowEnd?: boolean;
  delay?: number;
}

interface BallDef { cx: number; cy: number; }

interface GamePlanOption {
  id: string;
  label: string;
  arrows: ArrowDef[];
  balls?: BallDef[];
}

interface LineTacticOption {
  id: string;
  label: string;
  arrows: ArrowDef[];
}

interface LineTacticRow {
  label: string;
  color: string;
  options: LineTacticOption[];
}

// ─────────────────────────────────────────────────────────────────────────────
// PALETTE
// ─────────────────────────────────────────────────────────────────────────────

const CLR: Record<ArrowColor, string> = {
  red:    "#ff4040",
  blue:   "#4488ff",
  gold:   "#fbbf24",
  orange: "#fb923c",
};

const CYAN   = "#4fc3f7";

// ─────────────────────────────────────────────────────────────────────────────
// GAME PLAN DATA
// ─────────────────────────────────────────────────────────────────────────────

const GAME_PLANS: GamePlanOption[] = [
  {
    id: "long_ball", label: "Long Ball",
    arrows: [
      { d: "M 65 145 Q 200 12 335 122", color: "red", sw: 6, arrowEnd: true },
    ],
  },
  {
    id: "passing_game", label: "Passing Game",
    arrows: [
      { d: "M 55 118 C 90 62,115 172,162 110 C 202 52,242 168,286 104 C 312 74,336 104,362 100", color: "red", sw: 5, arrowEnd: true },
    ],
  },
  {
    id: "wing_play", label: "Wing Play",
    arrows: [
      { d: "M 70 48 L 334 48",   color: "red", sw: 5, arrowEnd: true, delay: 0 },
      { d: "M 70 172 L 334 172", color: "red", sw: 5, arrowEnd: true, delay: 0.12 },
    ],
  },
  {
    id: "counter_attack", label: "Counter-Attack",
    arrows: [
      { d: "M 95 118 Q 148 52 202 118",  color: "red",  sw: 5, arrowEnd: true, delay: 0 },
      { d: "M 198 118 Q 252 52 306 118", color: "red",  sw: 5, arrowEnd: true, delay: 0.1 },
      { d: "M 298 134 Q 236 184 174 136",color: "blue", sw: 5, arrowEnd: true, delay: 0.22 },
      { d: "M 188 148 Q 126 196 78 154", color: "blue", sw: 5, arrowEnd: true, delay: 0.32 },
    ],
  },
  {
    id: "shoot_on_sight", label: "Shoot on Sight",
    arrows: [
      { d: "M 118 80 L 234 80",  color: "red", sw: 5, arrowEnd: true, delay: 0 },
      { d: "M 122 112 L 238 112",color: "red", sw: 5, arrowEnd: true, delay: 0.08 },
      { d: "M 115 144 L 230 144",color: "red", sw: 5, arrowEnd: true, delay: 0.16 },
    ],
    balls: [
      { cx: 252, cy: 78 }, { cx: 268, cy: 95 }, { cx: 255, cy: 115 },
      { cx: 248, cy: 142 }, { cx: 270, cy: 128 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// LINE TACTICS DATA
// ─────────────────────────────────────────────────────────────────────────────

const LINE_TACTIC_ROWS: LineTacticRow[] = [
  {
    label: "Forwards", color: CYAN,
    options: [
      { id: "fwd-support", label: "Support Midfield",
        arrows: [{ d: "M 50 26 L 50 41", color: "blue", sw: 3.2, arrowEnd: true }] },
      { id: "fwd-hold", label: "Stay in Position", arrows: [] },
      { id: "fwd-attack", label: "Attack Only",
        arrows: [{ d: "M 50 40 L 50 24", color: "red", sw: 3.2, arrowEnd: true }] },
    ],
  },
  {
    label: "Midfielders", color: "#fbbf24",
    options: [
      { id: "mid-protect", label: "Protect Defence",
        arrows: [
          { d: "M 33 60 Q 50 74 67 60", color: "blue", sw: 2.5, arrowEnd: true },
          { d: "M 29 67 Q 50 84 71 67", color: "blue", sw: 2.5, arrowEnd: true, delay: 0.1 },
        ] },
      { id: "mid-stay", label: "Stay in Position",
        arrows: [
          { d: "M 46 64 L 20 64", color: "gold", sw: 2.5, arrowEnd: true },
          { d: "M 54 64 L 80 64", color: "gold", sw: 2.5, arrowEnd: true, delay: 0.08 },
        ] },
      { id: "mid-attack", label: "Join the Attack",
        arrows: [
          { d: "M 30 72 L 30 56", color: "red", sw: 2.8, arrowEnd: true },
          { d: "M 50 72 L 50 56", color: "red", sw: 2.8, arrowEnd: true, delay: 0.08 },
          { d: "M 70 72 L 70 56", color: "red", sw: 2.8, arrowEnd: true, delay: 0.16 },
        ] },
    ],
  },
  {
    label: "Defenders", color: "#fb923c",
    options: [
      { id: "def-deep", label: "Defend Deep",
        arrows: [
          { d: "M 50 116 L 50 100", color: "orange", sw: 3.5, arrowEnd: true },
          { d: "M 39 114 L 26 114", color: "orange", sw: 2,   arrowEnd: true, delay: 0.1 },
          { d: "M 61 114 L 74 114", color: "orange", sw: 2,   arrowEnd: true, delay: 0.15 },
        ] },
      { id: "def-stay", label: "Stay in Position",
        arrows: [
          { d: "M 46 108 L 24 108", color: "orange", sw: 2.5, arrowEnd: true },
          { d: "M 54 108 L 76 108", color: "orange", sw: 2.5, arrowEnd: true, delay: 0.08 },
          { d: "M 50 112 L 50 100", color: "orange", sw: 2,   arrowEnd: true, delay: 0.15 },
        ] },
      { id: "def-wings", label: "Attacking Full-Backs",
        arrows: [
          { d: "M 20 120 L 20 98", color: "red", sw: 3.5, arrowEnd: true },
          { d: "M 80 120 L 80 98", color: "red", sw: 3.5, arrowEnd: true, delay: 0.1 },
        ] },
    ],
  },
];

const TACKLING_OPTIONS = ["Normal", "Aggressive", "Lenient", "Hard"];

// ─────────────────────────────────────────────────────────────────────────────
// STYLE CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const GLASS: React.CSSProperties = {
  background: `rgba(10, 25, 47, 0.82)`,
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(79, 195, 247, 0.1)",
  borderRadius: 14,
};

const FIELD_LINE = "rgba(0, 230, 180, 0.55)";
const FL_GLOW: React.CSSProperties = {
  filter: "drop-shadow(0 0 2px rgba(0, 230, 180, 0.55))",
};

// ─────────────────────────────────────────────────────────────────────────────
// SVG PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function PitchDefs({ pfx }: { pfx: string }) {
  return (
    <defs>
      <radialGradient id={`${pfx}-rg`} cx="50%" cy="50%" r="70%">
        <stop offset="0%"   stopColor="#0d2110" />
        <stop offset="100%" stopColor="#040d06" />
      </radialGradient>
      <pattern id={`${pfx}-st`} x="0" y="0" width="100%" height="22" patternUnits="userSpaceOnUse">
        <rect width="100%" height="11" fill="rgba(255,255,255,0.014)" />
      </pattern>
      {(["red", "blue", "gold", "orange"] as ArrowColor[]).map(c => (
        <marker key={c} id={`${pfx}-${c}`}
          markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
          <polygon points="0 0, 7 3.5, 0 7" fill={CLR[c]} />
        </marker>
      ))}
    </defs>
  );
}

function AnimArrow({ a, pfx, baseDur = 0.55 }: { a: ArrowDef; pfx: string; baseDur?: number }) {
  const sc = CLR[a.color];
  const ga =
    a.color === "red"    ? "rgba(255,64,64,0.65)"   :
    a.color === "blue"   ? "rgba(68,136,255,0.65)"  :
    a.color === "gold"   ? "rgba(251,191,36,0.65)"  :
                           "rgba(251,146,60,0.65)";
  const ga2 = ga.replace("0.65", "0.28");
  return (
    <motion.path
      d={a.d}
      stroke={sc}
      strokeWidth={a.sw}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      markerEnd={a.arrowEnd ? `url(#${pfx}-${a.color})` : undefined}
      style={{ filter: `drop-shadow(0 0 4px ${ga}) drop-shadow(0 0 10px ${ga2})` }}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { duration: baseDur, delay: a.delay ?? 0, ease: "easeOut" },
        opacity:    { duration: 0.06,    delay: a.delay ?? 0 },
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PITCHES
// ─────────────────────────────────────────────────────────────────────────────

function HorizontalPitch({ plan }: { plan: GamePlanOption }) {
  const pfx = "hp";
  const LW = 0.72;
  return (
    <svg viewBox="0 0 400 220" width="100%" height="100%"
      style={{ display: "block", borderRadius: 10, overflow: "hidden" }}>
      <PitchDefs pfx={pfx} />
      <rect width="400" height="220" fill={`url(#${pfx}-rg)`} />
      <rect width="400" height="220" fill={`url(#${pfx}-st)`} />
      <g style={FL_GLOW}>
        <rect x="8" y="8" width="384" height="204" rx="4" fill="none" stroke={FIELD_LINE} strokeWidth={LW} />
        <line x1="200" y1="8" x2="200" y2="212" stroke={FIELD_LINE} strokeWidth={LW} />
        <circle cx="200" cy="110" r="38" fill="none" stroke={FIELD_LINE} strokeWidth={LW} />
        <circle cx="200" cy="110" r="3" fill={FIELD_LINE} />
        <rect x="8"   y="52" width="72" height="116" fill="none" stroke={FIELD_LINE} strokeWidth={LW * 0.8} />
        <rect x="8"   y="76" width="28" height="68"  fill="none" stroke={FIELD_LINE} strokeWidth={LW * 0.8} />
        <circle cx="58"  cy="110" r="2" fill={FIELD_LINE} />
        <rect x="320" y="52" width="72" height="116" fill="none" stroke={FIELD_LINE} strokeWidth={LW * 0.8} />
        <rect x="364" y="76" width="28" height="68"  fill="none" stroke={FIELD_LINE} strokeWidth={LW * 0.8} />
        <circle cx="342" cy="110" r="2" fill={FIELD_LINE} />
        {[{x:8,y:8},{x:392,y:8},{x:8,y:212},{x:392,y:212}].map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2" fill={FIELD_LINE} />
        ))}
      </g>
      <AnimatePresence mode="wait">
        <motion.g key={plan.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
        >
          {plan.arrows.map((a, i) => <AnimArrow key={i} a={a} pfx={pfx} />)}
          {plan.balls?.map((b, i) => (
            <motion.g key={`b${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.06, duration: 0.2, ease: "backOut" }}
              style={{ transformOrigin: `${b.cx}px ${b.cy}px` }}
            >
              <circle cx={b.cx} cy={b.cy} r="7" fill="white" stroke="#444" strokeWidth="0.8" />
              <circle cx={b.cx} cy={b.cy} r="2.5" fill="#333" />
            </motion.g>
          ))}
        </motion.g>
      </AnimatePresence>
    </svg>
  );
}

function VerticalPitch({ arrows, pitchKey }: { arrows: ArrowDef[]; pitchKey: string }) {
  const pfx = "vp";
  const LW = 0.6;
  return (
    <svg viewBox="0 0 100 133" width="100%" height="100%"
      style={{ display: "block", borderRadius: 10, overflow: "hidden" }}>
      <PitchDefs pfx={pfx} />
      <rect width="100" height="133" fill={`url(#${pfx}-rg)`} />
      <rect width="100" height="133" fill={`url(#${pfx}-st)`} />
      <g style={FL_GLOW}>
        <rect x="2" y="2" width="96" height="129" rx="1.5" fill="none" stroke={FIELD_LINE} strokeWidth={LW} />
        <line x1="2" y1="66.5" x2="98" y2="66.5" stroke={FIELD_LINE} strokeWidth={LW * 0.8} />
        <circle cx="50" cy="66.5" r="11" fill="none" stroke={FIELD_LINE} strokeWidth={LW * 0.7} />
        <circle cx="50" cy="66.5" r="0.9" fill={FIELD_LINE} />
        <rect x="31" y="2"     width="38" height="7.5" fill="rgba(0,230,180,0.04)" stroke={FIELD_LINE} strokeWidth={LW * 0.85} />
        <rect x="25" y="2"     width="50" height="18"  fill="none" stroke={FIELD_LINE} strokeWidth={LW * 0.75} />
        <circle cx="50" cy="16"  r="0.7" fill={FIELD_LINE} />
        <rect x="31" y="123.5" width="38" height="7.5" fill="rgba(0,230,180,0.04)" stroke={FIELD_LINE} strokeWidth={LW * 0.85} />
        <rect x="25" y="113"   width="50" height="18"  fill="none" stroke={FIELD_LINE} strokeWidth={LW * 0.75} />
        <circle cx="50" cy="117" r="0.7" fill={FIELD_LINE} />
      </g>
      <AnimatePresence mode="wait">
        <motion.g key={pitchKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
        >
          {arrows.map((a, i) => <AnimArrow key={i} a={a} pfx={pfx} baseDur={0.42} />)}
        </motion.g>
      </AnimatePresence>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function HelpBubble() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 16, height: 16, borderRadius: "50%",
      background: "linear-gradient(135deg, rgba(79,195,247,0.25), rgba(79,195,247,0.08))",
      border: "1px solid rgba(79,195,247,0.3)",
      color: CYAN, fontSize: 9, fontWeight: 900, flexShrink: 0, cursor: "default",
    }}>?</span>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
      <span style={{ color: CYAN, fontWeight: 900, fontSize: 11, letterSpacing: "0.12em" }}>{text}</span>
      <HelpBubble />
    </div>
  );
}

function TacticChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        background: active
          ? "linear-gradient(135deg, rgba(79,195,247,0.22), rgba(79,195,247,0.08))"
          : "rgba(10,25,47,0.5)",
        borderColor: active ? "rgba(79,195,247,0.55)" : "rgba(79,195,247,0.1)",
        color: active ? CYAN : "rgba(255,255,255,0.4)",
        boxShadow: active ? "0 0 14px rgba(79,195,247,0.28)" : "none",
      }}
      transition={{ duration: 0.18 }}
      style={{
        border: "1px solid", borderRadius: 7, padding: "5px 10px",
        cursor: "pointer", fontSize: 10, fontWeight: 700,
        letterSpacing: "0.05em", backdropFilter: "blur(8px)",
        whiteSpace: "nowrap" as const,
      }}
    >{label}</motion.button>
  );
}

function LineTacticCard({ label, active, color, onClick }: {
  label: string; active: boolean; color: string; onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      layout
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      animate={{
        background: active ? "rgba(10,25,47,0.95)" : "rgba(6,15,30,0.6)",
        borderColor: active ? color : "rgba(255,255,255,0.07)",
        boxShadow: active ? `0 0 18px ${color}44, inset 0 0 10px ${color}0a` : "none",
      }}
      transition={{ duration: 0.22 }}
      style={{
        ...GLASS,
        padding: "9px 10px", cursor: "pointer",
        textAlign: "left" as const, width: "100%",
        position: "relative", overflow: "hidden",
        border: "1px solid",
      }}
    >
      {/* Active left-edge glow strip */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="strip"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute", top: 0, left: 0,
              width: 3, height: "100%",
              background: `linear-gradient(180deg, ${color}, transparent)`,
              borderRadius: "14px 0 0 14px",
              transformOrigin: "top",
            }}
          />
        )}
      </AnimatePresence>

      {/* Hover pulse ring */}
      <motion.div
        style={{
          position: "absolute", inset: 0, borderRadius: 13,
          border: `1px solid ${color}`, opacity: 0, pointerEvents: "none",
        }}
        whileHover={{ opacity: 0.3, scale: 1.025 }}
        transition={{ duration: 0.18 }}
      />

      <span style={{
        color: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
        fontSize: 11, fontWeight: active ? 700 : 500,
        letterSpacing: "0.01em", lineHeight: 1.3,
        display: "block", paddingLeft: active ? 8 : 4,
        transition: "all 0.2s",
      }}>{label}</span>
    </motion.button>
  );
}

function TacticRow({ row, activeIdx, onChange }: {
  row: LineTacticRow; activeIdx: number; onChange: (i: number) => void;
}) {
  return (
    <div>
      <div style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{
          width: 7, height: 7, borderRadius: 2,
          background: row.color, boxShadow: `0 0 6px ${row.color}`,
        }} />
        <span style={{
          color: row.color, fontWeight: 900, fontSize: 10,
          letterSpacing: "0.12em", textTransform: "uppercase" as const,
        }}>{row.label}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
        {row.options.map((opt, i) => (
          <LineTacticCard
            key={opt.id} label={opt.label}
            active={i === activeIdx} color={row.color}
            onClick={() => onChange(i)}
          />
        ))}
      </div>
    </div>
  );
}

function CoachFace() {
  return (
    <svg viewBox="0 0 120 148" width="86" height="106">
      <path d="M18 120 Q60 110 102 120 L120 148 L0 148 Z" fill="#e8d44d" />
      <path d="M48 120 L60 136 L72 120" fill="#071628" />
      <ellipse cx="60" cy="66" rx="44" ry="52" fill="#f4a46a" />
      <ellipse cx="60" cy="20" rx="43" ry="20" fill="#2e1f14" />
      <rect x="17" y="20" width="86" height="16" fill="#2e1f14" />
      <rect x="26" y="43" width="22" height="5" rx="2" fill="#2e1f14" transform="rotate(-9 37 45)" />
      <rect x="72" y="43" width="22" height="5" rx="2" fill="#2e1f14" transform="rotate(9 83 45)" />
      <ellipse cx="40" cy="58" rx="9" ry="8" fill="white" />
      <ellipse cx="80" cy="58" rx="9" ry="8" fill="white" />
      <circle cx="41" cy="58" r="5" fill="#3a1f0a" />
      <circle cx="81" cy="58" r="5" fill="#3a1f0a" />
      <circle cx="42" cy="56" r="1.5" fill="white" />
      <circle cx="82" cy="56" r="1.5" fill="white" />
      <path d="M56 72 Q60 80 64 72" stroke="#d07040" strokeWidth="2" fill="none" />
      <circle cx="55" cy="76" r="3" fill="#d87050" />
      <circle cx="65" cy="76" r="3" fill="#d87050" />
      <path d="M40 90 Q60 104 80 90" stroke="#b05828" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="16"  cy="66" rx="6" ry="9" fill="#f4a46a" />
      <ellipse cx="104" cy="66" rx="6" ry="9" fill="#f4a46a" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function TacticDashboard() {
  const [gpIdx,   setGpIdx]   = useState(0);
  const [tackIdx, setTackIdx] = useState(2);
  const [lineIdx, setLineIdx] = useState([0, 0, 0]);

  const plan      = GAME_PLANS[gpIdx];
  const pitchKey  = lineIdx.join("-");
  const pitchArrows: ArrowDef[] = [
    ...LINE_TACTIC_ROWS[0].options[lineIdx[0]].arrows,
    ...LINE_TACTIC_ROWS[1].options[lineIdx[1]].arrows,
    ...LINE_TACTIC_ROWS[2].options[lineIdx[2]].arrows,
  ];

  const setLine = (row: number, i: number) =>
    setLineIdx(prev => { const n = [...prev]; n[row] = i; return n; });

  return (
    <LayoutGroup>
      <section style={{
        background: "#071628",
        padding: "20px 14px 44px",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}>

        {/* ── GAME PLAN + TACKLING ───────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>

          {/* GAME PLAN */}
          <motion.div layout style={{ ...GLASS, flex: 1, padding: 14, display: "flex", flexDirection: "column" }}>
            <SectionLabel text="GAME PLAN" />

            {/* Tactic chips */}
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5, marginBottom: 10 }}>
              {GAME_PLANS.map((gp, i) => (
                <TacticChip key={gp.id} label={gp.label} active={i === gpIdx} onClick={() => setGpIdx(i)} />
              ))}
            </div>

            {/* Active label */}
            <AnimatePresence mode="wait">
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.18 }}
                style={{ color: "white", fontWeight: 800, fontSize: 18, marginBottom: 8, letterSpacing: "-0.01em" }}
              >
                {plan.label}
              </motion.div>
            </AnimatePresence>

            {/* Pitch */}
            <div style={{ flex: 1, minHeight: 120 }}>
              <HorizontalPitch plan={plan} />
            </div>
          </motion.div>

          {/* TACKLING */}
          <motion.div layout style={{
            ...GLASS, width: 132, flexShrink: 0,
            padding: 14, display: "flex", flexDirection: "column",
          }}>
            <SectionLabel text="TACKLING" />

            <AnimatePresence mode="wait">
              <motion.div
                key={tackIdx}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.18 }}
                style={{ color: "white", fontWeight: 800, fontSize: 16, marginBottom: 10 }}
              >
                {TACKLING_OPTIONS[tackIdx]}
              </motion.div>
            </AnimatePresence>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CoachFace />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 10 }}>
              {TACKLING_OPTIONS.map((t, i) => (
                <motion.button
                  key={t}
                  onClick={() => setTackIdx(i)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  animate={{
                    background: i === tackIdx ? "rgba(79,195,247,0.15)" : "rgba(255,255,255,0.03)",
                    borderColor: i === tackIdx ? "rgba(79,195,247,0.5)" : "rgba(255,255,255,0.07)",
                    color: i === tackIdx ? CYAN : "rgba(255,255,255,0.42)",
                    boxShadow: i === tackIdx ? "0 0 8px rgba(79,195,247,0.2)" : "none",
                  }}
                  transition={{ duration: 0.15 }}
                  style={{
                    border: "1px solid", borderRadius: 7,
                    padding: "5px 8px", cursor: "pointer",
                    fontSize: 10, fontWeight: 700,
                    letterSpacing: "0.05em", textAlign: "left" as const,
                  }}
                >{t}</motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── LINE TACTICS ──────────────────────────────────────────────── */}
        <motion.div layout style={{ ...GLASS, padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 14 }}>
            <span style={{ color: CYAN, fontWeight: 900, fontSize: 11, letterSpacing: "0.12em" }}>LINE TACTICS</span>
            <HelpBubble />
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2.1fr)",
            gap: 14, alignItems: "start",
          }}>
            {/* Animated vertical pitch */}
            <VerticalPitch arrows={pitchArrows} pitchKey={pitchKey} />

            {/* Tactic card grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {LINE_TACTIC_ROWS.map((row, ri) => (
                <TacticRow
                  key={row.label}
                  row={row}
                  activeIdx={lineIdx[ri]}
                  onChange={i => setLine(ri, i)}
                />
              ))}
            </div>
          </div>
        </motion.div>

      </section>
    </LayoutGroup>
  );
}
