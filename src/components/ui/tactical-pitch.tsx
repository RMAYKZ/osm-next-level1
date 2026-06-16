import { useCallback, useEffect, useRef, useState } from "react";
import { motion, MotionConfig } from "framer-motion";

const NEON   = "#5b8af7";
const NEON_G = "rgba(91,138,247,0.4)";

// ── Pitch SVG ─────────────────────────────────────────────────────────────────
function PitchSVG() {
  const stripes = Array.from({ length: 10 });
  return (
    <svg viewBox="0 0 100 140" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
      <defs>
        <clipPath id="pc"><rect x="1.5" y="1.5" width="97" height="137" rx="3" /></clipPath>
        <radialGradient id="pg" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#1a6b30" />
          <stop offset="40%" stopColor="#145425" />
          <stop offset="100%" stopColor="#0a3016" />
        </radialGradient>
        <radialGradient id="spotlight" cx="50%" cy="30%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <radialGradient id="vign" cx="50%" cy="50%" r="70%">
          <stop offset="60%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.35)" />
        </radialGradient>
        <filter id="glow-line">
          <feGaussianBlur stdDeviation="0.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Grass base */}
      <rect x="1.5" y="1.5" width="97" height="137" rx="3" fill="url(#pg)" />

      {/* Alternating lawn stripes */}
      {stripes.map((_, i) => (
        <rect key={i} x="1.5" y={1.5 + i * 13.7} width="97" height="6.85"
          fill={i % 2 === 0 ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.05)"}
          clipPath="url(#pc)" />
      ))}

      {/* Stadium spotlight overlay */}
      <rect x="1.5" y="1.5" width="97" height="137" rx="3" fill="url(#spotlight)" clipPath="url(#pc)" />

      {/* Pitch boundary — bright white with glow */}
      <rect x="3" y="3" width="94" height="134" rx="2" fill="none"
        stroke="rgba(255,255,255,0.85)" strokeWidth="0.7" filter="url(#glow-line)" />
      <rect x="3" y="3" width="94" height="134" rx="2" fill="none"
        stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />

      {/* Halfway line */}
      <line x1="3" y1="70" x2="97" y2="70" stroke="rgba(255,255,255,0.8)" strokeWidth="0.55" />

      {/* Center circle */}
      <circle cx="50" cy="70" r="12" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.55" />
      <circle cx="50" cy="70" r="1.2" fill="rgba(255,255,255,0.95)" />

      {/* Attack penalty area (top) */}
      <rect x="22" y="3" width="56" height="20" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.75)" strokeWidth="0.5" />
      {/* Attack 6-yard box */}
      <rect x="34" y="3" width="32" height="8" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
      {/* Attack penalty spot */}
      <circle cx="50" cy="16" r="0.85" fill="rgba(255,255,255,0.9)" />
      {/* Attack penalty arc */}
      <path d="M 36 23 A 10 10 0 0 0 64 23" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="0.45" />
      {/* Attack goal net */}
      <rect x="38" y="1" width="24" height="3.5" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.55)" strokeWidth="0.55" />

      {/* Defense penalty area (bottom) */}
      <rect x="22" y="117" width="56" height="20" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.75)" strokeWidth="0.5" />
      {/* Defense 6-yard box */}
      <rect x="34" y="129" width="32" height="8" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
      {/* Defense penalty spot */}
      <circle cx="50" cy="124" r="0.85" fill="rgba(255,255,255,0.9)" />
      {/* Defense penalty arc */}
      <path d="M 36 117 A 10 10 0 0 1 64 117" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="0.45" />
      {/* Defense goal net */}
      <rect x="38" y="135.5" width="24" height="3.5" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.55)" strokeWidth="0.55" />

      {/* Corner arcs */}
      <path d="M 3 9 A 6 6 0 0 0 9 3" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="0.45" />
      <path d="M 91 3 A 6 6 0 0 0 97 9" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="0.45" />
      <path d="M 3 131 A 6 6 0 0 1 9 137" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="0.45" />
      <path d="M 91 137 A 6 6 0 0 1 97 131" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="0.45" />

      {/* Corner flags (dots) */}
      <circle cx="3" cy="3" r="1.2" fill="rgba(245,166,35,0.9)" />
      <circle cx="97" cy="3" r="1.2" fill="rgba(245,166,35,0.9)" />
      <circle cx="3" cy="137" r="1.2" fill="rgba(245,166,35,0.9)" />
      <circle cx="97" cy="137" r="1.2" fill="rgba(245,166,35,0.9)" />

      {/* Depth vignette */}
      <rect x="1.5" y="1.5" width="97" height="137" rx="3" fill="url(#vign)" clipPath="url(#pc)" />
    </svg>
  );
}

