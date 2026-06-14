import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { getLocalizedPremiumTactics, siteConfig, type PremiumTactic } from "../data/extras";
import { usePremium } from "../contexts/PremiumContext";
import { useLang } from "../contexts/LanguageContext";

const EASE = [0.16, 1, 0.3, 1] as const;

const TAKEN_MSG: Record<string, string> = {
  tr: "Bu kod başka bir cihazda kullanıldı.",
  en: "This code is already active on another device.",
  hu: "Ez a kód már egy másik eszközön aktív.",
  ar: "هذا الرمز مُفعَّل بالفعل على جهاز آخر.",
  pt: "Este código já está ativo em outro dispositivo.",
};

// ── Color palette per location ───────────────────────────────────────
const LOC_STYLE = {
  home: {
    primary: "#f59e0b",
    secondary: "#ef4444",
    dim: "rgba(245,158,11,0.09)",
    border: "rgba(245,158,11,0.22)",
    glow: "rgba(245,158,11,0.14)",
    label: "Ev",
    icon: "🏠",
    styleColor: "#ef4444",
  },
  away: {
    primary: "#38bdf8",
    secondary: "#818cf8",
    dim: "rgba(56,189,248,0.09)",
    border: "rgba(56,189,248,0.22)",
    glow: "rgba(56,189,248,0.12)",
    label: "Deplasman",
    icon: "✈️",
    styleColor: "#818cf8",
  },
};

// ── Formation dot grid ───────────────────────────────────────────────
function FormationDots({ formation, color }: { formation: string; color: string }) {
  const nums = formation.split(" ")[0].split("-").map(Number).reverse();
  const maxInRow = Math.max(...nums);
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      padding: "10px 14px",
      background: "rgba(0,0,0,0.32)",
      borderRadius: 12,
      border: `1px solid ${color}33`,
      minWidth: 68,
    }}>
      {nums.map((count, ri) => (
        <div key={ri} style={{
          display: "flex", gap: 5, justifyContent: "center",
          width: maxInRow * 13,
        }}>
          {Array.from({ length: count }).map((_, di) => (
            <motion.div
              key={di}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 + ri * 0.06 + di * 0.025, duration: 0.28, ease: EASE }}
              style={{
                width: 8, height: 8, borderRadius: "50%",
                background: ri === nums.length - 1
                  ? color
                  : ri === 0 ? `${color}44` : `${color}88`,
                boxShadow: ri === nums.length - 1 ? `0 0 7px ${color}99` : "none",
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Animated number counter ──────────────────────────────────────────
function AnimNum({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const dur = 950;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to]);

  return <span ref={ref}>{val}</span>;
}

// ── Single slider stat row ───────────────────────────────────────────
function Slider({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{
          fontSize: 9, fontWeight: 800, textTransform: "uppercase",
          letterSpacing: "0.14em", color: "rgba(148,163,184,0.5)",
        }}>
          {label}
        </span>
        <span style={{
          fontSize: 26, fontWeight: 900, lineHeight: 1,
          color, letterSpacing: "-0.03em",
          fontFamily: "'Barlow Condensed', sans-serif",
        }}>
          <AnimNum to={value} />
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.15 }}
          style={{
            height: "100%", borderRadius: 99,
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            boxShadow: `0 0 10px ${color}55`,
          }}
        />
      </div>
    </div>
  );
}

// ── Line instruction cell ────────────────────────────────────────────
function LineCell({ role, value, icon }: { role: string; value: string; icon: string }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", gap: 3,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 10, padding: "8px 10px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 10 }}>{icon}</span>
        <span style={{
          fontSize: 8, fontWeight: 800, textTransform: "uppercase",
          letterSpacing: "0.13em", color: "rgba(148,163,184,0.4)",
        }}>
          {role}
        </span>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#d1d5db", lineHeight: 1.35 }}>
        {value}
      </span>
    </div>
  );
}

