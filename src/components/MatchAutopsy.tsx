import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TD, OPP_LIST } from "../data/tacticDatabase";
import { usePremium } from "../contexts/PremiumContext";
import { siteConfig } from "../data/extras";

const EASE = [0.16, 1, 0.3, 1] as const;
type Loc = "home" | "away";
type Str = "stronger" | "equal" | "weaker";

interface ErrorItem {
  level: "critical" | "warning" | "ok";
  slider: string;
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

function buildError(label: string, userVal: number, optVal: number): ErrorItem {
  const diff = userVal - optVal;
  const abs = Math.abs(diff);
  const dir = diff > 0 ? "yüksek" : "düşük";
  const msgs: Record<string, [string, string]> = {
    "Baskı": [
      diff > 0
        ? "Aşırı baskı savunma dengesini bozdu — rakip kontraya dönünce boşluk oluştu"
        : "Düşük baskı rakibe topla çıkış serbestisi tanıdı",
      diff > 0
        ? "Baskı biraz fazlaydı, kontra riski arttı"
        : "Baskı biraz düşüktü, rakip rahat pozisyon kurdu",
    ],
    "Stil": [
      diff > 0
        ? "Stil çok yüksek — rakibin kontra atağına açık kapı bıraktın"
        : "Stil çok düşük, hücum gücünü kaybettin ve baskı kuramadın",
      diff > 0
        ? "Stil fazlaydı, savunma arkası riske girdi"
        : "Stil düşüktü, önde yeterli etki yaratamadın",
    ],
    "Tempo": [
      diff > 0
        ? "Tempo çok yüksek, oyuncular erken yoruldu ve ikinci yarıda ritim bozuldu"
        : "Tempo çok düşük, rakibe oyun kurma ve pozisyon üstünlüğü sağladın",
      diff > 0
        ? "Tempo biraz fazla, ikinci yarıda enerji düştü"
        : "Tempo biraz düşük, baskı hissi kayboldu",
    ],
  };
  const [critMsg, warnMsg] = msgs[label] ?? ["Değer yanlış ayarlandı", `${label} ${dir} kaldı`];
  if (abs >= 16) return { level: "critical", slider: label, userVal, optVal, diff, msg: critMsg };
  if (abs >= 8)  return { level: "warning",  slider: label, userVal, optVal, diff, msg: warnMsg };
  return { level: "ok", slider: label, userVal, optVal, diff, msg: `${label} değeri iyiydi` };
}

function buildVerdict(errors: ErrorItem[], str: Str, loc: Loc): string {
  const crits = errors.filter(e => e.level === "critical");
  const warns = errors.filter(e => e.level === "warning");
  if (crits.length >= 2) return `${crits.map(e => e.slider).join(" ve ")} değerlerindeki kritik hatalar maçı kaybettirdi. Optimal taktikten çok uzak bir kurulum oynamışsın.`;
  if (crits.length === 1) {
    const c = crits[0];
    const dir = c.diff > 0 ? "yüksek" : "düşük";
    return `${c.slider} ${dir} olması sonucu doğrudan etkiledi. ${c.msg}.`;
  }
  if (warns.length >= 2) return "Birden fazla slider optimal değerden sapıyordu. Küçük görünen hatalar birleşince büyük etki yarattı.";
  if (warns.length === 1) return `${warns[0].slider} değerindeki sapma belirleyici oldu. Geri kalan ayarlar iyiydi.`;
  if (str === "stronger" && loc === "home") return "Slider değerlerin neredeyse optimaldi. Kayıp taktik dışı bir faktörden (şans, özel yetenek vb.) kaynaklanmış olabilir.";
  return "Taktik kurulumun mantıklıydı. Kayıp güç dengesindeki farklılık veya anlık şanssızlıktan kaynaklanmış olabilir.";
}

export default function MatchAutopsy() {
  const { isPremium } = usePremium();
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
      buildError("Baskı", userP, opt.p),
      buildError("Stil",  userS, opt.s),
      buildError("Tempo", userT, opt.t),
    ];
    const totalDiff = errors.reduce((acc, e) => acc + Math.abs(e.diff), 0);
    const score = Math.max(5, Math.min(96, 100 - Math.round(totalDiff / 2.2)));
    setResult({
      score,
      errors,
      verdict: buildVerdict(errors, str, loc),
      optFm: opt.fm,
      optP: opt.p, optS: opt.s, optT: opt.t,
      optF: opt.f, optM: opt.m, optD: opt.d,
      winRate: opt.sr,
    });
  };

  const reset = () => { setResult(null); setOppKey(""); setUserP(50); setUserS(50); setUserT(60); };

  const LOC_OPTS: { val: Loc; icon: string; label: string }[] = [
    { val: "home",  icon: "🏠", label: "Ev" },
    { val: "away",  icon: "✈️", label: "Deplasman" },
  ];
  const STR_OPTS: { val: Str; icon: string; label: string; color: string }[] = [
    { val: "stronger", icon: "💪", label: "Güçlüydüm",   color: "#22c55e" },
    { val: "equal",    icon: "⚖️",  label: "Eşittik",     color: "#f59e0b" },
    { val: "weaker",   icon: "😓", label: "Zayıftım",    color: "#ef4444" },
  ];
  const LEVEL_META = {
    critical: { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", label: "KRİTİK HATA" },
    warning:  { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", label: "HATA" },
    ok:       { color: "#22c55e", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.2)",  label: "DOĞRU" },
  };

  const scoreColor = result
    ? result.score >= 75 ? "#f59e0b" : result.score >= 50 ? "#ef4444" : "#ef4444"
    : "#6366f1";

  // ── NumInput helper ──────────────────────────────────────────────
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
                <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#f87171" }}>TAKTİK OTOPSİ</span>
              </div>
              <h2 style={{ margin: "0 0 6px", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, color: "#e2e8f0", lineHeight: 1.1 }}>Neden Kaybettin?</h2>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(148,163,184,0.6)", lineHeight: 1.6 }}>Maç bilgilerini ve kullandığın slider değerlerini gir,<br/>sistem tam teşhisi çıkarsın.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Location */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(148,163,184,0.45)", marginBottom: 8 }}>Maç Yeri</div>
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
                <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(148,163,184,0.45)", marginBottom: 8 }}>Güç Durumu</div>
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
                <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(148,163,184,0.45)", marginBottom: 8 }}>Rakip Formasyon</div>
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
                <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(148,163,184,0.45)", marginBottom: 14 }}>Kullandığın Slider Değerleri</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "⚡ Baskı",  val: userP, set: setUserP },
                    { label: "🎨 Stil",   val: userS, set: setUserS },
                    { label: "⏱️ Tempo", val: userT, set: setUserT },
                  ].map(row => (
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
                🔬 Analiz Et
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
                    <span style={{ fontSize: 18, fontWeight: 900, color: scoreColor, lineHeight: 1, fontFamily: "'Barlow Condensed', sans-serif" }}>{result.score}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(148,163,184,0.5)", textTransform: "uppercase" }}>Skor</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.16em", color: "rgba(239,68,68,0.7)", marginBottom: 4 }}>🔬 TAKTİK OTOPSİ</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0", lineHeight: 1.3 }}>
                    {result.score >= 80 ? "Neredeyse Optimal Taktik" : result.score >= 55 ? "Önemli Hatalar Tespit Edildi" : "Kritik Taktik Uyumsuzluğu"}
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
                  <motion.div key={err.slider}
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
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#e2e8f0" }}>{err.slider}</span>
                      </div>
                      {!isPremium && (
                        <span style={{ fontSize: 10, color: "rgba(148,163,184,0.35)", fontWeight: 700 }}>🔒 VIP</span>
                      )}
                    </div>

                    {isPremium ? (
                      <>
                        {/* Bar comparison */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                          {[
                            { label: "Senin", val: err.userVal, color: err.level === "ok" ? "#22c55e" : "#ef4444" },
                            { label: "Optimal", val: err.optVal, color: "#22c55e" },
                          ].map(row => (
                            <div key={row.label}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(148,163,184,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{row.label}</span>
                                <span style={{ fontSize: 14, fontWeight: 900, color: row.color, fontFamily: "'Barlow Condensed', sans-serif" }}>{row.val}</span>
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
                        <span style={{ fontSize: 11, color: "rgba(148,163,184,0.3)", fontWeight: 700 }}>Detaylar VIP üyelere açıktır</span>
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
              <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.16em", color: "#a5b4fc", marginBottom: 8 }}>🧠 KAYBININ SEBEBİ</div>
              {isPremium ? (
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "rgba(226,232,240,0.8)" }}>{result.verdict}</p>
              ) : (
                <div style={{ position: "relative" }}>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "rgba(226,232,240,0.8)", filter: "blur(5px)", userSelect: "none" }}>{result.verdict}</p>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(165,180,252,0.8)", background: "rgba(9,11,33,0.85)", borderRadius: 8, padding: "4px 12px", border: "1px solid rgba(99,102,241,0.3)" }}>🔒 VIP ile görüntüle</span>
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
                <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.16em", color: "#4ade80" }}>✅ DOĞRU TAKTİK</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#4ade80", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 999, padding: "2px 10px" }}>
                  %{result.winRate} Kazanma
                </div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#e2e8f0", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em", marginBottom: 12 }}>
                {result.optFm}
              </div>
              {isPremium ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Baskı", val: result.optP, color: "#6366f1" },
                    { label: "Stil",  val: result.optS, color: "#a78bfa" },
                    { label: "Tempo", val: result.optT, color: "#22d3ee" },
                  ].map((row, i) => (
                    <div key={row.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(148,163,184,0.5)", textTransform: "uppercase" }}>{row.label}</span>
                        <span style={{ fontSize: 15, fontWeight: 900, color: row.color, fontFamily: "'Barlow Condensed', sans-serif" }}>{row.val}</span>
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
                  {["Baskı","Stil","Tempo"].map(label => (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(148,163,184,0.5)", textTransform: "uppercase" }}>{label}</span>
                        <span style={{ fontSize: 15, fontWeight: 900, color: "rgba(148,163,184,0.2)", fontFamily: "'Barlow Condensed', sans-serif", filter: "blur(4px)" }}>??</span>
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
                👑 VIP Al — Tam Analizi Gör
              </motion.a>
            ) : (
              <motion.button onClick={reset}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{ width: "100%", padding: "13px 0", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)",
                  color: "rgba(148,163,184,0.7)", fontSize: 13, fontWeight: 800, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                ↩ Yeni Analiz
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
