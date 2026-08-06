import { useEffect, useState } from "react";
import { motion, animate, useMotionValue, useReducedMotion } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";

const EASE = [0.16, 1, 0.3, 1] as const;

const TACTICS = [
  { opp: "4-3-3",   rec: "5-2-3 A",  win: 92 },
  { opp: "5-2-3",   rec: "5-2-3 A",  win: 88 },
  { opp: "4-4-2",   rec: "4-5-1",    win: 83 },
  { opp: "4-2-3-1", rec: "5-2-3 B",  win: 85 },
  { opp: "6-3-1",   rec: "4-3-3 A",  win: 79 },
];

const R = 72;
const CIRC = 2 * Math.PI * R;
const TICKS = 24;

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

// ── Radial gauge — real proportion chart (stroke-dashoffset), not decoration ──
function WinGauge({ percent, size }: { percent: number; size: number }) {
  const { t } = useLang();
  const offset = CIRC - (percent / 100) * CIRC;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {/* Slow rotating scanner glow behind the dial — pure CSS, no JS animation loop */}
      <div aria-hidden style={{
        position: "absolute", inset: -14,
        borderRadius: "50%",
        background: "conic-gradient(from 0deg, transparent 0%, rgba(239,68,68,0.22) 8%, transparent 18%, transparent 100%)",
        animation: "hp-scan-spin 4.5s linear infinite",
      }} />

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "relative", transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="hp-gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#ef4444" />
            <stop offset="55%"  stopColor="#f97316" />
            <stop offset="100%" stopColor="#67e8f9" />
          </linearGradient>
        </defs>

        {/* Tick marks — instrument-dial detail */}
        {Array.from({ length: TICKS }).map((_, i) => {
          const angle = (i / TICKS) * 2 * Math.PI;
          const inner = R + 9;
          const outer = R + 13;
          const x1 = cx + Math.cos(angle) * inner;
          const y1 = cy + Math.sin(angle) * inner;
          const x2 = cx + Math.cos(angle) * outer;
          const y2 = cy + Math.sin(angle) * outer;
          const lit = i / TICKS <= percent / 100;
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={lit ? "rgba(249,115,22,0.55)" : "rgba(255,255,255,0.08)"}
              strokeWidth={1.5} strokeLinecap="round" />
          );
        })}

        {/* Track */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={7} />

        {/* Progress arc */}
        <circle
          cx={cx} cy={cy} r={R} fill="none"
          stroke="url(#hp-gauge-grad)" strokeWidth={7} strokeLinecap="round"
          strokeDasharray={CIRC} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>

      {/* Center readout */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontFamily: "'Bebas Neue', 'Outfit', sans-serif", fontSize: size * 0.26, lineHeight: 1, color: "#ffffff", letterSpacing: "0.01em" }}>
          <CountUp value={percent} suffix="%" />
        </div>
        <div style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginTop: 3 }}>
          {t("hp.winRate")}
        </div>
      </div>
    </div>
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
  const gaugeSize = lite ? 168 : 200;

  return (
    <div style={{ width: "100%" }}>
      <style>{`
        @keyframes hp-scan-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .hp-scan-glow { animation: none !important; }
        }
      `}</style>

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

        {/* Gauge centerpiece */}
        <div style={{ display: "flex", justifyContent: "center", padding: lite ? "14px 0 6px" : "18px 0 8px" }}>
          <WinGauge percent={mounted ? current.win : 0} size={gaugeSize} />
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
