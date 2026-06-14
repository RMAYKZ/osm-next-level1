import { motion, AnimatePresence } from "framer-motion";

type ChatLang = "tr" | "en" | "hu" | "ar" | "pt";
export type StrengthOption = "stronger" | "equal" | "weaker";
export type CampOption = "kamp" | "gizli_antrenman" | "yok";

interface WizardI18n {
  step1Title: string;
  step2Title: string;
  stepLabel: (current: number) => string;
  stronger: string;
  equal: string;
  weaker: string;
  campYes: string;
  secretTrain: string;
  noCamp: string;
}

const WIZARD_I18N: Record<ChatLang, WizardI18n> = {
  tr: {
    step1Title:  "Kadro gücünüzü belirtin:",
    step2Title:  "Rakibin kamp durumu?",
    stepLabel:   (c) => `Adım ${c}/2`,
    stronger:    "💪 Güçlüyüz",
    equal:       "⚖️ Eşitiz",
    weaker:      "🔻 Zayıfız",
    campYes:     "🏕️ Kamp Yaptılar",
    secretTrain: "🕵️ Gizli Antrenman",
    noCamp:      "✅ Kamp Yok",
  },
  en: {
    step1Title:  "How strong is your squad?",
    step2Title:  "Did the opponent have a training camp?",
    stepLabel:   (c) => `Step ${c}/2`,
    stronger:    "💪 We're Stronger",
    equal:       "⚖️ We're Equal",
    weaker:      "🔻 We're Weaker",
    campYes:     "🏕️ Training Camp",
    secretTrain: "🕵️ Secret Training",
    noCamp:      "✅ No Camp",
  },
  hu: {
    step1Title:  "Milyen erős a csapatod?",
    step2Title:  "Volt-e az ellenfélnek edzőtábora?",
    stepLabel:   (c) => `${c}/2. lépés`,
    stronger:    "💪 Mi vagyunk erősebbek",
    equal:       "⚖️ Egyenletesek vagyunk",
    weaker:      "🔻 Gyengébbek vagyunk",
    campYes:     "🏕️ Edzőtábor",
    secretTrain: "🕵️ Titkos Edzés",
    noCamp:      "✅ Nincs Tábor",
  },
  ar: {
    step1Title:  "ما مستوى قوة فريقك؟",
    step2Title:  "هل قام الخصم بمعسكر تدريبي؟",
    stepLabel:   (c) => `الخطوة ${c}/2`,
    stronger:    "💪 نحن أقوى",
    equal:       "⚖️ متكافئون",
    weaker:      "🔻 نحن أضعف",
    campYes:     "🏕️ معسكر تدريبي",
    secretTrain: "🕵️ تدريب سري",
    noCamp:      "✅ لا معسكر",
  },
  pt: {
    step1Title:  "Qual é a força do seu elenco?",
    step2Title:  "O adversário fez pré-temporada?",
    stepLabel:   (c) => `Passo ${c}/2`,
    stronger:    "💪 Somos Mais Fortes",
    equal:       "⚖️ Somos Iguais",
    weaker:      "🔻 Somos Mais Fracos",
    campYes:     "🏕️ Pré-temporada",
    secretTrain: "🕵️ Treino Secreto",
    noCamp:      "✅ Sem Pré-temporada",
  },
};

function WizardButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.025, borderColor: "rgba(139,92,246,0.65)" }}
      whileTap={{ scale: 0.96 }}
      style={{
        width: "100%",
        padding: "10px 14px",
        borderRadius: 12,
        background: "rgba(99,102,241,0.08)",
        border: "1px solid rgba(139,92,246,0.22)",
        color: "#e2e8f0",
        fontSize: 13,
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        transition: "border-color 0.15s, background 0.15s",
        letterSpacing: "0.01em",
      }}
    >
      {label}
    </motion.button>
  );
}

export interface ChatWizardCardProps {
  step: "ask_strength" | "ask_camp";
  lang: string;
  opponentFormation: string;
  location: "home" | "away";
  onStrengthSelect: (s: StrengthOption) => void;
  onCampSelect: (c: CampOption) => void;
}

export default function ChatWizardCard({
  step,
  lang,
  opponentFormation,
  location,
  onStrengthSelect,
  onCampSelect,
}: ChatWizardCardProps) {
  const w = WIZARD_I18N[(lang as ChatLang) in WIZARD_I18N ? (lang as ChatLang) : "en"];
  const currentStep = step === "ask_strength" ? 1 : 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.22 }}
      style={{
        marginTop: 6,
        padding: "14px 14px",
        borderRadius: 16,
        background: "linear-gradient(135deg, rgba(99,102,241,0.11), rgba(139,92,246,0.07))",
        border: "1px solid rgba(139,92,246,0.3)",
        backdropFilter: "blur(14px)",
        boxShadow: "0 4px 24px rgba(99,102,241,0.14), inset 0 1px 0 rgba(255,255,255,0.04)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Step indicator row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          padding: "2px 10px",
          borderRadius: 20,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff",
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: "0.06em",
          flexShrink: 0,
        }}>
          {w.stepLabel(currentStep)}
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {[1, 2].map(n => (
            <motion.div
              key={n}
              animate={{ background: n <= currentStep ? "#8b5cf6" : "rgba(139,92,246,0.18)" }}
              transition={{ duration: 0.3 }}
              style={{ width: 22, height: 3, borderRadius: 2 }}
            />
          ))}
        </div>

        <div style={{ marginLeft: "auto", fontSize: 10.5, color: "#64748b", flexShrink: 0 }}>
          {opponentFormation} {location === "home" ? "🏠" : "✈️"}
        </div>
      </div>

      {/* Question label */}
      <div style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
        {step === "ask_strength" ? w.step1Title : w.step2Title}
      </div>

      {/* Option buttons — animate on step change */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.18 }}
          style={{ display: "flex", flexDirection: "column", gap: 7 }}
        >
          {step === "ask_strength" ? (
            <>
              <WizardButton label={w.stronger}    onClick={() => onStrengthSelect("stronger")} />
              <WizardButton label={w.equal}       onClick={() => onStrengthSelect("equal")} />
              <WizardButton label={w.weaker}      onClick={() => onStrengthSelect("weaker")} />
            </>
          ) : (
            <>
              <WizardButton label={w.campYes}     onClick={() => onCampSelect("kamp")} />
              <WizardButton label={w.secretTrain} onClick={() => onCampSelect("gizli_antrenman")} />
              <WizardButton label={w.noCamp}      onClick={() => onCampSelect("yok")} />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
