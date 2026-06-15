import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";
import { siteMeta } from "../data/tactics";
import { TacticalPitchScene } from "./ui/tactical-pitch";

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

// ── Animated smoke background ─────────────────────────────────────────────────
function SmokeBackground() {
  const wisps = [
    { left: "18%",  top: "-5%",  w: "38vw", h: "90vh", rotate: "-14deg", dx: [0, 30, -20, 15, 0], dy: [0, -30, 20, -15, 0], dur: 26, delay: 0,  opacity: 0.13 },
    { left: "52%",  top: "5%",   w: "30vw", h: "80vh", rotate: "9deg",   dx: [0, -25, 18, -10, 0], dy: [0, -20, 30, -10, 0], dur: 32, delay: 4,  opacity: 0.10 },
    { left: "70%",  top: "15%",  w: "34vw", h: "75vh", rotate: "-6deg",  dx: [0, 20, -30, 10, 0],  dy: [0, -25, 15, -20, 0], dur: 24, delay: 8,  opacity: 0.09 },
    { left: "8%",   top: "35%",  w: "42vw", h: "55vh", rotate: "18deg",  dx: [0, -15, 25, -8, 0],  dy: [0, -10, 20, -15, 0], dur: 28, delay: 12, opacity: 0.08 },
    { left: "35%",  top: "50%",  w: "28vw", h: "65vh", rotate: "-20deg", dx: [0, 22, -14, 18, 0],  dy: [0, -18, 28, -8, 0],  dur: 35, delay: 6,  opacity: 0.07 },
    { left: "80%",  top: "45%",  w: "25vw", h: "60vh", rotate: "5deg",   dx: [0, -18, 12, -22, 0], dy: [0, -12, 22, -16, 0], dur: 22, delay: 16, opacity: 0.065 },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }} aria-hidden="true">
      {wisps.map((w, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: w.left,
            top: w.top,
            width: w.w,
            height: w.h,
            rotate: w.rotate,
            background: `radial-gradient(ellipse 45% 60% at 50% 45%, rgba(255,255,255,${w.opacity}) 0%, rgba(255,255,255,${w.opacity * 0.35}) 40%, transparent 72%)`,
            filter: "blur(72px)",
            willChange: "transform",
          }}
          animate={{ x: w.dx, y: w.dy, scale: [1, 1.08, 0.94, 1.05, 1] }}
          transition={{ duration: w.dur, delay: w.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {/* Center glow */}
      <div style={{
        position: "absolute",
        left: "50%", top: "42%",
        width: "70vw", height: "55vh",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 45%, transparent 70%)",
        filter: "blur(80px)",
      }} />
    </div>
  );
}

