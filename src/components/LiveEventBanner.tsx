import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// MONTHLY CONFIGURATION — Update this block every month.
// month is 0-indexed: 0=Jan, 1=Feb, ... 5=June, 6=July, etc.
// ─────────────────────────────────────────────────────────────────────────────

export interface OsmEvent {
  days: number[];
  name: string;
  details: string;
}

export interface OsmEventsConfig {
  year: number;
  month: number;
  monthLabel: string;
  events: OsmEvent[];
}

export const OSM_EVENTS_CONFIG: OsmEventsConfig = {
  year: 2026,
  month: 6, // July
  monthLabel: "July 2026",
  events: [
    { days: [1, 2],   name: "Golden Oldies × Legends",  details: "Old player progression boosted — Legends on transfer list" },
    { days: [4, 5],   name: "Transfer Madness",          details: "6 players on list, higher sale chance, Scout in 2H" },
    { days: [8],      name: "Extreme Training",          details: "Extreme progression — 3H normal / 2H Universal trainers" },
    { days: [11],     name: "Friendly Frenzy",           details: "Extra training progression with every Friendly match" },
    { days: [15],     name: "Superfast Trainer",         details: "Faster training: 2H normal trainers, 1H Universal" },
    { days: [18, 19], name: "Intense Friendlies",        details: "Extra Friendly progression + higher sale chance" },
    { days: [22],     name: "Training Madness",          details: "Extra progression with every Training session" },
    { days: [25],     name: "Guaranteed Training Boost", details: "Rare+ boost guaranteed — 4H normal / 3H Universal" },
    { days: [25, 26], name: "Legends",                   details: "Legend players available on Transfer List" },
    { days: [29],     name: "Stadium Blitz",             details: "4H Stadium upgrades — 5H regular / 4H Universal trainers" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// UK TIME — all logic runs in Europe/London (handles BST/GMT automatically)
// ─────────────────────────────────────────────────────────────────────────────

function getUKParts() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
  const p = Object.fromEntries(fmt.formatToParts(now).map(({ type, value }) => [type, value]));
  return {
    year:   parseInt(p.year),
    month:  parseInt(p.month) - 1, // 0-indexed
    day:    parseInt(p.day),
    hour:   parseInt(p.hour) % 24, // guard against rare "24" at midnight
    minute: parseInt(p.minute),
    second: parseInt(p.second),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BANNER STATE RESOLUTION
// LIVE window:  first event day 07:00 UK  →  last event day 23:00 UK
// UPCOMING:     before 07:00 on start day, or event is wholly in the future
// ─────────────────────────────────────────────────────────────────────────────

type BannerState =
  | { mode: "live";     event: OsmEvent }
  | { mode: "upcoming"; events: OsmEvent[]; startsToday: boolean }
  | { mode: "off" };

function resolveBannerState(): BannerState {
  const uk  = getUKParts();
  const cfg = OSM_EVENTS_CONFIG;

  if (uk.year !== cfg.year || uk.month !== cfg.month) return { mode: "off" };

  const live = cfg.events.find(e => {
    const firstDay = Math.min(...e.days);
    const lastDay  = Math.max(...e.days);
    if (uk.day < firstDay || uk.day > lastDay) return false;
    // Must be at or after 07:00 on the first day
    if (uk.day === firstDay && uk.hour < 7) return false;
    // Must be before 23:00 on the last day
    if (uk.day === lastDay  && uk.hour >= 23) return false;
    return true;
  });

  if (live) return { mode: "live", event: live };

  const upcoming = cfg.events
    .filter(e => {
      const firstDay = Math.min(...e.days);
      const lastDay  = Math.max(...e.days);
      if (uk.day > lastDay)  return false;
      if (uk.day < firstDay) return true;
      // Today is the start day but we haven't hit 07:00 yet
      return uk.day === firstDay && uk.hour < 7;
    })
    .sort((a, b) => Math.min(...a.days) - Math.min(...b.days));

  if (!upcoming.length) return { mode: "off" };

  const startsToday = Math.min(...upcoming[0].days) === uk.day;
  return { mode: "upcoming", events: upcoming, startsToday };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function buildStartLabel(event: OsmEvent, ukDay: number): string {
  const firstDay = Math.min(...event.days);
  const lastDay  = Math.max(...event.days);
  const m        = MONTHS[OSM_EVENTS_CONFIG.month];
  const dateStr  = firstDay === lastDay ? `${m} ${firstDay}` : `${m} ${firstDay}–${lastDay}`;
  return firstDay === ukDay ? "Activates today" : `Activates ${dateStr}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function LiveEventBanner() {
  const [state, setState] = useState<BannerState>(resolveBannerState);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

  // Re-evaluate every 30 s so the banner flips at exactly 07:00 / 23:00 UK
  useEffect(() => {
    const id = setInterval(() => setState(resolveBannerState()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const h = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  if (state.mode === "off") return null;

  const isLive = state.mode === "live";

  return (
    <>
      <style>{`
        @keyframes osm-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes live-sweep {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div style={{
        position: "sticky",
        top: 0, left: 0,
        width: "100%",
        zIndex: 50,
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
        ...(isLive ? {
          background: "linear-gradient(135deg, rgba(30,4,6,0.97) 0%, rgba(10,18,42,0.97) 45%, rgba(20,4,28,0.97) 100%)",
          backgroundSize: isMobile ? "100% 100%" : "300% 300%",
          animation: isMobile ? "none" : "live-sweep 5s ease infinite",
          boxShadow: "0 2px 32px rgba(239,68,68,0.22), 0 0 0 1px rgba(239,68,68,0.1)",
        } : {
          background: "rgba(10, 25, 47, 0.90)",
          boxShadow: "0 1px 28px rgba(0, 230, 180, 0.1)",
        }),
      }}>

        {/* Animated bottom border */}
        <motion.div
          animate={isLive ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
          transition={isLive ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : {}}
          style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: isLive ? 2 : 1,
            background: isLive
              ? "linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.9) 25%, rgba(0,229,255,0.9) 75%, transparent 100%)"
              : "linear-gradient(90deg, transparent 0%, rgba(0,230,180,0.3) 20%, rgba(0,230,180,0.65) 50%, rgba(0,230,180,0.3) 80%, transparent 100%)",
          }}
        />

        <div style={{
          display: "flex", alignItems: "center",
          height: 38, padding: "0 16px",
          overflow: "hidden", gap: 10,
        }}>
          {state.mode === "live"
            ? <LiveContent event={state.event} isMobile={isMobile} />
            : <UpcomingContent events={state.events} startsToday={state.startsToday} isMobile={isMobile} />}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE CONTENT
// ─────────────────────────────────────────────────────────────────────────────

function LiveContent({ event, isMobile }: { event: OsmEvent; isMobile: boolean }) {
  const marqueeText =
    `🔥 SPECIAL EVENT IS NOW LIVE — EXCLUSIVE CONFIGURATIONS UNLOCKED!   ✦   ${event.name}  ·  ${event.details}   ✦   `;

  return (
    <>
      {/* Pulsing red dot */}
      <motion.div
        animate={isMobile ? { opacity: 0.8 } : { opacity: [0.45, 1, 0.45], scale: [0.8, 1.25, 0.8] }}
        transition={isMobile ? {} : { duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "#ef4444",
          boxShadow: "0 0 10px rgba(239,68,68,0.9), 0 0 22px rgba(239,68,68,0.55)",
          flexShrink: 0,
        }}
      />

      {/* Badge */}
      <motion.span
        animate={isMobile ? {} : { boxShadow: [
          "0 0 6px rgba(239,68,68,0.2)",
          "0 0 14px rgba(239,68,68,0.6), 0 0 28px rgba(0,229,255,0.25)",
          "0 0 6px rgba(239,68,68,0.2)",
        ] }}
        transition={isMobile ? {} : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          fontSize: 10, fontWeight: 900, letterSpacing: "0.1em",
          color: "#ef4444",
          background: "rgba(239,68,68,0.13)",
          border: "1px solid rgba(239,68,68,0.48)",
          borderRadius: 999,
          padding: "2px 10px",
          flexShrink: 0, lineHeight: 1,
          textTransform: "uppercase" as const,
          whiteSpace: "nowrap" as const,
        }}
      >⚡ LIVE EVENT ACTIVE</motion.span>

      {/* Divider */}
      <span style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0, fontSize: 15, lineHeight: 1 }}>|</span>

      {/* Scrolling marquee */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative", minWidth: 0 }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 32,
          background: "linear-gradient(90deg, rgba(30,4,6,0.96), transparent)",
          zIndex: 1, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: 32,
          background: "linear-gradient(-90deg, rgba(30,4,6,0.96), transparent)",
          zIndex: 1, pointerEvents: "none",
        }} />
        <div style={{ display: "inline-flex", animation: "osm-marquee 45s linear infinite" }}>
          <span style={{ color: "rgba(255,255,255,0.88)", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" as const }}>
            {marqueeText}
          </span>
          <span style={{ color: "rgba(255,255,255,0.88)", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" as const }}>
            {marqueeText}
          </span>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UPCOMING CONTENT
// ─────────────────────────────────────────────────────────────────────────────

function UpcomingContent({ events, startsToday, isMobile }: { events: OsmEvent[]; startsToday: boolean; isMobile: boolean }) {
  const uk  = getUKParts();

  const tickerText =
    events
      .map(e => `${e.name}  ·  ${buildStartLabel(e, uk.day)}  ·  ${e.details}`)
      .join("   ✦   ") + "   ✦   ";

  const accentColor  = startsToday ? "#00e5ff" : "#fbbf24";
  const accentBg     = startsToday ? "rgba(0,229,255,0.1)"  : "rgba(251,191,36,0.1)";
  const accentBorder = startsToday ? "rgba(0,229,255,0.32)" : "rgba(251,191,36,0.28)";

  return (
    <>
      {/* Badge */}
      <motion.span
        animate={isMobile ? { opacity: 0.85 } : { opacity: [0.72, 1, 0.72] }}
        transition={isMobile ? {} : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          fontSize: 10, fontWeight: 900, letterSpacing: "0.1em",
          color: accentColor,
          background: accentBg,
          border: `1px solid ${accentBorder}`,
          borderRadius: 999,
          padding: "2px 10px",
          flexShrink: 0, lineHeight: 1,
          textTransform: "uppercase" as const,
          whiteSpace: "nowrap" as const,
        }}
      >
        {startsToday ? "STARTS TODAY" : "UPCOMING"}
      </motion.span>

      {/* Divider */}
      <span style={{ color: "rgba(255,255,255,0.18)", flexShrink: 0, fontSize: 15, lineHeight: 1 }}>|</span>

      {/* Scrolling marquee */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative", minWidth: 0 }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 28,
          background: "linear-gradient(90deg, rgba(10,25,47,0.9), transparent)",
          zIndex: 1, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: 28,
          background: "linear-gradient(-90deg, rgba(10,25,47,0.9), transparent)",
          zIndex: 1, pointerEvents: "none",
        }} />
        <div style={{ display: "inline-flex", animation: "osm-marquee 50s linear infinite" }}>
          <span style={{ color: "rgba(255,255,255,0.62)", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" as const }}>
            {tickerText}
          </span>
          <span style={{ color: "rgba(255,255,255,0.62)", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" as const }}>
            {tickerText}
          </span>
        </div>
      </div>
    </>
  );
}
