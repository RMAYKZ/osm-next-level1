// ── Static page generator for programmatic SEO / GEO ──
//
// This project is a client-rendered Vite SPA (no SSR). Most AI crawlers
// (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) and many traditional
// crawlers never execute JavaScript, so anything rendered only inside React
// is invisible to them. This script runs AFTER `vite build` and writes
// fully-formed static HTML files straight into dist/ for every formation
// and blog page. Firebase Hosting serves an exact static-file match before
// it ever applies the SPA catch-all rewrite (see firebase.json), so these
// pages are served as-is — no rewrite changes needed.
//
// Single source of truth: all Pressure/Style/Tempo numbers are read live
// from `antiTactics` (src/data/tactics.ts) — never duplicated by hand here —
// so these pages can never drift from the live Anti-Tactic Engine.
//
// Run via: tsx scripts/generateStaticPages.ts  (wired into `npm run build`)

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { blogPosts } from "../src/data/blog";
import { blogPostsTr } from "../src/data/blogTr";
import { formationPages, type FormationPage, type FormationContent } from "../src/data/formations";
import { antiTactics, opponentTactics } from "../src/data/tactics";
import type { BlogPost } from "../src/data/blog";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = resolve(ROOT, "dist");
const SITE = "https://osmnextlevel.com";
const OG_IMAGE = `${SITE}/og-image.png`;
const BUILD_DATE = new Date().toISOString().slice(0, 10);

if (!existsSync(DIST)) {
  console.error("[generateStaticPages] dist/ not found — run `vite build` first.");
  process.exit(1);
}

type Lang = "en" | "tr";

interface UiStrings {
  home: string;
  formationsHub: string;
  blogHub: string;
  breadcrumbHome: string;
  openEngine: string;
  strengths: string;
  weaknesses: string;
  counterTable: string;
  faqTitle: string;
  quickSteps: string;
  backToFormations: string;
  backToBlog: string;
  colLocation: string;
  colStrength: string;
  colFormation: string;
  colPressure: string;
  colStyle: string;
  colTempo: string;
  colNote: string;
  stronger: string;
  equal: string;
  weaker: string;
  home2: string;
  away: string;
  allFormations: string;
  allGuides: string;
}

const UI: Record<Lang, UiStrings> = {
  en: {
    home: "OSM Next Level",
    formationsHub: "Formations & Counter Tactics",
    blogHub: "Guides",
    breadcrumbHome: "Home",
    openEngine: "Open the Anti-Tactic Engine →",
    strengths: "Strengths",
    weaknesses: "Weaknesses",
    counterTable: "Counter-Tactic Table (live data from the Anti-Tactic Engine)",
    faqTitle: "Frequently Asked Questions",
    quickSteps: "Quick Steps",
    backToFormations: "← All formations",
    backToBlog: "← All guides",
    colLocation: "Location",
    colStrength: "Squad Strength",
    colFormation: "Recommended Formation",
    colPressure: "Pressure",
    colStyle: "Style",
    colTempo: "Tempo",
    colNote: "Why",
    stronger: "Stronger",
    equal: "Equal",
    weaker: "Weaker",
    home2: "Home",
    away: "Away",
    allFormations: "All Formations",
    allGuides: "All Guides",
  },
  tr: {
    home: "OSM Next Level",
    formationsHub: "Formasyonlar ve Karşı Taktikler",
    blogHub: "Rehberler",
    breadcrumbHome: "Anasayfa",
    openEngine: "Anti-Taktik Motorunu Aç →",
    strengths: "Güçlü Yönler",
    weaknesses: "Zayıf Yönler",
    counterTable: "Karşı Taktik Tablosu (Anti-Taktik Motorundan canlı veri)",
    faqTitle: "Sık Sorulan Sorular",
    quickSteps: "Hızlı Adımlar",
    backToFormations: "← Tüm formasyonlar",
    backToBlog: "← Tüm rehberler",
    colLocation: "Maç Yeri",
    colStrength: "Kadro Gücü",
    colFormation: "Önerilen Diziliş",
    colPressure: "Baskı",
    colStyle: "Stil",
    colTempo: "Tempo",
    colNote: "Neden",
    stronger: "Güçlü",
    equal: "Eşit",
    weaker: "Zayıf",
    home2: "Ev",
    away: "Deplasman",
    allFormations: "Tüm Formasyonlar",
    allGuides: "Tüm Rehberler",
  },
};

