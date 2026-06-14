import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sendChatMessage, type ChatMessage, type TacticCardData, type TacticSession } from "../services/aiChat";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LanguageContext";
import ChatTacticCard from "./ChatTacticCard";
import ChatWizardCard, { type StrengthOption, type CampOption } from "./ChatWizardCard";

// ── Per-language UI strings ───────────────────────────────────────────────────
const CHAT_I18N = {
  tr: {
    title:        "Osm Analiz Chat",
    statusActive: "Aktif",
    statusGuest:  "Misafir",
    welcomeTitle: "OSM Anti Tactic Chat'e Hoş Geldiniz",
    welcomeDesc:  "Rakip formasyonu, ev/deplasman durumu veya kadro değerini yazarak en iyi anti-taktiği öğrenin.",
    placeholder:  "Rakip formasyon veya taktik sorun...",
    sendLabel:    "Gönder",
    openLabel:    "OSM Anti Tactic Chat'i aç",
    closeLabel:   "Sohbeti kapat",
    suggestions:  ["Rakip 4-3-3 oynuyor, evdeyiz", "Deplasmanda 4-4-2 karşısındayız", "5-2-3 için bu haftalık sliderlar ne?"],
    loadingPhrases: ["Kozmik Oda kuralları taranıyor...", "Casus verileri analiz ediliyor...", "Anti-taktik matrisi işleniyor...", "Haftalık taktik hesaplanıyor...", "Başkan pipeline aktif...", "İmparator yanıtı hazırlıyor..."],
    errAuth:      "Bu özellik için giriş yapmanız gerekiyor.",
    errRate:      "Rate limit aşıldı — lütfen bir dakika bekleyin.",
    errTimeout:   "İstek zaman aşımına uğradı. Tekrar deneyin.",
    errUnavail:   "AI servisi erişilemiyor. Firebase Functions deploy edilmeli.",
    errGeneric:   "Bağlantı hatası. Lütfen tekrar deneyin.",
  },
  en: {
    title:        "Osm Analiz Chat",
    statusActive: "Active",
    statusGuest:  "Guest",
    welcomeTitle: "Welcome to OSM Anti Tactic Chat",
    welcomeDesc:  "Enter the opponent formation, home/away status, or squad value to find the best counter-tactic.",
    placeholder:  "Ask about opponent formation or tactics...",
    sendLabel:    "Send",
    openLabel:    "Open OSM Anti Tactic Chat",
    closeLabel:   "Close chat",
    suggestions:  ["Opponent plays 4-3-3, we're at home", "Away game against 4-4-2", "What are this week's sliders for 5-2-3?"],
    loadingPhrases: ["Scanning Kozmik Oda rules...", "Analyzing spy data...", "Processing anti-tactic matrix...", "Calculating weekly tactic...", "Başkan pipeline active...", "İmparator preparing response..."],
    errAuth:      "You need to log in to use this feature.",
    errRate:      "Rate limit reached — please wait a minute.",
    errTimeout:   "Request timed out. Please try again.",
    errUnavail:   "AI service unavailable. Firebase Functions must be deployed.",
    errGeneric:   "Connection error. Please try again.",
  },
  hu: {
    title:        "Osm Analiz Chat",
    statusActive: "Aktív",
    statusGuest:  "Vendég",
    welcomeTitle: "Üdvözöljük az OSM Anti Taktika Csevegőben",
    welcomeDesc:  "Add meg az ellenfél felállását, hazai/vendég státuszt vagy csapatértéket a legjobb ellenintézkedéshez.",
    placeholder:  "Kérdezz az ellenfél felállásáról vagy taktikáról...",
    sendLabel:    "Küldés",
    openLabel:    "OSM Anti Taktika Chat megnyitása",
    closeLabel:   "Chat bezárása",
    suggestions:  ["Az ellenfél 4-3-3-at játszik, hazai pályán vagyunk", "Vendégmeccsen 4-4-2 ellen", "Milyen csúszkák kellenek erre a hétre 5-2-3-hoz?"],
    loadingPhrases: ["Kozmik Oda szabályainak átvizsgálása...", "Kémadatok elemzése...", "Anti-taktikai mátrix feldolgozása...", "Heti taktika kiszámítása...", "Başkan folyamat aktív...", "İmparator válasz előkészítése..."],
    errAuth:      "Be kell jelentkezni a funkció használatához.",
    errRate:      "Forgalmi korlát elérve — kérjük, várjon egy percet.",
    errTimeout:   "A kérés időtúllépést ért el. Kérjük, próbálja újra.",
    errUnavail:   "AI-szolgáltatás nem elérhető. Firebase Functions telepítése szükséges.",
    errGeneric:   "Kapcsolódási hiba. Kérjük, próbálja újra.",
  },
  ar: {
    title:        "Osm Analiz Chat",
    statusActive: "نشط",
    statusGuest:  "ضيف",
    welcomeTitle: "مرحباً بك في دردشة OSM للتكتيك المضاد",
    welcomeDesc:  "أدخل تشكيلة الخصم وحالة الملعب أو قيمة الفريق للحصول على أفضل تكتيك مضاد.",
    placeholder:  "اسأل عن تشكيلة الخصم أو التكتيك...",
    sendLabel:    "إرسال",
    openLabel:    "افتح دردشة OSM للتكتيك المضاد",
    closeLabel:   "أغلق الدردشة",
    suggestions:  ["الخصم يلعب 4-3-3 ونحن في الملعب الرئيسي", "مباراة خارجية ضد 4-4-2", "ما هي منزلقات هذا الأسبوع لـ 5-2-3؟"],
    loadingPhrases: ["جارٍ فحص قواعد غرفة الكوزميك...", "تحليل بيانات التجسس...", "معالجة مصفوفة التكتيك المضاد...", "حساب التكتيك الأسبوعي...", "خط أنابيب الباشكان نشط...", "الإمبراطور يجهز الرد..."],
    errAuth:      "يجب تسجيل الدخول لاستخدام هذه الميزة.",
    errRate:      "تم الوصول إلى حد الطلبات — يرجى الانتظار دقيقة.",
    errTimeout:   "انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.",
    errUnavail:   "خدمة AI غير متاحة. يجب نشر Firebase Functions.",
    errGeneric:   "خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
  },
  pt: {
    title:        "Osm Analiz Chat",
    statusActive: "Ativo",
    statusGuest:  "Visitante",
    welcomeTitle: "Bem-vindo ao OSM Anti Tactic Chat",
    welcomeDesc:  "Insira a formação do adversário, situação de casa/fora ou valor do elenco para a melhor contra-tática.",
    placeholder:  "Pergunte sobre a formação do adversário ou táticas...",
    sendLabel:    "Enviar",
    openLabel:    "Abrir OSM Anti Tactic Chat",
    closeLabel:   "Fechar chat",
    suggestions:  ["Adversário joga 4-3-3, estamos em casa", "Jogo fora de casa contra 4-4-2", "Quais são os sliders desta semana para 5-2-3?"],
    loadingPhrases: ["Verificando regras da Kozmik Oda...", "Analisando dados de espionagem...", "Processando matriz anti-tática...", "Calculando tática semanal...", "Pipeline do Başkan ativo...", "İmparator preparando resposta..."],
    errAuth:      "Você precisa fazer login para usar este recurso.",
    errRate:      "Limite de taxa atingido — aguarde um minuto.",
    errTimeout:   "Tempo de solicitação esgotado. Tente novamente.",
    errUnavail:   "Serviço de AI indisponível. Firebase Functions deve ser implantado.",
    errGeneric:   "Erro de conexão. Tente novamente.",
  },
} as const;

