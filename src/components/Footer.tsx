import { motion } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";

const EASE = [0.16, 1, 0.3, 1] as const;

const SOCIAL = [
  {
    href: "https://www.facebook.com/omercarla",
    label: "Facebook",
    color: "#1877F2",
    bg: "rgba(24,119,242,0.10)",
    border: "rgba(24,119,242,0.25)",
    icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />,
  },
  {
    href: "https://www.instagram.com/carlaomer/",
    label: "Instagram",
    color: "#E1306C",
    bg: "rgba(225,48,108,0.10)",
    border: "rgba(225,48,108,0.25)",
    icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.848 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />,
  },
  {
    href: "https://www.youtube.com/@OSMNextLevel",
    label: "YouTube",
    color: "#FF0000",
    bg: "rgba(255,0,0,0.10)",
    border: "rgba(255,0,0,0.25)",
    icon: <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />,
  },
];

export default function Footer() {
  const { t } = useLang();

  return (
    <footer style={{ position: "relative", background: "#070711" }}>
      {/* Top gradient rule */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(91,138,247,0.3) 35%, rgba(145,97,245,0.3) 65%, transparent)" }} />

      {/* Ambient glow */}
      <div aria-hidden style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "60%", height: "40%",
        background: "radial-gradient(ellipse, rgba(91,138,247,0.06) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(40px,6vw,72px) clamp(16px,4vw,40px)", position: "relative", zIndex: 1 }}>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "clamp(28px,4vw,48px)", marginBottom: 44 }}>

          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "linear-gradient(135deg, rgba(91,138,247,0.15), rgba(145,97,245,0.08))",
                border: "1px solid rgba(91,138,247,0.28)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: 20,
                color: "transparent",
                backgroundImage: "linear-gradient(135deg, #5b8af7, #9161f5)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              } as React.CSSProperties}>O</div>
              <div>
                <div style={{
                  fontSize: 13, fontWeight: 900, letterSpacing: "0.02em",
                  background: "linear-gradient(135deg, #5b8af7, #9161f5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>OSM NEXT LEVEL</div>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.22)" }}>
                  OSM Tactics 26/27
                </div>
              </div>
            </div>

            <p style={{ margin: "0 0 20px", fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.4)" }}>
              16+ {t("hero.years")} — {t("footer.rights")}
            </p>

            <div style={{ display: "flex", gap: 8 }}>
              {SOCIAL.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.18s, border-color 0.18s",
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill={s.color}>{s.icon}</svg>
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
            <h4 style={{
              margin: "0 0 16px",
              fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em",
              background: "linear-gradient(135deg, #5b8af7, #9161f5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {t("footer.nav")}
            </h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
              {[
                { href: "#anasayfa",     label: t("nav.home"),        dot: "#5b8af7" },
                { href: "#anti-taktik",  label: t("nav.anti"),        dot: "#9161f5" },
                { href: "#formasyonlar", label: t("nav.formations"),  dot: "#10d9a1" },
                { href: "#hakkimda",     label: t("nav.about"),       dot: "#f5a623" },
                { href: "#yorumlar",     label: t("footer.comments"), dot: "#f43f5e" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      fontSize: 13, color: "rgba(255,255,255,0.42)",
                      textDecoration: "none", transition: "color 0.15s",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.42)";
                    }}
                  >
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: link.dot, flexShrink: 0, opacity: 0.7 }} />
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
            <h4 style={{
              margin: "0 0 16px",
              fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em",
              background: "linear-gradient(135deg, #f5a623, #ffc852)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {t("footer.contact")}
            </h4>
            <ul style={{ listStyle: "none", margin: "0 0 20px", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <li style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "rgba(255,255,255,0.42)" }}>
                <span style={{ color: "#5b8af7", fontSize: 10 }}>◈</span>
                OSM:&nbsp;<span style={{ color: "#fff", fontWeight: 700 }}>omerovvvvv</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "rgba(255,255,255,0.42)" }}>
                <span style={{ color: "#10d9a1", fontSize: 10 }}>◎</span>
                26/27 ·&nbsp;<span style={{ color: "#fff", fontWeight: 700 }}>{t("footer.active")}</span>
              </li>
              <li style={{ marginTop: 12 }}>
                <a
                  href="https://buymeacoffee.com/omerovvvvv"
                  target="_blank"
                  rel="noreferrer"
                  className="g-btn-gold"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11 }}
                >
                  ☕ Buy me a coffee
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10,
        }}>
          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.18)" }}>
            © 2026 <span style={{ color: "rgba(91,138,247,0.6)" }}>OMEROVVVVV</span> · {t("footer.rights")}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.18)", textAlign: "right" }}>
            {t("footer.disclaimer")}
          </p>
        </div>
      </div>
    </footer>
  );
}
