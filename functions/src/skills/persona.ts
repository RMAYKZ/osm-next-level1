const RACON_POOL: Record<string, string[]> = {
  home_stronger: [
    "Bu saha bizim! Rakip içeri girdiğinde zaten çökmüş olacak. Sonuna kadar baskı.",
    "Evde oynuyoruz, güçlüyüz — bu maçta zafer bizim. Tek odak gol.",
  ],
  home_equal: [
    "Dengeli maç derler ya — ben dengeli değil kazanmak istiyorum. Her boşluğu değerlendir.",
    "Rakip bize denk ama bizim istencimiz daha güçlü. Farkı sahada göster.",
  ],
  home_weaker: [
    "Güçlü rakibi evde geçmek için bir şey lazım: takım ruhu. Baskıyı koy, devam et.",
  ],
  away_stronger: [
    "Deplasmana gidiyoruz ama bu onların maçı değil. 90 dakika boyunca kapılarını kilitle.",
  ],
  away_equal: [
    "Dışarıda oynuyorsun — korkuyla değil planla. Sıkıştır, fırsatı kolla.",
  ],
  away_weaker: [
    "Güçlü rakip deplasmanı — en iyi silahın disiplin ve sabır. Savun, bekle, vur.",
    "Bu maç akılla kazanılır, güçle değil. Bir kontrla çıkıyoruz.",
  ],
  celebration: [
    "TAKTİK TUTTU! Sahaya gömdük! Bu ekip inanılmaz — her biri profesyonel gibi oynadı!",
    "Şampiyon edasıyla oynadık ve sonucu bulduk. Bu başarı tüm ekibin!",
  ],
};

/** Generates an authentic Turkish football manager monologue for the given match context. */
export function generatePsychologicalRacon(matchContext: string): string {
  const ctx = matchContext.toLowerCase();
  let key = "home_equal";
  if      (ctx.includes("celebration"))                            key = "celebration";
  else if (ctx.includes("home") && ctx.includes("stronger"))      key = "home_stronger";
  else if (ctx.includes("home") && ctx.includes("weaker"))        key = "home_weaker";
  else if (ctx.includes("home"))                                   key = "home_equal";
  else if (ctx.includes("away") && ctx.includes("stronger"))      key = "away_stronger";
  else if (ctx.includes("away") && ctx.includes("weaker"))        key = "away_weaker";
  else if (ctx.includes("away"))                                   key = "away_equal";

  const pool = RACON_POOL[key] ?? RACON_POOL["home_equal"];
  return pool[Math.floor(Date.now() / 60_000) % pool.length];
}
