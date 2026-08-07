import { useEffect, useMemo, useRef, useState } from "react";
import { motion, animate, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";

const EASE = [0.16, 1, 0.3, 1] as const;

const TACTICS = [
  { opp: "4-3-3",   rec: "5-2-3 A",  win: 92 },
  { opp: "5-2-3",   rec: "5-2-3 A",  win: 88 },
  { opp: "4-4-2",   rec: "4-5-1",    win: 83 },
  { opp: "4-2-3-1", rec: "5-2-3 B",  win: 85 },
  { opp: "6-3-1",   rec: "4-3-3 A",  win: 79 },
];

// ── Count-up number — re-ticks whenever `value` changes, honours reduced motion ──
function CountUp({ value, suffix = "", duration = 0.9 }: { value: number; suffix?: string; duration?: number }) {
  const reduceMotion = useReducedMotion();
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) { setDisplay(value); return; }
    const controls = animate(mv, value, { duration, ease: EASE, onUpdate: (v) => setDisplay(Math.round(v)) });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduceMotion]);

  return <>{display}{suffix}</>;
}

// ── Signal chart — animated analysis waveform, not a decorative spinner ──────
// Each matchup gets its own smooth curve (seeded by index + win%), the line
// morphs between them, and a comet-style dot continuously rides the path —
// reads as "live data feed" rather than a looping gauge animation.
const CHART_W = 100;
const CHART_H = 40;
const N_POINTS = 22;

function buildSignalPoints(seed: number, winPct: number): { x: number; y: number }[] {
  const bias = winPct / 100;
  const baseline = CHART_H - 7;
  const amplitude = CHART_H - 14;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < N_POINTS; i++) {
    const t = i / (N_POINTS - 1);
    const wave =
      Math.sin(t * Math.PI * 2.4 + seed * 2.1) * 0.5 +
      Math.sin(t * Math.PI * 5.2 + seed * 4.3) * 0.18;
    const y = baseline - amplitude * (bias * 0.5 + 0.22 + wave * 0.24);
    pts.push({ x: t * CHART_W, y: Math.max(3, Math.min(CHART_H - 3, y)) });
  }
  return pts;
}

// Catmull-Rom → cubic Bézier, fixed point count in ⇒ identical "M…C…C…" command
// structure out, so Framer Motion can interpolate the raw `d` string smoothly.
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

function LiveSignalChart({ seed, winPct, height }: { seed: number; winPct: number; height: number }) {
  const reduceMotion = useReducedMotion();
  const pathRef = useRef<SVGPathElement>(null);
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);

  const linePath = useMemo(() => smoothPath(buildSignalPoints(seed, winPct)), [seed, winPct]);
  const areaPath = `${linePath} L ${CHART_W} ${CHART_H} L 0 ${CHART_H} Z`;

  useAnimationFrame((elapsed) => {
    if (reduceMotion) return;
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    if (!len) return;
    const progress = (elapsed * 0.00022) % 1;
    const pt = path.getPointAtLength(progress * len);
    cx.set(pt.x);
    cy.set(pt.y);
  });

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id="hp-signal-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="55%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
        <linearGradient id="hp-signal-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="hp-signal-glow">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Data-terminal grid */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={0} y1={CHART_H * f} x2={CHART_W} y2={CHART_H * f} stroke="rgba(255,255,255,0.05)" strokeWidth={0.4} />
      ))}

      {/* Area fill under the curve */}
      <motion.path
        fill="url(#hp-signal-fill)"
        initial={{ d: areaPath, opacity: 0 }}
        animate={{ d: areaPath, opacity: 1 }}
        transition={{ d: { duration: 0.9, ease: EASE }, opacity: { duration: 0.6 } }}
      />

      {/* Signal line — morphs smoothly between matchups */}
      <motion.path
        ref={pathRef}
        fill="none"
        stroke="url(#hp-signal-stroke)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ d: linePath, opacity: 0 }}
        animate={{ d: linePath, opacity: 1 }}
        transition={{ d: { duration: 0.9, ease: EASE }, opacity: { duration: 0.6 } }}
      />

      {/* Comet — continuously rides the current signal path */}
      {!reduceMotion && (
        <>
          <motion.circle r={5.5} fill="url(#hp-signal-glow)" style={{ cx, cy }} />
          <motion.circle r={1.4} fill="#ffffff" style={{ cx, cy }} />
        </>
      )}
    </svg>
  );
}

