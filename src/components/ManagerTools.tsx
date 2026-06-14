import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getLocalizedRefereeGuides,
  getLocalizedTrainingAdvice,
  getLocalizedMatchChecklist,
  getLocalizedSquadProfiles,
} from "../data/extras";
import { useLang } from "../contexts/LanguageContext";

type Tab = "referee" | "training" | "checklist" | "league" | "transfer";
type TFn = (key: string) => string;

const ease = [0.16, 1, 0.3, 1] as const;

export default function ManagerTools() {
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>("referee");

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "referee", label: t("tools.tab.referee"), icon: "🎯" },
    { id: "training", label: t("tools.tab.training"), icon: "🏕️" },
    { id: "transfer", label: t("tools.tab.transfer"), icon: "🔍" },
    { id: "league", label: t("tools.tab.league"), icon: "🏆" },
    { id: "checklist", label: t("tools.tab.checklist"), icon: "📋" },
  ];

  return (
    <section id="araclar" className="relative overflow-hidden py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/35 to-transparent" />
      <div className="mobile-hide-glow absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-amber-400/6 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mb-10"
        >
          <div className="badge-pro mb-5">{t("tools.badge")}</div>
          <h2 className="section-title text-3xl leading-none text-cream md:text-5xl lg:text-7xl">
            {t("tools.title1")} <span className="text-gold">{t("tools.title2")}</span>
          </h2>
        </motion.div>

        {/* ── Tab row ── */}
        <div className="mb-8 flex flex-wrap gap-2">
          {tabs.map((item, i) => (
            <motion.button
              key={item.id}
              onClick={() => setTab(item.id)}
              whileHover={{ scale: 1.04, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.93 }}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05, ease }}
              className={`relative rounded-full border px-5 py-3 text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                tab === item.id
                  ? "border-amber-300/60 bg-amber-300/12 text-amber-50 shadow-[0_0_20px_rgba(251,191,36,0.18)]"
                  : "border-white/10 bg-white/[0.035] text-stone-400 hover:border-white/25 hover:text-stone-200"
              }`}
            >
              {item.icon} {item.label}
              {tab === item.id && (
                <motion.span
                  layoutId="tab-ring"
                  className="absolute inset-0 rounded-full ring-1 ring-amber-300/40"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* ── Content panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15, ease }}
          className="opus-glass rounded-[2rem] p-6 md:p-8"
        >
          <AnimatePresence mode="wait">
            {tab === "referee" && <RefereeTool key="referee" t={t} />}
            {tab === "training" && <TrainingTool key="training" t={t} />}
            {tab === "transfer" && <TransferTool key="transfer" t={t} />}
            {tab === "league" && <LeagueTool key="league" t={t} />}
            {tab === "checklist" && <ChecklistTool key="checklist" t={t} />}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

function TabPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function RefereeTool({ t }: { t: TFn }) {
  const guides = getLocalizedRefereeGuides(t);
  return (
    <TabPanel>
      <h3 className="mb-2 font-display text-2xl font-black text-white">{t("tools.ref.title")}</h3>
      <p className="mb-6 text-sm text-stone-400">{t("tools.ref.desc")}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {guides.map((ref, i) => (
          <motion.div
            key={ref.color}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-white/10 bg-black/20 p-5"
          >
            <div className="mb-3 flex items-center gap-3">
              <motion.span
                whileHover={{ scale: 1.35, transition: { duration: 0.15 } }}
                className="h-5 w-5 flex-shrink-0 rounded-full"
                style={{ background: ref.hex, boxShadow: `0 0 16px ${ref.hex}` }}
              />
              <div className="font-display text-lg font-black text-white">{ref.color}</div>
              <span className="ms-auto rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-stone-400">
                {ref.level}
              </span>
            </div>
            <p className="text-sm text-stone-300">{ref.meaning}</p>
            <div className="mt-3 rounded-xl border border-amber-300/14 bg-amber-300/[0.06] p-3 text-sm text-amber-50">
              <strong>{t("tools.ref.advice")}</strong> {ref.advice}
            </div>
            <div className="mt-2 text-xs font-black uppercase tracking-widest text-emerald-300">
              {t("tools.ref.tackling")} {ref.tackling}
            </div>
          </motion.div>
        ))}
      </div>
    </TabPanel>
  );
}

function TrainingTool({ t }: { t: TFn }) {
  const advice = getLocalizedTrainingAdvice(t);
  return (
    <TabPanel>
      <h3 className="mb-2 font-display text-2xl font-black text-white">{t("tools.train.title")}</h3>
      <p className="mb-6 text-sm text-stone-400">{t("tools.train.desc")}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {advice.map((item, i) => (
          <motion.div
            key={item.ageGroup}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-white/10 bg-black/20 p-5"
          >
            <div className="flex items-center justify-between">
              <div className="font-display text-lg font-black text-white">{item.ageGroup}</div>
              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[10px] font-black text-amber-100">
                {item.range} {t("tools.train.years")}
              </span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-stone-300">
              <li>🏕️ <span className="text-white">{item.camp}</span></li>
              <li>💪 <span className="text-white">{item.training}</span></li>
              <li>🔒 {item.hidden}</li>
            </ul>
            <p className="mt-3 text-xs italic text-stone-500">{item.note}</p>
          </motion.div>
        ))}
      </div>
    </TabPanel>
  );
}

function TransferTool({ t }: { t: TFn }) {
  const profiles = getLocalizedSquadProfiles(t);
  const [formation, setFormation] = useState(profiles[0].formation);
  const profile = profiles.find((p) => p.formation === formation) || profiles[0];

  return (
    <TabPanel>
      <h3 className="mb-2 font-display text-2xl font-black text-white">{t("tools.transfer.title")}</h3>
      <p className="mb-6 text-sm text-stone-400">{t("tools.transfer.desc")}</p>
      <div className="mb-6 flex flex-wrap gap-2">
        {profiles.map((p, i) => (
          <motion.button
            key={p.formation}
            onClick={() => setFormation(p.formation)}
            whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.94 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            className={`rounded-full border px-4 py-2 text-sm font-black transition-all duration-200 ${
              formation === p.formation
                ? "border-amber-300/60 bg-amber-300/12 text-amber-50 shadow-[0_0_14px_rgba(251,191,36,0.15)]"
                : "border-white/10 bg-white/[0.035] text-stone-400 hover:text-white"
            }`}
          >
            {p.formation}
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={formation}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="grid gap-3 md:grid-cols-2"
        >
          {profile.needs.map((need, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28, delay: index * 0.06 }}
              className="rounded-2xl border border-white/10 bg-black/20 p-4 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5"
            >
              <div className="font-display text-base font-black text-white">{need.position}</div>
              <div className="mt-1 text-sm text-emerald-300">{need.trait}</div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </TabPanel>
  );
}

function LeagueTool({ t }: { t: TFn }) {
  const [totalMatches, setTotalMatches] = useState("30");
  const [played, setPlayed] = useState("10");
  const [points, setPoints] = useState("22");
  const [targetPoints, setTargetPoints] = useState("70");

  const data = useMemo(() => {
    const total = Number(totalMatches) || 0;
    const done = Number(played) || 0;
    const pts = Number(points) || 0;
    const target = Number(targetPoints) || 0;
    const remaining = Math.max(0, total - done);
    const needed = Math.max(0, target - pts);
    const winsNeeded = Math.ceil(needed / 3);
    const possible = remaining * 3;
    const reachable = needed <= possible;
    const perMatch = remaining > 0 ? (needed / remaining).toFixed(2) : "0";
    return { remaining, needed, winsNeeded, reachable, perMatch };
  }, [totalMatches, played, points, targetPoints]);

  return (
    <TabPanel>
      <h3 className="mb-2 font-display text-2xl font-black text-white">{t("tools.league.title")}</h3>
      <p className="mb-6 text-sm text-stone-400">{t("tools.league.desc")}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-3">
          <Field label={t("tools.league.total")} value={totalMatches} onChange={setTotalMatches} />
          <Field label={t("tools.league.played")} value={played} onChange={setPlayed} />
          <Field label={t("tools.league.current")} value={points} onChange={setPoints} />
          <Field label={t("tools.league.target")} value={targetPoints} onChange={setTargetPoints} />
        </div>
        <div className="grid gap-3">
          <Result label={t("tools.league.remaining")} value={String(data.remaining)} />
          <Result label={t("tools.league.needed")} value={String(data.needed)} />
          <Result label={t("tools.league.wins")} value={`~${data.winsNeeded}`} />
          <Result label={t("tools.league.perMatch")} value={`${data.perMatch}`} />
          <motion.div
            animate={{
              borderColor: data.reachable ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)",
              backgroundColor: data.reachable ? "rgba(52,211,153,0.08)" : "rgba(239,68,68,0.08)",
            }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border p-4 text-center font-display text-base font-black"
          >
            <motion.span
              animate={{ color: data.reachable ? "#86efac" : "#fca5a5" }}
              transition={{ duration: 0.4 }}
            >
              {data.reachable ? t("tools.league.reachable") : t("tools.league.hard")}
            </motion.span>
          </motion.div>
        </div>
      </div>
    </TabPanel>
  );
}

function ChecklistTool({ t }: { t: TFn }) {
  const checklist = getLocalizedMatchChecklist(t);
  const [checked, setChecked] = useState<number[]>([]);
  const toggle = (index: number) =>
    setChecked((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  const progress = Math.round((checked.length / checklist.length) * 100);

  return (
    <TabPanel>
      <h3 className="mb-2 font-display text-2xl font-black text-white">{t("tools.checklist.title")}</h3>
      <p className="mb-5 text-sm text-stone-400">{t("tools.checklist.desc")}</p>

      <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-emerald-400"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="mb-5 text-end text-xs font-black tabular-nums text-emerald-300">
        {checked.length} / {checklist.length}
      </div>

      <div className="grid gap-2">
        {checklist.map((item, index) => (
          <motion.button
            key={index}
            onClick={() => toggle(index)}
            whileHover={{ scale: 1.01, transition: { duration: 0.12 } }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: index * 0.03 }}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-start text-sm transition-all duration-200 ${
              checked.includes(index)
                ? "border-emerald-300/40 bg-emerald-300/10 text-white"
                : "border-white/10 bg-black/20 text-stone-300 hover:border-white/20"
            }`}
          >
            <motion.span
              animate={
                checked.includes(index)
                  ? { scale: 1.1, backgroundColor: "rgba(52,211,153,1)", borderColor: "rgba(52,211,153,1)", color: "#022c22" }
                  : { scale: 1, backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.2)", color: "#6b7280" }
              }
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-black"
            >
              {checked.includes(index) ? "✓" : index + 1}
            </motion.span>
            {item}
          </motion.button>
        ))}
      </div>
    </TabPanel>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-stone-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="numeric"
        className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none transition-colors duration-200 focus:border-amber-300/60"
      />
    </label>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5">
      <div className="text-[10px] font-black uppercase tracking-widest text-stone-500">{label}</div>
      <div className="mt-1 font-display text-2xl font-black text-white tabular-nums">{value}</div>
    </div>
  );
}
