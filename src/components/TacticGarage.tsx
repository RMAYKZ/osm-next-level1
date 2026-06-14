import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSavedTactics } from '../contexts/SavedTacticsContext';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import type { SavedTactic } from '../data/savedTactic';
import './TacticGarage.css';

const G18N: Record<string, Record<string, string>> = {
  title:    { tr: 'Taktik Garajım', en: 'My Tactic Garage', hu: 'Taktika Garázsam', ar: 'مرآب التكتيكات', pt: 'Minha Garagem' },
  sub:      { tr: 'Kaydettiğin taktikler burada saklanır', en: 'Your saved tactics are stored here', hu: 'A mentett taktikáid itt találhatók', ar: 'تكتيكاتك المحفوظة هنا', pt: 'Suas táticas salvas estão aqui' },
  empty:    { tr: 'Henüz taktik kaydetmedin', en: 'No tactics saved yet', hu: 'Még nincs mentett taktika', ar: 'لا توجد تكتيكات محفوظة بعد', pt: 'Nenhuma tática salva ainda' },
  emptySub: { tr: 'Anti-Taktik Bulucu\'da bir taktik bul ve yıldıza tıkla', en: 'Find a tactic in Anti-Tactic Finder and click the star', hu: 'Keress taktikát az Anti-Taktika Keresőben és kattints a csillagra', ar: 'ابحث عن تكتيك في محدد مكافح التكتيكات وانقر على النجمة', pt: 'Encontre uma tática no Localizador e clique na estrela' },
  saved:    { tr: 'kaydedildi', en: 'saved', hu: 'mentve', ar: 'محفوظ', pt: 'salvo' },
  savedAt:  { tr: 'Kaydedildi', en: 'Saved', hu: 'Mentve', ar: 'محفوظ', pt: 'Salvo' },
  home:     { tr: 'Ev Sahibi', en: 'Home', hu: 'Hazai', ar: 'ملعب المنزل', pt: 'Casa' },
  away:     { tr: 'Deplasman', en: 'Away', hu: 'Vendég', ar: 'خارج الملعب', pt: 'Fora' },
  stronger: { tr: 'Daha Güçlü', en: 'Stronger', hu: 'Erősebb', ar: 'أقوى', pt: 'Mais Forte' },
  equal:    { tr: 'Eşit Güç', en: 'Equal', hu: 'Egyenlő', ar: 'متساوي', pt: 'Igual' },
  weaker:   { tr: 'Daha Zayıf', en: 'Weaker', hu: 'Gyengébb', ar: 'أضعف', pt: 'Mais Fraco' },
  vs:       { tr: 'vs', en: 'vs', hu: 'vs', ar: 'ضد', pt: 'vs' },
  pressure: { tr: 'Baskı', en: 'Pressure', hu: 'Nyomás', ar: 'ضغط', pt: 'Pressão' },
  style:    { tr: 'Stil', en: 'Style', hu: 'Stílus', ar: 'أسلوب', pt: 'Estilo' },
  tempo:    { tr: 'Tempo', en: 'Tempo', hu: 'Tempó', ar: 'إيقاع', pt: 'Tempo' },
  deleteQ:  { tr: 'Silmek istediğine emin misin?', en: 'Sure you want to delete?', hu: 'Biztos vagy benne, hogy törlöd?', ar: 'هل أنت متأكد من الحذف؟', pt: 'Tem certeza que quer deletar?' },
  deleteY:  { tr: 'Evet, Sil', en: 'Yes, Delete', hu: 'Igen, Törlöm', ar: 'نعم، احذف', pt: 'Sim, Deletar' },
  deleteN:  { tr: 'Vazgeç', en: 'Cancel', hu: 'Mégse', ar: 'إلغاء', pt: 'Cancelar' },
  week:     { tr: 'Hafta', en: 'Week', hu: 'Hét', ar: 'أسبوع', pt: 'Semana' },
  optA:     { tr: 'Seçenek A', en: 'Option A', hu: 'A Lehetőség', ar: 'الخيار أ', pt: 'Opção A' },
  optB:     { tr: 'Seçenek B', en: 'Option B', hu: 'B Lehetőség', ar: 'الخيار ب', pt: 'Opção B' },
  loading:  { tr: 'Yükleniyor...', en: 'Loading...', hu: 'Betöltés...', ar: 'جار التحميل...', pt: 'Carregando...' },
  badgeStrong: { tr: 'ELİT', en: 'ELITE', hu: 'ELIT', ar: 'نخبة', pt: 'ELITE' },
  badgeSolid:  { tr: 'SAĞLAM', en: 'SOLID', hu: 'SZILÁRD', ar: 'صلب', pt: 'SÓLIDO' },
  badgeSit:    { tr: 'DURUMA GÖRE', en: 'SITUATIONAL', hu: 'SZITUÁCIÓ', ar: 'ظرفي', pt: 'SITUACIONAL' },
};

