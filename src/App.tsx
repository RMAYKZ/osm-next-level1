import { lazy, Suspense } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { PremiumProvider } from "./contexts/PremiumContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { SavedTacticsProvider } from "./contexts/SavedTacticsContext";
import { MotionConfig } from "framer-motion";
// Above-fold: eager imports
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import PremiumTactics from "./components/PremiumTactics";
import AntiTacticFinder from "./components/AntiTacticFinder";
import WeeklyMeta from "./components/WeeklyMeta";
import LiveEventBanner from "./components/LiveEventBanner";
import SocialContactBanner from "./components/SocialContactBanner";
import PremiumUpdateBanner from "./components/PremiumUpdateBanner";
import PremiumExpiryBanner from "./components/PremiumExpiryBanner";
import { PwaInstallBanner } from "./components/PwaInstallBanner";
// Lazy: shader defers Three.js (355 kB) until after first paint
const AnimatedShaderBackground = lazy(() => import("./components/ui/animated-shader-background"));
// Lazy: below-fold sections — downloaded only when main bundle parses
const ScreenshotAnalyzer = lazy(() => import("./components/ScreenshotAnalyzer"));
const MetaShareCard = lazy(() => import("./components/MetaShareCard"));
const MetaVote = lazy(() => import("./components/MetaVote"));
const CommunityHub = lazy(() => import("./components/CommunityHub"));
const YouTubeVideos = lazy(() => import("./components/YouTubeVideos"));
const About = lazy(() => import("./components/About"));
const CommentSection = lazy(() => import("./components/CommentSection"));
const Footer = lazy(() => import("./components/Footer"));

// Detect mobile once at load time — never changes mid-session
const IS_MOBILE = typeof window !== "undefined" && window.innerWidth < 768;

export default function App() {
  return (
    <MotionConfig reducedMotion={IS_MOBILE ? "always" : "user"}>
    <LanguageProvider>
      <ThemeProvider>
      <AuthProvider>
      <PremiumProvider>
        <FavoritesProvider>
        <SavedTacticsProvider>

          {/* ── Background ──
              Mobile: a plain static gradient div, no Three.js involved at
              all — `<AnimatedShaderBackground />` is never rendered, so its
              lazy import (and the ~500kB three.js chunk inside it) is never
              even requested. Desktop: full animated WebGL shader. */}
          {IS_MOBILE ? (
            <div style={{
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0,
              background: "radial-gradient(ellipse 80% 60% at 75% 15%, rgba(52,211,153,0.10) 0%, transparent 60%), #070711",
            }} />
          ) : (
            <Suspense fallback={
              <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#070711", zIndex: 0 }} />
            }>
              <AnimatedShaderBackground />
            </Suspense>
          )}

          {/* ── Scrollable content layer ── */}
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1,
          }}>
            <div id="scroll-root" style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(7,7,17,0.35)",
              overflowY: "auto",
              overflowX: "hidden",
            }}>
              <div className="min-h-screen text-white animate-smooth-entry">
                <LiveEventBanner />
                <SocialContactBanner />
                <Navbar />
                <PremiumExpiryBanner />
                <PremiumUpdateBanner />
                <Hero />
                <PremiumTactics />
                <AntiTacticFinder />
                <WeeklyMeta />
                <Suspense fallback={null}><ScreenshotAnalyzer /></Suspense>
                <Suspense fallback={null}><MetaShareCard /></Suspense>
                <Suspense fallback={null}><MetaVote /></Suspense>
                <Suspense fallback={null}><CommunityHub /></Suspense>
                <Suspense fallback={null}><YouTubeVideos /></Suspense>
                <Suspense fallback={null}><About /></Suspense>
                <Suspense fallback={null}><CommentSection /></Suspense>
                <Suspense fallback={null}><Footer /></Suspense>
              </div>
            </div>
          </div>

          {/* ── PWA Install Banner — bottom of screen ── */}
          <PwaInstallBanner />

        </SavedTacticsProvider>
        </FavoritesProvider>
      </PremiumProvider>
      </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
    </MotionConfig>
  );
}
