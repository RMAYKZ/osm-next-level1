/**
 * Dîvan Kurulu — Admin-only LLM Council.
 *
 * When the platform admin requests strategic optimization or expansion advice,
 * this module fires a parallel 3-step deliberation loop via OpenRouter:
 *   Step 1: Parallel idea generation (GPT-4o, Gemini, Claude Sonnet)
 *   Step 2: Cross-model blind critique (each idea reviewed anonymously)
 *   Step 3: Consensus synthesis report
 *
 * Requires OPENROUTER_API_KEY secret.
 * Exposed as a separate `divanKurulu` Cloud Function in index.ts.
 */

export interface DivanReport {
  ideas: string[];
  critiques: string[];
  synthesis: string;
  generatedAt: string;
}

const OR_URL = "https://openrouter.ai/api/v1/chat/completions";

async function orCall(
  apiKey: string,
  model: string,
  system: string,
  user: string,
): Promise<string> {
  const res = await fetch(OR_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://osmnextlevel.com",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user",   content: user },
      ],
      max_tokens: 800,
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${model} error: ${res.status}`);
  const data = await res.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0]?.message.content ?? "";
}

const IDEA_SYSTEM =
  "Sen bir futbol yönetim platformu stratejisti olarak yaratıcı ve uygulanabilir fikirler üret. " +
  "OSM Next Level web sitesi için büyüme ve optimizasyon önerileri sun.";

const CRITIQUE_SYSTEM =
  "Aşağıdaki fikri eleştir. Güçlü ve zayıf yönleri net şekilde belirt. Kısa, dürüst ve yapıcı ol.";

const SYNTHESIS_SYSTEM =
  "Tüm fikirleri ve eleştirileri değerlendirerek en iyi unsurları birleştir. " +
  "Uygulanabilir, önceliklendirilmiş bir strateji raporu oluştur.";

export async function runDivanKurulu(
  adminRequest: string,
  openRouterKey: string,
): Promise<DivanReport> {
  // Step 1: Parallel idea generation from 3 distinct models
  const [gptIdea, geminiIdea, claudeIdea] = await Promise.all([
    orCall(openRouterKey, "openai/gpt-4o",                  IDEA_SYSTEM, adminRequest),
    orCall(openRouterKey, "google/gemini-flash-1.5",        IDEA_SYSTEM, adminRequest),
    orCall(openRouterKey, "anthropic/claude-3-5-haiku",     IDEA_SYSTEM, adminRequest),
  ]);

  const ideas = [gptIdea, geminiIdea, claudeIdea].filter(Boolean);

  // Step 2: Blind critique — ideas are numbered, not attributed to their source model
  const critiques = await Promise.all(
    ideas.map((idea, i) =>
      orCall(openRouterKey, "openai/gpt-4o-mini", CRITIQUE_SYSTEM, `FİKİR ${i + 1}:\n${idea}`)
    )
  );

  // Step 3: Consensus synthesis
  const combined = ideas
    .map((idea, i) => `FİKİR ${i + 1}:\n${idea}\n\nELEŞTİRİ ${i + 1}:\n${critiques[i] ?? ""}`)
    .join("\n\n---\n\n");

  const synthesis = await orCall(openRouterKey, "openai/gpt-4o", SYNTHESIS_SYSTEM, combined);

  return { ideas, critiques, synthesis, generatedAt: new Date().toISOString() };
}
