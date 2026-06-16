import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import type { IncomingMessage, ServerResponse } from "node:http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── OSM Anti-Tactic System Instruction ───────────────────────────────────────
//
// The AI is a strict database mirror for the ANTI_TACTIC_MATRIX defined in
// matchAnalysisUtils.ts. Values below are the deterministic midpoint outputs
// of that matrix (HOME_VALID=["4-3-3","5-2-3"], AWAY_BANNED=["4-3-3"]).
// The AI must NEVER invent formations or slider values.
//
const OSM_SYSTEM_INSTRUCTION = `\
Sen deneyimli, tutkulu bir OSM (Online Soccer Manager) teknik direktörüsün.
Yıllarca OSM oynayan, her formasyonu içselleştirmiş, taktikleri ezbere bilen bir hoca gibi konuş.
Bir veritabanı robotu değilsin — gerçek bir hoca enerjisiyle cevap ver.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KİŞİLİK KURALLARI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Sıcak ve güvenli konuş. "Tamam gel, bak şimdi sana söyleyeyim..." enerjisi.
• Kullanıcı "Selam" veya selamlama mesajı gönderdiğinde samimi karşıla. Örnek: "Hoş geldin! Önünde bir maç mı var? Hadi bakalım rakibi ne oynuyor."
• "Kazanır mıyız?" sorusunda TAHMİN YAP ve güven ver — asla "Tahmin yapamam" veya "AI olarak bilmiyorum" deme. Bunun yerine taktik gerekçeyle konuş: "Bu dizilimle rakip kırılır, çünkü 5-2-3'ün kanatları 5-2-3 kontr ataklarına karşı tamamen açık kalır..."
• "Yalnızca veritabanı eşleştirmesi yapabilirim" gibi robotik ifadeler KESİNLİKLE YASAK.
• Tüm yanıtlar Türkçe.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERİ KURALLARI — MUTLAK, İHLAL EDİLEMEZ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Formasyon, Baskı, Stil, Tempo değerleri YALNIZCA aşağıdaki matristen alınır.
• Matristeki rakamların dışında hiçbir sayı yazma.
• Matristeki formasyonların dışında hiçbir formasyon önerme.
• İstenilen eşleşme yoksa: "Bu eşleşme henüz matrisimde tanımlı değil." de.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANTİ-TAKTİK MATRİSİ — EV MAÇLARI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Rakip Formasyon | Öneri Formasyon | Oyun Stili  | Baskı | Stil | Tempo |
|-----------------|-----------------|-------------|-------|------|-------|
| 4-3-3           | 5-2-3           | Kontr Atak  |  12   |  27  |  67   |
| 4-4-2           | 4-3-3           | Kanat Oyunu |  67   |  65  |  69   |
| 4-5-1           | 5-2-3           | Kontr Atak  |  12   |  27  |  67   |
| 4-2-3-1         | 5-2-3           | Kontr Atak  |  12   |  27  |  67   |
| 5-3-2           | 5-2-3           | Kontr Atak  |  12   |  27  |  67   |
| 5-2-3           | 5-2-3           | Kontr Atak  |  12   |  27  |  67   |
| 5-4-1           | 5-2-3           | Kontr Atak  |  12   |  27  |  67   |
| 3-4-3           | 5-2-3           | Kontr Atak  |  12   |  27  |  67   |
| 3-5-2           | 5-2-3           | Kontr Atak  |  12   |  27  |  67   |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANTİ-TAKTİK MATRİSİ — DEPLASMAN MAÇLARI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Rakip Formasyon | Öneri Formasyon | Oyun Stili         | Baskı | Stil | Tempo |
|-----------------|-----------------|--------------------|-------|------|-------|
| 4-3-3           | 4-5-1           | Kaleyi Görünce Vur |  15   |  30  |  57   |
| 4-4-2           | 4-2-3-1         | Kontr Atak         |  45   |  50  |  57   |
| 4-5-1           | 4-4-2           | Pas Oyunu          |  40   |  60  |  57   |
| 4-2-3-1         | 4-4-2           | Pas Oyunu          |  40   |  60  |  57   |
| 5-3-2           | 5-2-3           | Kontr Atak         |  12   |  27  |  67   |
| 5-2-3           | 5-2-3           | Kontr Atak         |  12   |  27  |  67   |
| 5-4-1           | 5-2-3           | Kontr Atak         |  12   |  27  |  67   |
| 3-4-3           | 4-5-1           | Kaleyi Görünce Vur |  15   |  30  |  57   |
| 3-5-2           | 4-5-1           | Kaleyi Görünce Vur |  15   |  30  |  57   |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YANIT YAPISI — TAKTİK SORULARI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Taktik sorusu geldiğinde bu 3 adımı uygula:

1. TAKTİK GİRİŞ (1-2 cümle): Rakibi analiz et. Neden bu formasyon ve stili seçtiğini kısaca açıkla.

2. ÖZET TABLO (zorunlu, her zaman):
| Ayar            | Değer |
|-----------------|-------|
| Rakip Formasyon | ...   |
| Maç Yeri        | ...   |
| Öneri Formasyon | ...   |
| Oyun Stili      | ...   |
| Baskı           | ...   |
| Stil            | ...   |
| Tempo           | ...   |

3. GEREKÇE (2-3 cümle): Bu dizilim rakibin oyununu nasıl bozar? Sliderlar neden bu değerlerde?\
`;

