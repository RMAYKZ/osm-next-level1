declare function gtag(...args: unknown[]): void;

function track(eventName: string, params?: Record<string, unknown>) {
  if (typeof gtag === 'undefined') return;
  gtag('event', eventName, params);
}

export const analytics = {
  // ── Anti-taktik arama ─────────────────────────────────────────────
  antiTacticSearch(opponent: string, location: 'home' | 'away', strength: string) {
    track('anti_tactic_search', {
      event_category: 'tools',
      opponent_formation: opponent,
      match_location: location,
      team_strength: strength,
    });
  },

  // ── Premium ───────────────────────────────────────────────────────
  premiumClick(source: string) {
    track('premium_click', {
      event_category: 'monetization',
      source,
    });
  },

  premiumCodeRedeem(success: boolean) {
    track('premium_code_redeem', {
      event_category: 'monetization',
      success,
    });
  },

  premiumUnlocked() {
    track('premium_unlocked', { event_category: 'monetization' });
  },

  // ── Dil değişimi ──────────────────────────────────────────────────
  languageChange(lang: string) {
    track('language_change', {
      event_category: 'engagement',
      language: lang,
    });
  },

  // ── Community ─────────────────────────────────────────────────────
  commentSubmit() {
    track('comment_submit', { event_category: 'community' });
  },

  metaVote(tactic: string) {
    track('meta_vote', {
      event_category: 'community',
      tactic,
    });
  },

  // ── Araçlar ───────────────────────────────────────────────────────
  tacticSaved(formation: string) {
    track('tactic_saved', {
      event_category: 'tools',
      formation,
    });
  },

  shareCardDownload() {
    track('share_card_download', { event_category: 'engagement' });
  },

  youtubeClick(videoTitle: string) {
    track('youtube_click', {
      event_category: 'engagement',
      video_title: videoTitle,
    });
  },

  // ── CTA ───────────────────────────────────────────────────────────
  ctaClick(label: string) {
    track('cta_click', {
      event_category: 'engagement',
      label,
    });
  },
};
