import { describe, it, expect } from 'vitest';
import { formatDateRange, formatEntryMeta, formatLinksLine } from './cvFormatters';

describe('formatDateRange', () => {
  it('joins start and end with en dash', () => {
    expect(formatDateRange('Dec 2022', 'Present')).toBe('Dec 2022 – Present');
  });

  it('returns start alone when end is undefined', () => {
    expect(formatDateRange('Dec 2022', undefined)).toBe('Dec 2022');
  });

  it('returns end alone when start is undefined', () => {
    expect(formatDateRange(undefined, 'Present')).toBe('Present');
  });

  it('returns empty string when both are undefined', () => {
    expect(formatDateRange(undefined, undefined)).toBe('');
  });
});

describe('formatEntryMeta', () => {
  it('joins multiple parts with pipe', () => {
    expect(formatEntryMeta('Dec 2022 – Present', 'Dublin')).toBe('Dec 2022 – Present | Dublin');
  });

  it('skips undefined parts', () => {
    expect(formatEntryMeta(undefined, 'Dublin')).toBe('Dublin');
  });

  it('returns empty string when all parts are undefined', () => {
    expect(formatEntryMeta(undefined, undefined)).toBe('');
  });

  it('handles a single part', () => {
    expect(formatEntryMeta('Dublin')).toBe('Dublin');
  });

  it('handles three parts', () => {
    expect(formatEntryMeta('a@b.com', '+353 89 000 0000', 'Dublin')).toBe(
      'a@b.com | +353 89 000 0000 | Dublin',
    );
  });
});

describe('formatLinksLine', () => {
  it('returns pipe-separated stripped URLs', () => {
    const links = [
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/user/' },
      { label: 'GitHub', url: 'https://github.com/user' },
    ];
    expect(formatLinksLine(links)).toBe('www.linkedin.com/in/user | github.com/user');
  });

  it('returns empty string for no links', () => {
    expect(formatLinksLine([])).toBe('');
  });

  it('strips trailing slash', () => {
    const links = [{ label: 'Site', url: 'https://example.com/' }];
    expect(formatLinksLine(links)).toBe('example.com');
  });
});
