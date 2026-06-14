// Öne çıkan başlangıç yorumları (her zaman görünür).
// Gerçek kullanıcı yorumları Firebase'den gelir ve bunların üstüne eklenir.

export interface SeedComment {
  id: string;
  author: string;
  text: string;
  rating: number;
  dateText: string;
}

export const seedComments: SeedComment[] = [
  {
    id: "seed-1",
    author: "kaan_efe07",
    text: "5-2-3 kontra taktiğini deplasmanda denedim, lider takımı kendi sahasında 2-0 yendim. Baskı ve tempo ayarları tam isabet.",
    rating: 5,
    dateText: "12 Oca 2026",
  },
  {
    id: "seed-2",
    author: "mertcan.93",
    text: "Anti-taktik motoru gerçekten işe yarıyor. Eskiden rastgele diziliyordum, şimdi rakibe göre seçiyorum ve fark belli oluyor.",
    rating: 5,
    dateText: "18 Oca 2026",
  },
  {
    id: "seed-3",
    author: "Burak_Y",
    text: "Hızlı satış aracı çok mantıklı. Genç oyuncuları 2.5x ile koyunca gerçekten hızlı satılıyor, bütçem rahatladı.",
    rating: 5,
    dateText: "20 Oca 2026",
  },
  {
    id: "seed-4",
    author: "deniz.kaya",
    text: "4-3-3 evde güçlüyken efsane. Üst üste 4 maç kazandım. Tek dikkat etmek gereken kondisyon, onu da hallettim.",
    rating: 4,
    dateText: "22 Oca 2026",
  },
  {
    id: "seed-5",
    author: "OzanFB1907",
    text: "Hakem rengine göre sertlik ayarı aklıma hiç gelmemişti. Kırmızı hakemde yumuşak oynayınca kart sorunum bitti.",
    rating: 5,
    dateText: "24 Oca 2026",
  },
  {
    id: "seed-6",
    author: "serkan_07",
    text: "Lig hedefi planlayıcı ile kaç galibiyet lazım net gördüm. Şampiyonluğu son hafta garantiledim, teşekkürler.",
    rating: 5,
    dateText: "26 Oca 2026",
  },
  {
    id: "seed-7",
    author: "emre.tactics",
    text: "5-3-2 ile güçlü rakibe deplasmanda 1 puan aldım, normalde 3-0 yerdi. Defansif kurulum tam çalıştı.",
    rating: 4,
    dateText: "28 Oca 2026",
  },
  {
    id: "seed-8",
    author: "yusuf__34",
    text: "Sitenin en güzel yanı sade olması. Aradığımı saniyede buluyorum, gereksiz reklam yok. Böyle devam.",
    rating: 5,
    dateText: "30 Oca 2026",
  },
  {
    id: "seed-9",
    author: "Caglar_GS",
    text: "Transfer alım rehberi sayesinde dizilişime uygun oyuncu alıyorum artık. Boş yere para harcamıyorum.",
    rating: 5,
    dateText: "1 Şub 2026",
  },
  {
    id: "seed-10",
    author: "hakan.ozdmr",
    text: "Kupa finalinde 4-2-3-1 istila ile geri döndüm, 2-1 geriden 3-2 kazandım. Bu site bağımlılık yapıyor.",
    rating: 5,
    dateText: "3 Şub 2026",
  },
  {
    id: "seed-11",
    author: "tolga_ynl",
    text: "Antrenman önericiyi kullanıp genç oyuncularıma gizli antrenman açtım. Değerleri ciddi şekilde yükseldi.",
    rating: 4,
    dateText: "4 Şub 2026",
  },
  {
    id: "seed-12",
    author: "berkay.06",
    text: "Yıllardır OSM oynuyorum, bu kadar derli toplu bir taktik kaynağı görmedim. Ömer eline sağlık gerçekten.",
    rating: 5,
    dateText: "5 Şub 2026",
  },
  {
    id: "seed-13",
    author: "Ahmet_K",
    text: "Eşit kadroyla rakibi evde 5-2-3 ile bunalttım. Stil 29 tempo 75 kombinasyonu çok iyi sonuç verdi.",
    rating: 5,
    dateText: "6 Şub 2026",
  },

  // 🇬🇧 İngilizce
  {
    id: "seed-en-1",
    author: "j_walker88",
    text: "Best OSM tactics site I've found. The anti-tactic engine actually works, won my league title with these counters.",
    rating: 5,
    dateText: "Jan 14, 2026",
  },
  {
    id: "seed-en-2",
    author: "MikeTheGaffer",
    text: "Used the 5-2-3 counter away from home against a much stronger team and got a draw. Pressure and tempo settings are spot on.",
    rating: 5,
    dateText: "Jan 21, 2026",
  },
  {
    id: "seed-en-3",
    author: "daniel.osm",
    text: "The quick sale tool saved my budget. Selling young players at 2.5x really does move them fast on the market.",
    rating: 4,
    dateText: "Jan 27, 2026",
  },
  {
    id: "seed-en-4",
    author: "Coach_Ryan",
    text: "Referee colour guide is genius. Stopped getting red cards once I started adjusting my tackling. Top work.",
    rating: 5,
    dateText: "Feb 2, 2026",
  },

  // 🇵🇹 Portekizce
  {
    id: "seed-pt-1",
    author: "ricardo_sp",
    text: "Melhor site de táticas de OSM que já usei. Ganhei a liga usando os contra-ataques recomendados. Recomendo demais!",
    rating: 5,
    dateText: "16 Jan 2026",
  },
  {
    id: "seed-pt-2",
    author: "joao.silva10",
    text: "O 4-3-3 em casa quando estou mais forte é absurdo. Quatro vitórias seguidas. Só precisa cuidar da condição física.",
    rating: 5,
    dateText: "25 Jan 2026",
  },
  {
    id: "seed-pt-3",
    author: "Bruno_Benfica",
    text: "A ferramenta de venda rápida é muito útil. Liberei dinheiro para reforços em poucos minutos. Parabéns pelo site.",
    rating: 4,
    dateText: "31 Jan 2026",
  },

  // 🇭🇺 Macarca
  {
    id: "seed-hu-1",
    author: "balazs_92",
    text: "A legjobb OSM taktikai oldal. Az ellen-taktika motor tényleg működik, megnyertem vele a bajnokságot. Köszönöm!",
    rating: 5,
    dateText: "2026. jan. 19.",
  },
  {
    id: "seed-hu-2",
    author: "Gabor.FTC",
    text: "Idegenben az 5-2-3 kontrával egy erősebb csapat ellen szereztem pontot. A nyomás és tempó beállítás tökéletes.",
    rating: 5,
    dateText: "2026. jan. 29.",
  },

  // 🇸🇦 Arapça
  {
    id: "seed-ar-1",
    author: "khaled_99",
    text: "أفضل موقع تكتيكات في OSM. محرك التكتيك المضاد فعّال جداً وفزت بالدوري باستخدام هذه الخطط. شكراً جزيلاً.",
    rating: 5,
    dateText: "٢٠ يناير ٢٠٢٦",
  },
  {
    id: "seed-ar-2",
    author: "AbuOmar_77",
    text: "استخدمت خطة 5-2-3 المرتدة خارج الأرض ضد فريق أقوى وحصلت على تعادل. إعدادات الضغط والإيقاع ممتازة.",
    rating: 5,
    dateText: "٢٨ يناير ٢٠٢٦",
  },
  {
    id: "seed-ar-3",
    author: "salem.osm",
    text: "أداة البيع السريع رائعة. بعت اللاعبين الشباب بسرعة ووفرت ميزانية للتعاقدات. موقع احترافي بصراحة.",
    rating: 4,
    dateText: "٤ فبراير ٢٠٢٦",
  },
];
