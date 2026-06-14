import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function FAQSection() {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      id="faq"
      style={{ position: "relative", padding: "clamp(48px,7vw,88px) 0", overflow: "hidden" }}
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      {/* ambient */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div style={{
          position: "absolute", top: "10%", right: "-5%",
          width: "35%", height: "50%", borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.35), transparent)",
        }} />
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ marginBottom: 40, textAlign: "center" }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 999, padding: "5px 14px", marginBottom: 14,
          }}>
            <span style={{ fontSize: 12 }}>💬</span>
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#818cf8" }}>
              {t("faq.badge")}
            </span>
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: "clamp(1.6rem,4vw,2.8rem)",
              fontWeight: 900, lineHeight: 1.12, letterSpacing: "-0.02em", color: "#e2e8f0",
            }}
          >
            {t("faq.title")}
          </h2>
        </motion.div>

        {/* Accordion */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3, 4, 5].map((n, idx) => {
            const isOpen = open === n;
            return (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.42, delay: idx * 0.06, ease: EASE }}
                style={{
                  overflow: "hidden", borderRadius: 16,
                  background: isOpen ? "rgba(9,11,33,0.92)" : "rgba(9,11,33,0.7)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: `1px solid ${isOpen ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.07)"}`,
                  boxShadow: isOpen ? "0 0 24px rgba(99,102,241,0.1)" : "none",
                  transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
                }}
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : n)}
                  style={{
                    display: "flex", width: "100%", alignItems: "flex-start",
                    justifyContent: "space-between", gap: 16,
                    padding: "18px 22px", textAlign: "left",
                    background: "none", border: "none", cursor: "pointer",
                  }}
                  aria-expanded={isOpen}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 7, flexShrink: 0, marginTop: 1,
                      background: isOpen ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isOpen ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 900, color: isOpen ? "#818cf8" : "rgba(148,163,184,0.5)",
                      transition: "all 0.2s", flexDirection: "column" as const,
                    }}>
                      {n}
                    </div>
                    <h3
                      style={{
                        margin: 0, fontSize: "clamp(13px,2vw,15px)",
                        fontWeight: 700, lineHeight: 1.45,
                        color: isOpen ? "#e2e8f0" : "rgba(226,232,240,0.8)",
                        transition: "color 0.2s",
                      }}
                      itemProp="name"
                    >
                      {t(`faq.q${n}`)}
                    </h3>
                  </div>

                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.22, ease: EASE }}
                    style={{
                      flexShrink: 0, marginTop: 2,
                      width: 24, height: 24, borderRadius: "50%",
                      background: isOpen ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isOpen ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.07)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: isOpen ? "#818cf8" : "rgba(148,163,184,0.5)",
                      fontSize: 16, fontWeight: 300, lineHeight: 1,
                      transition: "background 0.2s, border-color 0.2s",
                    }}
                    aria-hidden="true"
                  >+</motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: EASE }}
                      style={{ overflow: "hidden" }}
                      itemScope
                      itemProp="acceptedAnswer"
                      itemType="https://schema.org/Answer"
                    >
                      <p
                        style={{
                          margin: 0,
                          padding: "0 22px 20px 60px",
                          fontSize: 13.5, lineHeight: 1.75,
                          color: "rgba(148,163,184,0.8)",
                          borderTop: "1px solid rgba(255,255,255,0.05)",
                          paddingTop: 14,
                        }}
                        itemProp="text"
                      >
                        {t(`faq.a${n}`)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
