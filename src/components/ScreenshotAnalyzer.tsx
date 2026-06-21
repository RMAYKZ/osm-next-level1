import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

// ── Local lookup matrix (no API needed) ───────────────────────────────────────
type MatrixRow = {
  fm: string; label: string; p: number; s: number; t: number; sr: number;
  fwd: string; mid: string; def: string; mrk: string; off: boolean; icon: string;
  coachNote: string;
};

const MATRIX: Record<"home" | "away", Record<string, MatrixRow>> = {
  home: {
    "433ab": { fm:"4-3-3-A", label:"4-3-3A/B Kanat Oyunu",       p:52,  s:60, t:60, sr:78, fwd:"Sadece Hücum", mid:"Defansa Yardım Et", def:"Geride Kal", mrk:"Alan Markajı", off:false, icon:"⚽", coachNote:"Kanat oyununa karşı kanatlarla cevap ver, orta sahayı dar tut." },
    "442ab": { fm:"4-3-3-A", label:"4-4-2A/B Paslı Oyun",        p:55,  s:60, t:60, sr:72, fwd:"Sadece Hücum", mid:"Defansa Yardım Et", def:"Geride Kal", mrk:"Alan Markajı", off:false, icon:"🛡️", coachNote:"Paslı oyuna karşı baskıyı artır, orta sahada boşluk verme." },
    "4231":  { fm:"4-3-3-B", label:"4-2-3-1 Kaleyi Görünce Vur", p:65,  s:70, t:75, sr:82, fwd:"Sadece Hücum", mid:"Defansa Yardım Et", def:"Geride Kal", mrk:"Alan Markajı", off:false, icon:"🔥", coachNote:"Şut odaklı rakibe karşı yüksek tempo ve baskıyla boğ." },
    "451":   { fm:"5-2-3-A", label:"4-5-1 Kaleyi Görünce Vur",   p:33,  s:33, t:63, sr:68, fwd:"Sadece Hücum", mid:"Defansa Yardım Et", def:"Geride Kal", mrk:"Alan Markajı", off:false, icon:"🔰", coachNote:"Derin blok oynayan rakibe kontra ataklarla cevap ver." },
    "523ab": { fm:"5-2-3-A", label:"5-2-3A/B Kontra Atak",       p:29,  s:29, t:75, sr:70, fwd:"Sadece Hücum", mid:"Defansa Yardım Et", def:"Geride Kal", mrk:"Alan Markajı", off:false, icon:"⚡", coachNote:"Kontra atağı kontrayla kır, yüksek tempo ile alan kazan." },
    "532":   { fm:"4-3-3-A", label:"5-3-2 Kontra Atak",          p:55,  s:60, t:75, sr:75, fwd:"Sadece Hücum", mid:"Defansa Yardım Et", def:"Geride Kal", mrk:"Alan Markajı", off:false, icon:"🔱", coachNote:"Güçlü defanslı rakibe kanat baskısıyla aç." },
    "5311":  { fm:"5-2-3-A", label:"5-3-1-1 Kontra Atak",        p:32,  s:21, t:65, sr:68, fwd:"Sadece Hücum", mid:"Defansa Yardım Et", def:"Geride Kal", mrk:"Alan Markajı", off:false, icon:"⚓", coachNote:"Tek forvetli sisteme karşı kontra atak daha etkili." },
    "541ab": { fm:"4-3-3-A", label:"5-4-1A/B Kaleyi Görünce Vur",p:60,  s:55, t:65, sr:75, fwd:"Sadece Hücum", mid:"Defansa Yardım Et", def:"Geride Kal", mrk:"Alan Markajı", off:false, icon:"🏰", coachNote:"Çok savunmacı yapıya karşı kanat açılımıyla gol bul." },
    "631ab": { fm:"4-3-3-A", label:"6-3-1A/B Kontra Atak",       p:50,  s:65, t:75, sr:75, fwd:"Sadece Hücum", mid:"Pozisyon Koru",     def:"Geride Kal", mrk:"Alan Markajı", off:false, icon:"🚌", coachNote:"Beton savunmayı kanatlardan eritmeye çalış." },
    "442b":  { fm:"4-3-3-A", label:"4-4-2B Paslı Oyun",          p:55,  s:60, t:60, sr:72, fwd:"Sadece Hücum", mid:"Defansa Yardım Et", def:"Geride Kal", mrk:"Alan Markajı", off:false, icon:"💠", coachNote:"Paslı oyuna karşı baskı ve kanatlarla cevap ver." },
  },
  away: {
    "433ab": { fm:"5-2-3-A", label:"4-3-3A/B Kanat Oyunu",       p:32,  s:16, t:66, sr:65, fwd:"Sadece Hücum", mid:"Defansa Yardım Et", def:"Geride Kal", mrk:"Alan Markajı", off:false, icon:"⚽", coachNote:"Deplasmanda kontra atak ile rakip kanatlarını geçersiz kıl." },
    "442ab": { fm:"5-2-3-A", label:"4-4-2A/B Paslı Oyun",        p:25,  s:9,  t:60, sr:62, fwd:"Sadece Hücum", mid:"Defansa Yardım Et", def:"Geride Kal", mrk:"Alan Markajı", off:false, icon:"🛡️", coachNote:"Deplasmanda düşük baskı ile blok kur, kontraya hazırlan." },
    "4231":  { fm:"5-2-3-A", label:"4-2-3-1 Kaleyi Görünce Vur", p:32,  s:12, t:70, sr:68, fwd:"Sadece Hücum", mid:"Defansa Yardım Et", def:"Geride Kal", mrk:"Alan Markajı", off:false, icon:"🔥", coachNote:"Şut odaklı rakibe deplasmanda kontra ile cevap ver." },
    "451":   { fm:"5-2-3-A", label:"4-5-1 Kaleyi Görünce Vur",   p:32,  s:12, t:70, sr:65, fwd:"Sadece Hücum", mid:"Defansa Yardım Et", def:"Geride Kal", mrk:"Alan Markajı", off:false, icon:"🔰", coachNote:"Deplasmanda sabır, kontra anında hız." },
    "523ab": { fm:"5-2-3-A", label:"5-2-3A/B Kontra Atak",       p:16,  s:9,  t:72, sr:62, fwd:"Sadece Hücum", mid:"Defansa Yardım Et", def:"Geride Kal", mrk:"Alan Markajı", off:false, icon:"⚡", coachNote:"Kontraya kontrayla cevap ver, derinlik kullan." },
    "532":   { fm:"5-2-3-A", label:"5-3-2 Kontra Atak",          p:25,  s:9,  t:60, sr:60, fwd:"Sadece Hücum", mid:"Defansa Yardım Et", def:"Geride Kal", mrk:"Alan Markajı", off:false, icon:"🔱", coachNote:"Deplasmanda minimal baskı, kompakt blok." },
    "5311":  { fm:"5-2-3-A", label:"5-3-1-1 Kontra Atak",        p:11,  s:32, t:70, sr:62, fwd:"Sadece Hücum", mid:"Defansa Yardım Et", def:"Geride Kal", mrk:"Alan Markajı", off:false, icon:"⚓", coachNote:"Stil yüksel, baskıyı düşük tut — kontra kapıyı açar." },
    "541ab": { fm:"5-2-3-A", label:"5-4-1A/B Kaleyi Görünce Vur",p:33,  s:13, t:73, sr:62, fwd:"Sadece Hücum", mid:"Defansa Yardım Et", def:"Geride Kal", mrk:"Alan Markajı", off:false, icon:"🏰", coachNote:"Deplasmanda yüksek tempo ile rakip bloğunu aş." },
    "631ab": { fm:"5-2-3-A", label:"6-3-1A/B Kontra Atak",       p:36,  s:24, t:74, sr:65, fwd:"Sadece Hücum", mid:"Defansa Yardım Et", def:"Geride Kal", mrk:"Alan Markajı", off:false, icon:"🚌", coachNote:"En savunmacı sistemi bile tempoyla zorlarsın." },
    "442b":  { fm:"5-2-3-A", label:"4-4-2B Paslı Oyun",          p:16,  s:12, t:62, sr:62, fwd:"Sadece Hücum", mid:"Defansa Yardım Et", def:"Geride Kal", mrk:"Alan Markajı", off:false, icon:"💠", coachNote:"Deplasmanda baskı düşük, blok yüksek, kontra hazır." },
  },
};

