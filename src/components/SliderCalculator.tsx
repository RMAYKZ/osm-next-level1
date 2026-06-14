import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";
import { antiTactics, opponentTactics } from "../data/tactics";
import type { Location, Strength } from "../data/tactics";
import { useTacticEngine, getISOWeekNumber } from "../utils/tacticEngine";

// ─────────────────────────────────────────────────────────────────────────────
// Value categorisation helpers
// ─────────────────────────────────────────────────────────────────────────────

type TacklingLevel = "verysoft" | "soft" | "normal" | "hard";
type PressureCat   = "ultra_low" | "low" | "moderate" | "high" | "very_high";
type StyleCat      = "ultra_def" | "defensive" | "balanced" | "attacking" | "full_attack";
type TempoCat      = "slow" | "controlled" | "medium" | "fast" | "sprint";

const pCat = (v: number): PressureCat =>
  v < 16 ? "ultra_low" : v < 30 ? "low" : v < 50 ? "moderate" : v < 65 ? "high" : "very_high";

const sCat = (v: number): StyleCat =>
  v < 12 ? "ultra_def" : v < 25 ? "defensive" : v < 44 ? "balanced" : v < 62 ? "attacking" : "full_attack";

const tCat = (v: number): TempoCat =>
  v < 55 ? "slow" : v < 63 ? "controlled" : v < 72 ? "medium" : v < 80 ? "fast" : "sprint";

function tackling(loc: Location, str: Strength, pressure: number): TacklingLevel {
  if (loc === "away" && str === "weaker") return "soft";
  if (loc === "away" && str === "equal" && pressure <= 30) return "soft";
  if (loc === "away") return "normal";
  if (loc === "home" && pressure >= 62) return "hard";
  return "normal";
}

// Slider gradient by category
const PRESSURE_GRAD: Record<PressureCat, string> = {
  ultra_low: "linear-gradient(90deg,#3b82f6,#6366f1)",
  low:        "linear-gradient(90deg,#6366f1,#8b5cf6)",
  moderate:   "linear-gradient(90deg,#f59e0b,#f97316)",
  high:       "linear-gradient(90deg,#f97316,#ef4444)",
  very_high:  "linear-gradient(90deg,#ef4444,#dc2626)",
};
const STYLE_GRAD: Record<StyleCat, string> = {
  ultra_def:  "linear-gradient(90deg,#3b82f6,#6366f1)",
  defensive:  "linear-gradient(90deg,#6366f1,#8b5cf6)",
  balanced:   "linear-gradient(90deg,#8b5cf6,#a78bfa)",
  attacking:  "linear-gradient(90deg,#f59e0b,#f97316)",
  full_attack:"linear-gradient(90deg,#f97316,#ef4444)",
};
const TEMPO_GRAD: Record<TempoCat, string> = {
  slow:       "linear-gradient(90deg,#14b8a6,#22d3ee)",
  controlled: "linear-gradient(90deg,#22d3ee,#38bdf8)",
  medium:     "linear-gradient(90deg,#f59e0b,#fbbf24)",
  fast:       "linear-gradient(90deg,#f97316,#ef4444)",
  sprint:     "linear-gradient(90deg,#ef4444,#dc2626)",
};

const TACKLING_COLORS: Record<TacklingLevel, string> = {
  verysoft: "#3b82f6",
  soft:     "#22c55e",
  normal:   "#f59e0b",
  hard:     "#ef4444",
};