export default function HeroPanel({ lite = false }: { lite?: boolean }) {
  const { t } = useLang();
  const [active, setActive]   = useState(0);
  const [rowVisible, setRowVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => {
      setRowVisible(false);
      setTimeout(() => {
        setActive(a => (a + 1) % TACTICS.length);
        setRowVisible(true);
      }, 260);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const current = TACTICS[active];
  const chartHeight = lite ? 60 : 74;

  return (
    <div style={{ width: "100%" }}>
      <div style={{
        position: "relative",
        borderRadius: 18,
        border: "1px solid rgba(239,68,68,0.24)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 10px -4px rgba(0,0,0,0.6)",
        background: "linear-gradient(165deg, rgba(11,6,6,0.96) 0%, rgba(6,4,5,0.98) 55%, rgba(8,10,12,0.97) 100%)",
        overflow: "hidden",
      }}>
        {/* Top hairline */}
        <div aria-hidden style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent 4%, rgba(239,68,68,0.75) 38%, rgba(249,115,22,0.55) 62%, rgba(34,211,238,0.55) 88%, transparent 98%)",
        }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px 0" }}>
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 6px #ef4444", flexShrink: 0 }}
          />
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: "#f87171", textTransform: "uppercase" }}>
            {t("hp.liveTitle")}
          </span>
        </div>

        {/* KPI + signal chart */}
        <div style={{ padding: lite ? "14px 16px 4px" : "18px 16px 6px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: "'Bebas Neue', 'Outfit', sans-serif", fontSize: lite ? 32 : 38, lineHeight: 1, color: "#ffffff", letterSpacing: "0.01em" }}>
              <CountUp value={mounted ? current.win : 0} suffix="%" />
            </span>
            <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
              {t("hp.winRate")}
            </span>
          </div>
          <div style={{ marginTop: lite ? 8 : 10 }}>
            <LiveSignalChart seed={active} winPct={mounted ? current.win : 0} height={chartHeight} />
          </div>
        </div>

        {/* Matchup readout */}
        <div style={{ padding: "0 16px 14px" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 20,
            opacity: rowVisible ? 1 : 0,
            transform: rowVisible ? "translateY(0)" : "translateY(6px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}>
            <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
              vs
            </span>
            <span style={{ fontFamily: "'Barlow Condensed', 'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.65)" }}>
              {current.opp}
            </span>
            <svg width="11" height="8" viewBox="0 0 12 8" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}>
              <path d="M0 4h9M7 1l3 3-3 3" stroke="#67e8f9" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontFamily: "'Barlow Condensed', 'Outfit', sans-serif", fontSize: 14, fontWeight: 800, color: "#ffffff" }}>
              {current.rec}
            </span>
          </div>

          {/* Progress dots — which matchup we're on */}
          <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
            {TACTICS.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 2, borderRadius: 2,
                background: i === active ? "linear-gradient(90deg,#ef4444,#67e8f9)" : "rgba(255,255,255,0.12)",
                transition: "background 0.35s",
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer stats strip — below the frame */}
      <div style={{
        display: "flex",
        marginTop: 10,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.02)",
      }}>
        {[
          { val: 100, suffix: "+", lbl: t("hp.statTactics") },
          { val: 16,  suffix: "",  lbl: t("hp.statYears") },
          { val: 96,  suffix: "%", lbl: t("hp.winRate") },
        ].map((s, i) => (
          <div key={s.lbl} style={{ flex: 1, position: "relative", textAlign: "center", padding: "10px 0 12px" }}>
            {i < 2 && (
              <div aria-hidden style={{
                position: "absolute", top: "18%", bottom: "18%", right: 0, width: 1,
                background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.1), transparent)",
              }} />
            )}
            <div style={{
              fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
              fontSize: lite ? 20 : 23, fontWeight: 400, letterSpacing: "0.04em",
              color: "#ef4444", lineHeight: 1,
            }}>
              {mounted ? <CountUp value={s.val} suffix={s.suffix} duration={1.1} /> : `0${s.suffix}`}
            </div>
            <div style={{
              fontSize: 8, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginTop: 3,
            }}>{s.lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
