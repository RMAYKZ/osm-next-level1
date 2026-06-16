import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { antiTactics, opponentTactics } from "../data/tactics";
import { useTacticEngine, getWeeklyMetaSliders } from "../utils/tacticEngine";
import { getISOWeekNumberUK } from "../data/extras";
import { useLang } from "../contexts/LanguageContext";
import { setMetaPreference } from "../utils/metaPreference";

// ─── Category helpers ─────────────────────────────────────────────────────────
type PressureCat = "ultra_low" | "low" | "moderate" | "high" | "very_high";
type StyleCat    = "ultra_def" | "defensive" | "balanced" | "attacking" | "full_attack";
type TempoCat    = "slow" | "controlled" | "medium" | "fast" | "sprint";

const pCat = (v: number): PressureCat =>
  v < 16 ? "ultra_low" : v < 30 ? "low" : v < 50 ? "moderate" : v < 65 ? "high" : "very_high";
const sCat = (v: number): StyleCat =>
  v < 12 ? "ultra_def" : v < 25 ? "defensive" : v < 44 ? "balanced" : v < 62 ? "attacking" : "full_attack";
const tCat = (v: number): TempoCat =>
  v < 55 ? "slow" : v < 63 ? "controlled" : v < 72 ? "medium" : v < 80 ? "fast" : "sprint";

const PRESSURE_GRAD: Record<PressureCat, string> = {
  ultra_low: "linear-gradient(90deg,#5b8af7,#9161f5)",
  low:        "linear-gradient(90deg,#5b8af7,#9161f5)",
  moderate:   "linear-gradient(90deg,#10d9a1,#5b8af7)",
  high:       "linear-gradient(90deg,#f5a623,#f43f5e)",
  very_high:  "linear-gradient(90deg,#f43f5e,#9161f5)",
};
const STYLE_GRAD: Record<StyleCat, string> = {
  ultra_def:   "linear-gradient(90deg,#5b8af7,#9161f5)",
  defensive:   "linear-gradient(90deg,#5b8af7,#9161f5)",
  balanced:    "linear-gradient(90deg,#10d9a1,#5b8af7)",
  attacking:   "linear-gradient(90deg,#f5a623,#f43f5e)",
  full_attack: "linear-gradient(90deg,#f43f5e,#9161f5)",
};
const TEMPO_GRAD: Record<TempoCat, string> = {
  slow:       "linear-gradient(90deg,#5b8af7,#9161f5)",
  controlled: "linear-gradient(90deg,#5b8af7,#9161f5)",
  medium:     "linear-gradient(90deg,#10d9a1,#5b8af7)",
  fast:       "linear-gradient(90deg,#f5a623,#f43f5e)",
  sprint:     "linear-gradient(90deg,#f43f5e,#9161f5)",
};

// ─── i18n ─────────────────────────────────────────────────────────────────────
type WMLang = "tr" | "en" | "hu" | "ar" | "pt";

interface WMI18n {
  weekLabel: string; weeklyNote: string; slidersTitle: string; formationLabel: string;
  why: string; scenarioLabel: string;
  pLabels: Record<PressureCat, string>;
  sLabels: Record<StyleCat, string>;
  tLabels: Record<TempoCat, string>;
  pExplain: Record<PressureCat, string>;
  sExplain: Record<StyleCat, string>;
  tExplain: Record<TempoCat, string>;
  scenario: Record<string, string>;
}

