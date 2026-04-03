import { Marked } from 'marked';

const escapeHtml = {
  html(token: { text: string }) {
    return token.text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },
};

const md = new Marked({ renderer: escapeHtml });

export function parseInlineMarkdown(text: string): string {
  return String(md.parseInline(text));
}

export function parseMarkdown(text: string): string {
  return String(md.parse(text));
}
