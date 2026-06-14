import { useRef, useEffect, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";
import { siteMeta } from "../data/tactics";

const EASE = [0.16, 1, 0.3, 1] as const;

const GLASS: React.CSSProperties = {
  background: "rgba(9,11,33,0.92)",
  border: "1px solid rgba(34,211,238,0.14)",
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
const FEATURE_DEFS = [
  { id: "anti-taktik", icon: "⚔️", accent: "#22d3ee", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.22)", glow: "rgba(34,211,238,0.25)", lk: "antiLabel",    dk: "antiDesc"    },
  { id: "weekly-meta", icon: "📊", accent: "#f59e0b", bg: "rgba(251,191,36,0.07)", border: "rgba(251,191,36,0.2)",  glow: "rgba(251,191,36,0.2)",  lk: "metaLabel",    dk: "metaDesc"    },
  { id: "premium",     icon: "👑", accent: "#a78bfa", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.22)", glow: "rgba(139,92,246,0.25)", lk: "premiumLabel", dk: "premiumDesc" },
  { id: "slider-calc", icon: "🎯", accent: "#34d399", bg: "rgba(52,211,153,0.07)",  border: "rgba(52,211,153,0.2)",  glow: "rgba(52,211,153,0.2)",  lk: "sliderLabel",  dk: "sliderDesc"  },
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
      <rect x="80" y="40" width="1280" height="620" rx="4" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
      {/* Center line */}
      <line x1="720" y1="40" x2="720" y2="660" stroke="#22d3ee" strokeWidth="1" />
      {/* Center circle */}
      <circle cx="720" cy="350" r="100" fill="none" stroke="#22d3ee" strokeWidth="1" />
      <circle cx="720" cy="350" r="3" fill="#22d3ee" />
      {/* Penalty areas */}
      <rect x="80" y="195" width="200" height="310" fill="none" stroke="#22d3ee" strokeWidth="1" />
      <rect x="1160" y="195" width="200" height="310" fill="none" stroke="#22d3ee" strokeWidth="1" />
      {/* Goal areas */}
      <rect x="80" y="280" width="80" height="140" fill="none" stroke="#22d3ee" strokeWidth="1" />
      <rect x="1280" y="280" width="80" height="140" fill="none" stroke="#22d3ee" strokeWidth="1" />
      {/* Penalty spots */}
      <circle cx="220" cy="350" r="3" fill="#22d3ee" />
      <circle cx="1220" cy="350" r="3" fill="#22d3ee" />
      {/* Corner arcs */}
      <path d="M80,40 Q96,40 96,56" fill="none" stroke="#22d3ee" strokeWidth="1" />
      <path d="M1360,40 Q1360,40 1344,56" fill="none" stroke="#22d3ee" strokeWidth="1" />
      <path d="M80,660 Q80,660 96,644" fill="none" stroke="#22d3ee" strokeWidth="1" />
      <path d="M1360,660 Q1360,660 1344,644" fill="none" stroke="#22d3ee" strokeWidth="1" />
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
      <span style={{ color: "rgba(34,211,238,0.5)", fontSize: 13, fontWeight: 600 }}>›</span>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.span
            key={`${lang}-${idx}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: EASE }}
            style={{ color: "#22d3ee", fontSize: 13.5, fontWeight: 700, letterSpacing: "0.04em" }}
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
        {/* Ambient glows */}
        <motion.div
          animate={isMobile ? { opacity: 0.55 } : { opacity: [0.4, 0.8, 0.4], scale: [1, 1.08, 1] }}
          transition={isMobile ? {} : { duration: 9, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", top: "5%", left: "5%",
            width: "45%", height: "55%", borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(34,211,238,0.12) 0%, transparent 70%)",
            ...(isMobile ? {} : { filter: "blur(60px)" }),
          }}
        />
        <motion.div
          animate={isMobile ? { opacity: 0.45 } : { opacity: [0.3, 0.65, 0.3], scale: [1, 1.06, 1] }}
          transition={isMobile ? {} : { duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{
            position: "absolute", top: "10%", right: "5%",
            width: "40%", height: "50%", borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)",
            ...(isMobile ? {} : { filter: "blur(80px)" }),
          }}
        />
        <motion.div
          animate={isMobile ? { opacity: 0.35 } : { opacity: [0.2, 0.5, 0.2] }}
          transition={isMobile ? {} : { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{
            position: "absolute", bottom: "5%", left: "30%",
            width: "40%", height: "40%", borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(52,211,153,0.08) 0%, transparent 70%)",
            ...(isMobile ? {} : { filter: "blur(70px)" }),
          }}
        />
        {/* Top accent line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.5), transparent)",
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
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "clamp(32px, 5vw, 56px)", flexWrap: "wrap", gap: 12 }}
        >
          {/* Live season badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(34,211,238,0.06)",
            border: "1px solid rgba(34,211,238,0.2)",
            borderRadius: 999, padding: "6px 14px",
          }}>
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "block", flexShrink: 0, boxShadow: "0 0 8px #22c55e" }}
            />
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", color: "#22d3ee" }}>
              {siteMeta.crew} · {hs.seasonBadge}
            </span>
          </div>

          {/* Social links — premium SVG icons */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
              fontSize: "clamp(2.8rem, 7.5vw, 5.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: "#e2e8f0",
            }}>
              OSM
            </span>
            <span style={{
              display: "block",
              fontSize: "clamp(3.2rem, 10vw, 5.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 0.92,
              color: "#22d3ee",
              filter: "drop-shadow(0 0 28px rgba(34,211,238,0.35)) drop-shadow(0 0 56px rgba(139,92,246,0.2))",
            }}>
              NEXT LEVEL
            </span>
            <span style={{
              display: "block",
              fontSize: "clamp(1.4rem, 3.5vw, 2.6rem)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              marginTop: 4,
              color: "#f59e0b",
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
              whileHover={{ scale: 1.04, boxShadow: "0 0 32px rgba(34,211,238,0.35)" }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "linear-gradient(135deg, rgba(34,211,238,0.22), rgba(99,102,241,0.22))",
                border: "1px solid rgba(34,211,238,0.4)",
                borderRadius: 12,
                padding: "13px 28px",
                color: "#22d3ee",
                fontSize: 13,
                fontWeight: 800,
                textDecoration: "none",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                boxShadow: "0 0 20px rgba(34,211,238,0.12)",
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
            { value: "16+",   label: t("hero.years"),  color: "#22d3ee" },
            { value: "#1",    label: hs.worldRank,     color: "#f59e0b" },
            { value: "26/27", label: t("hero.season"), color: "#a78bfa" },
            { value: "100+",  label: t("hero.tested"), color: "#34d399" },
          ].map((s, i) => (
            <StatPill key={i} {...s} />
          ))}
        </motion.div>

        {/* ── Coach's disclaimer ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{
            marginTop: 28,
            ...GLASS,
            border: "1px solid rgba(251,191,36,0.18)",
            padding: "16px 20px",
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* left accent bar */}
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
            background: "linear-gradient(180deg, #f59e0b, rgba(251,191,36,0.1))",
            borderRadius: "20px 0 0 20px",
          }} />
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: "rgba(251,191,36,0.1)",
              border: "1px solid rgba(251,191,36,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17,
            }}
          >🛡️</motion.div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(251,191,36,0.6)", marginBottom: 4 }}>
              {hs.coachAlert}
            </div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "rgba(203,213,225,0.85)" }}>
              {t("disclaimer.text")}
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
