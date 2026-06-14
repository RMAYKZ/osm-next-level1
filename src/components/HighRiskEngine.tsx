import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HighRiskTacticsList,
  RefereeColor,
  REFEREE_TACKLING,
  validateHighRiskUsage,
} from "../data/highRiskTactics";
import { useLang } from "../contexts/LanguageContext";

const EASE = [0.16, 1, 0.3, 1] as const;

// ── Localised strings (self-contained — no translation file edits needed) ─────
const S = {
  tr: {
    badge:           "YÜKSEK RİSK ENJİNİ",
    title1:          "Güçlü Rakibe",
    title2:          "Karşı Strateji",
    desc:            "Rakip Çok Güçlü · Hakem Turuncu veya Kırmızı · Hem Ev Hem Deplasman — Ana Meta veritabanından tamamen izole edilmiş özel taktik motoru.",
    scenarioHead:    "Senaryo",
    scenarioText:    "Rakip çok daha güçlü + Hakem Turuncu veya Kırmızı kart eğilimli + Ev veya Deplasman maçı",
    modeOff:         "YÜKSEK RİSK MODU: KAPALI",
    modeOn:          "YÜKSEK RİSK MODU: AÇIK",
    modeHint:        "Motoru aktive etmek için tıkla — Savunma slider değerleri ve Bait & Switch stratejisi devreye girer",
    refTitle:        "Hakem Rengini Seç",
    refOrange:       "Turuncu Hakem",
    refOrangeS:      "Çok Agresif müdahaleye izin verir",
    refRed:          "Kırmızı Hakem",
    refRedS:         "Sadece Agresif müdahale güvenli",
    formTitle:       "Formasyon Seç",
    defensive:       "Savunmacı",
    offensive:       "Ofansif",
    excludedTag:     "YASAK",
    excludedWarn:    "Yüksek Risk Modunda düşük Baskı/Stil değerleriyle kullanılamaz.",
    sliderHead:      "Slider Değerleri",
    pressure:        "Baskı",
    style:           "Stil",
    tempo:           "Tempo",
    tackling:        "Müdahale",
    notesLabel:      "Antrenör Notu",
    // Match Context
    matchCtxLabel:   "UYGULAMA ALANI",
    matchCtxHome:    "✓ Ev Maçı",
    matchCtxAway:    "✓ Deplasman",
    matchCtxDesc:    "Bu strateji hem evde hem deplasmanda güçlü rakiplere karşı tam optimize edilmiştir",
    awayBadge:       "✈ YALNIZCA DEPLASMAN",
    awayOnlyDesc:    "Bu kontra taktik YALNIZCA deplasman maçları için optimize edilmiştir. Ev maçlarında farklı bir strateji kullan.",
    countersVs:      "Karşı",
    // Line Tactics
    ltHead:          "Çizgi Taktikleri",
    ltForwards:      "Forvetler",
    ltForwardsVal:   "Sadece Hücum",
    ltMid:           "Orta Saha",
    ltMidVal:        "Defansa Yardım Et",
    ltDef:           "Defans",
    ltDefVal:        "Geride Kal",
    // Advanced Instructions
    advHead:         "Gelişmiş Talimatlar",
    advOffsideLabel: "Ofsayt Kapanı",
    advOffsideVal:   "Kapalı",
    advMarkingLabel: "Markaj",
    advMarkingVal:   "Alan Markajı",
    // Manager Alert
    alertBadge:      "MANAGER UYARISI",
    alertTitle:      "Bait & Switch — Rakibini Kandır",
    proTrickBadge:   "PRO TRICK",
    proTrickTitle:   "Sağ Gösterip Sol Vurmak",
    step1n:          "1",
    step1h:          "Müdahaleyi NORMAL Ayarla",
    step1b:          "OSM'de müdahaleyi NORMAL olarak ayarla — rakip bunu görür ve saldırıya geçmeye karar verir.",
    step2n:          "2",
    step2h:          "Telefona Alarm Kur",
    step2b:          "Maç başlangıcından tam 1 dakika önce çalacak şekilde telefona alarm kur. Bu adım kritik — atlamayacaksın.",
    step3n:          "3",
    step3h:          "Son 30-60 Saniyede Müdahaleyi Değiştir",
    step3b:          (t: string) => `Alarm çalınca sisteme gir, müdahaleyi ANINDA ${t} olarak değiştir. Rakip bu değişikliği görmeden maç başlar — artık tepki vermesi için çok geç!`,
    footer:          "⚡ Bu taktiği doğru uygularsan rakip hazırlıksız yakalanır ve büyük avantaj elde edersin!",
    tacklingTo:      "Müdahale Geç →",
  },
  en: {
    badge:           "HIGH-RISK ENGINE",
    title1:          "Strategy Against",
    title2:          "Stronger Opponents",
    desc:            "Opponent Significantly Stronger · Referee Orange or Red · Home & Away — Isolated tactical engine, completely separate from the Main Meta database.",
    scenarioHead:    "Scenario",
    scenarioText:    "Opponent is much stronger + Referee tends toward Orange or Red cards + Home or Away match",
    modeOff:         "HIGH-RISK MODE: OFF",
    modeOn:          "HIGH-RISK MODE: ON",
    modeHint:        "Click to activate — Defensive slider ranges and Bait & Switch strategy unlock",
    refTitle:        "Select Referee Color",
    refOrange:       "Orange Referee",
    refOrangeS:      "Allows Very Aggressive tackling",
    refRed:          "Red Referee",
    refRedS:         "Only Aggressive tackling is safe",
    formTitle:       "Select Formation",
    defensive:       "Defensive",
    offensive:       "Offensive",
    excludedTag:     "EXCLUDED",
    excludedWarn:    "Cannot use low Pressure/Style values with this formation in High-Risk Mode.",
    sliderHead:      "Slider Values",
    pressure:        "Pressure",
    style:           "Style",
    tempo:           "Tempo",
    tackling:        "Tackling",
    notesLabel:      "Coach Note",
    // Match Context
    matchCtxLabel:   "MATCH CONTEXT",
    matchCtxHome:    "✓ Home Match",
    matchCtxAway:    "✓ Away Match",
    matchCtxDesc:    "This strategy is fully optimized for BOTH Home and Away matches against stronger teams",
    awayBadge:       "✈ AWAY ONLY",
    awayOnlyDesc:    "This counter-tactic is optimized EXCLUSIVELY for away matches. Use a different strategy for home games.",
    countersVs:      "Counters",
    // Line Tactics
    ltHead:          "Line Tactics",
    ltForwards:      "Forwards",
    ltForwardsVal:   "Attack Only",
    ltMid:           "Midfielders",
    ltMidVal:        "Support Defense",
    ltDef:           "Defenders",
    ltDefVal:        "Stay Back",
    // Advanced Instructions
    advHead:         "Advanced Instructions",
    advOffsideLabel: "Offside Trap",
    advOffsideVal:   "Off",
    advMarkingLabel: "Marking",
    advMarkingVal:   "Zone Marking",
    // Manager Alert
    alertBadge:      "MANAGER ALERT",
    alertTitle:      "Bait & Switch — Trick Your Opponent",
    proTrickBadge:   "PRO TRICK",
    proTrickTitle:   "Hide Your Real Tackling Intensity",
    step1n:          "1",
    step1h:          "Set Tackling to NORMAL",
    step1b:          "Keep your tackling set to Normal on your OSM dashboard so your opponent doesn't counter it. They see this and decide to attack aggressively.",
    step2n:          "2",
    step2h:          "Set A Phone Alarm",
    step2b:          "Set a phone alarm for exactly 1 minute before the simulation kickoff. This step is critical — do not skip it.",
    step3n:          "3",
    step3h:          "Switch 30-60 Seconds Before Kickoff",
    step3b:          (t: string) => `Log in 30-60 seconds before the match starts and INSTANTLY switch tackling to ${t}. Catch them completely off guard — the match starts before they can react!`,
    footer:          "⚡ Execute this correctly and the opponent is caught completely off guard — massive tactical advantage!",
    tacklingTo:      "Switch Tackling →",
  },
  hu: {
    badge:           "MAGAS KOCKÁZATÚ MOTOR",
    title1:          "Stratégia Az Erősebb",
    title2:          "Ellenfél Ellen",
    desc:            "Az ellenfél lényegesen erősebb · A bíró narancssárga/piros · Hazai és Vendég — A fő meta adatbázistól teljesen elkülönített motor.",
    scenarioHead:    "Forgatókönyv",
    scenarioText:    "Az ellenfél sokkal erősebb + a bíró narancssárga/piros hajlamú + hazai vagy vendég meccs",
    modeOff:         "MAGAS KOCKÁZAT: KI",
    modeOn:          "MAGAS KOCKÁZAT: BE",
    modeHint:        "Kattints az aktiváláshoz",
    refTitle:        "Válassz Bírószínt",
    refOrange:       "Narancssárga Bíró",
    refOrangeS:      "Nagyon agresszív párharcot engedélyez",
    refRed:          "Piros Bíró",
    refRedS:         "Csak agresszív párharc biztonságos",
    formTitle:       "Válassz Felállást",
    defensive:       "Védekező",
    offensive:       "Támadó",
    excludedTag:     "TILTOTT",
    excludedWarn:    "Alacsony nyomás/stílus értékek nem engedélyezettek ebben a módban.",
    sliderHead:      "Csúszka Értékek",
    pressure:        "Nyomás",
    style:           "Stílus",
    tempo:           "Tempó",
    tackling:        "Párharcok",
    notesLabel:      "Edző Megjegyzés",
    // Match Context
    matchCtxLabel:   "MECCS TÍPUSA",
    matchCtxHome:    "✓ Hazai Meccs",
    matchCtxAway:    "✓ Vendég Meccs",
    matchCtxDesc:    "Ez a stratégia MINDKÉT helyszínre teljesen optimalizált erősebb ellenfelek ellen",
    awayBadge:       "✈ CSAK VENDÉG",
    awayOnlyDesc:    "Ez az ellenszabály KIZÁRÓLAG vendégmérkőzésekre optimalizált. Hazai meccseken más stratégiát használj.",
    countersVs:      "Ellen",
    // Line Tactics
    ltHead:          "Vonal Taktikák",
    ltForwards:      "Csatárok",
    ltForwardsVal:   "Csak Támadás",
    ltMid:           "Középpályások",
    ltMidVal:        "Védekezés Segítése",
    ltDef:           "Védők",
    ltDefVal:        "Maradj Hátul",
    // Advanced Instructions
    advHead:         "Haladó Utasítások",
    advOffsideLabel: "Offside Csapda",
    advOffsideVal:   "Ki",
    advMarkingLabel: "Jelölés",
    advMarkingVal:   "Zónavédelem",
    // Manager Alert
    alertBadge:      "EDZŐ RIASZTÁS",
    alertTitle:      "Csapda Stratégia — Csapd Csapdába Az Ellenfelet",
    proTrickBadge:   "PRO TRÜKK",
    proTrickTitle:   "Rejtsd El a Valódi Taktikád",
    step1n:          "1",
    step1h:          "Állítsd NORMÁL-ra a Párharcot",
    step1b:          "Az OSM-ben állítsd NORMÁL-ra a párharcot — az ellenfél ezt látja és támadásba lendül.",
    step2n:          "2",
    step2h:          "Állíts Be Ébresztőt",
    step2b:          "Állíts be ébresztőt, hogy pontosan 1 perccel a meccs előtt szóljon. Ez a lépés kritikus — ne hagyd ki.",
    step3n:          "3",
    step3h:          "Váltás az Utolsó 30-60 Másodpercben",
    step3b:          (t: string) => `30-60 másodperccel a meccs előtt lépj be és AZONNAL váltsd ${t}-re a párharcot. Az ellenfél nem tud reagálni — már késő!`,
    footer:          "⚡ Ha sikerül, az ellenfelet teljesen felkészületlenül éred!",
    tacklingTo:      "Párharc Váltás →",
  },
  ar: {
    badge:           "محرك المخاطر العالية",
    title1:          "استراتيجية ضد",
    title2:          "الخصم الأقوى",
    desc:            "الخصم أقوى بكثير · الحكم برتقالي أو أحمر · ملعب رئيسي وخارجه — محرك تكتيكي معزول تماماً عن قاعدة البيانات الرئيسية.",
    scenarioHead:    "السيناريو",
    scenarioText:    "الخصم أقوى بكثير + الحكم يميل للبطاقات البرتقالية أو الحمراء + ملعب رئيسي أو خارجي",
    modeOff:         "وضع المخاطرة: معطل",
    modeOn:          "وضع المخاطرة: مفعّل",
    modeHint:        "انقر للتفعيل",
    refTitle:        "اختر لون الحكم",
    refOrange:       "حكم برتقالي",
    refOrangeS:      "يسمح بالتدخل العدواني جداً",
    refRed:          "حكم أحمر",
    refRedS:         "التدخل العدواني فقط آمن",
    formTitle:       "اختر التشكيل",
    defensive:       "دفاعي",
    offensive:       "هجومي",
    excludedTag:     "محظور",
    excludedWarn:    "لا يمكن استخدام قيم ضغط/أسلوب منخفضة في وضع المخاطرة.",
    sliderHead:      "قيم المنزلقات",
    pressure:        "الضغط",
    style:           "الأسلوب",
    tempo:           "الإيقاع",
    tackling:        "التدخل",
    notesLabel:      "ملاحظة المدرب",
    // Match Context
    matchCtxLabel:   "سياق المباراة",
    matchCtxHome:    "✓ ملعب رئيسي",
    matchCtxAway:    "✓ خارج الملعب",
    matchCtxDesc:    "هذه الاستراتيجية محسّنة بالكامل لكلا الموقعين ضد الفرق الأقوى",
    awayBadge:       "✈ خارج الملعب فقط",
    awayOnlyDesc:    "هذا التكتيك المضاد محسّن حصرياً لمباريات خارج الملعب. استخدم استراتيجية مختلفة في المباريات الرئيسية.",
    countersVs:      "ضد",
    // Line Tactics
    ltHead:          "تكتيكات الخطوط",
    ltForwards:      "المهاجمون",
    ltForwardsVal:   "هجوم فقط",
    ltMid:           "الوسط",
    ltMidVal:        "دعم الدفاع",
    ltDef:           "المدافعون",
    ltDefVal:        "البقاء خلفياً",
    // Advanced Instructions
    advHead:         "تعليمات متقدمة",
    advOffsideLabel: "فخ التسلل",
    advOffsideVal:   "معطل",
    advMarkingLabel: "التغطية",
    advMarkingVal:   "تغطية منطقة",
    // Manager Alert
    alertBadge:      "تنبيه المدير",
    alertTitle:      "استراتيجية الفخ — اخدع خصمك",
    proTrickBadge:   "حيلة احترافية",
    proTrickTitle:   "أخفِ تدخلك الحقيقي",
    step1n:          "١",
    step1h:          "اضبط التدخل على عادي",
    step1b:          "اضبط التدخل على عادي في OSM — الخصم يرى ذلك ويقرر الهجوم بقوة.",
    step2n:          "٢",
    step2h:          "ضع منبهاً على الهاتف",
    step2b:          "ضع منبهاً على هاتفك ليرن قبل دقيقة واحدة تماماً من موعد المباراة. هذه الخطوة حاسمة — لا تتخطاها.",
    step3n:          "٣",
    step3h:          "بدّل في آخر 30-60 ثانية",
    step3b:          (t: string) => `قبل 30-60 ثانية من بداية المباراة ادخل وحوّل التدخل فوراً إلى ${t}. لن يتمكن الخصم من الرد — الوقت قد فات!`,
    footer:          "⚡ نفّذ هذا بشكل صحيح وستفاجئ خصمك تماماً!",
    tacklingTo:      "تغيير التدخل →",
  },
  pt: {
    badge:           "MOTOR DE ALTO RISCO",
    title1:          "Estratégia Contra",
    title2:          "Adversários Mais Fortes",
    desc:            "Adversário Significativamente Mais Forte · Árbitro Laranja ou Vermelho · Casa e Fora — Motor tático completamente isolado da base de dados Meta principal.",
    scenarioHead:    "Cenário",
    scenarioText:    "Adversário muito mais forte + árbitro tende a cartões laranja/vermelhos + jogo em casa ou fora",
    modeOff:         "ALTO RISCO: DESLIGADO",
    modeOn:          "ALTO RISCO: LIGADO",
    modeHint:        "Clique para ativar",
    refTitle:        "Escolha a Cor do Árbitro",
    refOrange:       "Árbitro Laranja",
    refOrangeS:      "Permite carrinho muito agressivo",
    refRed:          "Árbitro Vermelho",
    refRedS:         "Apenas carrinho agressivo é seguro",
    formTitle:       "Escolha a Formação",
    defensive:       "Defensivo",
    offensive:       "Ofensivo",
    excludedTag:     "EXCLUÍDO",
    excludedWarn:    "Não pode usar valores baixos de Pressão/Estilo neste modo.",
    sliderHead:      "Valores dos Sliders",
    pressure:        "Pressão",
    style:           "Estilo",
    tempo:           "Tempo",
    tackling:        "Carrinho",
    notesLabel:      "Nota do Treinador",
    // Match Context
    matchCtxLabel:   "CONTEXTO DO JOGO",
    matchCtxHome:    "✓ Jogo em Casa",
    matchCtxAway:    "✓ Jogo Fora",
    matchCtxDesc:    "Esta estratégia é totalmente otimizada para AMBOS os cenários contra adversários mais fortes",
    awayBadge:       "✈ APENAS FORA",
    awayOnlyDesc:    "Esta contra-tática é otimizada EXCLUSIVAMENTE para jogos fora. Use uma estratégia diferente nos jogos em casa.",
    countersVs:      "Contra",
    // Line Tactics
    ltHead:          "Táticas de Linha",
    ltForwards:      "Avançados",
    ltForwardsVal:   "Apenas Ataque",
    ltMid:           "Médios",
    ltMidVal:        "Apoiar Defesa",
    ltDef:           "Defesas",
    ltDefVal:        "Ficar Atrás",
    // Advanced Instructions
    advHead:         "Instruções Avançadas",
    advOffsideLabel: "Armadilha de Impedimento",
    advOffsideVal:   "Desligado",
    advMarkingLabel: "Marcação",
    advMarkingVal:   "Marcação por Zona",
    // Manager Alert
    alertBadge:      "ALERTA DO TREINADOR",
    alertTitle:      "Isca & Troca — Engane Seu Adversário",
    proTrickBadge:   "DICA PRO",
    proTrickTitle:   "Esconda Seu Carrinho Real",
    step1n:          "1",
    step1h:          "Defina o Carrinho como NORMAL",
    step1b:          "Mantenha o carrinho em NORMAL no seu painel OSM — o adversário vê isso e decide atacar.",
    step2n:          "2",
    step2h:          "Defina um Alarme no Telemóvel",
    step2b:          "Defina um alarme para tocar exatamente 1 minuto antes do apito. Esta etapa é crítica — não a ignore.",
    step3n:          "3",
    step3h:          "Troque nos Últimos 30-60 Segundos",
    step3b:          (t: string) => `30-60 segundos antes do início, entre e mude IMEDIATAMENTE o carrinho para ${t}. O adversário não terá tempo de reagir!`,
    footer:          "⚡ Execute isso corretamente e o adversário é pego totalmente desprevenido!",
    tacklingTo:      "Mudar Carrinho →",
  },
} as const;

