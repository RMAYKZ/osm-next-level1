import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDb } from "../lib/firebase";
import { getISOWeekKey } from "../utils/weeklyTactics";
import { useLang } from "../contexts/LanguageContext";

const EASE = [0.16, 1, 0.3, 1] as const;

const GLASS: React.CSSProperties = {
  background: "rgba(9,11,33,0.88)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(99,102,241,0.15)",
  borderRadius: 24,
};

const VOTE_OPTIONS = [
  { id: "451",  label: "4-5-1",   emoji: "🔰", subtitle: "Shoot on Sight" },
  { id: "4231", label: "4-2-3-1", emoji: "🔥", subtitle: "Shoot on Sight" },
  { id: "433",  label: "4-3-3",   emoji: "⚽", subtitle: "Wing Play" },
  { id: "541",  label: "5-4-1",   emoji: "🏰", subtitle: "Counter Attack" },
  { id: "523",  label: "5-2-3",   emoji: "⚡", subtitle: "Counter Attack" },
  { id: "631",  label: "6-3-1",   emoji: "🚌", subtitle: "Park the Bus" },
];

type Tally = Record<string, number>;

export default function MetaVote() {
  const { t } = useLang();
  const weekKey = getISOWeekKey();
  const storageKey = `metaVote_${weekKey}`;

  const [voted, setVoted] = useState<string | null>(() => localStorage.getItem(storageKey));
  const [tally, setTally] = useState<Tally>({});
  const [total, setTotal] = useState(0);
  const [voting, setVoting] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    (async () => {
      const [{ doc, onSnapshot }, db] = await Promise.all([
        import("firebase/firestore"),
        getDb(),
      ]);
      const ref = doc(db, "metaVotes", weekKey);
      unsub = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          const data = snap.data() as { tally?: Tally };
          const t = data.tally ?? {};
          setTally(t);
          setTotal(Object.values(t).reduce((a, b) => a + b, 0));
        }
      });
    })();

    return () => { unsub?.(); };
  }, [weekKey]);

  const handleVote = async (optionId: string) => {
    if (voted || voting) return;
    setVoting(true);
    try {
      const [{ doc, updateDoc, setDoc, increment, getDoc }, db] = await Promise.all([
        import("firebase/firestore"),
        getDb(),
      ]);
      const ref = doc(db, "metaVotes", weekKey);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, { [`tally.${optionId}`]: increment(1) });
      } else {
        const initial: Tally = {};
        VOTE_OPTIONS.forEach((o) => { initial[o.id] = 0; });
        initial[optionId] = 1;
        await setDoc(ref, { tally: initial, weekKey });
      }
      localStorage.setItem(storageKey, optionId);
      setVoted(optionId);
    } catch (err) {
      console.error("MetaVote error:", err);
    } finally {
      setVoting(false);
    }
  };

  const maxVotes = Math.max(...VOTE_OPTIONS.map((o) => tally[o.id] ?? 0), 1);

  return (
    <section style={{ padding: "clamp(40px,6vw,80px) 0", position: "relative", overflow: "hidden" }}>

      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.35), transparent)",
        }} />
        <div style={{
          position: "absolute", top: "20%", left: "-10%",
          width: "40%", height: "60%", borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)",
          filter: "blur(80px)",
        }} />
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ textAlign: "center", marginBottom: 32 }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.28)",
            borderRadius: 999, padding: "5px 14px", marginBottom: 14,
          }}>
            <span style={{ fontSize: 13 }}>🗳️</span>
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#818cf8" }}>
              {t("vote.badge")}
            </span>
            <span style={{
              fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
              background: "rgba(99,102,241,0.2)", borderRadius: 999, padding: "2px 7px", color: "#a5b4fc",
            }}>
              {weekKey}
            </span>
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: "clamp(1.6rem,3.5vw,2.8rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#e2e8f0" }}>
            {t("vote.title")}
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(148,163,184,0.55)" }}>
            {t("vote.subtitle")}
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ ...GLASS, padding: "clamp(20px,4vw,36px)" }}
        >
          {/* Prompt */}
          {!voted && (
            <p style={{ margin: "0 0 20px", textAlign: "center", fontSize: 13, fontWeight: 700, color: "rgba(148,163,184,0.5)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              {t("vote.prompt")}
            </p>
          )}

          {/* Vote grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
            gap: 12,
            marginBottom: 20,
          }}>
            {VOTE_OPTIONS.map((opt, i) => {
              const count = tally[opt.id] ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const isWinner = voted != null && count === maxVotes && total > 0;
              const isMyVote = voted === opt.id;

              return (
                <motion.button
                  key={opt.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.055, ease: EASE }}
                  whileHover={!voted ? { scale: 1.04, y: -3 } : {}}
                  whileTap={!voted ? { scale: 0.96 } : {}}
                  onHoverStart={() => !voted && setHoveredId(opt.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  onClick={() => handleVote(opt.id)}
                  disabled={!!voted || voting}
                  style={{
                    position: "relative", overflow: "hidden",
                    background: isMyVote
                      ? "rgba(99,102,241,0.18)"
                      : hoveredId === opt.id
                        ? "rgba(99,102,241,0.10)"
                        : "rgba(0,0,0,0.28)",
                    border: isWinner && isMyVote
                      ? "1px solid rgba(251,191,36,0.6)"
                      : isWinner
                        ? "1px solid rgba(251,191,36,0.4)"
                        : isMyVote
                          ? "1px solid rgba(99,102,241,0.55)"
                          : hoveredId === opt.id
                            ? "1px solid rgba(99,102,241,0.3)"
                            : "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 16,
                    padding: "18px 14px 14px",
                    cursor: voted ? "default" : voting ? "wait" : "pointer",
                    textAlign: "center",
                    transition: "background 0.2s, border 0.2s",
                  }}
                >
                  {/* winner glow */}
                  {isWinner && (
                    <div style={{
                      position: "absolute", inset: 0, borderRadius: 16, pointerEvents: "none",
                      background: "radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.14) 0%, transparent 70%)",
                    }} />
                  )}

                  <div style={{ fontSize: 30, marginBottom: 6, lineHeight: 1 }}>{opt.emoji}</div>
                  <div style={{
                    fontSize: 17, fontWeight: 900, letterSpacing: "-0.01em",
                    color: isMyVote ? "#a5b4fc" : "#e2e8f0",
                    marginBottom: 2,
                  }}>
                    {opt.label}
                  </div>
                  <div style={{
                    fontSize: 9, fontWeight: 700, color: "rgba(148,163,184,0.45)",
                    textTransform: "uppercase", letterSpacing: "0.1em",
                  }}>
                    {opt.subtitle}
                  </div>

                  {/* Result bar — appears after voting */}
                  <AnimatePresence>
                    {voted && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        style={{ marginTop: 12 }}
                      >
                        <div style={{
                          height: 4, borderRadius: 999,
                          background: "rgba(255,255,255,0.06)", overflow: "hidden",
                          marginBottom: 7,
                        }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.65, delay: 0.2 + i * 0.05, ease: EASE }}
                            style={{
                              height: "100%", borderRadius: 999,
                              background: isWinner
                                ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                                : isMyVote
                                  ? "linear-gradient(90deg, #6366f1, #818cf8)"
                                  : "rgba(99,102,241,0.4)",
                            }}
                          />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{
                            fontSize: 13, fontWeight: 900,
                            color: isWinner ? "#fbbf24" : isMyVote ? "#a5b4fc" : "rgba(148,163,184,0.65)",
                          }}>
                            %{pct}
                          </span>
                          <span style={{ fontSize: 10, color: "rgba(100,116,139,0.5)", fontWeight: 700 }}>
                            {count} {t("vote.votes")}
                          </span>
                        </div>

                        {isWinner && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 }}
                            style={{ marginTop: 5, fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "#f59e0b" }}
                          >
                            👑 {t("vote.leader")}
                          </motion.div>
                        )}
                        {isMyVote && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            style={{ marginTop: isWinner ? 2 : 5, fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#818cf8" }}
                          >
                            ✓ {t("vote.yourVote")}
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center" }}>
            <AnimatePresence mode="wait">
              {!voted ? (
                <motion.p
                  key="before"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ margin: 0, fontSize: 12, color: "rgba(148,163,184,0.35)", fontWeight: 700 }}
                >
                  {total > 0
                    ? `${total.toLocaleString()} ${t("vote.totalSoFar")}`
                    : t("vote.beFirst")}
                </motion.p>
              ) : (
                <motion.p
                  key="after"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{ margin: 0, fontSize: 12, color: "rgba(148,163,184,0.4)", fontWeight: 700 }}
                >
                  {total.toLocaleString()} {t("vote.totalVotes")} · {t("vote.weeklyReset")}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
