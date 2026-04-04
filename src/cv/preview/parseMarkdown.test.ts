import { describe, it, expect } from 'vitest';

import { parseInlineMarkdown, parseMarkdown } from './parseMarkdown';

describe('parseInlineMarkdown', () => {
  it('renders bold', () => {
    expect(parseInlineMarkdown('some **bold** text')).toBe('some <strong>bold</strong> text');
  });

  it('renders italic', () => {
    expect(parseInlineMarkdown('some *italic* text')).toBe('some <em>italic</em> text');
  });

  it('renders links', () => {
    expect(parseInlineMarkdown('[click here](https://example.com)')).toBe(
      '<a href="https://example.com">click here</a>',
    );
  });

  it('renders nested bold and italic', () => {
    expect(parseInlineMarkdown('***bold italic***')).toBe('<em><strong>bold italic</strong></em>');
  });

  it('escapes raw HTML tags', () => {
    expect(parseInlineMarkdown('<script>alert("xss")</script>')).toContain('&lt;script&gt;');
    expect(parseInlineMarkdown('<script>alert("xss")</script>')).toContain('&lt;/script&gt;');
    expect(parseInlineMarkdown('<script>alert("xss")</script>')).not.toContain('<script>');
  });

  it('passes plain text through unchanged', () => {
    expect(parseInlineMarkdown('just plain text')).toBe('just plain text');
  });

  it('renders inline code', () => {
    expect(parseInlineMarkdown('use `npm install`')).toBe('use <code>npm install</code>');
  });

  it('strips javascript: links', () => {
    const result = parseInlineMarkdown('[click](javascript:alert(1))');
    expect(result).not.toContain('javascript:');
    expect(result).toContain('click');
  });
});

describe('parseMarkdown', () => {
  it('renders a paragraph', () => {
    expect(parseMarkdown('hello world')).toBe('<p>hello world</p>\n');
  });

  it('renders an unordered list', () => {
    const input = '- one\n- two\n- three';
    const html = parseMarkdown(input);
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>one</li>');
    expect(html).toContain('<li>two</li>');
    expect(html).toContain('<li>three</li>');
  });

  it('renders bold inside list items', () => {
    const html = parseMarkdown('- **bold** item');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<li>');
  });

  it('escapes raw HTML tags', () => {
    const html = parseMarkdown('<script>alert("xss")</script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('escapes quotes in link href to prevent attribute breakout', () => {
    const html = parseInlineMarkdown('[click](https://evil.com" onmouseover="alert(1))');
    expect(html).not.toMatch(/href="[^"]*onmouseover/);
  });
});
