import { useEffect, useState, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import ProfilePanel from "./ProfilePanel";
import { useLang } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useSavedTactics } from "../contexts/SavedTacticsContext";

const OSMEventsSchedule  = lazy(() => import("./OSMEventsSchedule"));
const QuickSaleTechnique = lazy(() => import("./QuickSaleTechnique"));
const ManagerTools       = lazy(() => import("./ManagerTools"));
const MatchPredictions   = lazy(() => import("./MatchPredictions"));
const Blog               = lazy(() => import("./Blog"));
const TacticGarage       = lazy(() => import("./TacticGarage"));
const SpecialistMatrix   = lazy(() => import("./SpecialistMatrix"));
const NationalitySynergy = lazy(() => import("./NationalitySynergy"));
const Leaderboard        = lazy(() => import("./Leaderboard"));
const FormationsOverview = lazy(() => import("./FormationsOverview"));
const FAQSection         = lazy(() => import("./FAQSection"));
const MatchCoach         = lazy(() => import("./MatchCoach"));
const HighRiskEngine     = lazy(() => import("./HighRiskEngine"));
const SliderCalculator   = lazy(() => import("./SliderCalculator"));
const MatchAutopsy       = lazy(() => import("./MatchAutopsy"));

const ease = [0.16, 1, 0.3, 1] as const;

// Saate + güne göre deterministik aktif kullanıcı sayısı (10-25 arası)
function getLiveCount(): number {
  const now = new Date();
  const h = now.getHours();
  const d = now.getDay();
  const BASE = [10,10,10,10,10,10,11,12,13,14,14,15,15,16,15,14,15,17,19,21,22,20,17,13];
  const base = BASE[h] * (d === 0 || d === 6 ? 1.12 : 1);
  const seed = (((h + 1) * (d + 1) * 2654435761) >>> 0) % 7;
  return Math.min(25, Math.max(10, Math.round(base + seed - 3)));
}

function LiveUserBadge() {
  const [count, setCount] = useState(getLiveCount);
  useEffect(() => {
    // Base: dakikada bir sıfırla
    const baseId = setInterval(() => setCount(getLiveCount()), 60_000);
    // Fluctuation: 2-5 saniyede ±1, organik hareket
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setCount(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.min(25, Math.max(10, prev + delta));
      });
      setTimeout(tick, 2500 + Math.floor(Math.random() * 2500));
    };
    const firstId = setTimeout(tick, 2000 + Math.floor(Math.random() * 1500));
    return () => {
      cancelled = true;
      clearInterval(baseId);
      clearTimeout(firstId);
    };
  }, []);
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.22)",
      borderRadius: 999, padding: "3px 9px",
    }}>
      <motion.span
        animate={{ opacity: [1, 0.25, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "block", boxShadow: "0 0 6px #22c55e" }}
      />
      <span style={{ fontSize: 10, fontWeight: 800, color: "#4ade80", letterSpacing: "0.04em" }}>
        {count} Online
      </span>
    </div>
  );
}

