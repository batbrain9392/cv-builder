import {
  Document,
  Paragraph,
  TextRun,
  BorderStyle,
  Packer,
  convertMillimetersToTwip,
} from 'docx';
import type { CvFormData } from './cvFormSchema.ts';

const FONT = 'Helvetica';
const PT = 2; // docx half-point multiplier: size value = pt * 2

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function headerLine(info: CvFormData['personalInfo']): Paragraph {
  return new Paragraph({
    spacing: { after: 40 },
    children: [
      new TextRun({
        text: info.name,
        bold: true,
        size: 18 * PT,
        font: FONT,
      }),
      new TextRun({
        text: '  \u2014  ',
        size: 12 * PT,
        font: FONT,
      }),
      new TextRun({
        text: info.title,
        bold: true,
        size: 12 * PT,
        font: FONT,
      }),
    ],
  });
}

function contactLines(info: CvFormData['personalInfo']): Paragraph[] {
  const contact = [info.email, info.phone, info.location].join(' | ');
  const links = info.links.map((l) => stripProtocol(l.url)).join(' | ');

  const paragraphs: Paragraph[] = [
    new Paragraph({
      spacing: { after: links ? 40 : 240 },
      children: [
        new TextRun({
          text: contact,
          size: 10 * PT,
          font: FONT,
          color: '333333',
        }),
      ],
    }),
  ];

  if (links) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: links,
            size: 10 * PT,
            font: FONT,
            color: '333333',
          }),
        ],
      }),
    );
  }

  return paragraphs;
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 320, after: 160 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '888888', space: 8 },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 13 * PT,
        font: FONT,
      }),
    ],
  });
}

function entryTitle(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 0 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 11 * PT,
        font: FONT,
      }),
    ],
  });
}

function entryMeta(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 40 },
    children: [
      new TextRun({
        text,
        size: 10 * PT,
        font: FONT,
        color: '444444',
      }),
    ],
  });
}

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 40 },
    indent: { left: convertMillimetersToTwip(6) },
    children: [
      new TextRun({
        text: `\u2022 ${text}`,
        size: Math.round(10.5 * PT),
        font: FONT,
      }),
    ],
  });
}

function techStackParagraph(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 20, after: 40 },
    indent: { left: convertMillimetersToTwip(6) },
    children: [
      new TextRun({
        text: `Tech: ${text}`,
        size: 10 * PT,
        font: FONT,
        color: '444444',
      }),
    ],
  });
}

function summaryParagraphs(text: string): Paragraph[] {
  return text.split('\n').map((line, i, arr) => {
    const isLast = i === arr.length - 1;
    return new Paragraph({
      spacing: { after: isLast ? 160 : 0 },
      children: line.trim()
        ? [new TextRun({ text: line, size: 11 * PT, font: FONT })]
        : [],
    });
  });
}

function experienceEntryParagraphs(entry: CvFormData['experience'][number]): Paragraph[] {
  const dateParts = [entry.startDate, entry.endDate].filter(Boolean).join(' \u2013 ');
  const meta = [dateParts, entry.location].filter(Boolean).join(' | ');
  const paragraphs: Paragraph[] = [
    entryTitle(`${entry.role}, ${entry.company}`),
    entryMeta(meta),
    ...entry.bullets.map((b) => bulletParagraph(b)),
  ];
  if (entry.techStack) {
    paragraphs.push(techStackParagraph(entry.techStack));
  }
  return paragraphs;
}

function educationEntryParagraphs(entry: CvFormData['education'][number]): Paragraph[] {
  const dateParts = [entry.startYear, entry.endYear].filter(Boolean).join(' \u2013 ');
  const meta = [dateParts, entry.location].filter(Boolean).join(' | ');
  return [
    entryTitle(`${entry.degree}, ${entry.institution}`),
    entryMeta(meta),
    ...entry.bullets.map((b) => bulletParagraph(b)),
  ];
}

function certificationEntryParagraphs(entry: CvFormData['certifications'][number]): Paragraph[] {
  const meta = [entry.date, entry.location].filter(Boolean).join(' | ');
  return [
    entryTitle(`${entry.title}, ${entry.issuer}`),
    entryMeta(meta),
    ...entry.bullets.map((b) => bulletParagraph(b)),
  ];
}

export function createCvDocx(data: CvFormData): Document {
  const margin = convertMillimetersToTwip(15);

  const children: Paragraph[] = [
    headerLine(data.personalInfo),
    ...contactLines(data.personalInfo),

    sectionHeading('Professional Summary'),
    ...summaryParagraphs(data.summary),

    sectionHeading('Work Experience'),
    ...data.experience.flatMap(experienceEntryParagraphs),

    sectionHeading('Education'),
    ...data.education.flatMap(educationEntryParagraphs),

    sectionHeading('Technical Skills'),
    new Paragraph({
      children: [
        new TextRun({
          text: data.skills.join(', '),
          size: 11 * PT,
          font: FONT,
        }),
      ],
    }),
  ];

  if (data.certifications.length > 0) {
    children.push(
      sectionHeading('Certifications'),
      ...data.certifications.flatMap(certificationEntryParagraphs),
    );
  }

  if (data.others.length > 0) {
    children.push(
      sectionHeading('Other Experience'),
      ...data.others.flatMap(experienceEntryParagraphs),
    );
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: convertMillimetersToTwip(210), height: convertMillimetersToTwip(297) },
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
