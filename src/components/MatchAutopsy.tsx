import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TD, OPP_LIST } from "../data/tacticDatabase";
import { usePremium } from "../contexts/PremiumContext";
import { siteConfig } from "../data/extras";
import { useLang } from "../contexts/LanguageContext";
import type { Lang } from "../data/translations";

const EASE = [0.16, 1, 0.3, 1] as const;
type Loc = "home" | "away";
type Str = "stronger" | "equal" | "weaker";
type SliderKey = "pressure" | "style" | "tempo";

// ── Per-language strings ───────────────────────────────────────────────────────
interface AutopsyStrings {
  badge: string;
  title: string;
  subtitle: string;
  locLabel: string;
  home: string;
  away: string;
  strLabel: string;
  stronger: string;
  equal: string;
  weaker: string;
  oppLabel: string;
  slidersLabel: string;
  pressureLabel: string;
  styleLabel: string;
  tempoLabel: string;
  analyzeBtn: string;
  scoreWord: string;
  scoreGood: string;
  scoreWarn: string;
  scoreBad: string;
  critLabel: string;
  warnLabel: string;
  okLabel: string;
  yours: string;
  optimal: string;
  verdictTitle: string;
  correctTitle: string;
  winRate: (n: number) => string;
  vipDetails: string;
  vipSee: string;
  vipBadge: string;
  vipCta: string;
  newAnalysis: string;
  // buildError messages: [critDirHigh, critDirLow, warnDirHigh, warnDirLow, okMsg]
  pressureMsgs: [string, string, string, string, string];
  styleMsgs:    [string, string, string, string, string];
  tempoMsgs:    [string, string, string, string, string];
  // buildVerdict
  verdict2crits: (sliders: string[]) => string;
  verdict1crit:  (slider: string, dir: "high" | "low", msg: string) => string;
  verdict2warns: string;
  verdict1warn:  (slider: string) => string;
  verdictOptimal: string;
  verdictDefault: string;
}

