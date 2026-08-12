/**
 * Sleep entries, shared across the Log and Analysis tabs.
 *
 * In memory only — nothing is persisted between launches yet.
 *
 * @format
 */

import { useMemo } from 'react';
import { create } from 'zustand';

import {
  buildLog,
  getAverageElapsedMs,
  getMaxElapsedMs,
  withStats,
} from '../lib/sleepLog';
import type { LogDraft } from '../lib/sleepLog';
import type { Log, LogWithStats } from '../types/log';

/** A draft as typed in the sheet; the store assigns the id. */
export type NewLogDraft = Omit<LogDraft, 'id'>;

type LogStore = {
  logs: Log[];
  /** Returns false when the draft does not parse, leaving the store untouched. */
  addEntry: (draft: NewLogDraft) => boolean;
  removeEntry: (id: string) => void;
};

/** Newest wake time first, so index 0 is always the latest entry. */
function sortByWakeDesc(logs: Log[]): Log[] {
  return [...logs].sort(
    (a, b) => new Date(b.wakeTime).getTime() - new Date(a.wakeTime).getTime(),
  );
}

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const useLogStore = create<LogStore>()(set => ({
  logs: [],

  addEntry: draft => {
    const log = buildLog({ id: createId(), ...draft });

    if (!log) {
      return false;
    }

    set(state => ({ logs: sortByWakeDesc([log, ...state.logs]) }));

    return true;
  },

  removeEntry: id =>
    set(state => ({ logs: state.logs.filter(log => log.id !== id) })),
}));

export type LogSummary = {
  entries: LogWithStats[];
  /** Longest night in the list, for sizing the progress bars. */
  maxElapsedMs: number;
  averageElapsedMs: number;
};

/**
 * The list plus everything derived from it. Derivation happens here rather than
 * inside the selector: a selector that built a new array on every call would
 * hand `useSyncExternalStore` a fresh snapshot each render and loop.
 */
export function useLogSummary(): LogSummary {
  const logs = useLogStore(state => state.logs);

  return useMemo(
    () => ({
      entries: withStats(logs),
      maxElapsedMs: getMaxElapsedMs(logs),
      averageElapsedMs: getAverageElapsedMs(logs),
    }),
    [logs],
  );
}
