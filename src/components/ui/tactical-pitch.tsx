import { useCallback, useEffect, useRef, useState } from "react";
import { motion, MotionConfig, AnimatePresence } from "framer-motion";

const NEON   = "#5b8af7";
const RED    = "#f43f5e";
const GOLD   = "#f5a623";

// ── Premium Pitch SVG ─────────────────────────────────────────────────────────
function PitchSVG() {
  const stripes = Array.from({ length: 16 });
  return (
    <svg viewBox="0 0 100 140" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
      <defs>
        <clipPath id="pc"><rect x="1.5" y="1.5" width="97" height="137" rx="3" /></clipPath>

        {/* Rich grass gradient */}
        <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#062810" />
          <stop offset="45%"  stopColor="#0c431a" />
          <stop offset="55%"  stopColor="#0c431a" />
          <stop offset="100%" stopColor="#062810" />
        </linearGradient>

        {/* Floodlight from center-top */}
        <radialGradient id="flood" cx="50%" cy="0%" r="80%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.09)" />
          <stop offset="40%"  stopColor="rgba(255,255,255,0.03)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>

        {/* Corner floodlights */}
        <radialGradient id="fl-tl" cx="0%" cy="0%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,220,0.08)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <radialGradient id="fl-tr" cx="100%" cy="0%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,220,0.08)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>

        {/* Vignette */}
        <radialGradient id="vign" cx="50%" cy="50%" r="70%">
          <stop offset="55%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.45)" />
        </radialGradient>

        {/* Line glow filter */}
        <filter id="lg" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="lg2" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.8" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Base grass */}
      <rect x="1.5" y="1.5" width="97" height="137" rx="3" fill="url(#pg)" />

      {/* Mow stripes */}
      {stripes.map((_, i) => (
        <rect key={i} x="1.5" y={1.5 + i * (137 / 16)} width="97" height={137 / 16}
          fill={i % 2 === 0 ? "rgba(255,255,255,0.022)" : "rgba(0,0,0,0.075)"}
          clipPath="url(#pc)" />
      ))}

      {/* Floodlights */}
      <rect x="1.5" y="1.5" width="97" height="137" rx="3" fill="url(#flood)" clipPath="url(#pc)" />
      <rect x="1.5" y="1.5" width="97" height="137" rx="3" fill="url(#fl-tl)" clipPath="url(#pc)" />
      <rect x="1.5" y="1.5" width="97" height="137" rx="3" fill="url(#fl-tr)" clipPath="url(#pc)" />

      {/* ── FIELD MARKINGS ── */}

      {/* Outer boundary — double stroke for glow */}
      <rect x="3" y="3" width="94" height="134" rx="2" fill="none"
        stroke="rgba(255,255,255,0.18)" strokeWidth="2.8" clipPath="url(#pc)" />
      <rect x="3" y="3" width="94" height="134" rx="2" fill="none"
        stroke="rgba(255,255,255,0.88)" strokeWidth="0.75" filter="url(#lg)" />

      {/* Halfway line */}
      <line x1="3" y1="70" x2="97" y2="70"
        stroke="rgba(255,255,255,0.88)" strokeWidth="0.6" filter="url(#lg)" />
      <line x1="3" y1="70" x2="97" y2="70"
        stroke="rgba(255,255,255,0.15)" strokeWidth="2" />

      {/* Center circle */}
      <circle cx="50" cy="70" r="12" fill="none"
        stroke="rgba(255,255,255,0.88)" strokeWidth="0.6" filter="url(#lg)" />
      <circle cx="50" cy="70" r="12" fill="none"
        stroke="rgba(255,255,255,0.12)" strokeWidth="2" />

      {/* Center spot */}
      <circle cx="50" cy="70" r="1.4" fill="rgba(255,255,255,0.95)" filter="url(#lg2)" />

      {/* ── TOP half (attack) ── */}
      {/* Penalty area */}
      <rect x="22" y="3" width="56" height="20"
        fill="rgba(255,255,255,0.018)" stroke="rgba(255,255,255,0.88)" strokeWidth="0.55" filter="url(#lg)" />
      {/* 6-yard box */}
      <rect x="34" y="3" width="32" height="8"
        fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.4" />
      {/* Penalty spot */}
      <circle cx="50" cy="16" r="0.9" fill="rgba(255,255,255,0.95)" filter="url(#lg2)" />
      {/* Penalty arc */}
      <path d="M 36 23 A 10 10 0 0 0 64 23" fill="none"
        stroke="rgba(255,255,255,0.75)" strokeWidth="0.5" />
      {/* Goal */}
      <rect x="38" y="0.8" width="24" height="3.2"
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.6" />

      {/* ── BOTTOM half (defense) ── */}
      <rect x="22" y="117" width="56" height="20"
        fill="rgba(255,255,255,0.018)" stroke="rgba(255,255,255,0.88)" strokeWidth="0.55" filter="url(#lg)" />
      <rect x="34" y="129" width="32" height="8"
        fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.4" />
      <circle cx="50" cy="124" r="0.9" fill="rgba(255,255,255,0.95)" filter="url(#lg2)" />
      <path d="M 36 117 A 10 10 0 0 1 64 117" fill="none"
        stroke="rgba(255,255,255,0.75)" strokeWidth="0.5" />
      <rect x="38" y="136" width="24" height="3.2"
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.6" />

      {/* Corner arcs */}
      <path d="M 3 9 A 6 6 0 0 0 9 3" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.45" />
      <path d="M 91 3 A 6 6 0 0 0 97 9" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.45" />
      <path d="M 3 131 A 6 6 0 0 1 9 137" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.45" />
      <path d="M 91 137 A 6 6 0 0 1 97 131" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.45" />

      {/* Corner flags */}
      <circle cx="3" cy="3" r="1.3" fill={GOLD} opacity="0.9" />
      <circle cx="97" cy="3" r="1.3" fill={GOLD} opacity="0.9" />
      <circle cx="3" cy="137" r="1.3" fill={GOLD} opacity="0.9" />
      <circle cx="97" cy="137" r="1.3" fill={GOLD} opacity="0.9" />

      {/* Depth vignette */}
      <rect x="1.5" y="1.5" width="97" height="137" rx="3" fill="url(#vign)" clipPath="url(#pc)" />
    </svg>
  );
}

