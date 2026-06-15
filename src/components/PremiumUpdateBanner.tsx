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
  const { lang } = useLang();
  const [hidden, setHidden] = useState(() => isDismissed());

  const isRTL = lang === "ar";
  const now = new Date();
  const month = (MONTH_NAMES[lang] ?? MONTH_NAMES.en)[now.getMonth()];
  const year  = now.getFullYear();
  const copy  = COPY[lang] ?? COPY.en;

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* */ }
    setHidden(true);
  }

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ overflow: "hidden" }}
        >
          <div
            dir={isRTL ? "rtl" : "ltr"}
            style={{
              position: "relative",
              background: "linear-gradient(135deg, rgba(12,8,2,0.97) 0%, rgba(24,14,2,0.97) 50%, rgba(10,6,1,0.97) 100%)",
              borderBottom: "1px solid rgba(251,191,36,0.22)",
              overflow: "hidden",
              fontFamily: "'Outfit','Segoe UI',system-ui,sans-serif",
            }}
          >
            {/* Shimmer sweep */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, repeatDelay: 4, duration: 1.1, ease: "easeInOut" }}
              style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "linear-gradient(105deg, transparent 30%, rgba(251,191,36,0.08) 50%, transparent 70%)",
                transform: "skewX(-15deg)",
              }}
            />

            {/* Subtle top line glow */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.5), rgba(239,68,68,0.3), transparent)",
            }} />

            {/* Content */}
            <div style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "14px clamp(16px,4vw,40px)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap" as const,
            }}>
              {/* Crown icon */}
              <motion.span
                animate={{ rotate: [-8, 8, -8], scale: [1, 1.12, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}
              >
                👑
              </motion.span>

              {/* Badge */}
              <motion.span
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 9, fontWeight: 900, letterSpacing: "0.14em",
                  textTransform: "uppercase" as const,
                  color: "#f59e0b",
                  background: "rgba(251,191,36,0.12)",
                  border: "1px solid rgba(251,191,36,0.3)",
                  borderRadius: 999,
                  padding: "3px 10px",
                  flexShrink: 0,
                  whiteSpace: "nowrap" as const,
                }}
              >
                <span style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: "#f59e0b",
                  boxShadow: "0 0 6px rgba(251,191,36,0.8)",
                  display: "inline-block", flexShrink: 0,
                }} />
                {copy.badge}
              </motion.span>

              {/* Text group */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{
                  fontSize: "clamp(12px, 2.2vw, 14px)",
                  fontWeight: 800,
                  color: "#f0e6c8",
                  lineHeight: 1.2,
                  letterSpacing: "0.01em",
                  marginBottom: 2,
                }}>
                  {copy.title(month, year)}
                </div>
                <div style={{
                  fontSize: "clamp(10px, 1.6vw, 12px)",
                  color: "rgba(251,191,36,0.52)",
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}>
                  {copy.sub}
                </div>
              </div>

              {/* CTA Button */}
              <motion.a
                href={siteConfig.premiumUrl}
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(251,191,36,0.4)" }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: "inline-flex", alignItems: "center",
                  flexShrink: 0,
                  background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                  borderRadius: 10,
                  padding: "8px 18px",
                  color: "#fff",
                  fontSize: "clamp(10px, 1.8vw, 12px)",
                  fontWeight: 900,
                  textDecoration: "none",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.08em",
                  boxShadow: "0 4px 18px rgba(245,158,11,0.28)",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {copy.cta}
              </motion.a>

              {/* Dismiss button */}
              <motion.button
                onClick={dismiss}
                whileHover={{ scale: 1.12, opacity: 1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Kapat"
                style={{
                  flexShrink: 0,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "50%",
                  width: 26, height: 26,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,0.3)",
                  cursor: "pointer",
                  fontSize: 12,
                  opacity: 0.6,
                  transition: "opacity 0.15s",
                }}
              >
                ✕
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
