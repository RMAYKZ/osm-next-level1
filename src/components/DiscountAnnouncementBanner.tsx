import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";
import { DISCOUNT_CODE, DISCOUNT_CHECKOUT_URL, DISCOUNT_DATE_LABEL, DISCOUNT_OLD_PRICE, DISCOUNT_NEW_PRICE, DISCOUNT_PERCENT, isDiscountExpired } from "../data/discount";

const SESSION_KEY = "osm-discount-banner-dismissed";

function isDismissed(): boolean {
  try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
}

const COPY: Record<string, {
  badge: string;
  text: (pct: string) => string;
  copyLabel: string;
  copiedLabel: string;
  was: string;
  now: string;
  perYear: string;
  until: (date: string) => string;
  cta: string;
}> = {
  tr: {
    badge: "SINIRLI SÜRE",
    text: (pct) => `Yıllık Tier 4 Planında %${pct} İndirim!`,
    copyLabel: "Kodu Kopyala",
    copiedLabel: "Kopyalandı ✓",
    was: "Eski Fiyat",
    now: "Yeni Fiyat",
    perYear: "/ yıl",
    until: (date) => `Son gün: ${date}`,
    cta: "Hemen Yakala",
  },
  en: {
    badge: "LIMITED TIME",
    text: (pct) => `${pct}% Off the Annual Tier 4 Plan!`,
    copyLabel: "Copy Code",
    copiedLabel: "Copied ✓",
    was: "Was",
    now: "Now",
    perYear: "/ year",
    until: (date) => `Ends ${date}`,
    cta: "Grab It Now",
  },
  hu: {
    badge: "KORLÁTOZOTT IDEIG",
    text: (pct) => `${pct}% kedvezmény az Éves Tier 4 csomagra!`,
    copyLabel: "Kód Másolása",
    copiedLabel: "Másolva ✓",
    was: "Régi ár",
    now: "Új ár",
    perYear: "/ év",
    until: (date) => `Lejár: ${date}`,
    cta: "Igénylem Most",
  },
  ar: {
    badge: "لوقت محدود",
    text: (pct) => `خصم ${pct}% على خطة Tier 4 السنوية!`,
    copyLabel: "نسخ الكود",
    copiedLabel: "تم النسخ ✓",
    was: "السعر القديم",
    now: "السعر الجديد",
    perYear: "/ سنة",
    until: (date) => `ينتهي في: ${date}`,
    cta: "احصل عليه الآن",
  },
  pt: {
    badge: "TEMPO LIMITADO",
    text: (pct) => `${pct}% de desconto no Plano Anual Tier 4!`,
    copyLabel: "Copiar Código",
    copiedLabel: "Copiado ✓",
    was: "Preço antigo",
    now: "Novo preço",
    perYear: "/ ano",
    until: (date) => `Termina em: ${date}`,
    cta: "Aproveitar Agora",
  },
};

