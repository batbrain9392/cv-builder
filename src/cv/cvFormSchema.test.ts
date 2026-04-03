import { describe, it, expect } from 'vitest';
import { cvFormSchema } from './cvFormSchema';

describe('cvFormSchema', () => {
  it('validates good data', () => {
    const goodData = {
      jobDescriptionUrl: '',
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
});
