/**
 * @format
 */

import { getAnthropicApiKey } from '../src/config/env';
import {
  SleepSummaryError,
  generateSleepSummary,
} from '../src/services/sleepSummary';

jest.mock('../src/config/env', () => ({
  getAnthropicApiKey: jest.fn(() => 'test-key'),
}));

const mockedGetApiKey = getAnthropicApiKey as jest.MockedFunction<
  typeof getAnthropicApiKey
>;

const params = {
  sleepTime: '10 hours 15 mins total across 2 night wakes',
  parentNotes: 'Woke up twice, room a little warm',
};

function jsonResponse(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: '',
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

function mockFetch(impl: jest.Mock) {
  (globalThis as { fetch?: unknown }).fetch = impl;

  return impl;
}

beforeEach(() => {
  mockedGetApiKey.mockReturnValue('test-key');
});

afterEach(() => {
  jest.clearAllMocks();
  delete (globalThis as { fetch?: unknown }).fetch;
});

describe('generateSleepSummary', () => {
  test('returns the text of the first content block', async () => {
    mockFetch(
      jest.fn(async () =>
        jsonResponse({
          content: [{ type: 'text', text: '  Mia slept well last night.  ' }],
          stop_reason: 'end_turn',
        }),
      ),
    );

    await expect(generateSleepSummary(params)).resolves.toBe(
      'Mia slept well last night.',
    );
  });

  test('posts to the messages endpoint with the required headers', async () => {
    const fetchMock = mockFetch(
      jest.fn(async () =>
        jsonResponse({ content: [{ type: 'text', text: 'ok' }] }),
      ),
    );

    await generateSleepSummary(params);

    const [url, init] = fetchMock.mock.calls[0];

    expect(url).toBe('https://api.anthropic.com/v1/messages');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      'x-api-key': 'test-key',
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    });
  });

  test('sends the documented payload with a single user message', async () => {
    const fetchMock = mockFetch(
      jest.fn(async () =>
        jsonResponse({ content: [{ type: 'text', text: 'ok' }] }),
      ),
    );

    await generateSleepSummary(params);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);

    expect(body.model).toBe('claude-sonnet-5');
    expect(body.max_tokens).toBe(500);
    expect(body.system).toContain('warm, supportive pediatric sleep assistant');
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].role).toBe('user');
    expect(body.messages[0].content).toContain(params.sleepTime);
    expect(body.messages[0].content).toContain(params.parentNotes);
  });

  test('defaults the baby age to 6 months and honors an override', async () => {
    const fetchMock = mockFetch(
      jest.fn(async () =>
        jsonResponse({ content: [{ type: 'text', text: 'ok' }] }),
      ),
    );

    await generateSleepSummary(params);
    expect(fetchMock.mock.calls[0][1].body).toContain('6 months');

    await generateSleepSummary({ ...params, babyAge: '11 months' });
    expect(fetchMock.mock.calls[1][1].body).toContain('11 months');
  });

  test('marks blank parent notes as not provided', async () => {
    const fetchMock = mockFetch(
      jest.fn(async () =>
        jsonResponse({ content: [{ type: 'text', text: 'ok' }] }),
      ),
    );

    await generateSleepSummary({ ...params, parentNotes: '   ' });

    expect(fetchMock.mock.calls[0][1].body).toContain('None provided.');
  });

  test('throws before any request when the key is missing', async () => {
    mockedGetApiKey.mockReturnValue(undefined);
    const fetchMock = mockFetch(jest.fn());

    await expect(generateSleepSummary(params)).rejects.toMatchObject({
      code: 'missing_api_key',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('surfaces the status and message from an error response', async () => {
    mockFetch(
      jest.fn(async () =>
        jsonResponse(
          { error: { message: 'invalid x-api-key' } },
          { ok: false, status: 401 },
        ),
      ),
    );

    await expect(generateSleepSummary(params)).rejects.toMatchObject({
      code: 'http_error',
      status: 401,
      message: expect.stringContaining('invalid x-api-key'),
    });
  });

  test('wraps a network failure', async () => {
    mockFetch(
      jest.fn(async () => {
        throw new TypeError('Network request failed');
      }),
    );

    const error = await generateSleepSummary(params).catch(e => e);

    expect(error).toBeInstanceOf(SleepSummaryError);
    expect(error.code).toBe('network_error');
  });

  test('reports an aborted request as a timeout', async () => {
    mockFetch(
      jest.fn(async () => {
        const abort = new Error('Aborted');
        abort.name = 'AbortError';
        throw abort;
      }),
    );

    await expect(generateSleepSummary(params)).rejects.toMatchObject({
      code: 'timeout',
    });
  });

  test('treats a refusal as an error rather than reading empty content', async () => {
    mockFetch(
      jest.fn(async () =>
        jsonResponse({
          content: [],
          stop_reason: 'refusal',
          stop_details: { category: 'bio' },
        }),
      ),
    );

    await expect(generateSleepSummary(params)).rejects.toMatchObject({
      code: 'refusal',
      message: expect.stringContaining('bio'),
    });
  });

  test('rejects a response with no usable text block', async () => {
    mockFetch(
      jest.fn(async () =>
        jsonResponse({ content: [{ type: 'thinking' }], stop_reason: 'end_turn' }),
      ),
    );

    await expect(generateSleepSummary(params)).rejects.toMatchObject({
      code: 'invalid_response',
    });
  });

  test('rejects a body that is not valid JSON', async () => {
    mockFetch(
      jest.fn(async () => ({
        ok: true,
        status: 200,
        statusText: '',
        json: async () => {
          throw new SyntaxError('Unexpected token <');
        },
        text: async () => '<html>',
      })),
    );

    await expect(generateSleepSummary(params)).rejects.toMatchObject({
      code: 'invalid_response',
    });
  });
});
