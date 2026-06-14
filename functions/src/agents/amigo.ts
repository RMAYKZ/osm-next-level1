import type { ChatMessage, MatchIntent, UserHistory } from "../types/agentTypes";
import { getUserHistory, logUserSuccess } from "../skills/userMemory";

const CELEBRATION_TRIGGERS = ["taktik tuttu", "sahaya gömdüm", "kazandık", "süper maç", "mükemmel maç"];

/**
 * Keeps historical continuity alive and detects celebration triggers.
 * On "taktik tuttu" / "sahaya gömdüm" → overrides normal flow to log the victory.
 */
export async function runAmigo(
  userId: string,
  intent: MatchIntent,
  messages: ChatMessage[],
): Promise<UserHistory> {
  const recentEntries = await getUserHistory(userId);
  const successCount  = recentEntries.filter(e => e.outcome === "win").length;
  const lastTactic    = recentEntries[0]?.tacticUsed ?? null;

  if (intent.celebrationTrigger) {
    const lastMsg = messages.filter(m => m.role === "user").at(-1)?.content.toLowerCase() ?? "";
    const trigger = CELEBRATION_TRIGGERS.find(p => lastMsg.includes(p)) ?? "taktik tuttu";
    await logUserSuccess(userId, lastTactic ?? "unknown", recentEntries[0]?.sliders);
    console.info(`KUTLAMA_MOD: userId=${userId} trigger="${trigger}"`);
  }

  return {
    successCount,
    lastTactic,
    recentEntries,
    celebrationMode: intent.celebrationTrigger,
  };
}
