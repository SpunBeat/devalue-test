/**
 * @format
 */

import type { Log, LogWithStats } from '../types/log';

/**
 * Time slept, in milliseconds. Unparseable or reversed timestamps count as 0
 * rather than poisoning the average with NaN or a negative duration.
 */
export function getElapsedMs(log: Log): number {
  const elapsed =
    new Date(log.wakeTime).getTime() - new Date(log.sleepTime).getTime();

  return Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0;
}

/** Mean elapsed time across the list; 0 for an empty list. */
export function getAverageElapsedMs(logs: Log[]): number {
  if (logs.length === 0) {
    return 0;
  }

  const total = logs.reduce((sum, log) => sum + getElapsedMs(log), 0);

  return total / logs.length;
}

/** Attaches elapsed time and each log's progress against the list average. */
export function withStats(logs: Log[]): LogWithStats[] {
  const averageMs = getAverageElapsedMs(logs);

  return logs.map(log => {
    const elapsedMs = getElapsedMs(log);

    return {
      ...log,
      elapsedMs,
      progressPercentage:
        averageMs === 0 ? 0 : Math.round((elapsedMs / averageMs) * 100),
    };
  });
}

/** '7h 35m', or '45m' under an hour. */
export function formatElapsed(elapsedMs: number): string {
  const totalMinutes = Math.round(elapsedMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return hours === 0 ? `${minutes}m` : `${hours}h ${minutes}m`;
}

/** Local clock time of an ISO instant, e.g. '23:40'. */
export function formatClockTime(isoInstant: string): string {
  const date = new Date(isoInstant);

  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

/**
 * 'Aug 11, 2026' from a 'YYYY-MM-DD' string. Parsed field by field so the day
 * is not shifted by the timezone, which `new Date('2026-08-11')` would do.
 */
export function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);

  if (!year || !month || !day) {
    return date;
  }

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
