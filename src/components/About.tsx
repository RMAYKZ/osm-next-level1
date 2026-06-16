import { motion } from "framer-motion";
import { siteMeta } from "../data/tactics";
import { useLang } from "../contexts/LanguageContext";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function About() {
  const { t } = useLang();

  return (
    <section id="hakkimda" style={{ position: "relative", overflow: "hidden", padding: "clamp(48px,7vw,96px) 0", background: "#070711" }}>

      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(91,138,247,0.2), rgba(145,97,245,0.2), transparent)",
        }} />
        <motion.div
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{
            position: "absolute", top: "5%", left: "-5%",
            width: "40%", height: "50%", borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(91,138,247,0.08) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <motion.div
          animate={{ opacity: [0.10, 0.25, 0.10] }}
          transition={{ duration: 11, repeat: Infinity, delay: 3 }}
          style={{
            position: "absolute", bottom: "10%", right: "-8%",
            width: "35%", height: "45%", borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(245,166,35,0.07) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ marginBottom: "clamp(28px,4vw,48px)" }}
        >
          <div className="g-section-header">
            <div className="editorial-header-inner">
              <div className="editorial-header-kicker">{t("about.legacyBadge")}</div>
              <div className="editorial-header-title" style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)" }}>
                <span className="g-text-blue">{t("about.legacyTitleA")}</span>{" "}
                <span style={{ color: "rgba(255,255,255,0.7)" }}>{t("about.legacyTitleB")}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Identity + Quote — 2-col grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: "clamp(28px,5vw,64px)",
          alignItems: "start",
          marginBottom: "clamp(28px,4vw,48px)",
        }}>

          {/* Left — identity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: EASE }}
            style={{ position: "relative", zIndex: 1 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.8, color: "rgba(255,255,255,0.5)" }}>{t("about.legacyP1")}</p>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.8, color: "rgba(255,255,255,0.5)" }}>{t("about.legacyP2")}</p>
            </div>

            {/* Stat highlights */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
              {[
                { val: "16+", lbl: "Years", color: "#5b8af7", bg: "rgba(91,138,247,0.08)", border: "rgba(91,138,247,0.2)" },
                { val: "#1",  lbl: "World",  color: "#f5a623", bg: "rgba(245,166,35,0.08)", border: "rgba(245,166,35,0.2)" },
                { val: "100+", lbl: "Tactics", color: "#10d9a1", bg: "rgba(16,217,161,0.08)", border: "rgba(16,217,161,0.2)" },
              ].map((s) => (
                <div key={s.lbl} style={{
                  padding: "12px 18px", borderRadius: 12,
                  background: s.bg, border: `1px solid ${s.border}`,
                  textAlign: "center", minWidth: 72,
                }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 900, color: s.color, fontFamily: "'Outfit', system-ui, sans-serif" }}>{s.val}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.12, ease: EASE }}
            className="g-card-blue"
            style={{ padding: "clamp(20px,4vw,36px)" }}
          >
            {/* Quote decoration */}
            <div style={{ fontSize: 48, lineHeight: 1, color: "rgba(91,138,247,0.25)", fontFamily: "Georgia, serif", marginBottom: 8, marginTop: -8 }}>"</div>

            <div style={{
              fontSize: "clamp(1.1rem,2.5vw,1.55rem)", fontWeight: 900, fontStyle: "italic",
              color: "#ffffff", lineHeight: 1.4, marginBottom: 14,
            }}>
              {t("about.quoteA")}{" "}
              <br />
              <span className="g-text-blue" style={{ fontStyle: "normal" }}>{t("about.quoteB")}</span>
            </div>

            <p style={{ margin: "0 0 22px", fontSize: 13.5, lineHeight: 1.75, color: "rgba(255,255,255,0.45)", fontStyle: "italic" }}>
              {t("about.quoteP")}
            </p>

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              paddingTop: 18, borderTop: "1px solid rgba(91,138,247,0.18)",
            }}>
              <div className="g-text-gold" style={{ fontSize: "clamp(1.2rem,2.5vw,1.6rem)", fontWeight: 900, letterSpacing: "-0.02em" }}>
                {siteMeta.motto}
              </div>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: 24 }}
              >⚽</motion.div>
            </div>
          </motion.div>
        </div>

        {/* ── Important notice ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: EASE }}
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: "clamp(20px,4vw,36px)",
          }}
        >
          <h3 style={{
            margin: "0 0 18px",
            fontSize: "clamp(1rem,2.5vw,1.3rem)",
            fontWeight: 900, color: "#ffffff",
            paddingBottom: 14,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ color: "#f5a623" }}>⚠️</span> {t("about.noticeTitle")}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24 }}>
            {[
              {
                icon: "🚫",
                title: t("about.noMagicTitle"),
                p1: t("about.noMagicP1"),
                p2: t("about.noMagicP2"),
                color: "#f43f5e",
              },
              {
                icon: "🧠",
                title: t("about.logicTitle"),
                p1: t("about.logicP1"),
                p2: t("about.logicP2"),
                color: "#10d9a1",
              },
            ].map((col) => (
              <div key={col.title} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: 7 }}>
                  <span>{col.icon}</span> {col.title}
                </p>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.45)" }}>{col.p1}</p>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.45)" }}>{col.p2}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
