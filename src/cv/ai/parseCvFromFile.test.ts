/** @vitest-environment happy-dom */

import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_HIGHLIGHTS_PROMPT } from '../cvFormSchema.ts';

const { mockGenerateContent, mockParseCvFromText } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
  mockParseCvFromText: vi.fn(),
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
}));

vi.mock('./parseCvFromText.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./parseCvFromText.ts')>();
  return {
    ...actual,
    parseCvFromText: mockParseCvFromText,
  };
});

import { parseCvFromFile } from './parseCvFromFile.ts';

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

describe('parseCvFromFile', () => {
  it('rejects files larger than 10 MB', async () => {
    const file = new File(['x'], 'cv.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 + 1 });

    await expect(parseCvFromFile('key', file)).rejects.toThrow(
      'File exceeds maximum size of 10 MB.',
    );
  });

  it('rejects unsupported MIME type', async () => {
    const file = new File(['x'], 'a.bin', { type: 'application/octet-stream' });
    await expect(parseCvFromFile('key', file)).rejects.toThrow('Unsupported file type.');
  });

  it('infers PDF MIME from extension when type is empty', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(VALID_CV_JSON),
    });

    const file = new File(['%PDF-1.4'], 'resume.pdf', { type: '' });
    const result = await parseCvFromFile('key', file);

    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gemini-2.5-flash',
        contents: [
          expect.objectContaining({
            parts: expect.arrayContaining([
              { inlineData: { data: expect.any(String), mimeType: 'application/pdf' } },
              expect.objectContaining({ text: expect.stringContaining('Parse this CV') }),
            ]),
          }),
        ],
      }),
    );
    expect(result.issues).toEqual([]);
    expect(result.data.experience[0].aiHighlightsPrompt).toBe(DEFAULT_HIGHLIGHTS_PROMPT);
  });

  it('routes text/plain through parseCvFromText', async () => {
    mockParseCvFromText.mockResolvedValueOnce({
      data: {} as import('../cvFormSchema.ts').CvFormData,
      issues: [],
    });

    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    await parseCvFromFile('key', file);

    expect(mockParseCvFromText).toHaveBeenCalledWith('key', 'hello');
  });
});
