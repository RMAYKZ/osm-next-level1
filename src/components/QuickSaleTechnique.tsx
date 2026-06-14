import { useMemo, useState } from "react";
import { useLang } from "../contexts/LanguageContext";

type AgeGroup = "young" | "prime" | "senior";
type SaleMode = "best" | "fast" | "test";

const ageGroups: Record<AgeGroup, { labelKey: string; range: string; multiplier: number; noteKey: string }> = {
  young: { labelKey: "quick.young", range: "17-22", multiplier: 2.5, noteKey: "quick.youngNote" },
  prime: { labelKey: "quick.prime", range: "23-28", multiplier: 2.1, noteKey: "quick.primeNote" },
  senior: { labelKey: "quick.senior", range: "29+", multiplier: 1.5, noteKey: "quick.seniorNote" },
};

const saleModes: Record<SaleMode, { labelKey: string; multiplier?: number; descriptionKey: string }> = {
  best: { labelKey: "quick.best", descriptionKey: "quick.bestDesc" },
  fast: { labelKey: "quick.fast", multiplier: 1.2, descriptionKey: "quick.fastDesc" },
  test: { labelKey: "quick.test", multiplier: 1.1, descriptionKey: "quick.testDesc" },
};

const parseMillionValue = (value: string) => {
  const normalized = value
    .toLowerCase()
    .replace(/m/g, "")
    .replace(/,/g, ".")
    .replace(/[^0-9.]/g, "");

  return Number(normalized || 0);
};

const formatMillion = (value: number) => `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Math.max(0, Math.round(value)))} M`;

export default function QuickSaleTechnique() {
  const { t, lang } = useLang();
  const [playerName, setPlayerName] = useState("Wonderkid MC");
  const [marketValue, setMarketValue] = useState("15 M");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("young");
  const [saleMode, setSaleMode] = useState<SaleMode>("best");

  const numericValue = useMemo(() => parseMillionValue(marketValue), [marketValue]);
  const activeMultiplier = saleModes[saleMode].multiplier ?? ageGroups[ageGroup].multiplier;
  const recommendedPrice = numericValue * activeMultiplier;

  return (
    <section id="hizli-satis" className="relative overflow-hidden py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="badge-pro mb-5">{t("quick.badge")}</div>
            <h2 className="section-title text-3xl leading-none text-cream md:text-5xl lg:text-7xl">
              {t("quick.titleA")} <span className="text-gold">{t("quick.titleB")}</span>
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-stone-400">
            {t("quick.desc")}
          </p>
        </div>

        <div className="opus-glass grid gap-6 rounded-[2rem] p-5 md:p-7 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 md:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-stone-500">{t("quick.player")}</span>
                <input value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-4 text-white outline-none transition focus:border-amber-300/60" />
              </label>
              <label>
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-stone-500">{t("quick.value")}</span>
                <input value={marketValue} onChange={(e) => setMarketValue(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-4 text-white outline-none transition focus:border-amber-300/60" placeholder="15 M" />
              </label>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {(Object.keys(ageGroups) as AgeGroup[]).map((key) => (
                <button key={key} onClick={() => { setAgeGroup(key); setSaleMode("best"); }} className={`rounded-2xl border p-4 text-left transition ${ageGroup === key ? "border-amber-300/60 bg-amber-300/10" : "border-white/10 bg-white/[0.035] hover:border-white/25"}`}>
                  <div className="font-display text-xl font-black text-white">{ageGroups[key].range}</div>
                  <div className="mt-1 text-xs text-stone-400">{t(ageGroups[key].labelKey)}</div>
                  <div className="mt-3 text-sm font-black text-amber-200">{ageGroups[key].multiplier.toFixed(1)}x</div>
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {(Object.keys(saleModes) as SaleMode[]).map((key) => (
                <button key={key} onClick={() => setSaleMode(key)} className={`rounded-2xl border p-4 text-left transition ${saleMode === key ? "border-emerald-300/50 bg-emerald-300/10" : "border-white/10 bg-white/[0.035] hover:border-white/25"}`}>
                  <div className="font-bold text-white">{t(saleModes[key].labelKey)}</div>
                  <p className="mt-2 text-xs leading-5 text-stone-500">{t(saleModes[key].descriptionKey)}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-amber-300/18 bg-gradient-to-br from-amber-300/10 to-transparent p-6">
            <div className="opus-kicker">{t("quick.recommended")}</div>
            <div className="mt-4 font-display text-3xl font-black tracking-tight text-cream md:text-5xl lg:text-6xl">{formatMillion(recommendedPrice)}</div>
            <p className="mt-4 text-sm leading-7 text-stone-300">
              <span className="font-bold text-amber-100">{playerName || (lang === "tr" ? "Oyuncu" : "Player")}</span> {t("quick.forPlayer")} {activeMultiplier.toFixed(2)}x {t("quick.withMultiplier")}
            </p>
            <div className="mt-6 grid gap-3">
              <MiniFact label={t("quick.marketValue")} value={formatMillion(numericValue)} />
              <MiniFact label={t("quick.cashLevel")} value={formatMillion(numericValue * 1.2)} />
              <MiniFact label={t("quick.testRange")} value={`${formatMillion(numericValue * 1.05)} - ${formatMillion(numericValue * 1.1)}`} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-[10px] font-black uppercase tracking-widest text-stone-500">{label}</div>
      <div className="mt-1 font-display text-xl font-black text-white">{value}</div>
    </div>
  );
}