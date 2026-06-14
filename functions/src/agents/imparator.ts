import { GoogleGenAI } from "@google/genai";
import type { ChatMessage, OrchestratorContext } from "../types/agentTypes";
import { generatePsychologicalRacon } from "../skills/persona";

/**
 * The ultimate voice of the system. Powered by Gemini 2.5 Flash, it processes
 * all compiled inputs from other agents and converts them into direct, highly
 * confident football manager dialogues.
 *
 * @param systemContext - Pre-built context string from Başkan (via KozmikOda)
 */
export async function runImparator(
  messages: ChatMessage[],
  ctx: OrchestratorContext,
  systemContext: string,
  apiKey: string,
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  const matchContextStr =
    `${ctx.matchIntent.celebrationTrigger ? "celebration " : ""}` +
    `${ctx.matchIntent.location} ${ctx.matchIntent.strength}`;

  const racon = generatePsychologicalRacon(matchContextStr);
  const fullSystem = `${systemContext}\n\n---\nKOÇ RACONU: ${racon}`;

  // All messages except the last go into history; the last is sent via sendMessage()
  const history = messages.slice(0, -1).map(m => ({
    role: (m.role === "assistant" ? "model" : "user") as "user" | "model",
    parts: [{ text: m.content }],
  }));

  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: fullSystem,
      maxOutputTokens: 2048,
      temperature: 0.7,
      thinkingConfig: { thinkingBudget: 8192 }, // medium thinking for tactical quality
    },
    history,
  });

  const lastMessage = messages.at(-1)?.content ?? "";
  const response = await chat.sendMessage({ message: lastMessage });
  return response.text ?? "";
}
