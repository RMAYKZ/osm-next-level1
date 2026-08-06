import { useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";
import { DISCOUNT_CODE, DISCOUNT_CHECKOUT_URL, DISCOUNT_DATE_LABEL, DISCOUNT_OLD_PRICE, DISCOUNT_NEW_PRICE, isDiscountExpired } from "../data/discount";

const COPY: Record<string, {
  eyebrow: string;
  badge: string;
  title: string;
  desc: string;
  was: string;
  now: string;
  perYear: string;
  savings: (amount: string) => string;
  copyLabel: string;
  copiedLabel: string;
  until: (date: string) => string;
  cta: string;
}> = {
  tr: {
    eyebrow: "TIER 4 · YILLIK VIP ÜYELİK",
    badge: "%30 İNDİRİM",
    title: "Yıllık VIP Üyelikte Sınırlı Süre İndirimi",
    desc: "Tüm premium taktiklere, haftalık güncellemelere ve VIP içeriklere yıl boyu erişim.",
    was: "Eski fiyat",
    now: "Yeni fiyat",
    perYear: "/ yıl",
    savings: (amount) => `Yılda ${amount} tasarruf`,
    copyLabel: "Kodu Kopyala",
    copiedLabel: "Kopyalandı ✓",
    until: (date) => `Kampanya ${date} tarihinde sona eriyor`,
    cta: "İndirimi Kullan",
  },
  en: {
    eyebrow: "TIER 4 · ANNUAL VIP MEMBERSHIP",
    badge: "30% OFF",
    title: "Limited-Time Discount on Annual VIP",
    desc: "Full-year access to every premium tactic, weekly updates, and VIP content.",
    was: "Was",
    now: "Now",
    perYear: "/ year",
    savings: (amount) => `Save ${amount} a year`,
    copyLabel: "Copy Code",
    copiedLabel: "Copied ✓",
    until: (date) => `Offer ends ${date}`,
    cta: "Claim the Discount",
  },
  hu: {
    eyebrow: "TIER 4 · ÉVES VIP TAGSÁG",
    badge: "30% KEDVEZMÉNY",
    title: "Korlátozott Ideig Tartó Kedvezmény az Éves VIP-re",
    desc: "Egy teljes évre szóló hozzáférés minden prémium taktikához, heti frissítéshez és VIP tartalomhoz.",
    was: "Régi ár",
    now: "Új ár",
    perYear: "/ év",
    savings: (amount) => `${amount} megtakarítás évente`,
    copyLabel: "Kód Másolása",
    copiedLabel: "Másolva ✓",
    until: (date) => `Az ajánlat lejár: ${date}`,
    cta: "Kedvezmény Igénylése",
  },
  ar: {
    eyebrow: "TIER 4 · عضوية VIP سنوية",
    badge: "خصم 30%",
    title: "خصم لوقت محدود على عضوية VIP السنوية",
    desc: "وصول لمدة عام كامل لجميع التكتيكات المميزة والتحديثات الأسبوعية ومحتوى VIP.",
    was: "السعر القديم",
    now: "السعر الجديد",
    perYear: "/ سنة",
    savings: (amount) => `وفّر ${amount} سنويًا`,
    copyLabel: "نسخ الكود",
    copiedLabel: "تم النسخ ✓",
    until: (date) => `ينتهي العرض في ${date}`,
    cta: "احصل على الخصم",
  },
  pt: {
    eyebrow: "TIER 4 · ASSINATURA VIP ANUAL",
    badge: "30% DE DESCONTO",
    title: "Desconto por Tempo Limitado na VIP Anual",
    desc: "Acesso de um ano completo a todas as táticas premium, atualizações semanais e conteúdo VIP.",
    was: "Preço antigo",
    now: "Novo preço",
    perYear: "/ ano",
    savings: (amount) => `Economize ${amount} por ano`,
    copyLabel: "Copiar Código",
    copiedLabel: "Copiado ✓",
    until: (date) => `A oferta termina em ${date}`,
    cta: "Resgatar Desconto",
  },
};

export default function DiscountPricingCard() {
  const { lang } = useLang();
  const [copied, setCopied] = useState(false);

  if (isDiscountExpired()) return null;

  const copy = COPY[lang] ?? COPY.en;
  const isRTL = lang === "ar";
  const dateLabel = DISCOUNT_DATE_LABEL[lang] ?? DISCOUNT_DATE_LABEL.en;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(DISCOUNT_CODE);
    } catch { /* clipboard unavailable — code is still visible to copy by hand */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      dir={isRTL ? "rtl" : "ltr"}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ marginBottom: 28, position: "relative", overflow: "hidden" }}
    >
      <div style={{
        position: "relative",
        background: "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(20,4,4,0.96) 45%, rgba(249,115,22,0.06) 100%)",
        border: "1.5px solid rgba(239,68,68,0.4)",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 4px 14px -4px rgba(0,0,0,0.6)",
      }}>
        {/* Pulsing top bar */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ height: 3, background: "linear-gradient(90deg,#ef4444,#f97316,#fbbf24,#f97316,#ef4444)" }}
        />

        <div style={{
          padding: "clamp(20px,3.5vw,32px)",
          display: "flex", flexWrap: "wrap" as const, alignItems: "center", gap: "clamp(18px,3vw,32px)",
        }}>

          {/* Left: copy */}
          <div style={{ flex: "1 1 320px", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, marginBottom: 10 }}>
              <span style={{
                fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
              }}>
                {copy.eyebrow}
              </span>
              <motion.span
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "#fca5a5", background: "rgba(239,68,68,0.16)", border: "1px solid rgba(239,68,68,0.5)",
                  borderRadius: 999, padding: "3px 10px",
                }}
              >
                🔥 {copy.badge}
              </motion.span>
            </div>

            <h3 style={{ margin: "0 0 6px", fontSize: "clamp(1.1rem,2.4vw,1.5rem)", fontWeight: 900, color: "#ffffff", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
              {copy.title}
            </h3>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.55, maxWidth: 440 }}>
              {copy.desc}
            </p>

            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,180,150,0.7)" }}>
              {copy.until(dateLabel)}
            </span>
          </div>

          {/* Right: price + code + CTA */}
          <div style={{ flex: "0 1 280px", display: "flex", flexDirection: "column", gap: 14, minWidth: 240 }}>

            {/* Price */}
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" as const }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.32)" }}>{copy.was}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.4)", textDecoration: "line-through" }}>{DISCOUNT_OLD_PRICE}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fbbf24" }}>{copy.now}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontFamily: "'Bebas Neue','Outfit',sans-serif", fontSize: 34, fontWeight: 400, color: "#ffffff", lineHeight: 1 }}>{DISCOUNT_NEW_PRICE}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>{copy.perYear}</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "#4ade80", marginTop: 4 }}>
                {copy.savings("$13.50")}
              </div>
            </div>

            {/* Code + CTA */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
              <motion.button
                onClick={copyCode}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                aria-label={copy.copyLabel}
                style={{
                  flex: "1 1 130px",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                  background: copied ? "rgba(34,197,94,0.14)" : "rgba(255,255,255,0.05)",
                  border: `1px dashed ${copied ? "rgba(34,197,94,0.55)" : "rgba(255,255,255,0.28)"}`,
                  borderRadius: 10, padding: "10px 12px",
                  cursor: "pointer", transition: "background 0.2s, border-color 0.2s",
                }}
              >
                <span style={{ fontFamily: "'JetBrains Mono','Consolas',monospace", fontSize: 12.5, fontWeight: 700, letterSpacing: "0.05em", color: "#ffffff" }}>
                  {DISCOUNT_CODE}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: copied ? "#4ade80" : "rgba(255,255,255,0.45)" }}>
                  {copied ? copy.copiedLabel : copy.copyLabel}
                </span>
              </motion.button>

              <motion.a
                href={DISCOUNT_CHECKOUT_URL}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -1, boxShadow: "0 10px 26px -4px rgba(239,68,68,0.55)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.18 }}
                style={{
                  flex: "1 1 130px",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: "linear-gradient(135deg,#ef4444,#f97316)",
                  borderRadius: 10, padding: "10px 16px",
                  color: "#fff8f0", fontSize: 12, fontWeight: 900,
                  textDecoration: "none", textTransform: "uppercase" as const, letterSpacing: "0.05em",
                  boxShadow: "0 4px 14px -4px rgba(239,68,68,0.45)",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {copy.cta}
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
