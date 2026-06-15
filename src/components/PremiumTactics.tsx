import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { getLocalizedPremiumTactics, siteConfig, type PremiumTactic } from "../data/extras";
import { usePremium } from "../contexts/PremiumContext";
import { useLang } from "../contexts/LanguageContext";

const EASE = [0.16, 1, 0.3, 1] as const;

const isMobileDevice = typeof window !== "undefined" && window.innerWidth < 768;

// Starts at 12 on 2026-06-14, grows 1–2 per day deterministically.
function getWeeklyJoinCount(): number {
  const START = new Date("2026-06-14").getTime();
  const days = Math.max(0, Math.floor((Date.now() - START) / 86_400_000));
  let n = 12;
  for (let d = 0; d < days; d++) {
    n += 1 + (((d + 1) * 2654435761) >>> 31); // Knuth hash → 1 or 2
  }
  return n;
}

const TAKEN_MSG: Record<string, string> = {
  tr: "Bu kod başka bir cihazda kullanıldı.",
  en: "This code is already active on another device.",
  hu: "Ez a kód már egy másik eszközön aktív.",
  ar: "هذا الرمز مُفعَّل بالفعل على جهاز آخر.",
  pt: "Este código já está ativo em outro dispositivo.",
};

const LOC_STYLE = {
  home: {
    primary: "#f59e0b", secondary: "#ef4444",
    dim: "rgba(245,158,11,0.09)", border: "rgba(245,158,11,0.22)",
    glow: "rgba(245,158,11,0.14)", label: "EV", icon: "🏠", styleColor: "#ef4444",
  },
  away: {
    primary: "#38bdf8", secondary: "#818cf8",
    dim: "rgba(56,189,248,0.09)", border: "rgba(56,189,248,0.22)",
    glow: "rgba(56,189,248,0.12)", label: "DEPLASMAN", icon: "✈️", styleColor: "#818cf8",
  },
};

