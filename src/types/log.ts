/**
 * @format
 */

/** A single sleep entry, as stored. */
export type Log = {
  id: string;
  /** Calendar day the log belongs to, 'YYYY-MM-DD'. */
  date: string;
  /** ISO 8601 instant the user fell asleep. */
  sleepTime: string;
  /** ISO 8601 instant the user woke up. */
  wakeTime: string;
  notes?: string;
};

/** A log with the values derived from it and from the rest of the list. */
export type LogWithStats = Log & {
  /** wakeTime - sleepTime, in milliseconds. */
  elapsedMs: number;
  /** elapsedMs as a percentage of the list average: 100 means exactly average. */
  progressPercentage: number;
};
