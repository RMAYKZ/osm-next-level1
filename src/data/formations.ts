// ── Programmatic SEO content for /formations/* and /tr/formations/* ──
//
// Qualitative content (overview/strengths/weaknesses/FAQ) only. Exact
// Pressure/Style/Tempo numbers are NEVER duplicated here — the static page
// generator (scripts/generateStaticPages.ts) looks them up live from
// `antiTactics` in ./tactics so this content can never drift out of sync
// with the live Anti-Tactic Engine. FAQ answers below quote real headline
// scenarios (away+weaker, home+stronger) for the two most-searched intents,
// pulled from the same matrix.

export type FormationSlug =
  | "433a" | "433b" | "442" | "4231" | "451"
  | "523" | "541" | "631" | "532" | "5311";

export interface FormationContent {
  title: string;
  metaTitle: string;
  metaDesc: string;
  overview: string;
  strengths: string[];
  weaknesses: string[];
  faq: { q: string; a: string }[];
}

export interface FormationPage {
  /** Matches an id in opponentTactics (./tactics.ts) — used to look up the live matrix rows. */
  id: string;
  slug: FormationSlug;
  formation: string;
  emoji: string;
  en: FormationContent;
  tr: FormationContent;
}

export const formationPages: FormationPage[] = [
  {
    id: "433A",
    slug: "433a",
    formation: "4-3-3",
    emoji: "⚽",
    en: {
      title: "How to Counter 4-3-3 A Wing Play",
      metaTitle: "OSM 4-3-3 A Counter Tactic 2026 — Exact Sliders | OSM Next Level",
      metaDesc: "The exact OSM counter-tactic for 4-3-3 A Wing Play, with Pressure/Style/Tempo values for away and home, weaker and stronger squads.",
      overview: "4-3-3 A pushes both full-backs forward to overload the flanks while the front three stretches the pitch wide. It's one of the most common formations in OSM because it's simple to set up and rewards fast wingers, but the space it leaves behind advancing full-backs is exactly what a disciplined counter-attack is built to punish.",
      strengths: [
        "Permanent 2-vs-1 overloads down both flanks",
        "Front three stays wide and stretches the opponent's back line",
        "High tempo wing play suits strong, fast wide players",
        "Very effective at home when the squad is genuinely stronger",
      ],
      weaknesses: [
        "Space behind both advancing full-backs is exposed on turnovers",
        "Central midfield thins out once wingers are pinned wide",
        "A compact 5-back block absorbs the width and nullifies crosses",
        "High pressing line is vulnerable to fast, low-possession counters",
      ],
      faq: [
        { q: "What's the best OSM counter to 4-3-3 A Wing Play when I'm away and weaker?", a: "Sit in a 5-2-3 A Counter Attack with low Pressure and Style and a moderate Tempo. Let them have the ball in wide areas, keep your back five compact, and break quickly the moment a full-back over-commits." },
        { q: "What if I'm stronger at home against 4-3-3 A?", a: "Mirror them with 4-3-3 A/B Wing Play yourself, raise Pressure and Style significantly, and win the flank battle with your own overlaps — at home with a real strength advantage this is the highest win-rate approach." },
        { q: "Why does 4-3-3 A lose to a low-press counter?", a: "Because both full-backs push forward to create the wing overload, the space directly behind them is undefended. A team that refuses to press and instead waits for the turnover exploits exactly that space." },
      ],
    },
    tr: {
      title: "OSM 4-3-3 A Kanat Oyununa Karşı Taktik",
      metaTitle: "OSM 4-3-3 A Karşı Taktik 2026 — Net Slider Değerleri | OSM Next Level",
      metaDesc: "OSM'de 4-3-3 A Kanat Oyununa karşı net taktik: deplasman ve evde, zayıf ve güçlü kadrolar için Baskı/Stil/Tempo değerleri.",
      overview: "4-3-3 A, kanat bekleri ileri iterek kanatlarda sayı üstünlüğü kurar ve önde üçlü hattı sahayı genişletir. OSM'de en sık görülen dizilişlerden biridir çünkü kurulumu basittir ve hızlı kanat oyuncularını ödüllendirir — ama ileri çıkan beklerin arkasında bıraktığı boşluk, disiplinli bir kontra atağın tam olarak avlamak için var olduğu yerdir.",
      strengths: [
        "Her iki kanatta sürekli 2'ye 1 sayısal üstünlük",
        "Önde üçlü hat geniş kalıp rakip savunma hattını gerer",
        "Yüksek tempolu kanat oyunu güçlü ve hızlı kanat oyuncularına uyar",
        "Gerçekten daha güçlü bir kadroyla evde son derece etkili",
      ],
      weaknesses: [
        "İleri çıkan iki bek arkasında top kayıplarında boşluk açılır",
        "Kanat oyuncuları geniş konumlandığında orta saha seyrekleşir",
        "Kompakt 5'li savunma bloğu genişliği emer, ortaları etkisiz kılar",
        "Yüksek pres hattı, az toplu ve hızlı kontralara karşı zayıf kalır",
      ],
      faq: [
        { q: "Deplasmanda ve zayıfken 4-3-3 A Kanat Oyununa karşı en iyi taktik nedir?", a: "Düşük Baskı ve Stil, orta seviye Tempo ile 5-2-3 A Kontra Atak oyna. Topu geniş alanlarda onlara bırak, 5'li hattını kompakt tut ve bir bek aşırı ileri çıktığı anda hızlı çık." },
        { q: "Evde ve güçlüysem 4-3-3 A'ya karşı ne yapmalıyım?", a: "Onları 4-3-3 A/B Kanat Oyunu ile aynala, Baskı ve Stili belirgin şekilde yükselt, kendi overlap'lerinle kanat savaşını kazan — evde gerçek bir güç avantajıyla en yüksek galibiyet oranı bu yaklaşımdadır." },
        { q: "4-3-3 A neden düşük presli bir kontraya karşı kaybeder?", a: "Kanat üstünlüğü kurmak için her iki bek de ileri çıktığından, hemen arkalarındaki bölge savunmasızdır. Pres yapmayıp top kaybını bekleyen bir takım tam olarak bu boşluğu hedefler." },
      ],
    },
  },
  {
    id: "433B",
    slug: "433b",
    formation: "4-3-3",
    emoji: "🎯",
    en: {
      title: "How to Counter 4-3-3 B Wing Play",
      metaTitle: "OSM 4-3-3 B Counter Tactic 2026 — Exact Sliders | OSM Next Level",
      metaDesc: "The exact OSM counter-tactic for 4-3-3 B Wing Play, with Pressure/Style/Tempo values for away and home, weaker and stronger squads.",
      overview: "4-3-3 B is the passing-focused sibling of 4-3-3 A — same wide front three and attacking full-backs, but a more patient build-up through midfield before switching play. It shares 4-3-3 A's structural weakness behind the full-backs, which makes the same disciplined counter-attack approach effective against it.",
      strengths: [
        "Patient build-up creates more controlled wing overloads",
        "Midfield retains possession longer before committing forward",
        "Front three still stretches the pitch fully",
        "Strong at home with a genuine squad advantage",
      ],
      weaknesses: [
        "Same exposed space behind advancing full-backs as 4-3-3 A",
        "Slower build-up gives a compact defence time to reset shape",
        "Vulnerable to a compact 5-3-2 block that denies width entirely",
        "Can be disrupted by forcing turnovers in midfield before the switch",
      ],
      faq: [
        { q: "Best OSM counter to 4-3-3 B when away and weaker?", a: "5-2-3 A Counter Attack with low Pressure and Style. An even more compact alternative is a 5-3-2 block, which removes their wing threat almost entirely while you wait for the break." },
        { q: "What about away and equal strength?", a: "Stay with 5-2-3 A Counter Attack but raise Pressure and Style moderately — controlled possession disruption forces 4-3-3 B into errors before you counter with precision." },
        { q: "How is 4-3-3 B different from 4-3-3 A in practice?", a: "The formation and weaknesses are identical; 4-3-3 B simply plays a more patient passing game before going wide, so the same counter-attack setup works against both." },
      ],
    },
    tr: {
      title: "OSM 4-3-3 B Kanat Oyununa Karşı Taktik",
      metaTitle: "OSM 4-3-3 B Karşı Taktik 2026 — Net Slider Değerleri | OSM Next Level",
      metaDesc: "OSM'de 4-3-3 B Kanat Oyununa karşı net taktik: deplasman ve evde, zayıf ve güçlü kadrolar için Baskı/Stil/Tempo değerleri.",
      overview: "4-3-3 B, 4-3-3 A'nın paslı oyuna dayanan kardeşidir — aynı geniş üçlü hücum hattı ve hücuma katılan bekler, ama oyunu açmadan önce orta sahada daha sabırlı bir kuruluş vardır. 4-3-3 A'nın bekler arkasındaki yapısal zayıflığını paylaşır, bu yüzden aynı disiplinli kontra atak yaklaşımı burada da işe yarar.",
      strengths: [
        "Sabırlı kuruluş daha kontrollü kanat üstünlükleri yaratır",
        "Orta saha öne çıkmadan önce topu daha uzun tutar",
        "Önde üçlü hat sahayı tam olarak gerer",
        "Gerçek bir kadro avantajıyla evde güçlüdür",
      ],
      weaknesses: [
        "4-3-3 A ile aynı şekilde ileri çıkan bekler arkasında boşluk",
        "Yavaş kuruluş, kompakt savunmaya pozisyon alma zamanı tanır",
        "Genişliği tamamen reddeden kompakt bir 5-3-2 bloğuna karşı zayıf",
        "Açılım öncesi orta sahada top kaybına zorlanarak bozulabilir",
      ],
      faq: [
        { q: "Deplasmanda ve zayıfken 4-3-3 B'ye karşı en iyi taktik nedir?", a: "Düşük Baskı ve Stille 5-2-3 A Kontra Atak oyna. Daha da kompakt bir alternatif, kanat tehdidini neredeyse tamamen ortadan kaldıran 5-3-2 bloğudur." },
        { q: "Deplasmanda eşit kuvvetteyken ne yapmalıyım?", a: "5-2-3 A Kontra Atakta kal ama Baskı ve Stili ölçülü şekilde yükselt — kontrollü baskı 4-3-3 B'yi hataya zorlar, sen de hassas kontralarla cezalandırırsın." },
        { q: "4-3-3 B pratikte 4-3-3 A'dan farklı mı?", a: "Diziliş ve zayıflıklar birebir aynıdır; 4-3-3 B sadece açılmadan önce daha sabırlı bir pas oyunu oynar, dolayısıyla aynı kontra atak kurulumu ikisine karşı da işe yarar." },
      ],
    },
  },
  {
    id: "442",
    slug: "442",
    formation: "4-4-2",
    emoji: "🛡️",
    en: {
      title: "How to Counter 4-4-2 Passing Game",
      metaTitle: "OSM 4-4-2 Counter Tactic 2026 — Exact Sliders | OSM Next Level",
      metaDesc: "The exact OSM counter-tactic for 4-4-2 Passing Game, with Pressure/Style/Tempo values for away and home, weaker and stronger squads.",
      overview: "4-4-2 Passing Game is the classic balanced banks-of-four setup with two strikers. It's solid and hard to break centrally through pure possession, but the flanks are its real weak point once both full-backs step forward to support attacks.",
      strengths: [
        "Two strikers combine well — one fast, one strong, is the classic pairing",
        "Two flat banks of four are compact and disciplined centrally",
        "Reliable possession-based build-up",
        "Balanced positioning makes it hard to break through the middle",
      ],
      weaknesses: [
        "Exposed flanks once both full-backs commit forward",
        "No spare central midfielder against 3-man midfield setups",
        "Out-paced by high-tempo wing play, especially at home",
        "Two strikers can be isolated against a back five",
      ],
      faq: [
        { q: "Best OSM counter to 4-4-2 when away and weaker?", a: "Switch to 4-5-1 Shoot on Sight with moderate Pressure and Style — the extra central midfielder neutralises their passing-game dominance in midfield." },
        { q: "What about home and stronger?", a: "Go 4-3-3 A/B Wing Play with high Pressure, Style and Tempo. 4-4-2's flanks are its weak point — attacking them directly with width is the highest win-rate approach when you have a real squad advantage." },
        { q: "Why does width beat 4-4-2 specifically?", a: "Both full-backs in 4-4-2 are needed centrally to maintain the flat back four shape; pulling them wide to deal with wingers opens exactly the central and half-space gaps a 4-3-3 attack is designed to use." },
      ],
    },
    tr: {
      title: "OSM 4-4-2 Paslı Oyuna Karşı Taktik",
      metaTitle: "OSM 4-4-2 Karşı Taktik 2026 — Net Slider Değerleri | OSM Next Level",
      metaDesc: "OSM'de 4-4-2 Paslı Oyuna karşı net taktik: deplasman ve evde, zayıf ve güçlü kadrolar için Baskı/Stil/Tempo değerleri.",
      overview: "4-4-2 Paslı Oyun, iki forvetli klasik dengeli dört hat sistemidir. Sağlamdır ve sadece topa sahip olarak ortadan kırılması zordur, ama her iki bek hücuma katıldığında kanatlar gerçek zayıf noktasıdır.",
      strengths: [
        "İki forvet iyi kombine olur — biri hızlı, biri güçlü klasik eşleşmedir",
        "İki düz dörtlü hat ortada kompakt ve disiplinlidir",
        "Güvenilir, topa sahip olmaya dayalı kuruluş",
        "Dengeli pozisyon alma ortadan kırılmayı zorlaştırır",
      ],
      weaknesses: [
        "Her iki bek hücuma katıldığında kanatlar açık kalır",
        "3 kişilik orta saha sistemlerine karşı fazladan orta saha oyuncusu yok",
        "Özellikle evde yüksek tempolu kanat oyununa karşı yavaş kalır",
        "İki forvet, 5'li savunmaya karşı izole kalabilir",
      ],
      faq: [
        { q: "Deplasmanda ve zayıfken 4-4-2'ye karşı en iyi taktik nedir?", a: "Orta seviye Baskı ve Stille 4-5-1 Kaleyi Görünce Vur'a geç — fazladan orta saha oyuncusu, onların orta sahadaki paslı oyun üstünlüğünü etkisiz kılar." },
        { q: "Evde ve güçlüyken ne yapmalıyım?", a: "Yüksek Baskı, Stil ve Tempo ile 4-3-3 A/B Kanat Oyunu oyna. 4-4-2'nin zayıf noktası kanatlardır; gerçek bir kadro avantazıyla genişliği doğrudan hedeflemek en yüksek galibiyet oranını verir." },
        { q: "Genişlik 4-4-2'yi neden özellikle yener?", a: "4-4-2'de her iki bek de düz dörtlü hattı korumak için ortada gereklidir; kanat oyuncularıyla başa çıkmak için geniş çekilmeleri, tam olarak bir 4-3-3 hücumunun kullanmak için tasarlandığı orta ve yarı alan boşluklarını açar." },
      ],
    },
  },
  {
    id: "4231",
    slug: "4231",
    formation: "4-2-3-1",
    emoji: "🔥",
    en: {
      title: "How to Counter 4-2-3-1 Shoot on Sight",
      metaTitle: "OSM 4-2-3-1 Counter Tactic 2026 — Exact Sliders | OSM Next Level",
      metaDesc: "The exact OSM counter-tactic for 4-2-3-1 Shoot on Sight, with Pressure/Style/Tempo values for away and home, weaker and stronger squads.",
      overview: "4-2-3-1 pairs a protective double pivot with an attacking midfield three and a lone striker, built around shooting from distance rather than building slow possession moves. The double pivot makes it defensively solid, but the lone striker is easily isolated against a low, disciplined block that refuses to engage.",
      strengths: [
        "Double pivot gives strong defensive cover in front of the back four",
        "High shot volume from distance creates constant scoring threat",
        "Attacking midfield three controls the central zones",
        "Hard to play through directly down the middle",
      ],
      weaknesses: [
        "Shooting from distance is far less effective against a packed defence",
        "Lone striker is isolated with no central strike partner",
        "Struggles to break a disciplined, zero-pressure low block",
        "Limited width upfront once the wide AMs are squeezed",
      ],
      faq: [
        { q: "Best OSM counter to 4-2-3-1 when away and weaker?", a: "Drop into 5-2-3 A Counter Attack with very low Pressure and Style. Their Shoot on Sight game lives off long-range shots — a 5-back low block absorbs that almost completely, so wait patiently for the one chance." },
        { q: "What about home and stronger?", a: "Go 4-3-3 B Wing Play with high Pressure, Style and Tempo and push them back into their own half — keeping the game away from their shooting range nullifies their main weapon." },
        { q: "Why is a low block the right answer to Shoot on Sight?", a: "4-2-3-1's threat is built on shots from outside the box. A compact back five with bodies in the shooting lanes removes most of those chances, forcing the opponent to either give up possession or take low-quality shots." },
      ],
    },
    tr: {
      title: "OSM 4-2-3-1 Kaleyi Görünce Vur'a Karşı Taktik",
      metaTitle: "OSM 4-2-3-1 Karşı Taktik 2026 — Net Slider Değerleri | OSM Next Level",
      metaDesc: "OSM'de 4-2-3-1 Kaleyi Görünce Vur'a karşı net taktik: deplasman ve evde, zayıf ve güçlü kadrolar için Baskı/Stil/Tempo değerleri.",
      overview: "4-2-3-1, koruyucu çift pivotu hücuma yönelik üçlü orta saha ve tek santraforla birleştirir; yavaş topa sahip olma yerine uzaktan şuta dayanır. Çift pivot savunmada sağlamdır, ama tek santrafor, devreye girmeyi reddeden düşük ve disiplinli bir blok karşısında kolayca izole kalır.",
      strengths: [
        "Çift pivot, dörtlü savunma önünde güçlü koruma sağlar",
        "Uzaktan yüksek şut hacmi sürekli gol tehdidi yaratır",
        "Hücum orta saha üçlüsü merkezi bölgeleri kontrol eder",
        "Doğrudan ortadan oynanması zordur",
      ],
      weaknesses: [
        "Uzaktan şutlar kalabalık bir savunmaya karşı çok daha etkisizdir",
        "Tek santrafor, merkezi bir ortak olmadan izole kalır",
        "Disiplinli, baskısız düşük bloğu kırmakta zorlanır",
        "Kanat orta saha oyuncuları sıkıştığında önde genişlik sınırlıdır",
      ],
      faq: [
        { q: "Deplasmanda ve zayıfken 4-2-3-1'e karşı en iyi taktik nedir?", a: "Çok düşük Baskı ve Stille 5-2-3 A Kontra Atağa çek. Kaleyi Görünce Vur oyunu uzaktan şutlarla yaşar — 5'li düşük blok bunu büyük ölçüde emer, sabırla tek fırsatı bekle." },
        { q: "Evde ve güçlüyken ne yapmalıyım?", a: "Yüksek Baskı, Stil ve Tempo ile 4-3-3 B Kanat Oyunu oyna ve onları kendi yarı sahalarına it — oyunu şut menzillerinden uzak tutmak ana silahlarını etkisiz kılar." },
        { q: "Düşük blok Kaleyi Görünce Vur'a neden doğru cevaptır?", a: "4-2-3-1'in tehdidi ceza sahası dışından şutlara dayanır. Şut hatlarında adam bulunan kompakt bir 5'li savunma bu fırsatların çoğunu ortadan kaldırır ve rakibi topu bırakmaya veya düşük kaliteli şutlara zorlar." },
      ],
    },
  },
  {
    id: "451",
    slug: "451",
    formation: "4-5-1",
    emoji: "🔰",
    en: {
      title: "How to Counter 4-5-1 Shoot on Sight",
      metaTitle: "OSM 4-5-1 Counter Tactic 2026 — Exact Sliders | OSM Next Level",
      metaDesc: "The exact OSM counter-tactic for 4-5-1 Shoot on Sight, with Pressure/Style/Tempo values for away and home, weaker and stronger squads.",
      overview: "4-5-1 packs five midfielders behind a single striker, congesting the centre of the pitch and controlling tempo through sheer numbers. It's very hard to play through centrally, but the lone striker upfront has almost no support, which a compact counter-attacking shape exploits well.",
      strengths: [
        "Five-man midfield dominates central numbers and tempo",
        "Very difficult to play through down the middle",
        "Strong defensive screen in front of the back four",
        "Controls the pace of the match when in possession",
      ],
      weaknesses: [
        "Lone striker has no central strike partner and little support",
        "Lacks genuine pace and width in the final third",
        "Can be bypassed entirely by direct counters down the channels",
        "Vulnerable to high-tempo wing play when out of possession",
      ],
      faq: [
        { q: "Best OSM counter to 4-5-1 when away and weaker?", a: "5-2-3 A Counter Attack with low Pressure and Style. Their five-man midfield overload is shut down by your extra defender, and patience wins — wait for the chance rather than forcing it." },
        { q: "What about home and stronger?", a: "Switch to 4-3-3 A/B Wing Play with high Pressure, Style and Tempo. Punishing their lone-striker setup with explosive wing play and owning the flanks is the highest-win-rate approach at home." },
        { q: "Why is 4-5-1 vulnerable on the counter despite its midfield numbers?", a: "All five midfielders are needed to maintain the central block, which means almost nobody supports the lone striker. A team that breaks quickly down the channels gets in behind before that midfield wall can recover." },
      ],
    },
    tr: {
      title: "OSM 4-5-1 Kaleyi Görünce Vur'a Karşı Taktik",
      metaTitle: "OSM 4-5-1 Karşı Taktik 2026 — Net Slider Değerleri | OSM Next Level",
      metaDesc: "OSM'de 4-5-1 Kaleyi Görünce Vur'a karşı net taktik: deplasman ve evde, zayıf ve güçlü kadrolar için Baskı/Stil/Tempo değerleri.",
      overview: "4-5-1, tek santrafor arkasına beş orta saha oyuncusu yığar, sahanın merkezini tıkar ve sayı üstünlüğüyle tempoyu kontrol eder. Ortadan oynanması çok zordur, ama önde tek santraforun neredeyse hiç desteği yoktur — bu da kompakt bir kontra atak yapısının iyi avladığı bir noktadır.",
      strengths: [
        "Beş kişilik orta saha merkezi sayı ve tempoyu domine eder",
        "Ortadan oynanması çok zordur",
        "Dörtlü savunma önünde güçlü bir koruma hattı",
        "Topa sahipken maçın temposunu kontrol eder",
      ],
      weaknesses: [
        "Tek santraforun merkezi bir ortağı ve az desteği vardır",
        "Son bölgede gerçek hız ve genişlik eksikliği",
        "Kanallardan yapılan doğrudan kontralarla tamamen atlanabilir",
        "Topu kaybettiğinde yüksek tempolu kanat oyununa karşı zayıftır",
      ],
      faq: [
        { q: "Deplasmanda ve zayıfken 4-5-1'e karşı en iyi taktik nedir?", a: "Düşük Baskı ve Stille 5-2-3 A Kontra Atak. Beş kişilik orta saha üstünlükleri fazladan defansörünle kapanır, sabır kazandırır — fırsatı zorlamak yerine bekle." },
        { q: "Evde ve güçlüyken ne yapmalıyım?", a: "Yüksek Baskı, Stil ve Tempo ile 4-3-3 A/B Kanat Oyununa geç. Tek santrafor düzenlerini patlayıcı kanat oyunuyla cezalandırmak ve kanatlara hakim olmak evde en yüksek galibiyet oranını verir." },
        { q: "4-5-1, orta saha sayısına rağmen kontraya neden zayıf?", a: "Merkezi bloğu korumak için beş orta saha oyuncusunun da gerekmesi, tek santrafora neredeyse hiç destek kalmaması anlamına gelir. Kanallardan hızlı çıkan bir takım, orta saha duvarı toparlanmadan arkaya sızar." },
      ],
    },
  },
  {
    id: "523",
    slug: "523",
    formation: "5-2-3",
    emoji: "⚡",
    en: {
      title: "How to Counter 5-2-3 Counter Attack",
      metaTitle: "OSM 5-2-3 Counter Tactic 2026 — Exact Sliders | OSM Next Level",
      metaDesc: "The exact OSM counter-tactic for 5-2-3 Counter Attack — including how to beat it with 4-3-3 Wing Play at home. Pressure/Style/Tempo values included.",
      overview: "5-2-3 Counter Attack is OSM Next Level's own recommended away formation — five at the back for security, two midfielders to screen, three forwards with pace to break at speed. When you face it, the mirror-counter approach away is the safe play, but at home with a real advantage, attacking width is what actually breaks it open.",
      strengths: [
        "Five defenders provide excellent defensive security",
        "Two screening midfielders disrupt opposition build-up",
        "Three forwards with pace punish any turnover instantly",
        "Extremely reliable in away matches at any squad strength",
      ],
      weaknesses: [
        "Sits deep by design, so it creates little of its own at home",
        "Can be pinned in its own half by sustained wing pressure",
        "Struggles to break out once forced into transitions before resetting shape",
        "Limited creative output without turnovers to exploit",
      ],
      faq: [
        { q: "What's the best OSM counter to 5-2-3 when away and weaker?", a: "Mirror it with your own 5-2-3 A Counter Attack at low Pressure and Style. Neither side wants to commit first, so sharp decision-making on the few transitions decides the match." },
        { q: "What's the famous home-stronger answer to 5-2-3?", a: "Switch to 4-3-3 A/B Wing Play with high Pressure and Style. Pinning a 5-2-3 side into their own half with sustained width is OSM Next Level's signature home setup — the data behind it shows roughly a 95% win rate when you have a genuine strength advantage." },
        { q: "Why does wing play work so well against 5-2-3 at home?", a: "5-2-3 is built to sit back and counter, not to defend prolonged territorial pressure. Sustained wing overloads force their back five into repeated defensive actions without ever getting a clean turnover to counter from." },
      ],
    },
    tr: {
      title: "OSM 5-2-3 Kontra Atağa Karşı Taktik",
      metaTitle: "OSM 5-2-3 Karşı Taktik 2026 — Net Slider Değerleri | OSM Next Level",
      metaDesc: "OSM'de 5-2-3 Kontra Atağa karşı net taktik — evde 4-3-3 Kanat Oyunuyla nasıl yenilir dahil. Baskı/Stil/Tempo değerleri içerir.",
      overview: "5-2-3 Kontra Atak, OSM Next Level'ın kendi önerdiği deplasman formasyonudur — güvenlik için beşli savunma, perdeleme için iki orta saha, hızla çıkmak için üç hızlı forvet. Bu formasyonla karşılaştığında deplasmanda aynalama mantıklıdır, ama evde gerçek bir avantajla genişlik üzerinden hücum etmek onu asıl kıran şeydir.",
      strengths: [
        "Beş defans mükemmel savunma güvenliği sağlar",
        "Perdeleyen iki orta saha rakip kuruluşu bozar",
        "Hızlı üç forvet her top kaybını anında cezalandırır",
        "Her kadro gücünde deplasman maçlarında son derece güvenilir",
      ],
      weaknesses: [
        "Tasarım olarak geride durur, evde kendi başına az şey üretir",
        "Sürekli kanat baskısıyla kendi yarı sahasına hapsedilebilir",
        "Pozisyon toparlanmadan transizyona zorlandığında çıkış yapmakta zorlanır",
        "Top kaybı olmadan yaratıcı üretimi sınırlıdır",
      ],
      faq: [
        { q: "Deplasmanda ve zayıfken 5-2-3'e karşı en iyi taktik nedir?", a: "Düşük Baskı ve Stille kendi 5-2-3 A Kontra Atağınla aynala. Hiçbir taraf önce devreye girmek istemez, az sayıdaki transizyonda alınan keskin kararlar maçı belirler." },
        { q: "Evde ve güçlüyken 5-2-3'e karşı ünlü cevap nedir?", a: "Yüksek Baskı ve Stille 4-3-3 A/B Kanat Oyununa geç. 5-2-3 oynayan bir rakibi sürekli genişlikle kendi yarı sahasına hapsetmek OSM Next Level'ın imza ev kurulumudur — arkasındaki veriler gerçek bir güç avantajıyla yaklaşık %95 galibiyet oranı gösteriyor." },
        { q: "Kanat oyunu evde 5-2-3'e karşı neden bu kadar iyi çalışır?", a: "5-2-3, geride durup kontra atmak için tasarlanmıştır, uzun süreli alan baskısına karşı savunmak için değil. Sürekli kanat üstünlükleri, onların beşli savunmasını kontra atabilecekleri net bir top kaybı olmadan sürekli savunma hareketine zorlar." },
      ],
    },
  },
  {
    id: "541",
    slug: "541",
    formation: "5-4-1",
    emoji: "🏰",
    en: {
      title: "How to Counter 5-4-1",
      metaTitle: "OSM 5-4-1 Counter Tactic 2026 — Exact Sliders | OSM Next Level",
      metaDesc: "The exact OSM counter-tactic for 5-4-1, with Pressure/Style/Tempo values for away and home, weaker and stronger squads.",
      overview: "5-4-1 is about as defensive as OSM formations get short of a true park-the-bus — nine players committed behind the ball, a lone striker for the rare counter. It's extremely resilient, but it has almost no attacking output of its own, which rewards patience away and width at home.",
      strengths: [
        "Nine men behind the ball make it extremely hard to break down",
        "Very low goals-against even versus stronger opponents",
        "Resilient in away matches against any squad strength",
        "Forces opponents into low-percentage, rushed chances",
      ],
      weaknesses: [
        "Almost no attacking outlets beyond the lone striker",
        "Easily pinned back by sustained wing play at home",
        "Generates very few clear chances of its own",
        "Needs extreme patience from the user, which is hard to sustain",
      ],
      faq: [
        { q: "Best OSM counter to 5-4-1 when away and weaker?", a: "5-2-3 A/B Counter Attack at low Pressure and Style. Extreme patience is required — let them sit, and counter only when they're forced to overcommit." },
        { q: "What about home and stronger?", a: "4-3-3 A/B Wing Play with high Pressure and Style. Dominating the flanks and dismantling their nine-man defensive block with sustained width is the proven home approach." },
        { q: "Why is 5-4-1 so hard to break down?", a: "With nine players permanently behind the ball, there's no space to exploit through the middle and very little to counter against, since they rarely commit numbers forward. Width and patience are the only reliable routes through." },
      ],
    },
    tr: {
      title: "OSM 5-4-1'e Karşı Taktik",
      metaTitle: "OSM 5-4-1 Karşı Taktik 2026 — Net Slider Değerleri | OSM Next Level",
      metaDesc: "OSM'de 5-4-1'e karşı net taktik: deplasman ve evde, zayıf ve güçlü kadrolar için Baskı/Stil/Tempo değerleri.",
      overview: "5-4-1, gerçek bir otobüs park etmenin az ötesinde, OSM'deki en defansif dizilişlerden biridir — top etrafında dokuz oyuncu, nadir kontralar için tek santrafor. Son derece dirençlidir, ama kendi hücum üretimi neredeyse yoktur — bu da deplasmanda sabrı, evde genişliği ödüllendirir.",
      strengths: [
        "Top etrafında dokuz adam kırılmayı son derece zorlaştırır",
        "Daha güçlü rakiplere karşı bile çok düşük gol yeme oranı",
        "Her kadro gücüne karşı deplasman maçlarında dirençli",
        "Rakibi düşük olasılıklı, acele pozisyonlara zorlar",
      ],
      weaknesses: [
        "Tek santrafor dışında neredeyse hiç hücum çıkışı yok",
        "Evde sürekli kanat oyunuyla kolayca geriye hapsedilir",
        "Kendi başına çok az net pozisyon üretir",
        "Kullanıcıdan sürdürülmesi zor, aşırı bir sabır gerektirir",
      ],
      faq: [
        { q: "Deplasmanda ve zayıfken 5-4-1'e karşı en iyi taktik nedir?", a: "Düşük Baskı ve Stille 5-2-3 A/B Kontra Atak. Aşırı sabır gereklidir — onlar otursun, sadece aşırı ileri çıkmaya zorlandıklarında kontra at." },
        { q: "Evde ve güçlüyken ne yapmalıyım?", a: "Yüksek Baskı ve Stille 4-3-3 A/B Kanat Oyunu. Kanatlara hakim olup dokuz adamlık savunma bloklarını sürekli genişlikle dağıtmak kanıtlanmış ev yaklaşımıdır." },
        { q: "5-4-1 neden kırılması bu kadar zor?", a: "Top etrafında sürekli dokuz oyuncu olduğundan ortadan hedeflenecek boşluk yoktur ve nadiren ileri çıktıklarından kontra atılacak çok az şey vardır. Genişlik ve sabır geçmenin tek güvenilir yoludur." },
      ],
    },
  },
  {
    id: "631",
    slug: "631",
    formation: "6-3-1",
    emoji: "🚌",
    en: {
      title: "How to Counter 6-3-1 Park the Bus",
      metaTitle: "OSM 6-3-1 Counter Tactic 2026 — Exact Sliders | OSM Next Level",
      metaDesc: "The exact OSM counter-tactic for 6-3-1 Park the Bus, with Pressure/Style/Tempo values for away and home, weaker and stronger squads.",
      overview: "6-3-1 is the maximum defensive setup in OSM — six defenders forming a rigid wall, three midfielders, one isolated striker. It concedes almost nothing through the centre, but the rigid six-man line struggles badly with width: wing transitions are consistently the way through.",
      strengths: [
        "Six-man defensive line is extremely hard to break centrally",
        "Concedes very few clear chances against any opponent",
        "Effective even against significantly stronger squads away",
        "Minimises risk to almost zero in must-not-lose matches",
      ],
      weaknesses: [
        "Rigid six-man line lacks the mobility to track wide runners",
        "Wing transitions consistently create chances against it",
        "Provides essentially no attacking threat of its own",
        "Sustained high Style at home eventually breaks a fully parked block",
      ],
      faq: [
        { q: "Best OSM counter to 6-3-1 when away and weaker?", a: "5-2-3 A/B Counter Attack with low-to-moderate Pressure and Style — exploit transition speed against their rigid six-man line rather than trying to pass through it." },
        { q: "What about away and stronger?", a: "Switch to 4-3-3 A/B Wing Play with high Pressure and Style. Blasting through six defenders needs width as the decisive weapon, even on the road." },
        { q: "Why does width specifically break 6-3-1?", a: "Six defenders holding a flat line have no spare body to track underlapping or overlapping wide runners without breaking their shape. Repeated wing overloads create exactly the gaps a rigid back six can't cover." },
      ],
    },
    tr: {
      title: "OSM 6-3-1 Otobüs Park Etmeye Karşı Taktik",
      metaTitle: "OSM 6-3-1 Karşı Taktik 2026 — Net Slider Değerleri | OSM Next Level",
      metaDesc: "OSM'de 6-3-1 Otobüs Park Etmeye karşı net taktik: deplasman ve evde, zayıf ve güçlü kadrolar için Baskı/Stil/Tempo değerleri.",
      overview: "6-3-1, OSM'deki en üst düzey defansif kurulumdur — katı bir duvar oluşturan altı defans, üç orta saha, izole tek santrafor. Ortadan neredeyse hiç gol yemez, ama katı altı kişilik hat genişlikle ciddi şekilde zorlanır: kanat geçişleri istikrarlı şekilde geçiş yoludur.",
      strengths: [
        "Altı kişilik savunma hattı ortadan kırılması son derece zordur",
        "Her rakibe karşı çok az net pozisyon verir",
        "Deplasmanda belirgin şekilde güçlü rakiplere karşı bile etkilidir",
        "Kaybetmemesi gereken maçlarda riski neredeyse sıfıra indirir",
      ],
      weaknesses: [
        "Katı altı kişilik hat geniş koşuları takip edecek hareketlilikten yoksun",
        "Kanat geçişleri ona karşı istikrarlı şekilde pozisyon yaratır",
        "Kendi başına esasen hiç hücum tehdidi sunmaz",
        "Evde sürdürülen yüksek Stil, tam park etmiş bir bloğu sonunda kırar",
      ],
      faq: [
        { q: "Deplasmanda ve zayıfken 6-3-1'e karşı en iyi taktik nedir?", a: "Düşük-orta Baskı ve Stille 5-2-3 A/B Kontra Atak — katı altı kişilik hatlarından geçmeye çalışmak yerine geçiş hızını hedef al." },
        { q: "Deplasmanda ve güçlüyken ne yapmalıyım?", a: "Yüksek Baskı ve Stille 4-3-3 A/B Kanat Oyununa geç. Altı defanstan geçmek için genişlik, deplasmanda bile belirleyici silahtır." },
        { q: "Genişlik 6-3-1'i özellikle neden kırar?", a: "Düz bir hat tutan altı defansın, şeklini bozmadan içe veya dışa kesen geniş koşucuları takip edecek fazladan adamı yoktur. Tekrarlanan kanat üstünlükleri, katı bir altılı savunmanın kapatamayacağı tam boşlukları yaratır." },
      ],
    },
  },
  {
    id: "532",
    slug: "532",
    formation: "5-3-2",
    emoji: "🔱",
    en: {
      title: "How to Counter 5-3-2",
      metaTitle: "OSM 5-3-2 Counter Tactic 2026 — Exact Sliders | OSM Next Level",
      metaDesc: "The exact OSM counter-tactic for 5-3-2, with Pressure/Style/Tempo values for away and home, weaker and stronger squads.",
      overview: "5-3-2 combines a back five with three central midfielders and two strikers — compact, disciplined, and built to counter. It mirrors 5-2-3 in defensive intent but with one fewer forward and one more midfielder, making it slightly more conservative in transition.",
      strengths: [
        "Three central midfielders give strong control of the middle third",
        "Five defenders provide a very stable defensive base",
        "Two strikers can combine on the rare counter-attack",
        "Disciplined, low-risk shape away from home",
      ],
      weaknesses: [
        "Back five can be stretched by sustained wide play",
        "Fewer attacking outlets than a genuine 5-2-3 counter setup",
        "Overwhelmed by sustained high Tempo and Style at home",
        "Limited width of its own makes it reliant on rare turnovers",
      ],
      faq: [
        { q: "Best OSM counter to 5-3-2 when away and equal strength?", a: "Mirror discipline with your own 5-2-3 A Counter Attack at low-to-moderate Pressure and Style — out-counter them with sharper shape and tempo on the few transitions available." },
        { q: "What about home and stronger?", a: "4-3-3 A Wing Play with high Pressure and Style. Stretching their back five with sustained wide play is what creates the decisive chance." },
        { q: "Is 5-3-2 harder to break than 5-2-3?", a: "Slightly more conservative, not necessarily harder — the extra midfielder adds central control, but the same width-based approach that works against 5-2-3 stretches it open just as effectively." },
      ],
    },
    tr: {
      title: "OSM 5-3-2'ye Karşı Taktik",
      metaTitle: "OSM 5-3-2 Karşı Taktik 2026 — Net Slider Değerleri | OSM Next Level",
      metaDesc: "OSM'de 5-3-2'ye karşı net taktik: deplasman ve evde, zayıf ve güçlü kadrolar için Baskı/Stil/Tempo değerleri.",
      overview: "5-3-2, beşli savunmayı üç merkezi orta saha oyuncusu ve iki forvetle birleştirir — kompakt, disiplinli ve kontra atmak için tasarlanmıştır. Savunma niyeti olarak 5-2-3'ü andırır, ama bir forvet azı bir orta saha fazlasıyla geçişte biraz daha temkinlidir.",
      strengths: [
        "Üç merkezi orta saha oyuncusu orta bölgeye güçlü kontrol sağlar",
        "Beş defans çok stabil bir savunma temeli sağlar",
        "İki forvet nadir kontra atakta kombine olabilir",
        "Deplasmanda disiplinli, düşük riskli bir yapı",
      ],
      weaknesses: [
        "Beşli savunma sürekli geniş oyunla gerilebilir",
        "Gerçek bir 5-2-3 kontra kurulumundan daha az hücum çıkışı",
        "Evde sürekli yüksek Tempo ve Stille bunalır",
        "Kendi genişliği sınırlı olduğundan nadir top kayıplarına bağımlıdır",
      ],
      faq: [
        { q: "Deplasmanda ve eşit kuvvetteyken 5-3-2'ye karşı en iyi taktik nedir?", a: "Düşük-orta Baskı ve Stille kendi 5-2-3 A Kontra Atağınla disiplini aynala — mevcut az transizyonda daha keskin pozisyon ve tempoyla onları geç." },
        { q: "Evde ve güçlüyken ne yapmalıyım?", a: "Yüksek Baskı ve Stille 4-3-3 A Kanat Oyunu. Beşli savunmalarını sürekli geniş oyunla germek belirleyici fırsatı yaratan şeydir." },
        { q: "5-3-2, 5-2-3'ten kırılması daha mı zor?", a: "Biraz daha temkinlidir, mutlaka daha zor değildir — fazladan orta saha oyuncusu merkezi kontrol katar, ama 5-2-3'e karşı işe yarayan aynı genişlik temelli yaklaşım onu da aynı şekilde açar." },
      ],
    },
  },
  {
    id: "5311",
    slug: "5311",
    formation: "5-3-1-1",
    emoji: "⚓",
    en: {
      title: "How to Counter 5-3-1-1",
      metaTitle: "OSM 5-3-1-1 Counter Tactic 2026 — Exact Sliders | OSM Next Level",
      metaDesc: "The exact OSM counter-tactic for 5-3-1-1, with Pressure/Style/Tempo values for away and home, weaker and stronger squads.",
      overview: "5-3-1-1 sits a withdrawn forward just behind a lone striker, with a back five and three midfielders absorbing everything in front of them. It's one of the most patient, counter-oriented setups in OSM — facing it usually becomes a battle of who can hold their nerve longer.",
      strengths: [
        "Withdrawn forward links midfield and attack on the break",
        "Back five plus three midfielders make it extremely compact",
        "Built specifically to win patience battles in away matches",
        "Hard to create clean chances against without forcing the issue",
      ],
      weaknesses: [
        "Genuinely thin in numbers going forward beyond the two attackers",
        "Can be unlocked by controlled width rather than forced central play",
        "Quick transitions exploit space behind the defensive line once committed",
        "At home, a stronger opponent's wing play consistently breaks it",
      ],
      faq: [
        { q: "Best OSM counter to 5-3-1-1 when away and weaker?", a: "5-2-3 A Counter Attack at very low Pressure and Style — this is a patience battle. They park, you absorb, and you counter-punch only when the gap appears." },
        { q: "What about home and stronger?", a: "4-3-3 A/B Wing Play with high Pressure and Style. Punishing their defensive parking with sustained width is the standard route through at home." },
        { q: "Why does controlled width work better than direct pressure here?", a: "5-3-1-1 is built to compress central space and win patience duels through the middle. Width avoids that fight entirely and attacks the side of the pitch their compact shape is least equipped to cover." },
      ],
    },
    tr: {
      title: "OSM 5-3-1-1'e Karşı Taktik",
      metaTitle: "OSM 5-3-1-1 Karşı Taktik 2026 — Net Slider Değerleri | OSM Next Level",
      metaDesc: "OSM'de 5-3-1-1'e karşı net taktik: deplasman ve evde, zayıf ve güçlü kadrolar için Baskı/Stil/Tempo değerleri.",
      overview: "5-3-1-1, tek santraforun hemen arkasına çekilmiş bir forvet koyar; beşli savunma ve üç orta saha önlerindeki her şeyi emer. OSM'deki en sabırlı, kontra atağa yönelik kurulumlardan biridir — onunla karşılaşmak genellikle kimin daha uzun süre sinirlerine hakim olacağı savaşına döner.",
      strengths: [
        "Çekilmiş forvet kontrada orta saha ve hücumu birbirine bağlar",
        "Beşli savunma artı üç orta saha onu son derece kompakt yapar",
        "Özellikle deplasman maçlarında sabır savaşlarını kazanmak için tasarlanmıştır",
        "Konuyu zorlamadan ona karşı net pozisyon yaratmak zordur",
      ],
      weaknesses: [
        "İki hücumcunun ötesinde ileri doğru sayıca gerçekten zayıftır",
        "Zorlanmış merkezi oyun yerine kontrollü genişlikle açılabilir",
        "Devreye girdiklerinde savunma hattı arkasındaki boşluk hızlı geçişlerle istismar edilir",
        "Evde daha güçlü bir rakibin kanat oyunu onu istikrarlı şekilde kırar",
      ],
      faq: [
        { q: "Deplasmanda ve zayıfken 5-3-1-1'e karşı en iyi taktik nedir?", a: "Çok düşük Baskı ve Stille 5-2-3 A Kontra Atak — bu bir sabır savaşıdır. Onlar parklar, sen emersin ve boşluk göründüğünde kontra vurursun." },
        { q: "Evde ve güçlüyken ne yapmalıyım?", a: "Yüksek Baskı ve Stille 4-3-3 A/B Kanat Oyunu. Savunma parklamalarını sürekli genişlikle cezalandırmak evde standart geçiş yoludur." },
        { q: "Kontrollü genişlik burada doğrudan baskıdan neden daha iyi çalışır?", a: "5-3-1-1, merkezi alanı sıkıştırmak ve ortadaki sabır düellolarını kazanmak için tasarlanmıştır. Genişlik bu savaştan tamamen kaçınır ve kompakt yapılarının en az karşılayabileceği sahanın kenarına hücum eder." },
      ],
    },
  },
];
