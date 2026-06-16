// Inline SVG pitch logo — replaces osm-logo.png everywhere
export function OsmLogo({ size = "100%" }: { size?: number | string }) {
  return (
    <svg
      viewBox="0 0 44 44"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
      aria-label="OSM Next Level"
    >
      <defs>
        <radialGradient id="olbg" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#0d1a0f" />
          <stop offset="100%" stopColor="#070b15" />
        </radialGradient>
        <filter id="olglow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="0.9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="44" height="44" fill="url(#olbg)" />

      {/* Subtle ambient field glow */}
      <ellipse cx="22" cy="22" rx="17" ry="14"
        fill="oklch(0.87 0.27 152 / 0.07)" />

      {/* Pitch lines — glow filter */}
      <g filter="url(#olglow)" style={{ stroke: "oklch(0.87 0.27 152)", fill: "none" }}>
        {/* Outer border */}
        <rect x="7" y="4.5" width="30" height="35" rx="1.5" strokeWidth="1.3" />

        {/* Halfway line */}
        <line x1="7" y1="22" x2="37" y2="22" strokeWidth="0.85" />

        {/* Centre circle */}
        <circle cx="22" cy="22" r="5.5" strokeWidth="0.85" />

        {/* Top penalty box */}
        <rect x="13.5" y="4.5" width="17" height="7.5" rx="0.5"
          strokeWidth="0.75" style={{ stroke: "oklch(0.87 0.27 152 / 0.55)" }} />

        {/* Bottom penalty box */}
        <rect x="13.5" y="32" width="17" height="7.5" rx="0.5"
          strokeWidth="0.75" style={{ stroke: "oklch(0.87 0.27 152 / 0.55)" }} />

        {/* Corner arcs */}
        <path d="M7 6.5 A2 2 0 0 1 9 4.5"   strokeWidth="0.6" style={{ stroke: "oklch(0.87 0.27 152 / 0.4)" }} />
        <path d="M35 4.5 A2 2 0 0 1 37 6.5"  strokeWidth="0.6" style={{ stroke: "oklch(0.87 0.27 152 / 0.4)" }} />
        <path d="M7 37.5 A2 2 0 0 0 9 39.5"  strokeWidth="0.6" style={{ stroke: "oklch(0.87 0.27 152 / 0.4)" }} />
        <path d="M35 39.5 A2 2 0 0 0 37 37.5" strokeWidth="0.6" style={{ stroke: "oklch(0.87 0.27 152 / 0.4)" }} />
      </g>

      {/* Centre spot — brighter, no filter (stands out) */}
      <circle cx="22" cy="22" r="1.5" fill="oklch(0.87 0.27 152)" />

      {/* Penalty spots */}
      <circle cx="22" cy="9.5"  r="0.9" fill="oklch(0.87 0.27 152 / 0.65)" />
      <circle cx="22" cy="34.5" r="0.9" fill="oklch(0.87 0.27 152 / 0.65)" />
    </svg>
  );
}
