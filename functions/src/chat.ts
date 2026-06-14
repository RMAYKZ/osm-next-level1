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
      const msg = err instanceof Error ? err.message.toLowerCase() : "";
      if (msg.includes("rate") || msg.includes("quota") || msg.includes("429"))
        throw new HttpsError("resource-exhausted", "Rate limit reached. Please try again shortly.");
      if (msg.includes("api key") || msg.includes("auth") || msg.includes("401") || msg.includes("403"))
        throw new HttpsError("unauthenticated", "Invalid API key.");
      if (msg.includes("timeout") || msg.includes("deadline"))
        throw new HttpsError("deadline-exceeded", "Request timed out.");
      throw new HttpsError("internal", "AI service error.");
    }
  }
);
