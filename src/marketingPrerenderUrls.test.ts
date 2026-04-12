import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { loadMarketingPrerenderUrls, marketingHtmlPaths } from '../scripts/prerenderRoutes.ts';
import { MARKETING_PRERENDER_URLS, MARKETING_ROUTE_PATHS } from './marketingPrerenderUrls.ts';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');

describe('marketingPrerenderUrls', () => {
  it('exported URLs match marketingPrerenderUrls.json on disk', () => {
    const raw = JSON.parse(readFileSync(join(root, 'src', 'marketingPrerenderUrls.json'), 'utf-8'));
    expect(MARKETING_PRERENDER_URLS).toEqual(raw.urls);
  });

  it('prerender URLs cover exactly the known marketing routes', () => {
    // If you add a route to marketingRouteElements.tsx, also update MARKETING_ROUTE_PATHS
    // in marketingPrerenderUrls.ts and add its URL to marketingPrerenderUrls.json.
    expect([...MARKETING_PRERENDER_URLS].sort()).toEqual([...MARKETING_ROUTE_PATHS].sort());
  });

  it('postbuild loader reads the same list as the app bundle', () => {
    expect(loadMarketingPrerenderUrls(root)).toEqual([...MARKETING_PRERENDER_URLS]);
  });

  it('maps prerender URLs to dist HTML paths', () => {
    const dist = join(root, 'dist');
    expect(marketingHtmlPaths(dist, ['/', '/guide'])).toEqual([
      { url: '/', htmlPath: join(dist, 'index.html') },
      { url: '/guide', htmlPath: join(dist, 'guide', 'index.html') },
    ]);
  });
});
