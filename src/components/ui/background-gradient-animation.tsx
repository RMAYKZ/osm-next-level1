import { cn } from "../../lib/utils";
import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Aceternity BackgroundGradientAnimation — ported from 21st.dev
// Requires @keyframes moveVertical / moveInCircle / moveHorizontal and
// the --animate-first … --animate-fifth @theme variables in index.css.
// ─────────────────────────────────────────────────────────────────────────────

export const BackgroundGradientAnimation = ({
  gradientBackgroundStart = "rgb(108, 0, 162)",
  gradientBackgroundEnd   = "rgb(0, 17, 82)",
  firstColor   = "18, 113, 255",
  secondColor  = "221, 74, 255",
  thirdColor   = "100, 220, 255",
  fourthColor  = "200, 50, 50",
  fifthColor   = "180, 180, 50",
  pointerColor = "140, 100, 255",
  size         = "80%",
  blendingValue = "hard-light",
  children,
  className,
  interactive = true,
  containerClassName,
}: {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?:   string;
  firstColor?:   string;
  secondColor?:  string;
  thirdColor?:   string;
  fourthColor?:  string;
  fifthColor?:   string;
  pointerColor?: string;
  size?:         string;
  blendingValue?: string;
  children?:         React.ReactNode;
  className?:        string;
  interactive?:      boolean;
  containerClassName?: string;
}) => {
  const interactiveRef = useRef<HTMLDivElement>(null);

  const [curX, setCurX] = useState(0);
  const [curY, setCurY] = useState(0);
  const [tgX,  setTgX]  = useState(0);
  const [tgY,  setTgY]  = useState(0);

  // Push all color tokens onto document.body so the Tailwind arbitrary-value
  // classes like bg-[linear-gradient(40deg,var(--gradient-background-start),...)]
  // can resolve at runtime.
  useEffect(() => {
    document.body.style.setProperty("--gradient-background-start", gradientBackgroundStart);
    document.body.style.setProperty("--gradient-background-end",   gradientBackgroundEnd);
    document.body.style.setProperty("--first-color",   firstColor);
    document.body.style.setProperty("--second-color",  secondColor);
    document.body.style.setProperty("--third-color",   thirdColor);
    document.body.style.setProperty("--fourth-color",  fourthColor);
    document.body.style.setProperty("--fifth-color",   fifthColor);
    document.body.style.setProperty("--pointer-color", pointerColor);
    document.body.style.setProperty("--size",          size);
    document.body.style.setProperty("--blending-value", blendingValue);
  }, []);

  // Smooth mouse-follow lerp — ported directly from 21st.dev source
  useEffect(() => {
    function move() {
      if (!interactiveRef.current) return;
      setCurX(curX + (tgX - curX) / 20);
      setCurY(curY + (tgY - curY) / 20);
      interactiveRef.current.style.transform =
        `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
    }
    move();
  }, [tgX, tgY]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (interactiveRef.current) {
      const rect = interactiveRef.current.getBoundingClientRect();
      setTgX(event.clientX - rect.left);
      setTgY(event.clientY - rect.top);
    }
  };

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  }, []);

  return (
    <div
      className={cn(
        "h-screen w-screen relative overflow-hidden top-0 left-0",
        "bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))]",
        containerClassName
      )}
    >
      {/* SVG filter for the goo/blob effect */}
      <svg className="hidden">
        <defs>
          <filter id="blurMe">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Children slot (positioned above gradients via z-index) */}
      <div className={cn("", className)}>{children}</div>

      {/* ── Gradient orbs ── */}
      <div
        className={cn(
          "gradients-container h-full w-full blur-lg",
          isSafari ? "blur-2xl" : "[filter:url(#blurMe)_blur(40px)]"
        )}
      >
        {/* Orb 1 — vertical oscillation */}
        <div
          className={cn(
            "absolute [background:radial-gradient(circle_at_center,_var(--first-color)_0,_var(--first-color)_50%)_no-repeat]",
            "[mix-blend-mode:var(--blending-value)]",
            "w-[var(--size)] h-[var(--size)]",
            "top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]",
            "[transform-origin:center_center]",
            "animate-first opacity-100"
          )}
        />

        {/* Orb 2 — circular (reversed) */}
        <div
          className={cn(
            "absolute [background:radial-gradient(circle_at_center,_rgba(var(--second-color),_0.8)_0,_rgba(var(--second-color),_0)_50%)_no-repeat]",
            "[mix-blend-mode:var(--blending-value)]",
            "w-[var(--size)] h-[var(--size)]",
            "top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]",
            "[transform-origin:calc(50%-400px)]",
            "animate-second opacity-100"
          )}
        />

        {/* Orb 3 — circular (forward) */}
        <div
          className={cn(
            "absolute [background:radial-gradient(circle_at_center,_rgba(var(--third-color),_0.8)_0,_rgba(var(--third-color),_0)_50%)_no-repeat]",
            "[mix-blend-mode:var(--blending-value)]",
            "w-[var(--size)] h-[var(--size)]",
            "top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]",
            "[transform-origin:calc(50%+400px)]",
            "animate-third opacity-100"
          )}
        />

        {/* Orb 4 — horizontal sweep */}
        <div
          className={cn(
            "absolute [background:radial-gradient(circle_at_center,_rgba(var(--fourth-color),_0.8)_0,_rgba(var(--fourth-color),_0)_50%)_no-repeat]",
            "[mix-blend-mode:var(--blending-value)]",
            "w-[var(--size)] h-[var(--size)]",
            "top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]",
            "[transform-origin:calc(50%-200px)]",
            "animate-fourth opacity-70"
          )}
        />

        {/* Orb 5 — diagonal circular */}
        <div
          className={cn(
            "absolute [background:radial-gradient(circle_at_center,_rgba(var(--fifth-color),_0.8)_0,_rgba(var(--fifth-color),_0)_50%)_no-repeat]",
            "[mix-blend-mode:var(--blending-value)]",
            "w-[var(--size)] h-[var(--size)]",
            "top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]",
            "[transform-origin:calc(50%-800px)_calc(50%+800px)]",
            "animate-fifth opacity-100"
          )}
        />

        {/* Interactive pointer blob */}
        {interactive && (
          <div
            ref={interactiveRef}
            onMouseMove={handleMouseMove}
            className={cn(
              "absolute [background:radial-gradient(circle_at_center,_rgba(var(--pointer-color),_0.8)_0,_rgba(var(--pointer-color),_0)_50%)_no-repeat]",
              "[mix-blend-mode:var(--blending-value)]",
              "w-full h-full -top-1/2 -left-1/2 opacity-70"
            )}
          />
        )}
      </div>
    </div>
  );
};
