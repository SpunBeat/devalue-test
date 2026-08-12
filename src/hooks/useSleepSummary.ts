/**
 * Request state for a single AI sleep summary.
 *
 * @format
 */

import { useCallback, useRef, useState } from 'react';

import { generateSleepSummary } from '../services/sleepSummary';
import type { GenerateSleepSummaryParams } from '../services/sleepSummary';

export type SleepSummaryState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; summary: string }
  | { status: 'error'; message: string };

export function useSleepSummary() {
  const [state, setState] = useState<SleepSummaryState>({ status: 'idle' });
  // Tapping a second entry while the first is in flight must not let the
  // slower response overwrite the newer one.
  const requestId = useRef(0);

  const run = useCallback(async (params: GenerateSleepSummaryParams) => {
    const id = requestId.current + 1;
    requestId.current = id;
    setState({ status: 'loading' });

    try {
      const summary = await generateSleepSummary(params);

      if (requestId.current === id) {
        setState({ status: 'success', summary });
      }
    } catch (error) {
      if (requestId.current !== id) {
        return;
      }

      setState({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Could not generate a summary.',
      });
    }
  }, []);

  /** Drops any in-flight response and returns to idle. */
  const reset = useCallback(() => {
    requestId.current += 1;
    setState({ status: 'idle' });
  }, []);

  return { state, run, reset };
}
