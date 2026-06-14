import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { antiTactics, opponentTactics, type Location, type Strength } from "../data/tactics";
import { useLang } from "../contexts/LanguageContext";

const parseM = (value: string) =>
  Number(value.toLowerCase().replace(/m/g, "").replace(/,/g, ".").replace(/[^0-9.]/g, "") || 0);

function localizeFormationName(name: string, t: (k: string) => string): string {
  return name
    .replace("Counter Attack", t("style.counterAttack"))
    .replace("Wing Play", t("style.wingPlay"))
    .replace("Shoot on Sight", t("style.shootOnSight"))
    .replace("Passing Game", t("style.passingGame"))
    .replace("Defensive", t("style.defensive"))
    .replace("Park the Bus", t("style.bus"));
}

const ease = [0.16, 1, 0.3, 1] as const;

export default function SquadAnalyzer() {
  const { t } = useLang();
  const [myValue, setMyValue] = useState("15 M");
  const [oppValue, setOppValue] = useState("15 M");
  const [location, setLocation] = useState<Location>("home");
  const [opponentId, setOpponentId] = useState<string>("433A");

  const strength: Strength = useMemo(() => {
    const me = parseM(myValue);
    const opp = parseM(oppValue);
    if (opp === 0) return "equal";
    const ratio = me / opp;
    if (ratio >= 1.15) return "stronger";
    if (ratio <= 0.87) return "weaker";
    return "equal";
  }, [myValue, oppValue]);

  const result = useMemo(
    () =>
      antiTactics.find(
        (item) => item.opponentId === opponentId && item.location === location && item.strength === strength
      ) || null,
    [opponentId, location, strength]
  );

  const strengthLabel =
    strength === "stronger" ? t("squad.stronger") : strength === "weaker" ? t("squad.weaker") : t("squad.equal");
  const strengthColor = strength === "stronger" ? "#4ade80" : strength === "weaker" ? "#f87171" : "#fbbf24";
  const resultKey = result ? `${result.opponentId}-${result.location}-${result.strength}` : "empty";

  return (
    <section id="kadro-analiz" className="relative overflow-hidden py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/35 to-transparent" />
      <div className="mobile-hide-glow absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-emerald-500/8 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mb-10"
        >
          <div className="badge-pro mb-5">{t("squad.badge")}</div>
          <h2 className="section-title text-3xl leading-none text-cream md:text-5xl lg:text-7xl">
            {t("squad.title1")} <span className="text-gold">{t("squad.title2")}</span>
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-400">{t("squad.desc")}</p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          {/* ── Left input panel ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
            className="opus-glass rounded-[2rem] p-6"
          >
            <div className="grid gap-4">
              <label>
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-stone-500">
                  {t("squad.myValue")}
                </span>
                <input
                  value={myValue}
                  onChange={(e) => setMyValue(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-4 text-white outline-none transition-colors duration-200 focus:border-amber-300/60"
                  placeholder="15 M"
                />
              </label>
              <label>
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-stone-500">
                  {t("squad.oppValue")}
                </span>
                <input
                  value={oppValue}
                  onChange={(e) => setOppValue(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-4 text-white outline-none transition-colors duration-200 focus:border-amber-300/60"
                  placeholder="15 M"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                {(["home", "away"] as Location[]).map((loc) => (
                  <motion.button
                    key={loc}
                    onClick={() => setLocation(loc)}
                    whileHover={{ scale: 1.04, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.94 }}
                    className={`rounded-2xl border px-4 py-3 text-sm font-black uppercase tracking-widest transition-all duration-200 ${
                      location === loc
                        ? "border-amber-300/60 bg-amber-300/12 text-amber-50 shadow-[0_0_18px_rgba(251,191,36,0.15)]"
                        : "border-white/10 bg-white/[0.035] text-stone-500"
                    }`}
                  >
                    {loc === "home" ? t("anti.home") : t("anti.away")}
                  </motion.button>
                ))}
              </div>

              <label>
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-stone-500">
                  {t("squad.oppTactic")}
                </span>
                <select
                  value={opponentId}
                  onChange={(e) => setOpponentId(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-4 text-white outline-none transition-colors duration-200 focus:border-amber-300/60"
                >
                  {opponentTactics.map((ot) => (
                    <option key={ot.id} value={ot.id} className="bg-stone-950">
                      {t(`ot.${ot.id}.name`)}
                    </option>
                  ))}
                </select>
              </label>

              {/* Strength indicator */}
              <motion.div
                animate={{
                  borderColor: `${strengthColor}44`,
                  boxShadow: `0 0 24px -4px ${strengthColor}22`,
                }}
                transition={{ duration: 0.45 }}
                className="rounded-2xl border bg-black/20 p-4 text-center"
              >
                <div className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                  {t("squad.strength")}
                </div>
                <motion.div
                  animate={{ color: strengthColor }}
                  transition={{ duration: 0.35 }}
                  className="mt-2 font-display text-2xl font-black"
                >
                  {strengthLabel}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* ── Right result panel ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.18, ease }}
            className="opus-glass rounded-[2rem] p-6 md:p-8"
          >
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key={resultKey}
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.38, ease }}
                >
                  <div className="opus-kicker">{t("squad.recommended")}</div>
                  <h3 className="mt-2 font-display text-3xl font-black text-white md:text-5xl">
                    {localizeFormationName(result.recommendedFormation, t)}
                  </h3>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <Stat label={t("anti.pressure")} value={result.pressure} color="#f87171" index={0} />
                    <Stat label={t("anti.style")} value={result.style} color="#fbbf24" index={1} />
                    <Stat label={t("anti.tempo")} value={result.tempo} color="#60a5fa" index={2} />
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.38, delay: 0.22 }}
                    className="mt-5 rounded-2xl border border-amber-300/14 bg-amber-300/[0.06] p-5 text-sm leading-7 text-amber-50"
                  >
                    {result.note}
                  </motion.div>
                  <motion.a
                    href="#anti-taktik"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35, delay: 0.3 }}
                    whileHover={{ x: 4, transition: { duration: 0.15 } }}
                    className="mt-5 inline-block text-xs font-black uppercase tracking-widest text-amber-200 transition-colors duration-200 hover:text-white"
                  >
                    {t("squad.openEngine")}
                  </motion.a>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex h-full min-h-[300px] items-center justify-center text-center text-sm text-stone-400"
                >
                  {t("squad.noResult")}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, color, index }: { label: string; value: number; color: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center"
    >
      <div className="text-[10px] font-black uppercase tracking-widest text-stone-500">{label}</div>
      <div className="mt-2 font-display text-3xl font-black" style={{ color }}>
        {value}
      </div>
    </motion.div>
  );
}
