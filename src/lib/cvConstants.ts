/**
 * CV design tokens shared by the web preview and DOCX export.
 *
 * All sizes are in typographic points (pt). Consumers convert as needed:
 * - CSS: values are injected as custom properties on the preview root element (see CvPreview.tsx).
 * - DOCX: font sizes use `* PT` (half-points), spacing uses `* TWIP` (twentieths of a point).
 */

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
  secondary: '333333',
  meta: '444444',
  rule: '888888',
} as const;

/** docx half-point multiplier: size value = pt * 2 */
export const PT = 2;

/** 1 pt = 20 twips (paragraph spacing units in docx) */
export const TWIP = 20;

export const CV_SPACING_PT = {
  sectionBefore: 16,
  sectionAfter: 8,
  entryBefore: 10,
  metaAfter: 2,
  bulletAfter: 2,
  contactGap: 2,
  contactToSection: 12,
  summaryAfter: 8,
  techStackBefore: 1,
  ruleGap: 8,
} as const;

export const CV_LAYOUT = {
  bulletIndentMm: 6,
  pageWidthMm: 210,
  pageHeightMm: 297,
  marginMm: 15,
} as const;