// ── Formation dot grid ───────────────────────────────────────────────
function FormationDots({ formation, color, size = 8 }: { formation: string; color: string; size?: number }) {
  const nums = formation.split(" ")[0].split("-").map(Number).reverse();
  const maxInRow = Math.max(...nums);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      {nums.map((count, ri) => (
        <div key={ri} style={{ display: "flex", gap: 4, justifyContent: "center", width: maxInRow * (size + 4) }}>
          {Array.from({ length: count }).map((_, di) => (
            <motion.div
              key={di}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.06 + ri * 0.05 + di * 0.02, duration: 0.25, ease: EASE }}
              style={{
                width: size, height: size, borderRadius: "50%", flexShrink: 0,
                background: ri === nums.length - 1 ? color : ri === 0 ? `${color}44` : `${color}88`,
                boxShadow: ri === nums.length - 1 ? `0 0 6px ${color}99` : "none",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Animated counter ─────────────────────────────────────────────────
function AnimNum({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / 950, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref}>{val}</span>;
}

// ── Slider stat row ──────────────────────────────────────────────────
function Slider({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(148,163,184,0.5)" }}>
          {label}
        </span>
        <span style={{ fontSize: 24, fontWeight: 900, lineHeight: 1, color, letterSpacing: "-0.03em", fontFamily: "'Barlow Condensed', sans-serif" }}>
          <AnimNum to={value} />
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }} whileInView={{ width: `${value}%` }} viewport={{ once: true }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.15 }}
          style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${color}aa,${color})`, boxShadow: `0 0 10px ${color}55` }}
        />
      </div>
    </div>
  );
}

// ── Line cell ────────────────────────────────────────────────────────
function LineCell({ role, value, icon }: { role: string; value: string; icon: string }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "8px 10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 10 }}>{icon}</span>
        <span style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.13em", color: "rgba(148,163,184,0.4)" }}>{role}</span>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#d1d5db", lineHeight: 1.35 }}>{value}</span>
    </div>
  );
}

// ── Full tactic card (unlocked) ──────────────────────────────────────
function TacticCard({ tactic, index }: { tactic: PremiumTactic; index: number }) {
  const { t } = useLang();
  const loc = LOC_STYLE[tactic.location];
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.09, ease: EASE }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      style={{
        position: "relative", overflow: "hidden",
        background: `linear-gradient(145deg, rgba(6,8,24,0.97) 0%, ${loc.dim} 100%)`,
        border: `1px solid ${loc.border}`, borderRadius: 18,
        ...(isMobileDevice ? {} : { backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }),
      }}
    >
      {/* Corner glow */}
      <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: `radial-gradient(circle, ${loc.glow} 0%, transparent 70%)`, pointerEvents: "none" }} />
      {/* Shimmer — disabled on mobile to prevent infinite RAF overhead */}
      {!isMobileDevice && (
        <motion.div
          animate={{ x: ["-110%", "210%"] }}
          transition={{ repeat: Infinity, repeatDelay: 6 + index * 1.5, duration: 1, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `linear-gradient(110deg, transparent 30%, ${loc.glow} 50%, transparent 70%)`, transform: "skewX(-12deg)" }}
        />
      )}
      {/* SOLID badge */}
      {tactic.solid && (
        <div style={{ position: "absolute", top: 14, right: 14, zIndex: 2, background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.4)", borderRadius: 6, padding: "4px 10px", fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "#38bdf8" }}>
          ✦ SOLID
        </div>
      )}
      <div style={{ padding: "22px 22px 20px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ background: "rgba(0,0,0,0.32)", borderRadius: 12, border: `1px solid ${loc.primary}33`, padding: "10px 14px" }}>
            <FormationDots formation={tactic.formation} color={loc.primary} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 9 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: loc.dim, border: `1px solid ${loc.border}`, borderRadius: 999, padding: "3px 10px" }}>
                <span style={{ fontSize: 9 }}>{loc.icon}</span>
                <span style={{ fontSize: 8.5, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: loc.primary }}>{tactic.location === "home" ? t("premium.locHome") : t("premium.locAway")}</span>
              </div>
              {tactic.winRate && (
                <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2.4, repeat: Infinity }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 999, padding: "3px 10px" }}>
                  <span style={{ fontSize: 10 }}>🏆</span>
                  <span style={{ fontSize: 8.5, fontWeight: 900, letterSpacing: "0.1em", color: "#34d399" }}>%{tactic.winRate} {t("premium.winRateSuffix")}</span>
                </motion.div>
              )}
            </div>
            <h3 style={{ margin: "0 0 3px", fontSize: "clamp(1.05rem,2.5vw,1.35rem)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, letterSpacing: "0.01em", color: "#f0f6ff", lineHeight: 1.1 }}>
              {tactic.name}
            </h3>
            <div style={{ fontSize: 11, color: "rgba(148,163,184,0.6)", fontWeight: 600 }}>{tactic.scenario}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(0,0,0,0.38)", border: `1px solid ${loc.border}`, borderRadius: 8, padding: "5px 12px" }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: loc.primary, letterSpacing: "0.06em", fontFamily: "'Barlow Condensed', sans-serif" }}>{tactic.formation}</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(148,163,184,0.45)", letterSpacing: "0.04em" }}>· {tactic.playStyle}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 18 }}>
          <Slider label={t("premium.pressure")} value={tactic.pressure} color={loc.primary} />
          <Slider label={t("premium.style")} value={tactic.style} color={loc.styleColor} />
          <Slider label={t("premium.tempo")} value={tactic.tempo} color="#22d3ee" />
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 14 }} />
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <LineCell role={t("premium.lineForward")} value={tactic.forward} icon="⚡" />
          <LineCell role={t("premium.lineMidfield")} value={tactic.midfield} icon="⚙️" />
          <LineCell role={t("premium.lineDefense")} value={tactic.defenseLine} icon="🛡️" />
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: tactic.effectiveVs || tactic.note ? 14 : 0 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 9, padding: "6px 10px" }}>
            <span style={{ fontSize: 10 }}>🔷</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(148,163,184,0.6)" }}>{tactic.defenseShape}</span>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 9, padding: "6px 10px" }}>
            <span style={{ fontSize: 10 }}>🚩</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(148,163,184,0.6)" }}>{t("premium.offside")} {tactic.offside}</span>
          </div>
        </div>
        {tactic.effectiveVs && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            <span style={{ fontSize: 8.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(148,163,184,0.4)" }}>{t("premium.effective")}</span>
            {tactic.effectiveVs.map(f => (
              <div key={f} style={{ fontSize: 10, fontWeight: 900, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 6, padding: "2px 9px", color: "#f59e0b" }}>{f}</div>
            ))}
          </div>
        )}
        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.65, color: "rgba(148,163,184,0.68)" }}>{tactic.note}</p>
        {tactic.warning && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "flex-start", gap: 7, background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.16)", borderRadius: 10, padding: "9px 12px" }}>
            <span style={{ fontSize: 13, flexShrink: 0 }}>⚠️</span>
            <span style={{ fontSize: 11.5, color: "rgba(251,191,36,0.78)", lineHeight: 1.5, fontWeight: 600 }}>{tactic.warning}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Teaser card (locked preview) ─────────────────────────────────────
function TeaserCard({ tactic, index }: { tactic: PremiumTactic; index: number }) {
  const { t } = useLang();
  const loc = LOC_STYLE[tactic.location];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: EASE }}
      style={{
        position: "relative", overflow: "hidden",
        background: `linear-gradient(145deg, rgba(6,8,24,0.96) 0%, ${loc.dim} 100%)`,
        border: `1px solid ${loc.border}`, borderRadius: 18,
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      }}
    >
      {/* Subtle top glow */}
      <div style={{ position: "absolute", top: -30, left: "50%", transform: "translateX(-50%)", width: 180, height: 60, borderRadius: "50%", background: `radial-gradient(ellipse, ${loc.glow} 0%, transparent 70%)`, pointerEvents: "none" }} />

      {/* VIP ribbon top-right */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        background: "linear-gradient(135deg, #f59e0b, #ef4444)",
        padding: "5px 14px 5px 20px",
        borderBottomLeftRadius: 14,
        fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: "#fff",
        textTransform: "uppercase", zIndex: 3,
        clipPath: "polygon(12px 0, 100% 0, 100% 100%, 0 100%)",
      }}>
        👑 VIP
      </div>

      <div style={{ padding: "22px 20px 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
          <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 12, border: `1px solid ${loc.primary}33`, padding: "10px 12px" }}>
            <FormationDots formation={tactic.formation} color={loc.primary} size={7} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 7 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: loc.dim, border: `1px solid ${loc.border}`, borderRadius: 999, padding: "3px 9px" }}>
                <span style={{ fontSize: 9 }}>{loc.icon}</span>
                <span style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.13em", color: loc.primary }}>{tactic.location === "home" ? t("premium.locHome") : t("premium.locAway")}</span>
              </div>
              {tactic.winRate && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.28)", borderRadius: 999, padding: "3px 9px" }}>
                  <span style={{ fontSize: 9 }}>🏆</span>
                  <span style={{ fontSize: 8, fontWeight: 900, color: "#34d399" }}>%{tactic.winRate}</span>
                </div>
              )}
              {tactic.solid && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.28)", borderRadius: 999, padding: "3px 9px" }}>
                  <span style={{ fontSize: 8, fontWeight: 900, color: "#38bdf8" }}>✦ SOLID</span>
                </div>
              )}
            </div>
            <div style={{ fontSize: "clamp(1rem,2vw,1.2rem)", fontWeight: 900, color: "#f0f6ff", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.02em", lineHeight: 1.1 }}>
              {tactic.formation}
            </div>
            <div style={{ fontSize: 10, color: "rgba(148,163,184,0.5)", fontWeight: 600, marginTop: 2 }}>{tactic.scenario}</div>
          </div>
        </div>

        {/* Blurred slider zone */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          {/* Fake blurred sliders */}
          <div style={{ filter: "blur(6px)", userSelect: "none", pointerEvents: "none", opacity: 0.5 }}>
            {[
              { label: t("premium.pressure"), w: `${tactic.pressure}%`, color: loc.primary },
              { label: t("premium.style"), w: `${tactic.style}%`, color: loc.styleColor },
              { label: t("premium.tempo"), w: `${tactic.tempo}%`, color: "#22d3ee" },
            ].map(s => (
              <div key={s.label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(148,163,184,0.5)" }}>{s.label}</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: s.color, fontFamily: "'Barlow Condensed', sans-serif" }}>??</span>
                </div>
                <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                  <div style={{ width: s.w, height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${s.color}88,${s.color})` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Lock overlay */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 6,
          }}>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.4 }}
              style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20,
              }}
            >
              🔒
            </motion.div>
            <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.16em", color: "rgba(245,158,11,0.7)" }}>
              {t("premium.vipRequired")}
            </span>
          </div>
        </div>

        {/* Blurred note */}
        <div style={{ filter: "blur(5px)", userSelect: "none", pointerEvents: "none", opacity: 0.4 }}>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "rgba(148,163,184,0.7)" }}>
            {tactic.note.slice(0, 60)}...
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main export ──────────────────────────────────────────────────────
export default function PremiumTactics() {
  const { isPremium, unlock, lock, unlocking } = usePremium();
  const { t, lang } = useLang();
  const tactics = getLocalizedPremiumTactics(t);
  const [code, setCode] = useState("");
  const [error, setError] = useState<"invalid" | "taken" | null>(null);
  const [showCode, setShowCode] = useState(false);

  const handleUnlock = async () => {
    const result = await unlock(code);
    if (result === "ok") { setError(null); setCode(""); }
    else setError(result);
  };

  return (
    <section id="premium" style={{ position: "relative", overflow: "hidden", padding: "clamp(48px,7vw,96px) 0" }}>

      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 9, repeat: Infinity }}
          style={{ position: "absolute", top: "5%", right: "-8%", width: "45%", height: "60%", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(245,158,11,0.09) 0%, transparent 70%)", filter: "blur(90px)" }} />
        <motion.div animate={{ opacity: [0.12, 0.3, 0.12] }} transition={{ duration: 11, repeat: Infinity, delay: 3 }}
          style={{ position: "absolute", bottom: "10%", left: "-5%", width: "35%", height: "50%", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(56,189,248,0.07) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent)" }} />
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>

        {/* ── Unlocked header ── */}
        {isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}
          >
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 999, padding: "5px 14px", marginBottom: 12 }}>
                <span style={{ fontSize: 12 }}>👑</span>
                <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#f59e0b" }}>{t("premium.badge")}</span>
              </div>
              <h2 style={{ margin: 0, fontSize: "clamp(1.8rem,4vw,3.2rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                <span style={{ color: "#e2e8f0" }}>{t("premium.title1")} </span>
                <span style={{ color: "#f59e0b" }}>{t("premium.title2")}</span>
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.28)", borderRadius: 999, padding: "7px 16px" }}>
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", display: "block", boxShadow: "0 0 8px #34d399" }} />
                <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "#34d399" }}>{t("premium.active")}</span>
              </div>
              <motion.button onClick={lock} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "7px 16px", color: "rgba(148,163,184,0.6)", cursor: "pointer", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {t("premium.exit")}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── LOCKED: Hero pitch ── */}
        <AnimatePresence>
          {!isPremium && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: EASE }}
              style={{ marginBottom: 28 }}
            >
              {/* Main pitch card */}
              <div style={{
                position: "relative", overflow: "hidden",
                background: "rgba(9,11,33,0.92)",
                border: "1px solid rgba(245,158,11,0.22)",
                borderRadius: 24,
                backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              }}>
                {/* Gold top bar */}
                <div style={{ height: 3, background: "linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)", backgroundSize: "200% 100%" }} />

                {/* Shimmer sweep */}
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, repeatDelay: 4, duration: 0.9, ease: "easeInOut" }}
                  style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(105deg, transparent 35%, rgba(251,191,36,0.05) 50%, transparent 65%)", transform: "skewX(-15deg)" }}
                />

                <div style={{ padding: "clamp(24px,4vw,40px)", display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "start" }}>

                  {/* Left: pitch */}
                  <div>
                    {/* Badge row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 999, padding: "5px 14px" }}>
                        <span style={{ fontSize: 13 }}>👑</span>
                        <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#f59e0b" }}>{t("premium.heroBadge")}</span>
                      </div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)", borderRadius: 999, padding: "5px 14px" }}>
                        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
                          style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "block", boxShadow: "0 0 7px #34d399" }} />
                        <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "#fde68a" }}>{t("premium.heroLive")}</span>
                      </div>
                    </div>

                    <h2 style={{
                      margin: "0 0 8px",
                      fontSize: "clamp(1.6rem,3.5vw,2.8rem)",
                      fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.02em",
                    }}>
                      <span style={{ color: "#e2e8f0" }}>{t("premium.heroTitleA")} </span>
                      <span style={{ background: "linear-gradient(90deg,#f59e0b,#fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t("premium.heroTitleB")}</span>
                      <span style={{ color: "#e2e8f0" }}> {t("premium.heroTitleC")}</span>
                    </h2>
                    <p style={{ margin: "0 0 22px", fontSize: 14, color: "rgba(148,163,184,0.65)", lineHeight: 1.65, maxWidth: 460 }}>
                      {t("premium.heroDesc")}
                    </p>

                    {/* Feature list */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                      {[
                        { icon: "🏠", text: t("premium.feat1") },
                        { icon: "🏠", text: t("premium.feat2") },
                        { icon: "🏠", text: t("premium.feat3") },
                        { icon: "✈️", text: t("premium.feat4") },
                      ].map((f, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + i * 0.07, duration: 0.35, ease: EASE }}
                          style={{ display: "flex", alignItems: "center", gap: 10 }}
                        >
                          <div style={{
                            width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                            background: "rgba(245,158,11,0.15)",
                            border: "1px solid rgba(245,158,11,0.35)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11,
                          }}>
                            {f.icon}
                          </div>
                          <span style={{ fontSize: 13, color: "rgba(226,232,240,0.8)", fontWeight: 600, lineHeight: 1.4 }}>{f.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTAs */}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <motion.a
                        href={siteConfig.premiumUrl}
                        target="_blank" rel="noreferrer"
                        whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(245,158,11,0.5)" }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 9,
                          background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                          borderRadius: 14, padding: "14px 28px",
                          color: "#fff", fontSize: 14, fontWeight: 900,
                          textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.1em",
                          boxShadow: "0 8px 28px rgba(245,158,11,0.32)",
                        }}
                      >
                        {t("premium.becomePremium")}
                      </motion.a>
                      <motion.button
                        onClick={() => setShowCode(v => !v)}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 7,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 14, padding: "14px 22px",
                          color: "rgba(226,232,240,0.65)", fontSize: 13, fontWeight: 700,
                          cursor: "pointer", letterSpacing: "0.06em",
                        }}
                      >
                        {t("premium.codeHave")}
                      </motion.button>
                    </div>

                    {/* Social proof */}
                    <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 8 }}>
                      {/* Stacked avatars */}
                      <div style={{ display: "flex" }}>
                        {["#6366f1","#f59e0b","#34d399","#ef4444"].map((c, i) => (
                          <div key={i} style={{
                            width: 24, height: 24, borderRadius: "50%",
                            background: c, border: "2px solid rgba(9,11,33,0.9)",
                            marginLeft: i === 0 ? 0 : -8, fontSize: 10,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            👤
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: 12, color: "rgba(148,163,184,0.5)", fontWeight: 600 }}>
                        {t("premium.joinBefore")} <span style={{ color: "#fbbf24", fontWeight: 800 }}>{getWeeklyJoinCount()}</span> {t("premium.joinAfter")}
                      </span>
                    </div>
                  </div>

                  {/* Right: code input (collapsible) */}
                  <div style={{ minWidth: 240, maxWidth: 280 }}>
                    <AnimatePresence>
                      {showCode && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          transition={{ duration: 0.35, ease: EASE }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{
                            background: "rgba(0,0,0,0.35)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 18, padding: 20,
                          }}>
                            <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(148,163,184,0.4)", marginBottom: 10 }}>
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
                                borderRadius: 11, padding: "11px 14px",
                                color: "#e2e8f0", fontSize: 14, outline: "none",
                                transition: "border-color 0.2s",
                              }}
                            />
                            <motion.button
                              onClick={handleUnlock} disabled={unlocking}
                              whileHover={unlocking ? {} : { scale: 1.02 }}
                              whileTap={unlocking ? {} : { scale: 0.97 }}
                              style={{
                                marginTop: 10, width: "100%",
                                background: unlocking ? "rgba(251,191,36,0.45)" : "rgba(251,191,36,0.92)",
                                borderRadius: 11, padding: "11px 0",
                                color: "#1c1917", fontSize: 13, fontWeight: 900,
                                textTransform: "uppercase", letterSpacing: "0.1em",
                                cursor: unlocking ? "default" : "pointer", border: "none",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                transition: "background 0.2s",
                              }}
                            >
                              {unlocking && (
                                <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                  style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(28,25,23,0.3)", borderTopColor: "#1c1917", borderRadius: "50%" }} />
                              )}
                              {unlocking ? "..." : t("premium.unlock")}
                            </motion.button>
                            <AnimatePresence>
                              {error && (
                                <motion.p
                                  key={error}
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={error === "invalid" ? { opacity: 1, y: 0, x: [0, -8, 8, -6, 6, 0] } : { opacity: 1, y: 0 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.4 }}
                                  style={{ margin: "10px 0 0", textAlign: "center", fontSize: 13, color: error === "taken" ? "#fbbf24" : "#fca5a5" }}
                                >
                                  {error === "taken" ? (TAKEN_MSG[lang] ?? TAKEN_MSG.en) : t("premium.wrongCode")}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Stats column — always visible */}
                    {!showCode && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ display: "flex", flexDirection: "column", gap: 12 }}
                      >
                        {[
                          { label: t("premium.statLabel1"), value: "4",     sub: t("premium.statSub1") },
                          { label: t("premium.statLabel2"), value: "%85+",  sub: t("premium.statSub2") },
                          { label: t("premium.statLabel3"), value: t("premium.statSub3"), sub: "" },
                        ].map((s, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.08, ease: EASE }}
                            style={{
                              background: "rgba(0,0,0,0.3)",
                              border: "1px solid rgba(245,158,11,0.12)",
                              borderRadius: 14, padding: "14px 18px",
                              borderLeft: "3px solid rgba(245,158,11,0.5)",
                            }}
                          >
                            <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.16em", color: "rgba(245,158,11,0.55)", marginBottom: 4 }}>{s.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 900, color: "#fbbf24", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "-0.01em", lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: 10, color: "rgba(148,163,184,0.4)", fontWeight: 600, marginTop: 2 }}>{s.sub}</div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Secret warning (only shown if applicable) */}
                <div style={{
                  margin: "0 clamp(24px,4vw,40px) clamp(20px,3vw,28px)",
                  display: "flex", alignItems: "flex-start", gap: 10,
                  background: "rgba(239,68,68,0.05)",
                  border: "1px solid rgba(239,68,68,0.15)",
                  borderRadius: 12, padding: "10px 16px",
                }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>🔐</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(239,68,68,0.75)", lineHeight: 1.55 }}>
                    {t("premium.secureNote")}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Unlocked secret banner ── */}
        <AnimatePresence>
          {isPremium && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              style={{ overflow: "hidden", marginBottom: 24 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "11px 18px" }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>🔐</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(239,68,68,0.85)", lineHeight: 1.5 }}>
                  {t("premium.secureNoteActive")}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tactic cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,280px), 1fr))", gap: 18 }}>
          {tactics.map((tactic, i) =>
            isPremium
              ? <TacticCard key={tactic.id} tactic={tactic} index={i} />
              : <TeaserCard key={tactic.id} tactic={tactic} index={i} />
          )}
        </div>
      </div>
    </section>
  );
}
