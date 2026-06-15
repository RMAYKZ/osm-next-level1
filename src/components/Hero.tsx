import { useRef, useEffect, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";
import { siteMeta } from "../data/tactics";

const EASE = [0.16, 1, 0.3, 1] as const;

const GLASS: React.CSSProperties = {
  background: "oklch(0.14 0.02 250 / 0.92)",
  border: "1px solid oklch(0.87 0.27 152 / 0.12)",
  borderRadius: 20,
};

// ── Multilingual strings for Hero copy not yet in translations.ts ─────────────
const HERO_STRINGS = {
  tr: {
    antiLabel:    "Anti-Taktik",
    antiDesc:     "Rakip formasyona karşı anında karşı-taktik bul",
    metaLabel:    "Haftalık Meta",
    metaDesc:     "Bu haftanın en güçlü meta taktikleri",
    premiumLabel: "Premium Taktikler",
    premiumDesc:  "16 yıllık deneyim ile test edilmiş premium taktikler",
    sliderLabel:  "Slider Hesap",
    sliderDesc:   "Baskı, Stil ve Tempo değerlerini hassas hesapla",
    ctaAnti:      "Anti-Taktik Bul",
    ctaSupport:   "Destek Ol",
    worldRank:    "DÜNYA LİDERİ",
    coachAlert:   "ANTRENÖR UYARISI",
    titleSub:     "TAKTİK ANALİZ MERKEZİ",
    seasonBadge:  "Sezon 26/27",
    rotating: ["Anti-Taktik Matrisi", "Haftalık Meta Taktikler", "Slider Hesaplama", "Premium Formasyon Analizi", "16 Yıllık OSM Deneyimi"],
  },
  en: {
    antiLabel:    "Anti-Tactic",
    antiDesc:     "Instantly counter any opponent formation",
    metaLabel:    "Weekly Meta",
    metaDesc:     "This week's most dominant meta tactics",
    premiumLabel: "Premium Tactics",
    premiumDesc:  "Elite tactics built on 16+ years of field data",
    sliderLabel:  "Slider Calc",
    sliderDesc:   "Calculate Pressure, Style & Tempo values",
    ctaAnti:      "Find Anti-Tactic",
    ctaSupport:   "Support",
    worldRank:    "WORLD RANK #1",
    coachAlert:   "COACH ALERT",
    titleSub:     "TACTICAL ANALYSIS CENTER",
    seasonBadge:  "Season 26/27",
    rotating: ["Anti-Tactic Matrix", "Weekly Meta Tactics", "Slider Calculator", "Premium Formation Analysis", "16 Years of OSM Experience"],
  },
  hu: {
    antiLabel:    "Anti-Taktika",
    antiDesc:     "Azonnal leállít bármilyen ellenfél formációt",
    metaLabel:    "Heti Meta",
    metaDesc:     "A hét legerősebb meta taktikái",
    premiumLabel: "Prémium Taktikák",
    premiumDesc:  "Elite taktikák 16+ éves tapasztalattal",
    sliderLabel:  "Csúszka Kalkulátor",
    sliderDesc:   "Nyomás, Stílus és Tempó értékek kiszámítása",
    ctaAnti:      "Anti-Taktika Keresés",
    ctaSupport:   "Támogatás",
    worldRank:    "VILÁG #1",
    coachAlert:   "EDZŐI FIGYELMEZTETÉS",
    titleSub:     "TAKTIKAI ELEMZÉSI KÖZPONT",
    seasonBadge:  "Szezon 26/27",
    rotating: ["Anti-Taktika Mátrix", "Heti Meta Taktikák", "Csúszka Számológép", "Prémium Formáció Analízis", "16 Év OSM Tapasztalat"],
  },
  ar: {
    antiLabel:    "مكافح التكتيك",
    antiDesc:     "تصدي فوري لأي تشكيلة للمنافس",
    metaLabel:    "ميتا أسبوعية",
    metaDesc:     "أقوى تكتيكات الميتا هذا الأسبوع",
    premiumLabel: "تكتيكات بريميوم",
    premiumDesc:  "تكتيكات نخبة مبنية على خبرة 16+ عاماً",
    sliderLabel:  "حساب المتزلجة",
    sliderDesc:   "احسب قيم الضغط والأسلوب والإيقاع",
    ctaAnti:      "ابحث عن مكافح التكتيك",
    ctaSupport:   "دعم",
    worldRank:    "المرتبة #1 عالمياً",
    coachAlert:   "تحذير المدرب",
    titleSub:     "مركز التحليل التكتيكي",
    seasonBadge:  "موسم 26/27",
    rotating: ["مصفوفة مكافحة التكتيك", "تكتيكات الميتا الأسبوعية", "آلة حساب المتزلجة", "تحليل التشكيلة بريميوم", "16 عاماً من خبرة OSM"],
  },
  pt: {
    antiLabel:    "Anti-Tática",
    antiDesc:     "Contrarie instantaneamente qualquer formação adversária",
    metaLabel:    "Meta Semanal",
    metaDesc:     "As táticas meta mais dominantes desta semana",
    premiumLabel: "Táticas Premium",
    premiumDesc:  "Táticas de elite com 16+ anos de dados reais",
    sliderLabel:  "Calc. Deslizante",
    sliderDesc:   "Calcule valores de Pressão, Estilo e Ritmo",
    ctaAnti:      "Encontrar Anti-Tática",
    ctaSupport:   "Apoiar",
    worldRank:    "RANK MUNDIAL #1",
    coachAlert:   "ALERTA DO TREINADOR",
    titleSub:     "CENTRO DE ANÁLISE TÁTICA",
    seasonBadge:  "Temporada 26/27",
    rotating: ["Matriz Anti-Tática", "Táticas Meta Semanais", "Calculadora Deslizante", "Análise de Formação Premium", "16 Anos de Experiência OSM"],
  },
} as const;

// ── Static visual config for feature cards (labels injected at render time) ──
const NG = "oklch(0.87 0.27 152)";
const FEATURE_DEFS = [
  { id: "anti-taktik", icon: "⚔️", accent: NG,        bg: "oklch(0.87 0.27 152 / 0.07)", border: "oklch(0.87 0.27 152 / 0.22)",  glow: "oklch(0.87 0.27 152 / 0.18)", lk: "antiLabel",    dk: "antiDesc"    },
  { id: "weekly-meta", icon: "📊", accent: NG,        bg: "oklch(0.87 0.27 152 / 0.05)", border: "oklch(0.87 0.27 152 / 0.16)", glow: "oklch(0.87 0.27 152 / 0.13)", lk: "metaLabel",    dk: "metaDesc"    },
  { id: "premium",     icon: "👑", accent: "#cccccc", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.12)", glow: "rgba(255,255,255,0.08)", lk: "premiumLabel", dk: "premiumDesc" },
  { id: "slider-calc", icon: "🎯", accent: NG,        bg: "oklch(0.87 0.27 152 / 0.06)", border: "oklch(0.87 0.27 152 / 0.18)",  glow: "oklch(0.87 0.27 152 / 0.14)", lk: "sliderLabel",  dk: "sliderDesc"  },
] as const;

// Animated pitch lines background
function PitchGrid() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.035]"
      viewBox="0 0 1440 700"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Outer pitch */}
      <rect x="80" y="40" width="1280" height="620" rx="4" fill="none" stroke="oklch(0.87 0.27 152 / 0.4)" strokeWidth="1.5" />
      {/* Center line */}
      <line x1="720" y1="40" x2="720" y2="660" stroke="oklch(0.87 0.27 152 / 0.35)" strokeWidth="1" />
      {/* Center circle */}
      <circle cx="720" cy="350" r="100" fill="none" stroke="oklch(0.87 0.27 152 / 0.35)" strokeWidth="1" />
      <circle cx="720" cy="350" r="3" fill="oklch(0.87 0.27 152 / 0.6)" />
      {/* Penalty areas */}
      <rect x="80" y="195" width="200" height="310" fill="none" stroke="oklch(0.87 0.27 152 / 0.28)" strokeWidth="1" />
      <rect x="1160" y="195" width="200" height="310" fill="none" stroke="oklch(0.87 0.27 152 / 0.28)" strokeWidth="1" />
      {/* Goal areas */}
      <rect x="80" y="280" width="80" height="140" fill="none" stroke="oklch(0.87 0.27 152 / 0.22)" strokeWidth="1" />
      <rect x="1280" y="280" width="80" height="140" fill="none" stroke="oklch(0.87 0.27 152 / 0.22)" strokeWidth="1" />
      {/* Penalty spots */}
      <circle cx="220" cy="350" r="3" fill="oklch(0.87 0.27 152 / 0.5)" />
      <circle cx="1220" cy="350" r="3" fill="oklch(0.87 0.27 152 / 0.5)" />
      {/* Corner arcs */}
      <path d="M80,40 Q96,40 96,56" fill="none" stroke="oklch(0.87 0.27 152 / 0.28)" strokeWidth="1" />
      <path d="M1360,40 Q1360,40 1344,56" fill="none" stroke="oklch(0.87 0.27 152 / 0.28)" strokeWidth="1" />
      <path d="M80,660 Q80,660 96,644" fill="none" stroke="oklch(0.87 0.27 152 / 0.28)" strokeWidth="1" />
      <path d="M1360,660 Q1360,660 1344,644" fill="none" stroke="oklch(0.87 0.27 152 / 0.28)" strokeWidth="1" />
    </svg>
  );
}

