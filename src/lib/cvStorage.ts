import type { CvFormData } from '@/cv/cvFormSchema.ts';

import { cvFormSchema } from '@/cv/cvFormSchema.ts';
import { backfillEntryPrompts } from '@/cv/loadDefaultValues.ts';

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
    return cvFormSchema.parse(backfillEntryPrompts(parsed));
  } catch {
    return null;
  }
}

export function clearCv(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // private browsing — silently fail
  }
}