// ── tiny markdown-lite → HTML (matches the convention already used in Blog.tsx) ──

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineMd(s: string): string {
  return esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function renderContentBlock(block: string): string {
  if (block.startsWith("## ")) {
    const lines = block.split("\n");
    const heading = lines[0].replace("## ", "");
    const bodyLines = lines.slice(1);
    let html = `<h2>${inlineMd(heading)}</h2>`;
    let listBuf: string[] = [];
    const flushList = () => {
      if (listBuf.length) {
        html += `<ul>${listBuf.map((li) => `<li>${inlineMd(li.replace(/^- /, ""))}</li>`).join("")}</ul>`;
        listBuf = [];
      }
    };
    for (const line of bodyLines) {
      if (line.startsWith("- ")) {
        listBuf.push(line);
      } else {
        flushList();
        if (line.trim()) html += `<p>${inlineMd(line)}</p>`;
      }
    }
    flushList();
    return html;
  }
  return `<p>${inlineMd(block)}</p>`;
}

function renderContent(content: string[]): string {
  return content.map(renderContentBlock).join("\n");
}

function renderList(items: string[]): string {
  return `<ul>${items.map((i) => `<li>${inlineMd(i)}</li>`).join("")}</ul>`;
}

// ── page shell ──

interface Alternate { lang: string; href: string }

function basePage(opts: {
  lang: Lang;
  canonical: string;
  alternates?: Alternate[];
  title: string;
  description: string;
  jsonLd: object[];
  bodyHtml: string;
}): string {
  const { lang, canonical, alternates = [], title, description, jsonLd, bodyHtml } = opts;
  const hreflangTags = alternates.map((a) => `<link rel="alternate" hreflang="${a.lang}" href="${a.href}" />`).join("\n    ");
  return `<!doctype html>
<html lang="${lang}" dir="ltr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
<link rel="canonical" href="${canonical}" />
${hreflangTags}
<meta property="og:type" content="article" />
<meta property="og:site_name" content="OSM Next Level" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${OG_IMAGE}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${OG_IMAGE}" />
<link rel="icon" href="/favicon.ico" sizes="64x64" />
<script type="application/ld+json">${JSON.stringify(jsonLd.length === 1 ? jsonLd[0] : jsonLd)}</script>
<style>
:root{color-scheme:dark;}
body{margin:0;background:#070711;color:#e8e9f0;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6;}
a{color:#34d399;text-decoration:none;}
a:hover{text-decoration:underline;}
header.site{padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);}
header.site a{font-weight:800;font-size:18px;color:#e8e9f0;}
main{max-width:880px;margin:0 auto;padding:32px 24px 64px;}
nav.breadcrumb{font-size:13px;color:#9aa0b4;margin-bottom:20px;}
nav.breadcrumb a{color:#9aa0b4;}
h1{font-size:clamp(28px,4vw,40px);font-weight:900;margin:0 0 12px;}
h2{font-size:22px;font-weight:800;color:#a7f3d0;margin:32px 0 10px;}
h3{font-size:17px;font-weight:700;margin:20px 0 8px;}
p{color:#c7cad6;}
ul{padding-left:22px;color:#c7cad6;}
li{margin:4px 0;}
table{width:100%;border-collapse:collapse;margin:16px 0 8px;font-size:13px;}
th,td{border:1px solid rgba(255,255,255,0.12);padding:8px 10px;text-align:left;}
th{background:rgba(52,211,153,0.08);color:#a7f3d0;}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:16px 0;}
@media (max-width:640px){.grid2{grid-template-columns:1fr;}}
.card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:18px 20px;margin:16px 0;}
.cta{display:inline-block;margin-top:24px;padding:12px 24px;border-radius:999px;background:#34d399;color:#070711;font-weight:800;}
dl{margin:16px 0;}
dt{font-weight:800;color:#e8e9f0;margin-top:16px;}
dd{margin:6px 0 0;color:#c7cad6;}
footer.site{max-width:880px;margin:0 auto;padding:24px;color:#7a8094;font-size:12px;border-top:1px solid rgba(255,255,255,0.08);}
footer.site a{color:#7a8094;}
ol{padding-left:22px;color:#c7cad6;}
</style>
</head>
<body>
<header class="site"><a href="/">⚽ OSM Next Level</a></header>
<main>
${bodyHtml}
</main>
<footer class="site">© 2024–2026 omerovvvvv — OSM Next Level. <a href="/sitemap.xml">Sitemap</a> · <a href="/llms.txt">llms.txt</a></footer>
</body>
</html>`;
}

function breadcrumbHtml(items: { name: string; href?: string }[]): string {
  return `<nav class="breadcrumb">${items
    .map((it) => (it.href ? `<a href="${it.href}">${esc(it.name)}</a>` : `<span>${esc(it.name)}</span>`))
    .join(" › ")}</nav>`;
}

function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

const sitemapEntries: { loc: string; lastmod: string; priority: string; alternates?: Alternate[] }[] = [];

function write(relPath: string, html: string) {
  // Strip any leading slash — path.resolve() treats a segment starting
  // with "/" as drive-root-absolute on Windows, which would silently
  // write outside dist/ instead of joining onto it.
  const safeRel = relPath.replace(/^[/\\]+/, "");
  const filePath = resolve(DIST, safeRel, "index.html");
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, html, "utf-8");
}