const EN: WMI18n = {
  weekLabel: "Active week", weeklyNote: "Auto-updates every Monday · Deterministic engine",
  slidersTitle: "This Week's Slider Values", formationLabel: "Recommended Formation",
  why: "Why These Values?", scenarioLabel: "Scenario Analysis",
  pLabels: { ultra_low: "Ultra Low", low: "Low", moderate: "Moderate", high: "High", very_high: "Very High" },
  sLabels: { ultra_def: "Ultra Def", defensive: "Defensive", balanced: "Balanced", attacking: "Attacking", full_attack: "Full Attack" },
  tLabels: { slow: "Slow", controlled: "Controlled", medium: "Medium", fast: "Fast", sprint: "Sprint" },
  pExplain: {
    ultra_low: "Ultra-low pressure keeps your defensive block completely intact. You are NOT chasing the ball — you're inviting them to come to you and punishing the overcommit on the counter.",
    low: "Low pressure conserves energy and keeps your shape disciplined. Save every sprint for the counter moment — pressing must be a calculated decision, not a reflex.",
    moderate: "Moderate pressure disrupts their rhythm without exposing your backline. You press selectively — in dangerous zones, not all over the pitch. Smart and sustainable.",
    high: "High press forces errors in dangerous areas. With your squad quality, pressing from the front is a tactical weapon. Win the ball high and convert immediately.",
    very_high: "Maximum press suffocates their build-up at source. You are in complete dominance — press relentlessly, recover instantly, and never allow them to settle.",
  },
  sExplain: {
    ultra_def: "Ultra-defensive style — your sole job is to survive. Every player stays behind the ball. The goal is a clean sheet and one clinical counter, not possession.",
    defensive: "Defensive style protects your structure first. You attack exclusively on transitions — fast, direct, and absolutely clinical when the chance arrives.",
    balanced: "Balanced style gives you tactical flexibility. You can absorb pressure and shift to attack when the moment is right. Adaptability is your biggest edge.",
    attacking: "Attacking style keeps you in control of territory and ball. You are dictating — make them react to you, not the other way around. Create and convert.",
    full_attack: "Full attacking style — you want the ball, the space, and total control. Dominate possession and territory without mercy. No defensive hesitation.",
  },
  tExplain: {
    slow: "Slow tempo conserves energy and maintains safe ball circulation. Not for attacking intent — for control, patience, and wearing the opponent down psychologically.",
    controlled: "Controlled tempo lets you build effectively and deliberately. Every pass has a purpose. This tempo wins matches through precision and positioning, not pace.",
    medium: "Medium tempo is the tactical sweet spot. Fast enough to threaten on transitions, controlled enough to maintain structure. Read the game and shift when needed.",
    fast: "Fast tempo creates disorganisation for the opponent. They cannot settle, reset, or organise — your transitions become devastating before they recover shape.",
    sprint: "Sprint tempo is maximum intensity from first to last whistle. You are going all-out — every second counts. High reward, high stamina cost.",
  },
  scenario: {
    home_stronger: "Home and dominant: full throttle from the first whistle. Assert complete control, press high, dominate possession and territory. Your squad demands nothing less.",
    home_equal:    "Home on level terms: leverage the home advantage fully. Press higher than you would away, use the crowd noise, and impose your style from the first whistle.",
    home_weaker:   "Home as underdogs: use the crowd, keep the discipline. A well-organised compact shape at home can neutralise any opponent — then steal with one quality move.",
    away_stronger: "Away but superior: assertive even on the road. Counter-press efficiently, use your quality in transitions, and don't let the away venue hold you back.",
    away_equal:    "Away on level terms: controlled aggression wins here. Stay compact, deny space, and punish every mistake with speed.",
    away_weaker:   "Away as underdogs: your mission is to survive and steal something. Ultra-compact low block, iron discipline, and one clinical counter — that's your entire game plan.",
  },
};

