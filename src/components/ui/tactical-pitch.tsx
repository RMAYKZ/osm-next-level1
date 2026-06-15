import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NEON       = "oklch(0.87 0.27 152)";
const NEON_DIM   = "oklch(0.87 0.27 152 / 0.18)";
const NEON_MID   = "oklch(0.87 0.27 152 / 0.45)";
const PITCH_DARK = "#071a0e";
const PITCH_LITE = "#091f10";
const LINE_CLR   = "rgba(255,255,255,0.18)";
const LINE_DIM   = "rgba(255,255,255,0.09)";

// groups: [GK, DEF, MID, FWD] counts
const FORMATIONS: Record<string, {
  label: string;
  groups: number[];
  players: [number, number][];
}> = {
  "4-3-3": {
    label: "4-3-3", groups: [1, 4, 3, 3],
    players: [
      [50, 88],
      [20, 72], [38, 70], [62, 70], [80, 72],
      [28, 50], [50, 47], [72, 50],
      [24, 22], [50, 18], [76, 22],
    ],
  },
  "5-2-3": {
    label: "5-2-3", groups: [1, 5, 2, 3],
    players: [
      [50, 88],
      [14, 67], [32, 72], [50, 74], [68, 72], [86, 67],
      [38, 49], [62, 49],
      [24, 22], [50, 18], [76, 22],
    ],
  },
  "4-4-2": {
    label: "4-4-2", groups: [1, 4, 4, 2],
    players: [
      [50, 88],
      [20, 72], [38, 70], [62, 70], [80, 72],
      [17, 50], [39, 47], [61, 47], [83, 50],
      [38, 21], [62, 21],
    ],
  },
  "4-5-1": {
    label: "4-5-1", groups: [1, 4, 5, 1],
    players: [
      [50, 88],
      [20, 72], [38, 70], [62, 70], [80, 72],
      [14, 50], [32, 47], [50, 44], [68, 47], [86, 50],
      [50, 18],
    ],
  },
  "5-3-2": {
    label: "5-3-2", groups: [1, 5, 3, 2],
    players: [
      [50, 88],
      [14, 67], [32, 72], [50, 74], [68, 72], [86, 67],
      [28, 49], [50, 46], [72, 49],
      [38, 21], [62, 21],
    ],
  },
};

const ORDER = ["4-3-3", "5-2-3", "4-4-2", "4-5-1", "5-3-2"];

// Build index pairs for lines within each group row
function buildLines(groups: number[]): [number, number][] {
  const lines: [number, number][] = [];
  let start = 0;
  for (const count of groups) {
    for (let i = start; i < start + count - 1; i++) {
      lines.push([i, i + 1]);
    }
    start += count;
  }
  // Vertical connectors: centre of each adjacent group
  let g = 0;
  const groupCentres: number[] = [];
  let idx = 0;
  for (const count of groups) {
    const mid = idx + Math.floor(count / 2);
    groupCentres.push(mid);
    idx += count;
    g++;
  }
  for (let i = 0; i < groupCentres.length - 1; i++) {
    lines.push([groupCentres[i], groupCentres[i + 1]]);
  }
  return lines;
}

// Striped SVG pitch
function PitchSVG() {
  const stripes = Array.from({ length: 8 }, (_, i) => i);
  return (
    <svg
      viewBox="0 0 100 140"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <clipPath id="pitch-clip">
          <rect x="3" y="3" width="94" height="134" rx="3" />
        </clipPath>
        <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.4" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Base fill */}
      <rect x="3" y="3" width="94" height="134" rx="3" fill={PITCH_DARK} />

      {/* Grass stripes */}
      {stripes.map(i => (
        <rect
          key={i}
          x="3" y={3 + i * 16.75}
          width="94" height="8.4"
          fill={PITCH_LITE}
          clipPath="url(#pitch-clip)"
          opacity="0.6"
        />
      ))}

      {/* Border */}
      <rect x="3" y="3" width="94" height="134" rx="3" fill="none"
        stroke={LINE_CLR} strokeWidth="0.7" />

      {/* Halfway line */}
      <line x1="3" y1="70" x2="97" y2="70" stroke={LINE_CLR} strokeWidth="0.5" />

      {/* Centre circle */}
      <circle cx="50" cy="70" r="12" fill="none" stroke={LINE_CLR} strokeWidth="0.5" />
      <circle cx="50" cy="70" r="1" fill={LINE_CLR} />

      {/* Top penalty area */}
      <rect x="20" y="3" width="60" height="20" fill="none" stroke={LINE_CLR} strokeWidth="0.5" />
      <rect x="33" y="3" width="34" height="7" fill="none" stroke={LINE_DIM} strokeWidth="0.4" />
      <circle cx="50" cy="15" r="0.8" fill={LINE_DIM} />
      <path d="M 35 23 A 12 12 0 0 0 65 23" fill="none" stroke={LINE_DIM} strokeWidth="0.4" />

      {/* Bottom penalty area */}
      <rect x="20" y="117" width="60" height="20" fill="none" stroke={LINE_CLR} strokeWidth="0.5" />
      <rect x="33" y="130" width="34" height="7" fill="none" stroke={LINE_DIM} strokeWidth="0.4" />
      <circle cx="50" cy="125" r="0.8" fill={LINE_DIM} />
      <path d="M 35 117 A 12 12 0 0 1 65 117" fill="none" stroke={LINE_DIM} strokeWidth="0.4" />

      {/* Corner arcs */}
      {[[3,7,7,3],[93,7,93,3],[3,133,7,137],[93,133,93,137]].map(([x1,y1,x2,y2],i) => (
        <path key={i} d={`M ${x1} ${y1} A 4 4 0 0 ${i < 2 ? 1 : 0} ${x2} ${y2}`}
          fill="none" stroke={LINE_DIM} strokeWidth="0.4" />
      ))}

      {/* Goals */}
      <rect x="38" y="0.5" width="24" height="3" rx="0.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
      <rect x="38" y="136.5" width="24" height="3" rx="0.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
    </svg>
  );
}

