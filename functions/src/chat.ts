import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { orchestrate } from "./framework/baskan";

export type { ChatMessage } from "./types/agentTypes";

const geminiKey = defineSecret("GEMINI_API_KEY");

/**
 * aiChat — primary AI endpoint.
 *
 * Every message flows through Başkan (Ruflo Swarm Orchestrator) before reaching Gemini:
 *   Gözlemci → İstatistikçi → [Casus + Borsacı + Amigo] → KozmikOda → İmparator
 */
export const aiChat = onCall(
  {
    region: "europe-west1",
    secrets: [geminiKey],
    timeoutSeconds: 120,
    memory: "256MiB",
    invoker: "public",
  },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Login required.");

    const messages: Array<{ role: "user" | "assistant"; content: string }> =
      request.data?.messages ?? [];
    if (!messages.length) throw new HttpsError("invalid-argument", "No messages provided.");

    const userId       = request.auth.uid;
    const apiKey       = geminiKey.value();
    const lang         = (request.data?.lang as string | undefined) ?? "tr";
    const tacticSession = request.data?.tacticSession as import("./types/agentTypes").TacticSession | undefined;

    try {
      const { reply, tacticCard } = await orchestrate(messages, userId, apiKey, lang, tacticSession);
      return { reply, tacticCard };
    } catch (err) {
      console.error("[aiChat] Gemini error:", err instanceof Error ? err.message : String(err));
      const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
      if (msg.includes("rate") || msg.includes("quota") || msg.includes("429") || msg.includes("resource_exhausted"))
        throw new HttpsError("resource-exhausted", "Rate limit reached. Please try again shortly.");
      if (msg.includes("api key") || msg.includes("api_key") || msg.includes("invalid_argument") || msg.includes("permission") || msg.includes("401") || msg.includes("403"))
        throw new HttpsError("permission-denied", "Invalid API key.");
      if (msg.includes("timeout") || msg.includes("deadline"))
        throw new HttpsError("deadline-exceeded", "Request timed out.");
      if (msg.includes("not found") || msg.includes("404") || msg.includes("not_found"))
        throw new HttpsError("not-found", "AI model not found.");
      if (msg.includes("unavailable") || msg.includes("503") || msg.includes("overload"))
        throw new HttpsError("unavailable", "AI service temporarily unavailable.");
      throw new HttpsError("internal", `AI service error: ${msg.slice(0, 120)}`);
    }
  }
);
