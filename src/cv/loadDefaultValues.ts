import { loadCv } from '@/lib/cvStorage.ts';

import type { CvFormData } from './cvFormSchema.ts';

import {
  cvFormSchema,
  DEFAULT_COVER_LETTER_PROMPT,
  DEFAULT_HIGHLIGHTS_PROMPT,
  DEFAULT_SUMMARY_PROMPT,
} from './cvFormSchema.ts';
import starterCv from './starterCv.json';

export const AI_FIELD_DEFAULTS: Partial<CvFormData> = {
  aiApiKey: '',
  jobDescriptionText: '',
  aiSummaryPrompt: DEFAULT_SUMMARY_PROMPT,
  coverLetterEnabled: false,
  coverLetter: '',
  aiCoverLetterPrompt: DEFAULT_COVER_LETTER_PROMPT,
};

/**
 * Backfill missing aiHighlightsPrompt on experience/education/other entries
 * so prompts survive the export → import round-trip even for older JSON files.
 */
export function backfillEntryPrompts(data: Record<string, unknown>): Record<string, unknown> {
  const patch = (entries: unknown) => {
    if (!Array.isArray(entries)) return entries;
    return entries.map((e) =>
      typeof e === 'object' && e !== null && !('aiHighlightsPrompt' in e)
        ? { ...e, aiHighlightsPrompt: DEFAULT_HIGHLIGHTS_PROMPT }
        : e,
    );
  };
  return {
    ...data,
    experience: patch(data.experience),
    education: patch(data.education),
    others: patch(data.others),
  };
}

export const EMPTY_DEFAULTS: CvFormData = {
  aiApiKey: '',
  jobDescriptionText: '',
  aiSummaryPrompt: DEFAULT_SUMMARY_PROMPT,
  coverLetterEnabled: false,
  coverLetter: '',
  aiCoverLetterPrompt: DEFAULT_COVER_LETTER_PROMPT,
  personalInfo: {
    name: '',
    title: '',
    location: '',
    email: '',
    phone: '',
    links: [],
  },
  summary: '',
  experience: [],
  education: [],
  others: [],
};

export function loadDefaultValues(): CvFormData {
  const saved = loadCv();
  if (saved) return saved;

  try {
    return cvFormSchema.parse(backfillEntryPrompts({ ...AI_FIELD_DEFAULTS, ...starterCv }));
  } catch (err) {
    console.warn('Failed to parse starterCv.json, falling back to empty defaults:', err);
    return EMPTY_DEFAULTS;
  }
}
