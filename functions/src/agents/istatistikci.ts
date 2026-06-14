import type { MatchIntent, DataContext } from "../types/agentTypes";
import { getSystemDate } from "../skills/systemDate";
import { getWeeklyTactics } from "../skills/weeklyTactics";

/** Fetches locked data parameters from the current dynamic context window. */
export function runIstatistikci(intent: MatchIntent): DataContext {
  const { weekSeed, weekNumber, isoDate } = getSystemDate();

  const hasFullContext =
    intent.location  !== "unknown" &&
    intent.strength  !== "unknown" &&
    intent.formation !== "unknown";

  const sliders = hasFullContext
    ? getWeeklyTactics(weekSeed, intent.formation, intent.location, intent.strength)
    : null;

  return { weekSeed, weekNumber, currentDate: isoDate, sliders };
}
