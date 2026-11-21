export interface DailyScheduleEntry {
  /** Canonical release date, interpreted at 00:00 UTC. */
  date: string;
  /** Null until the puzzle is reviewed and released. */
  puzzleId: string | null;
}

/**
 * Short editorial preview for the November 2026 interface pilot.
 * Unreleased dates intentionally have no public puzzle ID or bundled content.
 */
export const dailySchedule: DailyScheduleEntry[] = [
  { date: "2026-11-15", puzzleId: "daily-logic-implication-chain" },
  { date: "2026-11-16", puzzleId: "daily-set-difference-inclusion" },
  { date: "2026-11-17", puzzleId: "daily-basis-properties" },
  { date: "2026-11-18", puzzleId: "linear-algebra-invertibility-02" },
  { date: "2026-11-19", puzzleId: "daily-preimage-identities" },
  { date: "2026-11-20", puzzleId: "daily-basis-unique-coordinates" },
  { date: "2026-11-21", puzzleId: "daily-set-intersection-inclusion" },
  { date: "2026-11-22", puzzleId: null },
  { date: "2026-11-23", puzzleId: null },
  { date: "2026-11-24", puzzleId: null },
  { date: "2026-11-25", puzzleId: null },
  { date: "2026-11-26", puzzleId: null },
];

export type DailyEntryStatus = "archived" | "today" | "upcoming" | "unavailable";

export function getUtcDateKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function getDailyEntryStatus(
  entry: DailyScheduleEntry,
  today: string = getUtcDateKey()
): DailyEntryStatus {
  if (entry.date > today) return "upcoming";
  if (entry.puzzleId === null) return "unavailable";
  if (entry.date < today) return "archived";
  return "today";
}

export function getDailyEntryForDate(date: string): DailyScheduleEntry | undefined {
  return dailySchedule.find((entry) => entry.date === date);
}
