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
});

const educationSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().min(1, 'Institution is required'),
  institutionUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  startYear: z.string().min(1, 'Start year is required'),
  endYear: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  bullets: z.array(bulletSchema),
});

export const cvFormSchema = z.object({
  jobDescriptionUrl: z.url('Must be a valid URL').optional().or(z.literal('')),
  personalInfo: personalInfoSchema,
  summary: z.string().min(10, 'Summary should be at least 10 characters'),
  experience: z.array(experienceSchema).min(1, 'At least one experience entry is required'),
  education: z.array(educationSchema).min(1, 'At least one education entry is required'),
  others: z.array(experienceSchema),
});

export type CvFormData = z.infer<typeof cvFormSchema>;