// Week label
function weekLabel(): string {
  const now = new Date();
  const day = now.getUTCDay() || 7;
  const mon = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - day + 1));
  const sun = new Date(mon); sun.setUTCDate(mon.getUTCDate() + 6);
  const MN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${mon.getUTCDate()} ${MN[mon.getUTCMonth()]} – ${sun.getUTCDate()} ${MN[sun.getUTCMonth()]} ${sun.getUTCFullYear()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// i18n
// ─────────────────────────────────────────────────────────────────────────────

type SL = "tr" | "en" | "hu" | "ar" | "pt";

interface SLang {
  badge: string; title1: string; title2: string; desc: string;
  step1: string; step2: string; step3: string;
  home: string; away: string;
  stronger: string; equal: string; weaker: string;
  result: string;
  pressure: string; style: string; tempo: string; tackling: string;
  marking: string; offside: string; on: string; off: string;
  area: string; man: string;
  tacklingLevels: Record<TacklingLevel, string>;
  pLabels: Record<PressureCat, string>;
  sLabels: Record<StyleCat, string>;
  tLabels: Record<TempoCat, string>;
  why: string; coachNote: string; scenarioLabel: string;
  formation: string; lineTactics: string;
  selectHint: string; weeklyNote: string; weekLabel: string;
  lt: Record<string, string>;
  noMatch: string; altLabel: string;
  pExplain: Record<PressureCat, string>;
  sExplain: Record<StyleCat, string>;
  tExplain: Record<TempoCat, string>;
  tacklingExplain: Record<TacklingLevel, string>;
  scenario: Record<string, string>;
}

const EN: SLang = {
  badge: "Advanced Slider Calculator", title1: "Slider", title2: "Calculator",
  desc: "Select your match scenario — the deterministic tactic engine calculates this week's exact slider values from real match data. Auto-updates every Monday at 00:00 UTC.",
  step1: "Match Venue", step2: "Opponent Formation", step3: "Squad Strength",
  home: "Home", away: "Away",
  stronger: "Stronger", equal: "Equal", weaker: "Weaker",
  result: "This Week's Optimal Slider Values",
  pressure: "Pressure", style: "Style", tempo: "Tempo", tackling: "Tackling",
  marking: "Marking", offside: "Offside Trap", on: "ON", off: "OFF",
  area: "Area", man: "Man",
  tacklingLevels: { verysoft: "Very Soft", soft: "Soft", normal: "Normal", hard: "Hard" },
  pLabels: { ultra_low: "Ultra Low", low: "Low", moderate: "Moderate", high: "High", very_high: "Very High" },
  sLabels: { ultra_def: "Ultra Def", defensive: "Defensive", balanced: "Balanced", attacking: "Attacking", full_attack: "Full Attack" },
  tLabels: { slow: "Slow", controlled: "Controlled", medium: "Medium", fast: "Fast", sprint: "Sprint" },
  why: "Why These Values?", coachNote: "Coach's Note", scenarioLabel: "Scenario Analysis",
  formation: "Recommended Formation", lineTactics: "Line Tactics",
  selectHint: "Complete all 3 steps above — the engine will instantly calculate this week's precise values.",
  weeklyNote: "Auto-updates every Monday · Deterministic engine · Same for all users globally",
  weekLabel: "Active week",
  lt: { attack: "Attack", holdPos: "Hold Pos", defHelp: "Def. Help", stayBack: "Stay Back", forwards: "Forwards", midfield: "Midfield", defence: "Defence" },
  noMatch: "No exact tactic found for this combination. Try adjusting the scenario.",
  altLabel: "Alternative",
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
    medium: "Medium tempo is the tactical sweet spot. Fast enough to threaten on transitions, controlled enough to maintain structure. Read the game and shift tempo when needed.",
    fast: "Fast tempo creates disorganisation for the opponent. They cannot settle, reset, or organise — your transitions become devastating before they recover shape.",
    sprint: "Sprint tempo is maximum intensity from first to last whistle. You are going all-out — every second counts. High reward, high stamina cost. Use it when you dominate.",
  },
  tacklingExplain: {
    verysoft: "Very soft tackling minimises card risk in this sensitive scenario. Let the defensive structure do the work — stay on your feet and force errors through positioning.",
    soft: "Soft tackling keeps you out of disciplinary trouble. Trust the shape, not the challenge. Pick your moments carefully and avoid unnecessary yellow cards.",
    normal: "Normal tackling is the balanced standard — commit when the duel is winnable, hold back when the risk is too high. Read each situation individually.",
    hard: "Hard tackling signals physical dominance and aggression. You are setting the tone — but this is only viable with a lenient referee. Check the ref colour before committing.",
  },
  scenario: {
    away_weaker:   "Away as underdogs: your mission is to survive and steal something. Ultra-compact low block, iron discipline, and one clinical counter — that's your entire game plan.",
    away_equal:    "Away on level terms: controlled aggression wins here. You don't need to dominate — stay compact, deny space, and punish every mistake with speed.",
    away_stronger: "Away but superior: assertive even on the road. Counter-press efficiently, use your quality in transitions, and don't let the away venue hold you back.",
    home_weaker:   "Home as underdogs: use the crowd, keep the discipline. A well-organised compact shape at home can neutralise any opponent — then steal with one quality move.",
    home_equal:    "Home on level terms: leverage the home advantage fully. Press higher than you would away, use the crowd noise, and impose your style from the first whistle.",
    home_stronger: "Home and dominant: full throttle from the first whistle. Assert complete control, press high, dominate possession and territory. Your squad demands nothing less.",
  },
};

