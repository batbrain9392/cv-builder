import { describe, expect, it, vi } from 'vitest';

import type { CvFormData } from '../cvFormSchema.ts';

import { DEFAULT_HIGHLIGHTS_PROMPT, DEFAULT_SUMMARY_PROMPT } from '../cvFormSchema.ts';

const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
}));

import {
  buildCvContext,
  generateHighlights,
  generateSummary,
  splitReasoning,
} from './generateWithAi.ts';

function makeCvData(overrides: Partial<CvFormData> = {}): CvFormData {
  return {
    aiApiKey: 'key',
    jobDescriptionText: 'job desc',
    aiSummaryPrompt: DEFAULT_SUMMARY_PROMPT,
    coverLetterEnabled: false,
    coverLetter: '',
    aiCoverLetterPrompt: '',
    personalInfo: {
      name: 'Jane Doe',
      title: 'Engineer',
      location: 'Dublin',
      email: 'jane@example.com',
      phone: '+1 555 000',
      links: [{ label: 'GitHub', url: 'https://github.com/jane' }],
    },
    summary: 'A summary.',
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
        bullets: ['Graduated'],
        aiHighlightsPrompt: DEFAULT_HIGHLIGHTS_PROMPT,
      },
    ],
    others: [],
    ...overrides,
  };
}

describe('splitReasoning', () => {
  it('returns full string as content when no marker present', () => {
    const result = splitReasoning('Just some text');
    expect(result).toEqual({ content: 'Just some text', reasoning: '' });
  });

  it('splits content and reasoning at the marker', () => {
    const result = splitReasoning('The summary\n---REASONING---\nBecause reasons.');
    expect(result).toEqual({ content: 'The summary', reasoning: 'Because reasons.' });
  });

  it('handles marker at the start (empty content)', () => {
    const result = splitReasoning('---REASONING---\nOnly reasoning.');
    expect(result).toEqual({ content: '', reasoning: 'Only reasoning.' });
  });

  it('trims whitespace around content and reasoning', () => {
    const result = splitReasoning('  content  \n---REASONING---\n  reasoning  ');
    expect(result).toEqual({ content: 'content', reasoning: 'reasoning' });
  });
});

describe('buildCvContext', () => {
  it('produces expected context string from CV data', () => {
    const data = makeCvData();
    const context = buildCvContext(data);

    expect(context).toContain('Name: Jane Doe');
    expect(context).toContain('Title: Engineer');
    expect(context).toContain('Links: GitHub: https://github.com/jane');
    expect(context).toContain('--- Current Summary ---');
    expect(context).toContain('A summary.');
    expect(context).toContain('--- Experience ---');
    expect(context).toContain('Engineer at Acme (Jan 2020 – Present, Dublin)');
    expect(context).toContain('  • Built things');
    expect(context).toContain('  Tech: React');
    expect(context).toContain('--- Education ---');
    expect(context).toContain('BSc CS, University (2016 – 2020, Dublin)');
  });

  it('omits empty sections', () => {
    const data = makeCvData({ experience: [], education: [], others: [], summary: '' });
    // Force the type since schema requires min(1) but we're testing the formatter
    const context = buildCvContext(data as CvFormData);

    expect(context).not.toContain('--- Experience ---');
    expect(context).not.toContain('--- Education ---');
    expect(context).not.toContain('--- Current Summary ---');
    expect(context).not.toContain('--- Other ---');
  });

  it('includes Others section when present', () => {
    const data = makeCvData({
      others: [
        {
          role: 'AWS Cert',
          company: 'AWS',
          url: '',
          startDate: 'Jun 2023',
          location: 'Online',
          bullets: ['Certified'],
          aiHighlightsPrompt: DEFAULT_HIGHLIGHTS_PROMPT,
        },
      ],
    });
    const context = buildCvContext(data);
    expect(context).toContain('--- Other ---');
    expect(context).toContain('AWS Cert, AWS');
  });
});

describe('generateHighlights — bullet parsing', () => {
  it('strips markdown bullet prefixes from AI response', async () => {
    const entry = makeCvData().experience[0];
    mockGenerateContent.mockResolvedValueOnce({
      text: '- First bullet\n* Second bullet\n• Third bullet\n  - Indented bullet',
    });

    const result = await generateHighlights('key', 'prompt', entry, 'job desc');

    expect(result.content).toEqual([
      'First bullet',
      'Second bullet',
      'Third bullet',
      'Indented bullet',
    ]);
    expect(result.reasoning).toBe('');
  });

  it('handles plain text lines without prefixes', async () => {
    const entry = makeCvData().experience[0];
    mockGenerateContent.mockResolvedValueOnce({ text: 'Plain line one\nPlain line two' });

    const result = await generateHighlights('key', 'prompt', entry, 'job desc');
    expect(result.content).toEqual(['Plain line one', 'Plain line two']);
  });

  it('filters out empty lines', async () => {
    const entry = makeCvData().experience[0];
    mockGenerateContent.mockResolvedValueOnce({ text: '- Bullet\n\n\n- Another' });

    const result = await generateHighlights('key', 'prompt', entry, 'job desc');
    expect(result.content).toEqual(['Bullet', 'Another']);
  });

  it('separates reasoning from bullets', async () => {
    const entry = makeCvData().experience[0];
    mockGenerateContent.mockResolvedValueOnce({
      text: '- Bullet one\n- Bullet two\n---REASONING---\nTailored to the JD.',
    });

    const result = await generateHighlights('key', 'prompt', entry, 'job desc');
    expect(result.content).toEqual(['Bullet one', 'Bullet two']);
    expect(result.reasoning).toBe('Tailored to the JD.');
  });
});

describe('generateSummary — round-trip through splitReasoning', () => {
  it('returns content and reasoning from AI response', async () => {
    const data = makeCvData();
    mockGenerateContent.mockResolvedValueOnce({
      text: 'A tailored summary.\n---REASONING---\nFocused on React skills.',
    });

    const result = await generateSummary('key', 'prompt', data, 'job desc');
    expect(result.content).toBe('A tailored summary.');
    expect(result.reasoning).toBe('Focused on React skills.');
  });
});
