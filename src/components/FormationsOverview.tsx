import { motion } from "framer-motion";
import { antiTactics, opponentTactics } from "../data/tactics";
import { useLang } from "../contexts/LanguageContext";

const EASE = [0.16, 1, 0.3, 1] as const;

const GLASS: React.CSSProperties = {
  background: "rgba(9,11,33,0.88)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 20,
};

export default function FormationsOverview() {
  const { t } = useLang();

  const rows = opponentTactics.map((ot) => {
    const counters = antiTactics.filter((a) => a.opponentId === ot.id);
    return {
      tactic: ot,
      homeCount: counters.filter((c) => c.location === "home").length,
      awayCount: counters.filter((c) => c.location === "away").length,
      total: counters.length,
    };
  });

  const totalAnti = antiTactics.length;
  const totalOpp = opponentTactics.length;

  return (
    <section id="formasyonlar" style={{ position: "relative", padding: "clamp(48px,7vw,96px) 0", overflow: "hidden" }}>

      {/* ambient */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div style={{
          position: "absolute", bottom: "10%", left: 0,
          width: "35%", height: "45%", borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(52,211,153,0.07) 0%, transparent 70%)",
          filter: "blur(80px)",
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.35), transparent)",
        }} />
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ marginBottom: 36, textAlign: "center" }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)",
            borderRadius: 999, padding: "5px 14px", marginBottom: 14,
          }}>
            <span style={{ fontSize: 12 }}>📋</span>
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#34d399" }}>
              Formation Database
            </span>
          </div>

          <h2 style={{
            margin: "0 0 10px",
            fontSize: "clamp(1.6rem, 4vw, 3rem)",
            fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em",
          }}>
            <span style={{ color: "#e2e8f0" }}>{t("form.title1")} </span>
            <span style={{ color: "#f59e0b" }}>{t("form.title2")}</span>
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(148,163,184,0.65)", lineHeight: 1.6 }}>
            {t("form.desc")}
          </p>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          style={{ ...GLASS, overflow: "hidden" }}
        >
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr style={{ background: "linear-gradient(90deg, rgba(239,68,68,0.1), rgba(239,68,68,0.04))", borderBottom: "1px solid rgba(239,68,68,0.15)" }}>
                  {[
                    { label: t("form.tactic"),     align: "left"   as const },
                    { label: t("form.formation"),   align: "left"   as const },
                    { label: t("form.style"),       align: "left"   as const },
                    { label: `🏠 ${t("anti.home")}`, align: "center" as const },
                    { label: `✈️ ${t("anti.away")}`, align: "center" as const },
                    { label: t("form.antiCount"),   align: "center" as const },
                  ].map((col, i) => (
                    <th
                      key={i}
                      style={{
                        textAlign: col.align, padding: "14px 18px",
                        fontSize: 10, fontWeight: 900, textTransform: "uppercase",
                        letterSpacing: "0.14em", color: "rgba(239,68,68,0.7)",
                        whiteSpace: "nowrap",
                      }}
                    >{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <motion.tr
                    key={r.tactic.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: Math.min(i, 9) * 0.04 }}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "13px 18px" }}>
                      <a
                        href={`/formations/${r.tactic.id.toLowerCase()}/`}
                        style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
                        title={`OSM ${r.tactic.formation} counter tactic guide`}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
                        }}>
                          {r.tactic.emoji}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{r.tactic.name}</span>
                      </a>
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      <span style={{ fontSize: 13, fontFamily: "monospace", color: "#22d3ee", fontWeight: 700, letterSpacing: "0.04em" }}>
                        {r.tactic.formation}
                      </span>
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      <span style={{
                        display: "inline-block",
                        fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
                        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: 6, padding: "3px 8px", color: "rgba(148,163,184,0.75)",
                      }}>
                        {r.tactic.style}
                      </span>
                    </td>
                    <td style={{ padding: "13px 18px", textAlign: "center" }}>
                      <span style={{ fontSize: 16, fontWeight: 900, color: "#34d399" }}>{r.homeCount}</span>
                    </td>
                    <td style={{ padding: "13px 18px", textAlign: "center" }}>
                      <span style={{ fontSize: 16, fontWeight: 900, color: "#60a5fa" }}>{r.awayCount}</span>
                    </td>
                    <td style={{ padding: "13px 18px", textAlign: "center" }}>
                      <div style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 32, height: 32, borderRadius: "50%",
                        background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.22)",
                        fontSize: 15, fontWeight: 900, color: "#f87171",
                      }}>
                        {r.total}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{
            padding: "12px 18px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            display: "flex", justifyContent: "center",
            fontSize: 11, color: "rgba(100,116,139,0.65)", letterSpacing: "0.06em",
          }}>
            {t("form.total")}: <strong style={{ color: "rgba(148,163,184,0.5)", margin: "0 4px" }}>{totalOpp}</strong> {t("form.tactic")} &nbsp;·&nbsp;
            <strong style={{ color: "rgba(148,163,184,0.5)", margin: "0 4px" }}>{totalAnti}</strong> {t("form.antiCount")}
          </div>
        </motion.div>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <a href="/formations/" style={{ fontSize: 12, fontWeight: 700, color: "#34d399", letterSpacing: "0.04em" }}>
            {t("form.viewAllGuides")} →
          </a>
        </div>
      </div>
    </section>
  );
}