const TR: WMI18n = {
  weekLabel: "Aktif hafta", weeklyNote: "Her Pazartesi otomatik güncellenir · Deterministik motor",
  slidersTitle: "Bu Haftanın Slider Değerleri", formationLabel: "Önerilen Formasyon",
  why: "Neden Bu Değerler?", scenarioLabel: "Senaryo Analizi",
  pLabels: { ultra_low: "Ultra Düşük", low: "Düşük", moderate: "Orta", high: "Yüksek", very_high: "Çok Yüksek" },
  sLabels: { ultra_def: "Ultra Defansif", defensive: "Defansif", balanced: "Dengeli", attacking: "Atakçı", full_attack: "Tam Hücum" },
  tLabels: { slow: "Yavaş", controlled: "Kontrollü", medium: "Orta", fast: "Hızlı", sprint: "Sprint" },
  pExplain: {
    ultra_low: "Ultra düşük baskı, defans bloğunu tamamen korur. Topu kovalamıyorsun — rakibi tuzağa çekiyorsun. O öne atıldığı an kontraya geçiyorsun.",
    low: "Düşük baskı, formu kompakt ve disiplinli tutar. Her enerjiyi kontra için sakla — presleme refleks değil, hesaplanmış bir karar olmalı.",
    moderate: "Orta baskı, rakibin ritmini bozmak için seçici presleme yapar. Tehlikeli bölgelerde baskı — sahada her yerde değil. Akıllı ve sürdürülebilir.",
    high: "Yüksek pres, tehlikeli alanlarda hata zorlar. Kadron buna uygunsa önden preslemek taktik silahtır. Yüksek topla, anında dönüştür.",
    very_high: "Maksimum baskı, rakibin inşasını kaynağında boğar. Tam hakimiyettesin — amansızca bas, anında toparla, yerleşmelerine izin verme.",
  },
  sExplain: {
    ultra_def: "Ultra defansif stil — tek görevin hayatta kalmak. Her oyuncu topun arkasında. Amaç gol yememek ve bir klinik kontra.",
    defensive: "Defansif stil yapını önce korur. Sadece geçişlerde atak yap — hızlı, direkt ve fırsat geldiğinde kesinlikle klinik.",
    balanced: "Dengeli stil taktiksel esneklik sağlar. Baskıyı emebilir, an gelince atağa geçebilirsin. Adaptasyon en büyük avantajın.",
    attacking: "Atakçı stil saha ve top kontrolünü elinde tutar. Tempoyu sen belirle — rakip sana tepki versin, sen ona değil.",
    full_attack: "Tam hücum stili — topu, alanı ve total kontrolü istiyorsun. Hâkimiyet ve topraklara acımasızca sahip ol.",
  },
  tExplain: {
    slow: "Yavaş tempo enerji korur ve güvenli top dolaşımı sağlar. Kontrol, sabır ve rakibi psikolojik olarak yormak için.",
    controlled: "Kontrollü tempo etkili ve kasıtlı bir inşa sağlar. Her pas bir amaca hizmet ediyor. Bu tempo hassasiyet ve pozisyonla maç kazanır.",
    medium: "Orta tempo taktiksel altın ortadır. Geçişlerde tehdit oluşturacak kadar hızlı, yapıyı koruyacak kadar kontrollü.",
    fast: "Yüksek tempo rakip için düzensizlik yaratır. Yerleşemezler, sıfırlayamazlar — senin geçişlerin toparlanmadan önce yıkıcı hale gelir.",
    sprint: "Sprint tempo ilk düdükten sonuncuya maksimum yoğunluk. Yüksek ödül, yüksek kondisyon bedeli.",
  },
  scenario: {
    home_stronger: "Evde üstün kadroyla: ilk düdükten tam gaz. Tam kontrolü al, yüksek pres yap, top ve toprak hâkimiyetini kur.",
    home_equal:    "Evde eşit güçle: ev avantajını tam kullan. Deplasmandakinden daha yüksek pres yap, stilini ilk düdükten dayat.",
    home_weaker:   "Evde zayıf kadroyla: tribünü kullan, disiplini koru. İyi organize kompakt bir yapı her rakibi etkisiz kılabilir.",
    away_stronger: "Deplasmanda üstün kadroyla: yolda bile kararlı. Etkili kontra-pres yap, geçişlerde kaliteni kullan.",
    away_equal:    "Deplasmanda eşit güçle: kontrollü agresyon kazanır. Kompakt kal, alanı reddet, her hatayı hızla cezalandır.",
    away_weaker:   "Deplasmanda zayıf kadroyla: görev hayatta kalmak ve bir şeyler çalmak. Ultra kompakt düşük blok, çelik disiplin, tek klinik kontra.",
  },
};

