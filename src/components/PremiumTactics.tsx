import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLocalizedPremiumTactics, siteConfig, type PremiumTactic } from "../data/extras";
import { usePremium } from "../contexts/PremiumContext";
import { useLang } from "../contexts/LanguageContext";
import { analytics } from "../lib/analytics";

const EASE = [0.16, 1, 0.3, 1] as const;

// Returns true if tactic was added within the last 2 days
function isHotNew(addedAt?: string): boolean {
  if (!addedAt) return false;
  return Date.now() - new Date(addedAt).getTime() < 2 * 24 * 60 * 60 * 1000;
}

const HOT_NEW = {
  bg: "linear-gradient(135deg,rgba(255,100,30,0.22),rgba(255,60,10,0.10))",
  border: "rgba(255,100,30,0.6)",
  color: "#ff8040",
  label: "🔥 NEW",
} as const;

const COOL_NEW = {
  bg: "linear-gradient(135deg,rgba(16,217,161,0.18),rgba(16,217,161,0.08))",
  border: "rgba(16,217,161,0.45)",
  color: "#4aedc0",
  label: "✦ NEW",
} as const;

const BATTLE = {
  bg: "linear-gradient(135deg,rgba(255,80,40,0.22),rgba(255,140,0,0.12))",
  border: "rgba(255,100,30,0.65)",
  color: "#ff7040",
  label: "⚔️ BATTLE TACTIC",
} as const;

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
    primary: "#5b8af7", secondary: "rgba(91,138,247,0.7)",
    dim: "rgba(91,138,247,0.10)", border: "rgba(91,138,247,0.28)",
    glow: "rgba(91,138,247,0.08)", label: "EV", icon: "🏠", styleColor: "rgba(91,138,247,0.7)",
  },
  away: {
    primary: "#10d9a1", secondary: "rgba(16,217,161,0.7)",
    dim: "rgba(16,217,161,0.08)", border: "rgba(16,217,161,0.25)",
    glow: "rgba(16,217,161,0.06)", label: "DEPLASMAN", icon: "✈️", styleColor: "rgba(16,217,161,0.65)",
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

// ── Slider stat row — static values, no animation (premium numbers are exact & immutable) ──
function Slider({ label, value, color: _color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.38)" }}>
          {label}
        </span>
        <span style={{ fontSize: 24, fontWeight: 900, lineHeight: 1, color: "#ffffff", letterSpacing: "-0.03em", fontFamily: "'Outfit', sans-serif" }}>
          {value}
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div
          style={{ width: `${value}%`, height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#5b8af7,#9161f5)" }}
        />
      </div>
    </div>
  );
}

// ── Line cell ────────────────────────────────────────────────────────
function LineCell({ role, value, icon }: { role: string; value: string; icon: string }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, background: "rgba(91,138,247,0.05)", border: "1px solid rgba(91,138,247,0.14)", borderRadius: 10, padding: "8px 10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 10 }}>{icon}</span>
        <span style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.13em", color: "rgba(255,255,255,0.3)" }}>{role}</span>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", lineHeight: 1.35 }}>{value}</span>
    </div>
  );
}

