import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";

// ═══════════════════════════════════════════════════════════════════════════════
// MONTHLY DATA — Replace this block each month
//
//   1. Update year, month (0-indexed: 0=Jan…5=Jun…11=Dec), monthLabel
//   2. Replace the events array below with the new month's events
//   3. Each entry: days[] (day numbers), name, mechanic, icon (emoji)
//
// TIME RULES (hidden from UI, UK Europe/London timezone):
//   • LIVE window  : start_day at 07:00 UK  →  end_day at 23:00 UK
//   • UPCOMING     : the very next event after any current live/gap
//   • PAST         : end_day 23:00 UK has elapsed  →  card dims out
// ═══════════════════════════════════════════════════════════════════════════════

interface ScheduleEvent {
  days: number[];
  name: string;
  mechanic: string;
  icon: string;
}

const SCHEDULE_EVENTS: ScheduleEvent[] = [
  // ─── Paste new month's events here ─────────────────────────────────────────
  { days: [3],      name: "Extreme Training",          mechanic: "Faster training: 2H normal, 1:30H Universal",          icon: "⚡" },
  { days: [6, 7],   name: "Transfer Madness",          mechanic: "6 players on list, 2H Scout",                          icon: "🔄" },
  { days: [10],     name: "Guaranteed Training Boost", mechanic: "No normal trainings — Faster training: 4H / 3H",       icon: "📈" },
  { days: [13, 14], name: "Golden Oldies × Legends",   mechanic: "Old players progression, Legends on list",             icon: "⭐" },
  { days: [17],     name: "Booming Stadium",           mechanic: "4H Stadium timers",                                    icon: "🏟️" },
  { days: [20, 21], name: "Training Talents",          mechanic: "Younger players progression",                          icon: "🌱" },
  { days: [22, 23], name: "Legends",                   mechanic: "Legends on Transfer List",                             icon: "👑" },
  { days: [24],     name: "Superfast Trainer",         mechanic: "2H normal trainers, 1H Universal Trainer",             icon: "🚀" },
  { days: [27, 28], name: "Intense Friendlies",        mechanic: "Extra progression with Friendlies",                    icon: "⚽" },
  // ───────────────────────────────────────────────────────────────────────────
];

const SCHEDULE_META = {
  year: 2026,
  month: 5,            // 0-indexed: 5 = June
  monthLabel: "June 2026",
};

// ═══════════════════════════════════════════════════════════════════════════════
// UK TIME ENGINE — Europe/London, BST/GMT safe. Never rendered to the screen.
// ═══════════════════════════════════════════════════════════════════════════════

function getUKParts() {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
    hour12: false,
  });
  const p = Object.fromEntries(
    fmt.formatToParts(new Date()).map(({ type, value }) => [type, value])
  );
  return {
    year:  parseInt(p.year),
    month: parseInt(p.month) - 1,   // 0-indexed
    day:   parseInt(p.day),
    hour:  parseInt(p.hour) % 24,   // guard against rare "24"
  };
}

type EventStatus = "live" | "upcoming" | "future" | "past";