const TR: SLang = {
  badge: "Gelişmiş Slider Hesaplayıcı", title1: "Slider", title2: "Hesaplayıcı",
  desc: "Maç senaryonu seç — deterministik taktik motoru bu haftanın kesin slider değerlerini gerçek maç verisinden hesaplar. Her Pazartesi 00:00 UTC'de otomatik güncellenir.",
  step1: "Maç Sahası", step2: "Rakip Formasyon", step3: "Kadro Gücü",
  home: "Ev", away: "Deplasman",
  stronger: "Güçlüsün", equal: "Eşitsin", weaker: "Zayıfsın",
  result: "Bu Haftanın Optimal Slider Değerleri",
  pressure: "Baskı", style: "Stil", tempo: "Tempo", tackling: "Sertlik",
  marking: "Markaj", offside: "Ofsayt Tuzağı", on: "AÇIK", off: "KAPALI",
  area: "Bölge", man: "Adam",
  tacklingLevels: { verysoft: "Çok Yumuşak", soft: "Yumuşak", normal: "Normal", hard: "Sert" },
  pLabels: { ultra_low: "Ultra Düşük", low: "Düşük", moderate: "Orta", high: "Yüksek", very_high: "Çok Yüksek" },
  sLabels: { ultra_def: "Ultra Defansif", defensive: "Defansif", balanced: "Dengeli", attacking: "Atakçı", full_attack: "Tam Hücum" },
  tLabels: { slow: "Yavaş", controlled: "Kontrollü", medium: "Orta", fast: "Hızlı", sprint: "Sprint" },
  why: "Neden Bu Değerler?", coachNote: "Antrenör Notu", scenarioLabel: "Senaryo Analizi",
  formation: "Önerilen Formasyon", lineTactics: "Çizgi Taktikler",
  selectHint: "Yukarıdaki 3 adımı tamamla — motor bu haftanın kesin değerlerini anında hesaplar.",
  weeklyNote: "Her Pazartesi otomatik güncellenir · Deterministik motor · Tüm kullanıcılar için aynı değerler",
  weekLabel: "Aktif hafta",
  lt: { attack: "Hücum", holdPos: "Pozisyon Koru", defHelp: "Defansa Yardım", stayBack: "Geride Kal", forwards: "Forvetler", midfield: "Orta Saha", defence: "Defans" },
  noMatch: "Bu kombinasyon için hazır taktik bulunamadı. Farklı bir senaryo dene.",
  altLabel: "Alternatif",
  pExplain: {
    ultra_low: "Ultra düşük baskı, defans bloğunu tamamen korur. Topu kovalamıyorsun — rakibi tuzağa çekiyorsun. O öne atıldığı an kontraya geçiyorsun.",
    low: "Düşük baskı, formu kompakt ve disiplinli tutar. Her enerjiyi kontra için sakla — presleme refleks değil, hesaplanmış bir karar olmalı.",
    moderate: "Orta baskı, rakibin ritmini bozmak için seçici presleme yapar. Sahada her yerde değil, tehlikeli bölgelerde baskı — akıllı ve sürdürülebilir.",
    high: "Yüksek pres, tehlikeli alanlarda hata zorlar. Kadron buna uygunsa önden preslemek risk değil, taktik silahtır. Yüksek topla, anında dönüştür.",
    very_high: "Maksimum baskı, rakibin inşasını kaynağında boğar. Tam hakimiyettesin — amansızca bas, anında toparla, yerleşmelerine izin verme.",
  },
  sExplain: {
    ultra_def: "Ultra defansif stil — tek görevin hayatta kalmak. Her oyuncu topun arkasında. Amaç gol yememek ve bir klinik kontra — top tutmak değil.",
    defensive: "Defansif stil yapını önce korur. Sadece geçişlerde atak yap — hızlı, direkt ve fırsat geldiğinde kesinlikle klinik.",
    balanced: "Dengeli stil taktiksel esneklik sağlar. Baskıyı emebilir, an gelince atağa geçebilirsin. Adaptasyon en büyük avantajın.",
    attacking: "Atakçı stil saha ve top kontrolünü elinde tutar. Tempoyu sen belirle — rakip sana tepki versin, sen ona değil.",
    full_attack: "Tam hücum stili — topu, alanı ve total kontrolü istiyorsun. Hâkimiyet ve topraklara acımasızca sahip ol. Defansif tereddüt yok.",
  },
  tExplain: {
    slow: "Yavaş tempo enerji korur ve güvenli top dolaşımı sağlar. Hücum için değil — kontrol, sabır ve rakibi psikolojik olarak yormak için.",
    controlled: "Kontrollü tempo etkili ve kasıtlı bir inşa sağlar. Her pas bir amaca hizmet ediyor. Bu tempo hassasiyet ve pozisyonla maç kazanır, hızla değil.",
    medium: "Orta tempo taktiksel altın ortadır. Geçişlerde tehdit oluşturacak kadar hızlı, yapıyı koruyacak kadar kontrollü. Oyunu oku, gerektiğinde temponu değiştir.",
    fast: "Yüksek tempo rakip için düzensizlik yaratır. Yerleşemezler, sıfırlayamazlar, organize olamazlar — senin geçişlerin toparlanmadan önce yıkıcı hale gelir.",
    sprint: "Sprint tempo ilk düdükten sonuncuya maksimum yoğunluk. Tam gaz gidiyorsun — her saniye kritik. Yüksek ödül, yüksek kondisyon bedeli.",
  },
  tacklingExplain: {
    verysoft: "Çok yumuşak sertlik bu hassas senaryoda kart riskini minimuma indirir. Savunmayı yapıya bırak — ayakta dur ve pozisyonla hata zorla.",
    soft: "Yumuşak sertlik disiplin sorunlarından korur. Forma güven, mücadeleye değil. Anları dikkatli seç, gereksiz sarı kartlardan kaçın.",
    normal: "Normal sertlik dengeli standarttır — mücadele kazanılabilecekse atla, risk yüksekse geri dur. Her durumu ayrı ayrı oku.",
    hard: "Sert sertlik fiziksel hakimiyet ve agresyon sinyali verir. Tonu sen kuruyorsun — ama bu sadece hoşgörülü hakemde mümkün. Hakem rengini kontrol et.",
  },
  scenario: {
    away_weaker:   "Deplasmanda zayıf kadroyla: görev hayatta kalmak ve bir şeyler çalmak. Ultra kompakt düşük blok, çelik disiplin, tek klinik kontra — tüm oyun planın bu.",
    away_equal:    "Deplasmanda eşit güçle: kontrollü agresyon kazanır. Hakim olmak zorunda değilsin — kompakt kal, alanı reddet, her hatayı hızla cezalandır.",
    away_stronger: "Deplasmanda üstün kadroyla: yolda bile kararlı. Etkili kontra-pres yap, geçişlerde kaliteni kullan, deplasman sahası seni geri tutmasın.",
    home_weaker:   "Evde zayıf kadroyla: tribünü kullan, disiplini koru. Evde iyi organize kompakt bir yapı her rakibi etkisiz kılabilir — tek kaliteli hamlede çal.",
    home_equal:    "Evde eşit güçle: ev avantajını tam kullan. Deplasmandakinden daha yüksek pres yap, tribün gürültüsünü kullan, stilini ilk düdükten dayat.",
    home_stronger: "Evde üstün kadroyla: ilk düdükten tam gaz. Tam kontrolü al, yüksek pres yap, top ve toprak hâkimiyetini kur. Kadron bundan daha azını hak etmiyor.",
  },
};

