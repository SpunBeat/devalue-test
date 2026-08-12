/**
 * @format
 */

import {
  buildLog,
  formatElapsed,
  formatTimeOfDay,
  getAverageElapsedMs,
  getElapsedMs,
  getMaxElapsedMs,
  parseTimeOfDay,
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

describe('getMaxElapsedMs', () => {
  test('is zero for an empty list', () => {
    expect(getMaxElapsedMs([])).toBe(0);
  });

  test('returns the longest night', () => {
    const logs = [
      makeLog('1', '2026-08-11T00:00:00.000Z', '2026-08-11T06:00:00.000Z'),
      makeLog('2', '2026-08-12T00:00:00.000Z', '2026-08-12T08:00:00.000Z'),
    ];

    expect(getMaxElapsedMs(logs)).toBe(8 * HOUR);
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

describe('formatTimeOfDay', () => {
  test('renders 12-hour time with a meridiem', () => {
    expect(formatTimeOfDay(new Date(2026, 7, 10, 21, 10).toISOString())).toBe(
      '9:10 pm',
    );
    expect(formatTimeOfDay(new Date(2026, 7, 11, 4, 55).toISOString())).toBe(
      '4:55 am',
    );
  });

  test('renders both noon and midnight as 12', () => {
    expect(formatTimeOfDay(new Date(2026, 7, 11, 0, 5).toISOString())).toBe(
      '12:05 am',
    );
    expect(formatTimeOfDay(new Date(2026, 7, 11, 12, 0).toISOString())).toBe(
      '12:00 pm',
    );
  });

  test('falls back on an unparseable instant', () => {
    expect(formatTimeOfDay('not a date')).toBe('--:--');
  });
});

describe('parseTimeOfDay', () => {
  test('reads the shapes a parent might type', () => {
    expect(parseTimeOfDay('9:10 pm')).toEqual({ hours: 21, minutes: 10 });
    expect(parseTimeOfDay('9:10pm')).toEqual({ hours: 21, minutes: 10 });
    expect(parseTimeOfDay('21:10')).toEqual({ hours: 21, minutes: 10 });
    expect(parseTimeOfDay(' 9 PM ')).toEqual({ hours: 21, minutes: 0 });
    expect(parseTimeOfDay('12:30 am')).toEqual({ hours: 0, minutes: 30 });
  });

  test('rejects out-of-range and malformed input', () => {
    expect(parseTimeOfDay('25:00')).toBeNull();
    expect(parseTimeOfDay('9:75')).toBeNull();
    expect(parseTimeOfDay('13:00 pm')).toBeNull();
    expect(parseTimeOfDay('bedtime')).toBeNull();
    expect(parseTimeOfDay('')).toBeNull();
  });
});

describe('buildLog', () => {
  test('puts an evening bedtime on the night before the wake date', () => {
    const log = buildLog({
      id: '1',
      date: '2026-08-11',
      sleepTime: '9:10 pm',
      wakeTime: '4:55 am',
    });

    expect(log).not.toBeNull();
    expect(new Date(log!.sleepTime)).toEqual(new Date(2026, 7, 10, 21, 10));
    expect(new Date(log!.wakeTime)).toEqual(new Date(2026, 7, 11, 4, 55));
    expect(getElapsedMs(log!)).toBe(7 * HOUR + 45 * 60 * 1000);
  });

  test('keeps a daytime nap on the same day', () => {
    const log = buildLog({
      id: '1',
      date: '2026-08-11',
      sleepTime: '1:00 pm',
      wakeTime: '3:00 pm',
    });

    expect(new Date(log!.sleepTime)).toEqual(new Date(2026, 7, 11, 13, 0));
    expect(getElapsedMs(log!)).toBe(2 * HOUR);
  });

  test('trims notes and omits them when blank', () => {
    const withNote = buildLog({
      id: '1',
      date: '2026-08-11',
      sleepTime: '9:10 pm',
      wakeTime: '4:55 am',
      notes: '  Room too warm  ',
    });
    const withoutNote = buildLog({
      id: '2',
      date: '2026-08-11',
      sleepTime: '9:10 pm',
      wakeTime: '4:55 am',
      notes: '   ',
    });

    expect(withNote!.notes).toBe('Room too warm');
    expect(withoutNote).not.toHaveProperty('notes');
  });

  test('returns null when a field does not parse', () => {
    const base = { id: '1', date: '2026-08-11', sleepTime: '9:10 pm' };

    expect(buildLog({ ...base, wakeTime: 'morning' })).toBeNull();
    expect(buildLog({ ...base, date: '11/08/2026', wakeTime: '7:00 am' })).toBeNull();
    expect(buildLog({ ...base, date: '2026-13-01', wakeTime: '7:00 am' })).toBeNull();
  });
});
