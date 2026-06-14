export const siteConfig = {
  donateUrl: "https://buymeacoffee.com/omerovvvvv",
  youtubeSubscribe: "https://www.youtube.com/@OSMNextLevel?sub_confirmation=1",
  premiumUrl: "https://buymeacoffee.com/omerovvvvv/extras",
  premiumContact: "https://www.instagram.com/carlaomer/",
};

export const premiumCodes: string[] = [];

export interface RefereeGuide {
  color: string;
  hex: string;
  level: string;
  meaning: string;
  advice: string;
  tackling: string;
}
export const refereeGuides: RefereeGuide[] = [
  { color: "Mavi / Yeşil", hex: "#22c55e", level: "Çok Yumuşak", meaning: "Hakem kart göstermeye çok meyilli değil. Sert oyuna toleranslı.", advice: "Sert oyna, presi yükselt. Kart riski düşük.", tackling: "Sert (Yüksek)" },
  { color: "Sarı", hex: "#eab308", level: "Normal", meaning: "Dengeli hakem. Aşırıya kaçmazsan sorun çıkmaz.", advice: "Normal sertlikte oyna. Gereksiz risk alma.", tackling: "Normal" },
  { color: "Turuncu", hex: "#f97316", level: "Sert", meaning: "Kolay kart çıkarır. Sert müdahalelerde kart riski yüksek.", advice: "Sertliği düşür. Kart cezalısı kalmamaya dikkat et.", tackling: "Yumuşak (Düşük)" },
  { color: "Kırmızı", hex: "#ef4444", level: "Çok Sert", meaning: "En agresif hakem. En ufak faulde kart riski var.", advice: "Çok yumuşak oyna. Kırmızı kart riskini minimuma indir.", tackling: "Çok Yumuşak" },
];

export interface TrainingAdvice {
  ageGroup: string;
  range: string;
  camp: string;
  training: string;
  hidden: string;
  note: string;
}
export const trainingAdvice: TrainingAdvice[] = [
  { ageGroup: "Genç (17-21)", range: "17-21", camp: "Uzun kamp (Gelişim odaklı)", training: "Yoğun bireysel antrenman", hidden: "Gizli antrenman: AÇIK (hızlı gelişir)", note: "Genç oyuncular en hızlı gelişen gruptur. Yatırım yap." },
  { ageGroup: "Olgun (22-27)", range: "22-27", camp: "Orta kamp (Denge)", training: "Mevki bazlı antrenman", hidden: "Gizli antrenman: AÇIK (dengeli)", note: "En verimli dönem. Performans + değer dengesi en iyi burada." },
  { ageGroup: "Tecrübeli (28-31)", range: "28-31", camp: "Kısa kamp (Form koruma)", training: "Hafif antrenman", hidden: "Gizli antrenman: KAPALI (riskli)", note: "Gelişim yavaşladı. Form ve kondisyonu korumaya odaklan." },
  { ageGroup: "Veteran (32+)", range: "32+", camp: "Çok kısa kamp", training: "Sadece kondisyon", hidden: "Gizli antrenman: KAPALI", note: "Yeni nesil hazırla. Veteranı yorma, son sezonlarını oynat." },
];

export interface SquadProfile {
  formation: string;
  needs: { position: string; trait: string }[];
}
export const squadProfiles: SquadProfile[] = [
  { formation: "4-3-3", needs: [
    { position: "ST (Santrafor)", trait: "Hız + Bitiricilik (Yüksek puan)" },
    { position: "Kanatlar (MR/ML)", trait: "Hız + Dribbling" },
    { position: "Orta Saha (MC)", trait: "Pas + Top kapma dengesi" },
    { position: "Defans (DC)", trait: "Pozisyon + Güç" },
  ]},
  { formation: "5-2-3", needs: [
    { position: "ST", trait: "Hız (Kontra için kritik)" },
    { position: "Stoperler (3x DC)", trait: "Güç + Pozisyon" },
    { position: "MC", trait: "Top kapma odaklı" },
    { position: "Kanat (MR/ML)", trait: "Hızlı bitirici" },
  ]},
  { formation: "4-4-2", needs: [
    { position: "2x ST", trait: "Biri hızlı, biri güçlü kombinasyon" },
    { position: "Kanatlar", trait: "Orta yapan + hızlı" },
    { position: "MC", trait: "Pas dağıtan oyun kurucu" },
    { position: "Defans", trait: "Dengeli pozisyon" },
  ]},
  { formation: "4-5-1", needs: [
    { position: "ST", trait: "Uzaktan şut + güç (KGvV)" },
    { position: "Orta Saha (5x)", trait: "Top kapma + pas" },
    { position: "Defans", trait: "Pozisyon odaklı" },
  ]},
];

