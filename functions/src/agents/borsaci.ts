import type { MatchIntent, TransferContext } from "../types/agentTypes";
import { getWonderkidList, calculateOptimalPrice, calculateQuickSale } from "../skills/transfer";

/** Handles club financial mastery, asset shifting, and optimal squad scouting. */
export async function runBorsaci(intent: MatchIntent): Promise<TransferContext> {
  if (!intent.transferQuery) {
    return { active: false, wonderkids: [], optimalPrice: null, quickSalePrice: null };
  }

  const wonderkids = getWonderkidList();

  // Reuse the first extracted number as the player value if present.
  const playerValue = intent.squadValueUser;
  const optimalPrice  = playerValue !== null ? calculateOptimalPrice(playerValue)  : null;
  const quickSalePrice = playerValue !== null ? calculateQuickSale(playerValue) : null;

  return { active: true, wonderkids, optimalPrice, quickSalePrice };
}
