import { useLang } from '../contexts/LanguageContext';
import './HomeTacticHero.css';

export default function HomeTacticHero() {
  const { t } = useLang();

  return (
    <div className="hth-wrap">
      {/* ── Existing alternative tactic ── */}
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

      {/* ── NEW exclusive special tactic: 4-3-3 B Use Wingers ── */}
      <div className="hth-special-card">
        {/* Blinking border overlay */}
        <div className="hth-special-blink" aria-hidden="true" />
        <div className="hth-special-shine" aria-hidden="true" />

        {/* NEW badge strip */}
        <div className="hth-special-newstrip">
          <span className="hth-special-newbadge">
            <span className="hth-special-newdot" />
            NEW
          </span>
          <span className="hth-special-date">22 June 2026</span>
          <span className="hth-special-vsall">{t('special.vsAll')}</span>
        </div>

        <div className="hth-inner">

          {/* LEFT */}
          <div className="hth-left">
            <div className="hth-eyebrow hth-special-eyebrow">
              <span className="hth-special-star">★</span>
              {t('special.title')}
              <span className="hth-eyebrow-badges">
                <span className="hth-badge-loc hth-special-badge-loc">🏠 {t('anti.masterHome')}</span>
                <span className="hth-special-badge-any">⚡ ANY OPP</span>
              </span>
            </div>
            <div className="hth-fm-row">
              <span className="hth-fm-code hth-special-fmcode">4-3-3 B</span>
              <span className="hth-fm-dot hth-special-dot">·</span>
              <span className="hth-fm-style hth-special-fmstyle">{t('mentality.wingPlay')}</span>
            </div>
            <div className="hth-note hth-special-note">{t('special.desc')}</div>
          </div>

          {/* RIGHT */}
          <div className="hth-right">
            <div className="hth-winrate-badge hth-special-winrate">{t('special.winRate')}</div>

            <div className="hth-stats hth-special-stats">
              <div className="hth-stat">
                <span className="hth-stat-key">{t('anti.pressure')}</span>
                <span className="hth-stat-val hth-special-val">70</span>
              </div>
              <div className="hth-stat-sep" />
              <div className="hth-stat">
                <span className="hth-stat-key">{t('anti.style')}</span>
                <span className="hth-stat-val hth-special-val">65</span>
              </div>
              <div className="hth-stat-sep" />
              <div className="hth-stat">
                <span className="hth-stat-key">{t('anti.tempo')}</span>
                <span className="hth-stat-val hth-special-val">59</span>
              </div>
            </div>

            <div className="hth-tactics">
              <span className="hth-tac-chip hth-special-chip">
                <span className="hth-tac-key">{t('lt.forwards')}</span>
                {t('pitch.attackOnly')}
              </span>
              <span className="hth-tac-chip hth-special-chip">
                <span className="hth-tac-key">{t('lt.midfield')}</span>
                {t('pitch.protectDefense')}
              </span>
              <span className="hth-tac-chip hth-special-chip">
                <span className="hth-tac-key">{t('lt.defence')}</span>
                {t('pitch.stayBack')}
              </span>
              <span className="hth-tac-chip hth-tac-off hth-special-chip-off">
                <span className="hth-tac-key">{t('lt.offsides')}</span>
                {t('lt.off')}
              </span>
              <span className="hth-tac-chip hth-special-chip">
                <span className="hth-tac-key">{t('lt.marking')}</span>
                {t('special.marking')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