// ── Player marker (clean circle with position label) ──────────────────────────
interface MarkerProps {
  color: string;
  label: string;
  size?: number;
  glowing?: boolean;
  celebrating?: boolean;
  lite?: boolean;
}

function PlayerMarker({ color, label, size = 10, glowing = false, celebrating, lite }: MarkerProps) {
  const fontSize = label.length > 2 ? 4 : label.length > 1 ? 5 : 6;
  const fill = color === GOLD ? "#1a0e00" : color === RED ? "#1a0508" : "#070e1a";

  if (lite) {
    return (
      <svg
        width={size * 2.8} height={size * 2.8}
        viewBox={`${-size * 1.4} ${-size * 1.4} ${size * 2.8} ${size * 2.8}`}
        style={{ overflow: "visible", display: "block" }}
      >
        <circle cx="0" cy="0" r={size} fill={fill} />
        <circle cx="0" cy="0" r={size} fill="none" stroke={color} strokeWidth="1.6" />
        <text x="0" y="0" textAnchor="middle" dominantBaseline="central"
          fill="white" fontSize={fontSize} fontWeight="700"
          fontFamily="Inter, system-ui, sans-serif">
          {label}
        </text>
      </svg>
    );
  }

  return (
    <motion.svg
      width={size * 2.8} height={size * 2.8}
      viewBox={`${-size * 1.4} ${-size * 1.4} ${size * 2.8} ${size * 2.8}`}
      style={{ overflow: "visible", display: "block" }}
      animate={celebrating ? { y: [0, -12, 2, -8, 0], scale: [1, 1.3, 0.95, 1.15, 1] } : { y: [0, -1.5, 0] }}
      transition={celebrating
        ? { duration: 0.6, ease: "easeOut", times: [0, 0.28, 0.5, 0.72, 1] }
        : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
      }
    >
      {glowing && (
        <motion.circle cx="0" cy="0" r={size + 5} fill="none"
          stroke={color} strokeWidth="0.8"
          initial={{ opacity: 0.45 }}
          animate={{ opacity: [0.45, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <circle cx="0" cy="0" r={size + 2} fill={color} opacity="0.12" />
      <circle cx="0" cy="0" r={size} fill={fill} />
      <circle cx="0" cy="0" r={size} fill="none" stroke={color} strokeWidth="1.6" />
      <text x="0" y="0" textAnchor="middle" dominantBaseline="central"
        fill="white" fontSize={fontSize} fontWeight="700"
        fontFamily="Inter, system-ui, sans-serif">
        {label}
      </text>
    </motion.svg>
  );
}

// ── Player config — two teams: blue (home) + red (away, top half) ─────────────
const HOME_PLAYERS = [
  { x: 50, y: 90, dx: 2, dy: 1.5, dur: 4.2, phase: 0.0,  label: "GK",  isGK: true  },
  { x: 18, y: 74, dx: 3, dy: 2.5, dur: 3.6, phase: 0.3,  label: "LB",  isGK: false },
  { x: 36, y: 71, dx: 3, dy: 3.0, dur: 4.0, phase: 0.8,  label: "CB",  isGK: false },
  { x: 64, y: 71, dx: 3, dy: 3.0, dur: 3.8, phase: 1.1,  label: "CB",  isGK: false },
  { x: 82, y: 74, dx: 3, dy: 2.5, dur: 4.3, phase: 0.5,  label: "RB",  isGK: false },
  { x: 26, y: 52, dx: 5, dy: 4.5, dur: 3.2, phase: 0.2,  label: "CM",  isGK: false },
  { x: 50, y: 48, dx: 4, dy: 5.0, dur: 3.5, phase: 0.9,  label: "CM",  isGK: false },
  { x: 74, y: 52, dx: 5, dy: 4.5, dur: 3.0, phase: 0.6,  label: "CM",  isGK: false },
  { x: 22, y: 24, dx: 6, dy: 5.0, dur: 2.8, phase: 0.4,  label: "LW",  isGK: false },
  { x: 50, y: 19, dx: 5, dy: 5.5, dur: 3.1, phase: 1.2,  label: "ST",  isGK: false },
  { x: 78, y: 24, dx: 6, dy: 5.0, dur: 2.9, phase: 0.7,  label: "RW",  isGK: false },
];

const AWAY_PLAYERS = [
  { x: 50, y: 10, dx: 2, dy: 1.5, dur: 4.5, phase: 0.15, label: "GK", isGK: true  },
  { x: 18, y: 26, dx: 3, dy: 2.5, dur: 3.7, phase: 0.4,  label: "LB", isGK: false },
  { x: 36, y: 29, dx: 3, dy: 2.8, dur: 4.1, phase: 0.9,  label: "CB", isGK: false },
  { x: 64, y: 29, dx: 3, dy: 2.8, dur: 3.9, phase: 1.2,  label: "CB", isGK: false },
  { x: 82, y: 26, dx: 3, dy: 2.5, dur: 4.4, phase: 0.6,  label: "RB", isGK: false },
  { x: 26, y: 48, dx: 5, dy: 4.0, dur: 3.3, phase: 0.25, label: "CM", isGK: false },
  { x: 50, y: 52, dx: 4, dy: 4.5, dur: 3.6, phase: 1.0,  label: "CM", isGK: false },
  { x: 74, y: 48, dx: 5, dy: 4.0, dur: 3.1, phase: 0.7,  label: "CM", isGK: false },
  { x: 22, y: 76, dx: 6, dy: 4.5, dur: 2.9, phase: 0.45, label: "LW", isGK: false },
  { x: 50, y: 81, dx: 5, dy: 5.0, dur: 3.2, phase: 1.3,  label: "ST", isGK: false },
  { x: 78, y: 76, dx: 6, dy: 4.5, dur: 3.0, phase: 0.8,  label: "RW", isGK: false },
];

// ── Ball path ─────────────────────────────────────────────────────────────────
const BALL_PATH = [
  [50, 70], [78, 24], [50, 19], [50, 2],    // → TOP GOAL
  [22, 24], [50, 48], [26, 52],
  [50, 70], [18, 74], [50, 90], [82, 74],
  [50, 138],                                  // → BOTTOM GOAL
  [74, 52], [50, 48], [50, 70],
] as [number, number][];

const GOAL_INDICES = new Set([3, 11]);

// ── Ball ──────────────────────────────────────────────────────────────────────
function Ball({ onGoal, lite }: { onGoal: () => void; lite?: boolean }) {
  const [bi, setBi] = useState(0);
  const timerRef  = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const onGoalRef = useRef(onGoal);
  onGoalRef.current = onGoal;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setBi(i => {
        const next = (i + 1) % BALL_PATH.length;
        if (GOAL_INDICES.has(next)) setTimeout(() => onGoalRef.current(), 0);
        return next;
      });
    }, lite ? 2800 : 1800);
    return () => clearInterval(timerRef.current);
  }, [lite]);

  const [bx, by] = BALL_PATH[bi];
  return (
    <motion.div
      animate={{ left: `${bx}%`, top: `${by}%` }}
      transition={lite
        ? { duration: 0.7, ease: "easeOut" }
        : { type: "spring", stiffness: 110, damping: 16 }
      }
      style={{
        position: "absolute",
        transform: "translate(-50%, -50%)",
        width: 8, height: 8,
        borderRadius: "50%",
        background: "radial-gradient(circle at 35% 35%, #ffffff, #d0d0d0)",
        boxShadow: "0 0 8px rgba(255,255,255,0.95), 0 0 20px rgba(255,255,255,0.45), 0 2px 4px rgba(0,0,0,0.5)",
        zIndex: 10,
      }}
    />
  );
}

// ── Running player ────────────────────────────────────────────────────────────
function RunningPlayer({ x, y, dx, dy, dur, phase, label, isGK, celebrating, team, lite }:
  (typeof HOME_PLAYERS)[0] & { celebrating?: boolean; team: "home" | "away"; lite?: boolean }) {

  const color = isGK ? GOLD : team === "home" ? NEON : RED;

  if (lite) {
    return (
      <div
        style={{
          position: "absolute",
          left: `${x}%`, top: `${y}%`,
          transform: "translate(-50%, -50%)",
          zIndex: team === "home" ? 6 : 5,
        }}
      >
        <PlayerMarker color={color} label={label} size={isGK ? 8 : 7} lite />
      </div>
    );
  }

  const kx = [x, x + dx, x, x - dx, x];
  const ky = [y, y + dy * 0.5, y - dy * 0.5, y + dy * 0.3, y];

  return (
    <motion.div
      animate={{ left: kx.map(v => `${v}%`), top: ky.map(v => `${v}%`) }}
      transition={{ duration: dur * 2.5, repeat: Infinity, ease: "easeInOut", delay: phase }}
      style={{
        position: "absolute",
        transform: "translate(-50%, -50%)",
        zIndex: team === "home" ? 6 : 5,
        filter: `drop-shadow(0 0 4px ${color}55)`,
      }}
    >
      <PlayerMarker
        color={color}
        label={label}
        size={isGK ? 8 : 7}
        glowing={isGK}
        celebrating={celebrating}
      />
    </motion.div>
  );
}

// ── GOL overlay ───────────────────────────────────────────────────────────────
function GolOverlay({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1.2, 1.1, 0.6] }}
          transition={{ duration: 2.0, times: [0, 0.15, 0.75, 1], ease: "easeOut" }}
          style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 20, pointerEvents: "none",
          }}
        >
          {/* Background flash */}
          <motion.div
            style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse, rgba(245,166,35,0.15) 0%, transparent 70%)" }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(28px, 14vw, 52px)",
            fontWeight: 900,
            color: GOLD,
            textShadow: `0 0 30px rgba(245,166,35,0.7), 0 0 70px rgba(245,166,35,0.3), 0 2px 10px rgba(0,0,0,0.9)`,
            letterSpacing: "0.14em",
          }}>
            GOL!
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function TacticalPitchScene({ lite = false }: { lite?: boolean }) {
  const [celebrating, setCelebrating] = useState(false);
  const celebTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleGoal = useCallback(() => {
    setCelebrating(true);
    clearTimeout(celebTimerRef.current);
    celebTimerRef.current = setTimeout(() => setCelebrating(false), 2200);
  }, []);

  return (
    <MotionConfig reducedMotion={lite ? "user" : "never"}>
      <div style={{
        position: "relative", width: "100%", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>

        {/* Stadium ambient glow — two colors */}
        <div aria-hidden style={{
          position: "absolute", width: "80%", height: "85%",
          background: "radial-gradient(ellipse at 30% 60%, rgba(91,138,247,0.12) 0%, transparent 55%), radial-gradient(ellipse at 70% 40%, rgba(244,63,94,0.09) 0%, transparent 55%)",
          filter: "blur(30px)", pointerEvents: "none",
        }} />

        {/* Pitch container */}
        <div style={{
          position: "relative",
          width: "100%",
          maxWidth: 360,
          aspectRatio: "100 / 140",
          boxShadow: "0 0 0 1px rgba(91,138,247,0.18), 0 0 50px rgba(91,138,247,0.08), 0 24px 70px rgba(0,0,0,0.75)",
          borderRadius: 6,
          overflow: "hidden",
        }}>
          <PitchSVG />

          {/* Team label — OPP (top) */}
          <div style={{
            position: "absolute", top: 6, left: 8,
            fontSize: 8, fontWeight: 800, letterSpacing: "0.1em",
            color: "rgba(244,63,94,0.7)", textTransform: "uppercase",
            zIndex: 8, pointerEvents: "none",
          }}>OPP</div>

          {/* Team label — YOU (bottom) */}
          <div style={{
            position: "absolute", bottom: 6, left: 8,
            fontSize: 8, fontWeight: 800, letterSpacing: "0.1em",
            color: "rgba(91,138,247,0.7)", textTransform: "uppercase",
            zIndex: 8, pointerEvents: "none",
          }}>YOU</div>

          {/* Away team (top half, red) */}
          {AWAY_PLAYERS.map((p, i) => (
            <RunningPlayer key={`away-${i}`} {...p} celebrating={celebrating} team="away" lite={lite} />
          ))}

          {/* Home team (bottom half, blue) */}
          {HOME_PLAYERS.map((p, i) => (
            <RunningPlayer key={`home-${i}`} {...p} celebrating={celebrating} team="home" lite={lite} />
          ))}

          {/* Ball */}
          <Ball onGoal={handleGoal} lite={lite} />

          {/* GOL celebration */}
          <GolOverlay visible={celebrating} />
        </div>
      </div>
    </MotionConfig>
  );
}
