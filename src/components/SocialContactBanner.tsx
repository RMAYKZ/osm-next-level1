import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";

const SESSION_KEY = "osm-contact-banner-v1";

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

  return (
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
            height: 32,
            overflow: "hidden",
          }}>
            {/* Left fade */}
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0, width: 32, zIndex: 2,
              background: "linear-gradient(90deg, rgba(7,7,17,0.6), transparent)",
              pointerEvents: "none",
            }} />

            {/* Scrolling ticker */}
            <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
              <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                style={{ display: "flex", whiteSpace: "nowrap", width: "max-content" }}
              >
                {[0, 1].map((n) => (
                  <span key={n} style={{ display: "inline-flex", alignItems: "center" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      padding: "0 40px",
                    }}>
                      <span style={{ fontSize: 13 }}>💬</span>
                      <span style={{
                        fontSize: 11, fontWeight: 800,
                        color: "#ffc852",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}>
                        {msg}
                      </span>
                    </span>
                    <span style={{ color: "rgba(255,200,82,0.3)", fontSize: 10, userSelect: "none" }}>✦</span>
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right fade */}
            <div style={{
              position: "absolute", right: 34, top: 0, bottom: 0, width: 32, zIndex: 2,
              background: "linear-gradient(270deg, rgba(7,7,17,0.6), transparent)",
              pointerEvents: "none",
            }} />

            {/* Dismiss */}
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              style={{
                flexShrink: 0, width: 34, height: 32,
                background: "none", border: "none",
                color: "rgba(255,200,82,0.45)",
                cursor: "pointer", fontSize: 13,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "color 0.15s",
                zIndex: 3,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#ffc852")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,200,82,0.45)")}
            >✕</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
