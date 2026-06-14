import { useRef, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";

// Spring config — weighted enough to feel premium, responsive enough to not lag
const SPRING = { stiffness: 160, damping: 35, mass: 1 } as const;

// Cubic-bezier as const so TS narrows to [number,number,number,number], not number[]
const EASE = [0.16, 1, 0.3, 1] as const;

// Entrance: text rises from below while blurring into focus
const wrapperVariants = {
  hidden: { opacity: 0, y: 48, filter: "blur(16px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE, delay: 0.12 },
  },
};

/**
 * Self-contained, plug-and-play hero headline.
 *
 * Drop-in replacement for the title block in Hero.tsx.
 * Manages its own perspective context, mouse tracking, and entrance animation —
 * no props needed, no surrounding layout affected.
 */
export default function HeroTitle() {
  const { t } = useLang();
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Mouse tracking ─────────────────────────────────────────────────────────
  // Raw offset from the container's center point (pixels)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Map raw offset → rotation angle, then spring-smooth the result
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-6, 6]), SPRING);
  const rotateX = useSpring(useTransform(mouseY, [-200, 200], [5, -5]), SPRING);

  // Atmospheric glow drifts with the cursor — less travel than the tilt
  const glowX = useSpring(useTransform(mouseX, [-300, 300], [-28, 28]), SPRING);
  const glowY = useSpring(useTransform(mouseY, [-200, 200], [-18, 18]), SPRING);

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = containerRef.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    mouseX.set(e.clientX - (left + width / 2));
    mouseY.set(e.clientY - (top + height / 2));
  }

  function onMouseLeave() {
    // Spring naturally eases back to 0 when the source MotionValue returns to 0
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div
      ref={containerRef}
      className="relative mb-6 select-none"
      style={{ perspective: "1000px" }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* ── Atmospheric blur-glow ───────────────────────────────────────────── */}
      {/*
        Positioned behind the text with -z-10. Moves subtly with the cursor
        via glowX/glowY, creating a "light source follows mouse" sensation.
        Two layers: outer haze (static position) + inner halo (pulsing).
      */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ x: glowX, y: glowY }}
      >
        {/* Outer atmospheric haze */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: "150%",
            height: "220%",
            background:
              "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(34,211,238,0.2) 0%, rgba(99,102,241,0.13) 38%, rgba(251,191,36,0.09) 62%, transparent 82%)",
            filter: "blur(40px)",
          }}
        />
        {/* Inner halo — pulses independently of mouse */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: "85%",
            height: "150%",
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(34,211,238,0.13) 0%, transparent 68%)",
            filter: "blur(24px)",
          }}
          animate={{ opacity: [0.45, 1, 0.45], scale: [0.94, 1.06, 0.94] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* ── Tilting title wrapper ───────────────────────────────────────────── */}
      {/*
        rotateX / rotateY come from spring-smoothed mouse transforms.
        The parent's `perspective: 1000px` supplies the depth context.
        During the entrance, the blur-in filter on this wrapper also blurs
        the child drop-shadows, creating a glowing haze that sharpens as text arrives.
      */}
      <motion.div
        variants={wrapperVariants}
        initial="hidden"
        animate="show"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <h1 className="hero-brand-title uppercase leading-none" aria-label="OSM NEXT LEVEL">

          {/* ── Line 1: "OSM NEXT" — cyan → violet → emerald ── */}
          <span
            className="htitle-shimmer-top block bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent"
            style={{
              fontSize: "clamp(2.2rem, 6.5vw, 4rem)",
              letterSpacing: "-0.022em",
              filter:
                "drop-shadow(0 0 10px rgba(34,211,238,0.70)) drop-shadow(0 0 32px rgba(167,139,250,0.40))",
            }}
          >
            {t("hero.title1")}
          </span>

          {/* ── Line 2: "LEVEL" — violet → fuchsia → pink ── */}
          <span
            className="block"
            style={{
              fontSize: "clamp(4rem, 13vw, 6rem)",
              lineHeight: 0.88,
              letterSpacing: "-0.02em",
              color: "#a78bfa",
              filter:
                "drop-shadow(0 0 14px rgba(167,139,250,0.85)) drop-shadow(0 0 42px rgba(232,121,249,0.35))",
            }}
          >
            {t("hero.title2")}
          </span>
        </h1>
      </motion.div>
    </div>
  );
}
