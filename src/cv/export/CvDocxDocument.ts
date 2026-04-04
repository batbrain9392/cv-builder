/**
 * DOCX export for the CV.
 *
 * Unit system:
 * - Font sizes: `pt * PT` (half-points, where PT = 2)
 * - Paragraph spacing: `pt * TWIP` (twentieths of a point, where TWIP = 20)
 * - Page/margin dimensions: millimeters converted via `convertMillimetersToTwip`
 *
 * PT and TWIP are imported from cvConstants.ts.
 *
 * The `docx` library is loaded lazily (dynamic import) so it stays out of
 * the initial bundle and is only fetched when the user triggers a DOCX export.
 */

import type { CvFormData } from '../cvFormSchema.ts';

import { CV_FONT, CV_SIZE, CV_COLOR, CV_SPACING_PT, CV_LAYOUT, PT, TWIP } from '../cvConstants.ts';
import { formatDateRange, formatEntryMeta, formatLinksLine } from '../cvFormatters.ts';

const FONT = CV_FONT.family;

type Docx = typeof import('docx');

interface InlineSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

/**
 * Parses inline markdown bold/italic into segments.
 * Supports **bold**, *italic*, and ***bold+italic***.
 * Nested or overlapping markers beyond these are passed through as-is.
 */
export function parseInlineSegments(input: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  const regex = /(\*{1,3})((?:(?!\1).)+?)\1/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: input.slice(lastIndex, match.index) });
    }
    const stars = match[1].length;
    segments.push({
      text: match[2],
      bold: stars >= 2,
      italic: stars === 1 || stars === 3,
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    segments.push({ text: input.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ text: input }];
}

function inlineTextRuns(
  { TextRun }: Docx,
  text: string,
  base: { size: number; font: string; color?: string },
): InstanceType<Docx['TextRun']>[] {
  return parseInlineSegments(text).map(
    (seg) =>
      new TextRun({
        text: seg.text,
        bold: seg.bold || undefined,
        italics: seg.italic || undefined,
        ...base,
      }),
  );
}

function headerLine({ Paragraph, TextRun }: Docx, info: CvFormData['personalInfo']) {
  return new Paragraph({
    spacing: { after: CV_SPACING_PT.sm * TWIP },
    children: [
      new TextRun({
        text: info.name,
        bold: true,
        size: CV_SIZE.heading * PT,
        font: FONT,
      }),
      new TextRun({
        text: '  \u2014  ',
        size: CV_SIZE.title * PT,
        font: FONT,
      }),
      new TextRun({
        text: info.title,
        bold: true,
        size: CV_SIZE.title * PT,
        font: FONT,
      }),
    ],
  });
}

function contactLines({ Paragraph, TextRun }: Docx, info: CvFormData['personalInfo']) {
  const contact = formatEntryMeta(info.email, info.phone, info.location);
  const links = formatLinksLine(info.links);

  const paragraphs = [
    new Paragraph({
      spacing: {
        after: (links ? CV_SPACING_PT.sm : CV_SPACING_PT.headerAfter) * TWIP,
      },
      children: [
        new TextRun({
          text: contact,
          size: CV_SIZE.hint * PT,
          font: FONT,
          color: CV_COLOR.text,
        }),
      ],
    }),
  ];

  if (links) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: CV_SPACING_PT.headerAfter * TWIP },
        children: [
          new TextRun({
            text: links,
            size: CV_SIZE.hint * PT,
            font: FONT,
            color: CV_COLOR.text,
          }),
        ],
      }),
    );
  }

  return paragraphs;
}

function sectionHeading({ Paragraph, TextRun, BorderStyle }: Docx, text: string) {
  return new Paragraph({
    spacing: {
      before: CV_SPACING_PT.sectionBefore * TWIP,
      after: CV_SPACING_PT.md * TWIP,
    },
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: CV_COLOR.rule,
        space: CV_SPACING_PT.md,
      },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: CV_SIZE.subheading * PT,
        font: FONT,
      }),
    ],
  });
}

function entryTitle({ Paragraph, TextRun }: Docx, text: string) {
  return new Paragraph({
    spacing: { before: CV_SPACING_PT.lg * TWIP, after: 0 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: CV_SIZE.title * PT,
        font: FONT,
      }),
    ],
  });
}

function entryMeta({ Paragraph, TextRun }: Docx, text: string) {
  return new Paragraph({
    spacing: { after: CV_SPACING_PT.sm * TWIP },
    children: [
      new TextRun({
        text,
        size: CV_SIZE.hint * PT,
        font: FONT,
        color: CV_COLOR.hint,
      }),
    ],
  });
}