// ── Full tactic card (unlocked) ──────────────────────────────────────
function TacticCard({ tactic, index }: { tactic: PremiumTactic; index: number }) {
  const { t } = useLang();
  const loc = LOC_STYLE[tactic.location];
  const isBattle = !!tactic.battleTactic;
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.09, ease: EASE }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      style={{
        position: "relative", overflow: "hidden",
        background: isBattle
          ? "linear-gradient(135deg,rgba(255,80,30,0.08) 0%,rgba(0,0,0,0.04) 55%,rgba(255,140,0,0.05) 100%)"
          : "rgba(91,138,247,0.04)",
        border: isBattle ? "1.5px solid rgba(255,100,30,0.45)" : "1px solid rgba(91,138,247,0.14)",
        borderRadius: 16,
        boxShadow: isBattle ? "0 0 32px rgba(255,80,30,0.12), inset 0 0 24px rgba(255,80,30,0.04)" : "none",
        ...(isMobileDevice ? {} : { backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }),
      }}
    >
      {/* Corner glow */}
      <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle, rgba(91,138,247,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
      {/* Shimmer — disabled on mobile to prevent infinite RAF overhead */}
      {!isMobileDevice && (
        <motion.div
          animate={{ x: ["-110%", "210%"] }}
          transition={{ repeat: Infinity, repeatDelay: 6 + index * 1.5, duration: 1, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.03) 50%, transparent 70%)", transform: "skewX(-12deg)" }}
        />
      )}
      <div style={{ padding: "22px 22px 20px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", padding: "10px 14px" }}>
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
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.28)", borderRadius: 999, padding: "3px 10px" }}>
                  <span style={{ fontSize: 10 }}>🏆</span>
                  <span style={{ fontSize: 8.5, fontWeight: 900, letterSpacing: "0.1em", color: "#ffc852" }}>%{tactic.winRate} {t("premium.winRateSuffix")}</span>
                </motion.div>
              )}
              {tactic.solid && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(91,138,247,0.10)", border: "1px solid rgba(91,138,247,0.3)", borderRadius: 999, padding: "3px 10px", fontSize: 8.5, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "#7eb8ff" }}>
                  ✦ SOLID
                </div>
              )}
              {tactic.isNew && (() => { const n = isHotNew(tactic.addedAt) ? HOT_NEW : COOL_NEW; return (
                <motion.div animate={{ scale: [1, 1.07, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, background: n.bg, border: `1px solid ${n.border}`, borderRadius: 999, padding: "3px 10px", fontSize: 8.5, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: n.color }}>
                  {n.label}
                </motion.div>
              ); })()}
              {tactic.battleTactic && (
                <motion.div
                  animate={{ scale: [1, 1.08, 1], boxShadow: ["0 0 0px rgba(255,100,30,0)", "0 0 14px rgba(255,100,30,0.5)", "0 0 0px rgba(255,100,30,0)"] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, background: BATTLE.bg, border: `1px solid ${BATTLE.border}`, borderRadius: 999, padding: "3px 12px", fontSize: 8.5, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: BATTLE.color }}>
                  {BATTLE.label}
                </motion.div>
              )}
            </div>
            <h3 style={{ margin: "0 0 3px", fontSize: "clamp(1.05rem,2.5vw,1.35rem)", fontFamily: "'Outfit', sans-serif", fontWeight: 900, letterSpacing: "0.01em", color: isBattle ? "#ff9060" : "#ffffff", lineHeight: 1.1 }}>
              {tactic.name}
            </h3>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.42)", fontWeight: 600 }}>{tactic.scenario}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(91,138,247,0.08)", border: "1px solid rgba(91,138,247,0.25)", borderRadius: 8, padding: "5px 12px" }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: "#7eb8ff", letterSpacing: "0.06em", fontFamily: "'Outfit', sans-serif" }}>{tactic.formation}</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>· {tactic.playStyle}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 18 }}>
          <Slider label={t("premium.pressure")} value={tactic.pressure} color="#ffffff" />
          <Slider label={t("premium.style")} value={tactic.style} color="#ffffff" />
          <Slider label={t("premium.tempo")} value={tactic.tempo} color="#ffffff" />
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
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>{tactic.defenseShape}</span>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 9, padding: "6px 10px" }}>
            <span style={{ fontSize: 10 }}>🚩</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>{t("premium.offside")} {tactic.offside}</span>
          </div>
        </div>
        {tactic.effectiveVs && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            <span style={{ fontSize: 8.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)" }}>{t("premium.effective")}</span>
            {tactic.effectiveVs.map(f => (
              <div key={f} style={{ fontSize: 10, fontWeight: 900, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "2px 9px", color: "rgba(255,255,255,0.7)" }}>{f}</div>
            ))}
          </div>
        )}
        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.65, color: "rgba(255,255,255,0.42)" }}>{tactic.note}</p>
        {tactic.warning && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "flex-start", gap: 7, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "9px 12px" }}>
            <span style={{ fontSize: 13, flexShrink: 0 }}>⚠️</span>
            <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, fontWeight: 600 }}>{tactic.warning}</span>
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
  const isBattle = !!tactic.battleTactic;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: EASE }}
      style={{
        position: "relative", overflow: "hidden",
        background: isBattle
          ? "linear-gradient(135deg,rgba(255,80,30,0.08) 0%,rgba(0,0,0,0.04) 55%,rgba(255,140,0,0.05) 100%)"
          : "rgba(91,138,247,0.04)",
        border: isBattle ? "1.5px solid rgba(255,100,30,0.45)" : "1px solid rgba(91,138,247,0.14)",
        borderRadius: 18,
        boxShadow: isBattle ? "0 0 32px rgba(255,80,30,0.12)" : "none",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      }}
    >
      {/* Subtle top glow */}
      <div style={{ position: "absolute", top: -30, left: "50%", transform: "translateX(-50%)", width: 180, height: 60, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(91,138,247,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* VIP ribbon top-right */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        background: "linear-gradient(135deg,rgba(245,166,35,0.18),rgba(255,200,82,0.08))",
        border: "1px solid rgba(245,166,35,0.32)",
        padding: "5px 14px 5px 20px",
        borderBottomLeftRadius: 14,
        fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: "#ffc852",
        textTransform: "uppercase", zIndex: 3,
        clipPath: "polygon(12px 0, 100% 0, 100% 100%, 0 100%)",
      }}>
        👑 VIP
      </div>

      <div style={{ padding: "22px 20px 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", padding: "10px 12px" }}>
            <FormationDots formation={tactic.formation} color={loc.primary} size={7} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 7 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: loc.dim, border: `1px solid ${loc.border}`, borderRadius: 999, padding: "3px 9px" }}>
                <span style={{ fontSize: 9 }}>{loc.icon}</span>
                <span style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.13em", color: loc.primary }}>{tactic.location === "home" ? t("premium.locHome") : t("premium.locAway")}</span>
              </div>
              {tactic.winRate && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, padding: "3px 9px" }}>
                  <span style={{ fontSize: 9 }}>🏆</span>
                  <span style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.7)" }}>%{tactic.winRate}</span>
                </div>
              )}
              {tactic.solid && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "rgba(91,138,247,0.10)", border: "1px solid rgba(91,138,247,0.3)", borderRadius: 999, padding: "3px 9px", fontSize: 8, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "#7eb8ff" }}>
                  ✦ SOLID
                </div>
              )}
              {tactic.isNew && (() => { const n = isHotNew(tactic.addedAt) ? HOT_NEW : COOL_NEW; return (
                <motion.div animate={{ scale: [1, 1.07, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 3, background: n.bg, border: `1px solid ${n.border}`, borderRadius: 999, padding: "3px 9px", fontSize: 8, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: n.color }}>
                  {n.label}
                </motion.div>
              ); })()}
              {tactic.battleTactic && (
                <motion.div
                  animate={{ scale: [1, 1.08, 1], boxShadow: ["0 0 0px rgba(255,100,30,0)", "0 0 12px rgba(255,100,30,0.5)", "0 0 0px rgba(255,100,30,0)"] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 3, background: BATTLE.bg, border: `1px solid ${BATTLE.border}`, borderRadius: 999, padding: "3px 10px", fontSize: 8, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: BATTLE.color }}>
                  {BATTLE.label}
                </motion.div>
              )}
            </div>
            <div style={{ fontSize: "clamp(1rem,2vw,1.2rem)", fontWeight: 900, color: isBattle ? "#ff9060" : "#ffffff", fontFamily: "'Outfit', sans-serif", letterSpacing: "0.02em", lineHeight: 1.1 }}>
              {tactic.formation}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, marginTop: 2 }}>{tactic.scenario}</div>
          </div>
        </div>

        {/* Blurred slider zone */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          {/* Fake blurred sliders */}
          <div style={{ filter: "blur(6px)", userSelect: "none", pointerEvents: "none", opacity: 0.5 }}>
            {[
              { label: t("premium.pressure"), w: `${tactic.pressure}%` },
              { label: t("premium.style"), w: `${tactic.style}%` },
              { label: t("premium.tempo"), w: `${tactic.tempo}%` },
            ].map(s => (
              <div key={s.label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.38)" }}>{s.label}</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: "rgba(255,255,255,0.6)", fontFamily: "'Outfit', sans-serif" }}>??</span>
                </div>
                <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{ width: s.w, height: "100%", borderRadius: 99, background: "rgba(255,255,255,0.4)" }} />
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
                background: "rgba(245,166,35,0.12)",
                border: "1px solid rgba(245,166,35,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20,
              }}
            >
              🔒
            </motion.div>
            <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.16em", color: "rgba(255,255,255,0.55)" }}>
              {t("premium.vipRequired")}
            </span>
          </div>
        </div>

        {/* Blurred note */}
        <div style={{ filter: "blur(5px)", userSelect: "none", pointerEvents: "none", opacity: 0.4 }}>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "rgba(255,255,255,0.5)" }}>
            {tactic.note.slice(0, 60)}...
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Highlight theme helper ───────────────────────────────────────────
function getHTheme(tactic: PremiumTactic) {
  if (tactic.fireTactic) return {
    bg: "linear-gradient(135deg,rgba(255,20,0,0.14) 0%,rgba(5,2,0,0.97) 45%,rgba(255,100,0,0.09) 100%)",
    border: "rgba(255,60,0,0.58)", shadow: "0 0 50px rgba(255,40,0,0.22),0 0 0 1px rgba(255,80,0,0.14),inset 0 0 30px rgba(255,40,0,0.05)",
    bar: "linear-gradient(90deg,#ff0000,#ff6600,#ffcc00,#ff6600,#ff0000)",
    dot: "#ff6600", accent: "#ffaa30",
    efBg: "rgba(255,100,0,0.08)", efBorder: "rgba(255,100,0,0.28)", efColor: "#ffaa30",
    badgeKey: "fire.bestHomeBadge", badgeBg: "linear-gradient(135deg,rgba(255,30,0,0.22),rgba(255,140,0,0.15))", badgeBorder: "rgba(255,80,0,0.7)", badgeColor: "#ffaa30",
    extraBadgeKey: "fire.vsAny",
    lockBg: "rgba(255,80,0,0.13)", lockBorder: "rgba(255,80,0,0.4)",
    vipBg: "linear-gradient(135deg,rgba(255,100,0,0.22),rgba(255,60,0,0.08))", vipBorder: "rgba(255,100,0,0.42)", vipColor: "#ffaa30", vipLabel: "🔥 VIP",
    titleFire: true,
  };
  return {
    bg: "linear-gradient(135deg,rgba(255,80,30,0.10) 0%,rgba(8,8,24,0.97) 40%,rgba(255,140,0,0.07) 100%)",
    border: "rgba(255,100,30,0.52)", shadow: "0 0 40px rgba(255,80,30,0.15),0 0 0 1px rgba(255,80,30,0.12),inset 0 0 24px rgba(255,80,30,0.04)",
    bar: "linear-gradient(90deg,#ff4500,#ff8c00,#ff4500)",
    dot: "#ff7040", accent: "#ff9060",
    efBg: "rgba(255,100,30,0.08)", efBorder: "rgba(255,100,30,0.28)", efColor: "#ff9060",
    badgeKey: null as null, badgeBg: BATTLE.bg, badgeBorder: BATTLE.border, badgeColor: BATTLE.color,
    extraBadgeKey: null as null,
    lockBg: "rgba(245,166,35,0.12)", lockBorder: "rgba(245,166,35,0.35)",
    vipBg: "linear-gradient(135deg,rgba(245,166,35,0.18),rgba(255,200,82,0.08))", vipBorder: "rgba(245,166,35,0.32)", vipColor: "#ffc852", vipLabel: "👑 VIP",
    titleFire: false,
  };
}

