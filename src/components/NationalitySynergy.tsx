import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../contexts/LanguageContext';
import './NationalitySynergy.css';

const SYNERGY_THRESHOLD = 6;

const NATIONALITIES = [
  'Brazilian','Spanish','German','French','English','Italian','Argentine','Dutch',
  'Portuguese','Belgian','Colombian','Uruguayan','Turkish','Moroccan','Japanese',
  'South Korean','Mexican','Ghanaian','Senegalese','Croatian','Serbian','Egyptian',
  'Danish','Swedish','Norwegian','Swiss','Austrian','Polish','Ukrainian','Romanian',
  'Greek','Czech','Slovak','Hungarian','Irish','Scottish','Welsh','American',
  'Canadian','Australian','Algerian','Tunisian','Cameroonian','Nigerian','Ivorian',
  'Chilean','Peruvian','Ecuadorian','Bolivian','Paraguayan','Venezuelan','Honduran',
  'Costa Rican','Jamaican','Trinidadian','Russian','Finnish','Estonian','Latvian',
  'Lithuanian','Belarusian','Moldovan','Albanian','Macedonian','Bosnian','Montenegrin',
  'Slovenian','Bulgarian','Israeli','Iranian','Saudi Arabian','Qatari','Emirati',
  'Japanese','Chinese','Indian','Thai','Indonesian','Vietnamese',
].sort();

const NS18N: Record<string, Record<string, string>> = {
  badge:      { tr: 'Motor Sinerji Analizi', en: 'Engine Synergy Analysis', hu: 'Motor Szinergia Elemzés', ar: 'تحليل تآزر المحرك', pt: 'Análise de Sinergia do Motor' },
  title:      { tr: 'Milliyet Sinerji Takipçisi', en: 'Nationality Synergy Tracker', hu: 'Nemzetiségi Szinergia Követő', ar: 'متتبع تآزر الجنسيات', pt: 'Rastreador de Sinergia de Nacionalidades' },
  sub:        { tr: 'Aynı milliyetten 6 oyuncu → Motor +3 genel güç bonusu. 11 oyuncunun milliyetini gir.', en: '6 players sharing the same nationality triggers a hidden +3 Overall Power engine bonus. Enter your Starting 11 nationalities.', hu: '6 azonos nemzetiségű játékos → rejtett +3 összteljesítmény-bónusz. Add meg a kezdő 11 játékos nemzetiségét.', ar: '6 لاعبين من نفس الجنسية يُفعّلون مكافأة خفية +3 قوة عامة. أدخل جنسيات الـ 11 لاعباً الأساسيين.', pt: '6 jogadores da mesma nacionalidade ativam um bônus oculto de +3 Poder Geral. Insira as nacionalidades do time inicial.' },
  playerLbl:  { tr: 'O', en: 'P', hu: 'J', ar: 'ل', pt: 'J' },
  inputHint:  { tr: 'Milliyet gir...', en: 'Enter nationality...', hu: 'Írd be a nemzetiséget...', ar: 'أدخل الجنسية...', pt: 'Digite a nacionalidade...' },
  distHeader: { tr: 'Milliyet Dağılımı', en: 'Nationality Distribution', hu: 'Nemzetiségi Megoszlás', ar: 'توزيع الجنسيات', pt: 'Distribuição de Nacionalidades' },
  need:       { tr: 'daha gerekli', en: 'more needed', hu: 'még szükséges', ar: 'لا يزال مطلوباً', pt: 'mais necessários' },
  locked:     { tr: 'SİNERJİ KİLİTLİ', en: 'SYNERGY LOCKED', hu: 'SZINERGIA ZÁROLT', ar: 'التآزر مقفول', pt: 'SINERGIA BLOQUEADA' },
  lockedMsg:  { tr: '+3 Motor Bonusu için', en: 'to trigger the +3 Engine Bonus', hu: 'a +3 Motor Bónusz aktiválásához', ar: 'لتفعيل مكافأة المحرك +3', pt: 'para ativar o Bônus do Motor +3' },
  needMore:   { tr: 'daha fazla', en: 'more', hu: 'még', ar: 'أكثر', pt: 'mais' },
  player:     { tr: 'oyuncu gerekli', en: 'player(s) needed', hu: 'játékos szükséges', ar: 'لاعب(ون) مطلوب', pt: 'jogador(es) necessário(s)' },
  active:     { tr: 'SİNERJİ AKTİF', en: 'SYNERGY ACTIVE', hu: 'SZINERGIA AKTÍV', ar: 'التآزر نشط', pt: 'SINERGIA ATIVA' },
  activeMsg:  { tr: '+3 Genel Kadro Avantajı Aktif', en: '+3 Overall Squad Advantage Unlocked', hu: '+3 Össz Csapatelőny Aktiválva', ar: 'تم إلغاء قفل ميزة +3 للفريق', pt: '+3 Vantagem Geral do Elenco Desbloqueada' },
  detected:   { tr: 'oyuncu tespit edildi', en: 'players detected', hu: 'játékos észlelve', ar: 'لاعب تم الكشف عنه', pt: 'jogadores detectados' },
  resetBtn:   { tr: 'Sıfırla', en: 'Reset', hu: 'Visszaállítás', ar: 'إعادة ضبط', pt: 'Redefinir' },
  fillHint:   { tr: 'Sinerji durumunu görmek için milliyet gir', en: 'Enter nationalities to see synergy status', hu: 'A szinergia állapotának megtekintéséhez add meg a nemzetiségeket', ar: 'أدخل الجنسيات لرؤية حالة التآزر', pt: 'Insira as nacionalidades para ver o status de sinergia' },
};