// Hungarian / Arabic / Portuguese inherit English and override key strings
const SLIDER_I18N: Record<SL, SLang> = {
  tr: TR, en: EN,
  hu: {
    ...EN,
    badge: "Fejlett Csúszkakalkulátor", title1: "Csúszka", title2: "Kalkulátor",
    desc: "Válaszd ki a mérkőzés helyzetét — a motor pontosan kiszámítja ezen a héten az értékeket.",
    step1: "Helyszín", step2: "Ellenfél Felállás", step3: "Csapaterő",
    home: "Hazai", away: "Vendég", stronger: "Erősebb", equal: "Egyenlő", weaker: "Gyengébb",
    result: "Ezen Hét Optimális Csúszkaértékei",
    pressure: "Nyomás", style: "Stílus", tempo: "Tempó", tackling: "Belépők",
    tacklingLevels: { verysoft: "Nagyon Puha", soft: "Puha", normal: "Normál", hard: "Kemény" },
    pLabels: { ultra_low: "Ultra Alacsony", low: "Alacsony", moderate: "Közepes", high: "Magas", very_high: "Nagyon Magas" },
    sLabels: { ultra_def: "Ultra Def.", defensive: "Defenszív", balanced: "Kiegyensúlyozott", attacking: "Támadó", full_attack: "Teljes Roham" },
    tLabels: { slow: "Lassú", controlled: "Kontrollált", medium: "Közepes", fast: "Gyors", sprint: "Sprint" },
    why: "Miért Ezek Az Értékek?", coachNote: "Edző Megjegyzése", scenarioLabel: "Forgatókönyv Elemzés",
    formation: "Javasolt Felállás", lineTactics: "Vonal Taktikák",
    selectHint: "Töltsd ki a fenti 3 lépést — a motor azonnal kiszámítja ezen a héten az értékeket.",
    weeklyNote: "Minden hétfőn automatikusan frissül",
    lt: { attack: "Támadás", holdPos: "Tartsd a Helyet", defHelp: "Véd. Segítség", stayBack: "Maradj Hátra", forwards: "Csatárok", midfield: "Középpálya", defence: "Védelem" },
    noMatch: "Nem található pontos taktika ehhez a kombinációhoz.", altLabel: "Alternatíva",
  },
  ar: {
    ...EN,
    badge: "حاسبة الإعدادات المتقدمة", title1: "حاسبة", title2: "الإعدادات",
    desc: "اختر وضع المباراة — يحسب المحرك قيم هذا الأسبوع الدقيقة تلقائياً.",
    step1: "الملعب", step2: "تشكيلة الخصم", step3: "قوة الفريق",
    home: "الملعب", away: "خارج الملعب", stronger: "أقوى", equal: "متكافئ", weaker: "أضعف",
    result: "الإعدادات المثالية لهذا الأسبوع",
    pressure: "الضغط", style: "الأسلوب", tempo: "الإيقاع", tackling: "التدخل",
    marking: "المراقبة", offside: "فخ التسلل", on: "مفعّل", off: "معطّل", area: "منطقة", man: "رجل",
    tacklingLevels: { verysoft: "ناعم جداً", soft: "ناعم", normal: "عادي", hard: "صارم" },
    pLabels: { ultra_low: "منخفض جداً", low: "منخفض", moderate: "متوسط", high: "مرتفع", very_high: "مرتفع جداً" },
    sLabels: { ultra_def: "دفاعي للغاية", defensive: "دفاعي", balanced: "متوازن", attacking: "هجومي", full_attack: "هجوم كامل" },
    tLabels: { slow: "بطيء", controlled: "مضبوط", medium: "متوسط", fast: "سريع", sprint: "سباق" },
    why: "لماذا هذه القيم؟", coachNote: "ملاحظة المدرب", scenarioLabel: "تحليل السيناريو",
    formation: "التشكيلة الموصى بها", lineTactics: "تكتيكات الخطوط",
    selectHint: "اختر الخيارات الثلاثة أعلاه لاكتشاف القيم المثالية هذا الأسبوع.",
    weeklyNote: "يتحدث تلقائياً كل اثنين",
    lt: { attack: "هجوم", holdPos: "احتفظ بالمركز", defHelp: "مساعدة دفاعية", stayBack: "ابقَ خلفاً", forwards: "المهاجمون", midfield: "الوسط", defence: "الدفاع" },
    noMatch: "لا يوجد تكتيك دقيق لهذا التوليف.", altLabel: "بديل",
    scenario: {
      away_weaker:   "بعيداً كفريق أضعف: مهمتك البقاء والسرقة. كتلة منخفضة وانضباط وارتداد واحد دقيق — هذا كل خطتك.",
      away_equal:    "بعيداً بقوى متكافئة: عدوانية مضبوطة. ابق مضغوطاً وعاقب الأخطاء بسرعة.",
      away_stronger: "بعيداً لكنك أقوى: حازم حتى في الخارج. اضغط بكفاءة وحوّل جودتك إلى أهداف.",
      home_weaker:   "في الملعب كفريق أضعف: استخدم الجماهير وحافظ على الانضباط.",
      home_equal:    "في الملعب بقوى متكافئة: استغل ميزة الملعب كاملاً.",
      home_stronger: "في الملعب ومتفوق: بكل قوة من الصافرة الأولى.",
    },
  },
  pt: {
    ...EN,
    badge: "Calculadora Avançada de Sliders", title1: "Calculadora", title2: "de Sliders",
    desc: "Selecione o cenário do jogo — o motor calcula os valores precisos desta semana com dados táticos reais.",
    step1: "Local", step2: "Formação Adversária", step3: "Força do Plantel",
    home: "Casa", away: "Fora", stronger: "Mais Forte", equal: "Igual", weaker: "Mais Fraco",
    result: "Sliders Ideais desta Semana",
    pressure: "Pressão", style: "Estilo", tempo: "Ritmo", tackling: "Entradas",
    tacklingLevels: { verysoft: "Muito Suave", soft: "Suave", normal: "Normal", hard: "Duro" },
    pLabels: { ultra_low: "Ultra Baixa", low: "Baixa", moderate: "Moderada", high: "Alta", very_high: "Muito Alta" },
    sLabels: { ultra_def: "Ultra Def.", defensive: "Defensivo", balanced: "Equilibrado", attacking: "Atacante", full_attack: "Ataque Total" },
    tLabels: { slow: "Lento", controlled: "Controlado", medium: "Médio", fast: "Rápido", sprint: "Sprint" },
    why: "Por que Estes Valores?", coachNote: "Nota do Treinador", scenarioLabel: "Análise do Cenário",
    formation: "Formação Recomendada", lineTactics: "Táticas de Linha",
    selectHint: "Preencha os 3 passos acima para revelar os valores ótimos desta semana.",
    weeklyNote: "Atualiza automaticamente toda segunda-feira",
    lt: { attack: "Ataque", holdPos: "Manter Posição", defHelp: "Ajuda Def.", stayBack: "Ficar Atrás", forwards: "Avançados", midfield: "Meio-Campo", defence: "Defesa" },
    noMatch: "Nenhuma tática encontrada para esta combinação.", altLabel: "Alternativa",
    scenario: {
      away_weaker:   "Fora como azarão: sobreviver e roubar algo. Bloco baixo, disciplina e um contra-ataque clínico — todo o seu plano.",
      away_equal:    "Fora em pé de igualdade: agressividade controlada. Fique compacto e puna cada erro com velocidade.",
      away_stronger: "Fora mas superior: assertivo mesmo longe de casa. Pressão eficiente e converta qualidade em gols.",
      home_weaker:   "Em casa como azarão: use a torcida, mantenha a disciplina.",
      home_equal:    "Em casa em igualdade: use a vantagem de jogar em casa completamente.",
      home_stronger: "Em casa e dominante: a todo vapor desde o apito inicial.",
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SliderBar({ label, value, gradient, catLabel, delay = 0 }: {
  label: string; value: number; gradient: string; catLabel: string; delay?: number;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#94a3b8", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
          <span style={{
            fontSize: 10, padding: "2px 7px", borderRadius: 99,
            background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)",
            color: "#a78bfa", fontWeight: 600, letterSpacing: "0.04em",
          }}>{catLabel}</span>
        </div>
        <motion.span
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.5 }}
          style={{ color: "#e2e8f0", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", lineHeight: 1 }}
        >{value}</motion.span>
      </div>
      {/* Track */}
      <div style={{ height: 10, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden", position: "relative" }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay }}
          style={{ height: "100%", borderRadius: 99, background: gradient, position: "relative" }}
        >
          {/* Shimmer */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.6, delay: delay + 0.6, ease: "easeInOut" }}
            style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
              pointerEvents: "none",
            }}
          />
        </motion.div>
      </div>
      {/* Scale ticks */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {[0, 25, 50, 75, 99].map(tick => (
          <span key={tick} style={{ fontSize: 9, color: "rgba(148,163,184,0.3)", fontVariantNumeric: "tabular-nums" }}>{tick}</span>
        ))}
      </div>
    </div>
  );
}

function LineTacticRow({ label, value, lt }: { label: string; value: string; lt: Record<string,string> }) {
  const display = lt[value] ?? value;
  const isAttack  = value === "attack";
  const isStay    = value === "stayBack";
  const isDefHelp = value === "defHelp";
  const color = isAttack ? "#22c55e" : isStay ? "#6366f1" : isDefHelp ? "#f59e0b" : "#94a3b8";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ color: "#64748b", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.04em" }}>{label}</span>
      <span style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
        color, padding: "3px 9px", borderRadius: 99,
        background: `${color}18`, border: `1px solid ${color}33`,
      }}>{display}</span>
    </div>
  );
}