// ── formation pages ──

function counterTableHtml(t: UiStrings, opponentId: string): string {
  const rows = antiTactics.filter((a) => a.opponentId === opponentId);
  const strengthLabel = (s: string) => (s === "stronger" ? t.stronger : s === "equal" ? t.equal : t.weaker);
  const locLabel = (l: string) => (l === "home" ? t.home2 : t.away);
  return `<table>
<thead><tr><th>${t.colLocation}</th><th>${t.colStrength}</th><th>${t.colFormation}</th><th>${t.colPressure}</th><th>${t.colStyle}</th><th>${t.colTempo}</th><th>${t.colNote}</th></tr></thead>
<tbody>
${rows
  .map(
    (r) =>
      `<tr><td>${locLabel(r.location)}</td><td>${strengthLabel(r.strength)}</td><td>${esc(r.recommendedFormation)}</td><td>${r.pressure}</td><td>${r.style}</td><td>${r.tempo}</td><td>${esc(r.note)}</td></tr>`
  )
  .join("\n")}
</tbody>
</table>`;
}

function counterItemListJsonLd(opponentId: string, baseUrl: string) {
  const rows = antiTactics.filter((a) => a.opponentId === opponentId);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Counter-tactic recommendations",
    url: baseUrl,
    itemListElement: rows.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${r.location === "home" ? "Home" : "Away"} / ${r.strength} → ${r.recommendedFormation} (Pressure ${r.pressure}, Style ${r.style}, Tempo ${r.tempo})`,
    })),
  };
}

function buildFormationPage(fp: FormationPage, lang: Lang) {
  const t = UI[lang];
  const c: FormationContent = fp[lang];
  const other: Lang = lang === "en" ? "tr" : "en";
  const pathPrefix = lang === "en" ? "" : "/tr";
  const canonical = `${SITE}${pathPrefix}/formations/${fp.slug}/`;
  const otherUrl = `${SITE}${other === "en" ? "" : "/tr"}/formations/${fp.slug}/`;
  const hubUrl = `${SITE}${pathPrefix}/formations/`;

  const oppMeta = opponentTactics.find((o) => o.id === fp.id);
  const tacticType =
    fp.id.startsWith("523") || fp.id === "532" || fp.id === "5311" || fp.id === "631"
      ? "Counter Attack"
      : oppMeta?.style ?? fp.formation;

  const breadcrumb = [
    { name: t.breadcrumbHome, url: `${SITE}/` },
    { name: t.formationsHub, url: hubUrl },
    { name: c.title, url: canonical },
  ];

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: c.title,
    description: c.metaDesc,
    step: antiTactics
      .filter((a) => a.opponentId === fp.id && (a.strength === "weaker" || a.strength === "stronger"))
      .slice(0, 4)
      .map((a, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: `${a.location === "home" ? "Home" : "Away"} — ${a.strength}`,
        text: a.note,
      })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: c.title,
    description: c.metaDesc,
    url: canonical,
    inLanguage: lang,
    isPartOf: { "@type": "WebSite", name: "OSM Next Level", url: `${SITE}/` },
    about: { "@type": "Thing", name: `OSM ${fp.formation} ${tacticType}` },
  };

  const bodyHtml = `
${breadcrumbHtml([
  { name: t.breadcrumbHome, href: "/" },
  { name: t.formationsHub, href: pathPrefix + "/formations/" },
  { name: c.title },
])}
<h1>${fp.emoji} ${esc(c.title)}</h1>
<p>${inlineMd(c.overview)}</p>

<div class="grid2">
  <div class="card"><h3>${t.strengths}</h3>${renderList(c.strengths)}</div>
  <div class="card"><h3>${t.weaknesses}</h3>${renderList(c.weaknesses)}</div>
</div>

<h2>${t.counterTable}</h2>
${counterTableHtml(t, fp.id)}

<h2>${t.faqTitle}</h2>
<dl>
${c.faq.map((f) => `<dt>${inlineMd(f.q)}</dt><dd>${inlineMd(f.a)}</dd>`).join("\n")}
</dl>

<a class="cta" href="/?lang=${lang}#anti-taktik">${t.openEngine}</a>
<p><a href="${pathPrefix}/formations/">${t.backToFormations}</a></p>
`;

  const html = basePage({
    lang,
    canonical,
    alternates: [
      { lang: "x-default", href: `${SITE}/formations/${fp.slug}/` },
      { lang: "en", href: `${SITE}/formations/${fp.slug}/` },
      { lang: "tr", href: `${SITE}/tr/formations/${fp.slug}/` },
    ],
    title: c.metaTitle,
    description: c.metaDesc,
    jsonLd: [webPageJsonLd, breadcrumbJsonLd(breadcrumb), faqJsonLd, howTo, counterItemListJsonLd(fp.id, canonical)],
    bodyHtml,
  });

  write(`${pathPrefix}/formations/${fp.slug}`, html);

  if (lang === "en") {
    sitemapEntries.push({
      loc: canonical,
      lastmod: BUILD_DATE,
      priority: "0.8",
      alternates: [
        { lang: "x-default", href: canonical },
        { lang: "en", href: canonical },
        { lang: "tr", href: otherUrl },
      ],
    });
  } else {
    sitemapEntries.push({
      loc: canonical,
      lastmod: BUILD_DATE,
      priority: "0.8",
      alternates: [
        { lang: "x-default", href: `${SITE}/formations/${fp.slug}/` },
        { lang: "en", href: `${SITE}/formations/${fp.slug}/` },
        { lang: "tr", href: canonical },
      ],
    });
  }
}

for (const fp of formationPages) {
  buildFormationPage(fp, "en");
  buildFormationPage(fp, "tr");
}

// ── formation hub pages ──

function buildFormationsHub(lang: Lang) {
  const t = UI[lang];
  const pathPrefix = lang === "en" ? "" : "/tr";
  const canonical = `${SITE}${pathPrefix}/formations/`;
  const items = formationPages.map((fp) => ({
    href: `${pathPrefix}/formations/${fp.slug}/`,
    title: fp[lang].title,
    desc: fp[lang].metaDesc,
  }));

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t.formationsHub,
    url: canonical,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}${it.href}`,
      name: it.title,
    })),
  };

  const breadcrumb = [
    { name: t.breadcrumbHome, url: `${SITE}/` },
    { name: t.formationsHub, url: canonical },
  ];

  const bodyHtml = `
${breadcrumbHtml([{ name: t.breadcrumbHome, href: "/" }, { name: t.formationsHub }])}
<h1>${t.formationsHub}</h1>
<p>${lang === "en" ? "Exact Pressure/Style/Tempo counter-tactics for every common OSM opponent formation, sourced from the live Anti-Tactic Engine matrix." : "OSM'de karşılaşabileceğin her yaygın rakip formasyonuna karşı net Baskı/Stil/Tempo karşı taktikleri — canlı Anti-Taktik Motoru matrisinden."}</p>
<div class="grid2">
${items.map((it) => `<div class="card"><h3><a href="${it.href}">${esc(it.title)}</a></h3><p>${esc(it.desc)}</p></div>`).join("\n")}
</div>
<a class="cta" href="/?lang=${lang}#anti-taktik">${t.openEngine}</a>
`;

  const html = basePage({
    lang,
    canonical,
    alternates: [
      { lang: "x-default", href: `${SITE}/formations/` },
      { lang: "en", href: `${SITE}/formations/` },
      { lang: "tr", href: `${SITE}/tr/formations/` },
    ],
    title: lang === "en" ? "All OSM Formations & Counter Tactics | OSM Next Level" : "Tüm OSM Formasyonları ve Karşı Taktikleri | OSM Next Level",
    description: lang === "en" ? "Browse every OSM opponent formation and its exact counter-tactic: Pressure, Style and Tempo values for home/away and every squad strength." : "Her OSM rakip formasyonuna ve net karşı taktiğine gözat: ev/deplasman ve her kadro gücü için Baskı, Stil ve Tempo değerleri.",
    jsonLd: [itemListJsonLd, breadcrumbJsonLd(breadcrumb)],
    bodyHtml,
  });

  write(`${pathPrefix}/formations`, html);
  sitemapEntries.push({
    loc: canonical,
    lastmod: BUILD_DATE,
    priority: "0.9",
    alternates: [
      { lang: "x-default", href: `${SITE}/formations/` },
      { lang: "en", href: `${SITE}/formations/` },
      { lang: "tr", href: `${SITE}/tr/formations/` },
    ],
  });
}

