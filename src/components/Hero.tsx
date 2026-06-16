import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";
import { siteMeta } from "../data/tactics";

const EASE = [0.16, 1, 0.3, 1] as const;

// ── Multilingual strings ───────────────────────────────────────────────────────
const HERO_STRINGS = {
  tr: {
    badge:        "16 Yıllık OSM Deneyimi",
    title1:       "OSM",
    title2:       "NEXT LEVEL",
    sub:          "TAKTİK ANALİZ MERKEZİ",
    subtitle:     "Her formasyona karşı en iyi taktiği anında bul. Anti-taktik motoru, haftalık meta ve premium taktikler.",
    cta1:         "Anti-Taktik Bul",
    cta2:         "Premium Taktikler",
    scrollLabel:  "aşağı kaydır",
    scrollTarget: "taktikleri gör",
    worldRank:    "DÜNYA LİDERİ",
    season:       "Sezon 26/27",
    tested:       "Test Edilmiş",
    years:        "Yıl Deneyim",
    alert:        "ANTRENÖR UYARISI",
    pill1: "Anti-Taktik",
    pill2: "Haftalık Meta",
    pill3: "Premium",
    rotating: ["Anti-Taktik Matrisi", "Haftalık Meta Taktikler", "Slider Hesaplama", "Premium Formasyon Analizi", "16 Yıllık OSM Deneyimi"],
  },
  en: {
    badge:        "16 Years of OSM Experience",
    title1:       "OSM",
    title2:       "NEXT LEVEL",
    sub:          "TACTICAL ANALYSIS CENTER",
    subtitle:     "Instantly find the best tactic against any formation. Anti-tactic engine, weekly meta, and premium tactics.",
    cta1:         "Find Anti-Tactic",
    cta2:         "Premium Tactics",
    scrollLabel:  "scroll down",
    scrollTarget: "to see tactics",
    worldRank:    "WORLD RANK #1",
    season:       "Season 26/27",
    tested:       "Tactics Tested",
    years:        "Years of Data",
    alert:        "COACH ALERT",
    pill1: "Anti-Tactic",
    pill2: "Weekly Meta",
    pill3: "Premium",
    rotating: ["Anti-Tactic Matrix", "Weekly Meta Tactics", "Slider Calculator", "Premium Formation Analysis", "16 Years of OSM Experience"],
  },
  hu: {
    badge:        "16 Év OSM Tapasztalat",
    title1:       "OSM",
    title2:       "NEXT LEVEL",
    sub:          "TAKTIKAI ELEMZÉSI KÖZPONT",
    subtitle:     "Azonnal találd meg a legjobb taktikát bármely formáció ellen. Anti-taktika motor, heti meta és prémium taktikák.",
    cta1:         "Anti-Taktika Keresés",
    cta2:         "Prémium Taktikák",
    scrollLabel:  "görgess le",
    scrollTarget: "a taktikákhoz",
    worldRank:    "VILÁG #1",
    season:       "Szezon 26/27",
    tested:       "Tesztelt Taktika",
    years:        "Év Tapasztalat",
    alert:        "EDZŐI FIGYELMEZTETÉS",
    pill1: "Anti-Taktika",
    pill2: "Heti Meta",
    pill3: "Prémium",
    rotating: ["Anti-Taktika Mátrix", "Heti Meta Taktikák", "Csúszka Számológép", "Prémium Formáció Analízis", "16 Év OSM Tapasztalat"],
  },
  ar: {
    badge:        "16 عاماً من خبرة OSM",
    title1:       "OSM",
    title2:       "NEXT LEVEL",
    sub:          "مركز التحليل التكتيكي",
    subtitle:     "ابحث فوراً عن أفضل تكتيك ضد أي تشكيلة. محرك مكافحة التكتيك، الميتا الأسبوعية والتكتيكات المميزة.",
    cta1:         "ابحث عن مكافح التكتيك",
    cta2:         "تكتيكات بريميوم",
    scrollLabel:  "مرر للأسفل",
    scrollTarget: "لرؤية التكتيكات",
    worldRank:    "المرتبة #1 عالمياً",
    season:       "موسم 26/27",
    tested:       "تكتيك مُختبَر",
    years:        "عام من البيانات",
    alert:        "تحذير المدرب",
    pill1: "مكافحة التكتيك",
    pill2: "الميتا الأسبوعية",
    pill3: "بريميوم",
    rotating: ["مصفوفة مكافحة التكتيك", "تكتيكات الميتا الأسبوعية", "آلة حساب المتزلجة", "تحليل التشكيلة بريميوم", "16 عاماً من خبرة OSM"],
  },
  pt: {
    badge:        "16 Anos de Experiência OSM",
    title1:       "OSM",
    title2:       "NEXT LEVEL",
    sub:          "CENTRO DE ANÁLISE TÁTICA",
    subtitle:     "Encontre instantaneamente a melhor tática contra qualquer formação. Motor anti-tática, meta semanal e táticas premium.",
    cta1:         "Encontrar Anti-Tática",
    cta2:         "Táticas Premium",
    scrollLabel:  "rolar para baixo",
    scrollTarget: "ver táticas",
    worldRank:    "RANK MUNDIAL #1",
    season:       "Temporada 26/27",
    tested:       "Táticas Testadas",
    years:        "Anos de Dados",
    alert:        "ALERTA DO TREINADOR",
    pill1: "Anti-Tática",
    pill2: "Meta Semanal",
    pill3: "Premium",
    rotating: ["Matriz Anti-Tática", "Táticas Meta Semanais", "Calculadora Deslizante", "Análise de Formação Premium", "16 Anos de Experiência OSM"],
  },
} as const;

