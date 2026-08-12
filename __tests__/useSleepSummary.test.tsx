/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { useSleepSummary } from '../src/hooks/useSleepSummary';
import type { SleepSummaryState } from '../src/hooks/useSleepSummary';
import {
  SleepSummaryError,
  generateSleepSummary,
} from '../src/services/sleepSummary';
import { buildSummaryRequest } from '../src/lib/summaryRequest';
import type { LogWithStats } from '../src/types/log';

jest.mock('../src/services/sleepSummary', () => {
  const actual = jest.requireActual('../src/services/sleepSummary');

  return { ...actual, generateSleepSummary: jest.fn() };
});

const mockedGenerate = generateSleepSummary as jest.MockedFunction<
  typeof generateSleepSummary
>;

const request = { sleepTime: '7h 45m total', parentNotes: '' };

type Hook = ReturnType<typeof useSleepSummary>;

/** Renders the hook and exposes its latest value. */
function renderHook() {
  const ref: { current: Hook | null } = { current: null };

  function Probe() {
    ref.current = useSleepSummary();

    return null;
  }

  ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<Probe />);
  });

  return {
    get state(): SleepSummaryState {
      return ref.current!.state;
    },
    get hook(): Hook {
      return ref.current!;
    },
  };
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('useSleepSummary', () => {
  test('starts idle', () => {
    expect(renderHook().state).toEqual({ status: 'idle' });
  });

  test('moves through loading to success', async () => {
    let resolve: (value: string) => void = () => {};
    mockedGenerate.mockReturnValue(
      new Promise<string>(r => {
        resolve = r;
      }),
    );

    const probe = renderHook();

    let pending: Promise<void>;
    ReactTestRenderer.act(() => {
      pending = probe.hook.run(request);
    });
    expect(probe.state).toEqual({ status: 'loading' });

    await ReactTestRenderer.act(async () => {
      resolve('Mia slept well.');
      await pending;
    });

    expect(probe.state).toEqual({
      status: 'success',
      summary: 'Mia slept well.',
    });
  });

  test('surfaces the service error message', async () => {
    mockedGenerate.mockRejectedValue(
      new SleepSummaryError('missing_api_key', 'ANTHROPIC_API_KEY is not set.'),
    );

    const probe = renderHook();

    await ReactTestRenderer.act(async () => {
      await probe.hook.run(request);
    });

    expect(probe.state).toEqual({
      status: 'error',
      message: 'ANTHROPIC_API_KEY is not set.',
    });
  });

  test('ignores a stale response when a newer request is in flight', async () => {
    let resolveFirst: (value: string) => void = () => {};
    mockedGenerate
      .mockReturnValueOnce(
        new Promise<string>(r => {
          resolveFirst = r;
        }),
      )
      .mockResolvedValueOnce('second');

    const probe = renderHook();

    let first: Promise<void>;
    let second: Promise<void>;
    ReactTestRenderer.act(() => {
      first = probe.hook.run(request);
    });

    await ReactTestRenderer.act(async () => {
      second = probe.hook.run(request);
      await second;
    });

    await ReactTestRenderer.act(async () => {
      resolveFirst('first');
      await first;
    });

    expect(probe.state).toEqual({ status: 'success', summary: 'second' });
  });

  test('reset returns to idle and drops the in-flight response', async () => {
    let resolve: (value: string) => void = () => {};
    mockedGenerate.mockReturnValue(
      new Promise<string>(r => {
        resolve = r;
      }),
    );

    const probe = renderHook();

    let pending: Promise<void>;
    ReactTestRenderer.act(() => {
      pending = probe.hook.run(request);
    });

    ReactTestRenderer.act(() => {
      probe.hook.reset();
    });
    expect(probe.state).toEqual({ status: 'idle' });

    await ReactTestRenderer.act(async () => {
      resolve('too late');
      await pending;
    });

    expect(probe.state).toEqual({ status: 'idle' });
  });
});

describe('buildSummaryRequest', () => {
  const entry: LogWithStats = {
    id: '1',
    date: '2026-08-11',
    sleepTime: new Date(2026, 7, 10, 21, 10).toISOString(),
    wakeTime: new Date(2026, 7, 11, 4, 55).toISOString(),
    elapsedMs: (7 * 60 + 45) * 60 * 1000,
    progressPercentage: 100,
  };

  test('describes the duration and the clock times', () => {
    expect(buildSummaryRequest(entry)).toEqual({
      sleepTime: '7h 45m total, from 9:10 pm to 4:55 am',
      parentNotes: '',
      babyAge: '4 months',
    });
  });

  test('passes notes through and honors a baby age override', () => {
    const withNote = { ...entry, notes: 'Room too warm' };

    expect(buildSummaryRequest(withNote, '9 months')).toMatchObject({
      parentNotes: 'Room too warm',
      babyAge: '9 months',
    });
  });
});