// Animated score-ticker-style stat
function StatPill({ value, label, color }: { value: string; label: string; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: EASE }}
      style={{
        ...GLASS,
        border: `1px solid ${color}28`,
        padding: "14px 20px",
        textAlign: "center",
        minWidth: 110,
        flex: 1,
      }}
    >
      <div style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 900, color, lineHeight: 1, letterSpacing: "-0.02em" }}>
        {value}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "rgba(148,163,184,0.7)", marginTop: 5 }}>
        {label}
      </div>
    </motion.div>
  );
}

// Feature quick-access card
type FeatureDef = typeof FEATURE_DEFS[number];
function FeatureCard({ feat, label, desc, index, isMobile }: { feat: FeatureDef; label: string; desc: string; index: number; isMobile: boolean }) {
  return (
    <motion.a
      href={`#${feat.id}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.55 + index * 0.08, ease: EASE }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      style={{
        display: "block",
        background: feat.bg,
        border: `1px solid ${feat.border}`,
        borderRadius: 16,
        padding: "18px 16px",
        cursor: "pointer",
        textDecoration: "none",
        position: "relative",
        overflow: "hidden",
        ...(isMobile ? {} : { backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }),
      }}
    >
      {/* hover glow */}
      <motion.div
        whileHover={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        style={{
          position: "absolute", inset: 0, borderRadius: 16,
          background: `radial-gradient(ellipse at 50% 0%, ${feat.glow} 0%, transparent 65%)`,
          transition: "opacity 0.25s",
        }}
      />
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 26, marginBottom: 8 }}>{feat.icon}</div>
        <div style={{ color: feat.accent, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ color: "rgba(148,163,184,0.75)", fontSize: 12, lineHeight: 1.5 }}>
          {desc}
        </div>
      </div>
      <div style={{
        position: "absolute", bottom: 14, right: 14,
        color: feat.accent, fontSize: 14, opacity: 0.6,
      }}>›</div>
    </motion.a>
  );
}

// ── Typewriter cycling subtitle ───────────────────────────────────────────────
function RotatingTag() {
  const { lang } = useLang();
  const tags = HERO_STRINGS[lang].rotating;
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setIdx(0);
    setVisible(true);
  }, [lang]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % tags.length);
        setVisible(true);
      }, 350);
    }, 2800);
    return () => clearInterval(interval);
  }, [tags.length]);

  return (
    <div style={{ height: 28, display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: "oklch(0.87 0.27 152 / 0.5)", fontSize: 13, fontWeight: 600 }}>›</span>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.span
            key={`${lang}-${idx}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: EASE }}
            style={{ color: "oklch(0.87 0.27 152)", fontSize: 13.5, fontWeight: 700, letterSpacing: "0.04em" }}
          >
            {tags[idx]}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Hero ─────────────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setMobile(mq.matches);
    const h = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return mobile;
}