function ns(key: string, lang: string): string {
  return NS18N[key]?.[lang] ?? NS18N[key]?.en ?? key;
}

function lockedMsg(nationality: string, need: number, lang: string): string {
  const n = need === 1 ? 'player' : 'players';
  const msgs: Record<string, string> = {
    tr: `+3 Motor Bonusu için ${need} daha fazla ${nationality} oyuncusu gerekli.`,
    en: `Need ${need} more ${nationality} ${n} to trigger the +3 Engine Bonus.`,
    hu: `A +3 Motor Bónuszhoz még ${need} ${nationality} játékos szükséges.`,
    ar: `تحتاج إلى ${need} ${n === 'player' ? 'لاعب' : 'لاعبين'} آخر من ${nationality} لتفعيل مكافأة +3.`,
    pt: `São necessários mais ${need} jogador(es) ${nationality} para ativar o Bônus +3.`,
  };
  return msgs[lang] ?? msgs.en;
}

function buildCounts(slots: string[]): Array<{ nationality: string; count: number }> {
  const map: Record<string, number> = {};
  for (const s of slots) {
    const n = s.trim();
    if (n) map[n] = (map[n] || 0) + 1;
  }
  return Object.entries(map)
    .map(([nationality, count]) => ({ nationality, count }))
    .sort((a, b) => b.count - a.count);
}

function NatBar({ nationality, count, isTop, lang }: { nationality: string; count: number; isTop: boolean; lang: string }) {
  const pct = Math.min((count / SYNERGY_THRESHOLD) * 100, 100);
  const active = count >= SYNERGY_THRESHOLD;
  const barColor = active ? '#22c55e' : isTop ? '#ffd700' : 'rgba(255,255,255,0.2)';
  const need = SYNERGY_THRESHOLD - count;

  return (
    <motion.div
      className="ns-nat-row"
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.22 }}
    >
      <div className="ns-nat-info">
        <span className="ns-nat-name" style={{ color: active ? '#22c55e' : isTop ? '#ffd700' : 'rgba(255,255,255,0.6)' }}>
          {nationality}
        </span>
        {active && <span className="ns-active-chip">ACTIVE</span>}
        {!active && isTop && (
          <span className="ns-need-chip">
            {need} {ns('needMore', lang)} {ns('player', lang)}
          </span>
        )}
      </div>
      <div className="ns-bar-wrap">
        <div className="ns-bar-track">
          <motion.div
            className="ns-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: barColor, boxShadow: active ? `0 0 10px ${barColor}55` : 'none' }}
          />
          {active && (
            <motion.div
              className="ns-bar-glow"
              animate={{ x: ['-120%', '220%'] }}
              transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.7, ease: 'easeOut' }}
              style={{ background: barColor }}
            />
          )}
        </div>
        <span className="ns-count-label" style={{ color: active ? '#22c55e' : 'rgba(255,255,255,0.28)' }}>
          {count}/{SYNERGY_THRESHOLD}
        </span>
      </div>
    </motion.div>
  );
}

