/**
 * Shared data formatters used by both the web preview and DOCX export.
 */

import type { CvFormData } from './cvFormSchema.ts';

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export function formatDateRange(start?: string, end?: string): string {
  return [start, end].filter(Boolean).join(' \u2013 ');
}

export function formatEntryMeta(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(' | ');
}

export function formatLinksLine(links: CvFormData['personalInfo']['links']): string {
  return links.map((l) => stripProtocol(l.url)).join(' | ');
}

// ---------------------------------------------------------------------------
// Reverse-chronological sort by start date
// ---------------------------------------------------------------------------

const MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

/**
 * Best-effort parser for free-text date strings like "Mar 2021", "2012",
 * "Present", "Dec 2022". Returns a numeric value for comparison where
 * higher = more recent. Returns `Infinity` for "present"/"current"/empty
 * end-dates, and `NaN` when parsing fails (preserves original order).
 */
export function parseDateToSortKey(dateStr: string | undefined): number {
  if (!dateStr) return Infinity;

  const trimmed = dateStr.trim().toLowerCase();
  if (trimmed === 'present' || trimmed === 'current' || trimmed === 'now' || trimmed === '') {
    return Infinity;
  }

  // "2012" — year only
  const yearOnly = /^(\d{4})$/.exec(trimmed);
  if (yearOnly) return Number(yearOnly[1]) * 12;

  // "Mar 2021", "March 2021"
  const monthYear = /^([a-z]+)\s+(\d{4})$/.exec(trimmed);
  if (monthYear) {
    const month = MONTHS[monthYear[1]];
    const year = Number(monthYear[2]);
    if (month !== undefined) return year * 12 + month;
  }

  // "2021-03", "2021/03"
  const isoLike = /^(\d{4})[-/](\d{1,2})$/.exec(trimmed);
  if (isoLike) return Number(isoLike[1]) * 12 + (Number(isoLike[2]) - 1);

  return NaN;
}

/**
 * Sorts entries by start date descending (most recent first).
 * Entries with unparseable dates keep their relative order.
 */
export function sortByStartDateDesc<T extends { startDate?: string; startYear?: string }>(
  entries: T[],
): T[] {
  const keyed = entries.map((entry, originalIndex) => ({
    entry,
    originalIndex,
    key: parseDateToSortKey(entry.startDate ?? entry.startYear),
  }));

  keyed.sort((a, b) => {
    const aValid = !Number.isNaN(a.key);
    const bValid = !Number.isNaN(b.key);
    if (aValid && bValid) return b.key - a.key;
    if (aValid) return -1;
    if (bValid) return 1;
    return a.originalIndex - b.originalIndex;
  });

  return keyed.map((k) => k.entry);
}

/**
 * Returns a new CvFormData with experience, education, and others sorted
 * by start date descending. Does not mutate the input.
 */
export function sortCvSections(data: CvFormData): CvFormData {
  return {
    ...data,
    experience: sortByStartDateDesc(data.experience),
    education: sortByStartDateDesc(data.education),
    others: sortByStartDateDesc(data.others),
    skills: data.skills,
  };
}