export const matchChecklist: string[] = [
  "Rakibin taktiğini ve dizilişini incele",
  "Ev / Deplasman durumuna göre anti-taktik seç",
  "Baskı / Stil / Tempo değerlerini ayarla",
  "Çizgi taktiklerini (Forvet/Orta/Defans) kontrol et",
  "Kondisyon düşük oyuncuları değiştir",
  "Sakat veya kart cezalı oyuncu var mı bak",
  "Hakem rengine göre sertliği ayarla",
  "En iyi 11'i sahaya sürdüğünden emin ol",
];

export interface ChangelogEntry {
  date: string;
  title: string;
  description: string;
  type: "new" | "update" | "meta";
}
export const changelog: ChangelogEntry[] = [
  { date: "2026-02-05", title: "5-2-3 A Kontra metası güçlendi", description: "Son motor güncellemesinde 5-2-3 A kontra deplasmanda daha etkili. Baskı değerlerini güncelledim.", type: "meta" },
  { date: "2026-02-01", title: "Hızlı Satış ve Günün Maçları eklendi", description: "Siteye oyuncu satış hesaplayıcı ve canlı maç tahmin sistemi eklendi.", type: "new" },
  { date: "2026-01-20", title: "4-3-3 B kanat taktiği revize edildi", description: "Evde güçlüyken 4-3-3 B stil değeri optimize edildi.", type: "update" },
];

// ── Weekly Meta: auto-rotating tactic (changes every week automatically) ──
export interface MetaTactic {
  formation: string;
  pressure: number;
  style: number;
  tempo: number;
  winRate: string;
  reason: string;
}

export const META_TACTIC_ROTATION: MetaTactic[] = [
  {
    formation: "5-2-3 A (Counter Attack)",
    pressure: 32,
    style: 16,
    tempo: 70,
    winRate: "High",
    reason: "5-2-3 A counter-attack is dominating away fixtures this week. Low press with a disciplined back-three makes you near-impossible to break — lethal on the break.",
  },
  {
    formation: "4-3-3 B (Wing Play)",
    pressure: 60,
    style: 72,
    tempo: 75,
    winRate: "Very High",
    reason: "4-3-3 B Wing Play is tearing apart mid-table defences this week. Flood both flanks early and punish with crosses before opponents can set their shape.",
  },
  {
    formation: "4-5-1 (Shoot on Sight)",
    pressure: 50,
    style: 19,
    tempo: 65,
    winRate: "High",
    reason: "4-5-1 Shoot on Sight excels in balanced home matches this week. The dense five-man midfield makes it nearly impossible for opponents to build through the centre.",
  },
  {
    formation: "5-3-2 (Counter Attack)",
    pressure: 22,
    style: 9,
    tempo: 72,
    winRate: "High",
    reason: "5-3-2 counter is the safest away option this week. Pack the midfield, absorb pressure, and punish transitions with two pacey strikers in behind.",
  },
  {
    formation: "4-2-3-1 (Shoot on Sight)",
    pressure: 49,
    style: 22,
    tempo: 79,
    winRate: "Very High",
    reason: "4-2-3-1 Shoot on Sight is this week's surprise package. The compact double pivot protects well, while the No.10 creates overloads for clinical finishing.",
  },
];

