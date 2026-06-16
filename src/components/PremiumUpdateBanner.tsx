import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";
import { siteConfig } from "../data/extras";

// ── Month names per language ──────────────────────────────────────────
const MONTH_NAMES: Record<string, string[]> = {
  tr: ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  hu: ["Január","Február","Március","Április","Május","Június","Július","Augusztus","Szeptember","Október","November","December"],
  ar: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
  pt: ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
};

// ── Banner copy per language ──────────────────────────────────────────
const COPY: Record<string, { badge: string; title: (month: string, year: number) => string; sub: string; cta: string }> = {
  tr: {
    badge: "YENİ GÜNCELLEME",
    title: (m, y) => `${m} ${y} Premium Taktikleri Güncellendi`,
    sub:   "Bu ayın en güncel counter taktik kombinasyonlarına sahip ol — rakibini her formasyonda say.",
    cta:   "Hemen İncele 👑",
  },
  en: {
    badge: "NEW UPDATE",
    title: (m, y) => `${m} ${y} Premium Tactics Updated`,
    sub:   "Get this month's freshest counter tactic combinations — dominate every formation.",
    cta:   "Get Access 👑",
  },
  hu: {
    badge: "ÚJ FRISSÍTÉS",
    title: (m, y) => `${m} ${y} Prémium Taktikák Frissítve`,
    sub:   "Szerezd meg a hónap legfrissebb ellen-taktika kombinációit — dominálj minden felállás ellen.",
    cta:   "Hozzáférés 👑",
  },
  ar: {
    badge: "تحديث جديد",
    title: (m, y) => `تكتيكات ${m} ${y} المميزة محدّثة`,
    sub:   "احصل على أحدث مجموعات التكتيكات المضادة لهذا الشهر — سيطر على كل تشكيلة.",
    cta:   "احصل الآن 👑",
  },
  pt: {
    badge: "NOVA ATUALIZAÇÃO",
    title: (m, y) => `Táticas Premium de ${m} ${y} Atualizadas`,
    sub:   "Obtenha as combinações táticas contra mais recentes do mês — domine qualquer formação.",
    cta:   "Acessar Agora 👑",
  },
};

const DISMISS_KEY = "osm-premium-banner-dismissed";

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    // Dismiss for 3 days
    return Date.now() - ts < 3 * 24 * 60 * 60 * 1000;
  } catch { return false; }
}

export default function PremiumUpdateBanner() {
  const { lang, t } = useLang();
  const [hidden, setHidden] = useState(() => isDismissed());
  // Once the entry animation finishes, the wrapper's fixed pixel height
  // (measured at mount) is released back to natural "auto" + visible
  // overflow. Without this, a later font swap (Outfit loads via
  // display=swap, after the fallback system font already painted) can
  // reflow the subtitle onto a second line, which the still-clipped,
  // animation-locked height then cuts off entirely — the banner text
  // silently disappears on first mobile load.
  const [entered, setEntered] = useState(false);

  const isRTL = lang === "ar";
  const now = new Date();
  const month = (MONTH_NAMES[lang] ?? MONTH_NAMES.en)[now.getMonth()];
  const year  = now.getFullYear();
  const copy  = COPY[lang] ?? COPY.en;

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* */ }
    setEntered(false);
    setHidden(true);
  }

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onAnimationComplete={() => setEntered(true)}
          style={{ overflow: entered ? "visible" : "hidden" }}
        >
          <div
            dir={isRTL ? "rtl" : "ltr"}
            style={{
              position: "relative",
              background: "#0c0904",
              borderBottom: "1px solid rgba(245,166,35,0.18)",
              overflow: "hidden",
              fontFamily: "var(--font-display, 'Outfit'), 'Segoe UI', system-ui, sans-serif",
            }}
          >
            {/* Ambient gold glow, fixed in one corner — depth without a busy gradient */}
            <div aria-hidden style={{
              position: "absolute", top: "-60%", insetInlineStart: "8%",
              width: 320, height: 320, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(245,166,35,0.16) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            {/* One-time shimmer sweep on mount — not a perpetual loop */}
            <motion.div
              initial={{ x: "-120%" }}
              animate={{ x: "220%" }}
              transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "linear-gradient(105deg, transparent 35%, rgba(245,166,35,0.10) 50%, transparent 65%)",
                transform: "skewX(-15deg)",
              }}
            />

            {/* Top hairline */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: "linear-gradient(90deg, transparent, var(--c-gold), var(--c-rose), transparent)",
              opacity: 0.55,
            }} />

            {/* Content */}
            <div style={{
              position: "relative",
              maxWidth: 1200,
              margin: "0 auto",
              padding: "16px clamp(16px,4vw,40px)",
              display: "flex",
              alignItems: "center",
              gap: 18,
              flexWrap: "wrap" as const,
            }}>
              {/* Icon chip — replaces the loose floating emoji with one designed unit */}
              <div style={{
                width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                background: "linear-gradient(135deg, rgba(245,166,35,0.18), rgba(255,200,82,0.07))",
                border: "1px solid rgba(245,166,35,0.32)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17,
              }}>
                👑
              </div>

              {/* Text group */}
              <div style={{ flex: 1, minWidth: 220 }}>
                <span className="g-badge g-badge-gold" style={{ marginBottom: 5, transform: "translateY(-1px)" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-gold-l)", display: "inline-block", flexShrink: 0 }} />
                  {copy.badge}
                </span>
                <div style={{
                  fontSize: "clamp(15px, 2.4vw, 18px)",
                  fontWeight: 800,
                  color: "#fbf3e3",
                  lineHeight: 1.25,
                  letterSpacing: "-0.01em",
                  marginTop: 4,
                }}>
                  {copy.title(month, year)}
                </div>
                <div style={{
                  fontSize: "clamp(11px, 1.6vw, 13px)",
                  color: "rgba(255,200,82,0.8)",
                  fontWeight: 500,
                  lineHeight: 1.45,
                  marginTop: 2,
                }}>
                  {copy.sub}
                </div>
              </div>

              {/* Divider — separates the message from the action */}
              <div aria-hidden style={{ width: 1, height: 34, background: "rgba(245,166,35,0.16)", flexShrink: 0 }} className="hidden sm:block" />

              {/* CTA Button */}
              <motion.a
                href={siteConfig.premiumUrl}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -1, boxShadow: "0 10px 28px -6px rgba(245,166,35,0.45)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: "inline-flex", alignItems: "center",
                  flexShrink: 0,
                  background: "linear-gradient(135deg, var(--c-gold), var(--c-rose))",
                  borderRadius: 10,
                  padding: "11px 22px",
                  color: "#1a0f02",
                  fontSize: "clamp(11px, 1.8vw, 12px)",
                  fontWeight: 800,
                  textDecoration: "none",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.06em",
                  boxShadow: "0 6px 20px -6px rgba(245,166,35,0.5)",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {copy.cta}
              </motion.a>

              {/* Dismiss button */}
              <button
                onClick={dismiss}
                aria-label={t("nav.close")}
                style={{
                  flexShrink: 0,
                  background: "transparent",
                  border: "none",
                  borderRadius: "50%",
                  width: 28, height: 28,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,0.35)",
                  cursor: "pointer",
                  fontSize: 13,
                  transition: "color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
