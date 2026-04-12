import type { CvFormData } from '@/cv/cvFormSchema.ts';

import { cvFormSchema } from '@/cv/cvFormSchema.ts';
import { AI_FIELD_DEFAULTS, backfillEntryPrompts } from '@/cv/loadDefaultValues.ts';

const STORAGE_KEY = 'biobot-cv-data';

export function saveCv(data: CvFormData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded or private browsing — silently fail
  }
}

export function loadCv(): CvFormData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: Record<string, unknown> = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    // Merge AI field defaults before parsing so that saves from older app versions
    // (which may be missing newly-added fields like aiCoverLetterPrompt) still load
    // correctly rather than failing the schema parse and silently falling back to
    // starter data.
    const withDefaults = { ...AI_FIELD_DEFAULTS, ...backfillEntryPrompts(parsed) };
    const result = cvFormSchema.safeParse(withDefaults);
    if (result.success) return result.data;
    console.warn(
      '[cvStorage] Saved CV failed schema validation — data may be from an older version:',
      result.error.issues,
    );
    return null;
  } catch {
    return null;
  }
}

export function hasUserCv(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function clearCv(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // private browsing — silently fail
  }
}
