/** @vitest-environment happy-dom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_HIGHLIGHTS_PROMPT } from '@/cv/cvFormSchema.ts';
import type { CvFormData } from '@/cv/cvFormSchema.ts';
import { AI_FIELD_DEFAULTS } from '@/cv/loadDefaultValues.ts';

import { clearCv, hasUserCv, loadCv, saveCv } from './cvStorage.ts';

const VALID_CV: CvFormData = {
  ...(AI_FIELD_DEFAULTS as CvFormData),
  personalInfo: {
    name: 'Jane Doe',
    title: 'Engineer',
    location: 'Dublin',
    email: 'jane@example.com',
    phone: '+1 555 000',
    links: [],
  },
  summary: 'A summary.',
  skills: ['Core: React'],
  experience: [
    {
      role: 'Engineer',
      company: 'Acme',
      url: '',
      startDate: 'Jan 2020',
      endDate: 'Present',
      location: 'Dublin',
      items: ['Built things'],
      tagsLabel: 'Tech',
      tags: ['React'],
      aiHighlightsPrompt: DEFAULT_HIGHLIGHTS_PROMPT,
    },
  ],
  education: [
    {
      degree: 'BSc CS',
      institution: 'University',
      institutionUrl: '',
      startYear: '2016',
      endYear: '2020',
      location: 'Dublin',
      items: ['Graduated'],
      aiHighlightsPrompt: DEFAULT_HIGHLIGHTS_PROMPT,
    },
  ],
  others: [],
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('saveCv / loadCv round-trip', () => {
  it('saves and reloads a valid CV', () => {
    saveCv(VALID_CV);
    const loaded = loadCv();
    expect(loaded?.personalInfo.name).toBe('Jane Doe');
    expect(loaded?.experience[0].role).toBe('Engineer');
  });

  it('returns null when localStorage is empty', () => {
    expect(loadCv()).toBeNull();
  });
});

describe('loadCv — backward-compatibility backfill', () => {
  it('loads a CV saved without aiCoverLetterPrompt (older version)', () => {
    // Simulate a save from before coverLetter fields existed.
    const oldSave = structuredClone(VALID_CV) as Record<string, unknown>;
    delete oldSave.coverLetterEnabled;
    delete oldSave.coverLetter;
    delete oldSave.aiCoverLetterPrompt;
    localStorage.setItem('biobot-cv-data', JSON.stringify(oldSave));

    const loaded = loadCv();
    expect(loaded).not.toBeNull();
    expect(loaded?.personalInfo.name).toBe('Jane Doe');
    // Defaults are backfilled.
    expect(loaded?.coverLetterEnabled).toBe(false);
    expect(loaded?.aiCoverLetterPrompt).toBe(AI_FIELD_DEFAULTS.aiCoverLetterPrompt);
  });

  it('loads a CV saved without aiHighlightsPrompt on entries', () => {
    const oldSave = structuredClone(VALID_CV) as Record<string, unknown>;
    const exp = (oldSave.experience as Array<Record<string, unknown>>)[0];
    delete exp.aiHighlightsPrompt;
    localStorage.setItem('biobot-cv-data', JSON.stringify(oldSave));

    const loaded = loadCv();
    expect(loaded).not.toBeNull();
    expect(loaded?.experience[0].aiHighlightsPrompt).toBe(DEFAULT_HIGHLIGHTS_PROMPT);
  });
});

describe('loadCv — invalid data', () => {
  it('returns null and warns when saved data fails schema validation', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    // Save structurally invalid data (required name missing).
    const bad = { ...VALID_CV, personalInfo: { ...VALID_CV.personalInfo, name: '' } };
    localStorage.setItem('biobot-cv-data', JSON.stringify(bad));

    const loaded = loadCv();
    expect(loaded).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[cvStorage]'), expect.anything());
  });

  it('returns null when localStorage contains non-JSON', () => {
    localStorage.setItem('biobot-cv-data', 'not json {{{');
    expect(loadCv()).toBeNull();
  });
});

describe('hasUserCv', () => {
  it('returns false when nothing is saved', () => {
    expect(hasUserCv()).toBe(false);
  });

  it('returns true after saveCv', () => {
    saveCv(VALID_CV);
    expect(hasUserCv()).toBe(true);
  });
});

describe('clearCv', () => {
  it('removes saved data', () => {
    saveCv(VALID_CV);
    clearCv();
    expect(loadCv()).toBeNull();
    expect(hasUserCv()).toBe(false);
  });
});
