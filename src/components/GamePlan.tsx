import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Central tactic data object ─────────────────────────────────────────────
const TACTICS = [
  { id: "passing",  name: "Passing game" },
  { id: "wing",     name: "Wing play" },
  { id: "counter",  name: "Counter-attack" },
  { id: "longball", name: "Long ball" },
  { id: "shoot",    name: "Shoot on sight" },
] as const;

type TacticId = (typeof TACTICS)[number]["id"];

// ── Component ──────────────────────────────────────────────────────────────
export default function GamePlan() {
  const [idx, setIdx] = useState(2);
  const tactic = TACTICS[idx];

  const next = () => setIdx(i => (i + 1) % TACTICS.length);

  return (
    <div
      style={{
        background: "linear-gradient(165deg, #0e1d32 0%, #091422 100%)",
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.07)",
        padding: "18px 18px 14px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ color: "#4fc3f7", fontWeight: 900, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Game Plan
        </span>
        <HelpBadge />
      </div>

      {/* Tactic name */}
      <div style={{ minHeight: 32, marginBottom: 12 }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={tactic.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            style={{ textAlign: "center", color: "white", fontWeight: 800, fontSize: 21, margin: 0, letterSpacing: "-0.01em" }}
          >
            {tactic.name}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* 3-D Pitch — click to advance */}
      <div
        onClick={next}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") next(); }}
        style={{ cursor: "pointer", perspective: 520, perspectiveOrigin: "50% 108%", flex: 1 }}
        aria-label="Next tactic"
      >
        <div style={{ transform: "rotateX(20deg)", transformOrigin: "center bottom" }}>
          <svg viewBox="0 0 300 162" style={{ width: "100%", display: "block", borderRadius: 8 }}>
            <PitchField />
            <AnimatePresence mode="wait">
              <motion.g
                key={tactic.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TacticArrows id={tactic.id} />
              </motion.g>
            </AnimatePresence>
          </svg>
        </div>
      </div>

      {/* Dot navigation */}
      <div
        style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 9, marginTop: 14 }}
        role="tablist"
        aria-label="Game plan tactics"
      >
        {TACTICS.map((t, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            role="tab"
            aria-selected={i === idx}
            aria-label={t.name}
            style={{
              width: 8, height: 8, borderRadius: "50%", border: "none", padding: 0,
              cursor: "pointer", outline: "none",
              background: i === idx ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.22)",
              transition: "background 0.2s, transform 0.15s",
              transform: i === idx ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Help badge ─────────────────────────────────────────────────────────────
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

// ── Landscape pitch SVG background ────────────────────────────────────────
// Attack direction: RIGHT → LEFT (opponent goal on left)
function PitchField() {
  return (
    <>
      <defs>
        <linearGradient id="gpGrass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a7a2c" />
          <stop offset="45%" stopColor="#1e8e33" />
          <stop offset="100%" stopColor="#125a20" />
        </linearGradient>
        {/* Red arrow marker */}
        <marker id="gpRed" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
          <polygon points="0 0, 9 3.5, 0 7" fill="#ef4444" />
        </marker>
        {/* Blue arrow marker */}
        <marker id="gpBlue" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
          <polygon points="0 0, 9 3.5, 0 7" fill="#60a5fa" />
        </marker>
      </defs>

      {/* Grass */}
      <rect width="300" height="162" fill="url(#gpGrass)" />

      {/* Alternating lawn stripes */}
      {[0, 1, 2, 3, 4].map(i => (
        <rect key={i} x={i * 60} y="0" width="60" height="162"
          fill={i % 2 === 0 ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.035)"} />
      ))}

      {/* Depth vignette */}
      <rect width="300" height="162"
        fill="url(#gpVignette)"
        style={{ pointerEvents: "none" }}
      />
      <defs>
        <radialGradient id="gpVignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.35)" />
        </radialGradient>
      </defs>

      {/* Field border */}
      <rect x="8" y="6" width="284" height="150" rx="2"
        fill="none" stroke="rgba(255,255,255,0.78)" strokeWidth="1.5" />

      {/* Halfway line */}
      <line x1="150" y1="6" x2="150" y2="156"
        stroke="rgba(255,255,255,0.68)" strokeWidth="1" />

      {/* Center circle */}
      <circle cx="150" cy="81" r="23"
        fill="none" stroke="rgba(255,255,255,0.68)" strokeWidth="1" />
      <circle cx="150" cy="81" r="1.8" fill="rgba(255,255,255,0.88)" />

      {/* LEFT goal = opponent's goal (attack target) */}
      <rect x="8" y="59" width="14" height="44"
        fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.72)" strokeWidth="1.2" />
      <rect x="8" y="70" width="7" height="22"
        fill="none" stroke="rgba(255,255,255,0.52)" strokeWidth="0.9" />

      {/* Left penalty area */}
      <rect x="8" y="43" width="42" height="76"
        fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
      <circle cx="44" cy="81" r="12"
        fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="0.9"
        strokeDasharray="6 100" strokeDashoffset="-6" />

      {/* RIGHT goal = own goal */}
      <rect x="278" y="59" width="14" height="44"
        fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.72)" strokeWidth="1.2" />
      <rect x="285" y="70" width="7" height="22"
        fill="none" stroke="rgba(255,255,255,0.52)" strokeWidth="0.9" />

      {/* Right penalty area */}
      <rect x="250" y="43" width="42" height="76"
        fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
      <circle cx="256" cy="81" r="12"
        fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="0.9"
        strokeDasharray="6 100" strokeDashoffset="-6" />
    </>
  );
}

// ── Per-tactic SVG arrows ─────────────────────────────────────────────────
function TacticArrows({ id }: { id: TacticId }) {
  switch (id) {
    case "passing":
      // Two S-curve wavy paths traversing right → left
      return (
        <g>
          <path
            d="M 268 56 C 225 26, 188 92, 150 60 S 88 28, 44 58"
            stroke="#ef4444" strokeWidth="5.5" fill="none"
            strokeLinecap="round" markerEnd="url(#gpRed)"
          />
          <path
            d="M 268 106 C 225 76, 188 142, 150 110 S 88 78, 44 106"
            stroke="#ef4444" strokeWidth="5.5" fill="none"
            strokeLinecap="round" markerEnd="url(#gpRed)"
          />
        </g>
      );

    case "wing":
      // Two thick horizontal arrows spanning full width, right → left
      return (
        <g>
          <line x1="265" y1="50" x2="55" y2="50"
            stroke="#ef4444" strokeWidth="7" strokeLinecap="round"
            markerEnd="url(#gpRed)" />
          <line x1="265" y1="112" x2="55" y2="112"
            stroke="#ef4444" strokeWidth="7" strokeLinecap="round"
            markerEnd="url(#gpRed)" />
        </g>
      );

    case "counter":
      // Two red arching curves on wings + two flat blue arrows in center
      return (
        <g>
          {/* Wing arches */}
          <path d="M 260 46 Q 150 10 52 46"
            stroke="#ef4444" strokeWidth="5.5" fill="none"
            strokeLinecap="round" markerEnd="url(#gpRed)" />
          <path d="M 260 116 Q 150 152 52 116"
            stroke="#ef4444" strokeWidth="5.5" fill="none"
            strokeLinecap="round" markerEnd="url(#gpRed)" />
          {/* Central blue arrows */}
          <path d="M 228 72 Q 148 60 72 72"
            stroke="#60a5fa" strokeWidth="4.5" fill="none"
            strokeLinecap="round" markerEnd="url(#gpBlue)" />
          <path d="M 222 92 Q 148 104 74 92"
            stroke="#60a5fa" strokeWidth="4.5" fill="none"
            strokeLinecap="round" markerEnd="url(#gpBlue)" />
        </g>
      );

    case "longball":
      // Single prominent arc from right to left (diagonal kick over pitch)
      return (
        <g>
          <path d="M 228 120 Q 148 14 72 120"
            stroke="#ef4444" strokeWidth="6.5" fill="none"
            strokeLinecap="round" markerEnd="url(#gpRed)" />
        </g>
      );

    case "shoot":
      // Soccer balls clustered right-of-center, arrows pointing toward left goal
      return (
        <g>
          {/* Balls */}
          {([
            [202, 54],
            [218, 72],
            [207, 88],
            [220, 104],
            [195, 102],
          ] as [number, number][]).map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="6.5" fill="white" />
              <circle cx={cx} cy={cy} r="6.5" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
              <circle cx={cx} cy={cy} r="2" fill="#333" />
            </g>
          ))}
          {/* Converging arrows toward left goal */}
          <line x1="196" y1="54" x2="60" y2="68"
            stroke="#ef4444" strokeWidth="5" strokeLinecap="round" markerEnd="url(#gpRed)" />
          <line x1="212" y1="72" x2="60" y2="79"
            stroke="#ef4444" strokeWidth="5" strokeLinecap="round" markerEnd="url(#gpRed)" />
          <line x1="201" y1="88" x2="60" y2="84"
            stroke="#ef4444" strokeWidth="5" strokeLinecap="round" markerEnd="url(#gpRed)" />
        </g>
      );

    default:
      return null;
  }
}
