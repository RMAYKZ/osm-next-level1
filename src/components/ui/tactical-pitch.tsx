import { useCallback, useEffect, useRef, useState } from "react";
import { motion, MotionConfig } from "framer-motion";

const NEON   = "oklch(0.87 0.27 152)";
const NEON_G = "oklch(0.87 0.27 152 / 0.4)";
const NEON_D = "oklch(0.87 0.27 152 / 0.15)";

// ── Pitch SVG ─────────────────────────────────────────────────────────────────
function PitchSVG() {
  const stripes = Array.from({ length: 9 });
  return (
    <svg viewBox="0 0 100 140" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
      <defs>
        <clipPath id="pc"><rect x="2" y="2" width="96" height="136" rx="4" /></clipPath>
        <filter id="lg"><feGaussianBlur stdDeviation="0.3" /></filter>
        <radialGradient id="pg" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#0a1f0e" />
          <stop offset="100%" stopColor="#061208" />
        </radialGradient>
      </defs>

      <rect x="2" y="2" width="96" height="136" rx="4" fill="url(#pg)" />

      {stripes.map((_, i) => (
        <rect key={i} x="2" y={2 + i * 15.2} width="96" height="7.6"
          fill="#0c2410" clipPath="url(#pc)" opacity="0.55" />
      ))}

      <rect x="2" y="2" width="96" height="136" rx="4" fill="none"
        stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" />

      <line x1="2" y1="71" x2="98" y2="71" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
      <circle cx="50" cy="71" r="12" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
      <circle cx="50" cy="71" r="1.1" fill="rgba(255,255,255,0.3)" />

      <rect x="19" y="2" width="62" height="22" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
      <rect x="32" y="2" width="36" height="8" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" />
      <circle cx="50" cy="15" r="1" fill="rgba(255,255,255,0.18)" />
      <path d="M 34 24 A 12 12 0 0 0 66 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" />

      <rect x="19" y="116" width="62" height="22" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
      <rect x="32" y="130" width="36" height="8" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" />
      <circle cx="50" cy="125" r="1" fill="rgba(255,255,255,0.18)" />
      <path d="M 34 116 A 12 12 0 0 1 66 116" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" />

      <path d="M 2 6 A 4 4 0 0 1 6 2" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" />
      <path d="M 94 6 A 4 4 0 0 0 98 2" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" />
      <path d="M 2 136 A 4 4 0 0 0 6 138" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" />
      <path d="M 94 136 A 4 4 0 0 1 98 138" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" />

      <rect x="36" y="0" width="28" height="3.5" rx="0.5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.7" />
      <rect x="36" y="136.5" width="28" height="3.5" rx="0.5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.7" />
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
        if (GOAL_INDICES.has(next)) onGoalRef.current();
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

  const color = isGK ? "rgba(255,255,255,0.9)" : NEON;
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
          background: `radial-gradient(ellipse, oklch(0.87 0.27 152 / 0.07) 0%, transparent 65%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }} />

        {/* Pitch */}
        <div style={{
          position: "relative",
          width: "100%",
          maxWidth: 360,
          aspectRatio: "100 / 140",
          boxShadow: `0 0 0 1px ${NEON_D}, 0 20px 60px rgba(0,0,0,0.7)`,
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
                color: NEON,
                textShadow: `0 0 24px ${NEON_G}, 0 0 60px ${NEON_D}, 0 2px 8px rgba(0,0,0,0.8)`,
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
