import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePremium } from "../contexts/PremiumContext";
import { useLang } from "../contexts/LanguageContext";
import { siteConfig } from "../data/extras";

const SESSION_KEY = "osm-expiry-banner-dismissed";

function isDismissed(): boolean {
  try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
}

const COPY: Record<string, { badge: string; title: string; sub: string; cta: string; timeLeft: (h: number, m: number) => string }> = {
  tr: {
    badge: "⚠️ SON UYARI",
    title: "Premium Aboneliğin Sona Eriyor!",
    sub:   "Yenileme yapmazsan premium erişimin otomatik olarak kapanacak.",
    cta:   "Yenile",
    timeLeft: (h, m) => h > 0 ? `${h} saat ${m} dk kaldı` : `${m} dakika kaldı`,
  },
  en: {
    badge: "⚠️ FINAL WARNING",
    title: "Your Premium Expires Soon!",
    sub:   "Premium access will be automatically removed if not renewed.",
    cta:   "Renew",
    timeLeft: (h, m) => h > 0 ? `${h}h ${m}m left` : `${m} min left`,
  },
  hu: {
    badge: "⚠️ UTOLSÓ FIGYELMEZTETÉS",
    title: "Prémium előfizetésed hamarosan lejár!",
    sub:   "A prémium hozzáférés automatikusan megszűnik, ha nem újítod meg.",
    cta:   "Megújít",
    timeLeft: (h, m) => h > 0 ? `${h} óra ${m} perc van hátra` : `${m} perc van hátra`,
  },
  ar: {
    badge: "⚠️ تحذير أخير",
    title: "اشتراكك المميز على وشك الانتهاء!",
    sub:   "سيتم إلغاء الوصول المميز تلقائيًا إذا لم تجدد.",
    cta:   "تجديد",
    timeLeft: (h, m) => h > 0 ? `تبقى ${h} ساعة و${m} دقيقة` : `تبقى ${m} دقيقة`,
  },
  pt: {
    badge: "⚠️ AVISO FINAL",
    title: "Seu Premium vai expirar em breve!",
    sub:   "O acesso premium será removido automaticamente se não renovado.",
    cta:   "Renovar",
    timeLeft: (h, m) => h > 0 ? `Resta ${h}h ${m}min` : `Resta ${m} min`,
  },
};

