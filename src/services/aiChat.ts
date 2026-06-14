import { httpsCallable } from "firebase/functions";
import { getFunctionsInstance } from "../lib/firebase";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LineTactics {
  forwards: string;
  midfielders: string;
  defenders: string;
  offsideTrap?: boolean;
  marking?: string;
}

export interface TacticSession {
  opponentFormation: string;
  location: "home" | "away";
  strength: "stronger" | "equal" | "weaker";
  campStatus: "kamp" | "gizli_antrenman" | "yok";
}

export interface TacticCardData {
  opponentFormation: string;
  location: "home" | "away" | "unknown";
  recommendedFormation: string;
  playStyleKey: string;
  press: number;
  style: number;
  tempo: number;
  lineTactics: LineTactics;
  rationale: string;
  source: "matrix" | "ai_fallback";
}

interface AiChatResponse {
  reply: string;
  tacticCard?: TacticCardData | null;
}

/**
 * Sends messages to Claude and returns the assistant reply.
 *
 * DEV  → POST /api/chat intercepted by the Vite devChatPlugin middleware
 *         (calls Anthropic directly from Node.js — no Firebase needed)
 * PROD → Firebase Cloud Function `aiChat` → full Başkan pipeline
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  lang = "tr",
  tacticSession?: TacticSession | null,
): Promise<{ reply: string; tacticCard: TacticCardData | null }> {

  // ── Development path ──────────────────────────────────────────────────────
  if (import.meta.env.DEV) {
    let res: Response;
    try {
      res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages, lang, tacticSession: tacticSession ?? null }),
      });
    } catch (networkErr) {
      console.error("[aiChat] Network error:", networkErr);
      const e = new Error(
        networkErr instanceof Error ? networkErr.message : "Network error"
      );
      (e as { code?: string }).code = "functions/unavailable";
      throw e;
    }

    // Parse JSON — if it fails the middleware likely didn't intercept (served HTML)
    let payload: AiChatResponse & { error?: string };
    try {
      payload = (await res.json()) as AiChatResponse & { error?: string };
    } catch {
      const msg = `HTTP ${res.status} — response is not JSON. Restart npm run dev.`;
      console.error("[aiChat]", msg);
      const e = new Error(msg);
      (e as { code?: string }).code = "functions/internal";
      throw e;
    }

    if (!res.ok || payload.error) {
      // Surface the exact server error so the user sees what went wrong
      const msg = payload.error ?? `HTTP ${res.status}`;
      console.error("[aiChat] Server error:", msg);
      const e = new Error(msg);
      (e as { code?: string }).code =
        res.status === 401 ? "functions/unauthenticated"   :
        res.status === 429 ? "functions/resource-exhausted" :
        res.status === 408 ? "functions/deadline-exceeded"  :
        res.status === 404 ? "functions/not-found"          :
                             "functions/internal";
      throw e;
    }

    return { reply: payload.reply ?? "", tacticCard: payload.tacticCard ?? null };
  }

  // ── Production path — Firebase Cloud Function ─────────────────────────────
  const functions = await getFunctionsInstance();
  const callAiChat = httpsCallable<
    { messages: ChatMessage[]; lang: string; tacticSession: TacticSession | null },
    AiChatResponse
  >(functions, "aiChat");
  const result = await callAiChat({ messages, lang, tacticSession: tacticSession ?? null });
  return { reply: result.data.reply ?? "", tacticCard: result.data.tacticCard ?? null };
}