function bulletParagraph(docx: Docx, text: string) {
  return new docx.Paragraph({
    spacing: { after: CV_SPACING_PT.sm * TWIP },
    bullet: { level: 0 },
    children: inlineTextRuns(docx, text, { size: CV_SIZE.body * PT, font: FONT }),
  });
}

function tagsBullet({ Paragraph, TextRun }: Docx, label: string | undefined, items: string[]) {
  const text = label ? `${label}: ${items.join(', ')}` : items.join(', ');
  return new Paragraph({
    spacing: { after: CV_SPACING_PT.sm * TWIP },
    bullet: { level: 0 },
    children: [
      new TextRun({
        text,
        size: CV_SIZE.body * PT,
        font: FONT,
        color: CV_COLOR.hint,
      }),
    ],
  });
}

function summaryParagraphs(docx: Docx, text: string) {
  return text.split('\n').map((line, i, arr) => {
    const isLast = i === arr.length - 1;
    return new docx.Paragraph({
      spacing: { after: isLast ? CV_SPACING_PT.md * TWIP : 0 },
      children: line.trim()
        ? inlineTextRuns(docx, line, { size: CV_SIZE.body * PT, font: FONT })
        : [],
    });
  });
}

function entryParagraphs(
  docx: Docx,
  title: string,
  meta: string,
  bullets: string[],
  tagsLabel?: string,
  tags?: string[],
) {
  const paragraphs = [
    entryTitle(docx, title),
    entryMeta(docx, meta),
    ...bullets.map((b) => bulletParagraph(docx, b)),
  ];
  if (tags && tags.length > 0) {
    paragraphs.push(tagsBullet(docx, tagsLabel, tags));
  }
  return paragraphs;
}

function bodyParagraphs(docx: Docx, text: string) {
  const { Paragraph, TextRun } = docx;
  return text.split('\n').map((line) => {
    return new Paragraph({
      spacing: { after: CV_SIZE.body * TWIP },
      children: line.trim()
        ? [new TextRun({ text: line, size: CV_SIZE.body * PT, font: FONT })]
        : [],
    });
  });
}

function createCvDocx(docx: Docx, data: CvFormData) {
  const { Document, convertMillimetersToTwip } = docx;
  const margin = convertMillimetersToTwip(CV_LAYOUT.marginMm);
  const pageProperties = {
    page: {
      size: {
        width: convertMillimetersToTwip(CV_LAYOUT.pageWidthMm),
        height: convertMillimetersToTwip(CV_LAYOUT.pageHeightMm),
      },
      margin: { top: margin, right: margin, bottom: margin, left: margin },
    },
  };

  const sections: {
    properties: typeof pageProperties;
    children: InstanceType<Docx['Paragraph']>[];
  }[] = [];

  const coverText = data.coverLetter?.trim();
  if (data.coverLetterEnabled && coverText) {
    sections.push({
      properties: pageProperties,
      children: [
        headerLine(docx, data.personalInfo),
        ...contactLines(docx, data.personalInfo),
        ...bodyParagraphs(docx, coverText),
      ],
    });
  }

  const cvChildren = [
    headerLine(docx, data.personalInfo),
    ...contactLines(docx, data.personalInfo),

    sectionHeading(docx, 'Professional Summary'),
    ...summaryParagraphs(docx, data.summary),

    sectionHeading(docx, 'Work Experience'),
    ...data.experience.flatMap((exp) =>
      entryParagraphs(
        docx,
        `${exp.role}, ${exp.company}`,
        formatEntryMeta(formatDateRange(exp.startDate, exp.endDate), exp.location),
        exp.bullets,
        exp.tagsLabel,
        exp.tags,
      ),
    ),

    sectionHeading(docx, 'Education'),
    ...data.education.flatMap((edu) =>
      entryParagraphs(
        docx,
        `${edu.degree}, ${edu.institution}`,
        formatEntryMeta(formatDateRange(edu.startYear, edu.endYear), edu.location),
        edu.bullets,
      ),
    ),
  ];

  if (data.others.length > 0) {
    cvChildren.push(
      sectionHeading(docx, 'Others'),
      ...data.others.flatMap((other) =>
        entryParagraphs(
          docx,
          `${other.role}, ${other.company}`,
          formatEntryMeta(formatDateRange(other.startDate, other.endDate), other.location),
          other.bullets,
          other.tagsLabel,
          other.tags,
        ),
      ),
    );
  }

  sections.push({ properties: pageProperties, children: cvChildren });

  return new Document({ sections });
}

export async function createCvDocxBlob(data: CvFormData): Promise<Blob> {
  const docx = await import('docx');
  const doc = createCvDocx(docx, data);
  return docx.Packer.toBlob(doc);
}