function computeStatuses(): EventStatus[] {
  const uk  = getUKParts();
  const cfg = SCHEDULE_META;

  // Outside the configured month — all past or all future
  if (uk.year !== cfg.year || uk.month !== cfg.month) {
    const allPast =
      uk.year > cfg.year ||
      (uk.year === cfg.year && uk.month > cfg.month);
    return SCHEDULE_EVENTS.map(() => (allPast ? "past" : "future"));
  }

  // First pass — raw live / past / future per event
  const raw: ("live" | "past" | "future")[] = SCHEDULE_EVENTS.map(ev => {
    const first = Math.min(...ev.days);
    const last  = Math.max(...ev.days);
    const started = uk.day > first || (uk.day === first && uk.hour >= 7);
    const ended   = uk.day > last  || (uk.day === last  && uk.hour >= 23);
    if (started && !ended) return "live";
    if (ended) return "past";
    return "future";
  });

  // Second pass — mark the single next upcoming event
  const liveIdx    = raw.findIndex(s => s === "live");
  const searchFrom = liveIdx !== -1 ? liveIdx + 1 : 0;
  const upcomingIdx = raw.findIndex((s, i) => i >= searchFrom && s === "future");

  return raw.map((s, i) => (i === upcomingIdx ? "upcoming" : s));
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_KEYS = ["january","february","march","april","may","june","july","august","september","october","november","december"] as const;

function formatDate(days: number[]): string {
  const m     = MONTH_ABBR[SCHEDULE_META.month];
  const first = Math.min(...days);
  const last  = Math.max(...days);
  return first === last ? `${m} ${first}` : `${m} ${first}–${last}`;
}

const ease = [0.16, 1, 0.3, 1] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const IS_MOBILE_OES = typeof window !== "undefined" && window.innerWidth < 768;

export default function OSMEventsSchedule() {
  const { t } = useLang();
  const [statuses, setStatuses] = useState<EventStatus[]>(computeStatuses);

  // Re-evaluate every 30 s so state flips exactly at 07:00 / 23:00 UK
  useEffect(() => {
    const id = setInterval(() => setStatuses(computeStatuses()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style>{`
        @keyframes ev-live-pulse {
          0%, 100% { box-shadow: 0 0 14px -4px rgba(0,212,255,0.45), inset 0 0 0 1px rgba(0,212,255,0.3); }
          50%       { box-shadow: 0 0 32px -4px rgba(0,212,255,0.85), inset 0 0 0 1px rgba(0,212,255,0.65); }
        }
        @keyframes ev-badge-pulse {
          0%, 100% { opacity: 0.80; }
          50%       { opacity: 1; }
        }
      `}</style>

      <section id="events-schedule" className="relative overflow-hidden py-20">
        {/* Top separator */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

        {/* Ambient glow — desktop only */}
        <div
          className="mobile-hide-glow absolute left-1/2 top-1/4 -translate-x-1/2 rounded-full blur-[140px]"
          style={{ width: 560, height: 280, background: "rgba(0,163,255,0.045)" }}
        />

        <div className="relative mx-auto max-w-7xl px-6">

          {/* ── Section header ── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="mb-10 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left"
          >
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">{t("events.badge")}</span>
              </div>
              <h2
                className="text-2xl font-black uppercase tracking-tight text-white md:text-3xl"
                style={{ fontFamily: "'Barlow Condensed', system-ui, sans-serif" }}
              >
                {t(`months.${MONTH_KEYS[SCHEDULE_META.month]}`)} {SCHEDULE_META.year}
                <span className="ml-2 text-cyan-400">{t("events.program_title")}</span>
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-500 tracking-wide">
                {t("events.disclaimer")}
              </p>
            </div>

            {/* Live event count pill */}
            <LiveCountPill statuses={statuses} />
          </motion.div>

          {/* ── Events grid ── */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {SCHEDULE_EVENTS.map((ev, i) => (
              <EventCard key={i} index={i} event={ev} status={statuses[i]} />
            ))}
          </motion.div>

        </div>
      </section>
    </>
  );
}

// ── Live count pill ────────────────────────────────────────────────────────────

function LiveCountPill({ statuses }: { statuses: EventStatus[] }) {
  const { t } = useLang();
  const liveCount     = statuses.filter(s => s === "live").length;
  const upcomingCount = statuses.filter(s => s === "upcoming" || s === "future").length;

  if (liveCount > 0) {
    return (
      <motion.div
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="flex-shrink-0 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1.5"
      >
        <span className="text-xs font-black uppercase tracking-widest text-cyan-300">
          {t("events.pill.active")}
        </span>
      </motion.div>
    );
  }
  if (upcomingCount > 0) {
    return (
      <div className="flex-shrink-0 rounded-full border border-amber-400/25 bg-amber-400/[0.06] px-4 py-1.5">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400/80">
          {t("events.pill.remaining").replace("{n}", upcomingCount.toString())}
        </span>
      </div>
    );
  }
  return null;
}

// ── Individual event card ─────────────────────────────────────────────────────

function EventCard({ index, event, status }: { index: number; event: ScheduleEvent; status: EventStatus }) {
  const { t } = useLang();
  const isLive     = status === "live";
  const isUpcoming = status === "upcoming";
  const isPast     = status === "past";

  const cardStyle: React.CSSProperties = {
    borderRadius: 16,
    padding: "18px 18px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    opacity: isPast ? 0.38 : 1,
    transition: "opacity 0.4s ease",
    ...(isLive ? {
      background: "linear-gradient(145deg, rgba(0,30,50,0.85) 0%, rgba(0,15,32,0.9) 100%)",
      border: "1px solid rgba(0,212,255,0.35)",
      animation: IS_MOBILE_OES ? "none" : "ev-live-pulse 2.2s ease-in-out infinite",
    } : isUpcoming ? {
      background: "linear-gradient(145deg, rgba(20,18,6,0.7) 0%, rgba(10,10,5,0.75) 100%)",
      border: "1px solid rgba(255,228,77,0.22)",
    } : isPast ? {
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.05)",
    } : {
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
    }),
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.97 },
        show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.45, ease } },
      }}
      whileHover={!isPast ? {
        y: -4,
        transition: { duration: 0.18 },
      } : {}}
      style={cardStyle}
    >
      {/* ── Top row: date + status badge ── */}
      <div className="flex items-center justify-between gap-2">
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: isLive ? "rgba(0,212,255,0.9)" : isUpcoming ? "rgba(255,228,77,0.8)" : "rgba(255,255,255,0.35)",
            background: isLive
              ? "rgba(0,212,255,0.1)"
              : isUpcoming
                ? "rgba(255,228,77,0.08)"
                : "rgba(255,255,255,0.04)",
            border: isLive
              ? "1px solid rgba(0,212,255,0.22)"
              : isUpcoming
                ? "1px solid rgba(255,228,77,0.15)"
                : "1px solid rgba(255,255,255,0.06)",
            borderRadius: 999,
            padding: "3px 10px",
            flexShrink: 0,
          }}
        >
          {formatDate(event.days)}
        </span>

        {isLive && (
          <motion.span
            animate={{ opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#ef4444",
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.38)",
              borderRadius: 999,
              padding: "3px 9px",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {t("events.badge.live")}
          </motion.span>
        )}

        {isUpcoming && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase" as const,
              color: "rgba(255,228,77,0.7)",
              background: "rgba(255,228,77,0.07)",
              border: "1px solid rgba(255,228,77,0.18)",
              borderRadius: 999,
              padding: "3px 9px",
              flexShrink: 0,
              whiteSpace: "nowrap" as const,
            }}
          >
            {t("events.status.upcoming")}
          </span>
        )}

        {isPast && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              color: "rgba(255,255,255,0.2)",
              borderRadius: 999,
              padding: "3px 9px",
              flexShrink: 0,
            }}
          >
            {t("events.status.finished")}
          </span>
        )}
      </div>

      {/* ── Icon + name row ── */}
      <div className="flex items-center gap-3">
        <span
          style={{
            fontSize: 28,
            lineHeight: 1,
            filter: isPast ? "grayscale(0.6)" : "none",
            flexShrink: 0,
          }}
        >
          {event.icon}
        </span>
        <span
          style={{
            fontSize: 15,
            fontWeight: 800,
            lineHeight: 1.25,
            color: isLive
              ? "#f0f9ff"
              : isUpcoming
                ? "rgba(255,255,255,0.88)"
                : isPast
                  ? "rgba(255,255,255,0.35)"
                  : "rgba(255,255,255,0.78)",
            letterSpacing: "-0.01em",
          }}
        >
          {t(`ev.${index}.name`)}
        </span>
      </div>

      {/* ── Mechanic detail ── */}
      <p
        style={{
          fontSize: 12,
          fontWeight: 500,
          lineHeight: 1.55,
          color: isLive
            ? "rgba(147,210,255,0.75)"
            : isUpcoming
              ? "rgba(255,228,77,0.55)"
              : "rgba(255,255,255,0.32)",
          margin: 0,
          paddingTop: 2,
          borderTop: isLive
            ? "1px solid rgba(0,212,255,0.1)"
            : isUpcoming
              ? "1px solid rgba(255,228,77,0.08)"
              : "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {t(`ev.${index}.mechanic`)}
      </p>
    </motion.div>
  );
}
