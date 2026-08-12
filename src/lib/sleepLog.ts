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

/** Longest elapsed time in the list; 0 for an empty list. */
export function getMaxElapsedMs(logs: Log[]): number {
  return logs.reduce((max, log) => Math.max(max, getElapsedMs(log)), 0);
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

/** Local time of an ISO instant in 12-hour form, e.g. '9:10 pm'. */
export function formatTimeOfDay(isoInstant: string): string {
  const date = new Date(isoInstant);

  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  const hours24 = date.getHours();
  const suffix = hours24 >= 12 ? 'pm' : 'am';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours12}:${minutes} ${suffix}`;
}

/**
 * 'Aug 11, 2026' from a 'YYYY-MM-DD' string. Parsed field by field so the day
 * is not shifted by the timezone, which `new Date('2026-08-11')` would do.
 */
export function formatDate(date: string): string {
  const parsed = parseIsoDate(date);

  if (!parsed) {
    return date;
  }

  return new Date(
    parsed.year,
    parsed.month - 1,
    parsed.day,
  ).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Today as 'YYYY-MM-DD' in the device's timezone. */
export function todayIsoDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${now.getFullYear()}-${month}-${day}`;
}

function parseIsoDate(
  date: string,
): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());

  if (!match) {
    return null;
  }

  const [, year, month, day] = match.map(Number);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return { year, month, day };
}

/**
 * Reads a typed time: '9:10 pm', '9:10pm', '21:10', '9 pm'. Returns null when
 * the input is not a time we can trust.
 */
export function parseTimeOfDay(
  input: string,
): { hours: number; minutes: number } | null {
  const match = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i.exec(input.trim());

  if (!match) {
    return null;
  }

  const [, rawHours, rawMinutes, meridiem] = match;
  const minutes = rawMinutes ? Number(rawMinutes) : 0;
  let hours = Number(rawHours);

  if (minutes > 59) {
    return null;
  }

  if (meridiem) {
    if (hours < 1 || hours > 12) {
      return null;
    }

    const isPm = meridiem.toLowerCase() === 'pm';
    hours = (hours % 12) + (isPm ? 12 : 0);
  } else if (hours > 23) {
    return null;
  }

  return { hours, minutes };
}

export type LogDraft = {
  id: string;
  /** Calendar day the child woke up, 'YYYY-MM-DD'. */
  date: string;
  /** Typed time, e.g. '9:10 pm'. */
  sleepTime: string;
  /** Typed time, e.g. '4:55 am'. */
  wakeTime: string;
  notes?: string;
};

/**
 * Turns typed sheet values into a Log, or null if anything fails to parse.
 * Wake time anchors to `date`; a sleep time at or after it belongs to the
 * night before, which is what makes '9:10 pm → 4:55 am' work.
 */
export function buildLog(draft: LogDraft): Log | null {
  const date = parseIsoDate(draft.date);
  const sleep = parseTimeOfDay(draft.sleepTime);
  const wake = parseTimeOfDay(draft.wakeTime);

  if (!date || !sleep || !wake) {
    return null;
  }

  const wakeAt = new Date(
    date.year,
    date.month - 1,
    date.day,
    wake.hours,
    wake.minutes,
  );
  const sleepAt = new Date(
    date.year,
    date.month - 1,
    date.day,
    sleep.hours,
    sleep.minutes,
  );

  if (sleepAt.getTime() >= wakeAt.getTime()) {
    sleepAt.setDate(sleepAt.getDate() - 1);
  }

  const notes = draft.notes?.trim();

  return {
    id: draft.id,
    date: draft.date.trim(),
    sleepTime: sleepAt.toISOString(),
    wakeTime: wakeAt.toISOString(),
    ...(notes ? { notes } : {}),
  };
}