type ChatLang = keyof typeof CHAT_I18N;

// ── Pre-chat teaser bubble i18n ───────────────────────────────────────────────
const POPUP_I18N: Record<ChatLang, { greeting: string; sub: string }> = {
  tr: { greeting: "Nasıl yardımcı olabilirim?",      sub: "Taktik, formasyon ve daha fazlası için tıkla" },
  en: { greeting: "How can I help you!",              sub: "Click to chat about tactics & formations"     },
  hu: { greeting: "Hogyan segíthetek?",               sub: "Kattints a taktikákról való csevegéshez"      },
  ar: { greeting: "كيف يمكنني مساعدتك؟",              sub: "انقر للدردشة حول التكتيكات والتشكيلات"        },
  pt: { greeting: "Como posso ajudar?",               sub: "Clique para conversar sobre táticas"          },
};

// ── Welcome popup i18n ────────────────────────────────────────────────────────
const WELCOME_I18N: Record<ChatLang, { title: string; sub: string }> = {
  tr: { title: "OsmNextLevel'e Hoş Geldiniz!",  sub: "Rakip formasyonunu analiz et, haftalık sliderları öğren ve en iyi taktiği bul." },
  en: { title: "Welcome to OsmNextLevel!",       sub: "Analyze opponent formations, get weekly slider insights and find the best tactic." },
  hu: { title: "Üdvözöljük az OsmNextLevel-en!", sub: "Elemezze az ellenfél felállását, kapja meg a heti csúszkaértékeket." },
  ar: { title: "!مرحباً بك في OsmNextLevel",     sub: "حلّل تشكيلة الخصم، واحصل على توصيات المنزلقات الأسبوعية." },
  pt: { title: "Bem-vindo ao OsmNextLevel!",     sub: "Analise a formação adversária e obtenha os melhores sliders semanais." },
};

