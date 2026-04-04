import { describe, expect, it } from 'vitest';

import { parseInlineSegments } from './CvDocxDocument.ts';

describe('parseInlineSegments', () => {
  it('returns plain text as a single segment', () => {
    expect(parseInlineSegments('hello world')).toEqual([{ text: 'hello world' }]);
  });

  it('returns empty string as a single segment', () => {
    expect(parseInlineSegments('')).toEqual([{ text: '' }]);
  });

  it('parses **bold** text', () => {
    expect(parseInlineSegments('a **bold** word')).toEqual([
      { text: 'a ' },
      { text: 'bold', bold: true, italic: false },
      { text: ' word' },
    ]);
  });

  it('parses *italic* text', () => {
    expect(parseInlineSegments('an *italic* word')).toEqual([
      { text: 'an ' },
      { text: 'italic', bold: false, italic: true },
      { text: ' word' },
    ]);
  });

  it('parses ***bold+italic*** text', () => {
    expect(parseInlineSegments('a ***both*** word')).toEqual([
      { text: 'a ' },
      { text: 'both', bold: true, italic: true },
      { text: ' word' },
    ]);
  });

  it('parses multiple inline segments', () => {
    expect(parseInlineSegments('**bold** then *italic*')).toEqual([
      { text: 'bold', bold: true, italic: false },
      { text: ' then ' },
      { text: 'italic', bold: false, italic: true },
    ]);
  });

  it('passes through unmatched asterisks as plain text', () => {
    expect(parseInlineSegments('a * lone asterisk')).toEqual([{ text: 'a * lone asterisk' }]);
  });
});
