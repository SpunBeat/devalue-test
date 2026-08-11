/**
 * @format
 */

import {
  formatClockTime,
  formatElapsed,
  getAverageElapsedMs,
  getElapsedMs,
  withStats,
} from '../src/lib/sleepLog';
import type { Log } from '../src/types/log';

const HOUR = 60 * 60 * 1000;

function makeLog(id: string, sleepTime: string, wakeTime: string): Log {
  return { id, date: '2026-08-11', sleepTime, wakeTime };
}

describe('getElapsedMs', () => {
  test('measures across midnight', () => {
    const log = makeLog(
      '1',
      '2026-08-10T23:40:00.000Z',
      '2026-08-11T07:15:00.000Z',
    );

    expect(getElapsedMs(log)).toBe(7.5 * HOUR + 5 * 60 * 1000);
  });

  test('treats reversed and unparseable timestamps as zero', () => {
    const reversed = makeLog(
      '1',
      '2026-08-11T07:00:00.000Z',
      '2026-08-11T01:00:00.000Z',
    );

    expect(getElapsedMs(reversed)).toBe(0);
    expect(getElapsedMs(makeLog('2', 'nope', 'also nope'))).toBe(0);
  });
});

describe('getAverageElapsedMs', () => {
  test('is zero for an empty list', () => {
    expect(getAverageElapsedMs([])).toBe(0);
  });

  test('averages the elapsed times', () => {
    const logs = [
      makeLog('1', '2026-08-11T00:00:00.000Z', '2026-08-11T06:00:00.000Z'),
      makeLog('2', '2026-08-12T00:00:00.000Z', '2026-08-12T08:00:00.000Z'),
    ];

    expect(getAverageElapsedMs(logs)).toBe(7 * HOUR);
  });
});

describe('withStats', () => {
  test('scores each log against the list average', () => {
    const logs = [
      makeLog('1', '2026-08-11T00:00:00.000Z', '2026-08-11T06:00:00.000Z'),
      makeLog('2', '2026-08-12T00:00:00.000Z', '2026-08-12T08:00:00.000Z'),
    ];

    expect(withStats(logs).map(log => log.progressPercentage)).toEqual([
      86, 114,
    ]);
  });

  test('a lone log is exactly the average', () => {
    const logs = [
      makeLog('1', '2026-08-11T00:00:00.000Z', '2026-08-11T06:00:00.000Z'),
    ];

    expect(withStats(logs)[0].progressPercentage).toBe(100);
  });

  test('does not divide by a zero average', () => {
    const logs = [
      makeLog('1', '2026-08-11T00:00:00.000Z', '2026-08-11T00:00:00.000Z'),
    ];

    expect(withStats(logs)[0].progressPercentage).toBe(0);
  });

  test('keeps the stored fields, including optional notes', () => {
    const log: Log = {
      ...makeLog('1', '2026-08-11T00:00:00.000Z', '2026-08-11T06:00:00.000Z'),
      notes: 'Woke up twice',
    };

    expect(withStats([log])[0]).toMatchObject({
      id: '1',
      date: '2026-08-11',
      notes: 'Woke up twice',
      elapsedMs: 6 * HOUR,
    });
  });
});

describe('formatElapsed', () => {
  test('formats hours and minutes', () => {
    expect(formatElapsed(7.5 * HOUR + 5 * 60 * 1000)).toBe('7h 35m');
  });

  test('drops the hour segment under an hour', () => {
    expect(formatElapsed(45 * 60 * 1000)).toBe('45m');
  });
});

describe('formatClockTime', () => {
  test('falls back on an unparseable instant', () => {
    expect(formatClockTime('not a date')).toBe('--:--');
  });

  test('pads to HH:mm', () => {
    expect(formatClockTime(new Date(2026, 7, 11, 7, 5).toISOString())).toBe(
      '07:05',
    );
  });
});