buildFormationsHub("en");
buildFormationsHub("tr");

// ── blog pages ──

function buildBlogPost(post: BlogPost, lang: Lang) {
  const t = UI[lang];
  const pathPrefix = lang === "en" ? "" : "/tr";
  const canonical = `${SITE}${pathPrefix}/blog/${post.slug}/`;
  const hubUrl = `${SITE}${pathPrefix}/blog/`;

  const breadcrumb = [
    { name: t.breadcrumbHome, url: `${SITE}/` },
    { name: t.blogHub, url: hubUrl },
    { name: post.title, url: canonical },
  ];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDesc,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: lang,
    articleSection: post.category,
    author: { "@type": "Person", name: "omerovvvvv" },
    publisher: { "@type": "Organization", name: "OSM Next Level", url: `${SITE}/` },
    mainEntityOfPage: canonical,
    image: OG_IMAGE,
  };

  const bodyHtml = `
${breadcrumbHtml([
  { name: t.breadcrumbHome, href: "/" },
  { name: t.blogHub, href: pathPrefix + "/blog/" },
  { name: post.title },
])}
<h1>${esc(post.title)}</h1>
<p style="color:#7a8094;font-size:13px;">${esc(post.category)} · ${esc(post.date)} · ${esc(post.readTime)}</p>
${renderContent(post.content)}
<a class="cta" href="/?lang=${lang}#anti-taktik">${t.openEngine}</a>
<p><a href="${pathPrefix}/blog/">${t.backToBlog}</a></p>
`;

  const html = basePage({
    lang,
    canonical,
    title: post.metaTitle,
    description: post.metaDesc,
    jsonLd: [articleJsonLd, breadcrumbJsonLd(breadcrumb)],
    bodyHtml,
  });

  write(`${pathPrefix}/blog/${post.slug}`, html);
  sitemapEntries.push({ loc: canonical, lastmod: post.date, priority: "0.7" });
}

