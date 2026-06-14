import { useLang } from '../contexts/LanguageContext';
import './HomeTacticHero.css';

export default function HomeTacticHero() {
  const { t } = useLang();

  return (
    <div className="w-full py-4">
      <div className="hth-card w-full relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4">

        {/* animated gold shine sweep */}
        <div className="hth-shine absolute pointer-events-none" />

        {/* ── Card header label ── */}
        <div className="hth-subtitle" style={{ marginBottom: '-6px' }}>{t('alternative.title')}</div>

        {/* ── Badges ── */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="hth-badge-gold">{t('anti.masterHome')}</span>
          <span className="hth-badge-green">{t('anti.badgeElite')}</span>
          <span className="hth-badge-winrate ml-auto">{t('alternative.winRate')}</span>
        </div>

        {/* ── Formation title ── */}
        <div>
          <div className="hth-title">
            4-5-1 <span className="hth-title-sub">({t('mentality.shootOnSight')})</span>
          </div>
        </div>

        {/* ── Stats (3-col grid) ── */}
        <div className="grid grid-cols-3 gap-2">
          <div className="hth-stat-card flex flex-col items-center rounded-lg py-2 px-1">
            <div className="hth-stat-lbl">{t('anti.pressure')}</div>
            <div className="hth-stat-val" style={{ color: '#ff4757' }}>9</div>
          </div>
          <div className="hth-stat-card flex flex-col items-center rounded-lg py-2 px-1">
            <div className="hth-stat-lbl">{t('anti.style')}</div>
            <div className="hth-stat-val" style={{ color: '#ffd700' }}>33</div>
          </div>
          <div className="hth-stat-card flex flex-col items-center rounded-lg py-2 px-1">
            <div className="hth-stat-lbl">{t('anti.tempo')}</div>
            <div className="hth-stat-val" style={{ color: '#00e5ff' }}>44</div>
          </div>
        </div>

        {/* ── Line Tactics (2-col grid) ── */}
        <div>
          <div className="hth-section-lbl mb-2">{t('pitch.lineTactics')}</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="hth-tac-row flex justify-between items-center rounded px-3 py-3">
              <span className="hth-tac-lbl">{t('lt.forwards')}</span>
              <span className="hth-tac-val" style={{ color: '#4fc3f7' }}>{t('pitch.attackOnly')}</span>
            </div>
            <div className="hth-tac-row flex justify-between items-center rounded px-3 py-3">
              <span className="hth-tac-lbl">{t('lt.midfield')}</span>
              <span className="hth-tac-val" style={{ color: '#ff9800' }}>{t('pitch.protectDefense')}</span>
            </div>
            <div className="hth-tac-row flex justify-between items-center rounded px-3 py-3">
              <span className="hth-tac-lbl">{t('lt.defence')}</span>
              <span className="hth-tac-val" style={{ color: '#ff9800' }}>{t('pitch.stayBack')}</span>
            </div>
            <div className="hth-tac-row flex justify-between items-center rounded px-3 py-3">
              <span className="hth-tac-lbl">{t('lt.offsides')}</span>
              <span className="hth-tac-val" style={{ color: '#ff4757' }}>{t('lt.off')}</span>
            </div>
            <div className="hth-tac-row flex justify-between items-center rounded px-3 py-3 col-span-2">
              <span className="hth-tac-lbl">{t('lt.marking')}</span>
              <span className="hth-tac-val" style={{ color: '#00e5ff' }}>{t('pitch.zoneMarking')}</span>
            </div>
          </div>
        </div>

        {/* ── Description ── */}
        <div className="hth-note">{t('alternative.desc')}</div>

      </div>
    </div>
  );
}