const WM_I18N: Record<WMLang, WMI18n> = {
  tr: TR, en: EN,
  hu: {
    ...EN, weekLabel: "Aktív hét", weeklyNote: "Automatikus frissítés minden hétfőn",
    slidersTitle: "Ezen Hét Csúszkaértékei", formationLabel: "Javasolt Felállás",
    why: "Miért Ezek Az Értékek?", scenarioLabel: "Forgatókönyv Elemzés",
    pLabels: { ultra_low: "Ultra Alacsony", low: "Alacsony", moderate: "Közepes", high: "Magas", very_high: "Nagyon Magas" },
    sLabels: { ultra_def: "Ultra Def.", defensive: "Defenszív", balanced: "Kiegyensúlyozott", attacking: "Támadó", full_attack: "Teljes Roham" },
    tLabels: { slow: "Lassú", controlled: "Kontrollált", medium: "Közepes", fast: "Gyors", sprint: "Sprint" },
  },
  ar: {
    ...EN, weekLabel: "الأسبوع الحالي", weeklyNote: "يتحدث تلقائياً كل اثنين",
    slidersTitle: "إعدادات هذا الأسبوع", formationLabel: "التشكيلة الموصى بها",
    why: "لماذا هذه القيم؟", scenarioLabel: "تحليل السيناريو",
    pLabels: { ultra_low: "منخفض جداً", low: "منخفض", moderate: "متوسط", high: "مرتفع", very_high: "مرتفع جداً" },
    sLabels: { ultra_def: "دفاعي للغاية", defensive: "دفاعي", balanced: "متوازن", attacking: "هجومي", full_attack: "هجوم كامل" },
    tLabels: { slow: "بطيء", controlled: "مضبوط", medium: "متوسط", fast: "سريع", sprint: "سباق" },
    scenario: {
      home_stronger: "في الملعب ومتفوق: بكل قوة من الصافرة الأولى.", home_equal: "في الملعب بقوى متكافئة: استغل ميزة الملعب.",
      home_weaker: "في الملعب كفريق أضعف: استخدم الجماهير وحافظ على الانضباط.",
      away_stronger: "بعيداً لكنك أقوى: حازم حتى في الخارج.", away_equal: "بعيداً بقوى متكافئة: عدوانية مضبوطة.",
      away_weaker: "بعيداً كفريق أضعف: البقاء والسرقة. كتلة منخفضة وارتداد واحد دقيق.",
    },
  },
  pt: {
    ...EN, weekLabel: "Semana ativa", weeklyNote: "Atualiza automaticamente toda segunda-feira",
    slidersTitle: "Sliders Ideais desta Semana", formationLabel: "Formação Recomendada",
    why: "Por que Estes Valores?", scenarioLabel: "Análise do Cenário",
    pLabels: { ultra_low: "Ultra Baixa", low: "Baixa", moderate: "Moderada", high: "Alta", very_high: "Muito Alta" },
    sLabels: { ultra_def: "Ultra Def.", defensive: "Defensivo", balanced: "Equilibrado", attacking: "Atacante", full_attack: "Ataque Total" },
    tLabels: { slow: "Lento", controlled: "Controlado", medium: "Médio", fast: "Rápido", sprint: "Sprint" },
    scenario: {
      home_stronger: "Em casa e dominante: a todo vapor desde o apito inicial.", home_equal: "Em casa em igualdade: use a vantagem de jogar em casa.",
      home_weaker: "Em casa como azarão: use a torcida, mantenha a disciplina.",
      away_stronger: "Fora mas superior: assertivo mesmo longe de casa.", away_equal: "Fora em igualdade: agressividade controlada.",
      away_weaker: "Fora como azarão: sobreviver e roubar algo. Bloco baixo e um contra-ataque clínico.",
    },
  },
};

// ─── Locale-aware week range ──────────────────────────────────────────────────
const LOCALE_MAP: Record<string, string> = { en: "en-GB", tr: "tr-TR", hu: "hu-HU", ar: "ar-SA", pt: "pt-BR" };
const STYLE_KEYS: Record<string, string> = {
  "Counter Attack": "style.counter_attack", "Wing Play": "style.wing_play",
  "Shoot on Sight": "style.shoot_on_sight", "Passing Game": "style.passing_game",
};