export default function NationalitySynergy() {
  const { lang } = useLang();
  const [slots, setSlots] = useState<string[]>(Array(11).fill(''));

  const update = (i: number, value: string) => {
    setSlots(prev => prev.map((s, idx) => idx === i ? value : s));
  };

  const reset = () => setSlots(Array(11).fill(''));

  const counts = useMemo(() => buildCounts(slots), [slots]);
  const filled = slots.filter(s => s.trim()).length;
  const topNat = counts[0];
  const synergyActive = topNat && topNat.count >= SYNERGY_THRESHOLD;

  return (
    <section id="nationality-synergy" className="ns-section">
      {/* Glow layers */}
      <div aria-hidden className="ns-glow ns-glow-l" />
      <div aria-hidden className="ns-glow ns-glow-r" />

      <motion.div
        className="ns-inner"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="ns-header">
          <div className="ns-badge">
            <span className="ns-badge-dot" />
            {ns('badge', lang)}
          </div>
          <h2 className="ns-title">{ns('title', lang)}</h2>
          <p className="ns-subtitle">{ns('sub', lang)}</p>
        </div>

        {/* 11 player input slots */}
        <div className="ns-card">
          <div className="ns-slots-grid">
            {slots.map((val, i) => (
              <div key={i} className={`ns-slot${val.trim() ? ' filled' : ''}`}>
                <label className="ns-slot-label">{ns('playerLbl', lang)}{i + 1}</label>
                <input
                  className="ns-slot-input"
                  list="ns-nat-list"
                  value={val}
                  onChange={e => update(i, e.target.value)}
                  placeholder={ns('inputHint', lang)}
                  maxLength={32}
                  autoComplete="off"
                />
              </div>
            ))}
          </div>

          <datalist id="ns-nat-list">
            {NATIONALITIES.map(n => <option key={n} value={n} />)}
          </datalist>

          <div className="ns-slot-actions">
            <span className="ns-filled-count">{filled}/11</span>
            <button className="ns-reset-btn" onClick={reset}>{ns('resetBtn', lang)}</button>
          </div>
        </div>

        {/* Distribution bars */}
        <AnimatePresence>
          {counts.length > 0 && (
            <motion.div
              className="ns-dist-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="ns-dist-header">{ns('distHeader', lang)}</div>
              <div className="ns-nat-list-wrap">
                <AnimatePresence mode="popLayout">
                  {counts.map((c, i) => (
                    <NatBar
                      key={c.nationality}
                      nationality={c.nationality}
                      count={c.count}
                      isTop={i === 0}
                      lang={lang}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Synergy status */}
        <AnimatePresence mode="wait">
          {filled === 0 ? (
            <motion.div
              key="hint"
              className="ns-status-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="ns-status-hint-icon">⚙️</span>
              {ns('fillHint', lang)}
            </motion.div>
          ) : synergyActive ? (
            <motion.div
              key="active"
              className="ns-status-card ns-status-active"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Active glow pulse */}
              <motion.div
                className="ns-active-pulse"
                animate={{ opacity: [0.3, 0.65, 0.3], scale: [1, 1.04, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Shimmer */}
              <motion.div
                className="ns-active-shimmer"
                animate={{ x: ['-130%', '230%'] }}
                transition={{ repeat: Infinity, repeatDelay: 3.5, duration: 0.85, ease: 'easeOut' }}
              />

              <div className="ns-status-body">
                <div className="ns-active-indicator">
                  <motion.span
                    className="ns-active-dot"
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  />
                  <span className="ns-active-label">{ns('active', lang)}</span>
                </div>
                <div className="ns-active-msg">{ns('activeMsg', lang)}</div>
                <div className="ns-active-detail">
                  <span className="ns-active-nat">{topNat.nationality}</span>
                  · {topNat.count} {ns('detected', lang)}
                  <span className="ns-plus3">+3</span>
                </div>
              </div>
            </motion.div>
          ) : topNat ? (
            <motion.div
              key="locked"
              className="ns-status-card ns-status-locked"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
            >
              <div className="ns-status-body">
                <div className="ns-locked-top">
                  <span className="ns-lock-icon">🔒</span>
                  <span className="ns-locked-label">{ns('locked', lang)}</span>
                </div>
                <div className="ns-locked-progress">
                  <div className="ns-locked-track">
                    <motion.div
                      className="ns-locked-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((topNat.count / SYNERGY_THRESHOLD) * 100, 100)}%` }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <span className="ns-locked-frac">{topNat.count}/{SYNERGY_THRESHOLD}</span>
                </div>
                <p className="ns-locked-full-msg">
                  {lockedMsg(topNat.nationality, SYNERGY_THRESHOLD - topNat.count, lang)}
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