for (const post of blogPosts) buildBlogPost(post, "en");
for (const post of blogPostsTr) buildBlogPost(post, "tr");

// ── blog hub pages ──

function buildBlogHub(lang: Lang) {
  const t = UI[lang];
  const pathPrefix = lang === "en" ? "" : "/tr";
  const canonical = `${SITE}${pathPrefix}/blog/`;
  const posts = lang === "en" ? blogPosts : blogPostsTr;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t.blogHub,
    url: canonical,
    itemListElement: posts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}${pathPrefix}/blog/${p.slug}/`,
      name: p.title,
    })),
  };

  const breadcrumb = [
    { name: t.breadcrumbHome, url: `${SITE}/` },
    { name: t.blogHub, url: canonical },
  ];

  const bodyHtml = `
${breadcrumbHtml([{ name: t.breadcrumbHome, href: "/" }, { name: t.blogHub }])}
<h1>${t.blogHub}</h1>
<div class="grid2">
${posts.map((p) => `<div class="card"><h3><a href="${pathPrefix}/blog/${p.slug}/">${esc(p.title)}</a></h3><p>${esc(p.metaDesc)}</p></div>`).join("\n")}
</div>
<a class="cta" href="/?lang=${lang}#anti-taktik">${t.openEngine}</a>
`;

  const html = basePage({
    lang,
    canonical,
    alternates: [
      { lang: "x-default", href: `${SITE}/blog/` },
      { lang: "en", href: `${SITE}/blog/` },
      { lang: "tr", href: `${SITE}/tr/blog/` },
    ],
    title: lang === "en" ? "OSM Guides & Strategy Articles | OSM Next Level" : "OSM Rehberleri ve Strateji Makaleleri | OSM Next Level",
    description: lang === "en" ? "All OSM strategy guides: formations, transfers, training, quick sale technique and more." : "Tüm OSM strateji rehberleri: formasyonlar, transferler, antrenman, hızlı satış tekniği ve daha fazlası.",
    jsonLd: [itemListJsonLd, breadcrumbJsonLd(breadcrumb)],
    bodyHtml,
  });

  write(`${pathPrefix}/blog`, html);
  sitemapEntries.push({
    loc: canonical,
    lastmod: BUILD_DATE,
    priority: "0.8",
    alternates: [
      { lang: "x-default", href: `${SITE}/blog/` },
      { lang: "en", href: `${SITE}/blog/` },
      { lang: "tr", href: `${SITE}/tr/blog/` },
    ],
  });
}

buildBlogHub("en");
buildBlogHub("tr");

// ── English homepage (/en/) ──
//
// "/" is the live SPA, server-rendered in Turkish — the single most
// important URL on the site. Unlike the templated formation/blog pages,
// this one is hand-written real English content with a clear path into the
// live interactive app, since English is the site's stated primary language
// but the server HTML at "/" is Turkish-only.

function buildEnglishHomepage() {
  const canonical = `${SITE}/en/`;
  const faq = [
    { q: "What is OSM Next Level?", a: "A free tactical platform for Online Soccer Manager (OSM), built by omerovvvvv — a Turkish manager based in the United Kingdom with 16+ years of OSM experience and a former World No. 1 ranking (SOA Crew). Its core tool, the Anti-Tactic Engine, gives you the exact counter-formation and Pressure/Style/Tempo values for any opponent." },
    { q: "What's the best OSM tactic overall?", a: "There is no single tactic that wins every match — it depends on the opponent's formation, whether you're home or away, and your relative squad strength. See the formation-by-formation counter-tactic guides for the exact values in each scenario." },
    { q: "How does the Anti-Tactic Engine work?", a: "Select your opponent's formation, your match location (home/away) and your squad strength relative to theirs. The engine returns the recommended counter-formation plus exact Pressure, Style and Tempo values, line tactics, offside trap and marking scheme." },
    { q: "Is OSM Next Level free?", a: "Yes — the Anti-Tactic Engine, Weekly Meta tracker, Squad Analyzer and Quick Sale calculator are all free. A Premium tier adds a curated VIP tactic collection for finals and cup matches." },
    { q: "How do I sell players fast in OSM?", a: "Use age-based multipliers: list young players (17-22) at 2.5x current value, mid-age (23-28) at 2.0-2.2x, and senior players (29+) at 1.5x. Drop to 1.2x for an urgent sale. See the full Quick Sale guide for details." },
    { q: "Is there an unbeatable OSM tactic?", a: "No — and you should be skeptical of anyone claiming otherwise. OSM's match engine compares your setup against the opponent's, so the right answer always depends on the matchup. That's why this site is organized by opponent formation rather than one universal tactic." },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "OSM Next Level — OSM Counter Tactics, Formations & Manager Tools",
    description: "Free Online Soccer Manager (OSM) tactical platform: the Anti-Tactic Engine, exact Pressure/Style/Tempo counter-tactics for every formation, squad analysis and quick-sale tools.",
    url: canonical,
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", name: "OSM Next Level", url: `${SITE}/` },
    publisher: { "@type": "Organization", name: "OSM Next Level", url: `${SITE}/` },
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "OSM Next Level — Main Sections",
    itemListElement: [
      { "@type": "ListItem", position: 1, url: `${SITE}/formations/`, name: "Formations & Counter Tactics" },
      { "@type": "ListItem", position: 2, url: `${SITE}/blog/`, name: "Guides" },
      { "@type": "ListItem", position: 3, url: `${SITE}/#anti-taktik`, name: "Anti-Tactic Engine" },
    ],
  };

  const bodyHtml = `
<h1>⚽ OSM Next Level — OSM Counter Tactics, Formations &amp; Manager Tools</h1>
<p>OSM Next Level is a free tactical platform for <strong>Online Soccer Manager (OSM)</strong>, built by <strong>omerovvvvv</strong> — a Turkish manager based in the United Kingdom with 16+ years of OSM experience and a former World No. 1 ranking (SOA Crew). Its core tool, the <strong>Anti-Tactic Engine</strong>, gives you the exact counter-formation and Pressure/Style/Tempo values for any opponent, sourced from a fixed, hand-tuned tactical matrix — not guessed, not simulated.</p>

<div class="card">
  <h3>Why managers use this site</h3>
  <ul>
    <li>16+ years of OSM experience, former World No. 1 manager (SOA Crew)</li>
    <li>Every recommendation comes from a real, consistent tactical matrix — never invented on the spot</li>
    <li>Separate guidance for home vs. away, and for stronger / equal / weaker squads</li>
    <li>100% free core tools</li>
  </ul>
</div>

<h2>Main Tools</h2>
<div class="grid2">
  <div class="card"><h3>Anti-Tactic Engine</h3><p>Pick the opponent's formation, mentality and match location — get the exact counter-tactic instantly.</p></div>
  <div class="card"><h3>Weekly Meta Tactic</h3><p>Tracks whichever formation/slider combination is performing best right now.</p></div>
  <div class="card"><h3>Squad Value Analyzer</h3><p>Compares your squad value to your opponent's and recommends a tactic based on the power balance.</p></div>
  <div class="card"><h3>Quick Sale Calculator</h3><p>Age-based pricing multipliers to sell players fast without giving away value.</p></div>
  <div class="card"><h3>Manager Tools</h3><p>Referee severity guide, training/camp advisor, transfer guide and a pre-match checklist.</p></div>
  <div class="card"><h3>Premium VIP Tactics</h3><p>A curated tactic collection for finals, cups and must-win matches.</p></div>
</div>

<h2>Formation &amp; Counter-Tactic Guides</h2>
<p>Every common OSM opponent formation has its own page with exact Pressure/Style/Tempo values, strengths, weaknesses and FAQ — sourced live from the same matrix that powers the Anti-Tactic Engine.</p>
<p><a href="/formations/">Browse all formation guides →</a> · <a href="/blog/">Browse all strategy guides →</a></p>

<h2>Frequently Asked Questions</h2>
<dl>
${faq.map((f) => `<dt>${inlineMd(f.q)}</dt><dd>${inlineMd(f.a)}</dd>`).join("\n")}
</dl>

<a class="cta" href="/?lang=en#anti-taktik">Launch the Anti-Tactic Engine →</a>
<p style="margin-top:18px;font-size:13px;color:#7a8094;">Most of this site's active community and content updates are in Turkish — see the <a href="/">Turkish homepage</a> if that's your preferred language.</p>
`;

  const html = basePage({
    lang: "en",
    canonical,
    alternates: [
      { lang: "x-default", href: canonical },
      { lang: "en", href: canonical },
      { lang: "tr", href: `${SITE}/` },
    ],
    title: "OSM Next Level — OSM Counter Tactics, Formations & Manager Tools",
    description: "Free Online Soccer Manager (OSM) tactical platform: Anti-Tactic Engine, exact Pressure/Style/Tempo counter-tactics for every formation, squad analysis and quick-sale tools. Built by a former World No. 1 OSM manager.",
    jsonLd: [webPageJsonLd, faqJsonLd, itemListJsonLd],
    bodyHtml,
  });

  write("en", html);
}

