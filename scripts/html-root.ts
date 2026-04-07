/**
 * Find `<div id="root" …>` … `</div>` (balanced) and replace inner HTML.
 * Used by prerender and GitHub Pages 404 shell generation.
 */
export function replaceRootInner(html: string, inner: string): string {
  const openRe = /<div\s+id=["']root["'][^>]*>/;
  const m = html.match(openRe);
  if (!m || m.index === undefined) {
    throw new Error('replaceRootInner: no <div id="root"> found');
  }
  const openEnd = m.index + m[0].length;
  let depth = 1;
  let i = openEnd;
  while (i < html.length && depth > 0) {
    const nextOpen = html.indexOf('<div', i);
    const nextClose = html.indexOf('</div>', i);
    if (nextClose === -1) {
      throw new Error('replaceRootInner: no closing </div> for #root');
    }
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      i = nextOpen + 4;
    } else {
      depth--;
      if (depth === 0) {
        return html.slice(0, openEnd) + inner + html.slice(nextClose);
      }
      i = nextClose + 6;
    }
  }
  throw new Error('replaceRootInner: failed to parse #root');
}

export function emptyRootInner(html: string): string {
  return replaceRootInner(html, '');
}
