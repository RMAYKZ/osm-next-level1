export interface SystemDateInfo {
  isoDate: string;
  weekNumber: number;
  weekSeed: number;
  dayOfWeek: number;
}

function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

/** Returns current server timestamps and the exact ISO week number. */
export function getSystemDate(): SystemDateInfo {
  const now = new Date();
  const weekNumber = isoWeekNumber(now);
  return {
    isoDate: now.toISOString().split("T")[0],
    weekNumber,
    weekSeed: now.getUTCFullYear() * 100 + weekNumber,
    dayOfWeek: now.getUTCDay(),
  };
}
