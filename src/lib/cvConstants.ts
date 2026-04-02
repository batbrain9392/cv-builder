export function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export const CV_FONT = {
  family: 'Helvetica',
  fallback: 'Helvetica, Arial, sans-serif',
} as const;

export const CV_SIZE = {
  name: 18,
  sectionHeading: 13,
  title: 12,
  entryTitle: 12,
  body: 11,
  bullet: 10.5,
  meta: 10,
  contact: 10,
  techStack: 10,
} as const;

export const CV_COLOR = {
  primary: '000000',
  secondary: '333333',
  meta: '444444',
  rule: '888888',
} as const;

export const CV_SPACING_PT = {
  sectionBefore: 16,
  sectionAfter: 8,
  entryBefore: 10,
  metaAfter: 2,
  bulletAfter: 2,
  contactGap: 2,
  contactToSection: 12,
  summaryAfter: 8,
} as const;
