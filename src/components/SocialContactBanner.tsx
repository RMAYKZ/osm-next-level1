import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";

const SESSION_KEY = "osm-contact-banner-v1";

const MARQUEE_STYLE = `
@keyframes osm-marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.osm-marquee-track {
  display: flex;
  width: max-content;
  animation: osm-marquee 24s linear infinite;
  will-change: transform;
}
`;

export default function SocialContactBanner() {
  const { t } = useLang();
  const [dismissed, setDismissed] = useState(() =>
    typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1"
  );

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setDismissed(true);
  };

  const msg = t("footer.contactNote");
  const chunk = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 36px", whiteSpace: "nowrap" }}>
      <span style={{ fontSize: 13, flexShrink: 0 }}>💬</span>
      <span style={{
        fontSize: 11, fontWeight: 800,
        color: "#ffc852",
        letterSpacing: "0.04em",
      }}>
        {msg}
      </span>
      <span style={{ color: "rgba(255,200,82,0.3)", fontSize: 10, userSelect: "none", flexShrink: 0 }}>✦</span>
    </span>
  );

  return (
    <>
      <style>{MARQUEE_STYLE}</style>
      <AnimatePresence>
        {!dismissed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden", position: "relative", zIndex: 49 }}
          >
            <div style={{
              background: "linear-gradient(90deg, rgba(245,166,35,0.13) 0%, rgba(91,138,247,0.10) 50%, rgba(245,166,35,0.13) 100%)",
              borderBottom: "1px solid rgba(245,166,35,0.22)",
              display: "flex", alignItems: "center",
              height: 34,
              overflow: "hidden",
              position: "relative",
            }}>
              {/* Left fade */}
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0, width: 28, zIndex: 2,
                background: "linear-gradient(90deg, rgba(7,7,17,0.7), transparent)",
                pointerEvents: "none",
              }} />

              {/* Scrolling ticker — 4 copies so there's no gap at any viewport */}
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div className="osm-marquee-track">
                  {[0, 1, 2, 3].map((n) => (
                    <span key={n}>{chunk}</span>
                  ))}
                </div>
              </div>

              {/* Right fade */}
              <div style={{
                position: "absolute", right: 34, top: 0, bottom: 0, width: 28, zIndex: 2,
                background: "linear-gradient(270deg, rgba(7,7,17,0.7), transparent)",
                pointerEvents: "none",
              }} />

              {/* Dismiss */}
              <button
                onClick={dismiss}
                aria-label="Dismiss"
                style={{
                  flexShrink: 0, width: 34, height: 34,
                  background: "none", border: "none",
                  color: "rgba(255,200,82,0.5)",
                  cursor: "pointer", fontSize: 13,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 3,
                }}
              >✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
