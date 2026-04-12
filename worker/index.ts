/**
 * Gemini BYOK proxy — Cloudflare Worker
 *
 * Forwards requests from the browser to the Generative Language API,
 * adding the user-supplied x-goog-api-key that the browser sent.
 * No API key is stored in this Worker; it is entirely user-supplied (BYOK).
 *
 * Allowed origin is locked to the deployed GitHub Pages URL.
 * Any request from a different origin is rejected with 403.
 *
 * Rate limiting: Cloudflare's free-tier account-level limits apply.
 * Additional per-IP rate limiting can be added via Cloudflare Rules.
 *
 * Route: POST /generateContent?model=<model>
 */

const GEMINI_BASE = 'https://generativelanguage.googleapis.com';
const ALLOWED_ORIGIN = 'https://batbrain9392.github.io';

/** Paths the Worker will proxy. Anything else is 404. */
const ALLOWED_PATHS = ['/generateContent'];

export default {
  async fetch(request: Request): Promise<Response> {
    const origin = request.headers.get('Origin') ?? '';

    // Always respond to CORS preflight.
    if (request.method === 'OPTIONS') {
      if (origin !== ALLOWED_ORIGIN) {
        return new Response('Forbidden', { status: 403 });
      }
      return corsPreflightResponse(origin);
    }

    if (origin !== ALLOWED_ORIGIN) {
      return new Response('Forbidden', { status: 403 });
    }

    if (request.method !== 'POST') {
      return corsResponse(new Response('Method Not Allowed', { status: 405 }), origin);
    }

    const url = new URL(request.url);

    if (!ALLOWED_PATHS.some((p) => url.pathname.endsWith(p))) {
      return corsResponse(new Response('Not Found', { status: 404 }), origin);
    }

    const apiKey = request.headers.get('x-goog-api-key');
    if (!apiKey) {
      return corsResponse(
        new Response(JSON.stringify({ error: 'Missing x-goog-api-key header.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
        origin,
      );
    }

    const model = url.searchParams.get('model');
    if (!model) {
      return corsResponse(
        new Response(JSON.stringify({ error: 'Missing model query parameter.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
        origin,
      );
    }

    // Forward the body to the real Gemini endpoint.
    const geminiUrl = `${GEMINI_BASE}/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    let upstreamResponse: Response;
    try {
      upstreamResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: request.body,
      });
    } catch {
      return corsResponse(
        new Response(JSON.stringify({ error: 'Failed to reach Gemini API.' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        }),
        origin,
      );
    }

    const responseBody = await upstreamResponse.arrayBuffer();
    return corsResponse(
      new Response(responseBody, {
        status: upstreamResponse.status,
        headers: {
          'Content-Type': upstreamResponse.headers.get('Content-Type') ?? 'application/json',
        },
      }),
      origin,
    );
  },
};

function corsHeaders(origin: string): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-goog-api-key',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function corsPreflightResponse(origin: string): Response {
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

function corsResponse(response: Response, origin: string): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(origin))) {
    headers.set(key, value);
  }
  return new Response(response.body, { status: response.status, headers });
}
