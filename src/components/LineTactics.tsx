import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Central tactic data object ─────────────────────────────────────────────
const LINE_TACTICS_DATA = {
  forwards: {
    label: "Forwards",
    color: "#4fc3f7",
    options: [
      { id: "fwd-support", label: "Support midfield" },
      { id: "fwd-stay",    label: "Stay in position" },
      { id: "fwd-attack",  label: "Attack only" },
    ],
  },
  midfielders: {
    label: "Midfielders",
    color: "#f59e0b",
    options: [
      { id: "mid-protect", label: "Protect the defence" },
      { id: "mid-stay",    label: "Stay in position" },
      { id: "mid-attack",  label: "Join the attack" },
    ],
  },
  defenders: {
    label: "Defenders",
    color: "#f59e0b",
    options: [
      { id: "def-deep",  label: "Defend deep" },
      { id: "def-stay",  label: "Stay in position" },
      { id: "def-wings", label: "Attacking full-backs" },
    ],
  },
} as const;

// ── Component ──────────────────────────────────────────────────────────────
export default function LineTactics() {
  const [fwdIdx, setFwdIdx] = useState(0);
  const [midIdx, setMidIdx] = useState(0);
  const [defIdx, setDefIdx] = useState(2);

  return (
    <div
      style={{
        background: "linear-gradient(165deg, #0e1d32 0%, #091422 100%)",
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.07)",
        padding: "18px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <span style={{ color: "#4fc3f7", fontWeight: 900, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Line Tactics
        </span>
        <HelpBadge />
      </div>

      {/* Body: pitch + selectors */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)",
          gap: 20,
          alignItems: "center",
        }}
      >
        {/* Left: tactical pitch */}
        <div>
          <svg viewBox="0 0 100 133" style={{ width: "100%", display: "block", borderRadius: 10 }}>
            <LTPitchField />
            <AnimatePresence mode="wait">
              <motion.g
                key={`${fwdIdx}-${midIdx}-${defIdx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <ForwardsArrows idx={fwdIdx} />
                <MidfieldArrows idx={midIdx} />
                <DefendersArrows idx={defIdx} />
              </motion.g>
            </AnimatePresence>
          </svg>
        </div>

        {/* Right: tactic selectors */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <TacticSelector
            row={LINE_TACTICS_DATA.forwards}
            activeIdx={fwdIdx}
            onChange={setFwdIdx}
          />
          <TacticSelector
            row={LINE_TACTICS_DATA.midfielders}
            activeIdx={midIdx}
            onChange={setMidIdx}
          />
          <TacticSelector
            row={LINE_TACTICS_DATA.defenders}
            activeIdx={defIdx}
            onChange={setDefIdx}
          />
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────
function HelpBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 19, height: 19, borderRadius: "50%",
      background: "linear-gradient(135deg, #1e7ab8 0%, #1560a0 100%)",
      color: "white", fontSize: 11, fontWeight: 900, lineHeight: 1, flexShrink: 0,
    }}>?</span>
  );
}

interface TacticSelectorProps {
  row: { label: string; color: string; options: readonly { id: string; label: string }[] };
  activeIdx: number;
  onChange: (i: number) => void;
}

function TacticSelector({ row, activeIdx, onChange }: TacticSelectorProps) {
  return (
    <div>
      <p style={{
        margin: "0 0 2px",
        color: row.color,
        fontWeight: 900,
        fontSize: 11,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}>
        {row.label}
      </p>
      <div style={{ minHeight: 40, marginBottom: 8 }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={row.options[activeIdx].id}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
            style={{ margin: 0, color: "white", fontWeight: 800, fontSize: 16, lineHeight: 1.25 }}
          >
            {row.options[activeIdx].label}
          </motion.p>
        </AnimatePresence>
      </div>
      <div style={{ display: "flex", gap: 9 }} role="tablist">
        {row.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            role="tab"
            aria-selected={i === activeIdx}
            aria-label={opt.label}
            style={{
              width: 9, height: 9, borderRadius: "50%", border: "none", padding: 0,
              cursor: "pointer", outline: "none",
              background: i === activeIdx ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.22)",
              transition: "background 0.2s, transform 0.15s",
              transform: i === activeIdx ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Pitch SVG background ───────────────────────────────────────────────────
// Portrait orientation. Top = opponent goal (attack end). Bottom = own goal.
function LTPitchField() {
  return (
    <>
      <defs>
        <linearGradient id="ltGrass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a7a2c" />
          <stop offset="50%" stopColor="#1e8e33" />
          <stop offset="100%" stopColor="#125a20" />
        </linearGradient>
        {/* Arrow markers */}
        <marker id="lt-blue" markerWidth="7" markerHeight="6" refX="6" refY="3" orient="auto">
          <polygon points="0 0, 7 3, 0 6" fill="#60a5fa" />
        </marker>
        <marker id="lt-gold" markerWidth="7" markerHeight="6" refX="6" refY="3" orient="auto">
          <polygon points="0 0, 7 3, 0 6" fill="#fbbf24" />
        </marker>
        <marker id="lt-orange" markerWidth="7" markerHeight="6" refX="6" refY="3" orient="auto">
          <polygon points="0 0, 7 3, 0 6" fill="#f97316" />
        </marker>
      </defs>

      {/* Grass */}
      <rect width="100" height="133" fill="url(#ltGrass)" />

      {/* Lawn stripes (horizontal) */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <rect key={i} x="0" y={i * 17} width="100" height="17"
          fill={i % 2 === 0 ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.035)"} />
      ))}

      {/* Field outline */}
      <rect x="2" y="2" width="96" height="129" rx="1.5"
        fill="none" stroke="rgba(255,255,255,0.78)" strokeWidth="0.7" />

      {/* Halfway line */}
      <line x1="2" y1="66.5" x2="98" y2="66.5"
        stroke="rgba(255,255,255,0.65)" strokeWidth="0.5" />

      {/* Center circle */}
      <circle cx="50" cy="66.5" r="11"
        fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="0.45" />
      <circle cx="50" cy="66.5" r="0.9" fill="rgba(255,255,255,0.85)" />

      {/* TOP = opponent's goal (attack end) */}
      <rect x="31" y="2" width="38" height="7.5"
        fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.68)" strokeWidth="0.6" />
      <rect x="25" y="2" width="50" height="18"
        fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
      <circle cx="50" cy="16" r="0.7" fill="rgba(255,255,255,0.8)" />
      <path d="M 37 20 Q 50 27 63 20"
        fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="0.42" />

      {/* BOTTOM = own goal */}
      <rect x="31" y="123.5" width="38" height="7.5"
        fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.68)" strokeWidth="0.6" />
      <rect x="25" y="113" width="50" height="18"
        fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
      <circle cx="50" cy="117" r="0.7" fill="rgba(255,255,255,0.8)" />
      <path d="M 37 113 Q 50 106 63 113"
        fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="0.42" />
    </>
  );
}

// ── Arrow overlays per line ────────────────────────────────────────────────
// Forwards sit near the TOP (opponent's end). Defenders near BOTTOM (own end).

function ForwardsArrows({ idx }: { idx: number }) {
  switch (idx) {
    case 0: // Support midfield — single blue arrow pointing DOWN (dropping back)
      return (
        <g>
          <line x1="50" y1="26" x2="50" y2="41"
            stroke="#60a5fa" strokeWidth="4" strokeLinecap="round"
            markerEnd="url(#lt-blue)" />
        </g>
      );
    case 1: // Stay in position — dashed circle (hold position)
      return (
        <g>
          <circle cx="50" cy="32" r="5.5"
            fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeDasharray="2.5 2.5" />
          <circle cx="50" cy="32" r="1.5" fill="#60a5fa" opacity="0.6" />
        </g>
      );
    case 2: // Attack only — blue arrow pointing UP (pushing high)
      return (
        <g>
          <line x1="50" y1="40" x2="50" y2="24"
            stroke="#60a5fa" strokeWidth="4" strokeLinecap="round"
            markerEnd="url(#lt-blue)" />
        </g>
      );
    default:
      return null;
  }
}

function MidfieldArrows({ idx }: { idx: number }) {
  // Midfielders at center (y ≈ 54–79)
  switch (idx) {
    case 0: // Protect the defence — two curved arcs pointing downward (crescent)
      return (
        <g>
          <path d="M 33 60 Q 50 74 67 60"
            fill="none" stroke="#fbbf24" strokeWidth="3.2" strokeLinecap="round"
            markerEnd="url(#lt-gold)" />
          <path d="M 29 67 Q 50 84 71 67"
            fill="none" stroke="#fbbf24" strokeWidth="3.2" strokeLinecap="round"
            markerEnd="url(#lt-gold)" />
        </g>
      );
    case 1: // Stay in position — horizontal arrows extending outward with vertical ticks
      return (
        <g>
          {/* Left arrow */}
          <line x1="46" y1="64" x2="20" y2="64"
            stroke="#fbbf24" strokeWidth="2.8" strokeLinecap="round" markerEnd="url(#lt-gold)" />
          {/* Right arrow */}
          <line x1="54" y1="64" x2="80" y2="64"
            stroke="#fbbf24" strokeWidth="2.8" strokeLinecap="round" markerEnd="url(#lt-gold)" />
          {/* Left vertical extent */}
          <line x1="20" y1="57" x2="20" y2="72"
            stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" />
          {/* Right vertical extent */}
          <line x1="80" y1="57" x2="80" y2="72"
            stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" />
          {/* Center up/down */}
          <line x1="50" y1="57" x2="50" y2="50"
            stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" markerEnd="url(#lt-gold)" />
          <line x1="50" y1="72" x2="50" y2="80"
            stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" markerEnd="url(#lt-gold)" />
        </g>
      );
    case 2: // Join the attack — upward arrows from midfield positions
      return (
        <g>
          <line x1="30" y1="72" x2="30" y2="56"
            stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" markerEnd="url(#lt-gold)" />
          <line x1="50" y1="72" x2="50" y2="56"
            stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" markerEnd="url(#lt-gold)" />
          <line x1="70" y1="72" x2="70" y2="56"
            stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" markerEnd="url(#lt-gold)" />
        </g>
      );
    default:
      return null;
  }
}

function DefendersArrows({ idx }: { idx: number }) {
  // Defenders near BOTTOM (own goal at y ≈ 113–131)
  switch (idx) {
    case 0: // Defend deep — compact: central upward arrow + short side wings
      return (
        <g>
          <line x1="50" y1="116" x2="50" y2="100"
            stroke="#f97316" strokeWidth="4" strokeLinecap="round" markerEnd="url(#lt-orange)" />
          <line x1="39" y1="114" x2="26" y2="114"
            stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#lt-orange)" />
          <line x1="61" y1="114" x2="74" y2="114"
            stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#lt-orange)" />
        </g>
      );
    case 1: // Stay in position — balanced spread with central hold
      return (
        <g>
          <line x1="46" y1="108" x2="24" y2="108"
            stroke="#f97316" strokeWidth="2.8" strokeLinecap="round" markerEnd="url(#lt-orange)" />
          <line x1="54" y1="108" x2="76" y2="108"
            stroke="#f97316" strokeWidth="2.8" strokeLinecap="round" markerEnd="url(#lt-orange)" />
          <line x1="50" y1="112" x2="50" y2="100"
            stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" markerEnd="url(#lt-orange)" />
        </g>
      );
    case 2: // Attacking full-backs — two wing arrows pushing up the flanks
      return (
        <g>
          <line x1="20" y1="120" x2="20" y2="98"
            stroke="#f97316" strokeWidth="4" strokeLinecap="round" markerEnd="url(#lt-orange)" />
          <line x1="80" y1="120" x2="80" y2="98"
            stroke="#f97316" strokeWidth="4" strokeLinecap="round" markerEnd="url(#lt-orange)" />
        </g>
      );
    default:
      return null;
  }
}