export default function DiscountAnnouncementBanner() {
  const { lang, t } = useLang();
  const [hidden, setHidden] = useState(() => isDismissed());
  const [entered, setEntered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expired, setExpired] = useState(() => isDiscountExpired());

  useEffect(() => {
    const id = setInterval(() => {
      if (isDiscountExpired()) setExpired(true);
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  if (hidden || expired) return null;

  const copy = COPY[lang] ?? COPY.en;
  const isRTL = lang === "ar";
  const dateLabel = DISCOUNT_DATE_LABEL[lang] ?? DISCOUNT_DATE_LABEL.en;

  function dismiss() {
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* */ }
    setEntered(false);
    setHidden(true);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(DISCOUNT_CODE);
    } catch {
      // Clipboard API unavailable (older browser / no permission) — fall
      // back to a manual selection so the user can still copy it themselves.
      try {
        const range = document.createRange();
        const el = document.getElementById("discount-code-fallback");
        if (el) {
          range.selectNodeContents(el);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      } catch { /* */ }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onAnimationComplete={() => setEntered(true)}
          style={{ overflow: entered ? "visible" : "hidden" }}
        >
          <div
            dir={isRTL ? "rtl" : "ltr"}
            style={{
              position: "relative",
              background: "linear-gradient(90deg,#1a0300 0%,#240400 45%,#1a0300 100%)",
              borderBottom: "1px solid rgba(239,68,68,0.4)",
              overflow: "hidden",
              fontFamily: "var(--font-display,'Outfit'),'Segoe UI',system-ui,sans-serif",
            }}
          >
            {/* Pulsing red→orange top bar */}
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: "linear-gradient(90deg,#ef4444,#f97316,#fbbf24,#f97316,#ef4444)" }}
            />

            {/* Ambient glow — cheap, opacity-only pulse */}
            <motion.div
              aria-hidden
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              style={{
                position: "absolute", top: "-70%", insetInlineStart: "8%",
                width: 320, height: 320, borderRadius: "50%",
                background: "radial-gradient(circle,rgba(239,68,68,0.28) 0%,transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <div style={{
              position: "relative", maxWidth: 1240, margin: "0 auto",
              padding: "12px clamp(16px,4vw,40px)",
              display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" as const,
              justifyContent: "center",
            }}>

              {/* Fire icon */}
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.3, repeat: Infinity }}
                style={{ fontSize: 20, flexShrink: 0 }}
              >
                🔥
              </motion.div>

              {/* Badge */}
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.1, repeat: Infinity }}
                style={{
                  fontSize: 9.5, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase",
                  color: "#fca5a5", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.45)",
                  borderRadius: 999, padding: "3px 10px", flexShrink: 0,
                }}
              >
                {copy.badge}
              </motion.span>

              {/* Main text */}
              <span style={{ fontSize: "clamp(12.5px,2vw,15px)", fontWeight: 800, color: "#fff5f0", letterSpacing: "-0.01em" }}>
                {copy.text(String(DISCOUNT_PERCENT))}
              </span>

              {/* Price */}
              <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", textDecoration: "line-through" }}>{DISCOUNT_OLD_PRICE}</span>
                <span style={{ fontSize: "clamp(14px,2vw,17px)", fontWeight: 900, color: "#fbbf24" }}>{DISCOUNT_NEW_PRICE}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>{copy.perYear}</span>
              </span>

              {/* Code — click to copy */}
              <motion.button
                onClick={copyCode}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                aria-label={copy.copyLabel}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                  border: `1px dashed ${copied ? "rgba(34,197,94,0.55)" : "rgba(255,255,255,0.3)"}`,
                  borderRadius: 8, padding: "5px 12px",
                  cursor: "pointer", flexShrink: 0,
                  transition: "background 0.2s, border-color 0.2s",
                }}
              >
                <span id="discount-code-fallback" style={{ fontFamily: "'JetBrains Mono','Consolas',monospace", fontSize: 12.5, fontWeight: 700, letterSpacing: "0.06em", color: "#ffffff" }}>
                  {DISCOUNT_CODE}
                </span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: copied ? "#4ade80" : "rgba(255,255,255,0.5)", whiteSpace: "nowrap" as const }}>
                  {copied ? copy.copiedLabel : `· ${copy.copyLabel}`}
                </span>
              </motion.button>

              {/* Deadline */}
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,180,150,0.65)", whiteSpace: "nowrap" as const, flexShrink: 0 }}>
                {copy.until(dateLabel)}
              </span>

              {/* CTA */}
              <motion.a
                href={DISCOUNT_CHECKOUT_URL}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -1, boxShadow: "0 10px 26px -4px rgba(239,68,68,0.6)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.18 }}
                style={{
                  display: "inline-flex", alignItems: "center", flexShrink: 0,
                  background: "linear-gradient(135deg,#ef4444,#f97316)",
                  borderRadius: 8, padding: "8px 16px",
                  color: "#fff8f0", fontSize: 11.5, fontWeight: 900,
                  textDecoration: "none", textTransform: "uppercase" as const,
                  letterSpacing: "0.05em", boxShadow: "0 4px 16px -4px rgba(239,68,68,0.5)",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {copy.cta}
              </motion.a>

              {/* Dismiss */}
              <button
                onClick={dismiss}
                aria-label={t("nav.close")}
                style={{
                  flexShrink: 0, background: "transparent", border: "none", borderRadius: "50%",
                  width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(255,150,120,0.5)", cursor: "pointer", fontSize: 12,
                  transition: "color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.85)"; e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,150,120,0.5)"; e.currentTarget.style.background = "transparent"; }}
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