function TacklingBar({ level, levels, color }: { level: TacklingLevel; levels: Record<TacklingLevel,string>; color: string }) {
  const order: TacklingLevel[] = ["verysoft","soft","normal","hard"];
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {order.map(k => {
        const active = k === level;
        return (
          <div key={k} style={{
            padding: "5px 10px", borderRadius: 99, fontSize: 10.5, fontWeight: active ? 700 : 500,
            background: active ? `${color}22` : "rgba(255,255,255,0.04)",
            border: `1px solid ${active ? color : "rgba(255,255,255,0.08)"}`,
            color: active ? color : "#64748b",
            letterSpacing: "0.04em", transition: "all 0.2s",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            {active && <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block" }} />}
            {levels[k]}
          </div>
        );
      })}
    </div>
  );
}

function ExplainRow({ icon, title, value, text }: { icon: string; title: string; value?: string | number; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22 }}
      style={{
        display: "flex", gap: 12, padding: "11px 14px",
        borderRadius: 12, background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.05)", marginBottom: 8,
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>{icon}</span>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
          <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 12.5, letterSpacing: "0.04em" }}>{title}</span>
          {value !== undefined && (
            <span style={{
              fontSize: 10, padding: "1px 6px", borderRadius: 99,
              background: "rgba(99,102,241,0.15)", color: "#a78bfa", fontWeight: 700,
            }}>{value}</span>
          )}
        </div>
        <p style={{ color: "#64748b", fontSize: 12, lineHeight: 1.65, margin: 0 }}>{text}</p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function SliderCalculator() {
  const { lang } = useLang();
  const s = SLIDER_I18N[(lang as SL) in SLIDER_I18N ? (lang as SL) : "en"];
  const { evolve } = useTacticEngine();

  const [location, setLocation] = useState<Location | null>(null);
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [strength, setStrength]   = useState<Strength | null>(null);
  const [showWhy, setShowWhy]     = useState(true);
  const weekNum = getISOWeekNumber();

  // Find best-matching tactic from the anti-tactic database
  const result = useMemo(() => {
    if (!location || !opponentId || !strength) return null;
    const matches = antiTactics.filter(
      t => t.opponentId === opponentId && t.location === location && t.strength === strength,
    );
    if (!matches.length) {
      // Fallback: relax strength constraint
      const fallback = antiTactics.filter(
        t => t.opponentId === opponentId && t.location === location,
      );
      if (!fallback.length) return null;
      const f = evolve(fallback[0]);
      return { evolved: f, raw: fallback[0], alt: fallback[1] ? evolve(fallback[1]) : null, fallback: true };
    }
    const evolved = evolve(matches[0]);
    return { evolved, raw: matches[0], alt: matches[1] ? evolve(matches[1]) : null, fallback: false };
  }, [location, opponentId, strength, evolve]);

  const tacklingLevel = useMemo(
    () => result ? tackling(result.raw.location, result.raw.strength, result.evolved.pressure) : "normal",
    [result],
  );

  const scenarioKey = location && strength ? `${location}_${strength}` : null;
  const allSelected = !!location && !!opponentId && !!strength;

  // Style helpers for selectors
  const btnBase: React.CSSProperties = {
    padding: "9px 16px", borderRadius: 10, fontSize: 12.5, fontWeight: 600,
    cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.04em",
    border: "1px solid rgba(255,255,255,0.09)",
    background: "rgba(255,255,255,0.04)", color: "#64748b",
    WebkitTapHighlightColor: "transparent",
  };
  const btnActive: React.CSSProperties = {
    ...btnBase,
    background: "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(139,92,246,0.14))",
    border: "1px solid rgba(139,92,246,0.45)",
    color: "#e2e8f0", boxShadow: "0 0 0 1px rgba(139,92,246,0.18) inset",
  };

  return (
    <section id="slider-calc" style={{ padding: "80px 20px", maxWidth: 1100, margin: "0 auto" }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.55 }}
        style={{ textAlign: "center", marginBottom: 52 }}
      >
        <span style={{
          display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
          textTransform: "uppercase", color: "#8b5cf6",
          padding: "6px 14px", borderRadius: 99,
          background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.22)",
          marginBottom: 18,
        }}>{s.badge}</span>

        <h2 style={{ fontSize: "clamp(28px,5vw,46px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
          <span style={{ color: "#e2e8f0" }}>{s.title1} </span>
          <span style={{ color: "#8b5cf6" }}>{s.title2}</span>
        </h2>

        <p style={{ color: "#64748b", fontSize: "clamp(13px,2vw,15px)", lineHeight: 1.7, maxWidth: 640, margin: "0 auto 22px" }}>{s.desc}</p>

        {/* Weekly badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 99, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <motion.span
            animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}
          />
          <span style={{ color: "#22c55e", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>
            {s.weekLabel} · {weekLabel()} · Week {weekNum}
          </span>
        </div>
      </motion.div>

      {/* ── 3-Step Selector ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          background: "rgba(9,11,33,0.85)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(139,92,246,0.18)", borderRadius: 20,
          padding: "28px 24px", marginBottom: 28,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 24 }}>

          {/* Step 1 — Venue */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>1</span>
              <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.step1}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["home", "away"] as const).map(loc => (
                <button key={loc} onClick={() => setLocation(loc)}
                  style={{ ...(location === loc ? btnActive : btnBase), flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  <span>{loc === "home" ? "🏠" : "✈️"}</span>
                  {loc === "home" ? s.home : s.away}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3 — Strength */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>3</span>
              <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.step3}</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {([["stronger","⭐"],["equal","⚖️"],["weaker","⚠️"]] as [Strength, string][]).map(([str, icon]) => (
                <button key={str} onClick={() => setStrength(str)}
                  style={{ ...(strength === str ? btnActive : btnBase), flex: 1, flexDirection: "column" as const, display: "flex", alignItems: "center", gap: 4, padding: "8px 4px" }}
                >
                  <span style={{ fontSize: 15 }}>{icon}</span>
                  <span style={{ fontSize: 10.5 }}>{str === "stronger" ? s.stronger : str === "equal" ? s.equal : s.weaker}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Step 2 — Opponent Formation (full-width) */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>2</span>
            <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.step2}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {opponentTactics.map(opp => (
              <button key={opp.id} onClick={() => setOpponentId(opp.id)}
                style={{
                  ...(opponentId === opp.id ? btnActive : btnBase),
                  display: "flex", alignItems: "center", gap: 6, padding: "7px 12px",
                }}
              >
                <span>{opp.emoji}</span>
                <span style={{ fontSize: 11.5 }}>{opp.formation}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hint when not all selected */}
        <AnimatePresence>
          {!allSelected && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ color: "#475569", fontSize: 12, textAlign: "center", margin: "18px 0 0", letterSpacing: "0.02em" }}
            >{s.selectHint}</motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Result Panel ────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {allSelected && result && (
          <motion.div
            key={`${location}-${opponentId}-${strength}`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Top result bar */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
              gap: 16, marginBottom: 16,
            }}>

              {/* ── Sliders Card ──────────────────────────────────────────── */}
              <div style={{
                background: "rgba(9,11,33,0.88)", backdropFilter: "blur(20px)",
                border: "1px solid rgba(139,92,246,0.18)", borderRadius: 20,
                padding: "24px 22px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                gridColumn: "span 2",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 8 }}>
                  <span style={{ color: "#e2e8f0", fontWeight: 800, fontSize: 14, letterSpacing: "0.04em" }}>{s.result}</span>
                  <span style={{ fontSize: 10, color: "#475569", letterSpacing: "0.04em" }}>{s.weeklyNote}</span>
                </div>

                <SliderBar
                  label={s.pressure} value={result.evolved.pressure}
                  gradient={PRESSURE_GRAD[pCat(result.evolved.pressure)]}
                  catLabel={s.pLabels[pCat(result.evolved.pressure)]} delay={0}
                />
                <SliderBar
                  label={s.style} value={result.evolved.style}
                  gradient={STYLE_GRAD[sCat(result.evolved.style)]}
                  catLabel={s.sLabels[sCat(result.evolved.style)]} delay={0.12}
                />
                <SliderBar
                  label={s.tempo} value={result.evolved.tempo}
                  gradient={TEMPO_GRAD[tCat(result.evolved.tempo)]}
                  catLabel={s.tLabels[tCat(result.evolved.tempo)]} delay={0.24}
                />

                {/* Tackling */}
                <div style={{ marginTop: 6 }}>
                  <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>{s.tackling}</span>
                  <TacklingBar level={tacklingLevel} levels={s.tacklingLevels} color={TACKLING_COLORS[tacklingLevel]} />
                </div>
              </div>

              {/* ── Formation + Line Tactics ──────────────────────────────── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Formation card */}
                <div style={{
                  background: "rgba(9,11,33,0.88)", backdropFilter: "blur(20px)",
                  border: "1px solid rgba(139,92,246,0.18)", borderRadius: 20,
                  padding: "20px 18px",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}>
                  <span style={{ color: "#64748b", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>{s.formation}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 11,
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, flexShrink: 0,
                      boxShadow: "0 6px 18px rgba(99,102,241,0.4)",
                    }}>
                      {opponentTactics.find(o => o.id === opponentId)?.emoji ?? "⚽"}
                    </div>
                    <div>
                      <div style={{ color: "#e2e8f0", fontWeight: 800, fontSize: 14.5, lineHeight: 1.2 }}>
                        {result.raw.recommendedFormation}
                      </div>
                      <div style={{ color: "#6366f1", fontSize: 11, fontWeight: 600, marginTop: 3 }}>
                        {location === "home" ? "🏠 " + s.home : "✈️ " + s.away} · {strength === "stronger" ? s.stronger : strength === "equal" ? s.equal : s.weaker}
                      </div>
                    </div>
                  </div>
                  {result.alt && (
                    <div style={{
                      padding: "7px 10px", borderRadius: 10,
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                    }}>
                      <span style={{ color: "#475569", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em" }}>{s.altLabel}: </span>
                      <span style={{ color: "#64748b", fontSize: 10.5 }}>{result.alt.recommendedFormation}</span>
                      <span style={{ color: "#475569", fontSize: 10, marginLeft: 8 }}>
                        P:{result.alt.pressure} S:{result.alt.style} T:{result.alt.tempo}
                      </span>
                    </div>
                  )}
                </div>

                {/* Line Tactics card */}
                <div style={{
                  background: "rgba(9,11,33,0.88)", backdropFilter: "blur(20px)",
                  border: "1px solid rgba(139,92,246,0.18)", borderRadius: 20,
                  padding: "20px 18px", flex: 1,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}>
                  <span style={{ color: "#64748b", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 12 }}>{s.lineTactics}</span>
                  <LineTacticRow label={s.lt.forwards} value={result.raw.lineTactics.forwards} lt={s.lt} />
                  <LineTacticRow label={s.lt.midfield} value={result.raw.lineTactics.midfield} lt={s.lt} />
                  <LineTacticRow label={s.lt.defence}  value={result.raw.lineTactics.defence}  lt={s.lt} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0 4px" }}>
                    <span style={{ color: "#64748b", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.04em" }}>{s.offside}</span>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 99,
                      background: result.raw.lineTactics.offsides ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.1)",
                      border: `1px solid ${result.raw.lineTactics.offsides ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.25)"}`,
                      color: result.raw.lineTactics.offsides ? "#ef4444" : "#22c55e",
                    }}>{result.raw.lineTactics.offsides ? s.on : s.off}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0 0" }}>
                    <span style={{ color: "#64748b", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.04em" }}>{s.marking}</span>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 99,
                      background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa",
                    }}>{result.raw.lineTactics.marking === "area" ? s.area : s.man}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Why These Values? ──────────────────────────────────────── */}
            <div style={{
              background: "rgba(9,11,33,0.88)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(139,92,246,0.18)", borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}>
              {/* Collapsible header */}
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
                  <span style={{ color: "#e2e8f0", fontWeight: 800, fontSize: 14.5, letterSpacing: "0.02em" }}>{s.why}</span>
                </div>
                <motion.span
                  animate={{ rotate: showWhy ? 180 : 0 }} transition={{ duration: 0.2 }}
                  style={{ color: "#64748b", fontSize: 16, display: "flex" }}
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
                      {/* Scenario analysis box */}
                      {scenarioKey && s.scenario[scenarioKey] && (
                        <div style={{
                          padding: "14px 16px", borderRadius: 14, marginBottom: 16,
                          background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06))",
                          border: "1px solid rgba(139,92,246,0.25)",
                        }}>
                          <span style={{ color: "#94a3b8", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>{s.scenarioLabel}</span>
                          <p style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.65, margin: 0, fontWeight: 500 }}>{s.scenario[scenarioKey]}</p>
                        </div>
                      )}

                      {/* Per-slider explanations */}
                      <ExplainRow
                        icon="⚡" title={`${s.pressure} · ${result.evolved.pressure}`}
                        value={s.pLabels[pCat(result.evolved.pressure)]}
                        text={s.pExplain[pCat(result.evolved.pressure)]}
                      />
                      <ExplainRow
                        icon="🎯" title={`${s.style} · ${result.evolved.style}`}
                        value={s.sLabels[sCat(result.evolved.style)]}
                        text={s.sExplain[sCat(result.evolved.style)]}
                      />
                      <ExplainRow
                        icon="🏃" title={`${s.tempo} · ${result.evolved.tempo}`}
                        value={s.tLabels[tCat(result.evolved.tempo)]}
                        text={s.tExplain[tCat(result.evolved.tempo)]}
                      />
                      <ExplainRow
                        icon="💪" title={`${s.tackling}`}
                        value={s.tacklingLevels[tacklingLevel]}
                        text={s.tacklingExplain[tacklingLevel]}
                      />

                      {/* Coach's note from the tactic data */}
                      <div style={{
                        marginTop: 8, padding: "13px 16px", borderRadius: 12,
                        background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.18)",
                        display: "flex", gap: 10, alignItems: "flex-start",
                      }}>
                        <span style={{ fontSize: 18, flexShrink: 0 }}>📋</span>
                        <div>
                          <span style={{ color: "#fbbf24", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>{s.coachNote}</span>
                          <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.65, margin: 0, fontStyle: "italic" }}>"{result.raw.note}"</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* No match found */}
        {allSelected && !result && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              textAlign: "center", padding: "40px 24px",
              background: "rgba(9,11,33,0.85)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20,
              color: "#64748b", fontSize: 13,
            }}
          >{s.noMatch}</motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
