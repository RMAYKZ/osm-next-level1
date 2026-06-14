import { useState } from "react";
import { motion } from "framer-motion";
import type { TacticCardData } from "../services/aiChat";
import { useLang } from "../contexts/LanguageContext";

// ── Official OSM line-tactic vocabulary — all 5 languages ────────────────────

const FWD_LABELS: Record<string, Record<string, string>> = {
  tr: { attack_only: "Sadece Hücum",  attack_and_defend: "Hücum + Savunma",      wide_play: "Geniş Oyna"         },
  en: { attack_only: "Attack Only",   attack_and_defend: "Attack and Defend",     wide_play: "Wide Play"          },
  hu: { attack_only: "Csak Támadás",  attack_and_defend: "Támadás + Védekezés",   wide_play: "Széles Játék"       },
  ar: { attack_only: "الهجوم فقط",    attack_and_defend: "هجوم + دفاع",           wide_play: "اللعب الواسع"       },
  pt: { attack_only: "Apenas Atacar", attack_and_defend: "Atacar e Defender",     wide_play: "Jogo Amplo"         },
};

const MID_LABELS: Record<string, Record<string, string>> = {
  tr: { protect_defense: "Defansa Yardım",      stay_in_position: "Pozisyonu Koru",     attack_and_defend: "Hücum + Savunma"    },
  en: { protect_defense: "Protect the Defense", stay_in_position: "Stay in Position",   attack_and_defend: "Attack and Defend"  },
  hu: { protect_defense: "Védelmet Segít",       stay_in_position: "Tartsd a Pozíciót", attack_and_defend: "Támadás + Védekezés"},
  ar: { protect_defense: "حماية الدفاع",          stay_in_position: "ابق في الموضع",      attack_and_defend: "هجوم + دفاع"        },
  pt: { protect_defense: "Proteger a Defesa",    stay_in_position: "Manter Posição",    attack_and_defend: "Atacar e Defender"  },
};

const DEF_LABELS: Record<string, Record<string, string>> = {
  tr: { deep_protection: "Derin Savunma",       defend_deep: "Geride Kal",               high_line: "Yüksek Hat"              },
  en: { deep_protection: "Deep Protection",     defend_deep: "Defend Deep",              high_line: "High Line"               },
  hu: { deep_protection: "Mély Védelem",        defend_deep: "Mélyen Védekezz",          high_line: "Magas Vonal"             },
  ar: { deep_protection: "حماية عميقة",          defend_deep: "الدفاع العميق",             high_line: "الخط العالي"             },
  pt: { deep_protection: "Defesa Profunda",     defend_deep: "Defender Profundamente",   high_line: "Linha Alta"              },
};

// ── Play style, location, field labels ───────────────────────────────────────

const PLAY_STYLE_LABELS: Record<string, Record<string, string>> = {
  tr: { shoot_on_sight: "Kaleyi Görünce Vur", wing_play: "Kanat Oyunu",           passing_game: "Pas Oyunu",     counter_attack: "Kontr Atak",    long_ball: "Uzun Top"       },
  en: { shoot_on_sight: "Shoot on Sight",     wing_play: "Wing Play",             passing_game: "Passing Game",  counter_attack: "Counter Attack", long_ball: "Long Ball"      },
  hu: { shoot_on_sight: "Látványra lőj",      wing_play: "Szárny játék",          passing_game: "Passzjáték",    counter_attack: "Kontra",         long_ball: "Hosszú labda"   },
  ar: { shoot_on_sight: "اطلق النار فور الرؤية", wing_play: "لعب الجناح",        passing_game: "لعبة التمرير", counter_attack: "هجمة مرتدة",    long_ball: "كرة طويلة"     },
  pt: { shoot_on_sight: "Chutar de Longe",    wing_play: "Jogo pelas Laterais",   passing_game: "Jogo de Passe", counter_attack: "Contra-Ataque",  long_ball: "Bola Longa"     },
};

const LOCATION_LABELS: Record<string, Record<string, string>> = {
  tr: { home: "Ev",      away: "Deplasman",     unknown: "—" },
  en: { home: "Home",    away: "Away",           unknown: "—" },
  hu: { home: "Hazai",   away: "Vendég",         unknown: "—" },
  ar: { home: "ملعبنا", away: "ملعب الخصم",    unknown: "—" },
  pt: { home: "Casa",    away: "Fora",           unknown: "—" },
};

