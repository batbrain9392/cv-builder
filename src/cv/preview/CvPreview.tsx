import type React from 'react';

import type { CvFormData } from '../cvFormSchema.ts';

import { CV_FONT, CV_SIZE, CV_COLOR, CV_SPACING_PT } from '../cvConstants.ts';
import { formatDateRange, formatEntryMeta, formatLinksLine } from '../cvFormatters.ts';
import './CvPreview.css';

const cssVars: React.CSSProperties = {
  '--cv-font': CV_FONT.fallback,
  '--cv-heading-size': `${CV_SIZE.heading}pt`,
  '--cv-subheading-size': `${CV_SIZE.subheading}pt`,
  '--cv-title-size': `${CV_SIZE.title}pt`,
  '--cv-body-size': `${CV_SIZE.body}pt`,
  '--cv-hint-size': `${CV_SIZE.hint}pt`,
  '--cv-color-text': `#${CV_COLOR.text}`,
  '--cv-color-hint': `#${CV_COLOR.hint}`,
  '--cv-color-rule': `#${CV_COLOR.rule}`,
  '--cv-gap-sm': `${CV_SPACING_PT.sm}pt`,
  '--cv-gap-md': `${CV_SPACING_PT.md}pt`,
  '--cv-gap-lg': `${CV_SPACING_PT.lg}pt`,
  '--cv-header-after': `${CV_SPACING_PT.headerAfter}pt`,
  '--cv-section-before': `${CV_SPACING_PT.sectionBefore}pt`,
};

interface HeaderProps {
  name: string;
  title: string;
  contactLine: string;
  linksLine: string;
}

function Header({ name, title, contactLine, linksLine }: HeaderProps) {
  return (
    <header className="cv-preview-header">
      <h1 className="cv-preview-header-line1">
        <span className="cv-preview-name">{name}</span>
        <span className="cv-preview-header-sep">{' \u2014 '}</span>
        <span className="cv-preview-title">{title}</span>
      </h1>
      <div className="cv-preview-contact">{contactLine}</div>
      {linksLine && <div className="cv-preview-contact">{linksLine}</div>}
    </header>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <>
      <h2 className="cv-preview-section-heading">{children}</h2>
      <div className="cv-preview-section-rule" aria-hidden="true" />
    </>
  );
}

interface EntryProps {
  title: string;
  meta: string;
  bullets: string[];
  tagsLabel?: string;
  tags?: string[];
}

function Entry({ title, meta, bullets, tagsLabel, tags }: EntryProps) {
  return (
    <>
      <div className="cv-preview-entry-title">{title}</div>
      <div className="cv-preview-entry-meta">{meta}</div>
      <ul className="cv-preview-bullets">
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
        {tags && tags.length > 0 && (
          <li className="cv-preview-hint">
            {tagsLabel ? `${tagsLabel}: ` : ''}
            {tags.join(', ')}
          </li>
        )}
      </ul>
    </>
  );
}

interface CvPreviewProps {
  data: CvFormData;
}

export function CvPreview({ data }: CvPreviewProps) {
  return (
    <div className="cv-preview" style={cssVars}>
      <Header
        name={data.personalInfo.name}
        title={data.personalInfo.title}
        contactLine={formatEntryMeta(
          data.personalInfo.email,
          data.personalInfo.phone,
          data.personalInfo.location,
        )}
        linksLine={formatLinksLine(data.personalInfo.links)}
      />

      <SectionHeading>Professional Summary</SectionHeading>
      <p className="cv-preview-summary">{data.summary}</p>

      <SectionHeading>Work Experience</SectionHeading>
      {data.experience.map((exp, i) => (
        <Entry
          key={i}
          title={`${exp.role}, ${exp.company}`}
          meta={formatEntryMeta(formatDateRange(exp.startDate, exp.endDate), exp.location)}
          bullets={exp.bullets}
          tagsLabel={exp.tagsLabel}
          tags={exp.tags}
        />
      ))}

      <SectionHeading>Education</SectionHeading>
      {data.education.map((edu, i) => (
        <Entry
          key={i}
          title={`${edu.degree}, ${edu.institution}`}
          meta={formatEntryMeta(formatDateRange(edu.startYear, edu.endYear), edu.location)}
          bullets={edu.bullets}
        />
      ))}

      {data.others.length > 0 && (
        <>
          <SectionHeading>Others</SectionHeading>
          {data.others.map((other, i) => (
            <Entry
              key={i}
              title={`${other.role}, ${other.company}`}
              meta={formatEntryMeta(
                formatDateRange(other.startDate, other.endDate),
                other.location,
              )}
              bullets={other.bullets}
              tagsLabel={other.tagsLabel}
              tags={other.tags}
            />
          ))}
        </>
      )}
    </div>
  );
}
