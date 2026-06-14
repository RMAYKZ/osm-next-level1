import { motion } from "framer-motion";
import GamePlan from "./GamePlan";
import LineTactics from "./LineTactics";
const ease = [0.16, 1, 0.3, 1] as const;

export default function TacticsSection() {

  return (
    <section id="taktik-kurulum" className="relative overflow-hidden py-20">
      {/* Top separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

      {/* Background glow */}
      <div
        className="mobile-hide-glow absolute left-1/2 top-1/3 -translate-x-1/2 rounded-full blur-[160px]"
        style={{ width: 480, height: 320, background: "rgba(14,165,233,0.055)" }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Row 1: Game Plan (full width on mobile, 50% on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease }}
          className="mb-6"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <GamePlan />
            {/* Tackling placeholder card — mirrors OSM 2-column layout */}
            <TacklingCard />
          </div>
        </motion.div>

        {/* Row 2: Line Tactics (full width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1, ease }}
        >
          <LineTactics />
        </motion.div>
      </div>
    </section>
  );
}

// Tackling card — decorative companion card matching OSM layout
function TacklingCard() {
  const STYLES = [
    { id: "normal",     label: "Normal",     icon: "😐" },
    { id: "aggressive", label: "Aggressive", icon: "😤" },
    { id: "lenient",    label: "Lenient",    icon: "😌" },
    { id: "hard",       label: "Hard",       icon: "😠" },
  ] as const;

  return (
    <div
      style={{
        background: "linear-gradient(165deg, #0e1d32 0%, #091422 100%)",
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.07)",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 220,
        gap: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#4fc3f7", fontWeight: 900, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Tackling
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 19, height: 19, borderRadius: "50%",
          background: "linear-gradient(135deg, #1e7ab8 0%, #1560a0 100%)",
          color: "white", fontSize: 11, fontWeight: 900,
        }}>?</span>
      </div>

      {/* Style grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" }}>
        {STYLES.map(s => (
          <div
            key={s.id}
            style={{
              background: s.id === "aggressive"
                ? "linear-gradient(135deg, rgba(239,68,68,0.18), rgba(239,68,68,0.06))"
                : "rgba(255,255,255,0.04)",
              border: s.id === "aggressive"
                ? "1px solid rgba(239,68,68,0.4)"
                : "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              transition: "border-color 0.2s",
            }}
          >
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <span style={{
              color: s.id === "aggressive" ? "#f87171" : "rgba(255,255,255,0.75)",
              fontWeight: s.id === "aggressive" ? 800 : 600,
              fontSize: 14,
            }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
