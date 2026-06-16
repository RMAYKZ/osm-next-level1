import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { OsmLogo } from "./OsmLogo";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full min-w-0 rounded-xl border bg-transparent px-3 py-1 text-sm font-medium tracking-wide text-white outline-none transition-[color,box-shadow] placeholder:text-white/25",
        "border-white/10 bg-white/[0.04] focus:border-cyan-400/50 focus:bg-white/[0.07] focus:ring-0",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export interface SignInCard2Props {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
  onGoogle: () => Promise<void>;
  onClose: () => void;
  t: (key: string) => string;
}

const BENEFITS = [
  { icon: "👑", key: "auth.benefit1" },
  { icon: "⚽", key: "auth.benefit2" },
  { icon: "🏆", key: "auth.benefit3" },
];

export function SignInCard2({ onSignIn, onSignUp, onGoogle, onClose, t }: SignInCard2Props) {
  const [mode, setMode]             = useState<"in" | "up">("in");
  const [showPassword, setShowPass] = useState(false);
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [focusedInput, setFocused]  = useState<string | null>(null);
  const [error, setError]           = useState("");

  const mouseX  = useMotionValue(0);
  const mouseY  = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [6, -6]);
  const rotateY = useTransform(mouseX, [-300, 300], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const handleGoogleClick = async () => {
    setError(""); setIsLoading(true);
    try { await onGoogle(); }
    catch { setError(t("auth.errGoogleFailed")); }
    finally { setIsLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError(t("auth.errShortPass")); return; }
    setIsLoading(true);
    try {
      if (mode === "in") await onSignIn(email.trim(), password);
      else await onSignUp(email.trim(), password);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      if (code.includes("invalid-email"))         setError(t("auth.errInvalidEmail"));
      else if (code.includes("already"))           setError(t("auth.errAlreadyExists"));
      else if (code.includes("wrong-password") || code.includes("invalid-credential"))
                                                   setError(t("auth.errWrongPassword"));
      else if (code.includes("user-not-found"))    setError(t("auth.errNotFound"));
      else                                         setError(t("auth.errGeneral"));
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (m: "in" | "up") => { setMode(m); setError(""); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[400px]"
      style={{ perspective: 1400 }}
    >
      <motion.div
        className="relative"
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* ── Outer glow ── */}
        <motion.div
          className="absolute -inset-[1px] rounded-2xl"
          animate={{ boxShadow: [
            "0 0 12px 2px rgba(0,212,255,0.05), 0 0 40px 8px rgba(239,68,68,0.03)",
            "0 0 24px 6px rgba(0,212,255,0.14), 0 0 60px 16px rgba(239,68,68,0.07)",
            "0 0 12px 2px rgba(0,212,255,0.05), 0 0 40px 8px rgba(239,68,68,0.03)",
          ], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
        />

        {/* ── Animated border beams ── */}
        <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
          {/* Top */}
          <motion.div className="absolute top-0 left-0 h-[2px] w-[45%] bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-80"
            style={{ filter: "blur(1.5px)" }}
            animate={{ left: ["-45%", "100%"], opacity: [0.2, 0.9, 0.2] }}
            transition={{ left: { duration: 2.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.2 }, opacity: { duration: 1.4, repeat: Infinity, repeatType: "mirror" } }}
          />
          {/* Right */}
          <motion.div className="absolute top-0 right-0 h-[45%] w-[2px] bg-gradient-to-b from-transparent via-cyan-300 to-transparent opacity-80"
            style={{ filter: "blur(1.5px)" }}
            animate={{ top: ["-45%", "100%"], opacity: [0.2, 0.9, 0.2] }}
            transition={{ top: { duration: 2.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.2, delay: 0.7 }, opacity: { duration: 1.4, repeat: Infinity, repeatType: "mirror", delay: 0.7 } }}
          />
          {/* Bottom */}
          <motion.div className="absolute bottom-0 right-0 h-[2px] w-[45%] bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-60"
            style={{ filter: "blur(1.5px)" }}
            animate={{ right: ["-45%", "100%"], opacity: [0.2, 0.7, 0.2] }}
            transition={{ right: { duration: 2.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.2, delay: 1.4 }, opacity: { duration: 1.4, repeat: Infinity, repeatType: "mirror", delay: 1.4 } }}
          />
          {/* Left */}
          <motion.div className="absolute bottom-0 left-0 h-[45%] w-[2px] bg-gradient-to-b from-transparent via-red-400 to-transparent opacity-60"
            style={{ filter: "blur(1.5px)" }}
            animate={{ bottom: ["-45%", "100%"], opacity: [0.2, 0.7, 0.2] }}
            transition={{ bottom: { duration: 2.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.2, delay: 2.1 }, opacity: { duration: 1.4, repeat: Infinity, repeatType: "mirror", delay: 2.1 } }}
          />
          {/* Corner glints */}
          {[
            "top-0 left-0 w-[6px] h-[6px] bg-cyan-300/50",
            "top-0 right-0 w-[8px] h-[8px] bg-cyan-200/70",
            "bottom-0 right-0 w-[8px] h-[8px] bg-red-400/50",
            "bottom-0 left-0 w-[6px] h-[6px] bg-red-300/40",
          ].map((cls, i) => (
            <motion.div key={i} className={`absolute rounded-full blur-[1.5px] ${cls}`}
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 2.2 + i * 0.3, repeat: Infinity, repeatType: "mirror", delay: i * 0.55 }}
            />
          ))}
        </div>

        {/* ── Card body ── */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, rgba(5,10,28,0.98) 0%, rgba(2,6,18,0.99) 100%)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Grid texture */}
          <div className="absolute inset-0 opacity-[0.022] pointer-events-none"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "30px 30px" }}
          />

          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 via-50% to-transparent" />

          {/* Close */}
          <button onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-white/35 transition hover:border-white/25 hover:bg-white/[0.06] hover:text-white/70"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <div className="relative p-6">

            {/* ── Brand header ── */}
            <div className="mb-5 flex flex-col items-center gap-3">
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.65 }}
                style={{
                  width: 52, height: 52, borderRadius: "50%", overflow: "hidden",
                  border: "1.5px solid rgba(34,211,238,0.5)",
                  boxShadow: "0 0 18px rgba(34,211,238,0.25)",
                  flexShrink: 0,
                }}
              >
                <OsmLogo />
              </motion.div>

              <div className="text-center">
                <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(34,211,238,0.55)", marginBottom: 4 }}>
                  OSM NEXT LEVEL
                </div>
                <AnimatePresence mode="wait">
                  <motion.h1 key={mode + "title"}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                    className="text-[1.35rem] font-extrabold tracking-tight text-white"
                  >
                    {mode === "in" ? t("auth.welcomeBack") : t("auth.joinSquad")}
                  </motion.h1>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.p key={mode + "sub"}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, delay: 0.05 }}
                    className="mt-1 text-xs font-medium text-white/40"
                  >
                    {mode === "in" ? t("auth.signInSub") : t("auth.signUpSub")}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* ── Mode toggle ── */}
            <div className="mb-4 grid grid-cols-2 gap-1.5 rounded-xl p-1"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {(["in", "up"] as const).map((m) => (
                <button key={m} type="button" onClick={() => switchMode(m)}
                  className={cn(
                    "relative rounded-lg py-2.5 text-[11px] font-black uppercase tracking-widest transition-all duration-250 overflow-hidden",
                    mode === m ? "text-slate-950" : "text-white/35 hover:text-white/60"
                  )}
                  style={mode === m ? { background: "linear-gradient(135deg,#22d3ee,#3b82f6)", boxShadow: "0 2px 14px rgba(34,211,238,0.32)" } : {}}
                >
                  {mode === m && (
                    <motion.div layoutId="tab-pill" className="absolute inset-0 rounded-lg"
                      style={{ background: "linear-gradient(135deg,#22d3ee,#3b82f6)" }}
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}
                  <span className="relative">
                    {m === "in" ? `🔑 ${t("auth.signIn")}` : `✨ ${t("auth.signUp")}`}
                  </span>
                </button>
              ))}
            </div>

            {/* ── Benefits (sign-up only) ── */}
            <AnimatePresence>
              {mode === "up" && (
                <motion.div
                  key="benefits"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: [0.16,1,0.3,1] }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="flex flex-col gap-1.5 rounded-xl p-3"
                    style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
                    {BENEFITS.map((b, i) => (
                      <motion.div key={b.key}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.06 }}
                        className="flex items-center gap-2.5"
                      >
                        <span style={{ fontSize: 13 }}>{b.icon}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(134,239,172,0.85)" }}>{t(b.key)}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-3">

              {/* ── Google button ── */}
              <motion.button
                type="button" onClick={handleGoogleClick} disabled={isLoading}
                whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
                className="group/g relative w-full overflow-hidden rounded-xl border border-white/15 bg-white py-[10px] text-sm font-bold tracking-wide text-stone-900 transition-all duration-200 hover:bg-stone-50 disabled:opacity-50"
                style={{ boxShadow: "0 2px 12px rgba(255,255,255,0.08)" }}
              >
                <motion.div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0"
                  initial={{ x: "-100%" }} whileHover={{ x: "100%" }}
                  transition={{ duration: 0.85, ease: "easeInOut" }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {t("auth.continueGoogle")}
                </span>
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-0.5">
                <span className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
                <motion.span className="text-[10px] font-bold uppercase tracking-widest text-white/25"
                  animate={{ opacity: [0.5, 0.85, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  {t("auth.orWithEmail")}
                </motion.span>
                <span className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
              </div>

              {/* ── Email ── */}
              <motion.div className="relative" whileHover={{ scale: 1.006 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <Mail className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200", focusedInput === "email" ? "text-cyan-300" : "text-white/25")} />
                <Input type="email" placeholder={t("auth.emailPlaceholder")} value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                  className="pl-10" required autoComplete="email"
                />
                {focusedInput === "email" && (
                  <motion.div layoutId="focus-ring" className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ background: "rgba(34,211,238,0.035)", boxShadow: "inset 0 0 0 1px rgba(34,211,238,0.25)" }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  />
                )}
              </motion.div>

              {/* ── Password ── */}
              <motion.div className="relative" whileHover={{ scale: 1.006 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <Lock className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200", focusedInput === "password" ? "text-cyan-300" : "text-white/25")} />
                <Input type={showPassword ? "text" : "password"}
                  placeholder={mode === "up" ? t("auth.passwordMinPlaceholder") : t("auth.passwordPlaceholder")}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                  className="pl-10 pr-10" required
                  autoComplete={mode === "up" ? "new-password" : "current-password"}
                />
                <button type="button" onClick={() => setShowPass(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 transition-colors hover:text-white/60"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                {focusedInput === "password" && (
                  <motion.div layoutId="focus-ring" className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ background: "rgba(34,211,238,0.035)", boxShadow: "inset 0 0 0 1px rgba(34,211,238,0.25)" }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  />
                )}
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div key="err"
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-2 rounded-lg px-3 py-2"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    <span className="mt-0.5 text-red-400 text-xs">⚠</span>
                    <p className="text-xs font-medium text-red-300">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Submit ── */}
              <motion.button
                type="submit" disabled={isLoading}
                whileHover={{ scale: 1.02, boxShadow: "0 6px 28px rgba(0,212,255,0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="relative mt-1 w-full overflow-hidden rounded-xl py-[11px] text-sm font-black uppercase tracking-widest text-slate-950 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#22d3ee 0%,#3b82f6 100%)", boxShadow: "0 4px 20px rgba(34,211,238,0.3)" }}
              >
                <motion.div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{ x: ["-100%","100%"] }}
                  transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.6 }}
                  style={{ opacity: isLoading ? 1 : 0, transition: "opacity 0.3s" }}
                />
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center justify-center">
                      <div className="h-4 w-4 rounded-full border-2 border-slate-900/50 border-t-transparent animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="relative flex items-center justify-center gap-1.5">
                      {mode === "in" ? t("auth.signIn") : t("auth.createAccount")}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>

            {/* Switch mode link */}
            <motion.p className="mt-4 text-center text-xs font-medium text-white/35"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              {mode === "in" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
              <button type="button" onClick={() => switchMode(mode === "in" ? "up" : "in")}
                className="font-bold text-cyan-400 transition-colors hover:text-cyan-300">
                {mode === "in" ? t("auth.signUpFree") : t("auth.signIn")}
              </button>
            </motion.p>

            {/* Trust note */}
            <p className="mt-3 text-center text-[10px] font-medium text-white/20">
              {t("auth.trustNote")}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
