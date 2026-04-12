import { afterEach, describe, expect, it, vi } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

afterEach(() => {
  mockFetch.mockReset();
});

import { generateContent } from './geminiClient.ts';

function makeOkResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeErrorResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('generateContent', () => {
  it('sends POST to proxy with correct headers and model query param', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({
        candidates: [{ content: { parts: [{ text: 'Hello world' }] } }],
      }),
    );

    await generateContent('my-api-key', { model: 'gemini-2.5-flash', contents: 'prompt' });

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/generateContent?model=gemini-2.5-flash');
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('my-api-key');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    expect(init.method).toBe('POST');
  });

  it('returns concatenated text from candidates parts', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({
        candidates: [{ content: { parts: [{ text: 'Part one ' }, { text: 'Part two' }] } }],
      }),
    );

    const result = await generateContent('key', { model: 'gemini-2.5-flash', contents: 'prompt' });
    expect(result.text).toBe('Part one Part two');
  });

  it('returns empty string when candidates is missing', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({}));
    const result = await generateContent('key', { model: 'gemini-2.5-flash', contents: 'prompt' });
    expect(result.text).toBe('');
  });
});

describe('buildRequestBody (via generateContent)', () => {
  it('wraps a string contents into user role message', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ candidates: [] }));

    await generateContent('key', { model: 'gemini-2.5-flash', contents: 'raw text' });

    const body = JSON.parse((mockFetch.mock.calls[0] as [string, RequestInit])[1].body as string);
    expect(body.contents).toEqual([{ role: 'user', parts: [{ text: 'raw text' }] }]);
  });

  it('passes an array contents through unchanged', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ candidates: [] }));
    const contents = [{ role: 'user', parts: [{ text: 'msg' }] }];

    await generateContent('key', { model: 'gemini-2.5-flash', contents });

    const body = JSON.parse((mockFetch.mock.calls[0] as [string, RequestInit])[1].body as string);
    expect(body.contents).toEqual(contents);
  });

  it('maps config.systemInstruction into REST systemInstruction', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ candidates: [] }));

    await generateContent('key', {
      model: 'gemini-2.5-flash',
      config: { systemInstruction: 'Be concise.' },
      contents: 'prompt',
    });

    const body = JSON.parse((mockFetch.mock.calls[0] as [string, RequestInit])[1].body as string);
    expect(body.systemInstruction).toEqual({ parts: [{ text: 'Be concise.' }] });
  });

  it('maps config.responseMimeType into generationConfig', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ candidates: [] }));

    await generateContent('key', {
      model: 'gemini-2.5-flash',
      config: { responseMimeType: 'application/json' },
      contents: 'prompt',
    });

    const body = JSON.parse((mockFetch.mock.calls[0] as [string, RequestInit])[1].body as string);
    expect(body.generationConfig).toEqual({ responseMimeType: 'application/json' });
  });
});

describe('generateContent — error handling', () => {
  it('throws with Google error message on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(
      makeErrorResponse(400, { error: { message: 'API key not valid.' } }),
    );

    await expect(
      generateContent('bad-key', { model: 'gemini-2.5-flash', contents: 'p' }),
    ).rejects.toThrow('Gemini API error (400): API key not valid.');
  });

  it('throws with status text when error body has no message', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response('Internal Server Error', { status: 500, statusText: 'Internal Server Error' }),
    );

    await expect(
      generateContent('key', { model: 'gemini-2.5-flash', contents: 'p' }),
    ).rejects.toThrow('Gemini API error: 500');
  });

  it('throws on fetch network failure', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(
      generateContent('key', { model: 'gemini-2.5-flash', contents: 'p' }),
    ).rejects.toThrow('Failed to fetch');
  });
});
