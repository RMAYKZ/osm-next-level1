# OSM Next Level — SEO / GEO / AEO Roadmap

*Internal planning document. Last updated: 2026-06-16. Reflects the actual
state of the codebase after the 2026-06-16 SEO implementation pass — not a
generic template.*

## Where we are now (baseline, shipped this session)

- 39-URL sitemap: Turkish homepage (`/`), English homepage (`/en/`), 10
  formations × 2 languages + hub pages, 5 English + 8 Turkish guide
  articles + hub pages.
- All formation counter-tactic numbers are read live from
  `src/data/tactics.ts` — cannot drift from the actual Anti-Tactic Engine.
- `robots.txt` explicitly allows major AI crawlers; `/llms.txt` and
  `/ai-overview.md` exist.
- Removed one real risk: a fabricated `aggregateRating` (1200 ratings/4.9)
  that didn't match real on-site review data — a Google structured-data
  spam-policy violation if left in place.
- Verified end-to-end against the real Firebase Hosting emulator, not just
  in theory: static pages return 200 with correct titles, unknown paths
  still fall back to the SPA correctly.
- `VideoObject` JSON-LD added for the 3 real YouTube videos (no `uploadDate`
  — real dates unknown, intentionally not fabricated).
- 18 Turkish pages now (10 formations + 9 guides, including a new
  `osm-scout-rehberi` article and stronger keyword coverage for "en güçlü
  taktik" and "kamp rehberi" inside existing pages, to avoid thin/duplicate
  content).
- **Language hand-off fixed**: every static page's "Open the Anti-Tactic
  Engine" CTA now links to `/?lang=en` or `/?lang=tr` (matching its own
  language). `LanguageContext.tsx` reads that query param on mount and lets
  it override a stale saved preference — verified in a real browser via
  Playwright (not just code review): a user with `tr` saved from a previous
  visit who clicks through from an English page now correctly lands in
  English, and vice versa.
- Caught and fixed a `.gitignore` rule that excluded the entire `scripts/`
  folder — would have silently broken `npm run build` for anyone else
  cloning the repo, since `generateStaticPages.ts` is required at build time.

**Known remaining gaps** (see "Not yet done" at the bottom — don't double
schedule these):
- `/en/` is a strong static landing page with a correct language hand-off
  into the live app, but is not itself the full interactive SPA — there's
  no server-rendered English version of the homepage's own meta/JSON-LD.
- No per-page custom OG share images (all pages reuse one `og-image.png`).
- 50-article Turkish backlog from the original brief is not fully built —
  18 of 50 Turkish pages exist, covering the highest-volume clusters, not
  the long tail.

## 30-Day Plan

| Action | Impact | Effort |
|---|---|---|
| Submit new sitemap.xml in Google Search Console + Bing Webmaster Tools | **HIGH** | Low |
| Request indexing for `/en/`, `/formations/`, `/blog/` hubs manually in GSC | **HIGH** | Low |
| Monitor GSC Coverage report for the new URLs (catch any crawl errors fast) | **HIGH** | Low |
| Add 5–8 more Turkish long-tail articles (remaining Phase 9 keyword clusters not yet covered: per-event guides, league-specific tactics) | MEDIUM | Medium |
| Verify `og-image.png` renders correctly in a real Twitter/Facebook share-debugger test | MEDIUM | Low |
| Confirm GPTBot/ClaudeBot/PerplexityBot are not being blocked by any CDN/WAF rule in front of Firebase Hosting (robots.txt allows them, but a separate firewall could still block by user-agent) | **HIGH** | Low |

**Expected outcome by day 30:** new URLs fully indexed; no organic traffic
spike yet (indexing + initial ranking takes time), but AI crawlers should
start picking up `/llms.txt` and citing formation pages for specific
"OSM X counter tactic" queries faster than traditional search ranks them.

## 60-Day Plan

| Action | Impact | Effort |
|---|---|---|
| Review Search Console query data for which formation pages are getting impressions but low CTR → rewrite those titles/meta descriptions | **HIGH** | Low |
| ~~Build the language hand-off from static pages into the live app~~ | **HIGH** | ~~Done 2026-06-16~~ — `?lang=` query param now overrides stale saved preference, verified in a real browser |
| Decide whether `/en/`'s own server HTML (meta/JSON-LD) should be localized too, vs. staying as the static landing page it is today | MEDIUM | Medium |
| Add internal links from the live SPA's Navbar/Footer to `/formations/` and `/blog/` (currently only reachable from inside the Blog/FormationsOverview sections) | MEDIUM | Low |
| Generate real per-formation OG share images (would need a new build step — e.g. `satori`/`sharp`) | MEDIUM | Medium |
| Get real YouTube upload dates from the channel owner and add `uploadDate` to the `VideoObject` schema | LOW | Low |
| Re-run the Phase 1 audit scoring to measure delta against the 2026-06-16 baseline | MEDIUM | Low |

**Expected outcome by day 60:** first measurable organic impressions for
long-tail formation queries (e.g. "osm 433 karşı taktik"); Turkish traffic
should see the first lift since that's where the bulk of new content and
the existing audience overlap most.

## 90-Day Plan

| Action | Impact | Effort |
|---|---|---|
| Expand Turkish content toward the full 50-article backlog from the original brief, prioritized by actual GSC query data (not guesswork) | **HIGH** | High |
| Build a handful of comparison pages ("4-3-3 vs 5-2-3", etc.) — strong AI-citation format (comparison tables) not yet covered | MEDIUM | Medium |
| Evaluate whether the homepage's `WebApplication` `featureList`/description need updating to match whatever's shipped by then | LOW | Low |
| Re-audit hreflang/canonical health via Search Console's International Targeting report | MEDIUM | Low |
| Decide whether the Vite SPA + static-prerender hybrid has reached its ceiling, or whether a fuller SSR migration (Next.js or similar) is justified by then — this was flagged as a possible path in the original audit and deliberately not taken this round | — | Decision point |

**Expected outcome by day 90:** if GSC shows healthy indexing/impressions
growth from day 30–60, this is the point to scale content production
confidently. If not, this is the point to diagnose why (crawl issues,
thin content, cannibalization) before writing more pages.

## Impact estimate summary

| Lever | Organic traffic | Turkish traffic | AI citations | GEO visibility | Topical authority |
|---|---|---|---|---|---|
| New indexable pages (formations/blog) | Medium, delayed (~6-10 wks) | Medium-High | High, faster than search | High | High |
| `/en/` homepage | Low-Medium | None (TR unaffected) | Medium | Medium | Medium |
| robots.txt + llms.txt + ai-overview.md | None directly | None | High | High | Low |
| Removed fake `aggregateRating` | Risk-avoidance (prevents a possible manual action) | — | — | — | — |
| Roadmap execution (this doc) | Compounding over 90 days | Compounding | Compounding | Compounding | Compounding |

## Not yet done (explicitly out of scope this round)

- Full SSR/Next.js migration.
- True interactive English app mode (only a static `/en/` landing page exists).
- Per-page custom OG images.
- Full 50-article Turkish backlog (17 of 50 shipped, highest-value ones first).
- Video upload dates in `VideoObject` schema (need real data from the channel owner).