// ── Stick figure ─────────────────────────────────────────────────────────────
interface StickProps { color: string; phase: number; speed: number; celebrating?: boolean }

function StickFigure({ color, phase, speed, celebrating }: StickProps) {
  const dur = speed * 0.4;
  return (
    <motion.svg
      width="16" height="26"
      viewBox="-8 -20 16 26"
      style={{ overflow: "visible", display: "block" }}
      animate={celebrating
        ? { y: [0, -14, 2, -9, 0], scale: [1, 1.25, 0.95, 1.15, 1] }
        : { y: [0, -2.5, 0] }
      }
      transition={celebrating
        ? { duration: 0.65, ease: "easeOut", times: [0, 0.28, 0.5, 0.72, 1] }
        : { duration: dur, repeat: Infinity, ease: "easeInOut", delay: phase }
      }
    >
      {/* Soft glow */}
      <circle cx="0" cy="-15" r="6" fill={color} opacity="0.1" />

      {/* Head */}
      <circle cx="0" cy="-15" r="3" fill={color} />

      {/* Body */}
      <line x1="0" y1="-12" x2="0" y2="-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />

      {/* Left arm */}
      <motion.g
        style={{ originX: "0px", originY: "-10px" }}
        animate={{ rotate: [-25, 25, -25] }}
        transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay: phase }}
      >
        <line x1="0" y1="-10" x2="-5" y2="-7" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      </motion.g>

      {/* Right arm — opposite phase */}
      <motion.g
        style={{ originX: "0px", originY: "-10px" }}
        animate={{ rotate: [25, -25, 25] }}
        transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay: phase }}
      >
        <line x1="0" y1="-10" x2="5" y2="-7" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      </motion.g>

      {/* Left leg */}
      <motion.g
        style={{ originX: "0px", originY: "-5px" }}
        animate={{ rotate: [30, -20, 30] }}
        transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay: phase }}
      >
        <line x1="0" y1="-5" x2="-3.5" y2="4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>

      {/* Right leg — opposite phase */}
      <motion.g
        style={{ originX: "0px", originY: "-5px" }}
        animate={{ rotate: [-20, 30, -20] }}
        transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay: phase }}
      >
        <line x1="0" y1="-5" x2="3.5" y2="4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>
    </motion.svg>
  );
}

// ── Player config ─────────────────────────────────────────────────────────────
const PLAYERS = [
  { x: 50, y: 88, dx:  3, dy: 1.5, dur: 4.2, phase: 0.0,  isGK: true  },
  { x: 18, y: 72, dx:  4, dy: 3.0, dur: 3.6, phase: 0.3,  isGK: false },
  { x: 36, y: 70, dx:  3, dy: 3.5, dur: 4.0, phase: 0.8,  isGK: false },
  { x: 64, y: 70, dx:  3, dy: 3.5, dur: 3.8, phase: 1.1,  isGK: false },
  { x: 82, y: 72, dx:  4, dy: 3.0, dur: 4.3, phase: 0.5,  isGK: false },
  { x: 26, y: 50, dx:  6, dy: 5.0, dur: 3.2, phase: 0.2,  isGK: false },
  { x: 50, y: 47, dx:  5, dy: 5.5, dur: 3.5, phase: 0.9,  isGK: false },
  { x: 74, y: 50, dx:  6, dy: 5.0, dur: 3.0, phase: 0.6,  isGK: false },
  { x: 24, y: 23, dx:  7, dy: 5.5, dur: 2.8, phase: 0.4,  isGK: false },
  { x: 50, y: 19, dx:  6, dy: 6.0, dur: 3.1, phase: 1.2,  isGK: false },
  { x: 76, y: 23, dx:  7, dy: 5.5, dur: 2.9, phase: 0.7,  isGK: false },
];

