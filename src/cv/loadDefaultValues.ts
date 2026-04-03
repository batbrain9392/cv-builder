import type { CvFormData } from './cvFormSchema.ts';

import {
  cvFormSchema,
  DEFAULT_COVER_LETTER_PROMPT,
  DEFAULT_SUMMARY_PROMPT,
} from './cvFormSchema.ts';

export const AI_FIELD_DEFAULTS: Partial<CvFormData> = {
  aiApiKey: '',
  jobDescriptionText: '',
  aiSummaryPrompt: DEFAULT_SUMMARY_PROMPT,
  coverLetterEnabled: false,
  coverLetter: '',
  aiCoverLetterPrompt: DEFAULT_COVER_LETTER_PROMPT,
};

const EMPTY_DEFAULTS: CvFormData = {
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

export async function loadDefaultValues(): Promise<CvFormData> {
  if (import.meta.env.DEV) {
    const seed = await import('../../data/seed.json');
    return cvFormSchema.parse({ ...AI_FIELD_DEFAULTS, ...seed.default });
  }
  return EMPTY_DEFAULTS;
}
