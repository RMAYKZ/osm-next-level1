import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getDb } from "../lib/firebase";
import { COUNTRIES } from "../data/countries";
import { useLang } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

interface LeaderboardEntry {
  uid: string;
  nick: string;
  countryCode: string;
  totalPoints: number;
  correctPredictions: number;
  totalPredictions: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const GLASS: React.CSSProperties = {
  background: "rgba(9,11,33,0.88)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(251,191,36,0.12)",
  borderRadius: 20,
};

export default function Leaderboard() {
  const { t } = useLang();
  const { user, profile } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [{ collection, getDocs, query, orderBy, limit }, db] = await Promise.all([
          import("firebase/firestore"),
          getDb(),
        ]);
        if (!active) return;
        const profSnap = await getDocs(query(collection(db, "profiles"), limit(200)));
        if (!active) return;
        const items: LeaderboardEntry[] = [];
        for (const docSnap of profSnap.docs) {
          const data = docSnap.data() as { nick?: string; countryCode?: string };
          try {
            const statsSnap = await getDocs(
              query(collection(db, "profiles", docSnap.id, "stats"), orderBy("totalPoints", "desc"), limit(1))
            );
            const statsData = statsSnap.docs[0]?.data() as
              | { totalPoints?: number; correctPredictions?: number; totalPredictions?: number }
              | undefined;
            items.push({
              uid: docSnap.id,
              nick: data.nick || "Manager",
              countryCode: data.countryCode || "OTHER",
              totalPoints: statsData?.totalPoints || 0,
              correctPredictions: statsData?.correctPredictions || 0,
              totalPredictions: statsData?.totalPredictions || 0,
            });
          } catch {
            items.push({
              uid: docSnap.id,
              nick: data.nick || "Manager",
              countryCode: data.countryCode || "OTHER",
              totalPoints: 0,
              correctPredictions: 0,
              totalPredictions: 0,
            });
          }
        }
        items.sort((a, b) => b.totalPoints - a.totalPoints);
        if (active) {
          setEntries(items.slice(0, 50));
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user?.uid]);

  const myRank = user ? entries.findIndex((e) => e.uid === user.uid) : -1;