export default function PremiumExpiryBanner() {
  const { expiringSoon, expiresAt } = usePremium();
  const { lang, t } = useLang();
  const [hidden, setHidden] = useState(() => isDismissed());
  const [entered, setEntered] = useState(false);

  if (!expiringSoon || hidden) return null;

  const copy = COPY[lang] ?? COPY.en;
  const isRTL = lang === "ar";

  const msLeft = expiresAt ? expiresAt.getTime() - Date.now() : 0;
  const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
  const minsLeft  = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));

  function dismiss() {
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* */ }
    setEntered(false);
    setHidden(true);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onAnimationComplete={() => setEntered(true)}
        style={{ overflow: entered ? "visible" : "hidden" }}
      >
        <div
          dir={isRTL ? "rtl" : "ltr"}
          style={{
            position: "relative",
            background: "linear-gradient(90deg,#120800 0%,#1a0c00 40%,#120800 100%)",
            borderBottom: "1px solid rgba(255,180,0,0.3)",
            overflow: "hidden",
            fontFamily: "var(--font-display,'Outfit'),'Segoe UI',system-ui,sans-serif",
          }}
        >
          {/* Amber top bar */}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
            background:"linear-gradient(90deg,#ff8800,#ffdd00,#ff8800)" }} />

          {/* Pulse glow */}
          <motion.div
            aria-hidden
            animate={{ opacity:[0.35,0.65,0.35] }}
            transition={{ duration:2, repeat:Infinity }}
            style={{
              position:"absolute", top:"-60%", insetInlineStart:"5%",
              width:300, height:300, borderRadius:"50%",
              background:"radial-gradient(circle,rgba(255,160,0,0.25) 0%,transparent 70%)",
              pointerEvents:"none",
            }}
          />

          {/* Content */}
          <div style={{
            position:"relative", maxWidth:1200, margin:"0 auto",
            padding:"14px clamp(16px,4vw,40px)",
            display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" as const,
          }}>

            {/* Warning icon */}
            <motion.div
              animate={{ scale:[1,1.15,1] }}
              transition={{ duration:1.2, repeat:Infinity }}
              style={{
                width:38, height:38, borderRadius:11, flexShrink:0,
                background:"linear-gradient(135deg,rgba(255,160,0,0.22),rgba(255,80,0,0.10))",
                border:"1px solid rgba(255,160,0,0.5)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:18,
              }}
            >
              ⚠️
            </motion.div>

            {/* Text group */}
            <div style={{ flex:1, minWidth:220 }}>
              {/* Badge */}
              <div style={{
                display:"inline-flex", alignItems:"center", gap:6, marginBottom:5,
                background:"linear-gradient(135deg,rgba(255,160,0,0.22),rgba(255,80,0,0.12))",
                border:"1px solid rgba(255,160,0,0.5)",
                borderRadius:999, padding:"2px 10px",
              }}>
                <motion.span
                  animate={{ opacity:[1,0.2,1] }}
                  transition={{ duration:0.9, repeat:Infinity }}
                  style={{ width:5, height:5, borderRadius:"50%", background:"#ffaa00",
                    display:"inline-block", flexShrink:0, boxShadow:"0 0 6px #ffaa00" }}
                />
                <span style={{ fontSize:8.5, fontWeight:900, letterSpacing:"0.18em",
                  textTransform:"uppercase", color:"#ffcc55" }}>{copy.badge}</span>
              </div>

              {/* Title */}
              <div style={{
                fontSize:"clamp(14px,2.2vw,17px)", fontWeight:800, lineHeight:1.2,
                letterSpacing:"-0.01em", marginTop:3,
                background:"linear-gradient(90deg,#ffe8a0,#ffbb44)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
              }}>
                {copy.title}
              </div>

              {/* Sub + time left */}
              <div style={{ display:"flex", flexWrap:"wrap" as const, gap:"6px 14px", marginTop:3 }}>
                <span style={{ fontSize:"clamp(10.5px,1.5vw,12.5px)", color:"rgba(255,200,80,0.8)", fontWeight:500, lineHeight:1.45 }}>
                  {copy.sub}
                </span>
                <span style={{
                  fontSize:"clamp(10px,1.4vw,12px)", fontWeight:800, color:"#ffdd66",
                  background:"rgba(255,160,0,0.15)", border:"1px solid rgba(255,160,0,0.3)",
                  borderRadius:6, padding:"1px 8px", lineHeight:1.8,
                }}>
                  {copy.timeLeft(hoursLeft, minsLeft)}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div aria-hidden style={{ width:1, height:34, background:"rgba(255,160,0,0.22)", flexShrink:0 }} className="hidden sm:block" />

            {/* CTA */}
            <motion.a
              href={siteConfig.premiumUrl}
              target="_blank"
              rel="noreferrer"
              whileHover={{ y:-1, boxShadow:"0 10px 28px -4px rgba(255,160,0,0.55)" }}
              whileTap={{ scale:0.97 }}
              transition={{ duration:0.18 }}
              style={{
                display:"inline-flex", alignItems:"center", flexShrink:0,
                background:"linear-gradient(135deg,#ff8800,#ffcc00)",
                borderRadius:10, padding:"10px 20px",
                color:"#1a0a00", fontSize:"clamp(11px,1.7vw,12px)", fontWeight:900,
                textDecoration:"none", textTransform:"uppercase" as const,
                letterSpacing:"0.07em", boxShadow:"0 6px 20px -4px rgba(255,140,0,0.5)",
                whiteSpace:"nowrap" as const,
              }}
            >
              {copy.cta} 🔄
            </motion.a>

            {/* Dismiss */}
            <button
              onClick={dismiss}
              aria-label={t("nav.close")}
              style={{
                flexShrink:0, background:"transparent", border:"none", borderRadius:"50%",
                width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center",
                color:"rgba(255,180,60,0.45)", cursor:"pointer", fontSize:13,
                transition:"color 0.15s,background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color="rgba(255,255,255,0.8)"; e.currentTarget.style.background="rgba(255,140,0,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color="rgba(255,180,60,0.45)"; e.currentTarget.style.background="transparent"; }}
            >
              ✕
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
