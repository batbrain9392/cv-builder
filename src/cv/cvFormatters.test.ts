import { describe, it, expect } from 'vitest';
import {
  formatDateRange,
  formatEntryMeta,
  formatLinksLine,
  parseDateToSortKey,
  sortByStartDateDesc,
} from './cvFormatters';

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

describe('parseDateToSortKey', () => {
  it('parses abbreviated month + year', () => {
    expect(parseDateToSortKey('Mar 2021')).toBe(2021 * 12 + 2);
  });

  it('parses full month name + year', () => {
    expect(parseDateToSortKey('January 2020')).toBe(2020 * 12 + 0);
  });

  it('parses year-only string', () => {
    expect(parseDateToSortKey('2012')).toBe(2012 * 12);
  });

  it('parses ISO-like date (YYYY-MM)', () => {
    expect(parseDateToSortKey('2023-06')).toBe(2023 * 12 + 5);
  });

  it('returns Infinity for "Present"', () => {
    expect(parseDateToSortKey('Present')).toBe(Infinity);
  });

  it('returns Infinity for undefined', () => {
    expect(parseDateToSortKey(undefined)).toBe(Infinity);
  });

  it('returns Infinity for empty string', () => {
    expect(parseDateToSortKey('')).toBe(Infinity);
  });

  it('returns NaN for unparseable input', () => {
    expect(parseDateToSortKey('Q3 2021')).toBeNaN();
  });
});

describe('sortByStartDateDesc', () => {
  it('sorts experience entries most-recent first', () => {
    const entries = [
      { startDate: 'Jan 2018', role: 'old' },
      { startDate: 'Mar 2021', role: 'new' },
      { startDate: 'Jun 2019', role: 'mid' },
    ];
    const sorted = sortByStartDateDesc(entries);
    expect(sorted.map((e) => e.role)).toEqual(['new', 'mid', 'old']);
  });

  it('sorts education entries by startYear descending', () => {
    const entries = [
      { startYear: '2008', degree: 'old' },
      { startYear: '2016', degree: 'new' },
      { startYear: '2012', degree: 'mid' },
    ];
    const sorted = sortByStartDateDesc(entries);
    expect(sorted.map((e) => e.degree)).toEqual(['new', 'mid', 'old']);
  });

  it('keeps unparseable entries in original relative order at the end', () => {
    const entries = [
      { startDate: 'Q3 2021', role: 'unparseable' },
      { startDate: 'Mar 2021', role: 'parseable' },
      { startDate: 'whenever', role: 'also-unparseable' },
    ];
    const sorted = sortByStartDateDesc(entries);
    expect(sorted.map((e) => e.role)).toEqual(['parseable', 'unparseable', 'also-unparseable']);
  });

  it('returns empty array for empty input', () => {
    expect(sortByStartDateDesc([])).toEqual([]);
  });

  it('handles single entry', () => {
    const entries = [{ startDate: 'Mar 2021', role: 'only' }];
    expect(sortByStartDateDesc(entries)).toEqual(entries);
  });

  it('is stable for entries with the same date', () => {
    const entries = [
      { startDate: 'Mar 2021', role: 'first' },
      { startDate: 'Mar 2021', role: 'second' },
    ];
    const sorted = sortByStartDateDesc(entries);
    expect(sorted.map((e) => e.role)).toEqual(['first', 'second']);
  });
});
