import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { getDb } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { getISOWeekNumber, getYearWeekKey } from '../utils/tacticEngine';
import type { SavedTactic } from '../data/savedTactic';

interface SavedTacticsCtx {
  tactics: SavedTactic[];
  loading: boolean;
  saveTactic: (data: Omit<SavedTactic, 'id' | 'uid' | 'savedAt' | 'weekNum' | 'yearWeekKey'>) => Promise<void>;
  deleteTactic: (id: string) => Promise<void>;
  isSaved: (comboKey: string) => boolean;
  savedId: (comboKey: string) => string | null;
}

const SavedTacticsContext = createContext<SavedTacticsCtx | null>(null);

export function SavedTacticsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tactics, setTactics] = useState<SavedTactic[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setTactics([]);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let active = true;
    setLoading(true);

    (async () => {
      try {
        const [{ collection, query, orderBy, onSnapshot }, db] = await Promise.all([
          import('firebase/firestore'),
          getDb(),
        ]);
        if (!active) return;

        unsubscribe = onSnapshot(
          query(
            collection(db, 'users', user.uid, 'savedTactics'),
            orderBy('savedAt', 'desc'),
          ),
          (snap) => {
            setTactics(snap.docs.map(d => d.data() as SavedTactic));
            setLoading(false);
          },
          () => setLoading(false),
        );
      } catch {
        setLoading(false);
      }
    })();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [user]);

  const saveTactic = useCallback(async (
    data: Omit<SavedTactic, 'id' | 'uid' | 'savedAt' | 'weekNum' | 'yearWeekKey'>,
  ) => {
    if (!user) throw new Error('not_authenticated');

    const [{ collection, doc, setDoc }, db] = await Promise.all([
      import('firebase/firestore'),
      getDb(),
    ]);

    const ref = doc(collection(db, 'users', user.uid, 'savedTactics'));
    const tactic: SavedTactic = {
      ...data,
      id: ref.id,
      uid: user.uid,
      savedAt: Date.now(),
      weekNum: getISOWeekNumber(),
      yearWeekKey: getYearWeekKey(),
    };

    setTactics(prev => [tactic, ...prev]);

    try {
      await setDoc(ref, tactic);
    } catch (err) {
      setTactics(prev => prev.filter(t => t.id !== tactic.id));
      throw err;
    }
  }, [user]);

  const deleteTactic = useCallback(async (id: string) => {
    if (!user) return;

    setTactics(prev => prev.filter(t => t.id !== id));

    try {
      const [{ doc, deleteDoc }, db] = await Promise.all([
        import('firebase/firestore'),
        getDb(),
      ]);
      await deleteDoc(doc(db, 'users', user.uid, 'savedTactics', id));
    } catch {
      // onSnapshot reconciles on failure
    }
  }, [user]);

  const isSaved = useCallback((comboKey: string) =>
    tactics.some(t => t.comboKey === comboKey), [tactics]);

  const savedId = useCallback((comboKey: string) =>
    tactics.find(t => t.comboKey === comboKey)?.id ?? null, [tactics]);

  return (
    <SavedTacticsContext.Provider value={{ tactics, loading, saveTactic, deleteTactic, isSaved, savedId }}>
      {children}
    </SavedTacticsContext.Provider>
  );
}

export function useSavedTactics() {
  const ctx = useContext(SavedTacticsContext);
  if (!ctx) throw new Error('useSavedTactics must be used inside SavedTacticsProvider');
  return ctx;
}
