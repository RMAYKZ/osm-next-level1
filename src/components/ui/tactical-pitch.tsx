import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NEON = "oklch(0.87 0.27 152)";
const NEON_GLOW = "oklch(0.87 0.27 152 / 0.35)";

// Player positions as [x%, y%] within pitch (top = attack, bottom = defense)
const FORMATIONS: Record<string, { label: string; players: [number, number][] }> = {
  "4-3-3": {
    label: "4-3-3",
    players: [
      [50, 89],                                           // GK
      [20, 72], [38, 70], [62, 70], [80, 72],           // DEF
      [28, 50], [50, 47], [72, 50],                      // MID
      [25, 24], [50, 20], [75, 24],                      // FWD
    ],
  },
  "5-2-3": {
    label: "5-2-3",
    players: [
      [50, 89],                                           // GK
      [15, 68], [32, 72], [50, 75], [68, 72], [85, 68], // DEF
      [38, 50], [62, 50],                                // MID
      [25, 24], [50, 20], [75, 24],                      // FWD
    ],
  },
  "4-4-2": {
    label: "4-4-2",
    players: [
      [50, 89],                                           // GK
      [20, 72], [38, 70], [62, 70], [80, 72],           // DEF
      [18, 50], [40, 48], [60, 48], [82, 50],           // MID
      [38, 22], [62, 22],                                // FWD
    ],
  },
  "4-5-1": {
    label: "4-5-1",
    players: [
      [50, 89],                                           // GK
      [20, 72], [38, 70], [62, 70], [80, 72],           // DEF
      [16, 50], [34, 47], [50, 44], [66, 47], [84, 50], // MID
      [50, 20],                                          // FWD
    ],
  },
  "5-3-2": {
    label: "5-3-2",
    players: [
      [50, 89],                                           // GK
      [15, 68], [32, 72], [50, 75], [68, 72], [85, 68], // DEF
      [28, 50], [50, 47], [72, 50],                      // MID
      [38, 22], [62, 22],                                // FWD
    ],
  },
};

const ORDER = ["4-3-3", "5-2-3", "4-4-2", "4-5-1", "5-3-2"];

function PitchSVG() {
  return (
    <svg
      viewBox="0 0 100 140"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {/* Pitch fill */}
      <rect x="4" y="4" width="92" height="132" rx="3" fill="rgba(0,20,10,0.85)" />

      {/* Outer border */}
      <rect x="4" y="4" width="92" height="132" rx="3" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" />

      {/* Halfway line */}
      <line x1="4" y1="72" x2="96" y2="72" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

      {/* Centre circle */}
      <circle cx="50" cy="72" r="11" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      <circle cx="50" cy="72" r="0.8" fill="rgba(255,255,255,0.18)" />

      {/* Top penalty area */}
      <rect x="22" y="4" width="56" height="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      {/* Top 6-yard box */}
      <rect x="34" y="4" width="32" height="6" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />
      {/* Top penalty spot */}
      <circle cx="50" cy="16" r="0.7" fill="rgba(255,255,255,0.15)" />
      {/* Top penalty arc */}
      <path d="M 36 22 A 11 11 0 0 0 64 22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />

      {/* Bottom penalty area */}
      <rect x="22" y="118" width="56" height="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      {/* Bottom 6-yard box */}
      <rect x="34" y="130" width="32" height="6" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />
      {/* Bottom penalty spot */}
      <circle cx="50" cy="124" r="0.7" fill="rgba(255,255,255,0.15)" />
      {/* Bottom penalty arc */}
      <path d="M 36 118 A 11 11 0 0 1 64 118" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />

      {/* Corner arcs */}
      <path d="M 4 8 A 4 4 0 0 1 8 4" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />
      <path d="M 92 8 A 4 4 0 0 0 88 4" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />
      <path d="M 4 132 A 4 4 0 0 0 8 136" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />
      <path d="M 92 132 A 4 4 0 0 1 88 136" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />

      {/* Goals */}
      <rect x="40" y="1.5" width="20" height="2.5" rx="0.5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      <rect x="40" y="136" width="20" height="2.5" rx="0.5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
    </svg>
  );
}

interface PlayerDotProps {
  x: number;
  y: number;
  isGK?: boolean;
}

function PlayerDot({ x, y, isGK }: PlayerDotProps) {
  return (
    <motion.div
      layout
      animate={{ left: `${x}%`, top: `${y}%` }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
      style={{
        position: "absolute",
        transform: "translate(-50%, -50%)",
        width: isGK ? 10 : 9,
        height: isGK ? 10 : 9,
        borderRadius: "50%",
        background: isGK
          ? "rgba(255,255,255,0.85)"
          : NEON,
        boxShadow: isGK
          ? "0 0 6px rgba(255,255,255,0.5)"
          : `0 0 8px ${NEON_GLOW}, 0 0 16px ${NEON_GLOW}`,
        border: isGK ? "1.5px solid rgba(255,255,255,0.4)" : `1.5px solid ${NEON}`,
        zIndex: 2,
      }}
    />
  );
}

export function TacticalPitchScene() {
  const [idx, setIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setPrevIdx(idx);
      setIdx(i => (i + 1) % ORDER.length);
    }, 3200);
    return () => clearInterval(t);
  }, [idx]);

  const key = ORDER[idx];
  const formation = FORMATIONS[key];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>

      {/* Ambient glow behind pitch */}
      <div aria-hidden style={{
        position: "absolute",
        width: "55%", height: "70%",
        borderRadius: "50%",
        background: `radial-gradient(ellipse, oklch(0.87 0.27 152 / 0.06) 0%, transparent 70%)`,
        filter: "blur(40px)",
        pointerEvents: "none",
      }} />

      {/* Pitch container */}
      <div style={{
        position: "relative",
        width: "min(260px, 46%)",
        aspectRatio: "100 / 140",
        borderRadius: 8,
        overflow: "visible",
        boxShadow: `0 0 40px oklch(0.87 0.27 152 / 0.08), 0 0 80px rgba(0,0,0,0.5)`,
      }}>
        <PitchSVG />

        {/* Player dots */}
        {formation.players.map(([x, y], i) => (
          <PlayerDot key={i} x={x} y={y} isGK={i === 0} />
        ))}
      </div>

      {/* Formation label — bottom centre */}
      <div style={{
        position: "absolute",
        bottom: "10%",
        left: 0, right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            style={{
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 900,
              fontFamily: "'Outfit', sans-serif",
              color: NEON,
              letterSpacing: "0.04em",
              textShadow: `0 0 20px ${NEON_GLOW}`,
            }}
          >
            {formation.label}
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6 }}>
          {ORDER.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === idx ? 16 : 5,
                height: 5,
                borderRadius: 999,
                background: i === idx ? NEON : "rgba(255,255,255,0.15)",
                transition: "all 0.35s ease",
                boxShadow: i === idx ? `0 0 8px ${NEON_GLOW}` : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Top label */}
      <div style={{
        position: "absolute",
        top: "8%",
        left: 0, right: 0,
        textAlign: "center",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.2)",
      }}>
        Taktik Analizi
      </div>
    </div>
  );
}