// ── Dev-only tactic card lookup (mirrors matchAnalysisUtils matrix) ───────────

const DEV_LINE_TACTICS: Record<string, {
  forwards: string; midfielders: string; defenders: string;
  offsideTrap: boolean; marking: string;
}> = {
  "5-2-3":   { forwards: "attack_only",       midfielders: "protect_defense",  defenders: "deep_protection", offsideTrap: false, marking: "zonal" },
  "4-3-3":   { forwards: "attack_only",       midfielders: "stay_in_position", defenders: "high_line",       offsideTrap: true,  marking: "man"   },
  "4-5-1":   { forwards: "attack_and_defend", midfielders: "protect_defense",  defenders: "deep_protection", offsideTrap: false, marking: "zonal" },
  "4-2-3-1": { forwards: "attack_only",       midfielders: "stay_in_position", defenders: "deep_protection", offsideTrap: false, marking: "zonal" },
  "4-4-2":   { forwards: "attack_and_defend", midfielders: "stay_in_position", defenders: "deep_protection", offsideTrap: false, marking: "zonal" },
  "5-3-2":   { forwards: "attack_only",       midfielders: "protect_defense",  defenders: "defend_deep",     offsideTrap: false, marking: "zonal" },
};

type DevMatrixRow = {
  formation: string; style: string;
  press: number; sl: number; tempo: number; rationale: string;
};

const DEV_MATRIX: Record<"home" | "away", Record<string, DevMatrixRow>> = {
  home: {
    "4-3-3":   { formation: "5-2-3",   style: "counter_attack",  press: 12, sl: 27, tempo: 67, rationale: "4-3-3'ün kanat açılımını 5-2-3 kontr ile kapatıyoruz." },
    "4-4-2":   { formation: "4-3-3",   style: "wing_play",       press: 67, sl: 65, tempo: 69, rationale: "4-4-2'nin düz bloğunu 4-3-3 kanat baskısıyla deliyoruz." },
    "4-5-1":   { formation: "5-2-3",   style: "counter_attack",  press: 12, sl: 27, tempo: 67, rationale: "5 ortasahalı rakibe karşı geri çekilip hızlı kontr." },
    "4-2-3-1": { formation: "5-2-3",   style: "counter_attack",  press: 12, sl: 27, tempo: 67, rationale: "Çift pivot üstünlüğünü 5-2-3 derinliğiyle kırıyoruz." },
    "5-3-2":   { formation: "5-2-3",   style: "counter_attack",  press: 12, sl: 27, tempo: 67, rationale: "Aynı savunma döngüsünde kontr denklemini kuruyoruz." },
    "5-2-3":   { formation: "5-2-3",   style: "counter_attack",  press: 12, sl: 27, tempo: 67, rationale: "Aynaya karşı kontr; savunma dengesini koru ve hızlı çık." },
    "5-4-1":   { formation: "5-2-3",   style: "counter_attack",  press: 12, sl: 27, tempo: 67, rationale: "Aşırı savunmacı rakibe sabırlı pozisyon ve kontr." },
    "3-4-3":   { formation: "5-2-3",   style: "counter_attack",  press: 12, sl: 27, tempo: 67, rationale: "3-4-3 kanat açılımını 5'li blokla kapatıyoruz." },
    "3-5-2":   { formation: "5-2-3",   style: "counter_attack",  press: 12, sl: 27, tempo: 67, rationale: "3-5-2 uzun topunu 5'li savunmayla karşılıyoruz." },
  },
  away: {
    "4-3-3":   { formation: "4-5-1",   style: "shoot_on_sight",  press: 15, sl: 30, tempo: 57, rationale: "4-3-3 kanatlarını 5 ortasahayla bloke edip uzaktan şut." },
    "4-4-2":   { formation: "4-2-3-1", style: "counter_attack",  press: 45, sl: 50, tempo: 57, rationale: "4-4-2 bloğunu 4-2-3-1 kontr dinamizmiyle kırıyoruz." },
    "4-5-1":   { formation: "4-4-2",   style: "passing_game",    press: 40, sl: 60, tempo: 57, rationale: "Kompakt 4-5-1'i çift forvet ve pas oyunuyla açıyoruz." },
    "4-2-3-1": { formation: "4-4-2",   style: "passing_game",    press: 40, sl: 60, tempo: 57, rationale: "Çift pivot bloğunu pas oyunuyla aşıyoruz." },
    "5-3-2":   { formation: "5-2-3",   style: "counter_attack",  press: 12, sl: 27, tempo: 67, rationale: "5-3-2 kontrına karşı sabırlı 5-2-3 kontr." },
    "5-2-3":   { formation: "5-2-3",   style: "counter_attack",  press: 12, sl: 27, tempo: 67, rationale: "Aynaya kontr; deplasmanda güvenli seçim." },
    "5-4-1":   { formation: "5-2-3",   style: "counter_attack",  press: 12, sl: 27, tempo: 67, rationale: "Savunma duvarını sabırla bekle, kontrla geç." },
    "3-4-3":   { formation: "4-5-1",   style: "shoot_on_sight",  press: 15, sl: 30, tempo: 57, rationale: "3-4-3 kanatlarını 5 ortasahayla kapatıyoruz." },
    "3-5-2":   { formation: "4-5-1",   style: "shoot_on_sight",  press: 15, sl: 30, tempo: 57, rationale: "3-5-2 uzun topuna düşük blok ve uzaktan şut." },
  },
};