// ── Highlight card (unlocked) — for top 3 new tactics ────────────────
function HighlightCard({ tactic, index }: { tactic: PremiumTactic; index: number }) {
  const { t } = useLang();
  const loc = LOC_STYLE[tactic.location];
  const th = getHTheme(tactic);
  const n = isHotNew(tactic.addedAt) ? HOT_NEW : COOL_NEW;
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.09, ease: EASE }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      style={{ position: "relative", overflow: "hidden", background: th.bg, border: `1.5px solid ${th.border}`, borderRadius: 18, boxShadow: th.shadow }}
    >
      <div style={{ height: 3, background: th.bar, flexShrink: 0 }} />
      {!isMobileDevice && (
        <motion.div animate={{ x: ["-110%","210%"] }} transition={{ repeat: Infinity, repeatDelay: 7+index*1.5, duration: 1.1, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(110deg,transparent 30%,rgba(255,255,255,0.03) 50%,transparent 70%)", transform: "skewX(-12deg)" }} />
      )}

      <div style={{ padding: "18px 20px 18px" }}>
        {/* Badge strip */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
          {tactic.isNew && (
            <motion.div animate={{ scale:[1,1.07,1] }} transition={{ duration:2, repeat:Infinity }}
              style={{ display:"inline-flex", alignItems:"center", gap:4, background:n.bg, border:`1px solid ${n.border}`, borderRadius:999, padding:"2px 9px", fontSize:8, fontWeight:900, letterSpacing:"0.18em", textTransform:"uppercase", color:n.color }}>
              {n.label}
            </motion.div>
          )}
          <motion.div
            animate={{ scale:[1,1.08,1], boxShadow:[`0 0 0px ${th.badgeColor}00`,`0 0 12px ${th.badgeColor}88`,`0 0 0px ${th.badgeColor}00`] }}
            transition={{ duration:1.6, repeat:Infinity }}
            style={{ display:"inline-flex", alignItems:"center", gap:4, background:th.badgeBg, border:`1px solid ${th.badgeBorder}`, borderRadius:999, padding:"2px 10px", fontSize:8, fontWeight:900, letterSpacing:"0.16em", textTransform:"uppercase", color:th.badgeColor }}>
            {th.badgeKey ? t(th.badgeKey) : BATTLE.label}
          </motion.div>
          {th.extraBadgeKey && (
            <div style={{ display:"inline-flex", alignItems:"center", gap:4, background:th.efBg, border:`1px solid ${th.efBorder}`, borderRadius:999, padding:"2px 9px", fontSize:8, fontWeight:900, letterSpacing:"0.14em", textTransform:"uppercase", color:th.efColor }}>
              {t(th.extraBadgeKey)}
            </div>
          )}
          {tactic.solid && (
            <div style={{ display:"inline-flex", alignItems:"center", gap:3, background:"rgba(91,138,247,0.10)", border:"1px solid rgba(91,138,247,0.3)", borderRadius:999, padding:"2px 9px", fontSize:8, fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase", color:"#7eb8ff" }}>
              ✦ SOLID
            </div>
          )}
          <div style={{ display:"inline-flex", alignItems:"center", gap:3, background:loc.dim, border:`1px solid ${loc.border}`, borderRadius:999, padding:"2px 9px" }}>
            <span style={{ fontSize:9 }}>{loc.icon}</span>
            <span style={{ fontSize:8, fontWeight:900, textTransform:"uppercase", letterSpacing:"0.13em", color:loc.primary }}>{tactic.location==="home"?t("premium.locHome"):t("premium.locAway")}</span>
          </div>
          {tactic.winRate && (
            <motion.div animate={{ scale:[1,1.06,1] }} transition={{ duration:2.4, repeat:Infinity }}
              style={{ display:"inline-flex", alignItems:"center", gap:3, background:"rgba(245,166,35,0.08)", border:"1px solid rgba(245,166,35,0.28)", borderRadius:999, padding:"2px 9px" }}>
              <span style={{ fontSize:9 }}>🏆</span>
              <span style={{ fontSize:8, fontWeight:900, letterSpacing:"0.1em", color:"#ffc852" }}>%{tactic.winRate} {t("premium.winRateSuffix")}</span>
            </motion.div>
          )}
        </div>

        {/* Formation + title row */}
        <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:14 }}>
          <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, border:`1px solid ${th.border.replace("0.58","0.18").replace("0.52","0.15")}`, padding:"8px 10px", flexShrink:0 }}>
            <FormationDots formation={tactic.formation} color={th.dot} size={7} />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <h3 style={{ margin:"0 0 3px", fontSize:"clamp(1rem,2.2vw,1.25rem)", fontFamily:"'Outfit',sans-serif", fontWeight:900, lineHeight:1.1,
              ...(th.titleFire ? { background:"linear-gradient(90deg,#ff6600,#ffcc00)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", filter:"drop-shadow(0 0 8px rgba(255,100,0,0.45))" } : { color:th.accent }) }}>
              {tactic.name}
            </h3>
            <div style={{ fontSize:10.5, color:"rgba(255,255,255,0.4)", fontWeight:600 }}>{tactic.scenario}</div>
          </div>
        </div>

        {/* Formation badge */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
          <div style={{ display:"inline-flex", alignItems:"center", background:`${th.efBg}`, border:`1px solid ${th.efBorder}`, borderRadius:7, padding:"4px 12px" }}>
            <span style={{ fontSize:13, fontWeight:900, color:th.accent, fontFamily:"'Outfit',sans-serif", letterSpacing:"0.05em" }}>{tactic.formation}</span>
          </div>
          <span style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.32)" }}>· {tactic.playStyle}</span>
        </div>

        {/* Sliders */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:14 }}>
          <Slider label={t("premium.pressure")} value={tactic.pressure} color="#ffffff" />
          <Slider label={t("premium.style")} value={tactic.style} color="#ffffff" />
          <Slider label={t("premium.tempo")} value={tactic.tempo} color="#ffffff" />
        </div>

        <div style={{ height:1, background:"rgba(255,255,255,0.06)", marginBottom:12 }} />

        {/* Line tactics */}
        <div style={{ display:"flex", gap:5, marginBottom:8 }}>
          <LineCell role={t("premium.lineForward")} value={tactic.forward} icon="⚡" />
          <LineCell role={t("premium.lineMidfield")} value={tactic.midfield} icon="⚙️" />
          <LineCell role={t("premium.lineDefense")} value={tactic.defenseLine} icon="🛡️" />
        </div>
        <div style={{ display:"flex", gap:5, marginBottom: tactic.effectiveVs||tactic.note ? 12 : 0 }}>
          <div style={{ flex:1, display:"flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:8, padding:"5px 8px" }}>
            <span style={{ fontSize:10 }}>🔷</span>
            <span style={{ fontSize:9.5, fontWeight:700, color:"rgba(255,255,255,0.5)" }}>{tactic.defenseShape}</span>
          </div>
          <div style={{ flex:1, display:"flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:8, padding:"5px 8px" }}>
            <span style={{ fontSize:10 }}>🚩</span>
            <span style={{ fontSize:9.5, fontWeight:700, color:"rgba(255,255,255,0.5)" }}>{t("premium.offside")} {tactic.offside}</span>
          </div>
        </div>

        {/* Effective vs */}
        {tactic.effectiveVs && (
          <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap", marginBottom:12 }}>
            <span style={{ fontSize:8, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.12em", color:"rgba(255,255,255,0.3)" }}>{t("premium.effective")}</span>
            {tactic.effectiveVs.map(f => (
              <div key={f} style={{ fontSize:10, fontWeight:900, background:th.efBg, border:`1px solid ${th.efBorder}`, borderRadius:6, padding:"2px 9px", color:th.efColor }}>{f}</div>
            ))}
          </div>
        )}

        {/* Note */}
        <p style={{ margin:0, fontSize:12, lineHeight:1.65, color:"rgba(255,255,255,0.42)" }}>{tactic.note}</p>
        {tactic.warning && (
          <div style={{ marginTop:10, display:"flex", alignItems:"flex-start", gap:6, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:9, padding:"8px 10px" }}>
            <span style={{ fontSize:12, flexShrink:0 }}>⚠️</span>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.52)", lineHeight:1.5, fontWeight:600 }}>{tactic.warning}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Highlight teaser card (locked) ───────────────────────────────────
function HighlightTeaserCard({ tactic, index }: { tactic: PremiumTactic; index: number }) {
  const { t } = useLang();
  const loc = LOC_STYLE[tactic.location];
  const th = getHTheme(tactic);
  const n = isHotNew(tactic.addedAt) ? HOT_NEW : COOL_NEW;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.09, ease: EASE }}
      style={{ position:"relative", overflow:"hidden", background:th.bg, border:`1.5px solid ${th.border}`, borderRadius:18, boxShadow:th.shadow }}
    >
      <div style={{ height: 3, background: th.bar }} />

      {/* VIP ribbon */}
      <div style={{ position:"absolute", top:3, right:0, background:th.vipBg, border:`1px solid ${th.vipBorder}`, padding:"4px 16px 4px 20px", borderBottomLeftRadius:12,
        fontSize:8.5, fontWeight:900, letterSpacing:"0.18em", color:th.vipColor, textTransform:"uppercase", zIndex:3, clipPath:"polygon(12px 0,100% 0,100% 100%,0 100%)" }}>
        {th.vipLabel} EXCLUSIVE
      </div>

      <div style={{ padding:"18px 20px 18px" }}>
        {/* Badge strip */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:12 }}>
          {tactic.isNew && (
            <motion.div animate={{ scale:[1,1.07,1] }} transition={{ duration:2, repeat:Infinity }}
              style={{ display:"inline-flex", alignItems:"center", gap:4, background:n.bg, border:`1px solid ${n.border}`, borderRadius:999, padding:"2px 9px", fontSize:8, fontWeight:900, letterSpacing:"0.18em", textTransform:"uppercase", color:n.color }}>
              {n.label}
            </motion.div>
          )}
          <motion.div
            animate={{ scale:[1,1.08,1], boxShadow:[`0 0 0px ${th.badgeColor}00`,`0 0 12px ${th.badgeColor}88`,`0 0 0px ${th.badgeColor}00`] }}
            transition={{ duration:1.6, repeat:Infinity }}
            style={{ display:"inline-flex", alignItems:"center", gap:4, background:th.badgeBg, border:`1px solid ${th.badgeBorder}`, borderRadius:999, padding:"2px 10px", fontSize:8, fontWeight:900, letterSpacing:"0.16em", textTransform:"uppercase", color:th.badgeColor }}>
            {th.badgeKey ? t(th.badgeKey) : BATTLE.label}
          </motion.div>
          {th.extraBadgeKey && (
            <div style={{ display:"inline-flex", alignItems:"center", gap:4, background:th.efBg, border:`1px solid ${th.efBorder}`, borderRadius:999, padding:"2px 9px", fontSize:8, fontWeight:900, letterSpacing:"0.14em", textTransform:"uppercase", color:th.efColor }}>
              {t(th.extraBadgeKey)}
            </div>
          )}
          <div style={{ display:"inline-flex", alignItems:"center", gap:3, background:loc.dim, border:`1px solid ${loc.border}`, borderRadius:999, padding:"2px 9px" }}>
            <span style={{ fontSize:9 }}>{loc.icon}</span>
            <span style={{ fontSize:8, fontWeight:900, textTransform:"uppercase", letterSpacing:"0.13em", color:loc.primary }}>{tactic.location==="home"?t("premium.locHome"):t("premium.locAway")}</span>
          </div>
          {tactic.winRate && (
            <div style={{ display:"inline-flex", alignItems:"center", gap:3, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:999, padding:"2px 9px" }}>
              <span style={{ fontSize:9 }}>🏆</span>
              <span style={{ fontSize:8, fontWeight:900, color:"rgba(255,255,255,0.7)" }}>%{tactic.winRate}</span>
            </div>
          )}
        </div>

        {/* Formation + title */}
        <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:14 }}>
          <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, border:`1px solid ${th.border.replace("0.58","0.15").replace("0.52","0.12")}`, padding:"8px 10px", flexShrink:0 }}>
            <FormationDots formation={tactic.formation} color={th.dot} size={7} />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:"clamp(1rem,2vw,1.2rem)", fontWeight:900, fontFamily:"'Outfit',sans-serif", lineHeight:1.1, marginBottom:3,
              ...(th.titleFire ? { background:"linear-gradient(90deg,#ff6600,#ffcc00)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" } : { color:th.accent }) }}>
              {tactic.formation}
            </div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", fontWeight:600 }}>{tactic.scenario}</div>
          </div>
        </div>

        {/* Blurred sliders + lock */}
        <div style={{ position:"relative", marginBottom:12 }}>
          <div style={{ filter:"blur(6px)", userSelect:"none", pointerEvents:"none", opacity:0.5 }}>
            {[t("premium.pressure"),t("premium.style"),t("premium.tempo")].map((lbl,si) => (
              <div key={si} style={{ marginBottom:9 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:9, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.14em", color:"rgba(255,255,255,0.38)" }}>{lbl}</span>
                  <span style={{ fontSize:22, fontWeight:900, color:"rgba(255,255,255,0.6)", fontFamily:"'Outfit',sans-serif" }}>??</span>
                </div>
                <div style={{ height:4, borderRadius:99, background:"rgba(255,255,255,0.08)" }} />
              </div>
            ))}
          </div>
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:5 }}>
            <motion.div animate={{ scale:[1,1.1,1] }} transition={{ duration:2.8, repeat:Infinity }}
              style={{ width:42, height:42, borderRadius:"50%", background:th.lockBg, border:`1px solid ${th.lockBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
              🔒
            </motion.div>
            <span style={{ fontSize:8.5, fontWeight:900, textTransform:"uppercase", letterSpacing:"0.16em", color:"rgba(255,255,255,0.55)" }}>{t("premium.vipRequired")}</span>
          </div>
        </div>

        {/* Blurred note */}
        <div style={{ filter:"blur(5px)", userSelect:"none", pointerEvents:"none", opacity:0.4 }}>
          <p style={{ margin:0, fontSize:11.5, lineHeight:1.6, color:"rgba(255,255,255,0.5)" }}>{tactic.note.slice(0,60)}...</p>
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
    analytics.premiumClick("code_input");
    const result = await unlock(code);
    if (result === "ok") {
      setError(null);
      setCode("");
      analytics.premiumUnlocked();
    } else {
      setError(result);
      analytics.premiumCodeRedeem(false);
    }
  };

  return (
    <section id="premium" style={{ position: "relative", overflow: "hidden", padding: "clamp(48px,7vw,96px) 0", background: "transparent" }}>

      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <motion.div animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 9, repeat: Infinity }}
          style={{ position: "absolute", top: "5%", right: "-8%", width: "45%", height: "60%", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(145,97,245,0.12) 0%, transparent 70%)", filter: "blur(90px)" }} />
        <motion.div animate={{ opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 11, repeat: Infinity, delay: 3 }}
          style={{ position: "absolute", bottom: "10%", left: "-5%", width: "35%", height: "50%", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(91,138,247,0.10) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(91,138,247,0.25) 35%, rgba(145,97,245,0.25) 65%, transparent)" }} />
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>

        {/* ── Unlocked header ── */}
        {isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}
          >
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(245,166,35,0.10)", border: "1px solid rgba(245,166,35,0.3)", borderRadius: 999, padding: "5px 14px", marginBottom: 12 }}>
                <span style={{ fontSize: 12 }}>👑</span>
                <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#ffc852" }}>{t("premium.badge")}</span>
              </div>
              <h2 style={{ margin: 0, fontSize: "clamp(1.8rem,4vw,3.2rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                <span style={{ color: "#ffffff" }}>{t("premium.title1")} </span>
                <span style={{ color: "#f5a623" }}>{t("premium.title2")}</span>
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(16,217,161,0.08)", border: "1px solid rgba(16,217,161,0.25)", borderRadius: 999, padding: "7px 16px" }}>
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 7, height: 7, borderRadius: "50%", background: "#10d9a1", display: "block" }} />
                <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "#4aedc0" }}>{t("premium.active")}</span>
              </div>
              <motion.button onClick={lock} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "7px 16px", color: "rgba(255,255,255,0.45)", cursor: "pointer", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
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
                background: "rgba(0,0,0,0.85)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 24,
                backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              }}>
                {/* Top bar */}
                <div style={{ height: 3, background: "linear-gradient(90deg,#5b8af7,#9161f5,#f5a623)" }} />

                {/* Shimmer sweep */}
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, repeatDelay: 4, duration: 0.9, ease: "easeInOut" }}
                  style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.03) 50%, transparent 65%)", transform: "skewX(-15deg)" }}
                />

                <div style={{ padding: "clamp(24px,4vw,40px)", display: "grid", gridTemplateColumns: isMobileDevice ? "1fr" : "1fr auto", gap: isMobileDevice ? 20 : 32, alignItems: "start" }}>

                  {/* Left: pitch */}
                  <div>
                    {/* Badge row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(245,166,35,0.10)", border: "1px solid rgba(245,166,35,0.3)", borderRadius: 999, padding: "5px 14px" }}>
                        <span style={{ fontSize: 13 }}>👑</span>
                        <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#ffc852" }}>{t("premium.heroBadge")}</span>
                      </div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(16,217,161,0.07)", border: "1px solid rgba(16,217,161,0.22)", borderRadius: 999, padding: "5px 14px" }}>
                        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
                          style={{ width: 6, height: 6, borderRadius: "50%", background: "#10d9a1", display: "block" }} />
                        <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "#4aedc0" }}>{t("premium.heroLive")}</span>
                      </div>
                    </div>

                    <h2 style={{
                      margin: "0 0 8px",
                      fontSize: "clamp(1.6rem,3.5vw,2.8rem)",
                      fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.02em",
                    }}>
                      <span style={{ color: "#ffffff" }}>{t("premium.heroTitleA")} </span>
                      <span style={{ color: "rgba(255,255,255,0.65)" }}>{t("premium.heroTitleB")}</span>
                      <span style={{ color: "#ffffff" }}> {t("premium.heroTitleC")}</span>
                    </h2>
                    <p style={{ margin: "0 0 22px", fontSize: 14, color: "rgba(255,255,255,0.42)", lineHeight: 1.65, maxWidth: 460 }}>
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
                            background: "rgba(91,138,247,0.1)",
                            border: "1px solid rgba(91,138,247,0.28)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11,
                          }}>
                            {f.icon}
                          </div>
                          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 600, lineHeight: 1.4 }}>{f.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTAs */}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <motion.a
                        href={siteConfig.premiumUrl}
                        target="_blank" rel="noreferrer"
                        whileHover={{ scale: 1.04, boxShadow: "0 14px 40px rgba(91,138,247,0.5)" }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 9,
                          background: "linear-gradient(135deg,#5b8af7,#9161f5)",
                          borderRadius: 999, padding: "14px 28px",
                          color: "#ffffff", fontSize: 14, fontWeight: 900,
                          textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.1em",
                          boxShadow: "0 8px 32px rgba(91,138,247,0.38)",
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
                        {[0.5, 0.35, 0.2, 0.12].map((opacity, i) => (
                          <div key={i} style={{
                            width: 24, height: 24, borderRadius: "50%",
                            background: `rgba(255,255,255,${opacity})`, border: "2px solid #000000",
                            marginLeft: i === 0 ? 0 : -8, fontSize: 10,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            👤
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                        {t("premium.joinBefore")} <span style={{ color: "#ffffff", fontWeight: 800 }}>{getWeeklyJoinCount()}</span> {t("premium.joinAfter")}
                      </span>
                    </div>
                  </div>

                  {/* Right: code input (collapsible) */}
                  <div style={isMobileDevice ? {} : { minWidth: 240, maxWidth: 280 }}>
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
                            <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
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
                                border: `1px solid ${error ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.1)"}`,
                                borderRadius: 11, padding: "11px 14px",
                                color: "#ffffff", fontSize: 14, outline: "none",
                                transition: "border-color 0.2s",
                              }}
                            />
                            <motion.button
                              onClick={handleUnlock} disabled={unlocking}
                              whileHover={unlocking ? {} : { scale: 1.02 }}
                              whileTap={unlocking ? {} : { scale: 0.97 }}
                              style={{
                                marginTop: 10, width: "100%",
                                background: unlocking ? "rgba(91,138,247,0.4)" : "linear-gradient(135deg,#5b8af7,#9161f5)",
                                borderRadius: 999, padding: "11px 0",
                                color: "#ffffff", fontSize: 13, fontWeight: 900,
                                textTransform: "uppercase", letterSpacing: "0.1em",
                                cursor: unlocking ? "default" : "pointer", border: "none",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                transition: "background 0.2s",
                              }}
                            >
                              {unlocking && (
                                <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                  style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000000", borderRadius: "50%" }} />
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
                                  style={{ margin: "10px 0 0", textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.6)" }}
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
                              background: i === 0 ? "rgba(91,138,247,0.06)" : i === 1 ? "rgba(245,166,35,0.06)" : "rgba(16,217,161,0.06)",
                              border: `1px solid ${i === 0 ? "rgba(91,138,247,0.2)" : i === 1 ? "rgba(245,166,35,0.2)" : "rgba(16,217,161,0.2)"}`,
                              borderRadius: 14, padding: "14px 18px",
                            }}
                          >
                            <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>{s.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 900, color: i === 0 ? "#7eb8ff" : i === 1 ? "#ffc852" : "#4aedc0", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.01em", lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, marginTop: 2 }}>{s.sub}</div>
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
                  background: "rgba(245,166,35,0.05)",
                  border: "1px solid rgba(245,166,35,0.18)",
                  borderRadius: 12, padding: "10px 16px",
                }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>🔐</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,198,82,0.7)", lineHeight: 1.55 }}>
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
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "11px 18px" }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>🔐</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                  {t("premium.secureNoteActive")}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Premium disclaimer banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ marginBottom: 28, position: "relative", overflow: "hidden" }}
        >
          {/* Gradient border container */}
          <div style={{
            position: "relative",
            background: "linear-gradient(135deg, rgba(245,166,35,0.06), rgba(91,138,247,0.06), rgba(16,217,161,0.04))",
            borderRadius: 18,
            padding: 1,
          }}>
            <div style={{
              position: "absolute", inset: 0, borderRadius: 18,
              background: "linear-gradient(135deg, rgba(245,166,35,0.55), rgba(91,138,247,0.4), rgba(16,217,161,0.35))",
              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              padding: 1,
              pointerEvents: "none",
            }} />
            <div style={{
              background: "rgba(8,8,20,0.92)",
              borderRadius: 17,
              padding: "clamp(18px,3vw,28px) clamp(18px,3vw,32px)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}>
              {/* Shimmer sweep */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ repeat: Infinity, repeatDelay: 7, duration: 1.1, ease: "easeInOut" }}
                style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.025) 50%, transparent 65%)", transform: "skewX(-15deg)", borderRadius: 17 }}
              />

              {/* Title row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: "rgba(245,166,35,0.12)",
                    border: "1px solid rgba(245,166,35,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 17,
                  }}
                >⚡</motion.div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#ffc852", marginBottom: 2 }}>
                    OSM NEXT LEVEL — VIP
                  </div>
                  <div style={{ fontSize: "clamp(13px,2.5vw,16px)", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                    {t("premium.discTitle")}
                  </div>
                </div>
              </div>

              {/* Three bullets */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {([
                  { icon: "🔄", text: t("premium.discBullet1"), color: "#4aedc0", bg: "rgba(16,217,161,0.07)", border: "rgba(16,217,161,0.2)" },
                  { icon: "🎯", text: t("premium.discBullet2"), color: "#7eb8ff", bg: "rgba(91,138,247,0.07)", border: "rgba(91,138,247,0.2)" },
                  { icon: "⚠️", text: t("premium.discBullet3"), color: "#ffc852", bg: "rgba(245,166,35,0.07)", border: "rgba(245,166,35,0.2)" },
                ] as const).map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.08 + i * 0.07, duration: 0.35, ease: EASE }}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      background: b.bg,
                      border: `1px solid ${b.border}`,
                      borderRadius: 12, padding: "10px 14px",
                    }}
                  >
                    <span style={{ fontSize: 14, flexShrink: 0, lineHeight: 1.5 }}>{b.icon}</span>
                    <span style={{ fontSize: "clamp(11.5px,2vw,13px)", fontWeight: 700, color: "rgba(255,255,255,0.82)", lineHeight: 1.5 }}>
                      <span style={{ color: b.color }}></span>{b.text}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Spam warning — always visible, high contrast */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35, duration: 0.4 }}
                style={{
                  marginTop: 12,
                  display: "flex", alignItems: "center", gap: 10,
                  background: "rgba(255,80,80,0.07)",
                  border: "1px solid rgba(255,80,80,0.28)",
                  borderRadius: 12, padding: "11px 14px",
                }}
              >
                <span style={{ fontSize: 17, flexShrink: 0 }}>📧</span>
                <span style={{ fontSize: "clamp(11.5px,2vw,13px)", fontWeight: 800, color: "rgba(255,200,200,0.9)", lineHeight: 1.5 }}>
                  {t("premium.spamNote")}
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ── Owner's Testimony ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: EASE }}
          style={{ marginBottom: 28, position: "relative", overflow: "hidden" }}
        >
          <div style={{
            position: "relative",
            background: "linear-gradient(135deg, rgba(245,166,35,0.07) 0%, rgba(91,138,247,0.05) 50%, rgba(245,166,35,0.04) 100%)",
            borderRadius: 20,
            padding: 1,
          }}>
            {/* Gradient border */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: 20,
              background: "linear-gradient(135deg, rgba(245,166,35,0.7) 0%, rgba(91,138,247,0.5) 50%, rgba(245,166,35,0.5) 100%)",
              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              padding: 1,
              pointerEvents: "none",
            }} />

            <div style={{
              background: "rgba(6,6,18,0.94)",
              borderRadius: 19,
              padding: "clamp(20px,3.5vw,32px) clamp(20px,3.5vw,36px)",
              backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
              position: "relative", overflow: "hidden",
            }}>
              {/* Shimmer */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ repeat: Infinity, repeatDelay: 8, duration: 1.2, ease: "easeInOut" }}
                style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(105deg, transparent 35%, rgba(245,166,35,0.04) 50%, transparent 65%)", transform: "skewX(-15deg)" }}
              />

              {/* Ambient gold glow top-right */}
              <div style={{ position: "absolute", top: -30, right: -20, width: 160, height: 120, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(245,166,35,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />

              <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
                {/* Crown icon column */}
                <motion.div
                  animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: "linear-gradient(135deg, rgba(245,166,35,0.18) 0%, rgba(255,200,82,0.08) 100%)",
                    border: "1px solid rgba(245,166,35,0.45)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22,
                    boxShadow: "0 0 24px rgba(245,166,35,0.15)",
                  }}
                >👑</motion.div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Label */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.22em", color: "#ffc852" }}>
                      ÖMER — KİŞİSEL BEYAN
                    </div>
                    <div style={{ width: 1, height: 10, background: "rgba(245,166,35,0.3)" }} />
                    <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>
                      OMER — PERSONAL STATEMENT
                    </div>
                  </div>

                  {/* Opening quote mark */}
                  <div style={{ fontSize: 48, lineHeight: 0.6, color: "rgba(245,166,35,0.22)", fontFamily: "Georgia, serif", marginBottom: 10, userSelect: "none" }}>"</div>

                  {/* Statement */}
                  <p style={{
                    margin: "0 0 16px",
                    fontSize: "clamp(13px,2.2vw,15.5px)",
                    fontWeight: 700,
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.88)",
                    letterSpacing: "0.005em",
                  }}>
                    {t("premium.ownerStatement")}
                  </p>

                  {/* Signature row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ height: 1, flex: 1, maxWidth: 48, background: "linear-gradient(90deg, rgba(245,166,35,0.5), transparent)" }} />
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      background: "rgba(245,166,35,0.08)",
                      border: "1px solid rgba(245,166,35,0.28)",
                      borderRadius: 999, padding: "5px 14px",
                    }}>
                      <span style={{ fontSize: 11 }}>✍️</span>
                      <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", color: "#ffc852", fontFamily: "'Outfit', sans-serif" }}>Ömer</span>
                    </div>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      background: "rgba(16,217,161,0.07)",
                      border: "1px solid rgba(16,217,161,0.22)",
                      borderRadius: 999, padding: "5px 12px",
                    }}>
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                        style={{ width: 5, height: 5, borderRadius: "50%", background: "#10d9a1", display: "block", flexShrink: 0 }}
                      />
                      <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "#4aedc0" }}>
                        {t("premium.heroLive")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Tactic cards ── */}
        {(() => {
          const highlights = tactics.filter(t => t.fireTactic || t.battleTactic);
          const classics   = tactics.filter(t => !t.fireTactic && !t.battleTactic);
          return (
            <>
              {highlights.length > 0 && (
                <>
                  <motion.div
                    initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
                    transition={{ duration:0.4, ease:EASE }}
                    style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}
                  >
                    <div style={{ height:1, flex:1, background:'linear-gradient(90deg,rgba(255,80,0,0.5),transparent)' }} />
                    <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,60,0,0.08)', border:'1px solid rgba(255,60,0,0.3)', borderRadius:999, padding:'6px 16px' }}>
                      <motion.span animate={{ opacity:[1,0.4,1] }} transition={{ duration:1.4, repeat:Infinity }}
                        style={{ width:6, height:6, borderRadius:'50%', background:'#ff5500', display:'block', flexShrink:0, boxShadow:'0 0 8px #ff5500' }} />
                      <span style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.18em', color:'#ff8844' }}>{t('premium.newTacticsTitle')}</span>
                    </div>
                    <div style={{ height:1, flex:1, background:'linear-gradient(90deg,transparent,rgba(255,80,0,0.5))' }} />
                  </motion.div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap:18, marginBottom:32 }}>
                    {highlights.map((tactic,i) =>
                      isPremium
                        ? <HighlightCard key={tactic.id} tactic={tactic} index={i} />
                        : <HighlightTeaserCard key={tactic.id} tactic={tactic} index={i} />
                    )}
                  </div>
                </>
              )}
              {classics.length > 0 && (
                <>
                  <motion.div
                    initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
                    transition={{ duration:0.4, ease:EASE }}
                    style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}
                  >
                    <div style={{ height:1, flex:1, background:'linear-gradient(90deg,rgba(91,138,247,0.4),transparent)' }} />
                    <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(91,138,247,0.07)', border:'1px solid rgba(91,138,247,0.25)', borderRadius:999, padding:'6px 16px' }}>
                      <span style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.18em', color:'rgba(91,138,247,0.85)' }}>{t('premium.classicTacticsTitle')}</span>
                    </div>
                    <div style={{ height:1, flex:1, background:'linear-gradient(90deg,transparent,rgba(91,138,247,0.4))' }} />
                  </motion.div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap:18 }}>
                    {classics.map((tactic,i) =>
                      isPremium
                        ? <TacticCard key={tactic.id} tactic={tactic} index={i} />
                        : <TeaserCard key={tactic.id} tactic={tactic} index={i} />
                    )}
                  </div>
                </>
              )}
            </>
          );
        })()}
      </div>
    </section>
  );
}
