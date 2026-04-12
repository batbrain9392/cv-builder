import raw from './marketingPrerenderUrls.json';

function assertMarketingUrls(value: unknown): asserts value is string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('marketingPrerenderUrls.json: urls must be a non-empty array');
  }
  for (const u of value) {
    if (typeof u !== 'string' || !u.startsWith('/')) {
      throw new Error('marketingPrerenderUrls.json: each url must be a string starting with /');
    }
  }
}

assertMarketingUrls(raw.urls);

/** Locations passed to `StaticRouter` in prerender; must match routes in `marketingRouteElements.tsx`. */
export const MARKETING_PRERENDER_URLS: readonly string[] = raw.urls;

/**
 * Canonical list of marketing route paths. Keep this in sync with the
 * `<Route>` entries in `marketingRouteElements.tsx`.
 * The test in `marketingPrerenderUrls.test.ts` asserts that
 * `MARKETING_PRERENDER_URLS` covers exactly these paths.
 */
export const MARKETING_ROUTE_PATHS = ['/', '/guide'] as const;
