import * as Sentry from '@sentry/react';

const SENSITIVE_PATTERNS = [
  /AIza[0-9A-Za-z_-]{35}/g, // Google API keys
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, // UUIDs
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // emails
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // phone numbers (US-style)
  /\+\d[\d\s-]{7,}/g, // international phone numbers
  /\b(?:sk|pk|rk|ak|key)-[a-zA-Z0-9]{20,}\b/g, // generic API key patterns
];

function scrub(value: string): string {
  let result = value;
  for (const pattern of SENSITIVE_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, '[REDACTED]');
  }
  return result;
}

function scrubObject(obj: unknown): unknown {
  if (typeof obj === 'string') return scrub(obj);
  if (Array.isArray(obj)) return obj.map(scrubObject);
  if (obj && typeof obj === 'object') {
    const scrubbed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lk = key.toLowerCase();
      if (
        lk.includes('key') ||
        lk.includes('token') ||
        lk.includes('secret') ||
        lk.includes('password') ||
        lk.includes('authorization')
      ) {
        scrubbed[key] = '[REDACTED]';
      } else {
        scrubbed[key] = scrubObject(value);
      }
    }
    return scrubbed;
  }
  return obj;
}

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    enabled: import.meta.env.PROD,
    sendDefaultPii: false,

    integrations: [
      Sentry.breadcrumbsIntegration({
        console: true,
        dom: true,
        fetch: true,
        history: true,
        xhr: true,
      }),
      Sentry.browserTracingIntegration(),
    ],

    tracesSampleRate: 0.2,
    tracePropagationTargets: [/^https:\/\/generativelanguage\.googleapis\.com/],

    ignoreErrors: [
      'ResizeObserver loop',
      'Non-Error promise rejection captured',
      /^Loading chunk .* failed/,
      /^Failed to fetch dynamically imported module/,
    ],

    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.category === 'console') {
        const level = breadcrumb.level;
        if (level !== 'warning' && level !== 'error') return null;
        if (breadcrumb.message) {
          breadcrumb.message = scrub(breadcrumb.message);
        }
      }

      if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
        if (breadcrumb.data) {
          const url = breadcrumb.data.url;
          if (typeof url === 'string') {
            try {
              const parsed = new URL(url);
              parsed.searchParams.forEach((_, param) => {
                if (/key|token|secret/i.test(param)) {
                  parsed.searchParams.set(param, '[REDACTED]');
                }
              });
              breadcrumb.data.url = parsed.toString();
            } catch {
              breadcrumb.data.url = scrub(url);
            }
          }
        }
      }

      return breadcrumb;
    },

    beforeSend(event) {
      if (event.exception?.values) {
        for (const ex of event.exception.values) {
          if (ex.value) ex.value = scrub(ex.value);
        }
      }

      if (event.breadcrumbs) {
        for (const bc of event.breadcrumbs) {
          if (bc.message) bc.message = scrub(bc.message);
          if (bc.data) {
            const scrubbed = scrubObject(bc.data);
            if (scrubbed && typeof scrubbed === 'object' && !Array.isArray(scrubbed)) {
              bc.data = scrubbed;
            }
          }
        }
      }

      if (event.request?.query_string) {
        const qs = event.request.query_string;
        if (typeof qs === 'string') {
          event.request.query_string = scrub(qs);
        }
      }
      if (event.request?.url) {
        event.request.url = scrub(event.request.url);
      }

      delete event.user;

      if (event.contexts) {
        delete event.contexts.culture;
      }

      return event;
    },
  });
}