const DEV_DIGIT_MAP: Record<string, string> = {
  "343": "3-4-3", "352": "3-5-2", "4231": "4-2-3-1",
  "433": "4-3-3", "442": "4-4-2", "451":  "4-5-1",
  "523": "5-2-3", "532": "5-3-2", "541":  "5-4-1",
};

function devResolveTacticCard(
  messages: Array<{ role: string; content: string }>,
): {
  opponentFormation: string; location: "home" | "away" | "unknown";
  recommendedFormation: string; playStyleKey: string;
  press: number; style: number; tempo: number;
  lineTactics: { forwards: string; midfielders: string; defenders: string; offsideTrap: boolean; marking: string };
  rationale: string; source: "matrix";
} | null {
  const lastMsg = (messages.filter(m => m.role === "user").at(-1)?.content ?? "").toLowerCase();
  const HOME_KW = ["evde", "ev maçı", "iç saha", "home", "kendi sahamız", "ev'de"];
  const AWAY_KW = ["deplasman", "away", "dışarıda", "konuk"];
  const isHome = HOME_KW.some(k => lastMsg.includes(k));
  const isAway = AWAY_KW.some(k => lastMsg.includes(k));
  if (!isHome && !isAway) return null;
  const location = isHome ? "home" : "away";

  const match = lastMsg.match(/\b\d(?:[-\s./]?\d){2,3}\b/g)?.[0];
  if (!match) return null;
  const digits = match.replace(/[^0-9]/g, "");
  const opp = DEV_DIGIT_MAP[digits];
  if (!opp) return null;

  const row = DEV_MATRIX[location]?.[opp];
  if (!row) return null;

  return {
    opponentFormation: opp,
    location,
    recommendedFormation: row.formation,
    playStyleKey: row.style,
    press: row.press,
    style: row.sl,
    tempo: row.tempo,
    lineTactics: DEV_LINE_TACTICS[row.formation] ?? { forwards: "attack_and_defend", midfielders: "stay_in_position", defenders: "deep_protection", offsideTrap: false, marking: "zonal" },
    rationale: row.rationale,
    source: "matrix",
  };
}

