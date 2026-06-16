// ── Formation vs. formation comparison pages ──
//
// Strong AEO/AI-citation format (comparison tables + verdicts). References
// two existing FormationPage slugs from ./formations — the actual
// strengths/weaknesses/counter-tactic data is pulled live from there and
// from tactics.ts by the generator, never re-typed here. This file only
// holds the qualitative "which one and when" analysis.
import type { FormationSlug } from "./formations";

export interface ComparisonContent {
  title: string;
  metaTitle: string;
  metaDesc: string;
  verdict: string;
  whenA: string;
  whenB: string;
  faq: { q: string; a: string }[];
}

export interface ComparisonPage {
  slug: string;
  slugA: FormationSlug;
  slugB: FormationSlug;
  en: ComparisonContent;
  tr: ComparisonContent;
}

export const comparisonPages: ComparisonPage[] = [
  {
    slug: "433-vs-523",
    slugA: "433a",
    slugB: "523",
    en: {
      title: "OSM 4-3-3 vs 5-2-3 — Which Formation Should You Use?",
      metaTitle: "OSM 4-3-3 vs 5-2-3 Comparison 2026 | OSM Next Level",
      metaDesc: "4-3-3 Wing Play or 5-2-3 Counter Attack? Side-by-side comparison with real data on when to use each in OSM.",
      verdict: "4-3-3 is the higher-ceiling attacking formation when you have a genuine squad advantage at home — its wing overloads can produce explosive results, including our own 95%-win-rate home setup. 5-2-3 is the safer, more reliable choice on the road or when squads are close, because its back-five shape rarely gets exposed. Neither is universally \"better\" — they solve different problems.",
      whenA: "Use 4-3-3 at home when you're clearly stronger, or whenever you need to break down a team that's sitting back (like a 5-2-3 side itself).",
      whenB: "Use 5-2-3 away, or at home when you're weaker or evenly matched — its disciplined back five keeps you competitive until a real chance appears.",
      faq: [
        { q: "Which is better for beginners?", a: "5-2-3 is more forgiving — its defensive shape requires less precise coordination than 4-3-3's overlapping wing runs." },
        { q: "Can I switch between them with the same squad?", a: "Yes — many managers use 5-2-3 away and 4-3-3 at home with an identical squad, switching based on location and opponent rather than committing to one system all season." },
      ],
    },
    tr: {
      title: "OSM 4-3-3 mi 5-2-3 mü? Hangi Formasyonu Kullanmalısın?",
      metaTitle: "OSM 4-3-3 vs 5-2-3 Karşılaştırması 2026 | OSM Next Level",
      metaDesc: "4-3-3 Kanat Oyunu mu, 5-2-3 Kontra Atak mı? Gerçek verilerle yan yana karşılaştırma ve hangisini ne zaman kullanmalısın.",
      verdict: "4-3-3, gerçek bir kadro avantajıyla evdeyken daha yüksek tavanlı hücum formasyonudur — kanat üstünlükleri, %95 galibiyet oranlı imza ev kurulumumuz dahil patlayıcı sonuçlar üretebilir. 5-2-3 ise deplasmanda ya da kadrolar yakınken daha güvenli, daha tutarlı seçimdir, çünkü beşli savunma yapısı nadiren açık kalır. Hiçbiri evrensel olarak 'daha iyi' değildir — farklı problemleri çözerler.",
      whenA: "Evde belirgin şekilde güçlüyken, ya da geride duran bir rakibi (5-2-3 oynayan biri gibi) kırman gerektiğinde 4-3-3 kullan.",
      whenB: "Deplasmanda, ya da evde zayıf veya eşit kuvvetteyken 5-2-3 kullan — disiplinli beşli savunma, gerçek bir fırsat çıkana kadar seni maçta tutar.",
      faq: [
        { q: "Başlangıç seviyesi için hangisi daha iyi?", a: "5-2-3 daha bağışlayıcıdır — savunma yapısı, 4-3-3'ün örtüşen kanat koşularından daha az hassas koordinasyon gerektirir." },
        { q: "Aynı kadroyla ikisi arasında geçiş yapabilir miyim?", a: "Evet — birçok menajer aynı kadroyla deplasmanda 5-2-3, evde 4-3-3 oynar; tüm sezon bir sisteme bağlanmak yerine maç yerine ve rakibe göre geçiş yapar." },
      ],
    },
  },
  {
    slug: "442-vs-433",
    slugA: "442",
    slugB: "433a",
    en: {
      title: "OSM 4-4-2 vs 4-3-3 — Which Formation Should You Use?",
      metaTitle: "OSM 4-4-2 vs 4-3-3 Comparison 2026 | OSM Next Level",
      metaDesc: "4-4-2 Passing Game or 4-3-3 Wing Play? Side-by-side comparison with real data on strengths, weaknesses and when to use each.",
      verdict: "4-4-2 is the safer, more balanced all-rounder; 4-3-3 trades some central solidity for a higher ceiling on the wings. If your full-backs are your best attacking assets, 4-3-3 unlocks them — if your squad is more evenly balanced across the pitch, 4-4-2's structure is harder for opponents to break.",
      whenA: "Use 4-4-2 when your squad is balanced without standout wide players, or when you want a lower-variance, more predictable result.",
      whenB: "Use 4-3-3 when you have fast or strong wide players and a clear edge at home — its ceiling is higher but it's more exploitable if your wing overlaps get caught out.",
      faq: [
        { q: "Which formation is harder for opponents to prepare for?", a: "4-3-3, because of its higher variance — 4-4-2's banks of four are predictable but rarely catastrophic, which makes it the steadier long-season choice." },
      ],
    },
    tr: {
      title: "OSM 4-4-2 mi 4-3-3 mü? Hangi Formasyonu Kullanmalısın?",
      metaTitle: "OSM 4-4-2 vs 4-3-3 Karşılaştırması 2026 | OSM Next Level",
      metaDesc: "4-4-2 Paslı Oyun mu, 4-3-3 Kanat Oyunu mu? Güçlü/zayıf yönler ve hangisini ne zaman kullanmalısın, gerçek verilerle karşılaştırma.",
      verdict: "4-4-2 daha güvenli, daha dengeli bir her işe yarar formasyondur; 4-3-3 ise merkezi sağlamlığın bir kısmını kanatlarda daha yüksek bir tavanla takas eder. Beklerin en iyi hücum silahın olduğu bir kadron varsa 4-3-3 onları açığa çıkarır — kadron sahada daha dengeliyse 4-4-2'nin yapısı rakipler için kırılması daha zordur.",
      whenA: "Kadron öne çıkan kanat oyuncuları olmadan dengeliyken, ya da daha düşük riskli, daha tahmin edilebilir bir sonuç istediğinde 4-4-2 kullan.",
      whenB: "Hızlı veya güçlü kanat oyuncuların ve evde belirgin bir avantajın varken 4-3-3 kullan — tavanı daha yüksektir ama kanat örtüşmeleri yakalanırsa daha açık kalır.",
      faq: [
        { q: "Rakiplerin hazırlanması hangisine karşı daha zor?", a: "4-3-3, çünkü değişkenliği daha yüksektir — 4-4-2'nin düz dörtlü hatları tahmin edilebilir ama nadiren felaket sonuçlanır, bu da onu uzun sezon için daha istikrarlı seçim yapar." },
      ],
    },
  },
  {
    slug: "523-vs-532",
    slugA: "523",
    slugB: "532",
    en: {
      title: "OSM 5-2-3 vs 5-3-2 — Which Formation Should You Use?",
      metaTitle: "OSM 5-2-3 vs 5-3-2 Comparison 2026 | OSM Next Level",
      metaDesc: "5-2-3 or 5-3-2 counter attack — both share a back five, but which extra player (forward vs midfielder) is right for your squad?",
      verdict: "These look similar — both put five at the back and both counter — but 5-2-3 commits an extra body forward for pace on the break, while 5-3-2 keeps an extra midfielder for control. Use 5-2-3 when speed in transition is your main weapon; use 5-3-2 when you need more control of the middle third before committing forward.",
      whenA: "Use 5-2-3 when your forwards are fast and clinical and you want the most direct route from defence to attack.",
      whenB: "Use 5-3-2 when your midfield is your strongest unit and you want an extra body to win the ball back before springing the counter.",
      faq: [
        { q: "Which is more defensively solid?", a: "Both share the identical back five — the real difference is entirely in the other six players. 5-3-2 controls midfield slightly better; 5-2-3 counters slightly faster." },
      ],
    },
    tr: {
      title: "OSM 5-2-3 mü 5-3-2 mi? Hangi Formasyonu Kullanmalısın?",
      metaTitle: "OSM 5-2-3 vs 5-3-2 Karşılaştırması 2026 | OSM Next Level",
      metaDesc: "5-2-3 mi 5-3-2 kontra atak mı — ikisi de beşli savunmayı paylaşır, ama hangi fazladan oyuncu (forvet mi orta saha mı) kadrona uyar?",
      verdict: "Bunlar birbirine benzer görünür — ikisi de beşli savunma kurar ve ikisi de kontra oynar — ama 5-2-3 hızlı çıkış için fazladan bir forvet adamı kullanır, 5-3-2 ise kontrol için fazladan bir orta saha oyuncusu tutar. Geçişte hız ana silahınsa 5-2-3 kullan; öne çıkmadan önce orta bölgeyi daha çok kontrol etmen gerekiyorsa 5-3-2 kullan.",
      whenA: "Forvetlerin hızlı ve bitiriciyse, savunmadan hücuma en direkt yolu istiyorsan 5-2-3 kullan.",
      whenB: "Orta sahan en güçlü biriminse ve kontraya geçmeden önce topu geri kazanmak için fazladan bir adam istiyorsan 5-3-2 kullan.",
      faq: [
        { q: "Savunma olarak hangisi daha sağlam?", a: "İkisi de birebir aynı beşli savunmayı paylaşır — gerçek fark tamamen diğer altı oyuncudadır. 5-3-2 orta sahayı biraz daha iyi kontrol eder; 5-2-3 biraz daha hızlı kontra atar." },
      ],
    },
  },
  {
    slug: "4231-vs-451",
    slugA: "4231",
    slugB: "451",
    en: {
      title: "OSM 4-2-3-1 vs 4-5-1 — Which Formation Should You Use?",
      metaTitle: "OSM 4-2-3-1 vs 4-5-1 Comparison 2026 | OSM Next Level",
      metaDesc: "Both are Shoot on Sight systems — compare 4-2-3-1 and 4-5-1 to see which fits your squad and matchup better.",
      verdict: "Both are Shoot on Sight systems built around patience and long-range shots, but 4-5-1 commits a full extra midfielder for total control of the center, while 4-2-3-1 keeps an advanced trio closer to the box. If your attacking midfielders are strong individually, 4-2-3-1 gets more from them; if you need to dominate central possession first, 4-5-1's extra body does that.",
      whenA: "Use 4-2-3-1 when your AMC and wide attacking midfielders are individually strong and close to goal.",
      whenB: "Use 4-5-1 when you need to win the central midfield battle first, before anything else can happen.",
      faq: [
        { q: "Which is more defensively solid?", a: "4-5-1, by a small margin — the extra midfielder gives it slightly more central control, at the cost of being even more reliant on the lone striker upfront." },
      ],
    },
    tr: {
      title: "OSM 4-2-3-1 mi 4-5-1 mi? Hangi Formasyonu Kullanmalısın?",
      metaTitle: "OSM 4-2-3-1 vs 4-5-1 Karşılaştırması 2026 | OSM Next Level",
      metaDesc: "İkisi de Kaleyi Görünce Vur sistemi — 4-2-3-1 ve 4-5-1'i karşılaştır, kadrona ve maçına hangisi daha uygun gör.",
      verdict: "İkisi de sabır ve uzaktan şutlar üzerine kurulu Kaleyi Görünce Vur sistemleridir, ama 4-5-1 merkezin tam kontrolü için fazladan bir orta saha oyuncusu kullanır, 4-2-3-1 ise ileri üçlüyü kaleye daha yakın tutar. Hücum orta saha oyuncuların bireysel olarak güçlüyse 4-2-3-1 onlardan daha fazla verim alır; önce merkezi topa sahip olmayı domine etmen gerekiyorsa 4-5-1'in fazladan adamı bunu yapar.",
      whenA: "Hücum orta saha oyuncuların ve kanat oyuncuların bireysel olarak güçlü ve kaleye yakınsa 4-2-3-1 kullan.",
      whenB: "Başka her şeyden önce merkezi orta saha savaşını kazanman gerekiyorsa 4-5-1 kullan.",
      faq: [
        { q: "Savunma olarak hangisi daha sağlam?", a: "Küçük bir farkla 4-5-1 — fazladan orta saha oyuncusu biraz daha merkezi kontrol verir, ama bunun karşılığında öndeki tek santrafora daha da bağımlı kalır." },
      ],
    },
  },
  {
    slug: "631-vs-541",
    slugA: "631",
    slugB: "541",
    en: {
      title: "OSM 6-3-1 vs 5-4-1 — Which Formation Should You Use?",
      metaTitle: "OSM 6-3-1 vs 5-4-1 Comparison 2026 | OSM Next Level",
      metaDesc: "Both are maximum-defense systems — compare 6-3-1 Park the Bus and 5-4-1 to see which extreme defensive setup fits your situation.",
      verdict: "Both are maximum-defense systems for must-not-lose matches. 6-3-1 sacrifices almost all attacking presence for the most solid possible back line; 5-4-1 keeps a slightly more usable midfield screen. If you're facing a vastly superior opponent and just need to survive, 6-3-1 is the more extreme tool; 5-4-1 is the more balanced \"normal\" defensive setup.",
      whenA: "Use 6-3-1 only against a significantly stronger opponent where even a draw is a good result.",
      whenB: "Use 5-4-1 as your everyday defensive setup — it's nearly as solid but keeps more attacking outlets than 6-3-1.",
      faq: [
        { q: "When would I ever need 6-3-1 over 5-4-1?", a: "Only against a significantly stronger opponent where even a draw is a good result — 6-3-1 is more extreme and gives up more attacking threat than 5-4-1." },
      ],
    },
    tr: {
      title: "OSM 6-3-1 mi 5-4-1 mi? Hangi Formasyonu Kullanmalısın?",
      metaTitle: "OSM 6-3-1 vs 5-4-1 Karşılaştırması 2026 | OSM Next Level",
      metaDesc: "İkisi de maksimum savunma sistemi — 6-3-1 Otobüs Park Etme ve 5-4-1'i karşılaştır, hangi aşırı defansif kurulumun durumuna uyduğunu gör.",
      verdict: "İkisi de kaybetmemen gereken maçlar için maksimum savunma sistemidir. 6-3-1, en sağlam savunma hattı için neredeyse tüm hücum varlığından feragat eder; 5-4-1 ise biraz daha kullanılabilir bir orta saha perdesi tutar. Çok daha üstün bir rakiple karşı karşıyaysan ve sadece hayatta kalman gerekiyorsa 6-3-1 daha aşırı bir araçtır; 5-4-1 daha dengeli, 'normal' bir savunma kurulumudur.",
      whenA: "Sadece çok daha güçlü bir rakibe karşı, beraberliğin bile iyi bir sonuç olduğu durumda 6-3-1 kullan.",
      whenB: "Günlük savunma kurulumun olarak 5-4-1 kullan — neredeyse o kadar sağlamdır ama 6-3-1'den daha fazla hücum çıkışı tutar.",
      faq: [
        { q: "6-3-1'e 5-4-1 yerine ne zaman gerek duyarım?", a: "Sadece çok daha güçlü bir rakibe karşı, beraberliğin bile iyi bir sonuç olduğu durumda — 6-3-1 daha aşırıdır ve 5-4-1'den daha fazla hücum tehdidinden feragat eder." },
      ],
    },
  },
];