buildEnglishHomepage();

// ── sitemap.xml (overwrites the one copied from public/) ──

function buildSitemap() {
  const homepageEntry = `  <url>
    <loc>${SITE}/</loc>
    <lastmod>${BUILD_DATE}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/en/"/>
    <xhtml:link rel="alternate" hreflang="tr" href="${SITE}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/"/>
  </url>`;

  const enHomepageEntry = `  <url>
    <loc>${SITE}/en/</loc>
    <lastmod>${BUILD_DATE}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/en/"/>
    <xhtml:link rel="alternate" hreflang="tr" href="${SITE}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/"/>
  </url>`;

  const urlEntries = sitemapEntries
    .map((e) => {
      const alt = (e.alternates ?? [])
        .map((a) => `\n    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${a.href}"/>`)
        .join("");
      return `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${e.priority}</priority>${alt}
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${homepageEntry}
${enHomepageEntry}
${urlEntries}
</urlset>
`;
  writeFileSync(resolve(DIST, "sitemap.xml"), xml, "utf-8");
}

buildSitemap();

console.log(
  `[generateStaticPages] wrote ${formationPages.length * 2} formation pages, ${
    blogPosts.length + blogPostsTr.length
  } blog pages, 1 English homepage, 4 hub pages, and sitemap.xml (${sitemapEntries.length + 2} URLs) into dist/`
);
