/**
 * Shared data formatters used by both the web preview and DOCX export.
 */

import type { CvFormData } from './cvFormSchema.ts';

import { stripProtocol } from './cvConstants.ts';

export function formatDateRange(start?: string, end?: string): string {
  return [start, end].filter(Boolean).join(' \u2013 ');
}

export function formatEntryMeta(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(' | ');
}

export function formatLinksLine(links: CvFormData['personalInfo']['links']): string {
  return links.map((l) => stripProtocol(l.url)).join(' | ');
}
