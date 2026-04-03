/**
 * DOCX export for the CV.
 *
 * Unit system:
 * - Font sizes: `pt * PT` (half-points, where PT = 2)
 * - Paragraph spacing: `pt * TWIP` (twentieths of a point, where TWIP = 20)
 * - Page/margin dimensions: millimeters converted via `convertMillimetersToTwip`
 *
 * PT and TWIP are imported from cvConstants.ts.
 */

import { Document, Paragraph, TextRun, BorderStyle, Packer, convertMillimetersToTwip } from 'docx';

import type { CvFormData } from '../cvFormSchema.ts';

import { CV_FONT, CV_SIZE, CV_COLOR, CV_SPACING_PT, CV_LAYOUT, PT, TWIP } from '../cvConstants.ts';
import { formatDateRange, formatEntryMeta, formatLinksLine } from '../cvFormatters.ts';

const FONT = CV_FONT.family;

function headerLine(info: CvFormData['personalInfo']): Paragraph {
  return new Paragraph({
    spacing: { after: CV_SPACING_PT.contactGap * TWIP },
    children: [
      new TextRun({
        text: info.name,
        bold: true,
        size: CV_SIZE.name * PT,
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

function contactLines(info: CvFormData['personalInfo']): Paragraph[] {
  const contact = formatEntryMeta(info.email, info.phone, info.location);
  const links = formatLinksLine(info.links);

  const paragraphs: Paragraph[] = [
    new Paragraph({
      spacing: {
        after: (links ? CV_SPACING_PT.contactGap : CV_SPACING_PT.contactToSection) * TWIP,
      },
      children: [
        new TextRun({
          text: contact,
          size: CV_SIZE.contact * PT,
          font: FONT,
          color: CV_COLOR.secondary,
        }),
      ],
    }),
  ];

  if (links) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: CV_SPACING_PT.contactToSection * TWIP },
        children: [
          new TextRun({
            text: links,
            size: CV_SIZE.contact * PT,
            font: FONT,
            color: CV_COLOR.secondary,
          }),
        ],
      }),
    );
  }

  return paragraphs;
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: {
      before: CV_SPACING_PT.sectionBefore * TWIP,
      after: CV_SPACING_PT.sectionAfter * TWIP,
    },
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: CV_COLOR.rule,
        space: CV_SPACING_PT.ruleGap,
      },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: CV_SIZE.sectionHeading * PT,
        font: FONT,
      }),
    ],
  });
}

function entryTitle(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: CV_SPACING_PT.entryBefore * TWIP, after: 0 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: CV_SIZE.entryTitle * PT,
        font: FONT,
      }),
    ],
  });
}

function entryMeta(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: CV_SPACING_PT.metaAfter * TWIP },
    children: [
      new TextRun({
        text,
        size: CV_SIZE.meta * PT,
        font: FONT,
        color: CV_COLOR.meta,
      }),
    ],
  });
}

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: CV_SPACING_PT.bulletAfter * TWIP },
    indent: { left: convertMillimetersToTwip(CV_LAYOUT.bulletIndentMm) },
    children: [
      new TextRun({
        text: `\u2022 ${text}`,
        size: Math.round(CV_SIZE.bullet * PT),
        font: FONT,
      }),
    ],
  });
}

function techStackParagraph(text: string): Paragraph {
  return new Paragraph({
    spacing: {
      before: CV_SPACING_PT.techStackBefore * TWIP,
      after: CV_SPACING_PT.bulletAfter * TWIP,
    },
    indent: { left: convertMillimetersToTwip(CV_LAYOUT.bulletIndentMm) },
    children: [
      new TextRun({
        text: `Tech: ${text}`,
        size: CV_SIZE.techStack * PT,
        font: FONT,
        color: CV_COLOR.meta,
      }),
    ],
  });
}

function summaryParagraphs(text: string): Paragraph[] {
  return text.split('\n').map((line, i, arr) => {
    const isLast = i === arr.length - 1;
    return new Paragraph({
      spacing: { after: isLast ? CV_SPACING_PT.summaryAfter * TWIP : 0 },
      children: line.trim()
        ? [new TextRun({ text: line, size: CV_SIZE.body * PT, font: FONT })]
        : [],
    });
  });
}

function entryParagraphs(
  title: string,
  meta: string,
  bullets: string[],
  techStack?: string,
): Paragraph[] {
  const paragraphs: Paragraph[] = [
    entryTitle(title),
    entryMeta(meta),
    ...bullets.map((b) => bulletParagraph(b)),
  ];
  if (techStack) {
    paragraphs.push(techStackParagraph(techStack));
  }
  return paragraphs;
}

export function createCvDocx(data: CvFormData): Document {
  const margin = convertMillimetersToTwip(CV_LAYOUT.marginMm);

  const children: Paragraph[] = [
    headerLine(data.personalInfo),
    ...contactLines(data.personalInfo),

    sectionHeading('Professional Summary'),
    ...summaryParagraphs(data.summary),

    sectionHeading('Work Experience'),
    ...data.experience.flatMap((exp) =>
      entryParagraphs(
        `${exp.role}, ${exp.company}`,
        formatEntryMeta(formatDateRange(exp.startDate, exp.endDate), exp.location),
        exp.bullets,
        exp.techStack,
      ),
    ),

    sectionHeading('Education'),
    ...data.education.flatMap((edu) =>
      entryParagraphs(
        `${edu.degree}, ${edu.institution}`,
        formatEntryMeta(formatDateRange(edu.startYear, edu.endYear), edu.location),
        edu.bullets,
      ),
    ),
  ];

  if (data.others.length > 0) {
    children.push(
      sectionHeading('Others'),
      ...data.others.flatMap((other) =>
        entryParagraphs(
          `${other.role}, ${other.company}`,
          formatEntryMeta(formatDateRange(other.startDate, other.endDate), other.location),
          other.bullets,
          other.techStack,
        ),
      ),
    );
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertMillimetersToTwip(CV_LAYOUT.pageWidthMm),
              height: convertMillimetersToTwip(CV_LAYOUT.pageHeightMm),
            },
            margin: { top: margin, right: margin, bottom: margin, left: margin },
          },
        },
        children,
      },
    ],
  });
}

export async function createCvDocxBlob(data: CvFormData): Promise<Blob> {
  const doc = createCvDocx(data);
  return Packer.toBlob(doc);
}
