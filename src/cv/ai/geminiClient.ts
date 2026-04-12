/**
 * Thin client that calls the Gemini BYOK proxy instead of hitting
 * generativelanguage.googleapis.com directly from the browser (which is
 * blocked by CORS on the deployed GitHub Pages app).
 *
 * The proxy forwards the user-supplied API key per request; no key is stored
 * server-side. For local development the proxy runs via `wrangler dev` on port
 * 8787, or you can point VITE_GEMINI_PROXY_URL at any deployed Worker URL.
 */

import { z } from 'zod';

const PROXY_BASE = import.meta.env.VITE_GEMINI_PROXY_URL || 'http://localhost:8787';

/** Model used for all Gemini calls (generation and parsing). */
export const GEMINI_MODEL = 'gemini-2.5-flash';

export interface GeminiPart {
  text?: string;
  inlineData?: { data: string; mimeType: string };
}

export interface GeminiContent {
  role?: string;
  parts: GeminiPart[];
}

export interface GeminiConfig {
  systemInstruction?: string;
  responseMimeType?: string;
}

export interface GeminiRequest {
  model: string;
  config?: GeminiConfig;
  contents: string | GeminiContent | GeminiContent[];
}

export interface GeminiResponse {
  text: string;
}

const geminiErrorSchema = z.object({
  error: z.object({ message: z.string() }).optional(),
});

const geminiSuccessSchema = z.object({
  candidates: z
    .array(
      z.object({
        content: z
          .object({
            parts: z.array(z.object({ text: z.string().optional() })).optional(),
          })
          .optional(),
      }),
    )
    .optional(),
});

/**
 * Maps the SDK-style `config` + `contents` structure into the REST API body
 * expected by the Gemini v1beta endpoint.
 */
function buildRequestBody(
  config: GeminiConfig | undefined,
  contents: GeminiRequest['contents'],
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (config?.systemInstruction) {
    body.systemInstruction = { parts: [{ text: config.systemInstruction }] };
  }
  if (config?.responseMimeType) {
    body.generationConfig = { responseMimeType: config.responseMimeType };
  }

  if (typeof contents === 'string') {
    body.contents = [{ role: 'user', parts: [{ text: contents }] }];
  } else if (Array.isArray(contents)) {
    body.contents = contents;
  } else {
    body.contents = [contents];
  }

  return body;
}

/**
 * Calls the Gemini proxy with the user-supplied API key.
 * The key is sent as `x-goog-api-key` to the proxy, which forwards it to
 * Google. It is never stored server-side.
 */
export async function generateContent(
  apiKey: string,
  params: GeminiRequest,
): Promise<GeminiResponse> {
  const url = `${PROXY_BASE}/generateContent?model=${encodeURIComponent(params.model)}`;

  const body = buildRequestBody(params.config, params.contents);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let detail = '';
    try {
      const raw: unknown = await response.json();
      const parsed = geminiErrorSchema.safeParse(raw);
      if (parsed.success) {
        detail = parsed.data.error?.message ?? '';
      }
    } catch {
      // ignore JSON parse failures on error responses
    }
    throw new Error(
      detail
        ? `Gemini API error (${response.status}): ${detail}`
        : `Gemini API error: ${response.status} ${response.statusText}`,
    );
  }

  const raw: unknown = await response.json();
  const parsed = geminiSuccessSchema.safeParse(raw);
  const text = parsed.success
    ? (parsed.data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '')
    : '';

  return { text };
}
