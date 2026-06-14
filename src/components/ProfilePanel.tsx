import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useLang } from "../contexts/LanguageContext";
import { COUNTRIES } from "../data/countries";
import { FORMATIONS, emptyProfile, type ManagerProfile } from "../data/profile";
import { SignInCard2 } from "./ui/sign-in-card-2";

export default function ProfilePanel() {
  const { user, profile, loading, signIn, signUp, signInWithGoogle, logOut, saveProfile } = useAuth();
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <button className="flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 text-[11px] font-bold text-stone-400">
        ...
      </button>
    );
  }

  const country = COUNTRIES.find((c) => c.code === profile?.countryCode) || COUNTRIES[0];

  return (
    <>
      {user ? (
        <button
          onClick={() => setOpen(true)}
          className="flex h-9 items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 text-[11px] font-bold text-sky-100 transition hover:border-sky-400/60 hover:bg-sky-400/15"
          title={t("nav.profile")}
        >
          <span className="text-base leading-none">{country.flag}</span>
          <span className="hidden max-w-[100px] truncate sm:inline">{profile?.nick || user.email?.split("@")[0]}</span>
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex h-9 items-center gap-2 rounded-full border border-sky-400/40 bg-sky-400/10 px-4 text-[11px] font-black uppercase tracking-widest text-sky-100 transition hover:border-sky-400/70 hover:bg-sky-400/18"
          title={`${t("nav.login")} / ${t("nav.signup")}`}
        >
          <span>👤</span>
          <span className="whitespace-nowrap">
            {t("nav.login")} <span className="opacity-50">/</span> {t("nav.signup")}
          </span>
        </button>
      )}

      {open && createPortal(
        <AnimatePresence>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] overflow-y-auto bg-black/85 backdrop-blur-md"
          >
            <div onClick={() => setOpen(false)} className="fixed inset-0 z-0" aria-hidden="true" />

            <div className="flex min-h-full items-end justify-center sm:items-center sm:p-6">
              {!user ? (
                <div className="relative z-10 w-full max-w-[400px] px-4 pb-4 sm:px-0 sm:pb-0">
                  <SignInCard2
                    t={t}
                    onSignIn={signIn}
                    onSignUp={signUp}
                    onGoogle={async () => { await signInWithGoogle(); setOpen(false); }}
                    onClose={() => setOpen(false)}
                  />
                </div>
              ) : (
                <div className="relative z-10 w-full max-w-md rounded-t-3xl border border-white/10 bg-[#0c0f17] shadow-2xl sm:rounded-3xl">
                  <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                    <h3 className="font-display text-lg font-black text-white sm:text-xl">
                      {t("nav.profile")}
                    </h3>
                    <button
                      onClick={() => setOpen(false)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white transition hover:border-red-400/40 hover:bg-red-500/10"
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-6">
                    <ProfileForm
                      t={t}
                      profile={profile || emptyProfile(user.uid)}
                      email={user.email}
                      onSave={async (p) => { await saveProfile(p); setOpen(false); }}
                      onLogout={async () => { await logOut(); setOpen(false); }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}


function ProfileForm({
  profile,
  email,
  onSave,
  onLogout,
  t,
}: {
  profile: ManagerProfile;
  email: string | null;
  onSave: (p: ManagerProfile) => Promise<void>;
  onLogout: () => Promise<void>;
  t: (key: string) => string;
}) {
  const [nick, setNick]                         = useState(profile.nick || "");
  const [countryCode, setCountryCode]           = useState(profile.countryCode || "TR");
  const [favoriteFormation, setFavoriteFormation] = useState(profile.favoriteFormation || "5-2-3");
  const [osmNick, setOsmNick]                   = useState(profile.osmNick || "");
  const [saved, setSaved]                       = useState(false);
  const [busy, setBusy]                         = useState(false);
  const [error, setError]                       = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (nick.trim().length < 2) { setError(t("auth.nickMin")); return; }
    setBusy(true);
    try {
      await onSave({ ...profile, nick: nick.trim().slice(0, 30), countryCode, favoriteFormation, osmNick: osmNick.trim().slice(0, 30) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError(t("auth.errSave"));
    } finally {
      setBusy(false);
    }
  };

  const currentCountry = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-sky-400/30 bg-sky-400/10 text-2xl">
          {currentCountry.flag}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-lg font-black text-white">{nick || "Manager"}</div>
          <div className="truncate text-xs text-stone-500">{email}</div>
        </div>
      </div>

      <Field label={t("auth.managerNick")}>
        <input
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          placeholder={t("auth.nickPlaceholder")}
          maxLength={30}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-sky-400/60"
        />
      </Field>

      <Field label={t("auth.country")}>
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-sky-400/60"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code} className="bg-stone-950">
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t("auth.favFormation")}>
        <select
          value={favoriteFormation}
          onChange={(e) => setFavoriteFormation(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-sky-400/60"
        >
          {FORMATIONS.map((f) => (
            <option key={f} value={f} className="bg-stone-950">{f}</option>
          ))}
        </select>
      </Field>

      <Field label={t("auth.osmNick")}>
        <input
          value={osmNick}
          onChange={(e) => setOsmNick(e.target.value)}
          placeholder={t("auth.osmNickPlaceholder")}
          maxLength={30}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-sky-400/60"
        />
      </Field>

      {error && <p className="text-sm text-red-300">{error}</p>}
      {saved && <p className="text-sm text-emerald-300">{t("auth.saved")}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={busy}
          className="flex-1 rounded-xl bg-sky-500 py-3 text-sm font-black uppercase tracking-widest text-slate-950 disabled:opacity-50"
        >
          {busy ? t("auth.saving") : t("auth.save")}
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-xl border border-white/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-stone-400 hover:text-white"
        >
          {t("auth.signOut")}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-stone-500">{label}</span>
      {children}
    </label>
  );
}