type LangStrings = typeof S.tr;

// ── SliderRangeBar ────────────────────────────────────────────────────────────

function SliderRangeBar({ label, range, color }: {
  label: string;
  range: { min: number; max: number; recommended: number };
  color: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{
          fontSize: 10, fontWeight: 900, textTransform: "uppercase",
          letterSpacing: "0.14em", color: "rgba(148,163,184,0.5)",
        }}>{label}</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 10, color: "rgba(100,116,139,0.5)" }}>
            {range.min} – {range.max}
          </span>
          <span style={{ fontSize: 26, fontWeight: 900, color, letterSpacing: "-0.02em", lineHeight: 1 }}>
            {range.recommended}
          </span>
        </div>
      </div>

      {/* Track */}
      <div style={{ position: "relative", height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
        {/* Valid range band */}
        <motion.div
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.75, ease: EASE, delay: 0.1 }}
          style={{
            position: "absolute", top: 0, bottom: 0, borderRadius: 99,
            left: `${range.min}%`, right: `${100 - range.max}%`,
            background: `linear-gradient(90deg, ${color}44, ${color}cc)`,
            transformOrigin: "left",
          }}
        />
        {/* Recommended dot */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.38, ease: EASE, delay: 0.55 }}
          style={{
            position: "absolute", top: "50%", left: `${range.recommended}%`,
            transform: "translate(-50%, -50%)",
            width: 14, height: 14, borderRadius: "50%",
            background: color, border: "2px solid rgba(9,11,33,0.95)",
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(100,116,139,0.45)" }}>
        <span>min {range.min}</span>
        <span style={{ color, fontWeight: 900, fontSize: 10 }}>⚡ {range.recommended}</span>
        <span>max {range.max}</span>
      </div>
    </div>
  );
}

