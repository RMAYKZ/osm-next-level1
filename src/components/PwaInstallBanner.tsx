import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const LABELS: Record<string, { title: string; sub: string; install: string }> = {
  tr: { title: "Uygulamayı Yükle", sub: "Taktiklere çevrimdışı eriş", install: "YÜKLE" },
  en: { title: "Install App", sub: "Access tactics offline", install: "INSTALL" },
  hu: { title: "Alkalmazás telepítése", sub: "Taktikák offline elérése", install: "TELEPÍT" },
  ar: { title: "تثبيت التطبيق", sub: "الوصول إلى التكتيكات دون اتصال", install: "تثبيت" },
  pt: { title: "Instalar Aplicativo", sub: "Acesse táticas offline", install: "INSTALAR" },
};

export function PwaInstallBanner() {
  const { lang } = useLang();
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem("osm-pwa-dismissed") === "1"
  );
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("osm-pwa-dismissed", "1");
  };

  const lbl = LABELS[lang] ?? LABELS.tr;
  const visible = !!prompt && !dismissed && !installed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="pwa-banner"
          initial={{ y: 80, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", duration: 0.45, bounce: 0.18 }}
          style={{
            position: "fixed",
            bottom: 20,
            left: 0,
            right: 0,
            margin: "0 auto",
            zIndex: 9800,
            width: "min(calc(100vw - 32px), 400px)",
            background: "rgba(6,8,28,0.94)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(239,68,68,0.28)",
            borderRadius: 16,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(239,68,68,0.06)",
          }}
        >
          {/* Icon */}
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              flexShrink: 0,
            }}
          >
            ⚽
          </motion.div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 15,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "0.03em",
                lineHeight: 1.2,
              }}
            >
              {lbl.title}
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: "rgba(255,255,255,0.48)",
                marginTop: 3,
                letterSpacing: "0.01em",
              }}
            >
              {lbl.sub}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button
              onClick={handleDismiss}
              aria-label="Kapat"
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.35)",
                cursor: "pointer",
                fontSize: 16,
                padding: "6px 8px",
                borderRadius: 8,
                lineHeight: 1,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)")}
              onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)")}
            >
              ✕
            </button>
            <motion.button
              onClick={handleInstall}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                background: "#ef4444",
                border: "none",
                color: "#1c1917",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 800,
                padding: "9px 16px",
                borderRadius: 9,
                letterSpacing: "0.06em",
                fontFamily: "'Barlow Condensed', sans-serif",
                boxShadow: "0 4px 14px rgba(239,68,68,0.4)",
              }}
            >
              {lbl.install}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