// ── Extended message type with optional tactic card ───────────────────────────
interface ChatEntry extends ChatMessage {
  tacticCard?: TacticCardData | null;
}

// ── Wizard state machine ──────────────────────────────────────────────────────
interface WizardState {
  step: "idle" | "ask_strength" | "ask_camp";
  opponentFormation: string;
  location: "home" | "away";
  strength: StrengthOption | null;
  pendingContent: string;
}

const WIZARD_IDLE: WizardState = {
  step: "idle",
  opponentFormation: "",
  location: "home",
  strength: null,
  pendingContent: "",
};

const FORMATION_RE = /\b(\d-\d-\d(?:-\d)?)\b/;
const HOME_RE  = /\b(ev|evde|evimizde|home|at home|hazai|otthon|casa|em casa|chez nous|heimspiel)\b/i;
const AWAY_RE  = /\b(deplasman|deplasmanda|away|vendég|fora|auswärts|dışarıda|visitor|visitante)\b/i;

function detectWizardTrigger(content: string): { opponentFormation: string; location: "home" | "away" } | null {
  const formMatch = content.match(FORMATION_RE);
  if (!formMatch) return null;
  if (HOME_RE.test(content))  return { opponentFormation: formMatch[1], location: "home" };
  if (AWAY_RE.test(content))  return { opponentFormation: formMatch[1], location: "away" };
  return null;
}

// ── Small SVG icons (no external dep) ────────────────────────────────────────

function TacticalIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      {/* Pitch border */}
      <rect x="2" y="3" width="24" height="22" rx="2.5" stroke="rgba(255,255,255,0.65)" strokeWidth="1.3"/>
      {/* Center line */}
      <line x1="14" y1="3" x2="14" y2="25" stroke="rgba(255,255,255,0.38)" strokeWidth="1.1"/>
      {/* Center circle */}
      <circle cx="14" cy="14" r="3.8" stroke="rgba(255,255,255,0.38)" strokeWidth="1.1"/>
      {/* Forwards — 3 bright dots right */}
      <circle cx="21.5" cy="8"  r="2.3" fill="white"/>
      <circle cx="21.5" cy="14" r="2.3" fill="white"/>
      <circle cx="21.5" cy="20" r="2.3" fill="white"/>
      {/* Midfield pair — 2 dimmer dots left */}
      <circle cx="6.5"  cy="11" r="1.9" fill="rgba(255,255,255,0.72)"/>
      <circle cx="6.5"  cy="17" r="1.9" fill="rgba(255,255,255,0.72)"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function BotIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <line x1="12" y1="7" x2="12" y2="11" />
      <line x1="8" y1="16" x2="8" y2="16" strokeWidth="3" />
      <line x1="16" y1="16" x2="16" y2="16" strokeWidth="3" />
    </svg>
  );
}

