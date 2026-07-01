import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

const TACTICS = [
  { opp: "4-3-3",   rec: "5-2-3 A",  win: 92 },
  { opp: "5-2-3",   rec: "5-2-3 A",  win: 88 },
  { opp: "4-4-2",   rec: "4-5-1",    win: 83 },
  { opp: "4-2-3-1", rec: "5-2-3 B",  win: 85 },
  { opp: "6-3-1",   rec: "4-3-3 A",  win: 79 },
];

export default function HeroPanel({ lite = false }: { lite?: boolean }) {
  const [active, setActive]   = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setActive(a => (a + 1) % TACTICS.length), 2400);
    return () => clearInterval(id);
  }, []);

  const CARD: React.CSSProperties = {
    position: "relative",
    width: "100%",
    background: "rgba(5,2,2,0.92)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 16,
    overflow: "hidden",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 0 40px rgba(239,68,68,0.06), inset 0 1px 0 rgba(239,68,68,0.12)",
  };

  return (
    <div style={CARD}>
      {/* Top glow line */}
      <div aria-hidden style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent 5%, rgba(239,68,68,0.7) 40%, rgba(249,115,22,0.5) 70%, transparent 95%)",
        zIndex: 1,
      }} />

      {/* Background radial glow */}
      <div aria-hidden style={{
        position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)",
        width: "120%", height: "60%",
        background: "radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "14px 18px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        position: "relative", zIndex: 1,
      }}>
        <motion.span
          animate={{ opacity: [1, 0.25, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", flexShrink: 0, boxShadow: "0 0 10px rgba(239,68,68,0.8)" }}
        />
        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", color: "#ef4444", textTransform: "uppercase" }}>
          LIVE COUNTER
        </span>
        <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.08em" }}>
          16 YR DATA
        </span>
      </div>

      {/* Tactic rows */}
      <div style={{ padding: "8px 18px 4px", position: "relative", zIndex: 1 }}>
        {TACTICS.map((t, i) => (
          <motion.div
            key={t.opp}
            animate={{ background: active === i ? "rgba(239,68,68,0.05)" : "rgba(0,0,0,0)" }}
            transition={{ duration: 0.35 }}
            style={{
              padding: "9px 0",
              borderBottom: i < TACTICS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              borderRadius: 6,
              paddingLeft: active === i ? 6 : 0,
              paddingRight: active === i ? 6 : 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <span style={{
                fontFamily: "'Barlow Condensed', 'Outfit', sans-serif",
                fontSize: 13, fontWeight: 700,
                color: active === i ? "#f87171" : "rgba(255,255,255,0.45)",
                width: 54, flexShrink: 0,
                transition: "color 0.3s",
              }}>{t.opp}</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ flexShrink: 0, opacity: 0.25 }}>
                <path d="M0 4h9M7 1l3 3-3 3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{
                fontFamily: "'Barlow Condensed', 'Outfit', sans-serif",
                fontSize: 12, fontWeight: 600, flex: 1,
                color: active === i ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)",
                transition: "color 0.3s",
              }}>{t.rec}</span>
              <span style={{
                fontFamily: "'Bebas Neue', 'Outfit', sans-serif",
                fontSize: 18, fontWeight: 400, letterSpacing: "0.03em",
                color: active === i ? "#ef4444" : "rgba(255,255,255,0.3)",
                transition: "color 0.3s", flexShrink: 0,
              }}>{t.win}%</span>
            </div>
            <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
              {mounted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${t.win}%` }}
                  transition={{ duration: 0.9, delay: 0.2 + i * 0.08, ease: EASE }}
                  style={{
                    height: "100%", borderRadius: 2,
                    background: active === i
                      ? "linear-gradient(90deg, #ef4444 0%, #f97316 100%)"
                      : "rgba(255,255,255,0.14)",
                    transition: "background 0.3s",
                  }}
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer stats */}
      <div style={{
        display: "flex",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        marginTop: 4,
        position: "relative", zIndex: 1,
      }}>
        {[
          { val: "100+", lbl: "Taktik" },
          { val: "16",   lbl: "Yıl" },
          { val: "96%",  lbl: "Win Rate" },
        ].map((s, i) => (
          <div key={s.lbl} style={{
            flex: 1, textAlign: "center",
            padding: "12px 0 14px",
            borderRight: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
          }}>
            <div style={{
              fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
              fontSize: lite ? 22 : 26, fontWeight: 400, letterSpacing: "0.04em",
              color: "#ef4444", lineHeight: 1,
            }}>{s.val}</div>
            <div style={{
              fontSize: 8, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginTop: 4,
            }}>{s.lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