const S: Record<Lang, AutopsyStrings> = {
  tr: {
    badge: "TAKTİK OTOPSİ",
    title: "Neden Kaybettin?",
    subtitle: "Maç bilgilerini ve kullandığın slider değerlerini gir, sistem tam teşhisi çıkarsın.",
    locLabel: "Maç Yeri",
    home: "Ev",
    away: "Deplasman",
    strLabel: "Güç Durumu",
    stronger: "Güçlüydüm",
    equal: "Eşittik",
    weaker: "Zayıftım",
    oppLabel: "Rakip Formasyon",
    slidersLabel: "Kullandığın Slider Değerleri",
    pressureLabel: "⚡ Baskı",
    styleLabel: "🎨 Stil",
    tempoLabel: "⏱️ Tempo",
    analyzeBtn: "🔬 Analiz Et",
    scoreWord: "Skor",
    scoreGood: "Neredeyse Optimal Taktik",
    scoreWarn: "Önemli Hatalar Tespit Edildi",
    scoreBad: "Kritik Taktik Uyumsuzluğu",
    critLabel: "KRİTİK HATA",
    warnLabel: "HATA",
    okLabel: "DOĞRU",
    yours: "Senin",
    optimal: "Optimal",
    verdictTitle: "🧠 KAYBININ SEBEBİ",
    correctTitle: "✅ DOĞRU TAKTİK",
    winRate: (n) => `%${n} Kazanma`,
    vipDetails: "Detaylar VIP üyelere açıktır",
    vipSee: "🔒 VIP ile görüntüle",
    vipBadge: "🔒 VIP",
    vipCta: "👑 VIP Al — Tam Analizi Gör",
    newAnalysis: "↩ Yeni Analiz",
    pressureMsgs: [
      "Aşırı baskı savunma dengesini bozdu — rakip kontraya dönünce boşluk oluştu",
      "Düşük baskı rakibe topla çıkış serbestisi tanıdı",
      "Baskı biraz fazlaydı, kontra riski arttı",
      "Baskı biraz düşüktü, rakip rahat pozisyon kurdu",
      "Baskı değeri iyiydi",
    ],
    styleMsgs: [
      "Stil çok yüksek — rakibin kontra atağına açık kapı bıraktın",
      "Stil çok düşük, hücum gücünü kaybettin ve baskı kuramadın",
      "Stil fazlaydı, savunma arkası riske girdi",
      "Stil düşüktü, önde yeterli etki yaratamadın",
      "Stil değeri iyiydi",
    ],
    tempoMsgs: [
      "Tempo çok yüksek, oyuncular erken yoruldu ve ikinci yarıda ritim bozuldu",
      "Tempo çok düşük, rakibe oyun kurma ve pozisyon üstünlüğü sağladın",
      "Tempo biraz fazla, ikinci yarıda enerji düştü",
      "Tempo biraz düşük, baskı hissi kayboldu",
      "Tempo değeri iyiydi",
    ],
    verdict2crits: (sl) => `${sl.join(" ve ")} değerlerindeki kritik hatalar maçı kaybettirdi. Optimal taktikten çok uzak bir kurulum oynamışsın.`,
    verdict1crit:  (sl, dir, msg) => `${sl} ${dir === "high" ? "yüksek" : "düşük"} olması sonucu doğrudan etkiledi. ${msg}.`,
    verdict2warns: "Birden fazla slider optimal değerden sapıyordu. Küçük görünen hatalar birleşince büyük etki yarattı.",
    verdict1warn:  (sl) => `${sl} değerindeki sapma belirleyici oldu. Geri kalan ayarlar iyiydi.`,
    verdictOptimal: "Slider değerlerin neredeyse optimaldi. Kayıp taktik dışı bir faktörden (şans, özel yetenek vb.) kaynaklanmış olabilir.",
    verdictDefault: "Taktik kurulumun mantıklıydı. Kayıp güç dengesindeki farklılık veya anlık şanssızlıktan kaynaklanmış olabilir.",
  },
  en: {
    badge: "MATCH AUTOPSY",
    title: "Why Did You Lose?",
    subtitle: "Enter your match info and the slider values you used — the system will produce a full diagnosis.",
    locLabel: "Match Location",
    home: "Home",
    away: "Away",
    strLabel: "Strength Status",
    stronger: "I Was Stronger",
    equal: "We Were Equal",
    weaker: "I Was Weaker",
    oppLabel: "Opponent Formation",
    slidersLabel: "Your Slider Values",
    pressureLabel: "⚡ Pressure",
    styleLabel: "🎨 Style",
    tempoLabel: "⏱️ Tempo",
    analyzeBtn: "🔬 Analyze",
    scoreWord: "Score",
    scoreGood: "Nearly Optimal Tactic",
    scoreWarn: "Significant Errors Detected",
    scoreBad: "Critical Tactic Mismatch",
    critLabel: "CRITICAL ERROR",
    warnLabel: "ERROR",
    okLabel: "CORRECT",
    yours: "Yours",
    optimal: "Optimal",
    verdictTitle: "🧠 WHY YOU LOST",
    correctTitle: "✅ CORRECT TACTIC",
    winRate: (n) => `${n}% Win Rate`,
    vipDetails: "Details are available to VIP members",
    vipSee: "🔒 View with VIP",
    vipBadge: "🔒 VIP",
    vipCta: "👑 Get VIP — See Full Analysis",
    newAnalysis: "↩ New Analysis",
    pressureMsgs: [
      "Excessive pressure disrupted defensive balance — gaps formed when the opponent counter-attacked",
      "Low pressure allowed the opponent to build up play freely",
      "Pressure was slightly too high, increasing counter-attack risk",
      "Pressure was slightly too low, the opponent built comfortable positions",
      "Pressure value was good",
    ],
    styleMsgs: [
      "Style too high — left the door wide open for the opponent's counter-attack",
      "Style too low — you lost attacking power and couldn't apply pressure",
      "Style was a bit high, defence was exposed behind",
      "Style was a bit low, couldn't create enough impact up front",
      "Style value was good",
    ],
    tempoMsgs: [
      "Tempo too high — players tired early and rhythm broke down in the second half",
      "Tempo too low — gave the opponent control and positional advantage",
      "Tempo slightly too high, energy dropped in the second half",
      "Tempo slightly too low, the pressure feel was lost",
      "Tempo value was good",
    ],
    verdict2crits: (sl) => `Critical errors in ${sl.join(" and ")} directly cost you the match. Your setup was far from the optimal tactic.`,
    verdict1crit:  (sl, dir, msg) => `${sl} being too ${dir === "high" ? "high" : "low"} directly impacted the result. ${msg}.`,
    verdict2warns: "Multiple sliders deviated from their optimal values. Small-looking mistakes compounded into a big effect.",
    verdict1warn:  (sl) => `The deviation in ${sl} was the decisive factor. The remaining settings were fine.`,
    verdictOptimal: "Your slider values were nearly optimal. The loss may have come from a non-tactical factor (luck, special ability, etc.).",
    verdictDefault: "Your tactical setup was logical. The loss may be down to a difference in squad strength or a moment of bad luck.",
  },
  hu: {
    badge: "MECCS BONCOLÁS",
    title: "Miért Veszítettél?",
    subtitle: "Add meg a meccs adatait és a használt csúszkaértékeket — a rendszer teljes diagnózist készít.",
    locLabel: "Mérkőzés Helyszíne",
    home: "Hazai",
    away: "Vendég",
    strLabel: "Erő Állapot",
    stronger: "Erősebb Voltam",
    equal: "Egyenlők Voltunk",
    weaker: "Gyengébb Voltam",
    oppLabel: "Ellenfél Formáció",
    slidersLabel: "Használt Csúszkaértékeid",
    pressureLabel: "⚡ Nyomás",
    styleLabel: "🎨 Stílus",
    tempoLabel: "⏱️ Tempó",
    analyzeBtn: "🔬 Elemzés",
    scoreWord: "Pont",
    scoreGood: "Szinte Optimális Taktika",
    scoreWarn: "Jelentős Hibák Észlelve",
    scoreBad: "Kritikus Taktikai Eltérés",
    critLabel: "KRITIKUS HIBA",
    warnLabel: "HIBA",
    okLabel: "HELYES",
    yours: "Tiéd",
    optimal: "Optimális",
    verdictTitle: "🧠 MIÉRT VESZÍTETTÉL",
    correctTitle: "✅ HELYES TAKTIKA",
    winRate: (n) => `${n}% Győzelem`,
    vipDetails: "A részletek VIP tagoknak érhetők el",
    vipSee: "🔒 Megtekintés VIP-pel",
    vipBadge: "🔒 VIP",
    vipCta: "👑 VIP Kérés — Teljes Elemzés",
    newAnalysis: "↩ Új Elemzés",
    pressureMsgs: [
      "A túlzott nyomás felborította a védelmi egyensúlyt — rések keletkeztek a kontra során",
      "Az alacsony nyomás szabad labdajárást biztosított az ellenfelnek",
      "A nyomás kissé magas volt, nőtt a kontra kockázata",
      "A nyomás kissé alacsony volt, az ellenfél kényelmes pozíciókat épített",
      "A nyomásérték megfelelő volt",
    ],
    styleMsgs: [
      "Stílus túl magas — szélesre nyitotta az ellenfél kontrájának kapuját",
      "Stílus túl alacsony — elvesztetted a támadóerőt",
      "A stílus kissé magas volt, a védelem hátul ki volt téve",
      "A stílus kissé alacsony volt, nem tudtál elöl elég hatást teremteni",
      "A stílusérték megfelelő volt",
    ],
    tempoMsgs: [
      "Tempó túl magas — a játékosok korán elfáradtak, a második félidőben megtört a ritmus",
      "Tempó túl alacsony — az ellenfélnek adtad a játék irányítását",
      "A tempó kissé magas volt, a második félidőben csökkent az energia",
      "A tempó kissé alacsony volt, elveszett a nyomás érzése",
      "A tempóérték megfelelő volt",
    ],
    verdict2crits: (sl) => `A ${sl.join(" és ")} kritikus hibái elvesztették a meccset. A felállásod messze volt az optimálistól.`,
    verdict1crit:  (sl, dir, msg) => `${sl} ${dir === "high" ? "magas" : "alacsony"} értéke közvetlen hatással volt az eredményre. ${msg}.`,
    verdict2warns: "Több csúszka is eltért az optimális értéktől. A kis hibák összeadódtak és nagy hatást gyakoroltak.",
    verdict1warn:  (sl) => `A ${sl} értékének eltérése volt a döntő tényező. A többi beállítás megfelelő volt.`,
    verdictOptimal: "A csúszkaértékeid szinte optimálisak voltak. A vereség nem taktikai okból fakadhatott.",
    verdictDefault: "A taktikai felállásod logikus volt. A vereség az erőviszonyok különbségéből vagy pillanatnyi pechből adódhatott.",
  },
  ar: {
    badge: "تشريح المباراة",
    title: "لماذا خسرت؟",
    subtitle: "أدخل معلومات المباراة وقيم المتزلجات التي استخدمتها — سيقدم النظام تشخيصاً كاملاً.",
    locLabel: "موقع المباراة",
    home: "الملعب",
    away: "خارج الديار",
    strLabel: "حالة القوة",
    stronger: "كنت أقوى",
    equal: "كنا متساوين",
    weaker: "كنت أضعف",
    oppLabel: "تشكيل الخصم",
    slidersLabel: "قيم المتزلجات المستخدمة",
    pressureLabel: "⚡ الضغط",
    styleLabel: "🎨 الأسلوب",
    tempoLabel: "⏱️ الإيقاع",
    analyzeBtn: "🔬 تحليل",
    scoreWord: "النتيجة",
    scoreGood: "تكتيك شبه مثالي",
    scoreWarn: "أخطاء مهمة مكتشفة",
    scoreBad: "عدم توافق تكتيكي حرج",
    critLabel: "خطأ فادح",
    warnLabel: "خطأ",
    okLabel: "صحيح",
    yours: "أنت",
    optimal: "الأمثل",
    verdictTitle: "🧠 سبب خسارتك",
    correctTitle: "✅ التكتيك الصحيح",
    winRate: (n) => `نسبة فوز ${n}%`,
    vipDetails: "التفاصيل متاحة لأعضاء VIP",
    vipSee: "🔒 عرض مع VIP",
    vipBadge: "🔒 VIP",
    vipCta: "👑 احصل على VIP — شاهد التحليل الكامل",
    newAnalysis: "↩ تحليل جديد",
    pressureMsgs: [
      "الضغط المفرط أخل بالتوازن الدفاعي — ظهرت فراغات عند هجمة المرتدة",
      "الضغط المنخفض منح الخصم حرية البناء",
      "الضغط كان مرتفعاً قليلاً مما زاد خطر المرتدة",
      "الضغط كان منخفضاً قليلاً فبنى الخصم مراكز مريحة",
      "قيمة الضغط كانت جيدة",
    ],
    styleMsgs: [
      "الأسلوب مرتفع جداً — تركت الباب مفتوحاً لهجمة مرتدة",
      "الأسلوب منخفض جداً — فقدت القوة الهجومية",
      "الأسلوب كان مرتفعاً قليلاً مما عرّض الدفاع للخطر",
      "الأسلوب كان منخفضاً قليلاً فلم تؤثر بشكل كافٍ",
      "قيمة الأسلوب كانت جيدة",
    ],
    tempoMsgs: [
      "الإيقاع مرتفع جداً — تعب اللاعبون مبكراً وانهار الإيقاع في الشوط الثاني",
      "الإيقاع منخفض جداً — منحت الخصم السيطرة على اللعب",
      "الإيقاع كان مرتفعاً قليلاً فانخفضت الطاقة في الشوط الثاني",
      "الإيقاع كان منخفضاً قليلاً فضاع الإحساس بالضغط",
      "قيمة الإيقاع كانت جيدة",
    ],
    verdict2crits: (sl) => `الأخطاء الحرجة في ${sl.join(" و")} أضاعت المباراة. كان إعدادك بعيداً جداً عن التكتيك الأمثل.`,
    verdict1crit:  (sl, dir, msg) => `كون ${sl} ${dir === "high" ? "مرتفعاً" : "منخفضاً"} جداً أثّر مباشرة على النتيجة. ${msg}.`,
    verdict2warns: "انحرفت عدة متزلجات عن قيمها المثلى. الأخطاء الصغيرة تضافرت لتحدث تأثيراً كبيراً.",
    verdict1warn:  (sl) => `كان الانحراف في ${sl} هو العامل الحاسم. بقية الإعدادات كانت جيدة.`,
    verdictOptimal: "كانت قيم المتزلجات لديك شبه مثالية. قد تكون الخسارة من عامل غير تكتيكي.",
    verdictDefault: "كان إعدادك التكتيكي منطقياً. قد تكون الخسارة بسبب فارق القوة أو سوء الحظ.",
  },
  pt: {
    badge: "AUTÓPSIA DO JOGO",
    title: "Por Que Perdeu?",
    subtitle: "Insira as informações da partida e os valores dos controles que usou — o sistema produzirá um diagnóstico completo.",
    locLabel: "Local do Jogo",
    home: "Em Casa",
    away: "Fora",
    strLabel: "Status de Força",
    stronger: "Eu Era Mais Forte",
    equal: "Éramos Iguais",
    weaker: "Eu Era Mais Fraco",
    oppLabel: "Formação do Adversário",
    slidersLabel: "Seus Valores de Controle",
    pressureLabel: "⚡ Pressão",
    styleLabel: "🎨 Estilo",
    tempoLabel: "⏱️ Ritmo",
    analyzeBtn: "🔬 Analisar",
    scoreWord: "Pontuação",
    scoreGood: "Tática Quase Ideal",
    scoreWarn: "Erros Significativos Detectados",
    scoreBad: "Desajuste Tático Crítico",
    critLabel: "ERRO CRÍTICO",
    warnLabel: "ERRO",
    okLabel: "CORRETO",
    yours: "Seu",
    optimal: "Ideal",
    verdictTitle: "🧠 POR QUE PERDEU",
    correctTitle: "✅ TÁTICA CORRETA",
    winRate: (n) => `${n}% de Vitória`,
    vipDetails: "Detalhes disponíveis para membros VIP",
    vipSee: "🔒 Ver com VIP",
    vipBadge: "🔒 VIP",
    vipCta: "👑 Obter VIP — Ver Análise Completa",
    newAnalysis: "↩ Nova Análise",
    pressureMsgs: [
      "A pressão excessiva desequilibrou a defesa — brechas surgiram no contra-ataque",
      "A pressão baixa deu liberdade ao adversário para construir o jogo",
      "A pressão estava um pouco alta, aumentando o risco de contra-ataque",
      "A pressão estava um pouco baixa, o adversário construiu posições confortáveis",
      "O valor de pressão estava bom",
    ],
    styleMsgs: [
      "Estilo alto demais — deixou a porta aberta para o contra-ataque adversário",
      "Estilo baixo demais — perdeu poder ofensivo e não conseguiu pressionar",
      "O estilo estava um pouco alto, expondo a defesa",
      "O estilo estava um pouco baixo, não criou impacto suficiente no ataque",
      "O valor de estilo estava bom",
    ],
    tempoMsgs: [
      "Ritmo alto demais — os jogadores cansaram cedo e o ritmo caiu no 2º tempo",
      "Ritmo baixo demais — deu ao adversário controle e vantagem posicional",
      "O ritmo estava um pouco alto, a energia caiu no 2º tempo",
      "O ritmo estava um pouco baixo, a sensação de pressão se perdeu",
      "O valor de ritmo estava bom",
    ],
    verdict2crits: (sl) => `Erros críticos em ${sl.join(" e ")} custaram a partida. Seu setup estava longe da tática ideal.`,
    verdict1crit:  (sl, dir, msg) => `${sl} estar ${dir === "high" ? "alto" : "baixo"} demais impactou diretamente o resultado. ${msg}.`,
    verdict2warns: "Vários controles desviaram dos valores ótimos. Pequenos erros somados tiveram um grande impacto.",
    verdict1warn:  (sl) => `O desvio em ${sl} foi o fator decisivo. As demais configurações estavam boas.`,
    verdictOptimal: "Seus valores estavam quase ideais. A derrota pode ter vindo de um fator não tático (sorte, habilidade especial, etc.).",
    verdictDefault: "Seu setup tático foi lógico. A derrota pode ser por diferença de força ou um momento de azar.",
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface ErrorItem {
  level: "critical" | "warning" | "ok";
  sliderKey: SliderKey;
  sliderLabel: string;
  userVal: number;
  optVal: number;
  diff: number;
  msg: string;
}

interface DiagResult {
  score: number;
  errors: ErrorItem[];
  verdict: string;
  optFm: string;
  optP: number; optS: number; optT: number;
  optF: string; optM: string; optD: string;
  winRate: number;
}

// ── Builders ──────────────────────────────────────────────────────────────────
function buildError(key: SliderKey, label: string, userVal: number, optVal: number, lang: Lang): ErrorItem {
  const diff = userVal - optVal;
  const abs  = Math.abs(diff);
  const msgs = S[lang][`${key}Msgs` as "pressureMsgs" | "styleMsgs" | "tempoMsgs"];
  // [critHigh, critLow, warnHigh, warnLow, ok]
  let msg: string;
  if (abs >= 16) msg = diff > 0 ? msgs[0] : msgs[1];
  else if (abs >= 8) msg = diff > 0 ? msgs[2] : msgs[3];
  else msg = msgs[4];
  const level = abs >= 16 ? "critical" : abs >= 8 ? "warning" : "ok";
  return { level, sliderKey: key, sliderLabel: label, userVal, optVal, diff, msg };
}

function buildVerdict(errors: ErrorItem[], str: Str, loc: Loc, lang: Lang): string {
  const L = S[lang];
  const crits = errors.filter(e => e.level === "critical");
  const warns = errors.filter(e => e.level === "warning");
  if (crits.length >= 2) return L.verdict2crits(crits.map(e => e.sliderLabel));
  if (crits.length === 1) {
    const c = crits[0];
    return L.verdict1crit(c.sliderLabel, c.diff > 0 ? "high" : "low", c.msg);
  }
  if (warns.length >= 2) return L.verdict2warns;
  if (warns.length === 1) return L.verdict1warn(warns[0].sliderLabel);
  if (str === "stronger" && loc === "home") return L.verdictOptimal;
  return L.verdictDefault;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function MatchAutopsy() {
  const { isPremium } = usePremium();
  const { lang } = useLang();
  const L = S[lang as Lang] ?? S.en;

  const [loc, setLoc]       = useState<Loc>("home");
  const [str, setStr]       = useState<Str>("stronger");
  const [oppKey, setOppKey] = useState("");
  const [userP, setUserP]   = useState(50);
  const [userS, setUserS]   = useState(50);
  const [userT, setUserT]   = useState(60);
  const [result, setResult] = useState<DiagResult | null>(null);

  const analyze = () => {
    const opt = TD.find(e => e.location === loc && e.strength === str && e.oppKey === oppKey);
    if (!opt) return;
    const errors = [
      buildError("pressure", L.pressureLabel.replace(/^⚡\s*/, ""), userP, opt.p, lang as Lang),
      buildError("style",    L.styleLabel.replace(/^🎨\s*/, ""),    userS, opt.s, lang as Lang),
      buildError("tempo",    L.tempoLabel.replace(/^⏱️\s*/, ""),    userT, opt.t, lang as Lang),
    ];
    const totalDiff = errors.reduce((acc, e) => acc + Math.abs(e.diff), 0);
    const score = Math.max(5, Math.min(96, 100 - Math.round(totalDiff / 2.2)));
    setResult({
      score,
      errors,
      verdict: buildVerdict(errors, str, loc, lang as Lang),
      optFm: opt.fm,
      optP: opt.p, optS: opt.s, optT: opt.t,
      optF: opt.f, optM: opt.m, optD: opt.d,
      winRate: opt.sr,
    });
  };

  const reset = () => { setResult(null); setOppKey(""); setUserP(50); setUserS(50); setUserT(60); };

  const LOC_OPTS = [
    { val: "home" as Loc,  icon: "🏠", label: L.home },
    { val: "away" as Loc,  icon: "✈️", label: L.away },
  ];
  const STR_OPTS = [
    { val: "stronger" as Str, icon: "💪", label: L.stronger, color: "#22c55e" },
    { val: "equal"    as Str, icon: "⚖️",  label: L.equal,    color: "#f59e0b" },
    { val: "weaker"   as Str, icon: "😓", label: L.weaker,   color: "#ef4444" },
  ];
  const SLIDER_ROWS = [
    { label: L.pressureLabel, val: userP, set: setUserP },
    { label: L.styleLabel,    val: userS, set: setUserS },
    { label: L.tempoLabel,    val: userT, set: setUserT },
  ];
  const RESULT_SLIDERS = result ? [
    { label: L.pressureLabel.replace(/^⚡\s*/, ""), val: result.optP, color: "#6366f1" },
    { label: L.styleLabel.replace(/^🎨\s*/, ""),    val: result.optS, color: "#a78bfa" },
    { label: L.tempoLabel.replace(/^⏱️\s*/, ""),    val: result.optT, color: "#22d3ee" },
  ] : [];

  const LEVEL_META = {
    critical: { color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.25)",  label: L.critLabel },
    warning:  { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", label: L.warnLabel },
    ok:       { color: "#22c55e", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.2)",   label: L.okLabel   },
  };

  const scoreColor = result
    ? result.score >= 75 ? "#f59e0b" : "#ef4444"
    : "#6366f1";

  const NumInput = ({ val, set }: { val: number; set: (v: number) => void }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <button onClick={() => set(Math.max(0, val - 1))}
        style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
      <input type="number" min={0} max={100} value={val}
        onChange={e => set(Math.max(0, Math.min(100, Number(e.target.value))))}
        style={{ width: 52, textAlign: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "5px 0", color: "#e2e8f0", fontSize: 15, fontWeight: 800, outline: "none" }} />
      <button onClick={() => set(Math.min(100, val + 1))}
        style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
    </div>
  );

  return (
    <div style={{ padding: "20px 16px 40px", maxWidth: 680, margin: "0 auto" }}>

      <AnimatePresence mode="wait">

        {/* ── INPUT FORM ── */}
        {!result && (
          <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: EASE }}>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 999, padding: "5px 14px", marginBottom: 12 }}>
                <span style={{ fontSize: 12 }}>🔬</span>
                <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#f87171" }}>{L.badge}</span>
              </div>
              <h2 style={{ margin: "0 0 6px", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, color: "#e2e8f0", lineHeight: 1.1 }}>{L.title}</h2>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(148,163,184,0.6)", lineHeight: 1.6 }}>{L.subtitle}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Location */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(148,163,184,0.45)", marginBottom: 8 }}>{L.locLabel}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {LOC_OPTS.map(o => (
                    <button key={o.val} onClick={() => setLoc(o.val)}
                      style={{ flex: 1, padding: "11px 0", borderRadius: 12, cursor: "pointer", fontWeight: 800, fontSize: 13, transition: "all 0.18s",
                        background: loc === o.val ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${loc === o.val ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
                        color: loc === o.val ? "#a5b4fc" : "rgba(148,163,184,0.6)" }}>
                      {o.icon} {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strength */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(148,163,184,0.45)", marginBottom: 8 }}>{L.strLabel}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {STR_OPTS.map(o => (
                    <button key={o.val} onClick={() => setStr(o.val)}
                      style={{ flex: 1, padding: "11px 0", borderRadius: 12, cursor: "pointer", fontWeight: 800, fontSize: 12, transition: "all 0.18s",
                        background: str === o.val ? `${o.color}18` : "rgba(255,255,255,0.03)",
                        border: `1px solid ${str === o.val ? `${o.color}55` : "rgba(255,255,255,0.08)"}`,
                        color: str === o.val ? o.color : "rgba(148,163,184,0.6)" }}>
                      {o.icon} {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opponent formation */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(148,163,184,0.45)", marginBottom: 8 }}>{L.oppLabel}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 7 }}>
                  {OPP_LIST.map(o => (
                    <button key={o.key} onClick={() => setOppKey(o.key)}
                      style={{ padding: "9px 10px", borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                        background: oppKey === o.key ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${oppKey === o.key ? "rgba(239,68,68,0.45)" : "rgba(255,255,255,0.07)"}` }}>
                      <span style={{ fontSize: 11 }}>{o.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: oppKey === o.key ? "#fca5a5" : "rgba(148,163,184,0.7)", marginLeft: 5 }}>{o.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(148,163,184,0.45)", marginBottom: 14 }}>{L.slidersLabel}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {SLIDER_ROWS.map(row => (
                    <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(226,232,240,0.7)", minWidth: 80 }}>{row.label}</span>
                      <NumInput val={row.val} set={row.set} />
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <motion.button
                onClick={analyze}
                disabled={!oppKey}
                whileHover={oppKey ? { scale: 1.02, boxShadow: "0 0 30px rgba(239,68,68,0.35)" } : {}}
                whileTap={oppKey ? { scale: 0.97 } : {}}
                style={{
                  width: "100%", padding: "15px 0", borderRadius: 14, border: "none", cursor: oppKey ? "pointer" : "not-allowed",
                  background: oppKey ? "linear-gradient(135deg,#ef4444,#dc2626)" : "rgba(255,255,255,0.05)",
                  color: oppKey ? "#fff" : "rgba(148,163,184,0.3)",
                  fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em",
                  boxShadow: oppKey ? "0 8px 24px rgba(239,68,68,0.25)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {L.analyzeBtn}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── RESULT ── */}
        {result && (
          <motion.div key="result" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>

            {/* Score header */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05, duration: 0.4, ease: EASE }}
              style={{ background: "rgba(9,11,33,0.9)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 20, padding: "22px 22px 18px", marginBottom: 14, position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#ef4444,#f59e0b,#ef4444)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {/* Score ring */}
                <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
                  <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                    <motion.circle cx="36" cy="36" r="28" fill="none" stroke={scoreColor} strokeWidth="6"
                      strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 28}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - result.score / 100) }}
                      transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
                    />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: scoreColor, lineHeight: 1, fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif" }}>{result.score}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(148,163,184,0.5)", textTransform: "uppercase" }}>{L.scoreWord}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.16em", color: "rgba(239,68,68,0.7)", marginBottom: 4 }}>🔬 {L.badge}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0", lineHeight: 1.3 }}>
                    {result.score >= 80 ? L.scoreGood : result.score >= 55 ? L.scoreWarn : L.scoreBad}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginTop: 4 }}>
                    {LOC_OPTS.find(l => l.val === loc)?.icon} {LOC_OPTS.find(l => l.val === loc)?.label} &nbsp;·&nbsp;
                    {STR_OPTS.find(s => s.val === str)?.icon} {STR_OPTS.find(s => s.val === str)?.label} &nbsp;·&nbsp;
                    {OPP_LIST.find(o => o.key === oppKey)?.icon} {OPP_LIST.find(o => o.key === oppKey)?.label}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Error rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              {result.errors.map((err, i) => {
                const meta = LEVEL_META[err.level];
                return (
                  <motion.div key={err.sliderKey}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.1, duration: 0.38, ease: EASE }}
                    style={{ background: meta.bg, border: `1px solid ${meta.border}`, borderRadius: 14, padding: "14px 16px" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isPremium ? 12 : 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.16em",
                          background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color, borderRadius: 6, padding: "2px 8px" }}>
                          {meta.label}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#e2e8f0" }}>{err.sliderLabel}</span>
                      </div>
                      {!isPremium && (
                        <span style={{ fontSize: 10, color: "rgba(148,163,184,0.35)", fontWeight: 700 }}>{L.vipBadge}</span>
                      )}
                    </div>

                    {isPremium ? (
                      <>
                        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                          {[
                            { label: L.yours,   val: err.userVal, color: err.level === "ok" ? "#22c55e" : "#ef4444" },
                            { label: L.optimal, val: err.optVal,  color: "#22c55e" },
                          ].map(row => (
                            <div key={row.label}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(148,163,184,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{row.label}</span>
                                <span style={{ fontSize: 14, fontWeight: 900, color: row.color, fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif" }}>{row.val}</span>
                              </div>
                              <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${row.val}%` }}
                                  transition={{ duration: 0.9, ease: EASE, delay: 0.3 + i * 0.1 }}
                                  style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${row.color}88,${row.color})` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        {err.level !== "ok" && (
                          <div style={{ marginTop: 10, fontSize: 12, color: "rgba(148,163,184,0.65)", lineHeight: 1.55, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
                            {err.msg}
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ marginTop: 8, height: 42, borderRadius: 8, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 11, color: "rgba(148,163,184,0.3)", fontWeight: 700 }}>{L.vipDetails}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Verdict */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.38, ease: EASE }}
              style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 14, padding: "14px 16px", marginBottom: 14, position: "relative", overflow: "hidden" }}
            >
              <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.16em", color: "#a5b4fc", marginBottom: 8 }}>{L.verdictTitle}</div>
              {isPremium ? (
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "rgba(226,232,240,0.8)" }}>{result.verdict}</p>
              ) : (
                <div style={{ position: "relative" }}>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "rgba(226,232,240,0.8)", filter: "blur(5px)", userSelect: "none" }}>{result.verdict}</p>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(165,180,252,0.8)", background: "rgba(9,11,33,0.85)", borderRadius: 8, padding: "4px 12px", border: "1px solid rgba(99,102,241,0.3)" }}>{L.vipSee}</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Correct tactic */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.38, ease: EASE }}
              style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 14, padding: "14px 16px", marginBottom: 18 }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.16em", color: "#4ade80" }}>{L.correctTitle}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#4ade80", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 999, padding: "2px 10px" }}>
                  {L.winRate(result.winRate)}
                </div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#e2e8f0", fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif", letterSpacing: "0.04em", marginBottom: 12 }}>
                {result.optFm}
              </div>
              {isPremium ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {RESULT_SLIDERS.map((row, i) => (
                    <div key={row.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(148,163,184,0.5)", textTransform: "uppercase" }}>{row.label}</span>
                        <span style={{ fontSize: 15, fontWeight: 900, color: row.color, fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif" }}>{row.val}</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${row.val}%` }}
                          transition={{ duration: 1, ease: EASE, delay: 0.7 + i * 0.1 }}
                          style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${row.color}88,${row.color})` }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {[{ icon: "⚡", val: result.optF }, { icon: "⚙️", val: result.optM }, { icon: "🛡️", val: result.optD }].map(item => (
                      <div key={item.val} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "5px 10px" }}>
                        <span style={{ fontSize: 10 }}>{item.icon}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(148,163,184,0.7)" }}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {RESULT_SLIDERS.map(row => (
                    <div key={row.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(148,163,184,0.5)", textTransform: "uppercase" }}>{row.label}</span>
                        <span style={{ fontSize: 15, fontWeight: 900, color: "rgba(148,163,184,0.2)", fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif", filter: "blur(4px)" }}>??</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                        <div style={{ width: "60%", height: "100%", borderRadius: 99, background: "rgba(255,255,255,0.08)", filter: "blur(2px)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Premium CTA or action buttons */}
            {!isPremium ? (
              <motion.a href={siteConfig.premiumUrl} target="_blank" rel="noreferrer"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px 0", borderRadius: 14, textDecoration: "none",
                  background: "linear-gradient(135deg,#f59e0b,#ef4444)", color: "#fff", fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
                  boxShadow: "0 8px 24px rgba(245,158,11,0.3)" }}>
                {L.vipCta}
              </motion.a>
            ) : (
              <motion.button onClick={reset}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{ width: "100%", padding: "13px 0", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)",
                  color: "rgba(148,163,184,0.7)", fontSize: 13, fontWeight: 800, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {L.newAnalysis}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