export default function Hero() {
  const { t, lang } = useLang();
  const hs = HERO_STRINGS[lang];
  const isMobile = useIsMobile();

  return (
    <section
      id="anasayfa"
      style={{ position: "relative", overflow: "hidden", paddingTop: "clamp(48px, 8vw, 96px)", paddingBottom: "clamp(48px, 8vw, 80px)" }}
    >
      {/* ── Background layers ── */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        {/* Pitch grid SVG */}
        <PitchGrid />
        {/* Subtle warm ambient — static on mobile, barely animated on desktop */}
        <div
          style={{
            position: "absolute", top: "0%", left: "10%",
            width: "50%", height: "55%", borderRadius: "50%",
            background: "radial-gradient(ellipse, oklch(0.87 0.27 152 / 0.06) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute", bottom: "10%", right: "10%",
            width: "40%", height: "45%", borderRadius: "50%",
            background: "radial-gradient(ellipse, oklch(0.87 0.27 152 / 0.04) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* Top accent line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, oklch(0.87 0.27 152 / 0.35), transparent)",
        }} />
        {/* Bottom fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "35%",
          background: "linear-gradient(0deg, rgba(5,7,20,0.6), transparent)",
        }} />
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 4vw, 40px)" }}>

        {/* ── Brand header row ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "clamp(32px, 5vw, 56px)", flexWrap: "wrap", gap: 12, position: "relative", zIndex: 20 }}
        >
          {/* Live season badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "oklch(0.87 0.27 152 / 0.07)",
            border: "1px solid oklch(0.87 0.27 152 / 0.22)",
            borderRadius: 999, padding: "6px 14px",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "oklch(0.87 0.27 152)", display: "block", flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.16em", color: "oklch(0.87 0.27 152)" }}>
              {siteMeta.crew} · {hs.seasonBadge}
            </span>
          </div>

          {/* Social links */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", position: "relative", zIndex: 2 }}>
            {/* YouTube */}
            <motion.a
              href={siteMeta.social.youtube}
              target="_blank" rel="noreferrer" aria-label="YouTube"
              whileHover={{ scale: 1.1, y: -3, transition: { duration: 0.16 } }}
              whileTap={{ scale: 0.93 }}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                textDecoration: "none",
                boxShadow: "0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <svg width="22" height="16" viewBox="0 0 30 21" fill="none" aria-hidden="true">
                <rect width="30" height="21" rx="5" fill="#FF0000"/>
                <path d="M12.5 6.5L20.5 10.5L12.5 14.5V6.5Z" fill="white"/>
              </svg>
            </motion.a>

            {/* Instagram */}
            <motion.a
              href={siteMeta.social.instagram}
              target="_blank" rel="noreferrer" aria-label="Instagram"
              whileHover={{ scale: 1.1, y: -3, transition: { duration: 0.16 } }}
              whileTap={{ scale: 0.93 }}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                textDecoration: "none",
                boxShadow: "0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="ig-grad" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FCAF45"/>
                    <stop offset="50%" stopColor="#E1306C"/>
                    <stop offset="100%" stopColor="#833AB4"/>
                  </linearGradient>
                </defs>
                <rect x="1" y="1" width="22" height="22" rx="6" fill="url(#ig-grad)"/>
                <rect x="4" y="4" width="16" height="16" rx="4" stroke="white" strokeWidth="1.6" fill="none"/>
                <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.6"/>
                <circle cx="17" cy="7" r="1.4" fill="white"/>
              </svg>
            </motion.a>

            {/* Facebook */}
            <motion.a
              href={siteMeta.social.facebook}
              target="_blank" rel="noreferrer" aria-label="Facebook"
              whileHover={{ scale: 1.1, y: -3, transition: { duration: 0.16 } }}
              whileTap={{ scale: 0.93 }}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                textDecoration: "none",
                boxShadow: "0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect width="24" height="24" rx="5.5" fill="#1877F2"/>
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="white"/>
              </svg>
            </motion.a>
          </div>
        </motion.div>

        {/* ── Main title block ── */}
        <div style={{ maxWidth: 820, marginBottom: "clamp(32px, 5vw, 56px)" }}>
          {/* Rotating tag above title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{ marginBottom: 16 }}
          >
            <RotatingTag />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 32, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.75, delay: 0.2, ease: EASE }}
            style={{ margin: 0, lineHeight: 1.0 }}
          >
            <span style={{
              display: "block",
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontSize: "clamp(4rem, 10vw, 7.5rem)",
              fontWeight: 900,
              letterSpacing: "0.04em",
              color: "#ffffff",
              lineHeight: 0.95,
            }}>
              OSM
            </span>
            <span style={{
              display: "block",
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontSize: "clamp(4.5rem, 14vw, 10rem)",
              fontWeight: 900,
              letterSpacing: "0.02em",
              lineHeight: 0.88,
              color: "#ffffff",
            }}>
              NEXT LEVEL
            </span>
            <span style={{
              display: "block",
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontSize: "clamp(0.75rem, 1.8vw, 1rem)",
              fontWeight: 600,
              letterSpacing: "0.24em",
              marginTop: 16,
              color: "oklch(0.87 0.27 152)",
              textTransform: "uppercase",
            }}>
              {hs.titleSub}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.38, ease: EASE }}
            style={{
              marginTop: 20, marginBottom: 0,
              fontSize: "clamp(14px, 2vw, 17px)",
              color: "rgba(148,163,184,0.85)",
              lineHeight: 1.65,
              maxWidth: 560,
            }}
          >
            {t("hero.subtitle")}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
            style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}
          >
            <motion.a
              href="#anti-taktik"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "oklch(0.87 0.27 152)",
                border: "1px solid oklch(0.87 0.27 152)",
                borderRadius: 8,
                padding: "13px 28px",
                color: "oklch(0.13 0.02 250)",
                fontSize: 13,
                fontWeight: 900,
                textDecoration: "none",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              ⚔️ {hs.ctaAnti}
            </motion.a>
            <motion.a
              href="https://buymeacoffee.com/omerovvvvv"
              target="_blank" rel="noreferrer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "#FFDD00",
                borderRadius: 12, padding: "13px 22px",
                color: "#1c1917", fontSize: 13, fontWeight: 900,
                textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.06em",
                boxShadow: "0 4px 20px rgba(255,221,0,0.25)",
              }}
            >
              ☕ {hs.ctaSupport}
            </motion.a>
          </motion.div>
        </div>

        {/* ── Feature quick-access grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: "clamp(32px, 5vw, 48px)",
        }}>
          {FEATURE_DEFS.map((feat, i) => (
            <FeatureCard key={i} feat={feat} label={hs[feat.lk]} desc={hs[feat.dk]} index={i} isMobile={isMobile} />
          ))}
        </div>

        {/* ── Stats row ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
        >
          {[
            { value: "16+",   label: t("hero.years"),  color: "oklch(0.87 0.27 152)" },
            { value: "#1",    label: hs.worldRank,     color: "#ffffff" },
            { value: "26/27", label: t("hero.season"), color: "oklch(0.87 0.27 152)" },
            { value: "100+",  label: t("hero.tested"), color: "#888888" },
          ].map((s, i) => (
            <StatPill key={i} {...s} />
          ))}
        </motion.div>

        {/* ── Coach's disclaimer — plain div, no Framer Motion (stacking context fix) ── */}
        <div
          style={{
            marginTop: 28,
            ...GLASS,
            border: "1px solid oklch(0.87 0.27 152 / 0.18)",
            padding: "16px 20px",
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
            position: "relative",
            zIndex: 0,
            overflow: "hidden",
          }}
        >
          {/* left accent bar */}
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
            background: "linear-gradient(180deg, oklch(0.87 0.27 152), oklch(0.87 0.27 152 / 0.1))",
            borderRadius: "20px 0 0 20px",
          }} />
          <div
            className="animate-pulse"
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: "oklch(0.87 0.27 152 / 0.1)",
              border: "1px solid oklch(0.87 0.27 152 / 0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17,
            }}
          >🛡️</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.22em", color: "oklch(0.87 0.27 152 / 0.7)", marginBottom: 4 }}>
              {hs.coachAlert}
            </div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "rgba(203,213,225,0.85)" }}>
              {t("disclaimer.text")}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
