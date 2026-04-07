/**
 * GitHub Pages has no SPA fallback. Unknown paths must serve the same assets
 * as index.html but with an **empty** `#root` so deep links (e.g. /app) do not
 * ship the prerendered landing markup. See docs/github-pages-spa-routing.md.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { emptyRootInner } from './html-root.ts';

const dist = join(process.cwd(), 'dist');
const indexHtml = join(dist, 'index.html');
const notFoundHtml = join(dist, '404.html');

if (!existsSync(indexHtml)) {
  console.error('copy-github-pages-404: dist/index.html missing — run vite build first');
  process.exit(1);
}

const prerendered = readFileSync(indexHtml, 'utf-8');
let shell404: string;
try {
  shell404 = emptyRootInner(prerendered);
} catch (e) {
  console.error('copy-github-pages-404: failed to empty #root:', e);
  process.exit(1);
}

writeFileSync(notFoundHtml, shell404, 'utf-8');
console.log('copy-github-pages-404: wrote dist/404.html (empty #root, same assets as index)');
