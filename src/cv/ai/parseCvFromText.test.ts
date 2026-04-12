import { describe, expect, it, vi } from 'vitest';
import { ZodError, type core } from 'zod';

import { DEFAULT_HIGHLIGHTS_PROMPT } from '../cvFormSchema.ts';

const mockGenerateContent = vi.hoisted(() => vi.fn());

vi.mock('./geminiClient.ts', () => ({
  generateContent: mockGenerateContent,
}));

import { buildIssuesFromZodError, parseCvFromText, splitCamelCase } from './parseCvFromText.ts';

const VALID_CV_JSON = {
  personalInfo: {
    name: 'Jane Doe',
    title: 'Engineer',
    location: 'Dublin',
    email: 'jane@example.com',
    phone: '+1 555 000',
    links: [],
  },
  summary: 'A professional summary of at least ten characters.',
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
      items: ['Graduated with honours'],
    },
  ],
  skills: ['Core: React'],
  others: [],
};

describe('parseCvFromText', () => {
  it('happy path — valid JSON passes strict schema', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(VALID_CV_JSON),
    });

    const result = await parseCvFromText('key', 'raw cv text');

    expect(result.issues).toEqual([]);
    expect(result.data.personalInfo.name).toBe('Jane Doe');
    expect(result.data.experience[0].role).toBe('Engineer');
    expect(result.data.experience[0].aiHighlightsPrompt).toBe(DEFAULT_HIGHLIGHTS_PROMPT);
  });

  it('relaxed fallback — empty required fields produce issues but still return data', async () => {
    const partialCv = {
      ...VALID_CV_JSON,
      experience: [
        {
          ...VALID_CV_JSON.experience[0],
          role: '',
        },
      ],
    };
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(partialCv),
    });

    const result = await parseCvFromText('key', 'raw cv text');

    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues.some((i) => i.includes('role') || i.includes('Role'))).toBe(true);
    expect(result.data.personalInfo.name).toBe('Jane Doe');
    expect(result.data.experience[0].role).toBe('');
  });

  it('strict path accepts empty optional fields', async () => {
    const minimalCv = {
      ...VALID_CV_JSON,
      summary: '',
      experience: [{ ...VALID_CV_JSON.experience[0], location: '', items: [] }],
    };
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(minimalCv),
    });

    const result = await parseCvFromText('key', 'raw cv text');

    expect(result.issues).toEqual([]);
    expect(result.data.summary).toBe('');
    expect(result.data.experience[0].location).toBe('');
  });

  it('throws on invalid JSON from Gemini', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: 'not valid json {{{',
    });

    await expect(parseCvFromText('key', 'text')).rejects.toThrow(
      'Gemini returned invalid JSON. Please try again.',
    );
  });

  it('throws on null response', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: 'null' });

    await expect(parseCvFromText('key', 'text')).rejects.toThrow(
      'Gemini returned unexpected data. Please try again.',
    );
  });

  it('throws on numeric response', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: '42' });

    await expect(parseCvFromText('key', 'text')).rejects.toThrow(
      'Gemini returned unexpected data. Please try again.',
    );
  });

  it('throws on empty response', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: '' });

    await expect(parseCvFromText('key', 'text')).rejects.toThrow(
      'Gemini returned an empty response.',
    );
  });

  it('throws when relaxed schema also fails', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({ unexpected: 'structure' }),
    });

    await expect(parseCvFromText('key', 'text')).rejects.toThrow(
      'Could not parse the CV data. Please check the text and try again.',
    );
  });
});

function makeIssue(path: (string | number)[], message = 'Required'): core.$ZodIssue {
  return { code: 'custom', path, message } as core.$ZodIssueCustom;
}

describe('splitCamelCase', () => {
  it('inserts space before uppercase letters', () => {
    expect(splitCamelCase('startDate')).toBe('start date');
  });

  it('handles consecutive uppercase correctly', () => {
    expect(splitCamelCase('institutionUrl')).toBe('institution url');
  });

  it('returns single-word strings unchanged', () => {
    expect(splitCamelCase('role')).toBe('role');
  });

  it('lowercases the entire result', () => {
    expect(splitCamelCase('tagsLabel')).toBe('tags label');
  });
});

describe('buildIssuesFromZodError', () => {
  it('single section, single field error', () => {
    const error = new ZodError([makeIssue(['personalInfo', 'name'])]);
    expect(buildIssuesFromZodError(error)).toEqual(['Personal Info — missing or invalid: name.']);
  });

  it('array section with indexed entry and multiple fields', () => {
    const error = new ZodError([
      makeIssue(['experience', 0, 'role']),
      makeIssue(['experience', 0, 'company']),
    ]);
    expect(buildIssuesFromZodError(error)).toEqual([
      'Experience entry #1 — missing or invalid: role, company.',
    ]);
  });

  it('groups separate entries independently', () => {
    const error = new ZodError([
      makeIssue(['experience', 0, 'role']),
      makeIssue(['experience', 1, 'startDate']),
    ]);
    const issues = buildIssuesFromZodError(error);
    expect(issues).toHaveLength(2);
    expect(issues[0]).toBe('Experience entry #1 — missing or invalid: role.');
    expect(issues[1]).toBe('Experience entry #2 — missing or invalid: start date.');
  });

  it('uses splitCamelCase fallback for unknown section keys', () => {
    const error = new ZodError([makeIssue(['workExperience', 'role'])]);
    expect(buildIssuesFromZodError(error)).toEqual(['work experience — missing or invalid: role.']);
  });

  it('uses known SECTION_LABELS for mapped sections', () => {
    const error = new ZodError([makeIssue(['others', 0, 'role'])]);
    expect(buildIssuesFromZodError(error)).toEqual(['Other entry #1 — missing or invalid: role.']);
  });

  it('produces "add at least one entry" when group has no field-level issues', () => {
    const error = new ZodError([makeIssue(['skills'])]);
    expect(buildIssuesFromZodError(error)).toEqual([
      'Skills — add at least one entry to this section.',
    ]);
  });

  it('deduplicates repeated field errors within the same group', () => {
    const error = new ZodError([
      makeIssue(['experience', 0, 'role'], 'too short'),
      makeIssue(['experience', 0, 'role'], 'required'),
    ]);
    expect(buildIssuesFromZodError(error)).toEqual([
      'Experience entry #1 — missing or invalid: role.',
    ]);
  });

  it('skips issues with empty path', () => {
    const error = new ZodError([makeIssue([]), makeIssue(['personalInfo', 'email'])]);
    expect(buildIssuesFromZodError(error)).toEqual(['Personal Info — missing or invalid: email.']);
  });
});
