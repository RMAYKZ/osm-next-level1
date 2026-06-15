import { motion } from "framer-motion";
import { siteMeta } from "../data/tactics";
import { useLang } from "../contexts/LanguageContext";

const EASE = [0.16, 1, 0.3, 1] as const;

const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
};

export default function About() {
  const { t } = useLang();

  return (
    <section id="hakkimda" style={{ position: "relative", overflow: "hidden", padding: "clamp(48px,7vw,96px) 0" }}>

      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
        }} />
        <motion.div
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{
            position: "absolute", top: "5%", left: "-5%",
            width: "40%", height: "50%", borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>
        {/* ── Identity + Quote — 2-col grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: "clamp(28px,5vw,64px)",
          alignItems: "start",
          marginBottom: "clamp(28px,4vw,48px)",
        }}>

          {/* Left — identity */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 999, padding: "5px 14px", marginBottom: 20,
            }}>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                style={{ width: 7, height: 7, borderRadius: "50%", background: "#ffffff", display: "block" }}
              />
              <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.7)" }}>
                {t("about.legacyBadge")}
              </span>
            </div>

            <h2 style={{ margin: "0 0 22px", fontSize: "clamp(2rem,5vw,3.8rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em" }}>
              <span style={{ color: "#ffffff" }}>{t("about.legacyTitleA")}</span>
              <br />
              <span style={{ color: "rgba(255,255,255,0.7)" }}>{t("about.legacyTitleB")}</span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.8, color: "rgba(255,255,255,0.42)" }}>{t("about.legacyP1")}</p>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.8, color: "rgba(255,255,255,0.42)" }}>{t("about.legacyP2")}</p>
            </div>
          </div>

          {/* Right — quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: EASE }}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: "clamp(20px,4vw,36px)",
            }}
          >
            <div style={{
              fontSize: "clamp(1.2rem,3vw,1.8rem)", fontWeight: 900, fontStyle: "italic",
              color: "#ffffff", lineHeight: 1.35, marginBottom: 14,
            }}>
              "{t("about.quoteA")}{" "}
              <br />
              <span style={{
                color: "rgba(255,255,255,0.7)",
                textTransform: "uppercase", fontStyle: "normal",
              }}>{t("about.quoteB")}"</span>
            </div>
            <p style={{ margin: "0 0 22px", fontSize: 13.5, lineHeight: 1.75, color: "rgba(255,255,255,0.42)", fontStyle: "italic" }}>
              {t("about.quoteP")}
            </p>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{
                fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, letterSpacing: "-0.02em",
                color: "#ffffff",
              }}>
                {siteMeta.motto}
              </div>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: 26 }}
              >⚽</motion.div>
            </div>
          </motion.div>
        </div>

        {/* ── Important notice — full width, always below everything ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: EASE }}
          style={{
            ...GLASS,
            padding: "clamp(20px,4vw,36px)",
          }}
        >
          <h3 style={{
            margin: "0 0 18px", fontSize: "clamp(1rem,2.5vw,1.4rem)", fontWeight: 900, color: "#ffffff",
            paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            {t("about.noticeTitle")}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#ffffff" }}>{t("about.noMagicTitle")}</p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.42)" }}>{t("about.noMagicP1")}</p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.42)" }}>{t("about.noMagicP2")}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#ffffff" }}>{t("about.logicTitle")}</p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.42)" }}>{t("about.logicP1")}</p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.42)" }}>{t("about.logicP2")}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
