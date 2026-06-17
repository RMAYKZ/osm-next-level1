import { useLang } from '../contexts/LanguageContext';
import './HomeTacticHero.css';

export default function HomeTacticHero() {
  const { t } = useLang();

  return (
    <div className="hth-wrap">
      <div className="hth-card">
        <div className="hth-shine" />

        <div className="hth-inner">

          {/* LEFT: eyebrow + formation name + note */}
          <div className="hth-left">
            <div className="hth-eyebrow">
              <span className="hth-eyebrow-dot" />
              {t('alternative.title')}
              <span className="hth-eyebrow-badges">
                <span className="hth-badge-loc">🏠 {t('anti.masterHome')}</span>
                <span className="hth-badge-elite">{t('anti.badgeElite')}</span>
              </span>
            </div>
            <div className="hth-fm-row">
              <span className="hth-fm-code">4-5-1</span>
              <span className="hth-fm-dot">·</span>
              <span className="hth-fm-style">{t('mentality.shootOnSight')}</span>
            </div>
            <div className="hth-note">{t('alternative.desc')}</div>
          </div>

          {/* RIGHT: win rate + stats + tactics */}
          <div className="hth-right">
            <div className="hth-winrate-badge">{t('alternative.winRate')}</div>

            <div className="hth-stats">
              <div className="hth-stat">
                <span className="hth-stat-key">{t('anti.pressure')}</span>
                <span className="hth-stat-val">9</span>
              </div>
              <div className="hth-stat-sep" />
              <div className="hth-stat">
                <span className="hth-stat-key">{t('anti.style')}</span>
                <span className="hth-stat-val">33</span>
              </div>
              <div className="hth-stat-sep" />
              <div className="hth-stat">
                <span className="hth-stat-key">{t('anti.tempo')}</span>
                <span className="hth-stat-val">44</span>
              </div>
            </div>

            <div className="hth-tactics">
              <span className="hth-tac-chip">
                <span className="hth-tac-key">{t('lt.forwards')}</span>
                {t('pitch.attackOnly')}
              </span>
              <span className="hth-tac-chip">
                <span className="hth-tac-key">{t('lt.midfield')}</span>
                {t('pitch.protectDefense')}
              </span>
              <span className="hth-tac-chip">
                <span className="hth-tac-key">{t('lt.defence')}</span>
                {t('pitch.stayBack')}
              </span>
              <span className="hth-tac-chip hth-tac-off">
                <span className="hth-tac-key">{t('lt.offsides')}</span>
                {t('lt.off')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