function g(key: string, lang: string): string {
  return G18N[key]?.[lang] ?? G18N[key]?.['en'] ?? key;
}

const BADGE_COLOR: Record<string, { bg: string; border: string; color: string }> = {
  STRONG:      { bg: 'rgba(0,229,255,0.12)',  border: 'rgba(0,229,255,0.35)',  color: '#00e5ff' },
  SOLID:       { bg: 'rgba(255,152,0,0.12)',  border: 'rgba(255,152,0,0.35)',  color: '#ff9800' },
  SITUATIONAL: { bg: 'rgba(255,71,87,0.08)',  border: 'rgba(255,71,87,0.28)',  color: '#ff4757' },
};

const STR_COLOR: Record<string, string> = {
  stronger: '#00e5ff',
  equal:    '#ffd700',
  weaker:   '#ff4757',
};

function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="garage-minibar">
      <div className="garage-minibar-label">{label}</div>
      <div className="garage-minibar-track">
        <div className="garage-minibar-fill" style={{ width: `${pct}%`, background: color }} />
        <div className="garage-minibar-shimmer" style={{ background: color }} />
      </div>
      <div className="garage-minibar-val" style={{ color }}>{value}</div>
    </div>
  );
}

function LinePill({ text, level }: { text: string; level: number }) {
  const hue = level >= 70 ? '#00e5ff' : level >= 40 ? '#ffd700' : '#ff4757';
  return (
    <span className="garage-pill" style={{ borderColor: `${hue}33`, color: hue, background: `${hue}0d` }}>
      {text}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="garage-card garage-skeleton">
      <div className="sk-line sk-short" />
      <div className="sk-line sk-long" />
      <div className="sk-chips" />
      <div className="sk-bars" />
    </div>
  );
}