// ── Individual tactic card ───────────────────────────────────────────
function TacticCard({ tactic, index, isLocked, lockedLabel }: {
  tactic: PremiumTactic;
  index: number;
  isLocked: boolean;
  lockedLabel: string;
}) {
  const loc = LOC_STYLE[tactic.location];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: EASE }}
      whileHover={isLocked ? {} : { y: -5, transition: { duration: 0.2 } }}
      style={{
        position: "relative", overflow: "hidden",
        background: `linear-gradient(145deg, rgba(6,8,24,0.95) 0%, ${loc.dim} 100%)`,
        border: `1px solid ${loc.border}`,
        borderRadius: 18,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      {/* Lock overlay — lives INSIDE the card so overflow:hidden clips it correctly */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            key="lock"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "absolute", inset: 0, zIndex: 20,
              background: "rgba(4,6,20,0.55)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 10,
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.3 }}
              style={{ fontSize: 34 }}
            >🔒</motion.span>
            <span style={{
              fontSize: 9.5, fontWeight: 900, textTransform: "uppercase",
              letterSpacing: "0.18em", color: "rgba(251,191,36,0.65)",
            }}>
              {lockedLabel}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Corner glow */}
      <div style={{
        position: "absolute", top: -40, right: -40, width: 140, height: 140,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${loc.glow} 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Shimmer sweep */}
      <motion.div
        animate={{ x: ["-110%", "210%"] }}
        transition={{ repeat: Infinity, repeatDelay: 6 + index * 1.5, duration: 1, ease: "easeInOut" }}
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `linear-gradient(110deg, transparent 30%, ${loc.glow} 50%, transparent 70%)`,
          transform: "skewX(-12deg)",
        }}
      />

      {/* SOLID badge */}
      {tactic.solid && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 + index * 0.1 }}
          style={{
            position: "absolute", top: 14, right: 14, zIndex: 2,
            background: "rgba(56,189,248,0.15)",
            border: "1px solid rgba(56,189,248,0.4)",
            borderRadius: 6, padding: "4px 10px",
            fontSize: 9, fontWeight: 900, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "#38bdf8",
          }}
        >
          ✦ SOLID
        </motion.div>
      )}

      {/* Content — blurred + faded when locked so nothing leaks through */}
      <div style={{
        padding: "22px 22px 20px",
        filter: isLocked ? "blur(7px)" : "none",
        opacity: isLocked ? 0.35 : 1,
        transition: "filter 0.3s, opacity 0.3s",
        userSelect: isLocked ? "none" : "auto",
        pointerEvents: isLocked ? "none" : "auto",
      }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
          <FormationDots formation={tactic.formation} color={loc.primary} />

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Location + Win rate */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 9 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: loc.dim, border: `1px solid ${loc.border}`,
                borderRadius: 999, padding: "3px 10px",
              }}>
                <span style={{ fontSize: 9 }}>{loc.icon}</span>
                <span style={{ fontSize: 8.5, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: loc.primary }}>
                  {loc.label}
                </span>
              </div>
              {tactic.winRate && (
                <motion.div
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: "rgba(52,211,153,0.1)",
                    border: "1px solid rgba(52,211,153,0.3)",
                    borderRadius: 999, padding: "3px 10px",
                  }}
                >
                  <span style={{ fontSize: 10 }}>🏆</span>
                  <span style={{ fontSize: 8.5, fontWeight: 900, letterSpacing: "0.1em", color: "#34d399" }}>
                    %{tactic.winRate} Kazanma
                  </span>
                </motion.div>
              )}
            </div>

            {/* Title */}
            <h3 style={{
              margin: "0 0 3px",
              fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, letterSpacing: "0.01em",
              color: "#f0f6ff", lineHeight: 1.1,
            }}>
              {tactic.name}
            </h3>

            {/* Scenario */}
            <div style={{ fontSize: 11, color: "rgba(148,163,184,0.6)", fontWeight: 600 }}>
              {tactic.scenario}
            </div>
          </div>
        </div>

        {/* Formation + style pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <div style={{
            display: "inline-flex", alignItems: "center",
            background: "rgba(0,0,0,0.38)", border: `1px solid ${loc.border}`,
            borderRadius: 8, padding: "5px 12px",
          }}>
            <span style={{
              fontSize: 13, fontWeight: 900, color: loc.primary,
              letterSpacing: "0.06em",
              fontFamily: "'Barlow Condensed', sans-serif",
            }}>
              {tactic.formation}
            </span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(148,163,184,0.45)", letterSpacing: "0.04em" }}>
            · {tactic.playStyle}
          </span>
        </div>

        {/* ── Sliders ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 18 }}>
          <Slider label="Baskı" value={tactic.pressure} color={loc.primary} />
          <Slider label="Stil" value={tactic.style} color={loc.styleColor} />
          <Slider label="Tempo" value={tactic.tempo} color="#22d3ee" />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 14 }} />

        {/* ── Line instructions ── */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <LineCell role="Forvet" value={tactic.forward} icon="⚡" />
          <LineCell role="Orta Saha" value={tactic.midfield} icon="⚙️" />
          <LineCell role="Defans" value={tactic.defenseLine} icon="🛡️" />
        </div>

        {/* Defense shape + offside */}
        <div style={{ display: "flex", gap: 6, marginBottom: tactic.effectiveVs || tactic.note ? 14 : 0 }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 9, padding: "6px 10px",
          }}>
            <span style={{ fontSize: 10 }}>🔷</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(148,163,184,0.6)" }}>
              {tactic.defenseShape}
            </span>
          </div>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 9, padding: "6px 10px",
          }}>
            <span style={{ fontSize: 10 }}>🚩</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(148,163,184,0.6)" }}>
              Ofsayt: {tactic.offside}
            </span>
          </div>
        </div>

        {/* Effective vs */}
        {tactic.effectiveVs && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            <span style={{
              fontSize: 8.5, fontWeight: 800, textTransform: "uppercase",
              letterSpacing: "0.12em", color: "rgba(148,163,184,0.4)",
            }}>
              Etkili:
            </span>
            {tactic.effectiveVs.map(f => (
              <div key={f} style={{
                fontSize: 10, fontWeight: 900,
                background: "rgba(251,191,36,0.08)",
                border: "1px solid rgba(251,191,36,0.2)",
                borderRadius: 6, padding: "2px 9px", color: "#f59e0b",
              }}>
                {f}
              </div>
            ))}
          </div>
        )}

        {/* Note */}
        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.65, color: "rgba(148,163,184,0.68)" }}>
          {tactic.note}
        </p>

        {/* Warning */}
        {tactic.warning && (
          <div style={{
            marginTop: 12, display: "flex", alignItems: "flex-start", gap: 7,
            background: "rgba(251,191,36,0.05)",
            border: "1px solid rgba(251,191,36,0.16)",
            borderRadius: 10, padding: "9px 12px",
          }}>
            <span style={{ fontSize: 13, flexShrink: 0 }}>⚠️</span>
            <span style={{ fontSize: 11.5, color: "rgba(251,191,36,0.78)", lineHeight: 1.5, fontWeight: 600 }}>
              {tactic.warning}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Unlock gate ──────────────────────────────────────────────────────
const GLASS_GATE: React.CSSProperties = {
  background: "rgba(9,11,33,0.88)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(251,191,36,0.22)",
  borderRadius: 20,
};

// ── Main section ─────────────────────────────────────────────────────
export default function PremiumTactics() {
  const { isPremium, unlock, lock, unlocking } = usePremium();
  const { t, lang } = useLang();
  const tactics = getLocalizedPremiumTactics(t);
  const [code, setCode] = useState("");
  const [error, setError] = useState<"invalid" | "taken" | null>(null);

  const handleUnlock = async () => {
    const result = await unlock(code);
    if (result === "ok") { setError(null); setCode(""); }
    else setError(result);
  };

  return (
    <section id="premium" style={{ position: "relative", overflow: "hidden", padding: "clamp(48px,7vw,96px) 0" }}>

      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <motion.div
          animate={{ opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 9, repeat: Infinity }}
          style={{
            position: "absolute", top: "5%", right: "-8%",
            width: "45%", height: "60%", borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        <motion.div
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 11, repeat: Infinity, delay: 3 }}
          style={{
            position: "absolute", bottom: "10%", left: "-5%",
            width: "35%", height: "50%", borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(56,189,248,0.07) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent)",
        }} />
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: EASE }}
          style={{ marginBottom: 40 }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "rgba(251,191,36,0.1)",
                border: "1px solid rgba(251,191,36,0.3)",
                borderRadius: 999, padding: "5px 14px", marginBottom: 14,
              }}>
                <span style={{ fontSize: 12 }}>👑</span>
                <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#f59e0b" }}>
                  {t("premium.badge")}
                </span>
              </div>

              <h2 style={{ margin: 0, fontSize: "clamp(1.8rem, 4vw, 3.2rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                <span style={{ color: "#e2e8f0" }}>{t("premium.title1")} </span>
                <span style={{ color: "#f59e0b" }}>{t("premium.title2")}</span>
              </h2>
              <p style={{ margin: "10px 0 0", fontSize: 14, color: "rgba(148,163,184,0.7)", lineHeight: 1.65, maxWidth: 520 }}>
                {t("premium.desc")}
              </p>
            </div>

            {/* Update stamp */}
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              background: "rgba(245,158,11,0.07)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: 14, padding: "12px 20px",
            }}>
              <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(245,158,11,0.55)" }}>Güncelleme</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: "#f59e0b", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em" }}>HAZİRAN 2026</span>
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "block", boxShadow: "0 0 8px #34d399" }}
              />
            </div>

            {isPremium && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.28)",
                  borderRadius: 999, padding: "6px 14px",
                }}>
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", display: "block", boxShadow: "0 0 8px #34d399" }}
                  />
                  <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "#34d399" }}>
                    {t("premium.active")}
                  </span>
                </div>
                <motion.button
                  onClick={lock}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10, padding: "7px 16px", color: "rgba(148,163,184,0.6)",
                    cursor: "pointer", fontSize: 12, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                  }}
                >
                  {t("premium.exit")}
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── Unlock gate ── */}
        <AnimatePresence>
          {!isPremium && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE }}
              style={{
                ...GLASS_GATE,
                padding: "clamp(20px,4vw,36px)",
                marginBottom: 32,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 24,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ repeat: Infinity, repeatDelay: 3.5, duration: 0.7, ease: "easeInOut" }}
                style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: "linear-gradient(105deg, transparent 35%, rgba(251,191,36,0.06) 50%, transparent 65%)",
                  transform: "skewX(-15deg)",
                }}
              />
              <div>
                <h3 style={{ margin: "0 0 10px", fontSize: "clamp(1.2rem,2.5vw,1.7rem)", fontWeight: 900, color: "#e2e8f0", letterSpacing: "-0.01em" }}>
                  {t("premium.unlockTitle")}
                </h3>
                <p style={{ margin: "0 0 20px", fontSize: 13.5, color: "rgba(148,163,184,0.75)", lineHeight: 1.7 }}>
                  {t("premium.unlockDesc")}
                </p>
                <motion.a
                  href={siteConfig.premiumUrl}
                  target="_blank" rel="noreferrer"
                  whileHover={{ scale: 1.03, boxShadow: "0 0 32px rgba(245,158,11,0.45)" }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                    borderRadius: 12, padding: "13px 28px",
                    color: "#fff", fontSize: 13, fontWeight: 900,
                    textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.1em",
                    boxShadow: "0 8px 28px rgba(245,158,11,0.3)",
                  }}
                >
                  👑 {t("premium.becomePremium")}
                </motion.a>
              </div>

              <div style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, padding: 20,
              }}>
                <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(148,163,184,0.45)", marginBottom: 10 }}>
                  {t("premium.codeLabel")}
                </div>
                <input
                  value={code}
                  onChange={e => { setCode(e.target.value); setError(null); }}
                  onKeyDown={e => e.key === "Enter" && handleUnlock()}
                  placeholder={t("premium.codePlaceholder")}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 12, padding: "11px 14px",
                    color: "#e2e8f0", fontSize: 14, outline: "none",
                    transition: "border-color 0.2s",
                  }}
                />
                <motion.button
                  onClick={handleUnlock}
                  disabled={unlocking}
                  whileHover={unlocking ? {} : { scale: 1.02 }}
                  whileTap={unlocking ? {} : { scale: 0.97 }}
                  style={{
                    marginTop: 10, width: "100%",
                    background: unlocking ? "rgba(251,191,36,0.45)" : "rgba(251,191,36,0.9)",
                    borderRadius: 12, padding: "11px 0",
                    color: "#1c1917", fontSize: 13, fontWeight: 900,
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    cursor: unlocking ? "default" : "pointer", border: "none",
                    transition: "background 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  {unlocking && (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      style={{
                        display: "inline-block", width: 14, height: 14,
                        border: "2px solid rgba(28,25,23,0.3)",
                        borderTopColor: "#1c1917", borderRadius: "50%",
                      }}
                    />
                  )}
                  {unlocking ? "..." : t("premium.unlock")}
                </motion.button>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      key={error}
                      initial={{ opacity: 0, y: -4 }}
                      animate={error === "invalid"
                        ? { opacity: 1, y: 0, x: [0, -8, 8, -6, 6, 0] }
                        : { opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        margin: "10px 0 0", textAlign: "center", fontSize: 13,
                        color: error === "taken" ? "#fbbf24" : "#fca5a5",
                      }}
                    >
                      {error === "taken"
                        ? (TAKEN_MSG[lang] ?? TAKEN_MSG.en)
                        : t("premium.wrongCode")}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Secret banner (shown only when unlocked) ── */}
        <AnimatePresence>
          {isPremium && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              style={{ overflow: "hidden", marginBottom: 28 }}
            >
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 12, padding: "11px 18px",
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>🔐</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(239,68,68,0.85)", lineHeight: 1.5 }}>
                  Bu taktikleri asla başkasıyla paylaşma! Çok kişi kullanınca sistem patlıyor ve taktik geçersiz hale geliyor.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tactic cards grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 18,
        }}>
          {tactics.map((tactic, i) => (
            <TacticCard
              key={tactic.id}
              tactic={tactic}
              index={i}
              isLocked={!isPremium}
              lockedLabel={t("premium.required")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