  return (
    <section id="liderlik" style={{ position: "relative", overflow: "hidden", padding: "clamp(48px,7vw,96px) 0" }}>

      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent)",
        }} />
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 7, repeat: Infinity }}
          style={{
            position: "absolute", top: "5%", right: "-8%",
            width: "38%", height: "55%", borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(251,191,36,0.09) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ marginBottom: 36, textAlign: "center" }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)",
            borderRadius: 999, padding: "5px 14px", marginBottom: 14,
          }}>
            <span style={{ fontSize: 12 }}>🏆</span>
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#f59e0b" }}>
              {t("leader.badge") || "Liderlik Tablosu"}
            </span>
          </div>
          <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.8rem,4vw,3.2rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            <span style={{ color: "#e2e8f0" }}>{t("leader.title1") || "Top Manager"} </span>
            <span style={{ color: "#f59e0b" }}>{t("leader.title2") || "Sıralaması"}</span>
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(148,163,184,0.65)", lineHeight: 1.6 }}>
            {t("leader.desc") || "Maç tahminlerinden doğru bilen +10 puan kazanır. En çok puan toplayan zirvede!"}
          </p>
        </motion.div>

        {/* My rank card */}
        {user && profile && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{
              ...GLASS,
              border: "1px solid rgba(251,191,36,0.22)",
              padding: "16px 20px",
              marginBottom: 16,
              display: "flex", alignItems: "center", gap: 16,
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
              background: "rgba(251,191,36,0.12)", border: "2px solid rgba(251,191,36,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            }}>
              {COUNTRIES.find((c) => c.code === profile.countryCode)?.flag || "🌍"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#f59e0b", marginBottom: 2 }}>
                {t("leader.yourRank") || "Senin Sıran"}
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile.nick || "Manager"}
              </div>
              <div style={{ fontSize: 11, color: "rgba(148,163,184,0.55)", marginTop: 2 }}>
                {myRank >= 0
                  ? `#${myRank + 1} · ${entries[myRank]?.totalPoints || 0} puan`
                  : t("leader.notRanked") || "Henüz sıralamada değilsin"}
              </div>
            </div>
            <motion.a
              href="#gunun-maclari"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              style={{
                background: "#f59e0b", borderRadius: 12, padding: "9px 16px",
                fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
                color: "#1c1917", textDecoration: "none", whiteSpace: "nowrap",
              }}
            >
              {t("leader.predict") || "Tahmin Yap"}
            </motion.a>
          </motion.div>
        )}

        {/* Main table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          style={{ ...GLASS, padding: "8px 16px" }}
        >
          {loading ? (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ padding: "48px 0", textAlign: "center", fontSize: 13, color: "rgba(148,163,184,0.5)" }}
            >
              {t("leader.loading") || "Yükleniyor..."}
            </motion.div>
          ) : entries.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", fontSize: 13, color: "rgba(148,163,184,0.5)" }}>
              {t("leader.empty") || "Henüz hiç tahmin yapan yok. İlk sen ol!"}
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {entries.map((entry, index) => (
                <LeaderRow
                  key={entry.uid}
                  entry={entry}
                  rank={index + 1}
                  isMe={user?.uid === entry.uid}
                  index={index}
                />
              ))}
            </ul>
          )}
        </motion.div>

        {!user && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "rgba(100,116,139,0.6)" }}
          >
            ⚠️ {t("leader.signInPrompt") || "Sıralamada görünmek için üye ol ve maç tahminleri yap."}
          </motion.p>
        )}
      </div>
    </section>
  );
}

function LeaderRow({ entry, rank, isMe, index }: { entry: LeaderboardEntry; rank: number; isMe: boolean; index: number }) {
  const country = COUNTRIES.find((c) => c.code === entry.countryCode);
  const accuracy = entry.totalPredictions > 0
    ? Math.round((entry.correctPredictions / entry.totalPredictions) * 100)
    : 0;
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  const delay = index < 10 ? index * 0.04 : 0.04;

  return (
    <motion.li
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay }}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 8px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        borderRadius: isMe ? 12 : 0,
        background: isMe ? "rgba(251,191,36,0.05)" : "transparent",
        outline: isMe ? "1px solid rgba(251,191,36,0.18)" : "none",
        margin: isMe ? "2px 0" : 0,
      }}
    >
      <div style={{ width: 36, textAlign: "center", flexShrink: 0 }}>
        {medal ? (
          <motion.span
            whileHover={{ scale: 1.3, rotate: 10 }}
            style={{ cursor: "default", fontSize: 20 }}
          >
            {medal}
          </motion.span>
        ) : (
          <span style={{ fontSize: 12, fontWeight: 900, color: "rgba(100,116,139,0.6)" }}>#{rank}</span>
        )}
      </div>
      <div style={{
        width: 36, height: 36, flexShrink: 0, borderRadius: "50%",
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
      }}>
        {country?.flag || "🌍"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {entry.nick}
          {isMe && <span style={{ marginLeft: 8, fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "#f59e0b" }}>(SEN)</span>}
        </div>
        <div style={{ fontSize: 11, color: "rgba(100,116,139,0.65)", marginTop: 1 }}>
          {entry.totalPredictions > 0
            ? `${entry.correctPredictions}/${entry.totalPredictions} doğru · %${accuracy} isabet`
            : "Henüz tahmin yok"}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#f59e0b", letterSpacing: "-0.02em", lineHeight: 1 }}>{entry.totalPoints}</div>
        <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(100,116,139,0.55)", marginTop: 2 }}>puan</div>
      </div>
    </motion.li>
  );
}
