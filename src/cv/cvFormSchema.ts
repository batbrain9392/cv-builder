import { z } from 'zod';

const itemSchema = z.string().min(1, 'Item cannot be empty');

const linkSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  url: z.url('Must be a valid URL'),
});

const personalInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string(),
  location: z.string(),
  email: z.email('Must be a valid email'),
  phone: z.string(),
  links: z.array(linkSchema),
});

const experienceSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  company: z.string().min(1, 'Company is required'),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  location: z.string(),
  items: z.array(itemSchema),
  tagsLabel: z.string().optional(),
  tags: z.array(z.string().min(1)).optional(),
  aiHighlightsPrompt: z.string().optional(),
});

const educationSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().min(1, 'Institution is required'),
  institutionUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  startYear: z.string().min(1, 'Start year is required'),
  endYear: z.string().optional(),
  location: z.string(),
  items: z.array(itemSchema),
  aiHighlightsPrompt: z.string().optional(),
});

export const DEFAULT_SUMMARY_PROMPT =
  "You are an expert resume writer. ATS compatibility is your top priority — use plain text, no tables or special formatting. Given the candidate's CV data and the job description (if provided), rewrite the professional summary to highlight the most relevant experience. Do not invent claims or metrics not present in the source data. If a manual summary is provided, use it as a starting point and strictly preserve its formatting. ONLY use **bold** and *italic* for emphasis; do NOT use markdown headings, blockquotes, or HTML.";

export const DEFAULT_HIGHLIGHTS_PROMPT =
  "You are an expert resume writer. ATS compatibility is your top priority — use plain text, no tables or special formatting. Given the candidate's experience entry and the job description (if provided), rewrite the highlights to be concise, impactful, and aligned with the role. Do not invent claims or metrics not present in the source data. Return one highlight per line, no bullet characters. ONLY use **bold** and *italic* for emphasis; do NOT use markdown headings, blockquotes, or HTML.";

export const DEFAULT_COVER_LETTER_PROMPT =
  "You are an expert cover letter writer. ATS compatibility is your top priority — use plain text, no tables or special formatting. Given the candidate's CV data and the job description (if provided), write a professional cover letter tailored for the role (or a general one if no job description is provided). Keep it to one page, with a clear opening, body highlighting relevant experience, and a closing paragraph. Do not invent claims or metrics not present in the source data. ONLY use **bold** and *italic* for emphasis; do NOT use markdown headings, blockquotes, or HTML.";

export const cvFormSchema = z.object({
  aiApiKey: z.string(),
  jobDescriptionText: z.string(),
  personalInfo: personalInfoSchema,
  summary: z.string(),
  skills: z
    .array(z.object({ category: z.string(), items: z.array(itemSchema) }))
    .min(1, 'At least one skills group is required'),
  aiSummaryPrompt: z.string(),
  coverLetterEnabled: z.boolean(),
  coverLetter: z.string(),
  aiCoverLetterPrompt: z.string(),
  experience: z.array(experienceSchema).min(1, 'At least one experience entry is required'),
  education: z.array(educationSchema).min(1, 'At least one education entry is required'),
  others: z.array(experienceSchema),
});

export type CvFormData = z.infer<typeof cvFormSchema>;
