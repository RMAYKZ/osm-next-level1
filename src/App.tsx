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
import DiscountAnnouncementBanner from "./components/DiscountAnnouncementBanner";
import { PwaInstallBanner } from "./components/PwaInstallBanner";
// Lazy: sparkles background defers its own chunk (tsParticles) until after first paint
const SparklesCore = lazy(() => import("./components/ui/sparkles").then(m => ({ default: m.SparklesCore })));
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
              Mobile: a plain static gradient div, cheap to paint, no extra
              chunk requested — canvas particle rendering is a real per-frame
              CPU cost that isn't worth risking on weaker/battery-constrained
              devices. Desktop: a sparse gold sparkle field (tsParticles),
              lazy-loaded so it never blocks first paint. Density is tuned
              low (30, scaled internally per 400x400px) — enough for ambient
              texture without hundreds of moving particles on a full-viewport
              canvas. */}
          {IS_MOBILE ? (
            <div style={{
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0,
              background: "radial-gradient(ellipse 80% 60% at 75% 15%, rgba(239,68,68,0.10) 0%, transparent 60%), #050506",
            }} />
          ) : (
            <div style={{
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0,
              background: "radial-gradient(ellipse 70% 55% at 25% 10%, rgba(239,68,68,0.10) 0%, transparent 60%), radial-gradient(ellipse 55% 45% at 85% 80%, rgba(34,211,238,0.05) 0%, transparent 65%), #050506",
            }}>
              <Suspense fallback={null}>
                <SparklesCore
                  background="transparent"
                  minSize={0.6}
                  maxSize={1.3}
                  speed={0.6}
                  particleDensity={30}
                  particleColor="#fbbf24"
                  className="h-full w-full"
                />
              </Suspense>
            </div>
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
                <DiscountAnnouncementBanner />
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
