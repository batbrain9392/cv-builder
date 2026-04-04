import { Marked } from 'marked';

const SAFE_PROTOCOL = /^https?:\/\//i;

const renderer = {
  html(token: { text: string }) {
    return token.text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },
  link(token: { href: string; text: string }) {
    if (!SAFE_PROTOCOL.test(token.href)) {
      return token.text;
    }
    return `<a href="${token.href}">${token.text}</a>`;
  },
};

const md = new Marked({ renderer });

export function parseInlineMarkdown(text: string): string {
  return String(md.parseInline(text));
}

export function parseMarkdown(text: string): string {
  return String(md.parse(text));
}