/** Rotates automatically — one new tactic per calendar week, zero maintenance needed. */
export function getWeeklyMetaTactic(): MetaTactic {
  // Use the same ISO week number as the tactic engine so all dynamic values
  // are seeded identically. Previously used epoch-ms division which drifted
  // relative to ISO week boundaries.
  const d = new Date();
  const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return META_TACTIC_ROTATION[week % META_TACTIC_ROTATION.length];
}

// ── UK Timezone Utilities ────────────────────────────────────────────────────

/**
 * Extracts the current calendar date in the UK (Europe/London) timezone.
 * Automatically honours BST (UTC+1 summer) and GMT (UTC+0 winter).
 * Returns [year, month (0-indexed), day].
 */
function getUKDateParts(d = new Date()): [number, number, number] {
  // en-CA locale produces "YYYY-MM-DD" — trivial to parse, no regex needed.
  const ukStr = d.toLocaleString("en-CA", {
    timeZone: "Europe/London",
    year: "numeric", month: "2-digit", day: "2-digit",
  });
  const [y, m, day] = ukStr.split("-").map(Number);
  return [y, m - 1, day]; // month is 0-indexed to match Date()
}

/**
 * ISO 8601 week number (1–53) keyed to the UK timezone.
 * Rolls over precisely at Monday 00:00 UK time — identical for all users
 * in the same week regardless of their local timezone.
 */
