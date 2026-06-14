import { useEffect, useState } from "react";
import type { Timestamp } from "firebase/firestore";
import type { User } from "firebase/auth";
import { getDb, getAuthInstance } from "../lib/firebase";
import { useLang } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { POINTS_CORRECT, resultToChoice, type Choice } from "../data/scoring";

type MatchStatus = "open" | "closed";
type PredictionChoice = "teamA" | "draw" | "teamB";

interface DailyMatch {
  id: string;
  teamA: string;
  teamB: string;
  competition: string;
  matchDate: string;
  matchTime: string;
  status: MatchStatus;
  omerPick?: string;
  createdAt?: Timestamp;
  // Vote counters (incremented atomically on the match document)
  votesHome?: number;
  votesDraw?: number;
  votesAway?: number;
  totalVotes?: number;
  // Sonuç bilgileri (admin maç bitince doldurur)
  homeScore?: number;
  awayScore?: number;
  resultChoice?: Choice;
  pointsAwarded?: boolean;
}

// DD/MM/YYYY — matches Firestore matchDate field format
const todayKey = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
};

// YYYY-MM-DD — required by <input type="date"> value attribute
const todayInputKey = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

// Convert <input type="date"> output (YYYY-MM-DD) → Firestore format (DD/MM/YYYY)
const inputDateToStored = (iso: string) => {
  const [y, mo, d] = iso.split("-");
  return `${d}/${mo}/${y}`;
};


