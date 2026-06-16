# OSM Next Level — SEO / GEO / AEO Roadmap

*Internal planning document. Last updated: 2026-06-16. Reflects the actual
state of the codebase after the 2026-06-16 SEO implementation pass — not a
generic template.*

## Where we are now (baseline, shipped this session)

- 56-URL sitemap: Turkish homepage (`/`), English homepage (`/en/`), 10
  formations × 2 languages, 10 formation-comparison pages × 2 languages,
  5 English + 13 Turkish guide articles, plus hub pages for all of the
  above — all with image-sitemap entries for their own custom OG images.
- All formation counter-tactic numbers are read live from
  `src/data/tactics.ts` — cannot drift from the actual Anti-Tactic Engine.
  Comparison pages reuse the same lookup, never re-typed.
- `robots.txt` explicitly allows major AI crawlers; `/llms.txt` and
  `/ai-overview.md` exist and list every page above as a preferred
  citation URL.
- Every formation/blog/comparison page has its own generated OG share
  image (`scripts/generateStaticPages.ts` + `sharp`, SVG→PNG, no headless
  browser) — branded, title-specific, with a safe fallback to the original
  `og-image.png` if generation ever fails for one page.
- Removed one real risk: a fabricated `aggregateRating` (1200 ratings/4.9)
  that didn't match real on-site review data — a Google structured-data
  spam-policy violation if left in place.
- `VideoObject` JSON-LD added for the 3 real YouTube videos (no `uploadDate`
  — real dates unknown, intentionally not fabricated).
- 23 Turkish pages now (10 formations + 13 guides) plus 5 formation
  comparison pages × 2 languages — covers referee colors, pre-match
  checklist, league goal planning, weekly meta, squad value analysis,
  scouting, and the highest-volume "karşı taktik" keyword clusters.
- **Language hand-off fixed**: every static page's "Open the Anti-Tactic
  Engine" CTA links to `/?lang=en` or `/?lang=tr` (matching its own
  language). `LanguageContext.tsx` reads that query param on mount and lets
  it override a stale saved preference — verified in a real browser via
  Playwright: a user with `tr` saved from a previous visit who clicks
  through from an English page now correctly lands in English.
- **Accessibility: real Lighthouse score is 100/100** (up from an unverified
  guess) after fixing 3 genuine WCAG contrast failures found by measurement,
  not assumption: the PWA install button, a match-admin delete button, and
  the active language-switcher button all had white text on a red/green
  background below the 4.5:1 AA threshold. Also added `role="dialog"` +
  `aria-modal` + Escape-to-close to all three modal/sheet overlays
  (mobile menu, tool bottom sheet, sign-in panel), and made the decorative
  WebGL shader background respect `prefers-reduced-motion`.
- **Performance: 41 → 56/100, measured on the real production site
  (www.osmnextlevel.com, not the local emulator) on 2026-06-16.** Four
  fixes stacked: (1) mobile shader disabled — root cause was ~27.7s of
  simulated main-thread work from a continuously-rendering WebGL shader
  (35-iteration fbm noise loop per pixel, 60fps), exactly what makes a
  phone GPU heat up and the UI feel janky; (2) `three.js` no longer even
  downloaded on mobile (`App.tsx` never mounts the shader component
  there); (3) Firebase Auth init deferred to `requestIdleCallback`;
  (4) the `vendor-firebase` bundle — previously one combined chunk with
  64% unused code on a typical load (90KB of 140KB gzipped, Lighthouse
  `unused-javascript` audit) — is now split by sub-package
  (`vite.config.ts` `manualChunks`) so Auth, Firestore and Functions
  load independently, matching the per-feature dynamic imports
  `src/lib/firebase.ts` already had. On the real production CDN:
  Accessibility 100, SEO 100, Best Practices 100, CLS 0.006, TBT 10ms —
  all excellent. FCP/LCP (~9s) remain the dominant cost, now confirmed
  as genuine main-thread JS parse/execute time under Lighthouse's
  throttled-CPU simulation, not a network or caching problem (server
  response time was 10ms). Going further here means deeper bundle-size
  work or SSR — the architecture decision already deferred this round.
- Caught and fixed a `.gitignore` rule that excluded the entire `scripts/`
  folder — would have silently broken `npm run build` for anyone else
  cloning the repo, since `generateStaticPages.ts` is required at build time.
- Caught and fixed a path-resolution bug in the generator itself (leading
  `/` made `path.resolve` write outside `dist/` on Windows) before it ever
  shipped — verified via the real Firebase Hosting emulator, not just
  `tsc`.

**Known remaining gaps** (see "Not yet done" at the bottom — don't double
schedule these):
- `/en/` is a strong static landing page with a correct language hand-off
  into the live app, but is not itself the full interactive SPA — there's
  no server-rendered English version of the homepage's own meta/JSON-LD.
- 50-article Turkish backlog from the original brief is not fully built —
  23 of 50 Turkish pages exist, covering the highest-volume clusters, not
  the long tail.