const LINE_LABELS: Record<string, {
  fwd: string; mid: string; def: string;
  offside: string; offsideYes: string; offsideNo: string;
  marking: string; markingMan: string; markingZonal: string;
}> = {
  tr: { fwd: "Forvetler",    mid: "Orta Sahalar",   def: "Defanslar",  offside: "Ofsayt Tuzağı",              offsideYes: "Evet",       offsideNo: "Hayır",     marking: "Markaj",     markingMan: "Bireysel",    markingZonal: "Bölgesel"   },
  en: { fwd: "Forwards",     mid: "Midfielders",    def: "Defenders",  offside: "Offside Trap",                offsideYes: "Yes",        offsideNo: "No",        marking: "Marking",    markingMan: "Man",         markingZonal: "Zonal"      },
  hu: { fwd: "Csatárok",     mid: "Középpályások",  def: "Védők",      offside: "Leshálócs",                   offsideYes: "Igen",       offsideNo: "Nem",       marking: "Lefedés",    markingMan: "Személyes",   markingZonal: "Zónás"      },
  ar: { fwd: "المهاجمون",   mid: "لاعبو الوسط",   def: "المدافعون",  offside: "فخ التسلل",                   offsideYes: "نعم",        offsideNo: "لا",        marking: "المراقبة",   markingMan: "شخصية",       markingZonal: "منطقية"     },
  pt: { fwd: "Atacantes",    mid: "Meio-campistas", def: "Defensores", offside: "Armadilha de Impedimento",    offsideYes: "Sim",        offsideNo: "Não",       marking: "Marcação",   markingMan: "Individual",  markingZonal: "Por Zona"   },
};

const UI_LABELS: Record<string, {
  opp: string; loc: string; form: string; style: string;
  press: string; slStyle: string; tempo: string; copy: string; copied: string;
}> = {
  tr: { opp: "Rakip",     loc: "Maç Yeri", form: "Formasyon", style: "Oyun Stili",   press: "Baskı",   slStyle: "Stil",    tempo: "Tempo", copy: "Taktik Kopyala",   copied: "Kopyalandı ✓" },
  en: { opp: "Opponent",  loc: "Location", form: "Formation", style: "Play Style",   press: "Press",   slStyle: "Style",   tempo: "Tempo", copy: "Copy Tactic",       copied: "Copied ✓"     },
  hu: { opp: "Ellenfél",  loc: "Helyszín", form: "Felállás",  style: "Játékstílus",  press: "Nyomás",  slStyle: "Stílus",  tempo: "Tempó", copy: "Taktika másolása",  copied: "Másolva ✓"    },
  ar: { opp: "الخصم",    loc: "الموقع",  form: "التشكيلة",  style: "أسلوب اللعب", press: "الضغط",  slStyle: "الأسلوب", tempo: "الإيقاع", copy: "نسخ التكتيك",    copied: "تم النسخ ✓"   },
  pt: { opp: "Adversário",loc: "Local",   form: "Formação",  style: "Estilo",        press: "Pressão", slStyle: "Estilo",  tempo: "Ritmo", copy: "Copiar Tática",     copied: "Copiado ✓"    },
};

// ── Translation helpers (fall back to English, then raw key) ──────────────────

function tFwd(l: string, key: string) { return FWD_LABELS[l]?.[key] ?? FWD_LABELS.en?.[key] ?? key; }
function tMid(l: string, key: string) { return MID_LABELS[l]?.[key] ?? MID_LABELS.en?.[key] ?? key; }
function tDef(l: string, key: string) { return DEF_LABELS[l]?.[key] ?? DEF_LABELS.en?.[key] ?? key; }

// ── Sub-components ────────────────────────────────────────────────────────────

function SliderBar({ label, value }: { label: string; value: number }) {
  const color =
    value > 65 ? "linear-gradient(90deg,#6366f1,#a78bfa)"
    : value > 35 ? "linear-gradient(90deg,#0ea5e9,#6366f1)"
    : "linear-gradient(90deg,#22c55e,#0ea5e9)";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 500, letterSpacing: "0.04em" }}>{label}</span>
        <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ height: "100%", borderRadius: 99, background: color }}
        />
      </div>
    </div>
  );
}

function LineRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 9,
      padding: "7px 10px", borderRadius: 9,
      background: "rgba(99,102,241,0.06)",
      border: "1px solid rgba(99,102,241,0.1)",
    }}>
      <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div>
        <div style={{ color: "#475569", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
        <div style={{ color: "#cbd5e1", fontSize: 12, lineHeight: 1.45 }}>{value}</div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ChatTacticCard({ data }: { data: TacticCardData }) {
  const { lang } = useLang();
  const l = lang as string;

  const ui   = UI_LABELS[l]         ?? UI_LABELS.en;
  const ll   = LINE_LABELS[l]       ?? LINE_LABELS.en;
  const psl  = PLAY_STYLE_LABELS[l] ?? PLAY_STYLE_LABELS.en;
  const locl = LOCATION_LABELS[l]   ?? LOCATION_LABELS.en;

  const fwdLabel = tFwd(l, data.lineTactics.forwards);
  const midLabel = tMid(l, data.lineTactics.midfielders);
  const defLabel = tDef(l, data.lineTactics.defenders);

  const hasOffside = data.lineTactics.offsideTrap !== undefined;
  const hasMarking = data.lineTactics.marking !== undefined;
  const offsideVal = hasOffside
    ? (data.lineTactics.offsideTrap ? ll.offsideYes : ll.offsideNo)
    : null;
  const markingVal = hasMarking
    ? (data.lineTactics.marking === "man" ? ll.markingMan : ll.markingZonal)
    : null;

  const [copied, setCopied] = useState(false);

  const copyText = [
    `${ui.opp}: ${data.opponentFormation}  |  ${ui.loc}: ${locl[data.location]}`,
    `${ui.form}: ${data.recommendedFormation}  |  ${ui.style}: ${psl[data.playStyleKey] ?? data.playStyleKey}`,
    `${ui.press}: ${data.press}  |  ${ui.slStyle}: ${data.style}  |  ${ui.tempo}: ${data.tempo}`,
    `${ll.fwd}: ${fwdLabel}`,
    `${ll.mid}: ${midLabel}`,
    `${ll.def}: ${defLabel}`,
    offsideVal ? `${ll.offside}: ${offsideVal}` : null,
    markingVal ? `${ll.marking}: ${markingVal}` : null,
  ].filter(Boolean).join("\n");

  const handleCopy = () => {
    void navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      style={{
        marginTop: 10, borderRadius: 18,
        background: "linear-gradient(135deg,rgba(99,102,241,0.09),rgba(139,92,246,0.05))",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(139,92,246,0.2)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.05)",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <div style={{
        padding: "11px 15px 9px",
        background: "linear-gradient(135deg,rgba(99,102,241,0.14),rgba(139,92,246,0.07))",
        borderBottom: "1px solid rgba(139,92,246,0.13)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
          }}>⚡</div>
          <div>
            <div style={{ color: "#e2e8f0", fontWeight: 800, fontSize: 15, letterSpacing: "0.02em", lineHeight: 1 }}>
              {data.recommendedFormation}
            </div>
            <div style={{ color: "#64748b", fontSize: 10.5, marginTop: 2 }}>
              {ui.opp}: <span style={{ color: "#94a3b8" }}>{data.opponentFormation}</span>
              <span style={{ margin: "0 4px", opacity: 0.4 }}>·</span>
              <span style={{ color: "#94a3b8" }}>{locl[data.location]}</span>
            </div>
          </div>
        </div>
        <div style={{
          padding: "4px 10px", borderRadius: 99,
          background: "rgba(139,92,246,0.16)",
          border: "1px solid rgba(139,92,246,0.28)",
          color: "#a78bfa", fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap",
        }}>
          {psl[data.playStyleKey] ?? data.playStyleKey}
        </div>
      </div>

      {/* ── Sliders ── */}
      <div style={{ padding: "12px 15px 10px", display: "flex", flexDirection: "column", gap: 9 }}>
        <SliderBar label={ui.press}   value={data.press} />
        <SliderBar label={ui.slStyle} value={data.style} />
        <SliderBar label={ui.tempo}   value={data.tempo} />
      </div>

      {/* ── Separator ── */}
      <div style={{ margin: "0 15px 10px", height: 1, background: "rgba(139,92,246,0.09)" }} />

      {/* ── Line tactics (official OSM vocabulary, i18n-translated) ── */}
      <div style={{ padding: "0 15px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
        <LineRow icon="⚡" label={ll.fwd}     value={fwdLabel} />
        <LineRow icon="⚙️" label={ll.mid}     value={midLabel} />
        <LineRow icon="🛡️" label={ll.def}     value={defLabel} />
        {offsideVal && (
          <LineRow icon="🚩" label={ll.offside} value={offsideVal} />
        )}
        {markingVal && (
          <LineRow icon="🎯" label={ll.marking}  value={markingVal} />
        )}
      </div>

      {/* ── Copy button ── */}
      <div style={{ padding: "0 15px 14px" }}>
        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: "100%", padding: "8px 0",
            borderRadius: 10, cursor: "pointer",
            background: copied ? "rgba(34,197,94,0.13)" : "rgba(99,102,241,0.11)",
            border: `1px solid ${copied ? "rgba(34,197,94,0.32)" : "rgba(99,102,241,0.22)"}`,
            color: copied ? "#86efac" : "#a5b4fc",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.05em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "all 0.2s",
          }}
        >
          <span style={{ fontSize: 13 }}>{copied ? "✓" : "⎘"}</span>
          {copied ? ui.copied : ui.copy}
        </motion.button>
      </div>
    </motion.div>
  );
}