type ActiveSheet = "events" | "quicksale" | "tools" | "matches" | "blog" | "garage" | "specialist" | "synergy" | "leaderboard" | "formations" | "faq" | "matchcoach" | "highrisk" | "slider" | "autopsy" | null;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const h = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const scrollToTop = () => {
    document.getElementById("scroll-root")?.scrollTo({ top: 0, behavior: "smooth" });
  };
  const { t, lang } = useLang();
  const isRTL = lang === "ar";
  const { user } = useAuth();
  const { tactics } = useSavedTactics();
  const garageCount = tactics.length;

  useEffect(() => {
    const container = document.getElementById("scroll-root");
    if (!container) return;
    const onScroll = () => {
      setScrolled(container.scrollTop > 20);
      setShowScrollBtn(container.scrollTop > 400);
    };
    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = document.getElementById("scroll-root");
    if (open) {
      document.body.style.overflow = "hidden";
      if (el) el.style.overflowY = "hidden";
    } else {
      document.body.style.overflow = "unset";
      if (el) el.style.overflowY = "auto";
    }
    return () => {
      document.body.style.overflow = "unset";
      if (el) el.style.overflowY = "auto";
    };
  }, [open]);

  const links = [
    { href: "#anasayfa",    label: t("nav.home") },
    { href: "#anti-taktik", label: t("nav.anti") },
    { href: "#premium",     label: t("nav.premium") },
    { href: "#hakkimda",    label: t("nav.about") },
  ];

  const toolSheets: { key: ActiveSheet; icon: string; label: string; live?: boolean }[] = [
    { key: "events",    icon: "📅", label: t("events.badge"), live: true },
    { key: "quicksale", icon: "💰", label: t("quick.badge") },
    { key: "tools",     icon: "🛠️", label: t("tools.badge") },
    { key: "matches",   icon: "⚽", label: t("matches.badge") },
    { key: "blog",      icon: "📚", label: t("blog.badge") },
    { key: "specialist" as ActiveSheet, icon: "🎯", label: t("specialist.label") },
    { key: "synergy"    as ActiveSheet, icon: "🌍", label: t("synergy.label") },
    { key: "leaderboard"  as ActiveSheet, icon: "🏆", label: t("nav.leaderboard") },
    { key: "formations"   as ActiveSheet, icon: "📋", label: `${t("form.title1")} ${t("form.title2")}` },
    { key: "faq"          as ActiveSheet, icon: "❓", label: "FAQ" },
    { key: "matchcoach"   as ActiveSheet, icon: "🧠", label: "Coach Card" },
    { key: "highrisk"     as ActiveSheet, icon: "⚠️", label: "High-Risk Engine" },
    { key: "slider"       as ActiveSheet, icon: "🎛️", label: "Slider Calculator" },
    { key: "autopsy"      as ActiveSheet, icon: "🔬", label: "Match Autopsy" },
    ...(user ? [{ key: "garage" as ActiveSheet, icon: "🗄️", label: `${t("garage.label")}${garageCount > 0 ? ` (${garageCount})` : ''}` }] : []),
  ];

  const sheetMeta = activeSheet
    ? ({
        events:    { icon: "📅", title: t("events.badge"),  sub: t("events.autoUpdate") },
        quicksale: { icon: "💰", title: t("quick.badge"),   sub: `${t("quick.titleA")} ${t("quick.titleB")}` },
        tools:     { icon: "🛠️", title: t("tools.badge"),   sub: `${t("tools.title1")} ${t("tools.title2")}` },
        matches:   { icon: "⚽", title: t("matches.badge"), sub: `${t("matches.titleA")} ${t("matches.titleB")}` },
        blog:      { icon: "📚", title: t("blog.badge"),    sub: `${t("blog.title1")} ${t("blog.title2")}` },
        garage:      { icon: "🗄️", title: t("garage.title"),        sub: t("garage.sub") },
        specialist:  { icon: "🎯", title: t("specialist.title"),   sub: t("specialist.sub") },
        synergy:     { icon: "🌍", title: t("synergy.title"),      sub: t("synergy.sub") },
        leaderboard: { icon: "🏆", title: t("leader.title1") + " " + t("leader.title2"), sub: t("leader.desc") },
        formations:  { icon: "📋", title: `${t("form.title1")} ${t("form.title2")}`, sub: t("form.desc") },
        faq:         { icon: "❓", title: t("faq.title"), sub: t("faq.badge") },
        matchcoach:  { icon: "🧠", title: "Pre-Match Coach Card", sub: "Pre-match analysis & confidence" },
        highrisk:    { icon: "⚠️", title: "High-Risk Engine", sub: "Strategy Against Stronger Opponents" },
        slider:      { icon: "🎛️", title: "Slider Calculator", sub: "Advanced Settings" },
        autopsy:     { icon: "🔬", title: "Match Autopsy", sub: "Why Did You Lose? — Professional Diagnosis" },
      } as const)[activeSheet]
    : null;

  const sheetComponent =
    activeSheet === "events"    ? <OSMEventsSchedule />
    : activeSheet === "quicksale" ? <QuickSaleTechnique />
    : activeSheet === "tools"     ? <ManagerTools />
    : activeSheet === "matches"   ? <MatchPredictions />
    : activeSheet === "blog"      ? <Blog />
    : activeSheet === "garage"      ? <TacticGarage />
    : activeSheet === "specialist"  ? <SpecialistMatrix />
    : activeSheet === "synergy"     ? <NationalitySynergy />
    : activeSheet === "leaderboard" ? <Leaderboard />
    : activeSheet === "formations"  ? <FormationsOverview />
    : activeSheet === "faq"         ? <FAQSection />
    : activeSheet === "matchcoach"  ? <MatchCoach />
    : activeSheet === "highrisk"    ? <HighRiskEngine />
    : activeSheet === "slider"      ? <SliderCalculator />
    : activeSheet === "autopsy"     ? <MatchAutopsy />
    : null;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "bg-black/[0.98] md:backdrop-blur-xl shadow-xl shadow-black/80"
            : "bg-black/[0.96] md:backdrop-blur-md border-b border-white/[0.04]"
        }`}
      >
        {/* Razor-thin gradient bottom border */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-700/30 to-transparent" />
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:h-20 md:px-6">
          {/* Logo */}
          <a href="#anasayfa" className="flex items-center justify-start gap-3 shrink-0" onClick={(e) => { e.preventDefault(); setOpen(false); scrollToTop(); }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                overflow: "hidden",
                border: "1.5px solid rgba(201,162,39,0.45)",
                flexShrink: 0,
                transform: "translateZ(0)",
                boxShadow: "0 0 12px rgba(201,162,39,0.15)",
              }}
            >
              <img
                src="/osm-logo.png"
                alt="OSM Next Level"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </motion.div>
            <div className="flex flex-col justify-center leading-none me-4">
              <span className="font-display text-sm font-bold tracking-widest text-white md:text-base">OSM NEXT LEVEL</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] uppercase tracking-widest text-stone-500 md:text-[10px]">by omerovvvvv · 26/27</span>
                <LiveUserBadge />
              </div>
            </div>
          </a>

          {/* Desktop links */}
          <ul className="hidden items-center gap-6 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="group relative text-sm font-medium uppercase tracking-wide text-stone-400 transition-colors hover:text-[#c9a227] whitespace-nowrap">
                  {l.label}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#c9a227] transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex md:items-center md:gap-2">
              {user && (
                <motion.button
                  onClick={() => setActiveSheet(activeSheet === "garage" ? null : "garage")}
                  whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
                  whileTap={{ scale: 0.94 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '7px 12px', borderRadius: 9, cursor: 'pointer',
                    background: activeSheet === "garage" ? 'rgba(201,162,39,0.12)' : 'rgba(255,255,255,0.04)',
                    border: activeSheet === "garage" ? '1px solid rgba(201,162,39,0.4)' : '1px solid rgba(255,255,255,0.09)',
                    color: activeSheet === "garage" ? '#c9a227' : 'rgba(255,255,255,0.55)',
                    fontSize: 11, fontWeight: 800, letterSpacing: '0.04em', transition: 'all 0.2s',
                  }}
                  aria-label="Taktik Garajım"
                >
                  🗄️ {t("garage.label")}{garageCount > 0 && <span style={{ background: 'rgba(201,162,39,0.15)', borderRadius: 999, padding: '1px 6px', fontSize: 10, color: '#c9a227' }}>{garageCount}</span>}
                </motion.button>
              )}
              <ProfilePanel />
              <ThemeSwitcher />
              <LanguageSwitcher />
              <motion.a
                href="https://buymeacoffee.com/omerovvvvv"
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.06, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.94 }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFDD00] px-3.5 py-2 text-xs font-black text-stone-900 shadow-lg shadow-amber-500/20"
              >
                ☕ {t("nav.donate")}
              </motion.a>
            </div>

            {/* Hamburger */}
            <motion.button
              onClick={() => setOpen((v) => !v)}
              whileHover={{ scale: 1.08, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.92 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white transition-colors hover:border-amber-700/40 hover:bg-amber-900/10"
              aria-label="Menu"
            >
              <motion.svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                animate={{ rotate: open ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 24 }}
              >
                {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
              </motion.svg>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer — always in DOM, CSS transform only (zero JS cost on open) */}
      {createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 9998,
              background: "rgba(0,0,0,0.75)",
              opacity: open ? 1 : 0,
              pointerEvents: open ? "auto" : "none",
              transition: "opacity 0.22s ease",
            }}
          />

          {/* Drawer Panel */}
          <aside
            style={{
              position: "fixed", top: 0, [isRTL ? "left" : "right"]: 0,
              height: "100%", width: "80%", maxWidth: 400,
              background: "#0a0a0a", display: "flex", flexDirection: "column",
              zIndex: 9999,
              boxShadow: "-8px 0 40px rgba(0,0,0,0.9), inset 1px 0 0 rgba(201,162,39,0.08)",
              transform: open ? "translateX(0)" : `translateX(${isRTL ? "-100%" : "100%"})`,
              transition: "transform 0.26s cubic-bezier(0.16,1,0.3,1), visibility 0s linear " + (open ? "0s" : "0.26s"),
              willChange: "transform",
              visibility: open ? "visible" : "hidden",
            }}
            aria-hidden={!open}
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="font-display text-base font-bold text-white">{t("nav.menu")}</span>
              <button
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white hover:bg-amber-900/10 active:scale-95"
                style={{ WebkitTapHighlightColor: "transparent", transition: "transform 0.1s" }}
                aria-label={t("nav.close")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Profile + Theme + Lang */}
            <div className="shrink-0 space-y-3 border-b border-white/10 px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">{t("nav.profile")}</span>
                <ProfilePanel />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">{t("nav.theme")}</span>
                <ThemeSwitcher />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">{t("nav.lang")}</span>
                <LanguageSwitcher />
              </div>
            </div>

            {/* Links + Tool Sheets */}
            <ul className="flex-1 overflow-y-auto px-3 py-3">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-semibold text-stone-300 transition-colors hover:bg-amber-900/10 hover:text-[#c9a227]"
                  >
                    <span>{l.label}</span>
                    <span className="text-stone-500">›</span>
                  </a>
                </li>
              ))}

              {/* Divider */}
              <li aria-hidden="true" style={{ padding: "10px 8px 6px" }}>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
                  <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "#475569" }}>
                    Tools &amp; Resources
                  </span>
                </div>
              </li>

              {toolSheets.map((item) => (
                <li key={item.key} style={{ marginBottom: 4 }}>
                  <button
                    onClick={() => { setOpen(false); setActiveSheet(item.key); }}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-semibold text-stone-200"
                    style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(201,162,39,0.18)", WebkitTapHighlightColor: "transparent" }}
                  >
                    <span className="flex items-center gap-3">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      {item.live && (
                        <span className="animate-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                      )}
                      <span className="text-stone-500">›</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Bottom CTA */}
            <div className="shrink-0 border-t border-white/10 px-4 pb-5 pt-3">
              <a
                href="https://buymeacoffee.com/omerovvvvv"
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFDD00] px-4 py-3.5 text-sm font-black uppercase tracking-widest text-stone-900 shadow-lg shadow-amber-500/20"
              >
                ☕ {t("nav.donate")}
              </a>
            </div>
          </aside>
        </>,
        document.body
      )}

      {/* ── Unified Tool Bottom Sheet ── */}
      {createPortal(
        <AnimatePresence>
          {activeSheet && sheetMeta && (
            <motion.div
              key="tool-sheet-root"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ position: "fixed", inset: 0, zIndex: 10001, overflow: "hidden", pointerEvents: "auto" }}
            >
              {/* Backdrop — no blur on mobile */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.80)" }}
                onClick={() => setActiveSheet(null)}
              />

              {/* Slide-up panel */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 310, damping: 32 }}
                style={{
                  position: "fixed",
                  bottom: 0, left: 0, right: 0,
                  height: "92dvh",
                  background: "#0a0a0a",
                  borderRadius: "22px 22px 0 0",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 -20px 60px rgba(0,0,0,0.8), 0 -1px 0 rgba(201,162,39,0.12)",
                }}
              >
                {/* Drag handle + header */}
                <div style={{ padding: "14px 20px 0", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.12)" }} />

                  <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{sheetMeta.icon}</span>
                      <div>
                        <div style={{ color: "#e2e8f0", fontWeight: 800, fontSize: 16, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                          {sheetMeta.title}
                        </div>
                        <div style={{ color: "#475569", fontSize: 11, marginTop: 2 }}>
                          {sheetMeta.sub}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveSheet(null)}
                      style={{
                        width: 34, height: 34, borderRadius: "50%",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#94a3b8", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, flexShrink: 0,
                        WebkitTapHighlightColor: "transparent",
                      }}
                      aria-label="Close"
                    >✕</button>
                  </div>
                </div>

                {/* Scrollable content */}
                <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
                  <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "#475569", fontSize: 13 }}>Yükleniyor…</div>}>
                    {sheetComponent}
                  </Suspense>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── Back-to-top FAB ── */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            key="scroll-top-fab"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            whileHover={{ scale: 1.1, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.92 }}
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-amber-800/30 bg-black/90 text-white"
            style={{ boxShadow: "0 0 16px rgba(201,162,39,0.08), 0 4px 24px rgba(0,0,0,0.5)" }}
            aria-label="Back to top"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
