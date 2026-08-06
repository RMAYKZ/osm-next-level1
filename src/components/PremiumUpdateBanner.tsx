import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";
import { siteConfig } from "../data/extras";

const MONTH_NAMES: Record<string, string[]> = {
  tr: ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  hu: ["Január","Február","Március","Április","Május","Június","Július","Augusztus","Szeptember","Október","November","December"],
  ar: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
  pt: ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
};

const UPDATE_DATE = { day: 6, month: 7 /* 0-indexed = Ağustos/August */, year: 2026 };

const COPY: Record<string, { badge: string; title: (day: number, month: string, year: number) => string; sub: string; cta: string }> = {
  tr: {
    badge: "VIP GÜNCELLEME",
    title: (d, m, y) => `${d} ${m} ${y} — Premium Taktikler Güncellendi`,
    sub:   "En güncel ev ve deplasman taktikleri eklendi — rakibini her formasyonda geç!",
    cta:   "Hemen Gör",
  },
  en: {
    badge: "VIP UPDATE",
    title: (d, m, y) => `Premium Tactics Updated — ${m} ${d}, ${y}`,
    sub:   "New home & away tactics just added — dominate every formation starting now!",
    cta:   "View Now",
  },
  hu: {
    badge: "VIP FRISSÍTÉS",
    title: (d, m, y) => `Prémium Taktikák Frissítve — ${y}. ${m} ${d}.`,
    sub:   "Új hazai és vendég taktikák hozzáadva — dominálj minden felállás ellen!",
    cta:   "Megnéz",
  },
  ar: {
    badge: "تحديث VIP",
    title: (d, m, y) => `تكتيكات ${m} ${d} ${y} المميزة محدّثة`,
    sub:   "تكتيكات جديدة في الملعب وخارجه — سيطر على كل تشكيلة الآن!",
    cta:   "شاهد الآن",
  },
  pt: {
    badge: "ATUALIZAÇÃO VIP",
    title: (d, m, y) => `Táticas Premium Atualizadas — ${d} de ${m} de ${y}`,
    sub:   "Novas táticas para casa e fora adicionadas — domine qualquer formação!",
    cta:   "Ver Agora",
  },
};

// Bump suffix to force re-show after each update
const DISMISS_KEY = "osm-premium-banner-dismissed-20260806-v2";

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    return Date.now() - parseInt(raw, 10) < 3 * 24 * 60 * 60 * 1000;
  } catch { return false; }
}

