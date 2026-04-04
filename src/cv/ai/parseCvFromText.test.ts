import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_HIGHLIGHTS_PROMPT } from '../cvFormSchema.ts';

const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
}));

import { parseCvFromText } from './parseCvFromText.ts';

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
      bullets: ['Built things'],
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
      bullets: ['Graduated with honours'],
    },
  ],
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
      experience: [{ ...VALID_CV_JSON.experience[0], location: '', bullets: [] }],
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