- Performance score (41) needs a product decision, not an engineering
  fix from this session — see 30-day plan.
- Pre-existing, unrelated to this work: a Google Sheets API call (the
  "Premium remote codes" feature) returns 403 in console — likely an API
  key/sheet-permission issue on the owner's Google Cloud project, flagged
  by Lighthouse's Best Practices audit but outside SEO/GEO scope.

## 30-Day Plan

| Action | Impact | Effort |
|---|---|---|
| Submit new sitemap.xml in Google Search Console + Bing Webmaster Tools | **HIGH** | Low |
| Request indexing for `/en/`, `/formations/`, `/blog/` hubs manually in GSC | **HIGH** | Low |
| Monitor GSC Coverage report for the new URLs (catch any crawl errors fast) | **HIGH** | Low |
| Add 5–8 more Turkish long-tail articles (remaining Phase 9 keyword clusters not yet covered: per-event guides, league-specific tactics) | MEDIUM | Medium |
| Verify the new per-page OG images render correctly in a real Twitter/Facebook share-debugger test (generated locally, never checked against the live debuggers) | MEDIUM | Low |
| Confirm GPTBot/ClaudeBot/PerplexityBot are not being blocked by any CDN/WAF rule in front of Firebase Hosting (robots.txt allows them, but a separate firewall could still block by user-agent) | **HIGH** | Low |
| ~~Performance score decision~~ | **HIGH** | ~~Done 2026-06-16~~ — owner chose mobile feel over fidelity; shader now desktop-only, 41→49, main-thread work −64% |
| ~~Stop downloading three.js on mobile at all~~ | **HIGH** | ~~Done 2026-06-16~~ — `App.tsx` never mounts `<AnimatedShaderBackground />` on mobile now, so its lazy chunk is never requested. Total byte weight 1021KB → 896KB |
| ~~Defer Firebase Auth init off the critical path~~ | MEDIUM | ~~Done 2026-06-16~~ — `AuthContext.tsx` now starts via `requestIdleCallback` (2s timeout fallback) instead of immediately on mount. FCP 4.7s → 3.8s in local testing |
| ~~Re-measure Performance on the real deployed site~~ | **HIGH** | ~~Done 2026-06-16~~ — 56/100 on www.osmnextlevel.com (real CDN, Vercel), CLS/TBT/Best Practices all excellent there; confirmed FCP/LCP slowness is genuine CPU-bound JS execution, not network/caching |
| ~~Split the firebase vendor chunk by sub-package~~ | MEDIUM | ~~Done 2026-06-16~~ — Auth/Firestore/Functions no longer force-bundled together; was 64% unused on a typical load |
| Discovered: production deploys automatically via Vercel's GitHub integration on every push to `main` — no manual deploy step needed (a `firebase deploy` earlier in this project went to an inactive Firebase Hosting target the custom domain doesn't use; harmless but unnecessary going forward) | — | Note for next time |

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
| Add internal links from the live SPA's Navbar/Footer to `/formations/`, `/blog/` and `/compare/` (currently only reachable from inside individual sections) | MEDIUM | Low |
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
| Add more formation-comparison pages beyond the 5 shipped (e.g. 4-2-3-1 vs 5-2-3, 4-4-2 vs 5-3-2) once GSC shows which matchups people actually search | MEDIUM | Medium |
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
| New indexable pages (formations/blog/compare) | Medium, delayed (~6-10 wks) | Medium-High | High, faster than search | High | High |
| `/en/` homepage + language hand-off | Low-Medium | None (TR unaffected) | Medium | Medium | Medium |
| robots.txt + llms.txt + ai-overview.md | None directly | None | High | High | Low |
| Custom OG images per page | Low | Low | Medium (cleaner link previews when AI tools cite a page) | Low | — |
| Comparison pages | Low-Medium | Low-Medium | High (comparison tables are a strong AI-citation format) | Medium | Medium |
| Removed fake `aggregateRating` | Risk-avoidance (prevents a possible manual action) | — | — | — | — |
| Accessibility fixes (100/100) | Low direct, but a real ranking signal component | — | — | — | — |
| Roadmap execution (this doc) | Compounding over 90 days | Compounding | Compounding | Compounding | Compounding |

## Not yet done (explicitly out of scope this round)

- Full SSR/Next.js migration.
- True interactive English app mode (only a static `/en/` landing page exists).
- Full 50-article Turkish backlog (23 of 50 shipped, highest-value ones first).
- Video upload dates in `VideoObject` schema (need real data from the channel owner).
- Fixing the 41/100 Performance score — root cause identified (the animated
  shader background), but the actual fix is a product/design trade-off the
  owner needs to make, not something to decide unilaterally.
- The pre-existing Google Sheets 403 console error (Premium remote codes
  feature) — unrelated to this SEO/GEO work, needs the owner to check their
  Google Cloud API key/sheet permissions.
