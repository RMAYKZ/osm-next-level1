import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getAuthInstance, getDb } from "../lib/firebase";
import { emptyProfile, type ManagerProfile } from "../data/profile";

interface AuthContextType {
  user: { uid: string; email: string | null } | null;
  profile: ManagerProfile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  saveProfile: (profile: ManagerProfile) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ uid: string; email: string | null } | null>(null);
  const [profile, setProfile] = useState<ManagerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let active = true;

    const init = async () => {
      try {
        const [{ onAuthStateChanged }, auth] = await Promise.all([
          import("firebase/auth"),
          getAuthInstance(),
        ]);
        if (!active) return;
        unsubscribe = onAuthStateChanged(auth, async (u) => {
          if (u) {
            setUser({ uid: u.uid, email: u.email });
            await loadProfile(u.uid);
          } else {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        });
      } catch {
        setLoading(false);
      }
    };

    // Defer downloading + initializing the Firebase Auth SDK until the
    // browser is idle (capped at 2s so it still resolves promptly) — this
    // fires for every visitor regardless of login state, so on a slow
    // connection/device it was competing with the critical above-the-fold
    // render. The existing `loading` state already covers this delay.
    let idleId: number | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(init, { timeout: 2000 });
    } else {
      idleId = window.setTimeout(init, 1);
    }

    return () => {
      active = false;
      unsubscribe?.();
      if (idleId !== undefined) {
        if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
        else window.clearTimeout(idleId);
      }
    };
  }, []);

  const loadProfile = async (uid: string) => {
    try {
      const [{ doc, getDoc }, db] = await Promise.all([
        import("firebase/firestore"),
        getDb(),
      ]);
      const snap = await getDoc(doc(db, "profiles", uid));
      if (snap.exists()) {
        setProfile(snap.data() as ManagerProfile);
      } else {
        setProfile(emptyProfile(uid));
      }
    } catch {
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.uid);
  };

  const signUp = async (email: string, password: string) => {
    const [{ createUserWithEmailAndPassword }, auth] = await Promise.all([
      import("firebase/auth"),
      getAuthInstance(),
    ]);
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = async (email: string, password: string) => {
    const [{ signInWithEmailAndPassword }, auth] = await Promise.all([
      import("firebase/auth"),
      getAuthInstance(),
    ]);
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const [{ GoogleAuthProvider, signInWithPopup }, auth] = await Promise.all([
      import("firebase/auth"),
      getAuthInstance(),
    ]);
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logOut = async () => {
    const [{ signOut }, auth] = await Promise.all([
      import("firebase/auth"),
      getAuthInstance(),
    ]);
    await signOut(auth);
  };

  const saveProfile = async (next: ManagerProfile) => {
    const [{ doc, setDoc, serverTimestamp }, db] = await Promise.all([
      import("firebase/firestore"),
      getDb(),
    ]);
    const payload = {
      ...next,
      updatedAt: Date.now(),
      createdAt: profile?.createdAt || Date.now(),
      serverUpdatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, "profiles", next.uid), payload, { merge: true });
    setProfile(payload as ManagerProfile);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signUp, signIn, signInWithGoogle, logOut, saveProfile, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