const OPP_OPTIONS = [
  { key:"433ab",  label:"4-3-3",    sub:"Kanat Oyunu",        icon:"⚽" },
  { key:"442ab",  label:"4-4-2",    sub:"Paslı Oyun",         icon:"🛡️" },
  { key:"4231",   label:"4-2-3-1",  sub:"Kaleyi Gör Vur",    icon:"🔥" },
  { key:"451",    label:"4-5-1",    sub:"Kaleyi Gör Vur",    icon:"🔰" },
  { key:"523ab",  label:"5-2-3",    sub:"Kontra Atak",        icon:"⚡" },
  { key:"532",    label:"5-3-2",    sub:"Kontra Atak",        icon:"🔱" },
  { key:"5311",   label:"5-3-1-1",  sub:"Kontra Atak",        icon:"⚓" },
  { key:"541ab",  label:"5-4-1",    sub:"Kaleyi Gör Vur",    icon:"🏰" },
  { key:"631ab",  label:"6-3-1",    sub:"Kontra Atak",        icon:"🚌" },
  { key:"442b",   label:"4-4-2B",   sub:"Paslı Oyun",         icon:"💠" },
];

// ── Sub-components ─────────────────────────────────────────────────────────────
function SliderBar({ label, value, color, delay = 0 }: {
  label: string; value: number; color: string; delay?: number;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>{label}</span>
        <span style={{ color: "#fff", fontWeight: 900, fontSize: 18, lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</span>
      </div>
      <div style={{ height: 7, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: EASE, delay }}
          style={{ height: "100%", borderRadius: 99, background: color }}
        />
      </div>
    </div>
  );
}

function TacticTag({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span style={{ color: "rgba(255,255,255,0.38)", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em" }}>{label}</span>
      <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "2px 9px" }}>{value}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ScreenshotAnalyzer() {
  const [location, setLocation] = useState<"home" | "away">("home");
  const [oppKey, setOppKey]     = useState<string | null>(null);

  const row = oppKey ? MATRIX[location][oppKey] ?? null : null;
  const winColor = row ? (row.sr >= 80 ? "oklch(0.87 0.27 152)" : row.sr >= 70 ? "#f59e0b" : "#f97316") : "oklch(0.87 0.27 152)";
  const circ = 2 * Math.PI * 28;
  const dash = row ? (row.sr / 100) * circ : 0;

  return (
    <section id="screenshot-analyzer" style={{ padding: "60px 0" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 20px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "oklch(0.87 0.27 152)", marginBottom: 12 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "oklch(0.87 0.27 152)", boxShadow: "0 0 8px oklch(0.87 0.27 152)", display: "inline-block" }} />
            Hızlı Analiz
          </div>
          <h2 style={{ fontSize: "clamp(26px,5vw,42px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, margin: "0 0 10px", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "-0.01em" }}>
            ANTİ-TAKTİK BULUCU
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13.5, margin: 0, lineHeight: 1.6 }}>
            Rakibin dizilişini seç — anında karşı taktik al
          </p>
        </div>

        {/* Step 1: Location */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 18, height: 18, borderRadius: "50%", background: "oklch(0.87 0.27 152)", color: "oklch(0.13 0.02 250)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, flexShrink: 0 }}>1</span>
            Maç Yeri
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {(["home", "away"] as const).map(loc => (
              <motion.button
                key={loc}
                whileTap={{ scale: 0.97 }}
                onClick={() => setLocation(loc)}
                style={{
                  flex: 1, padding: "14px 12px", borderRadius: 12, cursor: "pointer",
                  border: location === loc ? "1px solid oklch(0.87 0.27 152 / 0.6)" : "1px solid rgba(255,255,255,0.1)",
                  background: location === loc ? "oklch(0.87 0.27 152 / 0.12)" : "rgba(255,255,255,0.03)",
                  color: location === loc ? "oklch(0.87 0.27 152)" : "rgba(255,255,255,0.5)",
                  fontWeight: 800, fontSize: 13, letterSpacing: "0.05em",
                  transition: "all 0.2s ease",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: location === loc ? "0 0 20px oklch(0.87 0.27 152 / 0.12)" : "none",
                }}
              >
                <span style={{ fontSize: 18 }}>{loc === "home" ? "🏠" : "✈️"}</span>
                <div>
                  <div>{loc === "home" ? "EV MAÇI" : "DEPLASMAN"}</div>
                  <div style={{ fontSize: 9, opacity: 0.6, fontWeight: 600 }}>{loc === "home" ? "Kendi sahanızda" : "Deplasmanda"}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Step 2: Opponent formation */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 18, height: 18, borderRadius: "50%", background: "oklch(0.87 0.27 152)", color: "oklch(0.13 0.02 250)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, flexShrink: 0 }}>2</span>
            Rakip Dizilişi
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            {OPP_OPTIONS.map(opt => {
              const on = oppKey === opt.key;
              return (
                <motion.button
                  key={opt.key}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setOppKey(on ? null : opt.key)}
                  style={{
                    padding: "10px 4px 8px", borderRadius: 10, cursor: "pointer",
                    border: on ? "1px solid oklch(0.87 0.27 152 / 0.7)" : "1px solid rgba(255,255,255,0.08)",
                    background: on ? "oklch(0.87 0.27 152 / 0.14)" : "rgba(255,255,255,0.03)",
                    color: on ? "oklch(0.87 0.27 152)" : "rgba(255,255,255,0.55)",
                    transition: "all 0.18s ease",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                    boxShadow: on ? "0 0 16px oklch(0.87 0.27 152 / 0.15)" : "none",
                    position: "relative",
                  }}
                >
                  {on && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%", background: "oklch(0.87 0.27 152)", boxShadow: "0 0 6px oklch(0.87 0.27 152)" }} />
                  )}
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{opt.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.02em", lineHeight: 1.1 }}>{opt.label}</span>
                  <span style={{ fontSize: 8, opacity: 0.55, fontWeight: 600, letterSpacing: "0.02em", lineHeight: 1.1, textAlign: "center" }}>{opt.sub}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Instant result */}
        <AnimatePresence mode="wait">
          {!oppKey ? (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: "center", padding: "32px 20px", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 16, color: "rgba(255,255,255,0.25)", fontSize: 13 }}
            >
              Rakip dizilişini seçtikten sonra anti-taktik burada görünecek
            </motion.div>
          ) : row ? (
            <motion.div
              key={`${location}-${oppKey}`}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {/* Result hero card */}
              <div style={{
                position: "relative", overflow: "hidden",
                background: "linear-gradient(135deg, oklch(0.13 0.02 250 / 0.97) 0%, oklch(0.10 0.03 250) 100%)",
                border: `1px solid ${winColor}33`,
                borderRadius: 16, padding: "20px 20px 18px 24px",
                boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${winColor}18`,
              }}>
                {/* Left accent bar */}
                <div style={{ position: "absolute", left: 0, top: 16, bottom: 16, width: 3, borderRadius: "0 3px 3px 0", background: winColor, boxShadow: `0 0 16px ${winColor}` }} />

                {/* Shimmer */}
                <motion.div animate={{ x: ["-140%", "280%"] }} transition={{ repeat: Infinity, repeatDelay: 5, duration: 1.1, ease: EASE }} style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%)", transform: "skewX(-12deg)" }} />

                {/* Top row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: winColor, boxShadow: `0 0 6px ${winColor}`, display: "inline-block", animation: "blink 1.8s infinite" }} />
                      <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
                        {location === "home" ? "🏠 Ev Maçı" : "✈️ Deplasman"} · vs {row.label}
                      </span>
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(24px,4vw,40px)", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.01em", marginBottom: 6 }}>
                      {row.fm}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 13 }}>⚡</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Kontra Atak</span>
                    </div>
                    {/* P/S/T inline */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      {[["BAS", row.p], ["STİL", row.s], ["TEMPO", row.t]].map(([lbl, val], i) => (
                        <span key={i} style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                          <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>{lbl}</span>
                          <span style={{ fontSize: 16, fontWeight: 900, color: winColor }}>{val}</span>
                          {i < 2 && <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 12, marginLeft: 2 }}>·</span>}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Win rate ring */}
                  <div style={{ flexShrink: 0 }}>
                    <svg width="80" height="80" viewBox="0 0 80 80" style={{ overflow: "visible" }}>
                      <circle cx="40" cy="40" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6.5" />
                      <motion.circle
                        cx="40" cy="40" r="28" fill="none"
                        stroke={winColor} strokeWidth="6.5" strokeLinecap="round"
                        strokeDasharray={`${dash} ${circ}`}
                        transform="rotate(-90 40 40)"
                        style={{ filter: `drop-shadow(0 0 8px ${winColor})` }}
                        initial={{ strokeDasharray: `0 ${circ}` }}
                        animate={{ strokeDasharray: `${dash} ${circ}` }}
                        transition={{ duration: 1, ease: EASE, delay: 0.2 }}
                      />
                      <text x="40" y="37" textAnchor="middle" fill="#fff" fontSize="17" fontWeight="900" fontFamily="Inter,sans-serif">{row.sr}</text>
                      <text x="40" y="51" textAnchor="middle" fill="rgba(255,255,255,0.38)" fontSize="7.5" fontWeight="700" fontFamily="Inter,sans-serif">KAZANMA%</text>
                    </svg>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 14 }} />

                {/* Sliders */}
                <div style={{ marginBottom: 14 }}>
                  <SliderBar label="Baskı"  value={row.p} color="linear-gradient(90deg, #ef4444, #f97316)" delay={0} />
                  <SliderBar label="Stil"   value={row.s} color="linear-gradient(90deg, #3b82f6, #8b5cf6)" delay={0.1} />
                  <SliderBar label="Tempo"  value={row.t} color={`linear-gradient(90deg, oklch(0.87 0.27 152), #3b82f6)`} delay={0.2} />
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 12 }} />

                {/* Line tactics */}
                <div>
                  <TacticTag label="İleri Hat"    value={row.fwd} />
                  <TacticTag label="Orta Saha"    value={row.mid} />
                  <TacticTag label="Savunma Hattı" value={row.def} />
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <span style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: 700, padding: "5px 8px", borderRadius: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.55)" }}>
                      {row.off ? "⚠️ Ofsayt Açık" : "✓ Ofsayt Kapalı"}
                    </span>
                    <span style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: 700, padding: "5px 8px", borderRadius: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.55)" }}>
                      {row.mrk}
                    </span>
                  </div>
                </div>

                {/* Coach note */}
                <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: `${winColor}0d`, border: `1px solid ${winColor}22` }}>
                  <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: winColor, display: "block", marginBottom: 4 }}>⚡ HOCA NOTU</span>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, fontStyle: "italic" }}>"{row.coachNote}"</p>
                </div>
              </div>

              {/* WhatsApp share */}
              <motion.a
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                href={`https://wa.me/?text=${encodeURIComponent(`⚽ OSM Anti-Taktik\n\nRakip: ${row.label} (${location === "home" ? "Ev" : "Deplasman"})\n\n✅ Önerilen: ${row.fm}\n📊 Baskı: ${row.p} | Stil: ${row.s} | Tempo: ${row.t}\n🏆 Kazanma: %${row.sr}\n\nForvetler: ${row.fwd}\nOrta Saha: ${row.mid}\nSavunma: ${row.def}\n\n🔗 osmantrenor.com`)}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  marginTop: 10, padding: "12px", borderRadius: 12,
                  background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.25)",
                  color: "#25d366", fontWeight: 800, fontSize: 13, letterSpacing: "0.04em",
                  textDecoration: "none", transition: "all 0.2s ease",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.109.549 4.09 1.51 5.812L.057 23.944l6.304-1.428A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 01-5.002-1.373l-.358-.214-3.742.847.878-3.634-.232-.372A9.796 9.796 0 012.18 12c0-5.419 4.401-9.818 9.82-9.818 5.417 0 9.818 4.399 9.818 9.818 0 5.42-4.401 9.818-9.818 9.818z"/></svg>
                Takım Arkadaşlarınla Paylaş
              </motion.a>
            </motion.div>
          ) : (
            <motion.div
              key="no-match"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: "center", padding: "24px", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 14, background: "rgba(249,115,22,0.05)", color: "rgba(255,255,255,0.6)", fontSize: 13 }}
            >
              Bu eşleşme için hazır bir taktik bulunamadı. Anti-Taktik Bulucu bölümünü dene.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
