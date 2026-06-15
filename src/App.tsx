import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BackgroundGradientAnimation } from "./components/ui/background-gradient-animation";
import { AuthProvider } from "./contexts/AuthContext";
import { PremiumProvider } from "./contexts/PremiumContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { SavedTacticsProvider } from "./contexts/SavedTacticsContext";
import { MotionConfig } from "framer-motion";

// Detect mobile once at load time — never changes mid-session
const IS_MOBILE = typeof window !== "undefined" && window.innerWidth < 768;
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WeeklyMeta from "./components/WeeklyMeta";
import AntiTacticFinder from "./components/AntiTacticFinder";
import MetaShareCard from "./components/MetaShareCard";
import PremiumTactics from "./components/PremiumTactics";
import MetaVote from "./components/MetaVote";
import CommunityHub from "./components/CommunityHub";
import YouTubeVideos from "./components/YouTubeVideos";
import About from "./components/About";
import CommentSection from "./components/CommentSection";
import Footer from "./components/Footer";
import LiveEventBanner from "./components/LiveEventBanner";
import PremiumUpdateBanner from "./components/PremiumUpdateBanner";
import { PwaInstallBanner } from "./components/PwaInstallBanner";

export default function App() {
  return (
    <MotionConfig reducedMotion={IS_MOBILE ? "always" : "user"}>
    <LanguageProvider>
      <ThemeProvider>
      <AuthProvider>
      <PremiumProvider>
        <FavoritesProvider>
        <SavedTacticsProvider>

          {/* ── Mobile fallback background (hidden on md+) ── */}
          <div
            className="fixed inset-0 -z-10 md:hidden"
            style={{ background: "#080808" }}
          />

          {/* ── Subtle warm-dark ambient gradient — desktop only (md+) ── */}
          <div className="hidden md:block">
            <BackgroundGradientAnimation
              containerClassName="fixed inset-0 -z-10 pointer-events-none"
              interactive={false}
              gradientBackgroundStart="rgb(6, 5, 3)"
              gradientBackgroundEnd="rgb(3, 2, 1)"
              firstColor="45, 32, 5"
              secondColor="22, 15, 2"
              thirdColor="38, 26, 4"
              fourthColor="12, 8, 1"
              fifthColor="30, 21, 3"
              pointerColor="55, 40, 7"
              blendingValue="hard-light"
              size="80%"
            />
          </div>

          {/* ── Scrollable content layer ── */}
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
          }}>
            <div id="scroll-root" style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.72)",
              overflowY: "auto",
              overflowX: "hidden",
            }}>
              <div className="min-h-screen text-white animate-smooth-entry">
                <LiveEventBanner />
                <Navbar />
                <PremiumUpdateBanner />
                <Hero />
                <PremiumTactics />
                <AntiTacticFinder />
                <WeeklyMeta />
                <MetaShareCard />
                <MetaVote />
                <CommunityHub />
                <YouTubeVideos />
                <About />
                <CommentSection />
                <Footer />
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
