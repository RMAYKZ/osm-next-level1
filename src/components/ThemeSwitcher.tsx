import { useTheme } from "../contexts/ThemeContext";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
      <button
        onClick={() => setTheme("a")}
        className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-widest transition ${
          theme === "a" ? "bg-amber-400 text-stone-900" : "text-stone-400 hover:text-white"
        }`}
        title="Tema A (Amber)"
        aria-label="Tema A (Amber)"
        aria-pressed={theme === "a"}
      >
        A
      </button>
      <button
        onClick={() => setTheme("b")}
        className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-widest transition ${
          theme === "b" ? "bg-emerald-400 text-stone-900" : "text-stone-400 hover:text-white"
        }`}
        title="Tema B (Yeşil)"
        aria-label="Tema B (Yeşil)"
        aria-pressed={theme === "b"}
      >
        B
      </button>
    </div>
  );
}
