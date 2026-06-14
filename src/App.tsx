import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BackgroundGradientAnimation } from "./components/ui/background-gradient-animation";
import { AuthProvider } from "./contexts/AuthContext";
import { PremiumProvider } from "./contexts/PremiumContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { SavedTacticsProvider } from "./contexts/SavedTacticsContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WeeklyMeta from "./components/WeeklyMeta";
import AntiTacticFinder from "./components/AntiTacticFinder";
import SliderCalculator from "./components/SliderCalculator";
import MetaShareCard from "./components/MetaShareCard";
import HighRiskEngine from "./components/HighRiskEngine";
import MatchCoach from "./components/MatchCoach";
import PremiumTactics from "./components/PremiumTactics";
import FormationsOverview from "./components/FormationsOverview";
import FAQSection from "./components/FAQSection";
import CommunityHub from "./components/CommunityHub";
import YouTubeVideos from "./components/YouTubeVideos";
import Leaderboard from "./components/Leaderboard";
import About from "./components/About";
import CommentSection from "./components/CommentSection";
import Footer from "./components/Footer";
import LiveEventBanner from "./components/LiveEventBanner";
import PremiumUpdateBanner from "./components/PremiumUpdateBanner";
import ChatWidget from "./components/ChatWidget";
import { PwaInstallBanner } from "./components/PwaInstallBanner";

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
      <AuthProvider>
      <PremiumProvider>
        <FavoritesProvider>
        <SavedTacticsProvider>

          {/* ── Mobile fallback background (hidden on md+) ── */}
          <div
            className="fixed inset-0 -z-10 md:hidden"
            style={{ background: "radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 50%, #020617 100%)" }}
          />

          {/* ── Aceternity animated gradient — desktop only (md+) ── */}
          <div className="hidden md:block">
            <BackgroundGradientAnimation
              containerClassName="fixed inset-0 -z-10 pointer-events-none"
              interactive={false}
              gradientBackgroundStart="rgb(1, 4, 16)"
              gradientBackgroundEnd="rgb(2, 8, 24)"
              firstColor="18, 113, 255"
              secondColor="72, 20, 200"
              thirdColor="0, 180, 220"
              fourthColor="60, 10, 120"
              fifthColor="20, 150, 80"
              pointerColor="0, 163, 255"
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
              backgroundColor: "rgba(0, 0, 0, 0.40)",
              overflowY: "auto",
              overflowX: "hidden",
            }}>
              <div className="min-h-screen text-white animate-smooth-entry">
                <LiveEventBanner />
                <Navbar />
                <PremiumUpdateBanner />
                <Hero />
                <AntiTacticFinder />
                <WeeklyMeta />
                <MetaShareCard />
                <SliderCalculator />
                <HighRiskEngine />
                <MatchCoach />
                <PremiumTactics />
                <Leaderboard />
                <FormationsOverview />
                <FAQSection />
                <CommunityHub />
                <YouTubeVideos />
                <About />
                <CommentSection />
                <Footer />
              </div>
            </div>
          </div>

          {/* ── ChatWidget — fixed viewport overlay, sitewide ── */}
          <ChatWidget />

          {/* ── PWA Install Banner — bottom of screen ── */}
          <PwaInstallBanner />

        </SavedTacticsProvider>
        </FavoritesProvider>
      </PremiumProvider>
      </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
