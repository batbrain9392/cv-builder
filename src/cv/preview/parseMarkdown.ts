import { Marked } from 'marked';

const SAFE_PROTOCOL = /^https?:\/\//i;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const renderer = {
  html(token: { text: string }) {
    return escapeHtml(token.text);
  },
  link(token: { href: string; text: string }) {
    if (!SAFE_PROTOCOL.test(token.href)) {
      return escapeHtml(token.text);
    }
    return `<a href="${escapeHtml(token.href)}">${escapeHtml(token.text)}</a>`;
  },
};

const md = new Marked({ renderer });

export function parseInlineMarkdown(text: string): string {
  return String(md.parseInline(text));
}

export function parseMarkdown(text: string): string {
  return String(md.parse(text));
}
