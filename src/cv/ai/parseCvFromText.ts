import { z } from 'zod';

import type { CvFormData } from '../cvFormSchema.ts';

import { sortCvSections } from '../cvFormatters.ts';
import { cvFormSchema } from '../cvFormSchema.ts';
import { AI_FIELD_DEFAULTS, backfillEntryPrompts } from '../loadDefaultValues.ts';

const MODEL = 'gemini-2.5-flash';

const EXAMPLE_STRUCTURE = `{
  "personalInfo": {
    "name": "Jane Doe",
    "title": "Senior Software Engineer",
    "location": "San Francisco, CA",
    "email": "jane.doe@example.com",
    "phone": "+1 555 012 3456",
    "links": [
      { "label": "LinkedIn", "url": "https://www.linkedin.com/in/example/" },
      { "label": "GitHub", "url": "https://github.com/example" }
    ]
  },
  "summary": "8+ years of experience building performant, accessible web applications.",
  "experience": [
    {
      "role": "Senior Software Engineer",
      "company": "Acme Corp",
      "url": "",
      "startDate": "Mar 2021",
      "endDate": "Present",
      "location": "San Francisco, CA",
      "bullets": [
        "Led a four-person team to redesign the customer-facing dashboard."
      ],
      "tagsLabel": "Tech",
      "tags": ["React", "TypeScript"]
    }
  ],
  "education": [
    {
      "degree": "B.Sc. Computer Science",
      "institution": "State University",
      "institutionUrl": "",
      "startYear": "2012",
      "endYear": "2016",
      "location": "Austin, TX",
      "bullets": ["Graduated magna cum laude."]
    }
  ],
  "others": [
    {
      "role": "AWS Certified Solutions Architect",
      "company": "Amazon Web Services",
      "url": "",
      "startDate": "Jun 2023",
      "endDate": "",
      "location": "Online",
      "bullets": ["Earned the Associate-level certification."],
      "tagsLabel": "",
      "tags": []
    }
  ]
}`;

const SYSTEM_PROMPT = `You are an expert CV/resume parser. ATS COMPATIBILITY IS THE PRIMARY OBJECTIVE — preserve the original structure and content faithfully. Given raw text from a CV, extract structured data and return ONLY valid JSON matching the exact schema below.

TARGET JSON STRUCTURE (follow this exactly):
${EXAMPLE_STRUCTURE}

RULES:
- Match the exact JSON format, data types, and array structures shown in the example above.
- "personalInfo": name and email are required. title, location, and phone are optional (default "").
- "experience" is for work/employment history. Each entry needs: role, company, startDate. Optional (default "" or []): url, endDate, location, bullets, tagsLabel, tags.
- "education" is for degrees/academic qualifications. Each entry needs: degree, institution, startYear. Optional (default "" or []): institutionUrl, endYear, location, bullets.
- "others" is for everything else: certifications, projects, volunteer work, skills sections, publications, awards. Use the same shape as experience entries. For skills sections, use role="Skills", company="" as the section label.
- "url", "institutionUrl" fields: set to "" unless a URL is explicitly present in the text. Never invent URLs.
- Preserve dates exactly as written in the source text. For education, use year strings only (e.g. "2012").
- "summary": extract a professional summary. If none exists in the source text, leave as "".
- "personalInfo.links": extract LinkedIn, GitHub, portfolio, or other profile URLs if present. Each link needs a "label" and a "url".
- Do not invent claims, metrics, or information not present in the source text. Extract faithfully. If information for an optional field is missing, leave it blank ("" or []).
- Sort entries within each section (experience, education, others) by start date descending — most recent first. This is the standard reverse chronological order expected by ATS systems.
- Return ONLY the JSON object. No markdown fences, no explanation.`;

export interface ParseCvResult {
  data: CvFormData;
  issues: string[];
}

/**
 * Relaxed schema that accepts empty strings and empty arrays where the strict
 * schema requires min(1). This lets us load partial data the user can fix.
 */
const relaxedExperienceSchema = z.object({
  role: z.string(),
  company: z.string(),
  url: z.string().optional().default(''),
  startDate: z.string(),
  endDate: z.string().optional().default(''),
  location: z.string(),
  bullets: z.array(z.string()).default([]),
  tagsLabel: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  aiHighlightsPrompt: z.string().optional(),
});

const relaxedEducationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  institutionUrl: z.string().optional().default(''),
  startYear: z.string(),
  endYear: z.string().optional().default(''),
  location: z.string(),
  bullets: z.array(z.string()).default([]),
  aiHighlightsPrompt: z.string().optional(),
});

const relaxedCvSchema = z.object({
  personalInfo: z.object({
    name: z.string().default(''),
    title: z.string().default(''),
    location: z.string().default(''),
    email: z.string().default(''),
    phone: z.string().default(''),
    links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
  }),
  summary: z.string().default(''),
  experience: z.array(relaxedExperienceSchema).default([]),
  education: z.array(relaxedEducationSchema).default([]),
  others: z.array(relaxedExperienceSchema).default([]),
});

function buildIssuesFromZodError(error: z.ZodError): string[] {
  const issues: string[] = [];
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (path) {
      issues.push(`${path}: ${issue.message}`);
    } else {
      issues.push(issue.message);
    }
  }
  return issues;
}

export async function parseCvFromText(apiKey: string, rawText: string): Promise<ParseCvResult> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: MODEL,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
    },
    contents: rawText,
  });

  const text = response.text;
  if (!text) throw new Error('Gemini returned an empty response.');

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Gemini returned invalid JSON. Please try again.');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Gemini returned unexpected data. Please try again.');
  }

  const withDefaults = backfillEntryPrompts({
    ...AI_FIELD_DEFAULTS,
    ...Object.fromEntries(Object.entries(parsed)),
  });

  const strict = cvFormSchema.safeParse(withDefaults);
  if (strict.success) {
    return { data: sortCvSections(strict.data), issues: [] };
  }

  const issues = buildIssuesFromZodError(strict.error);

  const relaxed = relaxedCvSchema.safeParse(parsed);
  if (!relaxed.success) {
    throw new Error('Could not parse the CV data. Please check the text and try again.');
  }

  const relaxedWithDefaults = backfillEntryPrompts({
    ...AI_FIELD_DEFAULTS,
    ...Object.fromEntries(Object.entries(relaxed.data)),
  });

  // The relaxed schema is structurally compatible with CvFormData but may
  // have empty strings where min(1) is required. Re-parse through the strict
  // schema using superRefine-free passthrough to get the correct type.
  const typed: CvFormData = {
    aiApiKey: String(relaxedWithDefaults.aiApiKey ?? ''),
    jobDescriptionText: String(relaxedWithDefaults.jobDescriptionText ?? ''),
    aiSummaryPrompt: String(relaxedWithDefaults.aiSummaryPrompt ?? ''),
    coverLetterEnabled: Boolean(relaxedWithDefaults.coverLetterEnabled),
    coverLetter: String(relaxedWithDefaults.coverLetter ?? ''),
    aiCoverLetterPrompt: String(relaxedWithDefaults.aiCoverLetterPrompt ?? ''),
    personalInfo: relaxed.data.personalInfo,
    summary: relaxed.data.summary,
    experience: relaxed.data.experience,
    education: relaxed.data.education,
    others: relaxed.data.others,
  };

  return { data: sortCvSections(typed), issues };
}