export default function ChatWidget() {
  const { user } = useAuth();
  const { lang }  = useLang();
  const s = CHAT_I18N[(lang as ChatLang) in CHAT_I18N ? (lang as ChatLang) : "en"];

  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState<ChatEntry[]>([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [error, setError]         = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [wizard, setWizard]       = useState<WizardState>(WIZARD_IDLE);

  const [showWelcome, setShowWelcome] = useState(false);
  const hasShownWelcome = useRef(false);

  const [showTeaser, setShowTeaser] = useState(false);
  const teaserShownRef = useRef(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages / loading / wizard state change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, wizard.step]);

  // Show teaser bubble 2.5 s after page load — once per session
  useEffect(() => {
    if (teaserShownRef.current) return;
    const t = setTimeout(() => {
      if (!teaserShownRef.current) {
        teaserShownRef.current = true;
        setShowTeaser(true);
      }
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  // Auto-dismiss teaser after 8 s
  useEffect(() => {
    if (!showTeaser) return;
    const t = setTimeout(() => setShowTeaser(false), 8000);
    return () => clearTimeout(t);
  }, [showTeaser]);

  // Focus input when panel opens + trigger welcome popup on first open
  useEffect(() => {
    if (open) {
      setShowTeaser(false);
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 300);
      if (!hasShownWelcome.current) {
        hasShownWelcome.current = true;
        setShowWelcome(true);
        const t = setTimeout(() => setShowWelcome(false), 4000);
        return () => clearTimeout(t);
      }
    }
  }, [open]);

  // Cycle loading phrases
  useEffect(() => {
    if (!loading) return;
    setPhraseIdx(0);
    const id = setInterval(() => setPhraseIdx(i => (i + 1) % s.loadingPhrases.length), 1100);
    return () => clearInterval(id);
  }, [loading, s.loadingPhrases.length]);

  // ── Shared API caller (used by both send() and handleCampSelect()) ──────────
  const callApi = useCallback(async (history: ChatEntry[], tacticSession?: TacticSession | null) => {
    setError(null);
    setLoading(true);
    try {
      const { reply, tacticCard } = await sendChatMessage(history, lang, tacticSession);
      setMessages(m => [...m, { role: "assistant", content: reply, tacticCard }]);
      if (!open) setHasUnread(true);
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      const msg  = (err as Error).message ?? "";
      // For rate-limit errors, show retry countdown if available
      const isRateLimit = code.includes("resource-exhausted");
      let rateMsg: string = s.errRate;
      if (isRateLimit && msg.startsWith("rate-limit:")) {
        const secs = parseInt(msg.split(":")[1], 10);
        if (!isNaN(secs)) {
          rateMsg =
            lang === "tr" ? `⏳ AI meşgul. ${secs}s sonra tekrar dene.` :
            lang === "hu" ? `⏳ AI foglalt. Próbáld újra ${secs}s múlva.` :
            lang === "ar" ? `⏳ AI مشغول. أعد المحاولة بعد ${secs} ثانية.` :
            lang === "pt" ? `⏳ AI ocupado. Tente novamente em ${secs}s.` :
                            `⏳ AI busy. Retry in ${secs}s.`;
        }
      }
      setError(
        code.includes("unauthenticated")                           ? s.errAuth    :
        isRateLimit                                                ? rateMsg      :
        code.includes("deadline-exceeded")                         ? s.errTimeout :
        code.includes("not-found") || code.includes("unavailable") ? s.errUnavail :
        s.errGeneric
      );
    } finally {
      setLoading(false);
    }
  }, [lang, open, s]);

  const send = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    // Dismiss any active wizard when user sends a new message
    if (wizard.step !== "idle") setWizard(WIZARD_IDLE);

    const userMsg: ChatEntry = { role: "user", content };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");

    const trigger = detectWizardTrigger(content);
    if (trigger) {
      setWizard({ step: "ask_strength", ...trigger, strength: null, pendingContent: content });
      return;
    }

    await callApi(history);
  }, [input, messages, loading, wizard.step, callApi]);

  const handleStrengthSelect = useCallback((strength: StrengthOption) => {
    setWizard(w => ({ ...w, step: "ask_camp", strength }));
  }, []);

  const handleCampSelect = useCallback(async (campStatus: CampOption) => {
    if (wizard.step !== "ask_camp" || !wizard.strength) return;
    const tacticSession: TacticSession = {
      opponentFormation: wizard.opponentFormation,
      location: wizard.location,
      strength: wizard.strength,
      campStatus,
    };
    setWizard(WIZARD_IDLE);
    await callApi(messages, tacticSession);
  }, [wizard, messages, callApi]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const isGuest = !user;

  return (
    <>
      {/* ── Scoped styles ─────────────────────────────────────────────────── */}
      <style>{`
        .cw-input::placeholder { color: rgba(148,163,184,0.45); }
        .cw-input:focus { outline: none; border-color: rgba(139,92,246,0.55) !important; box-shadow: 0 0 0 3px rgba(139,92,246,0.12); }
        .cw-input:disabled { opacity: 0.55; cursor: not-allowed; }
        .cw-scroll::-webkit-scrollbar { width: 3px; }
        .cw-scroll::-webkit-scrollbar-track { background: transparent; }
        .cw-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); border-radius: 4px; }
        @supports (bottom: env(safe-area-inset-bottom)) {
          .cw-safe-btn { bottom: calc(env(safe-area-inset-bottom) + 20px) !important; }
          .cw-safe-panel { bottom: calc(env(safe-area-inset-bottom) + 92px) !important; }
        }
      `}</style>

      {/* ── Toggle button ─────────────────────────────────────────────────── */}
      <div
        className="cw-safe-btn"
        style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999 }}
      >
        {/* Radial glow — pulses softly behind button */}
        <motion.div
          animate={{ scale: [1, 1.55, 1], opacity: [0.42, 0, 0.42] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          style={{
            position: "absolute", inset: -18, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.6) 0%, rgba(99,102,241,0.22) 45%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Rotating arc ring */}
        <motion.div
          animate={{ rotate: open ? 0 : 360 }}
          transition={{ duration: 9, repeat: open ? 0 : Infinity, ease: "linear" }}
          style={{
            position: "absolute", inset: -3, borderRadius: "50%",
            background: "conic-gradient(from 0deg, rgba(139,92,246,0) 0%, rgba(139,92,246,0.85) 28%, rgba(99,102,241,0.85) 55%, rgba(139,92,246,0) 100%)",
            pointerEvents: "none",
          }}
        />
        {/* Ring inner mask */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "linear-gradient(145deg,#1a1040,#0d0a26)",
          pointerEvents: "none",
        }} />

        {/* Main clickable button */}
        <motion.button
          onClick={() => setOpen(v => !v)}
          whileHover={{ scale: 1.09 }}
          whileTap={{ scale: 0.91 }}
          style={{
            position: "relative",
            width: 62, height: 62, borderRadius: "50%",
            background: open
              ? "linear-gradient(145deg, #3730a3 0%, #5b21b6 55%, #6d28d9 100%)"
              : "linear-gradient(145deg, #4f46e5 0%, #7c3aed 52%, #8b5cf6 100%)",
            border: "1.5px solid rgba(167,139,250,0.35)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff",
            boxShadow: "0 8px 30px rgba(99,102,241,0.6), 0 3px 10px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2)",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
            overflow: "hidden",
          }}
          aria-label={open ? s.closeLabel : s.openLabel}
        >
          {/* Specular shimmer */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "46%",
            borderRadius: "31px 31px 50% 50%",
            background: "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 100%)",
            pointerEvents: "none",
          }} />

          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : "tactical"}
              initial={{ opacity: 0, rotate: -50, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0,   scale: 1   }}
              exit={{   opacity: 0, rotate:  50, scale: 0.5  }}
              transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}
            >
              {open ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <TacticalIcon />
              )}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        {/* Unread indicator */}
        <AnimatePresence>
          {hasUnread && !open && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              style={{
                position: "absolute", top: 1, right: 1,
                width: 14, height: 14, borderRadius: "50%",
                background: "linear-gradient(135deg, #f43f5e, #ef4444)",
                border: "2.5px solid #0a0820",
                boxShadow: "0 2px 8px rgba(244,63,94,0.65)",
                pointerEvents: "none",
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Pre-chat teaser bubble ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showTeaser && !open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.86 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9, transition: { duration: 0.17 } }}
            transition={{ type: "spring", stiffness: 340, damping: 22 }}
            onClick={() => setOpen(true)}
            style={{
              position: "fixed",
              bottom: 98,
              right: 20,
              zIndex: 9997,
              width: 230,
              maxWidth: "calc(100vw - 40px)",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
              userSelect: "none",
            }}
          >
            {/* Bubble card */}
            <div style={{
              position: "relative",
              background: "linear-gradient(145deg, rgba(12,14,42,0.97), rgba(9,11,33,0.97))",
              backdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(139,92,246,0.4)",
              borderRadius: 16,
              padding: "12px 34px 11px 12px",
              boxShadow: "0 20px 56px rgba(0,0,0,0.68), 0 0 0 1px rgba(99,102,241,0.07), inset 0 1px 0 rgba(255,255,255,0.07)",
              overflow: "hidden",
            }}>
              {/* Dismiss button */}
              <button
                onClick={e => { e.stopPropagation(); setShowTeaser(false); }}
                aria-label="Dismiss"
                style={{
                  position: "absolute", top: 7, right: 7,
                  width: 22, height: 22, borderRadius: "50%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(148,163,184,0.55)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, lineHeight: 1,
                  WebkitTapHighlightColor: "transparent",
                  flexShrink: 0,
                }}
              >✕</button>

              {/* Avatar + text row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Pulsing bot avatar */}
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 0px rgba(99,102,241,0.55)",
                      "0 0 0 7px rgba(99,102,241,0)",
                      "0 0 0 0px rgba(99,102,241,0)",
                    ],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 18,
                  }}
                >⚽</motion.div>

                {/* Text block */}
                <div
                  style={{
                    flex: 1, minWidth: 0,
                    direction: lang === "ar" ? "rtl" : "ltr",
                    textAlign: lang === "ar" ? "right" : "left",
                  }}
                >
                  <motion.p
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                      color: "#e2e8f0", fontWeight: 700, fontSize: 13.5,
                      lineHeight: 1.25, margin: 0, letterSpacing: "-0.01em",
                    }}
                  >
                    {POPUP_I18N[(lang as ChatLang) in POPUP_I18N ? (lang as ChatLang) : "en"].greeting}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    style={{
                      color: "#7c7fef", fontSize: 11, margin: "3px 0 0",
                      lineHeight: 1.42, fontWeight: 500,
                    }}
                  >
                    {POPUP_I18N[(lang as ChatLang) in POPUP_I18N ? (lang as ChatLang) : "en"].sub}
                  </motion.p>
                </div>
              </div>

              {/* Auto-dismiss progress bar */}
              <div style={{
                marginTop: 11, height: 2, borderRadius: 99,
                background: "rgba(255,255,255,0.07)", overflow: "hidden",
              }}>
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 7.6, ease: "linear", delay: 0.4 }}
                  style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #6366f1, #a78bfa)" }}
                />
              </div>
            </div>

            {/* Speech-bubble tail arrow (border layer + fill layer) */}
            <div style={{ position: "relative", height: 9 }}>
              <div style={{
                position: "absolute", top: 0, right: 22,
                width: 0, height: 0,
                borderLeft: "9px solid transparent",
                borderRight: "9px solid transparent",
                borderTop: "9px solid rgba(139,92,246,0.4)",
              }} />
              <div style={{
                position: "absolute", top: 1, right: 23,
                width: 0, height: 0,
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: "8px solid rgba(9,11,33,0.97)",
              }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat panel ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="cw-safe-panel"
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 32, scale: 0.96  }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed", bottom: 92, right: 20, zIndex: 9998,
              width: 390, maxWidth: "calc(100vw - 28px)",
              height: 560, maxHeight: "calc(100dvh - 130px)",
              borderRadius: 22,
              background: "rgba(9, 11, 33, 0.93)",
              backdropFilter: "blur(28px) saturate(180%)",
              border: "1px solid rgba(139,92,246,0.22)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
              display: "flex", flexDirection: "column", overflow: "hidden",
            }}
          >
            {/* ── Welcome popup ───────────────────────────────────────────── */}
            <AnimatePresence>
              {showWelcome && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    position: "absolute", inset: 0, zIndex: 50,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(5,6,22,0.82)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 22,
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.78, opacity: 0, y: 20 }}
                    animate={{ scale: 1,    opacity: 1, y: 0  }}
                    exit={{   scale: 0.88,  opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
                    style={{
                      margin: "0 22px",
                      padding: "30px 24px 24px",
                      borderRadius: 22,
                      background: "linear-gradient(145deg, rgba(99,102,241,0.14), rgba(139,92,246,0.08))",
                      border: "1px solid rgba(139,92,246,0.38)",
                      boxShadow: "0 28px 72px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.09)",
                      textAlign: "center",
                      position: "relative",
                    }}
                  >
                    {/* Close button */}
                    <button
                      onClick={() => setShowWelcome(false)}
                      style={{
                        position: "absolute", top: 11, right: 11,
                        width: 28, height: 28, borderRadius: "50%",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#64748b", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, lineHeight: 1,
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >✕</button>

                    {/* Animated icon */}
                    <motion.div
                      animate={{ scale: [1, 1.12, 1], rotate: [0, -6, 6, -3, 0] }}
                      transition={{ duration: 0.7, delay: 0.25 }}
                      style={{
                        width: 68, height: 68, borderRadius: 20,
                        background: "linear-gradient(145deg, #4f46e5, #7c3aed)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 18px",
                        boxShadow: "0 10px 36px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.22)",
                        fontSize: 32,
                      }}
                    >⚽</motion.div>

                    {/* Title */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.22 }}
                      style={{ color: "#e2e8f0", fontWeight: 800, fontSize: 18, letterSpacing: "-0.01em", marginBottom: 9, lineHeight: 1.25 }}
                    >
                      {(() => {
                        const wl = WELCOME_I18N[(lang as ChatLang) in WELCOME_I18N ? (lang as ChatLang) : "en"];
                        const parts = wl.title.split("OsmNextLevel");
                        return <>{parts[0]}<span style={{ color: "#a78bfa" }}>OsmNextLevel</span>{parts[1]}</>;
                      })()}
                    </motion.div>

                    {/* Subtitle */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.32 }}
                      style={{ color: "#64748b", fontSize: 12.5, lineHeight: 1.6, marginBottom: 22 }}
                    >
                      {WELCOME_I18N[(lang as ChatLang) in WELCOME_I18N ? (lang as ChatLang) : "en"].sub}
                    </motion.div>

                    {/* Auto-close progress bar */}
                    <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 3.7, ease: "linear", delay: 0.1 }}
                        style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #6366f1, #a78bfa)" }}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div style={{
              padding: "14px 18px",
              background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.07))",
              borderBottom: "1px solid rgba(139,92,246,0.18)",
              display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", flexShrink: 0,
                boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
              }}>
                <BotIcon />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15, lineHeight: 1.2, letterSpacing: "0.04em" }}>
                  {s.title}
                </div>
              </div>
              {/* Live indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: isGuest ? "#f59e0b" : "#22c55e",
                    display: "block",
                    boxShadow: `0 0 8px ${isGuest ? "#f59e0b" : "#22c55e"}`,
                  }}
                />
                <span style={{ color: "#94a3b8", fontSize: 11 }}>
                  {isGuest ? s.statusGuest : s.statusActive}
                </span>
              </div>
            </div>

            {/* ── Messages ────────────────────────────────────────────────── */}
            <div
              className="cw-scroll"
              style={{
                flex: 1, overflowY: "auto",
                padding: "14px 14px 6px",
                display: "flex", flexDirection: "column", gap: 10,
              }}
            >
              {/* Welcome card */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    padding: "18px 16px",
                    borderRadius: 16,
                    background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))",
                    border: "1px solid rgba(99,102,241,0.15)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 30, marginBottom: 8 }}>🏆</div>
                  <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14, marginBottom: 5 }}>
                    {s.welcomeTitle}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: 12.5, lineHeight: 1.6 }}>
                    {s.welcomeDesc}
                  </div>
                </motion.div>
              )}

              {/* Suggestion chips — quick-start examples, always visible on empty state */}
              {messages.length === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {s.suggestions.map((suggestion) => (
                    <motion.button
                      key={suggestion}
                      onClick={() => send(suggestion)}
                      disabled={loading}
                      whileHover={{ scale: 1.01, borderColor: "rgba(139,92,246,0.5)" }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        textAlign: "left",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 10, padding: "8px 12px",
                        color: "#94a3b8", fontSize: 12.5,
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "border-color 0.15s",
                      }}
                    >
                      💬 {suggestion}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Message bubbles */}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div style={{
                    maxWidth: "83%",
                    padding: "9px 13px",
                    borderRadius: msg.role === "user"
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                    background: msg.role === "user"
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "rgba(255,255,255,0.055)",
                    border: msg.role === "assistant"
                      ? "1px solid rgba(255,255,255,0.07)"
                      : "none",
                    color: msg.role === "user" ? "#fff" : "#cbd5e1",
                    fontSize: 13.5, lineHeight: 1.56,
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                    boxShadow: msg.role === "user"
                      ? "0 4px 16px rgba(99,102,241,0.3)"
                      : "none",
                  }}>
                    {msg.content}
                  </div>
                  {/* Tactic card — rendered below assistant messages when available */}
                  {msg.role === "assistant" && msg.tacticCard && (
                    <div style={{ maxWidth: "92%", width: "100%" }}>
                      <ChatTacticCard data={msg.tacticCard} />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Wizard card — interactive step-by-step selection */}
              <AnimatePresence>
                {wizard.step !== "idle" && !loading && (
                  <ChatWizardCard
                    step={wizard.step as "ask_strength" | "ask_camp"}
                    lang={lang}
                    opponentFormation={wizard.opponentFormation}
                    location={wizard.location}
                    onStrengthSelect={handleStrengthSelect}
                    onCampSelect={handleCampSelect}
                  />
                )}
              </AnimatePresence>

              {/* Loading state */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ display: "flex", justifyContent: "flex-start" }}
                  >
                    <div style={{
                      padding: "10px 14px",
                      borderRadius: "18px 18px 18px 4px",
                      background: "rgba(255,255,255,0.055)",
                      border: "1px solid rgba(139,92,246,0.18)",
                      display: "flex", flexDirection: "column", gap: 7,
                      maxWidth: "83%",
                    }}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={phraseIdx}
                          initial={{ opacity: 0, y: 3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -3 }}
                          transition={{ duration: 0.22 }}
                          style={{ color: "#a78bfa", fontSize: 11.5, fontStyle: "italic" }}
                        >
                          {s.loadingPhrases[phraseIdx]}
                        </motion.div>
                      </AnimatePresence>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        {[0, 1, 2].map(j => (
                          <motion.span
                            key={j}
                            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                            transition={{ duration: 0.75, delay: j * 0.14, repeat: Infinity }}
                            style={{
                              width: 5, height: 5, borderRadius: "50%",
                              background: "#8b5cf6", display: "block",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      padding: "9px 13px",
                      borderRadius: 12,
                      background: "rgba(239,68,68,0.09)",
                      border: "1px solid rgba(239,68,68,0.22)",
                      color: "#fca5a5", fontSize: 12.5,
                      display: "flex", alignItems: "flex-start", gap: 6,
                    }}
                  >
                    <span style={{ flexShrink: 0 }}>⚠️</span>
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* ── Input area ──────────────────────────────────────────────── */}
            <div style={{
              padding: "10px 12px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(0,0,0,0.25)",
              display: "flex", gap: 8, alignItems: "center", flexShrink: 0,
            }}>
              <input
                ref={inputRef}
                className="cw-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder={s.placeholder}
                disabled={loading}
                maxLength={500}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(139,92,246,0.22)",
                  borderRadius: 12,
                  padding: "9px 13px",
                  color: "#e2e8f0", fontSize: 13,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
              />
              <motion.button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                whileHover={!input.trim() || loading ? {} : { scale: 1.06 }}
                whileTap={!input.trim() || loading ? {} : { scale: 0.93 }}
                style={{
                  width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                  background: !input.trim() || loading
                    ? "rgba(99,102,241,0.2)"
                    : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  border: "none",
                  cursor: !input.trim() || loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: !input.trim() || loading ? "rgba(148,163,184,0.5)" : "#fff",
                  transition: "background 0.2s",
                  boxShadow: !input.trim() || loading
                    ? "none"
                    : "0 4px 12px rgba(99,102,241,0.4)",
                }}
                aria-label={s.sendLabel}
              >
                <SendIcon />
              </motion.button>
            </div>

            {/* ── Footer branding ──────────────────────────────────────────── */}
            <div style={{
              padding: "5px 14px 8px",
              background: "rgba(0,0,0,0.25)",
              display: "flex", justifyContent: "center",
            }}>
              <span style={{ color: "rgba(148,163,184,0.3)", fontSize: 10, letterSpacing: "0.04em" }}>
                OSM Next Level · Kozmik Oda v2 · Başkan Pipeline
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