// ── Rotating subtitle tag ──────────────────────────────────────────────────────
function RotatingTag() {
  const { lang } = useLang();
  const tags = HERO_STRINGS[lang].rotating;
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => { setIdx(0); setVisible(true); }, [lang]);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % tags.length); setVisible(true); }, 320);
    }, 2800);
    return () => clearInterval(t);
  }, [tags.length]);

  return (
    <div style={{ height: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, fontWeight: 500 }}>›</span>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.span
            key={`${lang}-${idx}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: EASE }}
            style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, letterSpacing: "0.06em" }}
          >
            {tags[idx]}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── 3D entrance wrapper ────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 50, rotX = -18, lite = false }: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  rotX?: number;
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
      initial={{ opacity: 0, y, rotateX: rotX, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.0, delay, ease: EASE }}
      style={{ transformStyle: "preserve-3d" }}
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
        background: "#000000",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >

      {/* ── Thin top rule ── */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

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
            bg: "rgba(255,0,0,0.14)",
            border: "rgba(255,0,0,0.35)",
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
            bg: "rgba(225,48,108,0.14)",
            border: "rgba(225,48,108,0.35)",
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
            bg: "rgba(24,119,242,0.14)",
            border: "rgba(24,119,242,0.35)",
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
              width: 42, height: 42,
              border: `1px solid ${s.border}`,
              borderRadius: 11,
              background: s.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              textDecoration: "none",
              backdropFilter: isMobile ? undefined : "blur(8px)",
              transition: "background 0.2s, border-color 0.2s",
            }}
          >
            {s.icon}
          </motion.a>
        ))}
      </motion.div>

      {/* ── TOP: compact header ── */}
      <Reveal delay={0.1} y={20} rotX={-10} lite>
        <div style={{
          paddingTop: "clamp(72px, 12vw, 110px)",
          paddingBottom: 16,
          textAlign: "center",
          position: "relative",
          zIndex: 2,
        }}>
          {/* Badge */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 999, padding: "6px 16px",
              background: "rgba(255,255,255,0.04)",
            }}>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", display: "block", flexShrink: 0 }}
              />
              <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {hs.badge}
              </span>
            </div>
          </div>

          {/* Title — compact */}
          <h1 style={{
            margin: "0 0 10px",
            fontFamily: "'Outfit', system-ui, sans-serif",
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: "-0.02em",
            color: "#fff",
          }}>
            <span style={{ display: "block", fontSize: "clamp(2.2rem, 8vw, 4.5rem)" }}>
              {hs.title1}
            </span>
            <span style={{ display: "block", fontSize: "clamp(1.9rem, 7vw, 3.8rem)", lineHeight: 0.92 }}>
              {hs.title2}
            </span>
            <span style={{
              display: "block",
              fontSize: "clamp(0.55rem, 1.3vw, 0.75rem)",
              fontWeight: 500,
              letterSpacing: "0.26em",
              color: "rgba(255,255,255,0.28)",
              marginTop: 10,
              textTransform: "uppercase",
            }}>
              {hs.sub}
            </span>
          </h1>

          {/* Subtitle — single line */}
          <p style={{
            margin: "10px auto 0",
            fontSize: "clamp(11px, 1.5vw, 13px)",
            color: "rgba(255,255,255,0.35)",
            lineHeight: 1.6,
            maxWidth: 420,
          }}>
            {hs.subtitle}
          </p>
        </div>
      </Reveal>

      {/* ── CENTER: Tactical Pitch — full width, both mobile & desktop ── */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px clamp(12px, 4vw, 48px)",
        position: "relative",
        zIndex: 2,
        minHeight: isMobile ? 340 : 420,
      }}>
        <TacticalPitchScene />
      </div>

      {/* ── BOTTOM: CTAs + stats ── */}
      <Reveal delay={0.4} y={20} rotX={0} lite>
        <div style={{
          textAlign: "center",
          padding: "0 clamp(16px, 5vw, 60px) 24px",
          position: "relative",
          zIndex: 2,
        }}>
          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
            <motion.a href="#anti-taktik" whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "#ffffff", borderRadius: 999, padding: "12px 28px",
                color: "#000", fontSize: 12, fontWeight: 700,
                textDecoration: "none", letterSpacing: "0.07em", textTransform: "uppercase",
                boxShadow: "0 6px 24px rgba(255,255,255,0.14)",
              }}>
              ⚔️ {hs.cta1}
            </motion.a>
            <motion.a href="#premium" whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 999, padding: "12px 28px",
                color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600,
                textDecoration: "none", letterSpacing: "0.07em", textTransform: "uppercase",
              }}>
              👑 {hs.cta2}
            </motion.a>
            <motion.a href="https://buymeacoffee.com/omerovvvvv" target="_blank" rel="noreferrer"
              whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "rgba(255,221,0,0.1)", border: "1px solid rgba(255,221,0,0.3)",
                borderRadius: 999, padding: "12px 22px",
                color: "#FFD700", fontSize: 12, fontWeight: 700,
                textDecoration: "none", letterSpacing: "0.07em", textTransform: "uppercase",
              }}>
              ☕ Support
            </motion.a>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: "clamp(20px, 5vw, 52px)", justifyContent: "center",
            flexWrap: "wrap", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.07)",
          }}>
            {[
              { val: "16+", lbl: hs.years }, { val: "#1", lbl: hs.worldRank },
              { val: "100+", lbl: hs.tested }, { val: "26/27", lbl: hs.season },
            ].map((s) => (
              <div key={s.lbl} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(1.2rem, 3.5vw, 1.8rem)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {s.val}
                </div>
                <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.14em", marginTop: 5 }}>
                  {s.lbl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

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
          padding: "14px 18px",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          background: "rgba(255,255,255,0.03)",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          backdropFilter: isMobile ? undefined : "blur(8px)",
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15,
        }}>🛡️</div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>
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
          fontSize: 10.5,
          fontWeight: 500,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        <span>{hs.scrollLabel}</span>
        <div style={{ flex: "0 0 clamp(40px, 8vw, 110px)", height: 1, background: "rgba(255,255,255,0.1)" }} />
        {/* Mouse icon */}
        <div style={{
          width: 20, height: 30,
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 10,
          display: "flex",
          justifyContent: "center",
          paddingTop: 5,
          flexShrink: 0,
        }}>
          <motion.div
            style={{ width: 2, height: 6, background: "rgba(255,255,255,0.4)", borderRadius: 2 }}
            animate={{ y: [0, 8, 0], opacity: [0.8, 0.2, 0.8] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div style={{ flex: "0 0 clamp(40px, 8vw, 110px)", height: 1, background: "rgba(255,255,255,0.1)" }} />
        <span>{hs.scrollTarget}</span>
      </motion.div>

      {/* ── Bottom fade into next section ── */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: "20%",
        background: "linear-gradient(0deg, rgba(0,0,0,0.7), transparent)",
        pointerEvents: "none",
        zIndex: 1,
      }} />
    </section>
  );
}
