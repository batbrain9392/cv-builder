import type React from 'react';

import type { CvFormData } from './cvFormSchema.ts';

import { CV_FONT, CV_SIZE, CV_COLOR, CV_SPACING_PT, CV_LAYOUT } from './cvConstants.ts';
import { formatDateRange, formatEntryMeta, formatLinksLine } from './cvFormatters.ts';
import './CvPreview.css';

const cssVars = {
  '--cv-font': CV_FONT.fallback,
  '--cv-name-size': `${CV_SIZE.name}pt`,
  '--cv-section-heading-size': `${CV_SIZE.sectionHeading}pt`,
  '--cv-title-size': `${CV_SIZE.title}pt`,
  '--cv-entry-title-size': `${CV_SIZE.entryTitle}pt`,
  '--cv-body-size': `${CV_SIZE.body}pt`,
  '--cv-bullet-size': `${CV_SIZE.bullet}pt`,
  '--cv-meta-size': `${CV_SIZE.meta}pt`,
  '--cv-contact-size': `${CV_SIZE.contact}pt`,
  '--cv-tech-size': `${CV_SIZE.techStack}pt`,
  '--cv-color-secondary': `#${CV_COLOR.secondary}`,
  '--cv-color-meta': `#${CV_COLOR.meta}`,
  '--cv-color-rule': `#${CV_COLOR.rule}`,
  '--cv-section-before': `${CV_SPACING_PT.sectionBefore}pt`,
  '--cv-section-after': `${CV_SPACING_PT.sectionAfter}pt`,
  '--cv-entry-before': `${CV_SPACING_PT.entryBefore}pt`,
  '--cv-meta-after': `${CV_SPACING_PT.metaAfter}pt`,
  '--cv-bullet-after': `${CV_SPACING_PT.bulletAfter}pt`,
  '--cv-bullet-indent': `${CV_LAYOUT.bulletIndentMm}mm`,
  '--cv-contact-gap': `${CV_SPACING_PT.contactGap}pt`,
  '--cv-contact-to-section': `${CV_SPACING_PT.contactToSection}pt`,
  '--cv-summary-after': `${CV_SPACING_PT.summaryAfter}pt`,
  '--cv-tech-before': `${CV_SPACING_PT.techStackBefore}pt`,
  '--cv-rule-gap': `${CV_SPACING_PT.ruleGap}pt`,
} as React.CSSProperties;

function Header({ info }: { info: CvFormData['personalInfo'] }) {
  const contactLine = formatEntryMeta(info.email, info.phone, info.location);
  const linksLine = formatLinksLine(info.links);

  return (
    <div>
      <div className="cv-preview-header-line1">
        <span className="cv-preview-name">{info.name}</span>
        <span className="cv-preview-header-sep">{' \u2014 '}</span>
        <span className="cv-preview-title">{info.title}</span>
      </div>
      <div className={linksLine ? 'cv-preview-contact' : 'cv-preview-contact-last'}>
        {contactLine}
      </div>
      {linksLine && <div className="cv-preview-contact-last">{linksLine}</div>}
    </div>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <div>
      <div className="cv-preview-section-heading">{children}</div>
      <div className="cv-preview-section-rule" />
    </div>
  );
}

interface EntryProps {
  title: string;
  meta: string;
  bullets: string[];
  techStack?: string;
}

function Entry({ title, meta, bullets, techStack }: EntryProps) {
  return (
    <div>
      <div className="cv-preview-entry-title">{title}</div>
      <div className="cv-preview-entry-meta">{meta}</div>
      {bullets.map((b, i) => (
        <div key={i} className="cv-preview-bullet">
          {'\u2022 '}
          {b}
        </div>
      ))}
      {techStack ? <div className="cv-preview-tech-stack">Tech: {techStack}</div> : null}
    </div>
  );
}

interface CvPreviewProps {
  data: CvFormData;
}

export function CvPreview({ data }: CvPreviewProps) {
  return (
    <div className="cv-preview" style={cssVars}>
      <Header info={data.personalInfo} />

      <SectionHeading>Professional Summary</SectionHeading>
      <div className="cv-preview-summary">{data.summary}</div>

      <SectionHeading>Work Experience</SectionHeading>
      {data.experience.map((exp, i) => (
        <Entry
          key={i}
          title={`${exp.role}, ${exp.company}`}
          meta={formatEntryMeta(formatDateRange(exp.startDate, exp.endDate), exp.location)}
          bullets={exp.bullets}
          techStack={exp.techStack}
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

      <SectionHeading>Technical Skills</SectionHeading>
      <div className="cv-preview-skills">{data.skills.join(', ')}</div>

      {data.certifications.length > 0 && (
        <div>
          <SectionHeading>Certifications</SectionHeading>
          {data.certifications.map((cert, i) => (
            <Entry
              key={i}
              title={`${cert.title}, ${cert.issuer}`}
              meta={formatEntryMeta(cert.date, cert.location)}
              bullets={cert.bullets}
            />
          ))}
        </div>
      )}

      {data.others.length > 0 && (
        <div>
          <SectionHeading>Other Experience</SectionHeading>
          {data.others.map((other, i) => (
            <Entry
              key={i}
              title={`${other.role}, ${other.company}`}
              meta={formatEntryMeta(
                formatDateRange(other.startDate, other.endDate),
                other.location,
              )}
              bullets={other.bullets}
              techStack={other.techStack}
            />
          ))}
        </div>
      )}
    </div>
  );
}