export default function PremiumUpdateBanner() {
  const { lang, t } = useLang();
  const [hidden, setHidden] = useState(() => isDismissed());
  const [entered, setEntered] = useState(false);

  const isRTL = lang === "ar";
  const month = (MONTH_NAMES[lang] ?? MONTH_NAMES.en)[UPDATE_DATE.month];
  const { day, year } = UPDATE_DATE;
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
              background: "linear-gradient(90deg,#0a0805 0%,#120e08 45%,#0a0805 100%)",
              borderBottom: "1px solid rgba(245,166,35,0.28)",
              overflow: "hidden",
              fontFamily: "var(--font-display, 'Outfit'), 'Segoe UI', system-ui, sans-serif",
            }}
          >
            {/* Gold → electric hairline */}
            <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,#f5a623 0%,#fbbf24 35%,#fbbf24 55%,#22d3ee 100%)" }} />

            {/* Ambient gold glow, single source — cheap, static */}
            <div aria-hidden style={{
              position:"absolute", top:"-70%", insetInlineStart:"6%",
              width:260, height:260, borderRadius:"50%",
              background:"radial-gradient(circle,rgba(245,166,35,0.16) 0%,transparent 70%)",
              pointerEvents:"none",
            }} />

            {/* One-time shimmer sweep on mount — transform-only, cheap */}
            <motion.div
              initial={{ x:"-120%" }}
              animate={{ x:"220%" }}
              transition={{ duration:1.4, ease:[0.16,1,0.3,1], delay:0.3 }}
              style={{
                position:"absolute", inset:0, pointerEvents:"none",
                background:"linear-gradient(105deg,transparent 35%,rgba(245,166,35,0.09) 50%,transparent 65%)",
                transform:"skewX(-15deg)",
                willChange:"transform",
              }}
            />

            {/* Content */}
            <div style={{
              position:"relative", maxWidth:1200, margin:"0 auto",
              padding:"14px clamp(16px,4vw,40px)",
              display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" as const,
            }}>

              {/* Icon — diagonal-notched VIP chip, no filter animation (cheaper than drop-shadow pulse) */}
              <div style={{
                position: "relative",
                width:38, height:38, flexShrink:0,
                background:"linear-gradient(135deg,rgba(245,166,35,0.24),rgba(251,191,36,0.10))",
                border:"1px solid rgba(245,166,35,0.5)",
                borderRadius:10,
                clipPath:"polygon(0 0, 100% 0, 100% 100%, 22% 100%)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:16,
              }}>
                ✦
              </div>

              {/* Text group */}
              <div style={{ flex:1, minWidth:220 }}>
                {/* VIP badge */}
                <div style={{ display:"inline-flex", alignItems:"center", gap:6, marginBottom:5,
                  background:"linear-gradient(135deg,rgba(245,166,35,0.18),rgba(251,191,36,0.08))",
                  border:"1px solid rgba(245,166,35,0.45)",
                  borderRadius:999, padding:"2px 10px" }}>
                  <motion.span
                    animate={{ opacity:[1,0.25,1] }}
                    transition={{ duration:1.6, repeat:Infinity }}
                    style={{ width:5, height:5, borderRadius:"50%", background:"#22d3ee", display:"inline-block", flexShrink:0, boxShadow:"0 0 6px #22d3ee" }}
                  />
                  <span style={{ fontSize:8.5, fontWeight:900, letterSpacing:"0.18em", textTransform:"uppercase", color:"#fbbf24" }}>{copy.badge}</span>
                </div>

                {/* Title — solid color, no decorative gradient-clip */}
                <div style={{
                  fontSize:"clamp(14px,2.2vw,17px)", fontWeight:800, lineHeight:1.2,
                  letterSpacing:"-0.01em", marginTop:3,
                  color:"#fdf3e0",
                }}>
                  {copy.title(day, month, year)}
                </div>

                {/* Sub */}
                <div style={{ fontSize:"clamp(10.5px,1.5vw,12.5px)", color:"rgba(245,196,120,0.8)", fontWeight:500, lineHeight:1.45, marginTop:2 }}>
                  {copy.sub}
                </div>
              </div>

              {/* Divider */}
              <div aria-hidden style={{ width:1, height:34, background:"rgba(245,166,35,0.25)", flexShrink:0 }} className="hidden sm:block" />

              {/* CTA */}
              <motion.a
                href={siteConfig.premiumUrl}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y:-1, boxShadow:"0 8px 20px -6px rgba(245,166,35,0.6)" }}
                whileTap={{ scale:0.97 }}
                transition={{ duration:0.18, ease:[0.16,1,0.3,1] }}
                style={{
                  display:"inline-flex", alignItems:"center", flexShrink:0,
                  background:"linear-gradient(135deg,#f5a623,#fbbf24)",
                  borderRadius:10, padding:"10px 20px",
                  color:"#1a1000", fontSize:"clamp(11px,1.7vw,12px)", fontWeight:900,
                  textDecoration:"none", textTransform:"uppercase" as const,
                  letterSpacing:"0.07em", boxShadow:"0 4px 14px -4px rgba(245,166,35,0.45)",
                  whiteSpace:"nowrap" as const,
                }}
              >
                {copy.cta}
              </motion.a>

              {/* Dismiss */}
              <button
                onClick={dismiss}
                aria-label={t("nav.close")}
                style={{
                  flexShrink:0, background:"transparent", border:"none", borderRadius:"50%",
                  width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center",
                  color:"rgba(245,196,120,0.5)", cursor:"pointer", fontSize:13,
                  transition:"color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color="rgba(255,255,255,0.85)"; e.currentTarget.style.background="rgba(245,166,35,0.14)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color="rgba(245,196,120,0.5)"; e.currentTarget.style.background="transparent"; }}
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