// ── ManagerAlert (Bait & Switch) ──────────────────────────────────────────────

function ManagerAlert({ tackling, s }: { tackling: string; s: LangStrings }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ duration: 0.45, ease: EASE }}
      style={{
        position: "relative", overflow: "hidden",
        background: "rgba(9,11,33,0.96)",
        border: "1px solid rgba(239,68,68,0.35)",
        borderRadius: 22,
        padding: "clamp(20px,4vw,36px) clamp(20px,4vw,36px) clamp(20px,4vw,36px) clamp(28px,5vw,44px)",
        boxShadow: "0 0 50px rgba(239,68,68,0.12), 0 0 100px rgba(239,68,68,0.05)",
      }}
    >
      {/* Pulsing outer ring */}
      <motion.div
        animate={{ opacity: [0.2, 0.7, 0.2] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        style={{
          position: "absolute", inset: 0, borderRadius: 22,
          border: "1px solid rgba(239,68,68,0.55)",
          pointerEvents: "none",
        }}
      />

      {/* Danger stripe (left edge) */}
      <motion.div
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 5, borderRadius: "22px 0 0 22px",
          background: "linear-gradient(180deg, #ef4444 0%, #f59e0b 50%, #ef4444 100%)",
        }}
      />

      {/* Shimmer */}
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ repeat: Infinity, repeatDelay: 4.5, duration: 0.8, ease: "easeInOut" }}
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(105deg, transparent 35%, rgba(239,68,68,0.05) 50%, transparent 65%)",
          transform: "skewX(-12deg)",
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 28 }}>
        <motion.span
          animate={{ rotate: [0, -12, 12, -6, 0] }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ fontSize: 30, flexShrink: 0, lineHeight: 1 }}
        >🚨</motion.span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{
              fontSize: 9, fontWeight: 900, textTransform: "uppercase",
              letterSpacing: "0.22em", color: "#ef4444",
            }}>
              {s.alertBadge}
            </span>
            <span style={{
              fontSize: 9, fontWeight: 900, textTransform: "uppercase",
              letterSpacing: "0.2em", color: "#f59e0b",
              background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.35)",
              borderRadius: 6, padding: "2px 8px",
            }}>
              {s.proTrickBadge}
            </span>
          </div>
          <div style={{
            fontSize: "clamp(1rem,2.5vw,1.5rem)", fontWeight: 900, lineHeight: 1.2,
            color: "#ef4444",
            marginBottom: 4,
          }}>
            {s.alertTitle}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(245,158,11,0.75)", fontStyle: "italic" }}>
            {s.proTrickTitle}
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 22 }}>

        {/* Step 1 */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{
            width: 30, height: 30, flexShrink: 0, borderRadius: "50%",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.14)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 900, color: "rgba(226,232,240,0.7)",
          }}>{s.step1n}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#e2e8f0", marginBottom: 5 }}>
              {s.step1h}
            </div>
            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.7, color: "rgba(148,163,184,0.68)" }}>
              {s.step1b}
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{
            width: 30, height: 30, flexShrink: 0, borderRadius: "50%",
            background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 900, color: "#f59e0b",
          }}>{s.step2n}</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: "#f59e0b" }}>{s.step2h}</span>
              <motion.span
                animate={{ rotate: [0, -15, 15, -8, 0] }}
                transition={{ duration: 0.5, delay: 1.2, repeat: Infinity, repeatDelay: 5 }}
                style={{ fontSize: 16 }}
              >⏰</motion.span>
            </div>
            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.7, color: "rgba(148,163,184,0.68)" }}>
              {s.step2b}
            </p>
          </div>
        </div>

        {/* Step 3 — highlighted box */}
        <div style={{
          background: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(245,158,11,0.06))",
          border: "1px solid rgba(239,68,68,0.28)",
          borderRadius: 16, padding: "16px 18px",
          display: "flex", gap: 14, alignItems: "flex-start",
        }}>
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 30, height: 30, flexShrink: 0, borderRadius: "50%",
              background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 900, color: "#ef4444",
            }}
          >{s.step3n}</motion.div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: "#ef4444" }}>{s.step3h}</span>
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 1.2 }}
                style={{ fontSize: 16 }}
              >⚡</motion.span>
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 12.5, lineHeight: 1.7, color: "rgba(226,232,240,0.82)" }}>
              {s.step3b(tackling)}
            </p>
            {/* Tackling badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "rgba(239,68,68,0.14)", border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: 10, padding: "7px 16px",
            }}>
              <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(239,68,68,0.7)" }}>
                {s.tacklingTo}
              </span>
              <motion.span
                animate={{ color: ["#ef4444", "#f97316", "#ef4444"] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: 16, fontWeight: 900 }}
              >
                {tackling}
              </motion.span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)",
        borderRadius: 12, padding: "10px 16px",
        fontSize: 12, fontWeight: 700, color: "#f59e0b", textAlign: "center",
        letterSpacing: "0.02em",
      }}>
        {s.footer}
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function HighRiskEngine() {
  const { lang } = useLang();
  const s: LangStrings = (S as unknown as Record<string, LangStrings>)[lang] ?? S.en;

  const [highRiskMode, setHighRiskMode] = useState(false);
  const [referee, setReferee] = useState<RefereeColor | null>(null);
  const [activeTacticId, setActiveTacticId] = useState<string | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const activeTactic = HighRiskTacticsList.find(t => t.id === activeTacticId) ?? null;
  const isDefensive = activeTactic?.category === "defensive";
  const isOffensive = activeTactic?.category === "offensive";
  const showAlert = highRiskMode && isDefensive && referee !== null;

  const tacklingLabel = referee
    ? ((REFEREE_TACKLING[referee] as unknown as Record<string, string>)[lang] ?? REFEREE_TACKLING[referee].en)
    : null;

  // Validate offensive formation selection
  const validationResult = activeTactic && highRiskMode
    ? validateHighRiskUsage(activeTactic.formation, activeTactic.pressure.recommended, activeTactic.style.recommended)
    : { valid: true };

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        alertRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [showAlert, activeTacticId]);

  const toggleMode = () => {
    setHighRiskMode(prev => !prev);
    if (highRiskMode) {
      setReferee(null);
      setActiveTacticId(null);
    }
  };

  return (
    <section
      id="yuksek-risk"
      style={{ position: "relative", overflow: "hidden", padding: "clamp(48px,7vw,96px) 0" }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.55), rgba(245,158,11,0.3), transparent)",
        }} />
        <motion.div
          animate={{ opacity: [0.18, 0.45, 0.18] }}
          transition={{ duration: 6, repeat: Infinity }}
          style={{
            position: "absolute", top: "5%", right: "-8%",
            width: "45%", height: "60%", borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(239,68,68,0.12) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div style={{
          position: "absolute", bottom: "15%", left: "-5%",
          width: "30%", height: "45%", borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(245,158,11,0.07) 0%, transparent 70%)",
          filter: "blur(80px)",
        }} />
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ marginBottom: 32, textAlign: "center" }}
        >
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.35)",
            borderRadius: 999, padding: "5px 16px", marginBottom: 16,
          }}>
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              style={{ fontSize: 11 }}
            >⚠️</motion.span>
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "#ef4444" }}>
              {s.badge}
            </span>
          </div>

          <h2 style={{ margin: "0 0 12px", fontSize: "clamp(1.8rem,4vw,3.2rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            <span style={{ color: "#e2e8f0" }}>{s.title1} </span>
            <span style={{ color: "#ef4444" }}>{s.title2}</span>
          </h2>
          <p style={{ margin: "0 auto", maxWidth: 620, fontSize: 14, color: "rgba(148,163,184,0.65)", lineHeight: 1.7 }}>
            {s.desc}
          </p>
        </motion.div>

        {/* ── Scenario info strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1, ease: EASE }}
          style={{
            background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)",
            borderRadius: 14, padding: "12px 20px", marginBottom: 28,
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(239,68,68,0.7)", flexShrink: 0 }}>
            {s.scenarioHead}
          </span>
          <span style={{ fontSize: 12, color: "rgba(148,163,184,0.7)", lineHeight: 1.5 }}>
            {s.scenarioText}
          </span>
        </motion.div>

        {/* ── Mode toggle ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.15, ease: EASE }}
          style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}
        >
          <motion.button
            onClick={toggleMode}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "flex", alignItems: "center", gap: 18,
              background: highRiskMode
                ? "linear-gradient(135deg, rgba(239,68,68,0.18), rgba(245,158,11,0.08))"
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${highRiskMode ? "rgba(239,68,68,0.45)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 18, padding: "15px 28px", cursor: "pointer",
              boxShadow: highRiskMode ? "0 0 28px rgba(239,68,68,0.18)" : "none",
              transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
            }}
          >
            {/* Toggle pill */}
            <div style={{
              width: 46, height: 26, borderRadius: 99, flexShrink: 0, position: "relative",
              background: highRiskMode ? "#ef4444" : "rgba(255,255,255,0.09)",
              transition: "background 0.25s",
              boxShadow: highRiskMode ? "0 0 12px rgba(239,68,68,0.5)" : "none",
            }}>
              <motion.div
                animate={{ x: highRiskMode ? 22 : 2 }}
                transition={{ duration: 0.22, ease: EASE }}
                style={{
                  position: "absolute", top: 3, width: 20, height: 20, borderRadius: "50%",
                  background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                }}
              />
            </div>
            <div>
              <div style={{
                fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em",
                color: highRiskMode ? "#ef4444" : "rgba(148,163,184,0.65)",
                transition: "color 0.2s",
              }}>
                {highRiskMode ? s.modeOn : s.modeOff}
              </div>
              <div style={{ fontSize: 11, color: "rgba(100,116,139,0.55)", marginTop: 3, maxWidth: 340 }}>
                {s.modeHint}
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* ── Mode content ── */}
        <AnimatePresence>
          {highRiskMode && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: EASE }}
              style={{ display: "flex", flexDirection: "column", gap: 28 }}
            >

              {/* ── Referee selector ── */}
              <div>
                <div style={{ marginBottom: 14, textAlign: "center" }}>
                  <span style={{
                    fontSize: 10, fontWeight: 900, textTransform: "uppercase",
                    letterSpacing: "0.2em", color: "rgba(148,163,184,0.4)",
                  }}>{s.refTitle}</span>
                </div>
                <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                  {(["orange", "red"] as const).map((color) => {
                    const isOrange = color === "orange";
                    const isSelected = referee === color;
                    const accent = isOrange ? "#f97316" : "#ef4444";
                    const accentAlpha = isOrange ? "rgba(249,115,22" : "rgba(239,68,68";
                    return (
                      <motion.button
                        key={color}
                        onClick={() => setReferee(color)}
                        whileHover={{ y: -4, transition: { duration: 0.16 } }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                          display: "flex", alignItems: "center", gap: 16,
                          background: isSelected ? `${accentAlpha},0.14)` : "rgba(9,11,33,0.88)",
                          border: `1px solid ${isSelected ? `${accentAlpha},0.5)` : "rgba(255,255,255,0.08)"}`,
                          backdropFilter: "blur(16px)",
                          WebkitBackdropFilter: "blur(16px)",
                          borderRadius: 18, padding: "14px 22px", cursor: "pointer",
                          minWidth: 220, textAlign: "left",
                          boxShadow: isSelected ? `0 0 22px ${accentAlpha},0.18)` : "none",
                          transition: "all 0.22s",
                        }}
                      >
                        {/* Referee card shape */}
                        <div style={{
                          width: 26, height: 38, flexShrink: 0, borderRadius: 4,
                          background: `linear-gradient(160deg, ${accent}, ${isOrange ? "#ea580c" : "#dc2626"})`,
                          boxShadow: `3px 3px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.18)`,
                          border: "1px solid rgba(255,255,255,0.12)",
                          transform: "rotate(-5deg)",
                        }} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 900, color: isSelected ? accent : "#e2e8f0", marginBottom: 3 }}>
                            {isOrange ? s.refOrange : s.refRed}
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(148,163,184,0.55)" }}>
                            {isOrange ? s.refOrangeS : s.refRedS}
                          </div>
                          {isSelected && (
                            <div style={{
                              marginTop: 6, fontSize: 10, fontWeight: 900,
                              textTransform: "uppercase", letterSpacing: "0.12em", color: accent,
                            }}>
                              {s.tackling}: {tacklingLabel}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                              marginLeft: "auto", width: 20, height: 20, borderRadius: "50%",
                              background: accent,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 10, color: "#fff", fontWeight: 900, flexShrink: 0,
                            }}
                          >✓</motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* ── Formation grid ── */}
              <div>
                <div style={{ marginBottom: 14, textAlign: "center" }}>
                  <span style={{
                    fontSize: 10, fontWeight: 900, textTransform: "uppercase",
                    letterSpacing: "0.2em", color: "rgba(148,163,184,0.4)",
                  }}>{s.formTitle}</span>
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 180px), 1fr))",
                  gap: 12,
                }}>
                  {HighRiskTacticsList.map((tactic, i) => {
                    const isSelected = activeTacticId === tactic.id;
                    const isExcluded = tactic.category === "offensive";
                    const isAway = !!tactic.awayOnly;

                    return (
                      <motion.button
                        key={tactic.id}
                        onClick={() => setActiveTacticId(isSelected ? null : tactic.id)}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.055, ease: EASE }}
                        whileHover={{ y: -3, transition: { duration: 0.15 } }}
                        whileTap={{ scale: 0.96 }}
                        style={{
                          position: "relative", overflow: "hidden",
                          background: isSelected
                            ? isExcluded ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.13)"
                            : "rgba(9,11,33,0.88)",
                          border: isSelected
                            ? `1px solid rgba(239,68,68,${isExcluded ? "0.28" : "0.5"})`
                            : isExcluded
                            ? "1px dashed rgba(255,255,255,0.07)"
                            : isAway
                            ? "1px solid rgba(34,211,238,0.22)"
                            : "1px solid rgba(255,255,255,0.08)",
                          backdropFilter: "blur(16px)",
                          WebkitBackdropFilter: "blur(16px)",
                          borderRadius: 16, padding: "14px 14px 12px",
                          cursor: "pointer", textAlign: "left",
                          opacity: isExcluded ? 0.6 : 1,
                          boxShadow: isSelected && !isExcluded ? "0 0 18px rgba(239,68,68,0.14)" : "none",
                          transition: "background 0.2s, border-color 0.2s, opacity 0.2s, box-shadow 0.2s",
                        }}
                      >
                        {/* Away-only badge */}
                        {isAway && (
                          <div style={{
                            position: "absolute", top: 7, left: 7,
                            background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.3)",
                            borderRadius: 5, padding: "2px 6px",
                            fontSize: 7, fontWeight: 900, textTransform: "uppercase",
                            letterSpacing: "0.1em", color: "#22d3ee",
                          }}>
                            ✈ AWAY
                          </div>
                        )}

                        {/* Excluded badge */}
                        {isExcluded && (
                          <div style={{
                            position: "absolute", top: 7, right: 7,
                            background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.28)",
                            borderRadius: 5, padding: "2px 6px",
                            fontSize: 8, fontWeight: 900, textTransform: "uppercase",
                            letterSpacing: "0.1em", color: "#f87171",
                          }}>
                            {s.excludedTag}
                          </div>
                        )}

                        <div style={{ fontSize: 20, marginBottom: 8, marginTop: isAway ? 14 : 0 }}>{tactic.emoji}</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: 11, fontFamily: "monospace", fontWeight: 900, letterSpacing: "0.06em",
                            color: isSelected ? "#ef4444" : "#22d3ee",
                          }}>{tactic.formation}</span>
                          {tactic.countersFormation && (
                            <span style={{
                              fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em",
                              color: "rgba(249,115,22,0.8)",
                              background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)",
                              borderRadius: 4, padding: "1px 5px",
                            }}>
                              {s.countersVs} {tactic.countersFormation}
                            </span>
                          )}
                        </div>
                        <div style={{
                          fontSize: 12, fontWeight: 800, color: "#e2e8f0",
                          lineHeight: 1.25, marginBottom: 5,
                        }}>
                          {lang === "en" ? tactic.nameEn : tactic.name}
                        </div>
                        <div style={{
                          fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
                          color: isExcluded ? "rgba(239,68,68,0.5)" : "rgba(52,211,153,0.65)",
                        }}>
                          {isExcluded ? s.offensive : s.defensive}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* ── Detail panel ── */}
              <AnimatePresence mode="wait">
                {activeTactic && (
                  <motion.div
                    key={activeTactic.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    style={{ display: "flex", flexDirection: "column", gap: 18 }}
                  >

                    {/* Validation error (offensive) */}
                    {isOffensive && !validationResult.valid && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                          background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.28)",
                          borderRadius: 16, padding: "16px 20px",
                          display: "flex", gap: 14, alignItems: "flex-start",
                        }}
                      >
                        <span style={{ fontSize: 22, flexShrink: 0 }}>🚫</span>
                        <div>
                          <div style={{
                            fontSize: 11, fontWeight: 900, textTransform: "uppercase",
                            letterSpacing: "0.16em", color: "#ef4444", marginBottom: 6,
                          }}>{s.excludedTag}</div>
                          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: "rgba(226,232,240,0.72)" }}>
                            {s.excludedWarn}
                          </p>
                          <p style={{ margin: "8px 0 0", fontSize: 12, lineHeight: 1.6, color: "rgba(148,163,184,0.55)" }}>
                            {lang === "en" ? activeTactic.notesEn : activeTactic.notes}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Slider panel (defensive only) */}
                    {isDefensive && (
                      <div style={{
                        background: "rgba(9,11,33,0.92)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: "1px solid rgba(239,68,68,0.18)",
                        borderRadius: 20, padding: "clamp(18px,3.5vw,30px)",
                      }}>
                        {/* Panel header */}
                        <div style={{
                          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                          marginBottom: 24, gap: 14, flexWrap: "wrap",
                        }}>
                          <div>
                            <div style={{
                              fontSize: 9, fontWeight: 900, textTransform: "uppercase",
                              letterSpacing: "0.2em", color: "rgba(148,163,184,0.4)", marginBottom: 5,
                            }}>{s.sliderHead}</div>
                            {activeTactic.awayOnly && (
                              <motion.div
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{
                                  display: "inline-flex", alignItems: "center", gap: 5,
                                  background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.32)",
                                  borderRadius: 7, padding: "3px 10px", marginBottom: 8,
                                }}
                              >
                                <span style={{
                                  fontSize: 9, fontWeight: 900, textTransform: "uppercase",
                                  letterSpacing: "0.14em", color: "#22d3ee",
                                }}>{s.awayBadge}</span>
                              </motion.div>
                            )}
                            <div style={{ fontSize: 17, fontWeight: 900, color: "#e2e8f0", letterSpacing: "-0.01em" }}>
                              <span style={{ fontFamily: "monospace", color: "#22d3ee" }}>{activeTactic.formation}</span>
                              {activeTactic.countersFormation && (
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#f97316" }}>
                                  {" "}vs {activeTactic.countersFormation}
                                </span>
                              )}
                              {" · "}{lang === "en" ? activeTactic.nameEn : activeTactic.name}
                            </div>
                          </div>
                          {tacklingLabel && (
                            <div style={{
                              display: "flex", alignItems: "center", gap: 8,
                              background: referee === "orange" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
                              border: `1px solid ${referee === "orange" ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)"}`,
                              borderRadius: 12, padding: "8px 16px",
                            }}>
                              <span style={{
                                fontSize: 9, fontWeight: 900, textTransform: "uppercase",
                                letterSpacing: "0.14em", color: "rgba(148,163,184,0.5)",
                              }}>{s.tackling}</span>
                              <span style={{
                                fontSize: 15, fontWeight: 900,
                                color: referee === "orange" ? "#f59e0b" : "#ef4444",
                              }}>{tacklingLabel}</span>
                            </div>
                          )}
                        </div>

                        {/* Slider bars */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 22 }}>
                          <SliderRangeBar label={s.pressure} range={activeTactic.pressure} color="#ef4444" />
                          <SliderRangeBar label={s.style}    range={activeTactic.style}    color="#f59e0b" />
                          <SliderRangeBar label={s.tempo}    range={activeTactic.tempo}    color="#22d3ee" />
                        </div>

                        {/* Notes */}
                        <div style={{
                          paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.06)",
                        }}>
                          <div style={{
                            fontSize: 9, fontWeight: 900, textTransform: "uppercase",
                            letterSpacing: "0.18em", color: "rgba(148,163,184,0.35)", marginBottom: 8,
                          }}>{s.notesLabel}</div>
                          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: "rgba(148,163,184,0.68)" }}>
                            {lang === "en" ? activeTactic.notesEn : activeTactic.notes}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Line Tactics + Advanced Instructions + Match Context */}
                    {isDefensive && (
                      <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,260px),1fr))",
                          gap: 14,
                        }}
                      >
                        {/* Line Tactics card */}
                        <div style={{
                          background: "rgba(9,11,33,0.88)",
                          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                          border: "1px solid rgba(34,211,238,0.14)",
                          borderRadius: 18, padding: "20px 22px",
                        }}>
                          <div style={{
                            fontSize: 9, fontWeight: 900, textTransform: "uppercase",
                            letterSpacing: "0.2em", color: "rgba(34,211,238,0.5)", marginBottom: 16,
                          }}>{s.ltHead}</div>
                          {[
                            { role: s.ltForwards, val: s.ltForwardsVal, accent: "#a78bfa" },
                            { role: s.ltMid,      val: s.ltMidVal,      accent: "#22d3ee" },
                            { role: s.ltDef,      val: s.ltDefVal,      accent: "#34d399" },
                          ].map((row, i) => (
                            <div key={i} style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              padding: "9px 0",
                              borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
                            }}>
                              <span style={{ fontSize: 12, color: "rgba(148,163,184,0.6)", fontWeight: 600 }}>
                                {row.role}
                              </span>
                              <span style={{
                                fontSize: 11, fontWeight: 900, color: row.accent,
                                background: `${row.accent}18`,
                                border: `1px solid ${row.accent}30`,
                                borderRadius: 7, padding: "3px 10px",
                                textAlign: "right",
                              }}>
                                {row.val}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Advanced Instructions card */}
                        <div style={{
                          background: "rgba(9,11,33,0.88)",
                          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                          border: "1px solid rgba(245,158,11,0.14)",
                          borderRadius: 18, padding: "20px 22px",
                        }}>
                          <div style={{
                            fontSize: 9, fontWeight: 900, textTransform: "uppercase",
                            letterSpacing: "0.2em", color: "rgba(245,158,11,0.5)", marginBottom: 16,
                          }}>{s.advHead}</div>
                          {[
                            { label: s.advOffsideLabel, val: s.advOffsideVal, accent: "#ef4444" },
                            { label: s.advMarkingLabel,  val: s.advMarkingVal,  accent: "#f59e0b" },
                          ].map((row, i) => (
                            <div key={i} style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              padding: "9px 0",
                              borderBottom: i < 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                            }}>
                              <span style={{ fontSize: 12, color: "rgba(148,163,184,0.6)", fontWeight: 600 }}>
                                {row.label}
                              </span>
                              <span style={{
                                fontSize: 11, fontWeight: 900, color: row.accent,
                                background: `${row.accent}18`,
                                border: `1px solid ${row.accent}30`,
                                borderRadius: 7, padding: "3px 10px",
                              }}>
                                {row.val}
                              </span>
                            </div>
                          ))}

                          {/* Match context — conditional: Away-only or Home+Away */}
                          <div style={{
                            marginTop: 16, paddingTop: 14,
                            borderTop: "1px solid rgba(255,255,255,0.05)",
                          }}>
                            <div style={{
                              fontSize: 9, fontWeight: 900, textTransform: "uppercase",
                              letterSpacing: "0.18em", color: "rgba(148,163,184,0.35)", marginBottom: 10,
                            }}>{s.matchCtxLabel}</div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                              {activeTactic.awayOnly ? (
                                <>
                                  <span style={{
                                    fontSize: 11, fontWeight: 900, color: "#34d399",
                                    background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)",
                                    borderRadius: 7, padding: "4px 10px",
                                  }}>{s.matchCtxAway}</span>
                                  <span style={{
                                    fontSize: 11, fontWeight: 900, color: "#f97316",
                                    background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.28)",
                                    borderRadius: 7, padding: "4px 10px",
                                  }}>{s.awayBadge}</span>
                                </>
                              ) : (
                                [s.matchCtxHome, s.matchCtxAway].map((badge, i) => (
                                  <span key={i} style={{
                                    fontSize: 11, fontWeight: 900,
                                    color: i === 0 ? "#22d3ee" : "#34d399",
                                    background: i === 0 ? "rgba(34,211,238,0.1)" : "rgba(52,211,153,0.1)",
                                    border: `1px solid ${i === 0 ? "rgba(34,211,238,0.25)" : "rgba(52,211,153,0.25)"}`,
                                    borderRadius: 7, padding: "4px 10px",
                                  }}>{badge}</span>
                                ))
                              )}
                            </div>
                            <p style={{ margin: 0, fontSize: 11, lineHeight: 1.55, color: "rgba(100,116,139,0.6)" }}>
                              {activeTactic.awayOnly ? s.awayOnlyDesc : s.matchCtxDesc}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Manager Alert */}
                    {showAlert && tacklingLabel && (
                      <div ref={alertRef}>
                        <ManagerAlert tackling={tacklingLabel} s={s} />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
