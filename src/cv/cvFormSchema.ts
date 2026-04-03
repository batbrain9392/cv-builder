import { z } from 'zod';

const bulletSchema = z.string().min(1, 'Bullet cannot be empty');

const linkSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  url: z.url('Must be a valid URL'),
});

const personalInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  location: z.string().min(1, 'Location is required'),
  email: z.email('Must be a valid email'),
  phone: z.string().min(1, 'Phone is required'),
  links: z.array(linkSchema),
});

const experienceSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  company: z.string().min(1, 'Company is required'),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  bullets: z.array(bulletSchema).min(1, 'At least one bullet is required'),
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
  location: z.string().min(1, 'Location is required'),
  bullets: z.array(bulletSchema),
  aiHighlightsPrompt: z.string().optional(),
});

export const DEFAULT_SUMMARY_PROMPT =
  "You are an expert resume writer. Given the candidate's CV data and the job description below, rewrite the professional summary to highlight the most relevant experience and skills for this specific role. Keep it concise (3\u20135 sentences). If a manual summary is provided, use it as a starting point and tailor it to the job description.";

export const DEFAULT_HIGHLIGHTS_PROMPT =
  "You are an expert resume writer. Given the candidate's experience entry and the job description, rewrite the highlights to be concise, impactful, and aligned with the job requirements. Return one highlight per line, no bullet characters.";

export const DEFAULT_COVER_LETTER_PROMPT =
  "You are an expert cover letter writer. Given the candidate's CV data and the job description below, write a professional cover letter tailored for this specific role. Keep it to one page, with a clear opening, body highlighting relevant experience, and a closing paragraph.";

export const cvFormSchema = z.object({
  aiApiKey: z.string(),
  jobDescriptionText: z.string(),
  aiSummaryPrompt: z.string(),
  personalInfo: personalInfoSchema,
  summary: z.string().min(10, 'Summary should be at least 10 characters'),
  coverLetterEnabled: z.boolean(),
  coverLetter: z.string(),
  aiCoverLetterPrompt: z.string(),
  experience: z.array(experienceSchema).min(1, 'At least one experience entry is required'),
  education: z.array(educationSchema).min(1, 'At least one education entry is required'),
  others: z.array(experienceSchema),
});

export type CvFormData = z.infer<typeof cvFormSchema>;
