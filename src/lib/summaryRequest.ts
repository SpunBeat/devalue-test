/**
 * Turns a logged entry into the shape the summary service expects.
 *
 * @format
 */

import type { GenerateSleepSummaryParams } from '../services/sleepSummary';
import type { LogWithStats } from '../types/log';
import { formatElapsed, formatTimeOfDay } from './sleepLog';

/** Matches the badge in the app header. */
export const BABY_AGE = '4 months';

export function buildSummaryRequest(
  entry: LogWithStats,
  babyAge: string = BABY_AGE,
): GenerateSleepSummaryParams {
  return {
    sleepTime: `${formatElapsed(entry.elapsedMs)} total, from ${formatTimeOfDay(
      entry.sleepTime,
    )} to ${formatTimeOfDay(entry.wakeTime)}`,
    parentNotes: entry.notes ?? '',
    babyAge,
  };
}
