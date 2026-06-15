import { useState } from "react";
import { motion } from "framer-motion";
import { getDb } from "../lib/firebase";
import { getLocalizedChangelog, siteConfig } from "../data/extras";
import { useLang } from "../contexts/LanguageContext";

const EASE = [0.16, 1, 0.3, 1] as const;

const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
};

export default function CommunityHub() {
  const { t } = useLang();
  const localizedChangelog = getLocalizedChangelog(t);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const subscribe = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setError(t("hub.emailInvalid"));
      return;
    }
    try {
      const [{ addDoc, collection, serverTimestamp }, db] = await Promise.all([
        import("firebase/firestore"),
        getDb(),
      ]);
      await addDoc(collection(db, "emails"), {
        email: email.trim().toLowerCase(),
        createdAt: serverTimestamp(),
      });
      setDone(true);
      setEmail("");
      setTimeout(() => setDone(false), 6000);
    } catch {
      setError(t("hub.emailError"));
    }
  };

  return (
    <section id="topluluk" style={{ position: "relative", overflow: "hidden", padding: "clamp(48px,7vw,96px) 0" }}>

      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", right: 0,
          width: "35%", height: "45%", borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)",
          filter: "blur(80px)",
        }} />
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ marginBottom: 40, textAlign: "center" }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 999, padding: "5px 14px", marginBottom: 14,
          }}>
            <span style={{ fontSize: 12 }}>🌐</span>
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.7)" }}>
              {t("hub.emailBadge")}
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: "clamp(1.8rem,4vw,3.2rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#ffffff" }}>
            {t("hub.emailTitle")}
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,320px), 1fr))", gap: 20 }}>

          {/* Email + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{ ...GLASS, padding: "clamp(20px,4vw,36px)" }}
          >
            <p style={{ margin: "0 0 18px", fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.42)" }}>
              {t("hub.emailDesc")}
            </p>

            <form onSubmit={subscribe} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder={t("hub.emailPlaceholder")}
                  style={{
                    flex: 1, minWidth: 160,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12, padding: "12px 16px", color: "#ffffff", fontSize: 14, outline: "none",
                  }}
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: "#ffffff",
                    borderRadius: 999, padding: "12px 20px",
                    color: "#000000", fontSize: 12, fontWeight: 900,
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    cursor: "pointer", border: "none", whiteSpace: "nowrap",
                  }}
                >
                  {t("hub.subscribe")}
                </motion.button>
              </div>
              {done && <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{t("hub.subscribeSuccess")}</p>}
              {error && <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>{error}</p>}
            </form>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 22 }}>
              <motion.a
                href={siteConfig.youtubeSubscribe}
                target="_blank" rel="noreferrer"
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12, padding: "12px 10px",
                  color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 900,
                  textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.08em",
                }}
              >
                ▶ {t("hub.youtubeCTA")}
              </motion.a>
              <motion.a
                href={siteConfig.donateUrl}
                target="_blank" rel="noreferrer"
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12, padding: "12px 10px",
                  color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 900,
                  textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.08em",
                }}
              >
                ☕ {t("nav.donate")}
              </motion.a>
            </div>
          </motion.div>

          {/* Changelog */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
            style={{ ...GLASS, padding: "clamp(20px,4vw,36px)" }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 999, padding: "4px 12px", marginBottom: 14,
            }}>
              <span style={{ fontSize: 10 }}>📰</span>
              <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.7)" }}>
                {t("hub.changelogBadge")}
              </span>
            </div>
            <h3 style={{ margin: "0 0 18px", fontSize: "clamp(1.1rem,2.5vw,1.5rem)", fontWeight: 900, color: "#ffffff" }}>
              {t("hub.changelogTitle")}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 320, overflowY: "auto" }}>
              {localizedChangelog.map((entry, index) => (
                <div
                  key={index}
                  style={{
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12, padding: 14,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em",
                      borderRadius: 999, padding: "3px 10px",
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.65)",
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
      </div>
    </section>
  );
}