// Tactical connection lines drawn as SVG overlay
function TacticalLines({
  players, lines,
}: { players: [number, number][]; lines: [number, number][] }) {
  return (
    <svg
      viewBox="0 0 100 140"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }}
      aria-hidden
    >
      {lines.map(([a, b], i) => {
        const [ax, ay] = players[a];
        const [bx, by] = players[b];
        return (
          <line
            key={i}
            x1={ax} y1={ay}
            x2={bx} y2={by}
            stroke={NEON_DIM}
            strokeWidth="0.7"
            strokeDasharray="2 2"
          />
        );
      })}
    </svg>
  );
}

interface PlayerDotProps {
  x: number; y: number; isGK?: boolean; delay?: number;
}

function PlayerDot({ x, y, isGK, delay = 0 }: PlayerDotProps) {
  const size   = isGK ? 11 : 9;
  const color  = isGK ? "rgba(255,255,255,0.92)" : NEON;
  const border = isGK ? "1.5px solid rgba(255,255,255,0.5)" : `1.5px solid ${NEON}`;
  const shadow = isGK
    ? "0 0 6px rgba(255,255,255,0.6)"
    : `0 0 6px ${NEON_MID}, 0 0 18px ${NEON_DIM}`;

  return (
    <motion.div
      animate={{ left: `${x}%`, top: `${y}%` }}
      transition={{ type: "spring", stiffness: 200, damping: 24, delay }}
      style={{
        position: "absolute",
        transform: "translate(-50%, -50%)",
        zIndex: 3,
      }}
    >
      {/* Outer pulse ring */}
      {!isGK && (
        <motion.div
          animate={{ scale: [1, 1.9, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: delay * 0.4 }}
          style={{
            position: "absolute",
            width: size + 6,
            height: size + 6,
            top: -(3),
            left: -(3),
            borderRadius: "50%",
            border: `1px solid ${NEON_MID}`,
          }}
        />
      )}
      {/* Core dot */}
      <div style={{
        width: size, height: size,
        borderRadius: "50%",
        background: color,
        border,
        boxShadow: shadow,
        position: "relative",
      }} />
    </motion.div>
  );
}

// Ball that idles at center, disappears during formation swap
function Ball({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="ball"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "absolute",
            left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            width: 7, height: 7,
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: "0 0 8px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.3)",
            zIndex: 4,
          }}
        />
      )}
    </AnimatePresence>
  );
}

export function TacticalPitchScene() {
  const [idx, setIdx]         = useState(0);
  const [swapping, setSwapping] = useState(false);
  const timerRef              = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSwapping(true);
      setTimeout(() => {
        setIdx(i => (i + 1) % ORDER.length);
        setSwapping(false);
      }, 350);
    }, 3800);
    return () => clearInterval(timerRef.current);
  }, []);

  const key       = ORDER[idx];
  const formation = FORMATIONS[key];
  const lines     = buildLines(formation.groups);

  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>

      {/* Ambient underlay glow */}
      <div aria-hidden style={{
        position: "absolute",
        width: "60%", height: "75%",
        background: `radial-gradient(ellipse, oklch(0.87 0.27 152 / 0.07) 0%, transparent 65%)`,
        filter: "blur(50px)",
        pointerEvents: "none",
      }} />

      {/* Pitch + players wrapper — slight 3-D tilt */}
      <motion.div
        animate={{ opacity: swapping ? 0.4 : 1, scale: swapping ? 0.97 : 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "relative",
          width: "min(280px, 50%)",
          aspectRatio: "100 / 140",
          borderRadius: 10,
          boxShadow: `
            0 0 0 1px oklch(0.87 0.27 152 / 0.12),
            0 0 40px oklch(0.87 0.27 152 / 0.1),
            0 24px 60px rgba(0,0,0,0.6)
          `,
          transform: "perspective(700px) rotateX(8deg)",
          transformStyle: "preserve-3d",
        }}
      >
        <PitchSVG />

        {/* Tactical lines */}
        <TacticalLines players={formation.players} lines={lines} />

        {/* Player dots */}
        {formation.players.map(([x, y], i) => (
          <PlayerDot key={i} x={x} y={y} isGK={i === 0} delay={i * 0.015} />
        ))}

        {/* Ball at centre */}
        <Ball visible={!swapping} />
      </motion.div>

      {/* Formation label */}
      <div style={{
        position: "absolute",
        bottom: "7%",
        left: 0, right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.35 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.22)",
            }}>
              Formasyon
            </span>
            <span style={{
              fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)",
              fontWeight: 900,
              fontFamily: "'Outfit', sans-serif",
              color: NEON,
              letterSpacing: "0.06em",
              textShadow: `0 0 24px ${NEON_MID}`,
              lineHeight: 1,
            }}>
              {formation.label}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Progress pills */}
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {ORDER.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === idx ? 22 : 5,
                background: i === idx ? NEON : "rgba(255,255,255,0.14)",
                boxShadow: i === idx ? `0 0 8px ${NEON_MID}` : "none",
              }}
              transition={{ duration: 0.35 }}
              style={{ height: 4, borderRadius: 999 }}
            />
          ))}
        </div>
      </div>

      {/* Top eyebrow */}
      <div style={{
        position: "absolute",
        top: "7%",
        left: 0, right: 0,
        textAlign: "center",
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.18)",
      }}>
        Taktik Analizi
      </div>
    </div>
  );
}
