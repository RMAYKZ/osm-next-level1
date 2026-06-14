import { motion } from "framer-motion";
import type { OpponentTactic } from "../data/tactics";
import { getSuccessRate } from "../utils/weeklyTactics";

export default function TacticCard({
  tactic,
  active,
  onClick,
  index = 0,
}: {
  tactic: OpponentTactic;
  active: boolean;
  onClick: () => void;
  index?: number;
}) {
  const rate = getSuccessRate(tactic.id);

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0, scale: active ? 1.012 : 1 }}
      transition={{
        opacity: { duration: 0.38, delay: index * 0.038, ease: [0.16, 1, 0.3, 1] },
        x: { duration: 0.38, delay: index * 0.038, ease: [0.16, 1, 0.3, 1] },
        scale: { type: "spring", stiffness: 400, damping: 28 },
      }}
      whileHover={{ scale: active ? 1.018 : 1.014, transition: { duration: 0.18, ease: "easeOut" } }}
      whileTap={{ scale: 0.977, transition: { duration: 0.1 } }}
      className={`group relative flex w-full flex-col overflow-hidden rounded-2xl border p-4 text-left ${
        active
          ? "border-amber-300/60 bg-amber-300/10 shadow-[0_18px_40px_-30px_rgba(251,191,36,0.7)]"
          : "border-white/10 bg-white/[0.035] hover:border-cyan-500/40 hover:bg-white/[0.055] hover:shadow-lg hover:shadow-cyan-500/5"
      }`}
      style={{ transition: "border-color 0.22s, background-color 0.22s, box-shadow 0.3s" }}
    >
      {/* Shimmer sweep on hover */}
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(110deg, transparent 30%, rgba(251,191,36,0.06) 50%, transparent 70%)",
        }}
      />

      {/* Top row: emoji · name · active dot */}
      <div className="flex items-center gap-4">
        <motion.div
          animate={active ? { scale: 1.1, rotate: 4 } : { scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 20 }}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl ${
            active ? "border-amber-200/45 bg-amber-200/12" : "border-white/10 bg-black/20"
          }`}
        >
          {tactic.emoji}
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-base font-black text-white">{tactic.name}</div>
          <div className="mt-1 text-xs font-semibold text-stone-500">
            {tactic.style} · {tactic.formation}
          </div>
        </div>

        <motion.div
          animate={active ? { scale: 1.4, opacity: 1 } : { scale: 1, opacity: 0.38 }}
          transition={{ type: "spring", stiffness: 480, damping: 26 }}
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
            active ? "bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.85)]" : "bg-white/15"
          }`}
        />
      </div>

      {/* Success rate mini-bar */}
      <div className="mt-3 flex items-center gap-2.5">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, #ef4444 0%, #f97316 25%, #facc15 50%, #a3e635 75%, #4ade80 100%)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${rate}%` }}
            transition={{
              duration: 0.85,
              delay: index * 0.038 + 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: index * 0.038 + 0.35 }}
          className={`shrink-0 text-[10px] font-black tabular-nums ${
            active ? "text-amber-300" : "text-stone-500"
          }`}
        >
          {rate}%
        </motion.span>
      </div>
    </motion.button>
  );
}
