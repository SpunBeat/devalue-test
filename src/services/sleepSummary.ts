/**
 * Plain-language baby sleep summaries via the Anthropic Messages API.
 *
 * ⚠️ SECURITY: this calls api.anthropic.com directly from the device, which
 * means the API key ships inside the app bundle. A bundled key can be
 * extracted from any released .ipa/.apk and used at your expense — there is no
 * way to hide it client-side. Treat this path as development-only; for
 * production, move the call behind your own backend and have the app talk to
 * that instead. Only the endpoint and headers below would change.
 *
 * @format
 */

import { getAnthropicApiKey } from '../config/env';

const ANTHROPIC_MESSAGES_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

/**
 * `claude-sonnet-4-20250514` was retired on 2026-06-15 and now returns 404;
 * `claude-sonnet-5` is its documented replacement.
 */
const MODEL = 'claude-sonnet-5';

const MAX_TOKENS = 500;
const DEFAULT_TIMEOUT_MS = 30_000;

const SYSTEM_PROMPT =
  'You are a warm, supportive pediatric sleep assistant. Provide clear, ' +
  'empathetic, plain-language sleep summaries for parents based on logged data.';

export type SleepSummaryErrorCode =
  | 'missing_api_key'
  | 'http_error'
  | 'network_error'
  | 'timeout'
  | 'invalid_response'
  | 'refusal';

/** Every failure path throws this, so callers can branch on `code`. */
export class SleepSummaryError extends Error {
  readonly code: SleepSummaryErrorCode;
  /** HTTP status, when the failure came back as a response. */
  readonly status?: number;

  constructor(
    code: SleepSummaryErrorCode,
    message: string,
    options?: { status?: number; cause?: unknown },
  ) {
    super(message);
    this.name = 'SleepSummaryError';
    this.code = code;
    this.status = options?.status;
    (this as { cause?: unknown }).cause = options?.cause;

    // Keeps `instanceof` working once the class is transpiled down.
    Object.setPrototypeOf(this, SleepSummaryError.prototype);
  }
}

export type GenerateSleepSummaryParams = {
  /** Formatted duration, e.g. '10 hours 15 mins total across 2 night wakes'. */
  sleepTime: string;
  /** Free-text notes from the parent's log entry. */
  parentNotes: string;
  /** Defaults to '6 months'. */
  babyAge?: string;
  /** Abort the request after this many ms. Defaults to 30s. */
  timeoutMs?: number;
};

type AnthropicContentBlock = { type: string; text?: string };

type AnthropicMessageResponse = {
  content?: AnthropicContentBlock[];
  stop_reason?: string | null;
  stop_details?: { category?: string | null; explanation?: string | null } | null;
};

function buildUserMessage({
  sleepTime,
  parentNotes,
  babyAge,
}: Required<Pick<GenerateSleepSummaryParams, 'sleepTime' | 'parentNotes' | 'babyAge'>>): string {
  const notes = parentNotes.trim() || 'None provided.';

  return [
    `Baby's age: ${babyAge}`,
    `Sleep logged: ${sleepTime}`,
    `Parent's notes: ${notes}`,
    '',
    'Write a short summary of this sleep for the parent in plain language. ' +
      'Say what stands out, keep it reassuring and specific to the data above, ' +
      'and do not invent details that were not logged.',
  ].join('\n');
}

/** Pulls a useful message out of an error body without assuming its shape. */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.text();

    if (!body) {
      return response.statusText || 'no response body';
    }

    try {
      const parsed = JSON.parse(body) as { error?: { message?: string } };

      return parsed.error?.message ?? body;
    } catch {
      return body;
    }
  } catch {
    return response.statusText || 'no response body';
  }
}

/**
 * Asks Claude for a parent-facing summary of one night's sleep.
 *
 * @throws {SleepSummaryError} on a missing key, a non-2xx response, a network
 * or timeout failure, a refusal, or a response with no usable text.
 */
export async function generateSleepSummary({
  sleepTime,
  parentNotes,
  babyAge = '6 months',
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: GenerateSleepSummaryParams): Promise<string> {
  const apiKey = getAnthropicApiKey();

  if (!apiKey) {
    throw new SleepSummaryError(
      'missing_api_key',
      'ANTHROPIC_API_KEY is not set. Add it to .env and rebuild — see .env.example.',
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(ANTHROPIC_MESSAGES_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        // Claude Sonnet 5 thinks by default, and max_tokens caps thinking plus
        // response text together — at 500 that would truncate the summary.
        thinking: { type: 'disabled' },
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: buildUserMessage({ sleepTime, parentNotes, babyAge }),
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await readErrorMessage(response);

      throw new SleepSummaryError(
        'http_error',
        `Anthropic API returned ${response.status}: ${detail}`,
        { status: response.status },
      );
    }

    let payload: AnthropicMessageResponse;

    try {
      payload = (await response.json()) as AnthropicMessageResponse;
    } catch (error) {
      throw new SleepSummaryError(
        'invalid_response',
        'Anthropic API returned a body that was not valid JSON.',
        { cause: error },
      );
    }

    // Safety classifiers can decline with HTTP 200 and empty content, so this
    // has to be checked before reading content[0].
    if (payload.stop_reason === 'refusal') {
      const category = payload.stop_details?.category ?? 'unspecified';

      throw new SleepSummaryError(
        'refusal',
        `Anthropic declined to answer (category: ${category}).`,
      );
    }

    const block = payload.content?.[0];

    if (!block || block.type !== 'text' || !block.text?.trim()) {
      throw new SleepSummaryError(
        'invalid_response',
        'Anthropic API response contained no summary text.',
      );
    }

    return block.text.trim();
  } catch (error) {
    if (error instanceof SleepSummaryError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new SleepSummaryError(
        'timeout',
        `Request to the Anthropic API timed out after ${timeoutMs}ms.`,
        { cause: error },
      );
    }

    throw new SleepSummaryError(
      'network_error',
      `Could not reach the Anthropic API: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { cause: error },
    );
  } finally {
    clearTimeout(timeout);
  }
}