function GarageCard({ tactic, lang }: { tactic: SavedTactic; lang: string }) {
  const { deleteTactic } = useSavedTactics();
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [deleteTimer, setDeleteTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const bc = BADGE_COLOR[tactic.badge] ?? BADGE_COLOR.SOLID;
  const strColor = STR_COLOR[tactic.strength] ?? '#ffd700';

  const badgeLabel =
    tactic.badge === 'STRONG' ? g('badgeStrong', lang)
    : tactic.badge === 'SOLID' ? g('badgeSolid', lang)
    : g('badgeSit', lang);

  const savedDate = new Date(tactic.savedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });

  const armDelete = useCallback(() => {
    if (deleteArmed) {
      if (deleteTimer) clearTimeout(deleteTimer);
      deleteTactic(tactic.id);
      return;
    }
    setDeleteArmed(true);
    const t = setTimeout(() => setDeleteArmed(false), 3000);
    setDeleteTimer(t);
  }, [deleteArmed, deleteTimer, deleteTactic, tactic.id]);

  return (
    <motion.div
      className="garage-card"
      layout
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header row */}
      <div className="garage-card-head">
        <div className="garage-card-week">
          {g('week', lang)} {tactic.weekNum} · {savedDate}
          {tactic.option === 'B' && (
            <span className="garage-opt-badge">{g('optB', lang)}</span>
          )}
        </div>
        <motion.button
          className={`garage-delete-btn${deleteArmed ? ' armed' : ''}`}
          onClick={armDelete}
          whileTap={{ scale: 0.9 }}
          aria-label="Delete"
          title={deleteArmed ? g('deleteY', lang) : 'Delete'}
        >
          {deleteArmed ? '✓' : '×'}
        </motion.button>
      </div>

      {/* Formation name */}
      <div className="garage-card-formation">{tactic.counterFormation}</div>
      <div className="garage-card-gp">
        <span className="garage-gp-icon">{tactic.gamePlanIcon}</span>
        <span className="garage-gp-text">{tactic.gamePlan}</span>
      </div>

      {/* Context chips */}
      <div className="garage-chips">
        <span className="garage-chip garage-chip-loc">
          {tactic.location === 'home' ? '🏠' : '✈️'} {g(tactic.location, lang)}
        </span>
        <span className="garage-chip" style={{ color: strColor, borderColor: `${strColor}44`, background: `${strColor}0d` }}>
          {g(tactic.strength, lang)}
        </span>
        <span className="garage-chip garage-chip-opp">
          {g('vs', lang)} {tactic.opponentLabel}
        </span>
      </div>

      {/* Mini sliders */}
      <div className="garage-bars">
        <MiniBar label={g('pressure', lang)} value={tactic.pressure} max={10} color="#00e5ff" />
        <MiniBar label={g('style', lang)}    value={tactic.style}    max={100} color="#a78bfa" />
        <MiniBar label={g('tempo', lang)}    value={tactic.tempo}    max={100} color="#34d399" />
      </div>

      {/* Line tactics */}
      <div className="garage-line-pills">
        <LinePill text={tactic.forwards} level={tactic.pressure * 10} />
        <LinePill text={tactic.midfield} level={tactic.style} />
        <LinePill text={tactic.defence}  level={100 - tactic.tempo} />
      </div>

      {/* Badge */}
      <div className="garage-card-foot">
        <span
          className="garage-badge"
          style={{ background: bc.bg, border: `1px solid ${bc.border}`, color: bc.color }}
        >
          {badgeLabel}
        </span>
        <span className="garage-sr">%{tactic.successRate}</span>
      </div>

      {/* Delete confirmation overlay */}
      <AnimatePresence>
        {deleteArmed && (
          <motion.div
            className="garage-delete-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <p className="garage-delete-q">{g('deleteQ', lang)}</p>
            <div className="garage-delete-actions">
              <button className="garage-delete-confirm" onClick={() => deleteTactic(tactic.id)}>
                {g('deleteY', lang)}
              </button>
              <button className="garage-delete-cancel" onClick={() => { setDeleteArmed(false); if (deleteTimer) clearTimeout(deleteTimer); }}>
                {g('deleteN', lang)}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TacticGarage() {
  const { tactics, loading } = useSavedTactics();
  const { user } = useAuth();
  const { lang } = useLang();

  if (!user) return null;

  const count = tactics.length;

  return (
    <div className="garage-root">
      {/* Section header */}
      <div className="garage-header">
        <div>
          <h2 className="garage-title">{g('title', lang)}</h2>
          <p className="garage-sub">{g('sub', lang)}</p>
        </div>
        {count > 0 && (
          <div className="garage-count">
            {count} <span>{g('saved', lang)}</span>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="garage-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Empty state */}
      {!loading && count === 0 && (
        <motion.div
          className="garage-empty"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="garage-empty-icon"
            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            🗄️
          </motion.div>
          <div className="garage-empty-title">{g('empty', lang)}</div>
          <div className="garage-empty-sub">{g('emptySub', lang)}</div>
          <motion.a
            href="#anti-taktik"
            className="garage-empty-cta"
            whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.97 }}
          >
            Anti-Taktik Bulucu →
          </motion.a>
        </motion.div>
      )}

      {/* Card grid */}
      {!loading && count > 0 && (
        <motion.div className="garage-grid" layout>
          <AnimatePresence mode="popLayout">
            {tactics.map(t => (
              <GarageCard key={t.id} tactic={t} lang={lang} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
