/**
 * Build-time prerender: generates static HTML for `/` and `/guide` so crawlers
 * see real content without waiting for JS. Runs after the client build.
 *
 * 1. `vite build --ssr src/prerender.tsx` produces a Node-compatible SSR bundle.
 * 2. We import `renderRoute` from that bundle.
 * 3. For each route, inject the rendered HTML into the existing `dist/` HTML.
 * 4. Clean up the SSR bundle (not needed at runtime).
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { replaceRootInner } from './html-root.ts';
import { loadMarketingPrerenderUrls, marketingHtmlPaths } from './prerenderRoutes.ts';

const root = process.cwd();
const dist = join(root, 'dist');
const ssrOutDir = join(dist, '.ssr');

/** Must match deployed origin (see index.html, public/sitemap.xml). */
const SITE_ORIGIN = 'https://batbrain9392.github.io/cv-builder';

const ROUTES = marketingHtmlPaths(dist, loadMarketingPrerenderUrls(root));

function patchGuideHead(html: string): string {
  let out = html;

  const replacements: [RegExp, string][] = [
    [
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      '<meta name="description" content="Step-by-step BioBot guide: start from sample data, import a CV, optional Gemini AI tailoring, live preview, and ATS-friendly Word export." />',
    ],
    [/<title>[^<]*<\/title>/, '<title>Guide — BioBot</title>'],
    [
      /<link rel="canonical" href="[^"]*"\s*\/>/,
      `<link rel="canonical" href="${SITE_ORIGIN}/guide" />`,
    ],
    [
      /<meta property="og:url" content="[^"]*"\s*\/>/,
      `<meta property="og:url" content="${SITE_ORIGIN}/guide" />`,
    ],
    [
      /<meta property="og:title" content="[^"]*"\s*\/>/,
      '<meta property="og:title" content="BioBot — How to use the CV builder" />',
    ],
    [
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
      '<meta property="og:description" content="Step-by-step: import your CV, optional AI tailoring to job descriptions, live preview, and ATS-friendly Word export — all in your browser." />',
    ],
    [
      /<meta name="twitter:title" content="[^"]*"\s*\/>/,
      '<meta name="twitter:title" content="BioBot — How to use the CV builder" />',
    ],
    [
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
      '<meta name="twitter:description" content="Step-by-step guide: import, AI tailoring, export. Runs in your browser." />',
    ],
  ];

  for (const [re, replacement] of replacements) {
    const next = out.replace(re, replacement);
    if (next === out) {
      console.error('prerender: patchGuideHead failed — pattern not found:', String(re));
      process.exit(1);
    }
    out = next;
  }

  return out;
}

console.log('prerender: building SSR bundle…');
execSync(`npx vite build --ssr src/prerender.tsx --outDir dist/.ssr --config vite.config.ssr.ts`, {
  cwd: root,
  stdio: 'inherit',
});

const ssrEntry = join(ssrOutDir, 'prerender.js');
if (!existsSync(ssrEntry)) {
  console.error('prerender: SSR bundle not found at', ssrEntry);
  process.exit(1);
}

const shell = readFileSync(join(dist, 'index.html'), 'utf-8');

try {
  replaceRootInner(shell, '__probe__');
} catch (e) {
  console.error('prerender: shell HTML has no parsable #root:', e);
  process.exit(1);
}

const ssrMod: unknown = await import(ssrEntry);
if (typeof ssrMod !== 'object' || ssrMod === null || !('renderRoute' in ssrMod)) {
  console.error('prerender: renderRoute missing from SSR bundle');
  process.exit(1);
}
const renderRouteFn = Reflect.get(ssrMod, 'renderRoute');
if (typeof renderRouteFn !== 'function') {
  console.error('prerender: renderRoute is not a function');
  process.exit(1);
}

for (const { url, htmlPath } of ROUTES) {
  const dir = join(htmlPath, '..');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const renderedUnknown = Reflect.apply(renderRouteFn, ssrMod, [url]);
  if (typeof renderedUnknown !== 'string') {
    console.error('prerender: renderRoute must return a string');
    process.exit(1);
  }
  const rendered = renderedUnknown;
  let html: string;
  try {
    html = replaceRootInner(shell, rendered);
  } catch (e) {
    console.error(`prerender: failed to inject ${url}:`, e);
    process.exit(1);
  }

  if (url === '/guide') {
    html = patchGuideHead(html);
  }

  writeFileSync(htmlPath, html, 'utf-8');
  console.log(`prerender: wrote ${url} → ${htmlPath}`);
}

rmSync(ssrOutDir, { recursive: true, force: true });
console.log('prerender: done (SSR bundle cleaned up)');
