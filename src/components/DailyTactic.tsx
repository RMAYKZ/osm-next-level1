import { motion } from "framer-motion";
import { getLocalizedDailyTactic } from "../data/extras";
import { useLang } from "../contexts/LanguageContext";

const ease = [0.16, 1, 0.3, 1] as const;

export default function DailyTactic() {
  const { t } = useLang();
  const tactic = getLocalizedDailyTactic(t);

  return (
    <section id="gunun-taktigi" className="relative overflow-hidden py-16 md:py-20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease }}
          className="opus-glass overflow-hidden rounded-[2rem] md:rounded-[2.5rem]"
        >
          <div className="h-1 bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400" />

          <div className="grid gap-6 p-5 md:grid-cols-[1fr_auto] md:items-center md:gap-10 md:p-8">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, ease }}
                  className="badge-pro"
                >
                  📅 {t("daily.badge")}
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.06, ease }}
                  className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-200"
                >
                  {tactic.dayName}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.12, ease }}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-stone-400"
                >
                  {tactic.scenario}
                </motion.span>
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.1, ease }}
                className="font-display text-3xl font-black text-white md:text-5xl"
              >
                {tactic.title}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.18, ease }}
                className="mt-4 flex flex-wrap items-center gap-3"
              >
                <span className="rounded-xl bg-amber-400/15 border border-amber-300/30 px-4 py-2 font-display text-xl font-black text-amber-200">
                  {tactic.formation}
                </span>
                <span className="text-sm font-bold text-stone-400">{tactic.style}</span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.24, ease }}
                className="mt-5 max-w-2xl text-sm leading-7 text-stone-300"
              >
                💡 {tactic.tip}
              </motion.p>

              <motion.a
                href="#anti-taktik"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3, ease }}
                whileHover={{ x: 4, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.96 }}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-amber-100 transition-colors duration-200 hover:bg-amber-300/20"
              >
                {t("daily.openEngine")}
              </motion.a>
            </div>

            <div className="grid grid-cols-3 gap-3 md:w-56 md:grid-cols-1">
              <ValueCard label={t("anti.pressure")} value={tactic.pressure} color="#f87171" index={0} />
              <ValueCard label={t("anti.style")} value={tactic.styleValue} color="#fbbf24" index={1} />
              <ValueCard label={t("anti.tempo")} value={tactic.tempo} color="#60a5fa" index={2} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ValueCard({ label, value, color, index }: { label: string; value: number; color: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center"
    >
      <div className="text-[10px] font-black uppercase tracking-widest text-stone-500">{label}</div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: index * 0.08 + 0.1 }}
        className="mt-1 font-display text-3xl font-black"
        style={{ color }}
      >
        {value}
      </motion.div>
      <div className="mx-auto mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 + 0.15 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </motion.div>
  );
}