// ── Dev-only chat API middleware ──────────────────────────────────────────────
//
// Intercepts POST /api/chat at the Connect layer before Vite's own handlers.
// Calls Gemini 2.5 Flash from Node.js and returns { reply } JSON.
// No Firebase deployment or emulator needed — just GEMINI_API_KEY in .env.local.
// Get a free key at: https://aistudio.google.com/apikey
//
function devChatPlugin(geminiApiKey: string): Plugin {
  return {
    name: "dev-chat-api",
    apply: "serve",
    configureServer(server) {
      // NO path prefix — route via explicit req.url check to avoid Connect path-stripping.
      server.middlewares.use(
        (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          if (req.url !== "/api/chat" || req.method !== "POST") {
            return next();
          }

          // Collect body chunks via Promise so async/await can take over cleanly.
          const bodyPromise = new Promise<string>((resolve, reject) => {
            const chunks: Buffer[] = [];
            req.on("data", (c: Buffer) => chunks.push(c));
            req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
            req.on("error", reject);
          });

          bodyPromise
            .then(async (bodyStr) => {
              console.log("\n[DevChat] ── POST /api/chat ───────────────────────");
              console.log("[DevChat] GEMINI_API_KEY loaded:", !!geminiApiKey);
              console.log("[DevChat] Body:", bodyStr.slice(0, 300));

              const sendJson = (status: number, payload: object) => {
                if (!res.headersSent) {
                  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
                  res.end(JSON.stringify(payload));
                }
              };

              if (!geminiApiKey) {
                console.error("[DevChat] ❌ GEMINI_API_KEY not set in .env.local");
                sendJson(500, {
                  error:
                    "GEMINI_API_KEY is missing — add it to .env.local and restart npm run dev. " +
                    "Get a free key at https://aistudio.google.com/apikey",
                });
                return;
              }

              let messages: Array<{ role: string; content: string }>;
              let lang = "tr";
              let tacticSession: null | { strength: string; campStatus: string } = null;
              try {
                const parsed = JSON.parse(bodyStr) as {
                  messages?: Array<{ role: string; content: string }>;
                  lang?: string;
                  tacticSession?: { strength: string; campStatus: string } | null;
                };
                messages = Array.isArray(parsed.messages) ? parsed.messages : [];
                const VALID_LANGS = ["tr", "en", "hu", "ar", "pt"];
                if (parsed.lang && VALID_LANGS.includes(parsed.lang)) lang = parsed.lang;
                if (parsed.tacticSession) tacticSession = parsed.tacticSession;
              } catch {
                sendJson(400, { error: "Request body must be valid JSON with a 'messages' array." });
                return;
              }

              if (messages.length === 0) {
                sendJson(400, { error: "messages array must not be empty." });
                return;
              }

              console.log("[DevChat] Messages:", messages.length);
              console.log("[DevChat] Last:", messages.at(-1)?.content?.slice(0, 80));

              // Build language-aware system instruction
              const LANG_NAMES: Record<string, string> = {
                tr: "Turkish", en: "English", hu: "Hungarian",
                ar: "Arabic",  pt: "Portuguese (Brazilian)",
              };
              const langName = LANG_NAMES[lang] ?? "English";
              const langDirective =
                `[LANGUAGE DIRECTIVE] You MUST respond entirely in ${langName}. ` +
                `Greet and speak like an experienced human football manager in ${langName}. ` +
                `Translate all table headers, labels, and tactical commentary into ${langName}. ` +
                `Only raw slider numbers remain as integers.\n\n`;

              // Gemini REST API — model: gemini-2.5-flash (free tier, 1M TPM/day)
              // Roles: "user" stays "user", "assistant" maps to "model"
              const apiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
                {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({
                    system_instruction: {
                      parts: [{
                        text: langDirective + OSM_SYSTEM_INSTRUCTION,
                      }],
                    },
                    contents: messages.map((m) => ({
                      role: m.role === "assistant" ? "model" : "user",
                      parts: [{ text: m.content }],
                    })),
                    generationConfig: {
                      maxOutputTokens: 2048,
                      temperature: 0.7,
                      thinkingConfig: { thinkingBudget: 8192 }, // medium thinking
                    },
                  }),
                }
              );

              const rawText = await apiRes.text();
              console.log("[DevChat] Gemini status:", apiRes.status);

              if (!apiRes.ok) {
                console.error("[DevChat] ❌ Gemini error:", rawText.slice(0, 500));

                if (apiRes.status === 429) {
                  // Parse retry-after seconds from the error message if present
                  let retrySeconds: number | null = null;
                  try {
                    const errJson = JSON.parse(rawText) as { error?: { message?: string } };
                    const m = errJson.error?.message?.match(/retry in ([0-9.]+)s/i);
                    if (m) retrySeconds = Math.ceil(parseFloat(m[1]));
                  } catch { /* ignore */ }
                  console.warn(`[DevChat] ⏳ Rate limited — retry in ${retrySeconds ?? "?"}s`);
                  // Forward 429 so aiChat.ts maps it to "functions/resource-exhausted"
                  // → ChatWidget shows errRate instead of raw API message
                  sendJson(429, {
                    error: retrySeconds
                      ? `rate-limit:${retrySeconds}`
                      : "rate-limit",
                  });
                  return;
                }

                let errorMsg = `Gemini API error ${apiRes.status}`;
                try {
                  const errJson = JSON.parse(rawText) as { error?: { message?: string } };
                  if (errJson.error?.message) errorMsg = errJson.error.message;
                } catch { /* keep generic message */ }
                sendJson(502, { error: errorMsg });
                return;
              }

              const data = JSON.parse(rawText) as {
                candidates?: Array<{
                  content?: {
                    parts?: Array<{ text?: string; thought?: boolean }>;
                  };
                }>;
              };

              // Filter out thinking parts — only keep actual response text
              const parts = data.candidates?.[0]?.content?.parts ?? [];
              const reply = parts
                .filter((p) => !p.thought)
                .map((p) => p.text ?? "")
                .join("");

              console.log("[DevChat] ✅ Reply chars:", reply.length);
              let tacticCard = devResolveTacticCard(messages);
              // Apply session slider modifiers (dev side mirrors backend logic)
              if (tacticCard && tacticSession) {
                const cl = (v: number) => Math.min(100, Math.max(0, Math.round(v)));
                let { press, style: sl, tempo } = tacticCard;
                if (tacticSession.strength === "stronger") { press = cl(press + 8); sl = cl(sl + 6); tempo = cl(tempo + 4); }
                if (tacticSession.strength === "weaker")   { press = cl(press - 8); sl = cl(sl - 6); tempo = cl(tempo - 4); }
                if (tacticSession.campStatus === "kamp")            { press = cl(press - 5); }
                if (tacticSession.campStatus === "gizli_antrenman") { press = cl(press - 9); sl = cl(sl - 5); tempo = cl(tempo + 6); }
                tacticCard = { ...tacticCard, press, style: sl, tempo };
              }
              sendJson(200, { reply, tacticCard });
            })
            .catch((err: unknown) => {
              console.error("[DevChat] ❌ Fatal:", err);
              if (!res.headersSent) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    error: err instanceof Error ? err.message : "Internal server error",
                  })
                );
              }
            });
        }
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv with empty prefix loads ALL .env.local vars (not just VITE_*)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      tailwindcss(),
      devChatPlugin(env.GEMINI_API_KEY ?? ""),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "favicon.png", "apple-touch-icon-180x180.png", "pwa-icon.svg", "robots.txt", "osm-logo.png"],
        manifest: {
          name: "OSM Next Level",
          short_name: "OSM NL",
          description: "OSM 2026 en iyi karşı taktikler, anti-taktik motoru ve formasyon rehberi",
          theme_color: "#0a0e1a",
          background_color: "#090b21",
          display: "standalone",
          orientation: "any",
          scope: "/",
          start_url: "/",
          categories: ["games", "sports", "utilities"],
          icons: [
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "maskable-icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "pwa-icon.svg",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
          globIgnores: ["**/og-image.png", "**/hero-bg.jpg", "**/osm-manager.png"],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "gstatic-fonts-cache",
                expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/sheets\.googleapis\.com\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "sheets-api-cache",
                expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
      dedupe: ["three"],
    },
    server: {
      watch: {
        ignored: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.webp"],
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            // Split firebase by sub-package instead of one combined blob.
            // src/lib/firebase.ts already dynamically imports "firebase/auth",
            // "firebase/firestore" and "firebase/functions" separately on
            // demand — lumping them all into one "vendor-firebase" chunk (the
            // previous rule) defeated that: every page paid for Firestore +
            // Functions code even when only Auth was needed. Measured impact:
            // the old combined chunk had 90KB of 140KB (64%) unused on a
            // typical page load (Lighthouse "unused-javascript" audit).
            if (id.includes("node_modules/firebase/firestore")) return "vendor-firebase-firestore";
            if (id.includes("node_modules/firebase/auth")) return "vendor-firebase-auth";
            if (id.includes("node_modules/firebase/functions")) return "vendor-firebase-functions";
            if (id.includes("node_modules/firebase")) return "vendor-firebase-core";
            // React & React-DOM rarely change — long-lived cache.
            if (id.includes("node_modules/react-dom")) return "vendor-react-dom";
            if (id.includes("node_modules/react/") || id.includes("node_modules/react-is")) return "vendor-react";
          },
        },
      },
    },
  };
});
