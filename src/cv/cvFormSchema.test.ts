import { describe, it, expect } from 'vitest';
import { cvFormSchema } from './cvFormSchema';

describe('cvFormSchema', () => {
  it('validates good data', () => {
    const goodData = {
      aiApiKey: '',
      jobDescriptionText: '',
      aiSummaryPrompt: 'Write a summary.',
      coverLetterEnabled: false,
      coverLetter: '',
      aiCoverLetterPrompt: 'Write a cover letter.',
      personalInfo: {
        name: 'Debmallya Bhattacharya',
        title: 'Senior Software Engineer',
        location: 'Dublin, Ireland',
        email: 'batbrain9392@gmail.com',
        phone: '+353 89 977 0399',
        links: [
          { label: 'LinkedIn', url: 'https://www.linkedin.com/in/batbrain9392/' },
          { label: 'GitHub', url: 'https://github.com/batbrain9392' },
        ],
      },
      summary: '11+ years in large-scale web applications...',
      experience: [
        {
          role: 'Senior Software Engineer',
          company: 'Workday (Peakon)',
          url: 'https://www.workday.com',
          startDate: 'Dec 2022',
          endDate: 'Present',
          location: 'Dublin, Ireland',
          bullets: ['Admin UI for Peakon...', 'Shipped scheduling model...'],
          tagsLabel: 'Tech',
          tags: ['React', 'TypeScript', 'React Hook Form', 'Zod'],
        },
      ],
      education: [
        {
          degree: 'Bachelor of Computer Science and Engineering',
          institution: 'Netaji Subhash Engineering College',
          institutionUrl: 'https://www.nsec.ac.in/',
          startYear: '2010',
          endYear: '2014',
          location: 'Kolkata, India',
          bullets: ['Graduated with 8.34 DGPA.'],
        },
      ],
      others: [],
    };

    const result = cvFormSchema.safeParse(goodData);
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const badData = {
      personalInfo: { name: '' },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      certifications: [],
      others: [],
    };

    const result = cvFormSchema.safeParse(badData);
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const data = makeValidData({ personalInfo: { ...VALID_PERSONAL_INFO, email: 'not-an-email' } });
    const result = cvFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects invalid URL in experience but accepts empty string', () => {
    const withBadUrl = makeValidData({
      experience: [{ ...VALID_EXPERIENCE, url: 'not-a-url' }],
    });
    expect(cvFormSchema.safeParse(withBadUrl).success).toBe(false);

    const withEmpty = makeValidData({
      experience: [{ ...VALID_EXPERIENCE, url: '' }],
    });
    expect(cvFormSchema.safeParse(withEmpty).success).toBe(true);
  });

  it('rejects invalid URL in education but accepts empty string', () => {
    const withBadUrl = makeValidData({
      education: [{ ...VALID_EDUCATION, institutionUrl: 'not-a-url' }],
    });
    expect(cvFormSchema.safeParse(withBadUrl).success).toBe(false);

    const withEmpty = makeValidData({
      education: [{ ...VALID_EDUCATION, institutionUrl: '' }],
    });
    expect(cvFormSchema.safeParse(withEmpty).success).toBe(true);
  });

  it('accepts empty bullets array in experience', () => {
    const data = makeValidData({
      experience: [{ ...VALID_EXPERIENCE, bullets: [] }],
    });
    expect(cvFormSchema.safeParse(data).success).toBe(true);
  });

  it('accepts empty summary', () => {
    const data = makeValidData({ summary: '' });
    expect(cvFormSchema.safeParse(data).success).toBe(true);
  });

  it('accepts optional personal info fields as empty strings', () => {
    const data = makeValidData({
      personalInfo: { ...VALID_PERSONAL_INFO, title: '', location: '', phone: '' },
    });
    expect(cvFormSchema.safeParse(data).success).toBe(true);
  });

  it('accepts experience entry with empty location', () => {
    const data = makeValidData({
      experience: [{ ...VALID_EXPERIENCE, location: '' }],
    });
    expect(cvFormSchema.safeParse(data).success).toBe(true);
  });

  it('accepts optional fields as empty or missing', () => {
    const data = makeValidData({
      experience: [
        {
          ...VALID_EXPERIENCE,
          endDate: undefined,
          tagsLabel: undefined,
          tags: undefined,
          aiHighlightsPrompt: undefined,
        },
      ],
    });
    expect(cvFormSchema.safeParse(data).success).toBe(true);
  });

  it('accepts empty cover letter fields', () => {
    const data = makeValidData({
      coverLetterEnabled: false,
      coverLetter: '',
      aiCoverLetterPrompt: '',
    });
    expect(cvFormSchema.safeParse(data).success).toBe(true);
  });
});

const VALID_PERSONAL_INFO = {
  name: 'Jane Doe',
  title: 'Engineer',
  location: 'Dublin',
  email: 'jane@example.com',
  phone: '+1 555 000',
  links: [],
};

const VALID_EXPERIENCE = {
  role: 'Engineer',
  company: 'Acme',
  url: '',
  startDate: 'Jan 2020',
  endDate: 'Present',
  location: 'Dublin',
  bullets: ['Built things'],
};

const VALID_EDUCATION = {
  degree: 'BSc CS',
  institution: 'University',
  institutionUrl: '',
  startYear: '2016',
  endYear: '2020',
  location: 'Dublin',
  bullets: ['Graduated'],
};

function makeValidData(overrides: Record<string, unknown> = {}) {
  return {
    aiApiKey: '',
    jobDescriptionText: '',
    aiSummaryPrompt: 'Write a summary.',
    coverLetterEnabled: false,
    coverLetter: '',
    aiCoverLetterPrompt: '',
    personalInfo: VALID_PERSONAL_INFO,
    summary: 'A professional summary with enough characters.',
    experience: [VALID_EXPERIENCE],
    education: [VALID_EDUCATION],
    others: [],
    ...overrides,
  };
}
