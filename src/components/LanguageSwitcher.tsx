import { useLang } from "../contexts/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang, langs, t } = useLang();

  return (
    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
      <span className="text-xs text-gray-400 px-1 hidden md:inline">🌐</span>
      <div className="flex gap-0.5">
        {langs.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            title={l.native}
            aria-label={l.native}
            aria-pressed={lang === l.code}
            className={`px-1.5 py-0.5 rounded text-sm transition-all ${
              lang === l.code
                ? "bg-red-500 text-stone-900 shadow-sm"
                : "text-gray-300 hover:bg-white/10"
            }`}
          >
            <span className="text-xs">{l.flag}</span>
            <span className="ms-0.5 text-[10px] font-semibold uppercase hidden md:inline">
              {l.code}
            </span>
          </button>
        ))}
      </div>
      <span className="sr-only">{t("lang.label")}</span>
    </div>
  );
}