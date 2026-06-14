import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, X } from "lucide-react";
import { cn } from "../../lib/utils";

// ── Inline Input primitive (shadcn-style, no dependency) ──────────────────────

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full min-w-0 rounded-lg border bg-transparent px-3 py-1 text-sm font-medium tracking-wide text-white outline-none transition-[color,box-shadow] placeholder:text-white/30",
        "border-white/10 bg-white/5 focus:border-cyan-400/40 focus:bg-white/10 focus:ring-0",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface SignInCard2Props {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
  onGoogle: () => Promise<void>;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SignInCard2({ onSignIn, onSignUp, onGoogle, onClose }: SignInCard2Props) {
  const [mode, setMode]               = useState<"in" | "up">("in");
  const [showPassword, setShowPass]   = useState(false);
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [isLoading, setIsLoading]     = useState(false);
  const [focusedInput, setFocused]    = useState<string | null>(null);
  const [error, setError]             = useState("");

  // 3-D tilt — ported directly from 21st.dev source
  const mouseX  = useMotionValue(0);
  const mouseY  = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const handleGoogleClick = async () => {
    setError("");
    setIsLoading(true);
    try {
      await onGoogle();
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      if (mode === "in") await onSignIn(email.trim(), password);
      else await onSignUp(email.trim(), password);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      if (code.includes("invalid-email"))       setError("Invalid email address.");
      else if (code.includes("already"))         setError("Email already registered — sign in instead.");
      else if (code.includes("wrong-password") || code.includes("invalid-credential"))
                                                 setError("Incorrect email or password.");
      else if (code.includes("user-not-found")) setError("No account found — sign up instead.");
      else                                       setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm"
      style={{ perspective: 1500 }}
    >
      <motion.div
        className="relative"
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative group">

          {/* ── Outer glow pulse ── */}
          <motion.div
            className="absolute -inset-[1px] rounded-2xl"
            animate={{ boxShadow: [
              "0 0 10px 2px rgba(0,212,255,0.04)",
              "0 0 22px 6px rgba(0,212,255,0.12)",
              "0 0 10px 2px rgba(0,212,255,0.04)",
            ], opacity: [0.3, 0.55, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
          />

          {/* ── Animated border light beams (ported 1-to-1 from 21st.dev) ── */}
          <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">

            {/* Top beam — travels left → right */}
            <motion.div
              className="absolute top-0 left-0 h-[2px] w-[50%] bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-80"
              style={{ filter: "blur(1.5px)" }}
              animate={{
                left: ["-50%", "100%"],
                opacity: [0.3, 0.85, 0.3],
                filter: ["blur(1px)", "blur(3px)", "blur(1px)"],
              }}
              transition={{
                left:    { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 },
                opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror" },
                filter:  { duration: 1.5, repeat: Infinity, repeatType: "mirror" },
              }}
            />

            {/* Right beam — travels top → bottom */}
            <motion.div
              className="absolute top-0 right-0 h-[50%] w-[2px] bg-gradient-to-b from-transparent via-cyan-300 to-transparent opacity-80"
              style={{ filter: "blur(1.5px)" }}
              animate={{
                top:     ["-50%", "100%"],
                opacity: [0.3, 0.85, 0.3],
                filter:  ["blur(1px)", "blur(3px)", "blur(1px)"],
              }}
              transition={{
                top:     { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 0.6 },
                opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 0.6 },
                filter:  { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 0.6 },
              }}
            />

            {/* Bottom beam — travels right → left */}
            <motion.div
              className="absolute bottom-0 right-0 h-[2px] w-[50%] bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-80"
              style={{ filter: "blur(1.5px)" }}
              animate={{
                right:   ["-50%", "100%"],
                opacity: [0.3, 0.85, 0.3],
                filter:  ["blur(1px)", "blur(3px)", "blur(1px)"],
              }}
              transition={{
                right:   { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.2 },
                opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.2 },
                filter:  { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.2 },
              }}
            />

            {/* Left beam — travels bottom → top */}
            <motion.div
              className="absolute bottom-0 left-0 h-[50%] w-[2px] bg-gradient-to-b from-transparent via-cyan-300 to-transparent opacity-80"
              style={{ filter: "blur(1.5px)" }}
              animate={{
                bottom:  ["-50%", "100%"],
                opacity: [0.3, 0.85, 0.3],
                filter:  ["blur(1px)", "blur(3px)", "blur(1px)"],
              }}
              transition={{
                bottom:  { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.8 },
                opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.8 },
                filter:  { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.8 },
              }}
            />

            {/* Corner glints */}
            {[
              "top-0 left-0 w-[5px] h-[5px] bg-cyan-300/40 blur-[1px]",
              "top-0 right-0 w-[8px] h-[8px] bg-cyan-200/60 blur-[2px]",
              "bottom-0 right-0 w-[8px] h-[8px] bg-cyan-200/60 blur-[2px]",
              "bottom-0 left-0 w-[5px] h-[5px] bg-cyan-300/40 blur-[1px]",
            ].map((cls, i) => (
              <motion.div
                key={i}
                className={`absolute rounded-full ${cls}`}
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2 + i * 0.2, repeat: Infinity, repeatType: "mirror", delay: i * 0.5 }}
              />
            ))}
          </div>

          {/* ── Card body ── */}
          <div
            className="relative rounded-2xl p-6 border border-white/[0.06] overflow-hidden"
            style={{
              background: "linear-gradient(165deg, rgba(4,13,30,0.97) 0%, rgba(2,8,20,0.98) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {/* Grid texture */}
            <div
              className="absolute inset-0 opacity-[0.025] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-white/40 transition hover:border-white/25 hover:text-white/80"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* ── Header ── */}
            <div className="mb-5 space-y-1 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.7 }}
                className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-400/[0.08] relative overflow-hidden"
              >
                <span className="relative z-10 text-lg font-black text-cyan-300">⚽</span>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/15 to-transparent" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-xl font-extrabold tracking-wide text-white"
                style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
              >
                {mode === "in" ? "Welcome Back" : "Join the Squad"}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-xs font-medium tracking-normal text-white/50"
              >
                {mode === "in"
                  ? "Sign in to unlock exclusive tactics"
                  : "Create your free manager profile"}
              </motion.p>
            </div>

            {/* ── Mode toggle ── */}
            <div className="mb-4 grid grid-cols-2 gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
              {(["in", "up"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(""); }}
                  className={cn(
                    "rounded-lg py-2.5 text-[11px] font-black uppercase tracking-widest transition-all duration-200",
                    mode === m
                      ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 shadow-[0_2px_12px_rgba(0,212,255,0.35)]"
                      : "text-white/40 hover:text-white/70"
                  )}
                >
                  {m === "in" ? "🔑 Sign In" : "✨ Sign Up"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">

              {/* ── Google button ── */}
              <motion.button
                type="button"
                onClick={handleGoogleClick}
                disabled={isLoading}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="group/g relative w-full overflow-hidden rounded-lg border border-white/[0.12] bg-white py-2.5 text-sm font-bold tracking-wide text-stone-900 transition-all duration-200 hover:bg-stone-50 disabled:opacity-50"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  <span className="text-base font-black leading-none">G</span>
                  Continue with Google
                </span>
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-0.5">
                <span className="h-px flex-1 bg-white/[0.07]" />
                <motion.span
                  className="text-[10px] font-bold uppercase tracking-widest text-white/30"
                  animate={{ opacity: [0.6, 0.9, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  or with email
                </motion.span>
                <span className="h-px flex-1 bg-white/[0.07]" />
              </div>

              {/* ── Email input ── */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.008 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Mail
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200",
                    focusedInput === "email" ? "text-cyan-300" : "text-white/30"
                  )}
                />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  className="pl-10"
                  required
                />
                {focusedInput === "email" && (
                  <motion.div
                    layoutId="input-focus"
                    className="absolute inset-0 rounded-lg bg-cyan-400/[0.04] pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                )}
              </motion.div>

              {/* ── Password input ── */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.008 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Lock
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200",
                    focusedInput === "password" ? "text-cyan-300" : "text-white/30"
                  )}
                />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "up" ? "Password (min. 6 chars)" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/70"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword
                    ? <Eye className="h-4 w-4" />
                    : <EyeOff className="h-4 w-4" />}
                </button>
                {focusedInput === "password" && (
                  <motion.div
                    layoutId="input-focus"
                    className="absolute inset-0 rounded-lg bg-cyan-400/[0.04] pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                )}
              </motion.div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    key="err"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-medium tracking-normal text-red-300"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* ── Submit button ── */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group/btn relative mt-1 w-full overflow-hidden rounded-lg py-2.5 text-sm font-black uppercase tracking-widest text-slate-950 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #00D4FF 0%, #00A3FF 100%)",
                  boxShadow: "0 4px 20px rgba(0,212,255,0.35)",
                }}
              >
                {/* Shimmer sweep */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8 }}
                  style={{ opacity: isLoading ? 1 : 0, transition: "opacity 0.3s" }}
                />

                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="spin"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center"
                    >
                      <div className="h-4 w-4 rounded-full border-2 border-slate-900/50 border-t-transparent animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative flex items-center justify-center gap-1.5"
                    >
                      {mode === "in" ? "Sign In" : "Create Account"}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>

            {/* Toggle mode link */}
            <motion.p
              className="mt-4 text-center text-xs font-medium tracking-normal text-white/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              {mode === "in" ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => { setMode(mode === "in" ? "up" : "in"); setError(""); }}
                className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
              >
                {mode === "in" ? "Sign up free" : "Sign in"}
              </button>
            </motion.p>

            {/* Trust note */}
            <p className="mt-3 text-center text-[10px] font-medium tracking-normal text-white/20">
              Join to earn prediction points & unlock community features
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