// ── Mobile detection ───────────────────────────────────────────────────────────
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

// ── Rotating subtitle tag ──────────────────────────────────────────────────────
function RotatingTag({ lang }: { lang: keyof typeof HERO_STRINGS }) {
  const tags = HERO_STRINGS[lang].rotating;
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => { setIdx(0); setVisible(true); }, [lang]);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % tags.length); setVisible(true); }, 300);
    }, 2800);
    return () => clearInterval(t);
  }, [tags.length]);

  return (
    <div style={{ height: 22, display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
      <span style={{ color: "rgba(91,138,247,0.5)", fontSize: 11 }}>›</span>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.span
            key={`${lang}-${idx}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.22, ease: EASE }}
            style={{ color: "rgba(91,138,247,0.7)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em" }}
          >
            {tags[idx]}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── 3D entrance wrapper ────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 40, lite = false }: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  lite?: boolean;
}) {
  if (lite) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: delay * 0.5, ease: EASE }}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// ── Main Hero ─────────────────────────────────────────────────────────────────
export default function Hero() {
  const { t, lang } = useLang();
  const hs = HERO_STRINGS[lang];
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="anasayfa"
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── Thin top rule ── */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(91,138,247,0.3) 35%, rgba(145,97,245,0.3) 65%, transparent)", flexShrink: 0 }} />

      {/* ── Social links top-right ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        style={{
          position: "absolute",
          top: 20,
          right: "clamp(16px, 4vw, 40px)",
          display: "flex",
          gap: 8,
          zIndex: 10,
        }}
      >
        {[
          {
            href: siteMeta.social.youtube,
            label: "YouTube",
            bg: "rgba(255,0,0,0.12)",
            border: "rgba(255,0,0,0.3)",
            icon: (
              <svg width="22" height="15" viewBox="0 0 30 21" fill="none">
                <rect width="30" height="21" rx="4" fill="#FF0000"/>
                <path d="M12.5 6.5L20.5 10.5L12.5 14.5V6.5Z" fill="white"/>
              </svg>
            ),
          },
          {
            href: siteMeta.social.instagram,
            label: "Instagram",
            bg: "rgba(225,48,108,0.12)",
            border: "rgba(225,48,108,0.3)",
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="#E1306C" strokeWidth="1.8"/>
                <circle cx="12" cy="12" r="4" stroke="#E1306C" strokeWidth="1.8"/>
                <circle cx="17" cy="7" r="1.3" fill="#E1306C"/>
              </svg>
            ),
          },
          {
            href: siteMeta.social.facebook,
            label: "Facebook",
            bg: "rgba(24,119,242,0.12)",
            border: "rgba(24,119,242,0.3)",
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            ),
          },
        ].map((s) => (
          <motion.a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            aria-label={s.label}
            whileHover={isMobile ? undefined : { scale: 1.12, y: -2 }}
            whileTap={{ scale: 0.94 }}
            style={{
              width: 40, height: 40,
              border: `1px solid ${s.border}`,
              borderRadius: 10,
              background: s.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              textDecoration: "none",
              transition: "background 0.2s, border-color 0.2s",
            }}
          >
            {s.icon}
          </motion.a>
        ))}
      </motion.div>

      {/* ── MAIN CONTENT — centred single column ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: 860,
        margin: "0 auto",
        width: "100%",
        padding: `clamp(80px, 12vw, 120px) clamp(16px, 4vw, 48px) clamp(32px, 5vw, 60px)`,
        position: "relative",
        zIndex: 2,
      }}>

        {/* ── Content ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>

          {/* Badge */}
          <Reveal delay={0.05} lite>
            <div style={{ marginBottom: 20 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                border: "1px solid rgba(91,138,247,0.3)",
                borderRadius: 999, padding: "6px 16px",
                background: "rgba(91,138,247,0.08)",
              }}>
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  style={{ width: 5, height: 5, borderRadius: "50%", background: "#5b8af7", display: "block", flexShrink: 0 }}
                />
                <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(91,138,247,0.9)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  {hs.badge}
                </span>
              </div>
            </div>
          </Reveal>

          {/* Rotating tag */}
          <Reveal delay={0.1} lite>
            <RotatingTag lang={lang} />
          </Reveal>

          {/* Title */}
          <Reveal delay={0.15}>
            <h1 style={{
              margin: "0 0 20px",
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontWeight: 900,
              lineHeight: 0.88,
              letterSpacing: "-0.03em",
              textAlign: "center",
            }}>
              <span style={{
                display: "block",
                fontSize: "clamp(3.5rem, 10vw, 6rem)",
                color: "#5b8af7",
              }}>
                {hs.title1}
              </span>
              <span style={{
                display: "block",
                fontSize: "clamp(2.8rem, 8.5vw, 6rem)",
                color: "#ffffff",
                lineHeight: 0.92,
              }}>
                {hs.title2}
              </span>
              <span style={{
                display: "block",
                fontSize: "clamp(0.55rem, 1.4vw, 0.72rem)",
                fontWeight: 600,
                letterSpacing: "0.28em",
                color: "rgba(255,255,255,0.25)",
                marginTop: 14,
                textTransform: "uppercase",
              }}>
                {hs.sub}
              </span>
            </h1>
          </Reveal>

          {/* Subtitle */}
          <Reveal delay={0.3} lite>
            <p style={{
              margin: "0 0 28px",
              fontSize: "clamp(13px, 1.5vw, 16px)",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.7,
              maxWidth: 560,
              textAlign: "center",
            }}>
              {hs.subtitle}
            </p>
          </Reveal>

          {/* Feature pills */}
          <Reveal delay={0.35} lite>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
              <span className="g-badge g-badge-blue">⚡ {hs.pill1}</span>
              <span className="g-badge g-badge-emerald">📊 {hs.pill2}</span>
              <span className="g-badge g-badge-gold">👑 {hs.pill3}</span>
            </div>
          </Reveal>

          {/* CTA buttons */}
          <Reveal delay={0.42} lite>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 36 }}>
              <motion.a
                href="#anti-taktik"
                className="g-btn-primary"
                whileHover={isMobile ? undefined : { scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                ⚔️ {hs.cta1}
              </motion.a>
              <motion.a
                href="#premium"
                className="g-btn-ghost"
                whileHover={isMobile ? undefined : { scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                👑 {hs.cta2}
              </motion.a>
              <motion.a
                href="https://buymeacoffee.com/omerovvvvv"
                target="_blank"
                rel="noreferrer"
                className="g-btn-gold"
                whileHover={isMobile ? undefined : { scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                ☕ Support
              </motion.a>
            </div>
          </Reveal>

          {/* Stats */}
          <Reveal delay={0.52} lite>
            <div style={{
              display: "flex",
              gap: "clamp(20px, 4vw, 40px)",
              justifyContent: "center",
              flexWrap: "wrap",
              paddingTop: 20,
              borderTop: "1px solid rgba(255,255,255,0.07)",
            }}>
              {[
                { val: "16+", lbl: hs.years, color: "#5b8af7" },
                { val: "#1",  lbl: hs.worldRank, color: "#f5a623" },
                { val: "100+", lbl: hs.tested, color: "#10d9a1" },
                { val: "26/27", lbl: hs.season, color: "#9161f5" },
              ].map((s) => (
                <div key={s.lbl} style={{ textAlign: "center" }}>
                  <div style={{
                    fontSize: "clamp(1.3rem, 3.5vw, 2rem)",
                    fontWeight: 900,
                    color: s.color,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    fontFamily: "'Outfit', system-ui, sans-serif",
                  }}>
                    {s.val}
                  </div>
                  <div style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.28)",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    marginTop: 5,
                  }}>
                    {s.lbl}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Coach disclaimer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.0 }}
        style={{
          position: "relative",
          zIndex: 2,
          margin: "0 clamp(16px, 4vw, 40px)",
          marginBottom: "clamp(16px, 3vw, 28px)",
          maxWidth: 1280,
          alignSelf: "center",
          width: "calc(100% - clamp(32px, 8vw, 80px))",
          padding: "14px 18px",
          border: "1px solid rgba(245,166,35,0.18)",
          borderRadius: 14,
          background: "rgba(245,166,35,0.05)",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          border: "1px solid rgba(245,166,35,0.22)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, background: "rgba(245,166,35,0.08)",
        }}>🛡️</div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(245,166,35,0.6)", marginBottom: 4 }}>
            {hs.alert}
          </div>
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "rgba(255,255,255,0.38)" }}>
            {t("disclaimer.text")}
          </p>
        </div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.1 }}
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "clamp(12px, 3vw, 28px)",
          paddingBottom: "clamp(20px, 4vw, 36px)",
          color: "rgba(255,255,255,0.2)",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        <span>{hs.scrollLabel}</span>
        <div style={{ flex: "0 0 clamp(40px, 8vw, 100px)", height: 1, background: "linear-gradient(90deg, transparent, rgba(91,138,247,0.3))" }} />
        <div style={{
          width: 20, height: 30,
          border: "1px solid rgba(91,138,247,0.28)",
          borderRadius: 10,
          display: "flex", justifyContent: "center",
          paddingTop: 5, flexShrink: 0,
        }}>
          <motion.div
            style={{ width: 2, height: 6, background: "rgba(91,138,247,0.6)", borderRadius: 2 }}
            animate={{ y: [0, 8, 0], opacity: [0.8, 0.2, 0.8] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div style={{ flex: "0 0 clamp(40px, 8vw, 100px)", height: 1, background: "linear-gradient(90deg, rgba(145,97,245,0.3), transparent)" }} />
        <span>{hs.scrollTarget}</span>
      </motion.div>

      {/* ── Bottom fade ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "18%",
        background: "linear-gradient(0deg, rgba(7,7,17,0.6), transparent)",
        pointerEvents: "none", zIndex: 1,
      }} />
    </section>
  );
}
