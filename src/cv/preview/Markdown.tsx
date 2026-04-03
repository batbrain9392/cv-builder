import { parseInlineMarkdown, parseMarkdown } from './parseMarkdown.ts';

interface InlineMarkdownProps {
  text: string;
}

export function InlineMarkdown({ text }: InlineMarkdownProps) {
  const html = parseInlineMarkdown(text);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

interface BlockMarkdownProps {
  text: string;
  className?: string;
}

export function BlockMarkdown({ text, className }: BlockMarkdownProps) {
  const html = parseMarkdown(text);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
