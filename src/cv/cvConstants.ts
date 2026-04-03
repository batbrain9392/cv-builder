/**
 * CV design tokens shared by the web preview and DOCX export.
 *
 * All sizes are in typographic points (pt). Consumers convert as needed:
 * - CSS: values are injected as custom properties on the preview root element (see CvPreview.tsx).
 * - DOCX: font sizes use `* PT` (half-points), spacing uses `* TWIP` (twentieths of a point).
 */

export const CV_FONT = {
  family: 'Helvetica',
  fallback: 'Helvetica, Arial, sans-serif',
} as const;

export const CV_SIZE = {
  heading: 18,
  subheading: 13,
  title: 12,
  body: 11,
  hint: 10,
} as const;

export const CV_COLOR = {
  text: '333333',
  hint: '444444',
  rule: '888888',
} as const;

/** docx half-point multiplier: size value = pt * 2 */
export const PT = 2;

/** 1 pt = 20 twips (paragraph spacing units in docx) */
export const TWIP = 20;

export const CV_SPACING_PT = {
  /** Tight gap: between bullets, between hint and content, between header lines */
  sm: 2,
  /** Block gap: after rule, after summary paragraph */
  md: 8,
  /** Entry gap: above each entry title */
  lg: 10,
  /** Above section heading to header gap */
  headerAfter: 12,
  /** Section heading top margin */
  sectionBefore: 16,
} as const;

export const CV_LAYOUT = {
  indentMm: 6,
  pageWidthMm: 210,
  pageHeightMm: 297,
  marginMm: 15,
} as const;