// ── Ball path — includes two goal positions ───────────────────────────────────
// Index 3 = top goal, index 11 = bottom goal
const BALL_PATH = [
  [50, 71], [76, 23], [50, 19], [50, 3],   // → TOP GOAL  (idx 3)
  [24, 23], [50, 47], [26, 50],
  [50, 71], [18, 72], [50, 88], [82, 72],
  [50, 137],                                 // → BOTTOM GOAL (idx 11)
  [74, 50], [50, 47], [50, 71],
] as [number, number][];

const GOAL_INDICES = new Set([3, 11]);

// ── Ball ──────────────────────────────────────────────────────────────────────
function Ball({ onGoal }: { onGoal: () => void }) {
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
    }, 1800);
    return () => clearInterval(timerRef.current);
  }, []);

  const [bx, by] = BALL_PATH[bi];
  return (
    <motion.div
      animate={{ left: `${bx}%`, top: `${by}%` }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      style={{
        position: "absolute",
        transform: "translate(-50%, -50%)",
        width: 7, height: 7,
        borderRadius: "50%",
        background: "#fff",
        boxShadow: "0 0 6px rgba(255,255,255,0.9), 0 0 16px rgba(255,255,255,0.4)",
        zIndex: 10,
      }}
    />
  );
}

// ── Running player ────────────────────────────────────────────────────────────
function RunningPlayer({ x, y, dx, dy, dur, phase, isGK, celebrating }:
  typeof PLAYERS[0] & { celebrating?: boolean }) {

  const color = isGK ? "#f5a623" : NEON;
  const kx = [x, x + dx, x, x - dx, x];
  const ky = [y, y + dy * 0.5, y - dy * 0.5, y + dy * 0.3, y];

  return (
    <motion.div
      animate={{ left: kx.map(v => `${v}%`), top: ky.map(v => `${v}%`) }}
      transition={{ duration: dur * 2.5, repeat: Infinity, ease: "easeInOut", delay: phase }}
      style={{
        position: "absolute",
        transform: "translate(-50%, -100%)",
        zIndex: 5,
        filter: isGK ? "none" : `drop-shadow(0 0 4px ${NEON_G})`,
      }}
    >
      <StickFigure color={color} phase={phase} speed={dur} celebrating={celebrating} />
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function TacticalPitchScene() {
  const [celebrating, setCelebrating] = useState(false);
  const celebTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleGoal = useCallback(() => {
    setCelebrating(true);
    clearTimeout(celebTimerRef.current);
    celebTimerRef.current = setTimeout(() => setCelebrating(false), 2200);
  }, []);

  return (
    // Override parent MotionConfig so pitch animations always run (mobile safe: transforms only)
    <MotionConfig reducedMotion="never">
      <div style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {/* Ambient pitch glow */}
        <div aria-hidden style={{
          position: "absolute",
          width: "70%", height: "80%",
          background: `radial-gradient(ellipse, rgba(20,100,40,0.25) 0%, transparent 65%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }} />

        {/* Pitch */}
        <div style={{
          position: "relative",
          width: "100%",
          maxWidth: 360,
          aspectRatio: "100 / 140",
          boxShadow: `0 0 0 1px rgba(91,138,247,0.2), 0 0 40px rgba(91,138,247,0.06), 0 20px 60px rgba(0,0,0,0.7)`,
          borderRadius: 6,
        }}>
          <PitchSVG />

          {/* GOL! celebration overlay */}
          {celebrating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.15, 1.05, 0.7] }}
              transition={{ duration: 2.0, times: [0, 0.18, 0.72, 1], ease: "easeOut" }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 20,
                pointerEvents: "none",
              }}
            >
              <span style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(24px, 12vw, 44px)",
                fontWeight: 900,
                color: "#f5a623",
                textShadow: `0 0 24px rgba(245,166,35,0.6), 0 0 60px rgba(245,166,35,0.2), 0 2px 8px rgba(0,0,0,0.8)`,
                letterSpacing: "0.12em",
              }}>
                GOL!
              </span>
            </motion.div>
          )}

          {/* Players */}
          {PLAYERS.map((p, i) => (
            <RunningPlayer key={i} {...p} celebrating={celebrating} />
          ))}

          {/* Ball */}
          <Ball onGoal={handleGoal} />
        </div>
      </div>
    </MotionConfig>
  );
}
