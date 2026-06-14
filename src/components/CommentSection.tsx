import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Timestamp } from "firebase/firestore";
import type { User } from "firebase/auth";
import { getDb, getAuthInstance } from "../lib/firebase";
import { useLang } from "../contexts/LanguageContext";

interface SiteComment {
  id: string;
  author: string;
  text: string;
  approved: boolean;
  createdAt?: Timestamp;
  rating?: number;
  dateText?: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const GLASS: React.CSSProperties = {
  background: "rgba(9,11,33,0.88)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(139,92,246,0.12)",
  borderRadius: 24,
};

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12, padding: "12px 16px", color: "#e2e8f0", fontSize: 14, outline: "none",
};

function formatDate(comment: SiteComment) {
  if (comment.dateText) return comment.dateText;
  const date = comment.createdAt?.toDate?.();
  if (!date) return "Onaylandı";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function CommentSection() {
  const { t } = useLang();
  const [comments, setComments] = useState<SiteComment[]>([]);
  const [pendingComments, setPendingComments] = useState<SiteComment[]>([]);
  const [name, setName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let active = true;
    (async () => {
      try {
        const [{ collection, onSnapshot, query, where }, db] = await Promise.all([
          import("firebase/firestore"),
          getDb(),
        ]);
        if (!active) return;
        const publicQuery = query(collection(db, "comments"), where("approved", "==", true));
        unsubscribe = onSnapshot(
          publicQuery,
          (snapshot) => {
            const list = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as SiteComment[];
            list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setComments(list);
          },
          () => {}
        );
      } catch {
        // Firebase yüklenemezse sessizce geç; seed yorumlar gösterilir.
      }
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
      try {
        const [{ onAuthStateChanged }, authInstance] = await Promise.all([
          import("firebase/auth"),
          getAuthInstance(),
        ]);
        if (!active) return;
        unsubscribe = onAuthStateChanged(authInstance, (activeUser) => setUser(activeUser));
      } catch {
        // Auth yüklenemezse sorun değil.
      }
    })();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setPendingComments([]);
      return;
    }
    let unsubscribe: (() => void) | undefined;
    let active = true;
    (async () => {
      try {
        const [{ collection, onSnapshot, query, where }, db] = await Promise.all([
          import("firebase/firestore"),
          getDb(),
        ]);
        if (!active) return;
        const pendingQuery = query(collection(db, "comments"), where("approved", "==", false));
        unsubscribe = onSnapshot(
          pendingQuery,
          (snapshot) => {
            const list = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as SiteComment[];
            list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setPendingComments(list);
          },
          () => {}
        );
      } catch {
        // Bekleyen yorumlar yüklenemezse sessizce geç.
      }
    })();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [user]);

  const displayComments = comments;

  const totalText = useMemo(() => {
    if (displayComments.length === 0) return t("comments.none");
    return t("comments.total").replace("{count}", String(displayComments.length));
  }, [displayComments.length, t]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (name.trim().length < 2 || commentText.trim().length < 8) {
      setError(t("comments.errorInvalid"));
      return;
    }
    setLoading(true);
    try {
      const [{ addDoc, collection, serverTimestamp }, db] = await Promise.all([
        import("firebase/firestore"),
        getDb(),
      ]);
      await addDoc(collection(db, "comments"), {
        author: name.trim().slice(0, 40),
        text: commentText.trim().slice(0, 700),
        rating,
        approved: false,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setName("");
      setCommentText("");
      setRating(5);
      setTimeout(() => setSubmitted(false), 6000);
    } catch {
      setError(t("comments.errorSend"));
    } finally {
      setLoading(false);
    }
  };

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
      setError(t("comments.errorLogin"));
    }
  };

  const approveComment = async (id: string) => {
    const [{ doc, updateDoc }, db] = await Promise.all([import("firebase/firestore"), getDb()]);
    await updateDoc(doc(db, "comments", id), { approved: true });
  };

  const removeComment = async (id: string) => {
    const [{ doc, deleteDoc }, db] = await Promise.all([import("firebase/firestore"), getDb()]);
    await deleteDoc(doc(db, "comments", id));
  };

  const handleSignOut = async () => {
    const [{ signOut }, authInstance] = await Promise.all([import("firebase/auth"), getAuthInstance()]);
    await signOut(authInstance);
  };

  return (
    <section id="yorumlar" style={{ position: "relative", overflow: "hidden", padding: "clamp(48px,7vw,96px) 0" }}>

      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.35), transparent)",
        }} />
        <div style={{
          position: "absolute", bottom: "5%", left: "-5%",
          width: "35%", height: "50%", borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 70%)",
          filter: "blur(80px)",
        }} />
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>

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
            background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)",
            borderRadius: 999, padding: "5px 14px", marginBottom: 14,
          }}>
            <span style={{ fontSize: 12 }}>💬</span>
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#a78bfa" }}>
              {t("comments.badge")}
            </span>
          </div>
          <h2 style={{ margin: "0 0 10px", fontSize: "clamp(1.8rem,4vw,3.2rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            <span style={{ color: "#e2e8f0" }}>{t("comments.titleA")} </span>
            <span style={{ color: "#a78bfa" }}>{t("comments.titleB")}</span>
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(148,163,184,0.65)", lineHeight: 1.6 }}>
            {t("comments.desc")}
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,300px), 1fr))", gap: 20 }}>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{ ...GLASS, padding: "clamp(20px,4vw,32px)" }}
          >
            <h3 style={{ margin: "0 0 20px", fontSize: "clamp(1.1rem,2.5vw,1.5rem)", fontWeight: 900, color: "#e2e8f0" }}>
              {t("comments.write")}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <label style={{ display: "block" }}>
                <span style={{ display: "block", marginBottom: 7, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(148,163,184,0.5)" }}>
                  {t("comments.manager")}
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  style={inputStyle}
                  placeholder={t("comments.placeholderName")}
                />
              </label>

              <label style={{ display: "block" }}>
                <span style={{ display: "block", marginBottom: 7, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(148,163,184,0.5)" }}>
                  {t("comments.rating")}
                </span>
                <select
                  value={rating}
                  onChange={(event) => setRating(Number(event.target.value))}
                  style={inputStyle}
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value} style={{ background: "#0d1117" }}>
                      {"★".repeat(value)} {value}/5
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: "block" }}>
                <span style={{ display: "block", marginBottom: 7, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(148,163,184,0.5)" }}>
                  {t("comments.message")}
                </span>
                <textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder={t("comments.placeholderMessage")}
                />
              </label>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                  borderRadius: 12, padding: "13px 0", width: "100%",
                  color: "#fff", fontSize: 13, fontWeight: 900,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  cursor: loading ? "not-allowed" : "pointer", border: "none",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? t("comments.sending") : t("comments.submit")}
              </motion.button>

              <AnimatePresence>
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)",
                      borderRadius: 12, padding: "12px 16px",
                      textAlign: "center", fontSize: 13, fontWeight: 700, color: "#34d399",
                    }}
                  >
                    {t("comments.sent")}
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                      borderRadius: 12, padding: "12px 16px",
                      textAlign: "center", fontSize: 13, fontWeight: 700, color: "#fca5a5",
                    }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.form>

          {/* Comments list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {displayComments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                style={{
                  ...GLASS,
                  padding: 32, textAlign: "center",
                  fontSize: 13, color: "rgba(148,163,184,0.5)",
                }}
              >
                {t("comments.empty")}
              </motion.div>
            ) : (
              displayComments.map((comment, i) => (
                <CommentCard key={comment.id} comment={comment} index={i} />
              ))
            )}
            <div style={{ textAlign: "center", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(100,116,139,0.5)" }}>
              {totalText}
            </div>
          </div>
        </div>

        {/* Admin panel */}
        <div style={{
          marginTop: 24,
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 20, padding: 18,
        }}>
          <button
            onClick={() => setAdminOpen((value) => !value)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 900, textTransform: "uppercase",
              letterSpacing: "0.14em", color: "rgba(251,191,36,0.65)",
            }}
          >
            {adminOpen ? t("comments.adminClose") : t("comments.adminOpen")}
          </button>

          {adminOpen && (
            <div style={{ marginTop: 18 }}>
              {!user ? (
                <form onSubmit={loginAdmin} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    style={{ ...inputStyle, flex: 1, minWidth: 160 }}
                    placeholder={t("matches.adminEmail")}
                  />
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    style={{ ...inputStyle, flex: 1, minWidth: 160 }}
                    placeholder={t("matches.password")}
                  />
                  <button
                    style={{
                      background: "#f59e0b", borderRadius: 12, padding: "12px 20px",
                      fontSize: 13, fontWeight: 900, color: "#1c1917", cursor: "pointer", border: "none",
                    }}
                  >
                    {t("matches.login")}
                  </button>
                </form>
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                    <p style={{ margin: 0, fontSize: 13, color: "rgba(226,232,240,0.7)" }}>{t("matches.loggedIn")} {user.email}</p>
                    <button
                      onClick={handleSignOut}
                      style={{
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 999, padding: "6px 16px",
                        fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
                        color: "rgba(148,163,184,0.7)", cursor: "pointer",
                      }}
                    >
                      {t("matches.logout")}
                    </button>
                  </div>

                  {pendingComments.length === 0 ? (
                    <div style={{
                      background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "rgba(148,163,184,0.5)",
                    }}>
                      {t("comments.pendingNone")}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {pendingComments.map((comment) => (
                        <div
                          key={comment.id}
                          style={{
                            background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 14, padding: 14,
                          }}
                        >
                          <CommentCard comment={comment} compact index={0} />
                          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                            <button
                              onClick={() => approveComment(comment.id)}
                              style={{
                                background: "#34d399", borderRadius: 999, padding: "7px 16px",
                                fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
                                color: "#1c1917", cursor: "pointer", border: "none",
                              }}
                            >
                              {t("comments.approve")}
                            </button>
                            <button
                              onClick={() => removeComment(comment.id)}
                              style={{
                                background: "#ef4444", borderRadius: 999, padding: "7px 16px",
                                fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
                                color: "#fff", cursor: "pointer", border: "none",
                              }}
                            >
                              {t("comments.delete")}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CommentCard({ comment, compact = false, index }: { comment: SiteComment; compact?: boolean; index: number }) {
  if (compact) {
    return (
      <article>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 900, color: "#fde68a",
            }}>
              {comment.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#e2e8f0" }}>{comment.author}</div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(100,116,139,0.6)" }}>{formatDate(comment)}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#f59e0b", whiteSpace: "nowrap" }}>{"★".repeat(comment.rating || 5)}</div>
        </div>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "rgba(148,163,184,0.75)" }}>"{comment.text}"</p>
      </article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index, 5) * 0.07, ease: EASE }}
      style={{
        background: "rgba(9,11,33,0.82)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(139,92,246,0.1)",
        borderRadius: 18, padding: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
            background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 900, color: "#fde68a",
          }}>
            {comment.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0" }}>{comment.author}</div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(100,116,139,0.55)" }}>{formatDate(comment)}</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#f59e0b", whiteSpace: "nowrap", flexShrink: 0 }}>{"★".repeat(comment.rating || 5)}</div>
      </div>
      <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.75, color: "rgba(148,163,184,0.78)" }}>"{comment.text}"</p>
    </motion.article>
  );
}
