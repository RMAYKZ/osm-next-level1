import { motion } from "framer-motion";
import { getLocalizedChangelog } from "../data/extras";
import { useLang } from "../contexts/LanguageContext";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function CommunityHub() {
  const { t } = useLang();
  const localizedChangelog = getLocalizedChangelog(t);

  return (
    <section id="topluluk" style={{ position: "relative", overflow: "hidden", padding: "clamp(40px,6vw,72px) 0", background: "transparent" }}>

      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(16,217,161,0.2) 35%, rgba(91,138,247,0.2) 65%, transparent)",
        }} />
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: EASE }}
          style={{ marginBottom: 24, textAlign: "center" }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(16,217,161,0.08)", border: "1px solid rgba(16,217,161,0.25)",
            borderRadius: 999, padding: "5px 14px", marginBottom: 12,
          }}>
            <span style={{ fontSize: 12 }}>📰</span>
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#4aedc0" }}>
              {t("hub.changelogBadge")}
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#ffffff" }}>
            {t("hub.changelogTitle")}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: EASE }}
          style={{
            background: "rgba(16,217,161,0.04)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(16,217,161,0.14)",
            borderRadius: 16,
            padding: "clamp(16px,3vw,28px)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {localizedChangelog.map((entry, index) => (
              <div
                key={index}
                style={{
                  background: "rgba(16,217,161,0.03)",
                  border: "1px solid rgba(16,217,161,0.1)",
                  borderRadius: 12, padding: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em",
                    borderRadius: 999, padding: "3px 10px",
                    background: "rgba(16,217,161,0.1)",
                    color: "#4aedc0",
                  }}>{entry.typeLabel}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{entry.date}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#ffffff", marginBottom: 4 }}>{entry.title}</div>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "rgba(255,255,255,0.42)" }}>{entry.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