export function getISOWeekNumberUK(d = new Date()): number {
  const [y, m, day] = getUKDateParts(d);
  const utc = new Date(Date.UTC(y, m, day));
  const dow = utc.getUTCDay() || 7; // treat Sun as 7 so Monday = anchor
  utc.setUTCDate(utc.getUTCDate() + 4 - dow); // shift to week's Thursday (ISO anchor)
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

/**
 * Returns the Mon–Sun date range string for the current UK week,
 * e.g. "8–14 Jun 2026". Uses UK timezone so the boundary matches
 * the Monday 00:00 UK tactic rotation boundary exactly.
 */
export function getCurrentWeekRange(d = new Date()): string {
  const [y, m, day] = getUKDateParts(d);
  const ukDay = new Date(y, m, day);
  const daysToMonday = ukDay.getDay() === 0 ? 6 : ukDay.getDay() - 1;
  const monday = new Date(y, m, day - daysToMonday);
  const sunday = new Date(y, m, day - daysToMonday + 6);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  if (monday.getMonth() === sunday.getMonth()) {
    return `${monday.getDate()}–${sunday.getDate()} ${months[monday.getMonth()]} ${monday.getFullYear()}`;
  }
  return `${monday.getDate()} ${months[monday.getMonth()]} – ${sunday.getDate()} ${months[sunday.getMonth()]} ${sunday.getFullYear()}`;
}

// ============================================================
// 📅 GÜNÜN TAKTİĞİ — 7 adet (haftanın her günü için bir tane)
// ============================================================
// Ömer: İstediğin zaman bunları değiştirebilirsin.
// Sistem otomatik olarak bugünün gününe göre doğru taktiği gösterir.
// 0=Pazar, 1=Pazartesi, 2=Salı, 3=Çarşamba, 4=Perşembe, 5=Cuma, 6=Cumartesi
export interface DailyTactic {
  day: number;
  dayName: string;
  title: string;
  formation: string;
  style: string;
  pressure: number;
  styleValue: number;
  tempo: number;
  scenario: string;
  tip: string;
}

export const dailyTactics: DailyTactic[] = [
  {
    day: 0, dayName: "Pazar",
    title: "Pazar Galibiyeti",
    formation: "4-3-3 A",
    style: "Kanatları Kullan",
    pressure: 55, styleValue: 70, tempo: 65,
    scenario: "Evde güçlüyken",
    tip: "Pazar günü lig maçlarında ev avantajını kullan. Kanatlardan yüklen, orta sahada pozisyon koru.",
  },
  {
    day: 1, dayName: "Pazartesi",
    title: "Hafta Başı Kontra",
    formation: "5-2-3 A",
    style: "Kontra Atak",
    pressure: 20, styleValue: 11, tempo: 65,
    scenario: "Deplasmanda zayıfken",
    tip: "Hafta başı deplasman maçları zordur. Düşük baskıyla sabırlı bekle, hızlı kontralarla vur.",
  },
  {
    day: 2, dayName: "Salı",
    title: "Turnuva Taktiği",
    formation: "5-2-3 A",
    style: "Kontra Atak",
    pressure: 32, styleValue: 16, tempo: 72,
    scenario: "Eşit kadroda",
    tip: "Salı turnuva maçlarında denge çok önemli. 5-2-3 kontra ile risksiz ilerle.",
  },
  {
    day: 3, dayName: "Çarşamba",
    title: "Orta Saha Baskısı",
    formation: "4-4-2 A/B",
    style: "Paslı Oyun",
    pressure: 55, styleValue: 60, tempo: 60,
    scenario: "Evde eşitken",
    tip: "Çarşamba ev maçlarında orta sahayı domine et. Pas oyunuyla rakibi yor, pozisyon bul.",
  },
  {
    day: 4, dayName: "Perşembe",
    title: "Deplasman Savaşçısı",
    formation: "5-3-2",
    style: "Kontra Atak",
    pressure: 25, styleValue: 9, tempo: 60,
    scenario: "Deplasmanda eşitken",
    tip: "Perşembe deplasman maçlarında defansif oyna. 5-3-2 ile sağlam dur, kontradan gol ara.",
  },
  {
    day: 5, dayName: "Cuma",
    title: "Cuma Hücumu",
    formation: "4-3-3 B",
    style: "Kanatları Kullan",
    pressure: 65, styleValue: 70, tempo: 75,
    scenario: "Evde güçlüyken",
    tip: "Cuma ev maçlarında tam gaz! Yüksek tempo + yüksek baskı ile rakibi boğ.",
  },
  {
    day: 6, dayName: "Cumartesi",
    title: "Hafta Sonu Derbisi",
    formation: "4-2-3-1",
    style: "Kaleyi Görünce Vur",
    pressure: 49, styleValue: 19, tempo: 79,
    scenario: "Her durumda",
    tip: "Cumartesi derbilerde KGV taktiği şaşırtır. Rakip hücum bekliyorsa sen kontradan geçersin.",
  },
];

// Bugünün taktiğini otomatik döndür
export function getTodaysTactic(): DailyTactic {
  const today = new Date().getDay();
  return dailyTactics.find((t) => t.day === today) || dailyTactics[0];
}

// ── Localized data getters ──
type TFn = (key: string) => string;

export function getLocalizedRefereeGuides(t: TFn): RefereeGuide[] {
  return refereeGuides.map((ref, i) => ({
    ...ref,
    color: t(`ref.${i}.color`),
    level: t(`ref.${i}.level`),
    meaning: t(`ref.${i}.meaning`),
    advice: t(`ref.${i}.advice`),
    tackling: t(`ref.${i}.tackling`),
  }));
}

export function getLocalizedTrainingAdvice(t: TFn): TrainingAdvice[] {
  return trainingAdvice.map((item, i) => ({
    ...item,
    ageGroup: t(`train.${i}.ageGroup`),
    camp: t(`train.${i}.camp`),
    training: t(`train.${i}.training`),
    hidden: t(`train.${i}.hidden`),
    note: t(`train.${i}.note`),
  }));
}

export function getLocalizedMatchChecklist(t: TFn): string[] {
  return matchChecklist.map((_, i) => t(`chk.${i}`));
}

export function getLocalizedSquadProfiles(t: TFn): SquadProfile[] {
  const formKeys = ["433", "523", "442", "451"];
  return squadProfiles.map((profile, fi) => ({
    ...profile,
    needs: profile.needs.map((_need, ni) => ({
      position: t(`sp.${formKeys[fi]}.${ni}.pos`),
      trait: t(`sp.${formKeys[fi]}.${ni}.trait`),
    })),
  }));
}

export function getLocalizedDailyTactic(t: TFn): DailyTactic {
  const base = getTodaysTactic();
  return {
    ...base,
    dayName: t(`dt.${base.day}.dayName`),
    title: t(`dt.${base.day}.title`),
    style: t(`dt.${base.day}.style`),
    scenario: t(`dt.${base.day}.scenario`),
    tip: t(`dt.${base.day}.tip`),
  };
}

export function getLocalizedPremiumTactics(_t: TFn): PremiumTactic[] {
  return premiumTactics;
}

export function getLocalizedChangelog(t: TFn): (Omit<ChangelogEntry, "title" | "description"> & { title: string; description: string; typeLabel: string })[] {
  return changelog.map((entry, i) => ({
    ...entry,
    title: t(`cl.${i}.title`),
    description: t(`cl.${i}.desc`),
    typeLabel: t(`cl.type.${entry.type}`),
  }));
}

export interface PremiumTactic {
  id: string;
  location: "home" | "away";
  name: string;
  scenario: string;
  formation: string;
  playStyle: string;
  pressure: number;
  style: number;
  tempo: number;
  forward: string;
  midfield: string;
  defenseLine: string;
  defenseShape: string;
  offside: string;
  winRate?: string;
  effectiveVs?: string[];
  note: string;
  warning?: string;
  solid?: boolean;
}

export const premiumTactics: PremiumTactic[] = [
  {
    id: "june-home-523",
    location: "home",
    name: "5-2-3 Kontra Atak",
    scenario: "Evde · Rakip ne oynarsa oynasın",
    formation: "5-2-3",
    playStyle: "Kontra Atak",
    pressure: 22,
    style: 30,
    tempo: 70,
    forward: "Sadece Hücum",
    midfield: "Defans Yardım",
    defenseLine: "Geride Kal",
    defenseShape: "Alan Savunması",
    offside: "Kapalı",
    winRate: "85",
    note: "Rakip ne oynarsa oynasın, bu taktik çalışıyor. Haziran 2026'nın en güçlü ev taktiği.",
    warning: "Güncelleme gelirse sayılar değişebilir. Takip et!",
  },
  {
    id: "june-home-433a",
    location: "home",
    name: "4-3-3 A · Kanatları Kullan",
    scenario: "Evde · Rank 4-10 arası güçlüyken",
    formation: "4-3-3 A",
    playStyle: "Kanatları Kullan",
    pressure: 55,
    style: 70,
    tempo: 65,
    forward: "Sadece Hücum",
    midfield: "Pozisyon Koru",
    defenseLine: "Geride Kal",
    defenseShape: "Alan Savunması",
    offside: "Kapalı*",
    effectiveVs: ["4-3-3", "5-2-3"],
    note: "4-10 rank arası güçlüyken kullan. 4-3-3 ve 5-2-3 oynayan rakiplere karşı son derece etkili.",
    warning: "*Rakip kontra oynuyorsa ofsayt tuzağını aç.",
  },
  {
    id: "june-home-433b",
    location: "home",
    name: "4-3-3 B · Kanatları Kullan",
    scenario: "Evde · 5-2-3 oynayan rakibe karşı",
    formation: "4-3-3 B",
    playStyle: "Kanatları Kullan",
    pressure: 62,
    style: 70,
    tempo: 66,
    forward: "Sadece Hücum",
    midfield: "Defans Yardım",
    defenseLine: "Geride Kal",
    defenseShape: "Alan Savunması",
    offside: "Kapalı*",
    effectiveVs: ["5-2-3"],
    note: "5-2-3 oynayan rakiplere karşı özel optimize edilmiş taktik. Kanat hücumları cevap vermek zordur.",
    warning: "*Rakip kontra oynuyorsa ofsayt tuzağını aç.",
  },
  {
    id: "june-away-523",
    location: "away",
    name: "5-2-3 Kontra Atak",
    scenario: "Deplasman · Sabit — her rakibe karşı kullan",
    formation: "5-2-3",
    playStyle: "Kontra Atak",
    pressure: 11,
    style: 23,
    tempo: 67,
    forward: "Sadece Hücum",
    midfield: "Defans Yardım",
    defenseLine: "Geride Kal",
    defenseShape: "Alan Savunması",
    offside: "Kapalı",
    note: "Deplasman taktiği sabittir, değiştirme. Her rakibe karşı, her sıralamada bu taktiği kullan.",
    solid: true,
  },
];