function localWeekRange(lang: string, d = new Date()): string {
  const locale = LOCALE_MAP[lang] ?? "en-GB";
  const ukStr = d.toLocaleString("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" });
  const [yr, mo, dy] = ukStr.split("-").map(Number);
  const ukDay = new Date(yr, mo - 1, dy);
  const gap = ukDay.getDay() === 0 ? 6 : ukDay.getDay() - 1;
  const mon = new Date(yr, mo - 1, dy - gap);
  const sun = new Date(yr, mo - 1, dy - gap + 6);
  const fmtMon = new Intl.DateTimeFormat(locale, { month: "short" }).format(mon);
  const fmtSun = new Intl.DateTimeFormat(locale, { month: "short" }).format(sun);
  if (mon.getMonth() === sun.getMonth()) return `${mon.getDate()}–${sun.getDate()} ${fmtMon} ${mon.getFullYear()}`;
  return `${mon.getDate()} ${fmtMon} – ${sun.getDate()} ${fmtSun} ${sun.getFullYear()}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function WMSliderBar({ label, value, gradient, catLabel, delay = 0 }: {
  label: string; value: number; gradient: string; catLabel: string; delay?: number;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
          <span style={{
            fontSize: 10, padding: "2px 7px", borderRadius: 99,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "0.04em",
          }}>{catLabel}</span>
        </div>
        <motion.span
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.5 }}
          style={{ color: "#fff", fontWeight: 800, fontSize: 24, letterSpacing: "-0.02em", lineHeight: 1 }}
        >{value}</motion.span>
      </div>
      <div style={{ height: 10, borderRadius: 99, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay }}
          style={{ height: "100%", borderRadius: 99, background: gradient, position: "relative" }}
        >
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.6, delay: delay + 0.6, ease: "easeInOut" }}
            style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.35) 50%,transparent 100%)",
              pointerEvents: "none",
            }}
          />
        </motion.div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {[0, 25, 50, 75, 99].map(tick => (
          <span key={tick} style={{ fontSize: 9, color: "rgba(255,255,255,0.18)" }}>{tick}</span>
        ))}
      </div>
    </div>
  );
}

function WMLineTacticRow({ label, display, isLast }: {
  label: string; value: string; display: string; isLast?: boolean;
}) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "7px 0", borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.06)",
    }}>
      <span style={{ color: "rgba(255,255,255,0.38)", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.04em" }}>{label}</span>
      <span style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
        color: "rgba(255,255,255,0.85)", padding: "3px 10px", borderRadius: 99,
        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
      }}>{display}</span>
    </div>
  );
}

function WMExplainRow({ icon, title, value, text }: { icon: string; title: string; value?: string; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22 }}
      style={{
        display: "flex", gap: 12, padding: "11px 14px", borderRadius: 12,
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 8,
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>{icon}</span>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 12.5 }}>{title}</span>
          {value && (
            <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 99, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>{value}</span>
          )}
        </div>
        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, lineHeight: 1.65, margin: 0 }}>{text}</p>
      </div>
    </motion.div>
  );
}

// ─── Card style constant ──────────────────────────────────────────────────────
const CARD: React.CSSProperties = {
  background: "rgba(91,138,247,0.04)",
  border: "1px solid rgba(91,138,247,0.14)", borderRadius: 16,
  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function WeeklyMeta() {
  const { t, lang } = useLang();
  const w = WM_I18N[(lang as WMLang) in WM_I18N ? (lang as WMLang) : "en"];
  const { evolve } = useTacticEngine();
  const [showWhy, setShowWhy] = useState(false);

  const [ukWeek, setUkWeek] = useState(() => getISOWeekNumberUK());
  useEffect(() => {
    const id = setInterval(() => setUkWeek(getISOWeekNumberUK()), 60_000);
    return () => clearInterval(id);
  }, []);

  const weekRange = useMemo(() => localWeekRange(lang), [lang]);

  const tacticIdx  = ukWeek % antiTactics.length;
  const baseTactic = antiTactics[tacticIdx];
  const tactic     = useMemo(() => evolve(baseTactic), [baseTactic, evolve]);

  const sliders = useMemo(
    () => getWeeklyMetaSliders(baseTactic.formation, baseTactic.location, baseTactic.strength),
    [baseTactic],
  );

  const P = sliders?.pressure ?? tactic.pressure;
  const S = sliders?.style    ?? tactic.style;
  const T = sliders?.tempo    ?? tactic.tempo;

  const opponent = opponentTactics.find(o => o.id === baseTactic.opponentId);
  const lt = tactic.lineTactics;

  const fmMatch = tactic.recommendedFormation.match(/^(.+?)\s*\((.+)\)$/);
  const fmBase  = fmMatch ? fmMatch[1].trim() : tactic.recommendedFormation;
  const fmStyle = fmMatch ? fmMatch[2] : null;

  const noteKey  = `note.${tacticIdx}`;
  const noteText = t(noteKey) !== noteKey ? t(noteKey) : tactic.note;

  const locationLabel  = baseTactic.location === "home" ? t("anti.home") : t("anti.away");
  const strengthLabel  = baseTactic.strength === "stronger"
    ? t("anti.stronger").split(" ")[0]
    : baseTactic.strength === "equal"
    ? t("anti.equal").split(" ")[0]
    : t("anti.weaker").split(" ")[0];

  const scenarioKey = `${baseTactic.location}_${baseTactic.strength}`;

  function readLine(v: string): string {
    if (v === "attack")   return t("lt.attack");
    if (v === "holdPos")  return t("lt.holdPos");
    if (v === "defHelp")  return t("lt.defHelp");
    if (v === "stayBack") return t("lt.stayBack");
    return v;
  }

  function handleOpenEngine() {
    setMetaPreference({ opponentId: baseTactic.opponentId, location: baseTactic.location, strength: baseTactic.strength });
    document.getElementById("anti-taktik")?.scrollIntoView({ behavior: "smooth" });
  }

  if (!tactic) return null;

  return (
    <section id="haftanin-taktigi" style={{ padding: "80px 20px", maxWidth: 1100, margin: "0 auto", background: "transparent" }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.55 }}
        style={{ textAlign: "center", marginBottom: 44 }}
      >
        <span style={{
          display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
          textTransform: "uppercase", color: "rgba(126,168,255,0.9)",
          padding: "6px 14px", borderRadius: 99,
          background: "rgba(91,138,247,0.08)", border: "1px solid rgba(91,138,247,0.28)",
          marginBottom: 20,
        }}>{t("meta.badge")}</span>

        <h2 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.025em", margin: "0 0 6px" }}>
          <span style={{ color: "#fff" }}>{fmBase}</span>
          {fmStyle && (
            <span style={{ color: "rgba(255,255,255,0.7)" }}>
              {" "}({t(STYLE_KEYS[fmStyle] ?? fmStyle)})
            </span>
          )}
        </h2>

        {/* Context chips */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 8, margin: "16px 0 20px" }}>
          <span style={{ borderRadius: 99, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)", padding: "5px 13px", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
            {t("anti.against")} {opponent?.formation ?? baseTactic.opponentId}
          </span>
          <span style={{ borderRadius: 99, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", padding: "5px 13px", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff" }}>
            {locationLabel}
          </span>
          <span style={{ borderRadius: 99, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)", padding: "5px 13px", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
            {strengthLabel}
          </span>
          <span style={{ borderRadius: 99, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)", padding: "5px 13px", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", color: "rgba(255,255,255,0.7)" }}>
            {weekRange}
          </span>
        </div>

        {/* Live week badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 99, background: "rgba(16,217,161,0.07)", border: "1px solid rgba(16,217,161,0.22)" }}>
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: "#10d9a1", display: "inline-block" }}
          />
          <span style={{ color: "#10d9a1", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>
            {w.weekLabel} · Week {ukWeek}
          </span>
          <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 10 }}>·</span>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: "0.03em" }}>{w.weeklyNote}</span>
        </div>
      </motion.div>

      {/* ── Sliders Card (full width) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.08 }}
        style={{ ...CARD, padding: "26px 24px", marginBottom: 16 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26, flexWrap: "wrap", gap: 8 }}>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: "0.04em" }}>{w.slidersTitle}</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", letterSpacing: "0.04em" }}>{w.weeklyNote}</span>
        </div>
        <WMSliderBar label={t("anti.pressure")} value={P} gradient={PRESSURE_GRAD[pCat(P)]} catLabel={w.pLabels[pCat(P)]} delay={0} />
        <WMSliderBar label={t("anti.style")}    value={S} gradient={STYLE_GRAD[sCat(S)]}    catLabel={w.sLabels[sCat(S)]} delay={0.12} />
        <WMSliderBar label={t("anti.tempo")}    value={T} gradient={TEMPO_GRAD[tCat(T)]}    catLabel={w.tLabels[tCat(T)]} delay={0.24} />
      </motion.div>

      {/* ── Formation + Line Tactics (side by side) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginBottom: 16 }}>

        {/* Formation card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.14 }}
          style={{ ...CARD, padding: "22px 20px" }}
        >
          <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 16 }}>
            {w.formationLabel}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, flexShrink: 0,
            }}>
              {opponent?.emoji ?? "⚽"}
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 22, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                {fmBase}
              </div>
              {fmStyle && (
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 700, marginTop: 3 }}>
                  {t(STYLE_KEYS[fmStyle] ?? fmStyle)}
                </div>
              )}
            </div>
          </div>
          {/* Coach note */}
          <div style={{ padding: "13px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              {t("anti.note")}
            </span>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12.5, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>"{noteText}"</p>
          </div>
        </motion.div>

        {/* Line Tactics card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.2 }}
          style={{ ...CARD, padding: "22px 20px" }}
        >
          <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 16 }}>
            {t("anti.lineTactics")}
          </span>
          <WMLineTacticRow label={t("lt.forwards")} value={lt.forwards} display={readLine(lt.forwards)} />
          <WMLineTacticRow label={t("lt.midfield")} value={lt.midfield} display={readLine(lt.midfield)} />
          <WMLineTacticRow label={t("lt.defence")}  value={lt.defence}  display={readLine(lt.defence)} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0 4px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ color: "rgba(255,255,255,0.38)", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.04em" }}>{t("lt.offsides")}</span>
            <span style={{
              fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.8)",
            }}>{lt.offsides ? t("lt.on") : t("lt.off")}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 7 }}>
            <span style={{ color: "rgba(255,255,255,0.38)", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.04em" }}>{t("lt.marking")}</span>
            <span style={{
              fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)",
            }}>{lt.marking === "area" ? t("lt.area") : t("lt.man")}</span>
          </div>
        </motion.div>
      </div>

      {/* ── Why These Values? (collapsible) ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.22 }}
        style={{ ...CARD, overflow: "hidden", marginBottom: 16 }}
      >
        <button
          onClick={() => setShowWhy(v => !v)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 22px", background: "none", border: "none", cursor: "pointer",
            borderBottom: showWhy ? "1px solid rgba(255,255,255,0.05)" : "none",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🧠</span>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 14.5, letterSpacing: "0.02em" }}>{w.why}</span>
          </div>
          <motion.span
            animate={{ rotate: showWhy ? 180 : 0 }} transition={{ duration: 0.2 }}
            style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, display: "flex" }}
          >▾</motion.span>
        </button>

        <AnimatePresence initial={false}>
          {showWhy && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ padding: "20px 22px" }}>
                {w.scenario[scenarioKey] && (
                  <div style={{
                    padding: "14px 16px", borderRadius: 14, marginBottom: 16,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}>
                    <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>{w.scenarioLabel}</span>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.65, margin: 0, fontWeight: 500 }}>{w.scenario[scenarioKey]}</p>
                  </div>
                )}
                <WMExplainRow icon="⚡" title={`${t("anti.pressure")} · ${P}`} value={w.pLabels[pCat(P)]} text={w.pExplain[pCat(P)]} />
                <WMExplainRow icon="🎯" title={`${t("anti.style")} · ${S}`}    value={w.sLabels[sCat(S)]} text={w.sExplain[sCat(S)]} />
                <WMExplainRow icon="🏃" title={`${t("anti.tempo")} · ${T}`}    value={w.tLabels[tCat(T)]} text={w.tExplain[tCat(T)]} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.28 }}
      >
        <motion.button
          onClick={handleOpenEngine}
          whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: "100%", padding: "17px 24px", borderRadius: 999,
            background: "linear-gradient(135deg,#5b8af7,#9161f5)",
            border: "none", cursor: "pointer",
            color: "#fff", fontWeight: 900, fontSize: 13,
            letterSpacing: "0.1em", textTransform: "uppercase",
            boxShadow: "0 8px 32px rgba(91,138,247,0.38)",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {t("meta.openEngine")} →
        </motion.button>
      </motion.div>

    </section>
  );
}
