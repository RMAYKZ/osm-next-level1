import { motion } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";
import { siteMeta } from "../data/tactics";

const EASE = [0.16, 1, 0.3, 1] as const;

const ICON_HOVER = { scale: 1.15, y: -3, transition: { duration: 0.15 } };
const ICON_TAP = { scale: 0.9 };

export default function Footer() {
  const { t } = useLang();

  return (
    <footer style={{
      position: "relative",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(5,7,18,0.98)",
    }}>
      {/* top accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.3), rgba(251,191,36,0.3), transparent)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(40px,6vw,72px) clamp(16px,4vw,40px)" }}>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "clamp(28px,4vw,48px)", marginBottom: 40 }}>

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 13,
                background: "linear-gradient(135deg, #22d3ee, #818cf8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, color: "#0a0d1e", fontSize: 18,
                boxShadow: "0 4px 16px rgba(34,211,238,0.3)",
              }}>O</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#e2e8f0", letterSpacing: "0.02em" }}>OSM NEXT LEVEL</div>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(100,116,139,0.55)" }}>OSM Tactics 26/27</div>
              </div>
            </div>
            <p style={{ margin: "0 0 20px", fontSize: 13, lineHeight: 1.7, color: "rgba(148,163,184,0.6)" }}>
              16+ {t("hero.years")} — {t("footer.rights")}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { href: siteMeta.social?.facebook, bg: "#1877F2", shadow: "rgba(24,119,242,0.3)", icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /> },
                { href: siteMeta.social?.instagram, bg: "linear-gradient(135deg,#f59e0b,#ec4899,#8b5cf6)", shadow: "rgba(236,72,153,0.3)", icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.848 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /> },
                { href: "https://www.youtube.com/@OSMNextLevel", bg: "#FF0000", shadow: "rgba(255,0,0,0.3)", icon: <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /> },
              ].map((s, i) => (
                <motion.a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={ICON_HOVER}
                  whileTap={ICON_TAP}
                  style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: s.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 4px 12px ${s.shadow}`,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">{s.icon}</svg>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08, ease: EASE }}
          >
            <h4 style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(148,163,184,0.5)" }}>
              {t("footer.nav")}
            </h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { href: "#anasayfa",    label: t("nav.home")       },
                { href: "#anti-taktik", label: t("nav.anti")       },
                { href: "#formasyonlar",label: t("nav.formations") },
                { href: "#hakkimda",    label: t("nav.about")      },
                { href: "#yorumlar",    label: t("footer.comments")},
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    style={{
                      fontSize: 13, color: "rgba(148,163,184,0.55)",
                      textDecoration: "none", transition: "color 0.15s",
                      display: "inline-block",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#22d3ee")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(148,163,184,0.55)")}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.16, ease: EASE }}
          >
            <h4 style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(148,163,184,0.5)" }}>
              {t("footer.contact")}
            </h4>
            <ul style={{ listStyle: "none", margin: "0 0 20px", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <li style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(148,163,184,0.55)" }}>
                <span>🎮</span> OSM: <span style={{ color: "#e2e8f0", fontWeight: 700 }}>omerovvvvv</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(148,163,184,0.55)" }}>
                <span>🏆</span> 26/27 · <span style={{ color: "#34d399", fontWeight: 700 }}>{t("footer.active")}</span>
              </li>
            </ul>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { href: "https://www.facebook.com/omercarla", bg: "#1877F2", shadow: "rgba(24,119,242,0.3)", icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/> },
                { href: "https://www.instagram.com/carlaomer/", bg: "linear-gradient(135deg,#f59e0b,#ec4899,#8b5cf6)", shadow: "rgba(236,72,153,0.3)", icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.848 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/> },
                { href: "https://www.youtube.com/@OSMNextLevel", bg: "#FF0000", shadow: "rgba(255,0,0,0.3)", icon: <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/> },
              ].map((s, i) => (
                <motion.a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={ICON_HOVER}
                  whileTap={ICON_TAP}
                  style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: s.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 4px 12px ${s.shadow}`,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">{s.icon}</svg>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10,
        }}>
          <p style={{ margin: 0, fontSize: 11, color: "rgba(100,116,139,0.5)" }}>
            © 2026 OMEROVVVVV · {t("footer.rights")}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "rgba(100,116,139,0.5)", textAlign: "right" }}>
            {t("footer.disclaimer")}
          </p>
        </div>
      </div>
    </footer>
  );
}
