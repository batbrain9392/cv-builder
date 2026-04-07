import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function loadMarketingPrerenderUrls(root: string): string[] {
  const p = join(root, 'src', 'marketingPrerenderUrls.json');
  const parsed: unknown = JSON.parse(readFileSync(p, 'utf-8'));
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error(`prerender: invalid urls in ${p}`);
  }
  const urlsCandidate = Reflect.get(parsed, 'urls');
  if (!Array.isArray(urlsCandidate) || urlsCandidate.length === 0) {
    throw new Error(`prerender: invalid urls in ${p}`);
  }
  const urls: string[] = [];
  for (const u of urlsCandidate) {
    if (typeof u !== 'string' || !u.startsWith('/')) {
      throw new Error(`prerender: invalid url entry in ${p}: ${String(u)}`);
    }
    urls.push(u);
  }
  return urls;
}

export function marketingHtmlPaths(
  dist: string,
  urls: string[],
): { url: string; htmlPath: string }[] {
  return urls.map((url) => ({
    url,
    htmlPath: url === '/' ? join(dist, 'index.html') : join(dist, url.slice(1), 'index.html'),
  }));
}
