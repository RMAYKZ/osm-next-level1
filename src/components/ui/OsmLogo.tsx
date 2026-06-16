// Premium football pitch mark — optimised for 44px navbar + large PWA sizes
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
        <radialGradient id="olbg" cx="40%" cy="30%" r="75%">
          <stop offset="0%"   stopColor="#131830" />
          <stop offset="100%" stopColor="#05050e" />
        </radialGradient>
        <linearGradient id="olline" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#6b96f8" />
          <stop offset="100%" stopColor="#8b64f0" />
        </linearGradient>
        <filter id="olglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="44" height="44" fill="url(#olbg)" />

      {/* Ambient field tint */}
      <ellipse cx="22" cy="22" rx="16" ry="13" fill="rgba(91,138,247,0.06)" />

      {/* Pitch lines — glowing */}
      <g filter="url(#olglow)" stroke="url(#olline)" fill="none">
        {/* Outer border */}
        <rect x="7" y="4.5" width="30" height="35" rx="1.5" strokeWidth="1.7" strokeOpacity="0.95" />
        {/* Halfway line */}
        <line x1="7" y1="22" x2="37" y2="22" strokeWidth="1.1" strokeOpacity="0.85" />
        {/* Centre circle */}
        <circle cx="22" cy="22" r="5.5" strokeWidth="1.1" strokeOpacity="0.85" />
        {/* Top penalty box */}
        <rect x="13.5" y="4.5" width="17" height="8" rx="0.5" strokeWidth="0.85" strokeOpacity="0.5" />
        {/* Bottom penalty box */}
        <rect x="13.5" y="31.5" width="17" height="8" rx="0.5" strokeWidth="0.85" strokeOpacity="0.5" />
      </g>

      {/* Centre spot */}
      <circle cx="22" cy="22" r="1.9" fill="#6b96f8" />
      {/* Penalty spots */}
      <circle cx="22" cy="9.5"  r="0.95" fill="#8b64f0" fillOpacity="0.7" />
      <circle cx="22" cy="34.5" r="0.95" fill="#8b64f0" fillOpacity="0.7" />
    </svg>
  );
}