export default function MatchPredictions() {
  const { t } = useLang();
  const [matches, setMatches] = useState<DailyMatch[]>([]);
  const [allMatches, setAllMatches] = useState<DailyMatch[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [competition, setCompetition] = useState("World Cup");
  const [matchDate, setMatchDate] = useState(todayInputKey()); // YYYY-MM-DD for <input type="date">
  const [matchTime, setMatchTime] = useState("21:00");
  const [omerPick, setOmerPick] = useState("");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let active = true;
    (async () => {
      const [{ onAuthStateChanged }, authInstance] = await Promise.all([
        import("firebase/auth"),
        getAuthInstance(),
      ]);
      if (!active) return;
      unsubscribe = onAuthStateChanged(authInstance, setUser);
    })();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let active = true;
    (async () => {
      const [{ collection, onSnapshot, query, where }, db] = await Promise.all([
        import("firebase/firestore"),
        getDb(),
      ]);
      if (!active) return;
      const dailyQuery = query(collection(db, "matches"), where("matchDate", "==", todayKey()));
      unsubscribe = onSnapshot(dailyQuery, (snapshot) => {
        const list = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as DailyMatch[];
        list.sort((a, b) => a.matchTime.localeCompare(b.matchTime));
        setMatches(list);
      });
    })();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setAllMatches([]);
      return;
    }
    let unsubscribe: (() => void) | undefined;
    let active = true;
    (async () => {
      const [{ collection, onSnapshot }, db] = await Promise.all([
        import("firebase/firestore"),
        getDb(),
      ]);
      if (!active) return;
      unsubscribe = onSnapshot(collection(db, "matches"), (snapshot) => {
        const list = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as DailyMatch[];
        list.sort((a, b) => `${b.matchDate} ${b.matchTime}`.localeCompare(`${a.matchDate} ${a.matchTime}`));
        setAllMatches(list.slice(0, 30));
      });
    })();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [user]);

  const loginAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const [{ signInWithEmailAndPassword }, authInstance] = await Promise.all([
        import("firebase/auth"),
        getAuthInstance(),
      ]);
      await signInWithEmailAndPassword(authInstance, email, password);
      setEmail("");
      setPassword("");
    } catch {
      setError(t("matches.loginError"));
    }
  };

  const handleSignOut = async () => {
    const [{ signOut }, authInstance] = await Promise.all([import("firebase/auth"), getAuthInstance()]);
    await signOut(authInstance);
  };

  const toggleMatchStatus = async (id: string, status: MatchStatus) => {
    const [{ doc, updateDoc }, db] = await Promise.all([import("firebase/firestore"), getDb()]);
    await updateDoc(doc(db, "matches", id), { status: status === "open" ? "closed" : "open" });
  };

  const removeMatch = async (id: string) => {
    const [{ doc, deleteDoc }, db] = await Promise.all([import("firebase/firestore"), getDb()]);
    await deleteDoc(doc(db, "matches", id));
  };

  // ⭐ MAÇI SONUÇLANDIR — sonucu kaydet ve doğru tahmin yapanlara +10 puan dağıt
  const finalizeMatch = async (match: DailyMatch) => {
    const homeStr = window.prompt(`${match.teamA} kaç gol attı?`, "0");
    if (homeStr === null) return;
    const awayStr = window.prompt(`${match.teamB} kaç gol attı?`, "0");
    if (awayStr === null) return;
    const homeScore = parseInt(homeStr);
    const awayScore = parseInt(awayStr);
    if (isNaN(homeScore) || isNaN(awayScore)) {
      alert("Geçerli skor gir.");
      return;
    }

    const winChoice: Choice = resultToChoice(homeScore, awayScore);

    try {
      const [
        { doc, updateDoc, collection, query, where, getDocs, setDoc, increment, serverTimestamp },
        db,
      ] = await Promise.all([import("firebase/firestore"), getDb()]);

      // 1) Maçı sonuçlandır + kapat
      await updateDoc(doc(db, "matches", match.id), {
        status: "closed",
        homeScore,
        awayScore,
        resultChoice: winChoice,
        pointsAwarded: true,
        finalizedAt: serverTimestamp(),
      });

      // 2) Üye tahminlerini bul
      const userPredQuery = query(
        collection(db, "userPredictions"),
        where("matchId", "==", match.id)
      );
      const snap = await getDocs(userPredQuery);

      // 3) Doğru tahmin yapanlara puan dağıt
      let awardedCount = 0;
      for (const docSnap of snap.docs) {
        const data = docSnap.data() as { userId: string; choice: Choice; awardedPoints?: number };
        if ((data.awardedPoints || 0) > 0) continue; // Zaten dağıtıldı

        const isCorrect = data.choice === winChoice;
        const points = isCorrect ? POINTS_CORRECT : 0;

        // Tahmin kaydını güncelle
        await updateDoc(doc(db, "userPredictions", docSnap.id), {
          awardedPoints: points,
          finalizedAt: serverTimestamp(),
        });

        // Kullanıcının stats/main'ini güncelle
        await setDoc(
          doc(db, "profiles", data.userId, "stats", "main"),
          {
            totalPoints: increment(points),
            correctPredictions: increment(isCorrect ? 1 : 0),
            totalPredictions: increment(1),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        if (isCorrect) awardedCount++;
      }

      alert(`Maç sonuçlandı! ${snap.size} üye tahmin yaptı, ${awardedCount} kişi doğru bildi ve puan kazandı.`);
    } catch (err) {
      console.error(err);
      alert("Puan dağıtımında hata. Firestore Rules'u kontrol et.");
    }
  };

  const addMatch = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!teamA.trim() || !teamB.trim()) {
      setError(t("matches.teamError"));
      return;
    }

    try {
      const [{ addDoc, collection, serverTimestamp }, db] = await Promise.all([
        import("firebase/firestore"),
        getDb(),
      ]);
      await addDoc(collection(db, "matches"), {
        teamA: teamA.trim(),
        teamB: teamB.trim(),
        competition: competition.trim() || "World Cup",
        matchDate: inputDateToStored(matchDate), // convert YYYY-MM-DD → DD/MM/YYYY
        matchTime,
        omerPick: omerPick.trim(),
        status: "open",
        votesHome: 0,
        votesDraw: 0,
        votesAway: 0,
        totalVotes: 0,
        createdAt: serverTimestamp(),
      });

      setTeamA("");
      setTeamB("");
      setOmerPick("");
    } catch {
      setError(t("matches.addError"));
    }
  };

  const syncFromAPI = async () => {
    setSyncing(true);
    try {
      // Call the server-side Cloud Function — the API token never touches the browser.
      // In dev: add VITE_USE_EMULATOR=true to .env.local and run
      //   firebase emulators:start --only functions
      // In prod: deploy with  firebase deploy --only functions
      const [{ httpsCallable }, fns] = await Promise.all([
        import("firebase/functions"),
        import("../lib/firebase").then((m) => m.getFunctionsInstance()),
      ]);
      const syncFn = httpsCallable<unknown, { added: number; skipped: number; total: number; filtered: number }>(
        fns, "syncMatches"
      );
      const { data } = await syncFn({});
      alert(
        `Sync tamamlandı ✓\n` +
        `${data.total} maç getirildi → ${data.filtered} izin verilen lig\n` +
        `${data.added} yeni eklendi · ${data.skipped} zaten vardı`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Sync hatası: ${msg}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <section id="gunun-maclari" className="relative overflow-hidden py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/35 to-transparent" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="badge-pro mb-5">{t("matches.badge")}</div>
            <h2 className="section-title text-3xl leading-none text-cream md:text-5xl lg:text-7xl">
              {t("matches.titleA")} <span className="text-gold">{t("matches.titleB")}</span>
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-stone-400">
            {t("matches.desc")}
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="opus-glass rounded-[2rem] p-10 text-center">
            <h3 className="font-display text-3xl font-black text-white">{t("matches.emptyTitle")}</h3>
            <p className="mt-3 text-sm text-stone-400">{t("matches.emptyText")}</p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
          <button
            onClick={() => setAdminOpen((value) => !value)}
            className="text-xs font-black uppercase tracking-widest text-amber-200 transition hover:text-white"
          >
            {adminOpen ? t("matches.adminToggleClose") : t("matches.adminToggleOpen")}
          </button>

          {adminOpen && (
            <div className="mt-5">
              {!user ? (
                <form onSubmit={loginAdmin} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none focus:border-amber-300/60" placeholder={t("matches.adminEmail")} />
                  <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none focus:border-amber-300/60" placeholder={t("matches.password")} />
                  <button className="rounded-2xl bg-amber-400 px-5 py-3 text-sm font-black text-stone-950">{t("matches.login")}</button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <p className="text-sm text-stone-300">{t("matches.loggedIn")} {user.email}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={syncFromAPI}
                        disabled={syncing}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {syncing ? "⏳ Sync..." : "⚡ Football-Data Sync"}
                      </button>
                      <button onClick={handleSignOut} className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-stone-300">{t("matches.logout")}</button>
                    </div>
                  </div>

                  <form onSubmit={addMatch} className="grid gap-3 rounded-3xl border border-white/10 bg-black/20 p-4 md:grid-cols-2">
                    <input value={teamA} onChange={(event) => setTeamA(event.target.value)} className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none focus:border-amber-300/60" placeholder={t("matches.teamA")} />
                    <input value={teamB} onChange={(event) => setTeamB(event.target.value)} className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none focus:border-amber-300/60" placeholder={t("matches.teamB")} />
                    <input value={competition} onChange={(event) => setCompetition(event.target.value)} className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none focus:border-amber-300/60" placeholder={t("matches.competition")} />
                    <input value={omerPick} onChange={(event) => setOmerPick(event.target.value)} className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none focus:border-amber-300/60" placeholder={t("matches.omerPickInput")} />
                    <input value={matchDate} onChange={(event) => setMatchDate(event.target.value)} type="date" className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none focus:border-amber-300/60" />
                    <input value={matchTime} onChange={(event) => setMatchTime(event.target.value)} type="time" className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none focus:border-amber-300/60" />
                    <button className="premium-button rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-widest text-white md:col-span-2">{t("matches.add")}</button>
                  </form>

                  {error && <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-200">{error}</div>}

                  <div className="space-y-3">
                    {allMatches.map((match) => (
                      <div key={match.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center">
                        <div>
                          <div className="font-display text-lg font-black text-white">{match.teamA} - {match.teamB}</div>
                          <div className="text-xs text-stone-500">{match.competition} · {match.matchDate} · {match.matchTime} · {match.status === "open" ? t("matches.openStatus") : t("matches.closedStatus")}</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {!match.pointsAwarded && (
                            <button
                              onClick={() => finalizeMatch(match)}
                              className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-emerald-400"
                              title="Maç bitti, sonucu gir ve puanları dağıt"
                            >
                              🏆 Sonuçlandır
                            </button>
                          )}
                          {match.pointsAwarded && (
                            <span className="rounded-full bg-emerald-500/15 border border-emerald-400/30 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-300">
                              ✓ Sonuçlandı {match.homeScore}-{match.awayScore}
                            </span>
                          )}
                          <button onClick={() => toggleMatchStatus(match.id, match.status)} className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-stone-300">
                            {match.status === "open" ? t("matches.close") : t("matches.open")}
                          </button>
                          <button onClick={() => removeMatch(match.id)} className="rounded-full bg-red-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-white">{t("matches.delete")}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── localStorage helpers ─────────────────────────────────────────────────────

function readLocalVotes(): Record<string, PredictionChoice> {
  try {
    return JSON.parse(localStorage.getItem("userPredictions") ?? "{}") as Record<string, PredictionChoice>;
  } catch {
    return {};
  }
}

function writeLocalVote(matchId: string, choice: PredictionChoice): void {
  const votes = readLocalVotes();
  votes[matchId] = choice;
  localStorage.setItem("userPredictions", JSON.stringify(votes));
}

// ── MatchCard ─────────────────────────────────────────────────────────────────
// Vote counts are stored directly on the match document and arrive via the
// parent's onSnapshot listener — no separate Firestore query needed here.

function MatchCard({ match }: { match: DailyMatch }) {
  const { t } = useLang();
  const { user, profile } = useAuth();

  // Initialise from localStorage so the voted state survives a page reload
  const [myVote, setMyVote] = useState<PredictionChoice | null>(
    () => readLocalVotes()[match.id] ?? null
  );
  const [error, setError] = useState("");

  const total = match.totalVotes ?? 0;
  const counts = {
    teamA: match.votesHome ?? 0,
    draw:  match.votesDraw  ?? 0,
    teamB: match.votesAway  ?? 0,
  };

  const vote = async (choice: PredictionChoice) => {
    if (match.status !== "open" || myVote) return;
    setError("");
    try {
      const [{ doc, updateDoc, increment, setDoc, serverTimestamp }, db] = await Promise.all([
        import("firebase/firestore"),
        getDb(),
      ]);

      const voteField =
        choice === "teamA" ? "votesHome" : choice === "draw" ? "votesDraw" : "votesAway";

      // Atomic double-increment: selected field + totalVotes in one write
      await updateDoc(doc(db, "matches", match.id), {
        [voteField]: increment(1),
        totalVotes:  increment(1),
      });

      // Persist locally — freezes the card on reload for this browser
      writeLocalVote(match.id, choice);
      setMyVote(choice);

      // Authenticated users also get a userPredictions record for the points system
      if (user && profile) {
        await setDoc(doc(db, "userPredictions", `${match.id}_${user.uid}`), {
          matchId:     match.id,
          matchDate:   match.matchDate,
          userId:      user.uid,
          userNick:    profile.nick || "Manager",
          userCountry: profile.countryCode || "OTHER",
          choice,
          awardedPoints: 0,
          createdAt: serverTimestamp(),
        });
      }
    } catch {
      setError(t("matches.voteError"));
    }
  };

  return (
    <article className="opus-glass rounded-[2rem] p-5 md:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="opus-kicker">{match.competition}</div>
          <h3 className="mt-2 font-display text-2xl font-black text-white">{match.teamA} vs {match.teamB}</h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-stone-500">
            {match.matchTime} · {match.status === "open" ? t("matches.openStatus") : t("matches.closedStatus")}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center">
          <div className="font-display text-2xl font-black text-white">{total}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-stone-500">{t("matches.votes")}</div>
        </div>
      </div>

      {match.omerPick && (
        <div className="mb-4 rounded-2xl border border-amber-300/18 bg-amber-300/[0.06] p-4 text-sm text-amber-100">
          <span className="font-black">{t("matches.omerPick")}</span> {match.omerPick}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <VoteButton label={match.teamA}        count={counts.teamA} total={total} ticker="1" active={myVote === "teamA"} disabled={!!myVote || match.status !== "open"} onClick={() => vote("teamA")} />
        <VoteButton label={t("matches.draw")}  count={counts.draw}  total={total} ticker="X" active={myVote === "draw"}  disabled={!!myVote || match.status !== "open"} onClick={() => vote("draw")}  />
        <VoteButton label={match.teamB}        count={counts.teamB} total={total} ticker="2" active={myVote === "teamB"} disabled={!!myVote || match.status !== "open"} onClick={() => vote("teamB")} />
      </div>

      {myVote && <p className="mt-4 text-center text-xs font-bold uppercase tracking-widest text-emerald-300">{t("matches.saved")}</p>}
      {error  && <p className="mt-4 text-center text-sm text-red-300">{error}</p>}
    </article>
  );
}

// ── VoteButton ────────────────────────────────────────────────────────────────
// Shows a classic 1 / X / 2 ticker badge and a live percentage bar.
// When disabled (already voted), the bar animates to show current percentages.

function VoteButton({
  label, count, total, ticker, active, disabled, onClick,
}: {
  label: string; count: number; total: number; ticker: string;
  active: boolean; disabled: boolean; onClick: () => void;
}) {
  const { t } = useLang();
  const percent = total === 0 ? 0 : Math.round((count / total) * 100);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed ${
        active
          ? "border-amber-300/60 bg-amber-300/12"
          : "border-white/10 bg-white/[0.035] hover:border-amber-300/25"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-display text-lg font-black text-white leading-tight">{label}</div>
        <span className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-black ${active ? "bg-amber-300 text-stone-950" : "bg-white/10 text-stone-400"}`}>
          {ticker}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-amber-300 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-2 text-xs font-black uppercase tracking-widest text-stone-500">
        %{percent} · {count} {t("matches.votes")}
      </div>
    </button>
  );
}