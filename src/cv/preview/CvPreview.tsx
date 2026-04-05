import type { CvFormData } from '../cvFormSchema.ts';

import { CV_CSS_VARS } from '../cvConstants.ts';
import { formatDateRange, formatEntryMeta, formatLinksLine } from '../cvFormatters.ts';
import './CvPreview.css';
import { BlockMarkdown, InlineMarkdown } from './Markdown.tsx';

interface HeaderProps {
  name: string;
  title: string;
  contactLine: string;
  linksLine: string;
}

function Header({ name, title, contactLine, linksLine }: HeaderProps) {
  return (
    <header className="cv-preview-header">
      <h1 className="cv-preview-name">{name}</h1>
      {title && <p className="cv-preview-title">{title}</p>}
      <address className="cv-preview-contact">{contactLine}</address>
      {linksLine && <address className="cv-preview-contact">{linksLine}</address>}
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
  items: string[];
  tagsLabel?: string;
  tags?: string[];
}

function Entry({ title, meta, items, tagsLabel, tags }: EntryProps) {
  return (
    <>
      <h3 className="cv-preview-entry-title">{title}</h3>
      <div className="cv-preview-entry-meta">{meta}</div>
      <ul className="cv-preview-items">
        {items.map((b, i) => (
          <li key={i}>
            <InlineMarkdown text={b} />
          </li>
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

function CoverLetterPage({ data }: CvPreviewProps) {
  const contactLine = formatEntryMeta(
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location,
  );

  return (
    <article className="cv-preview cv-preview-cover-letter" style={CV_CSS_VARS}>
      <Header
        name={data.personalInfo.name}
        title={data.personalInfo.title}
        contactLine={contactLine}
        linksLine={formatLinksLine(data.personalInfo.links)}
      />
      <BlockMarkdown text={data.coverLetter} className="cv-preview-cover-letter-body" />
    </article>
  );
}

export function CvPreview({ data }: CvPreviewProps) {
  const showCoverLetter = data.coverLetterEnabled && data.coverLetter?.trim();

  return (
    <div className="cv-preview-pages">
      {showCoverLetter && <CoverLetterPage data={data} />}

      <article className="cv-preview" style={CV_CSS_VARS}>
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

        {data.summary.trim() && (
          <>
            <SectionHeading>Professional Summary</SectionHeading>
            <BlockMarkdown text={data.summary} className="cv-preview-summary" />
          </>
        )}

        {data.skills && data.skills.length > 0 && (
          <>
            <SectionHeading>Skills</SectionHeading>
            <ul className="cv-preview-items">
              {data.skills.map((line, i) => (
                <li key={i}>
                  <InlineMarkdown text={line} />
                </li>
              ))}
            </ul>
          </>
        )}

        <SectionHeading>Work Experience</SectionHeading>
        {data.experience.map((exp, i) => (
          <Entry
            key={i}
            title={`${exp.role}, ${exp.company}`}
            meta={formatEntryMeta(formatDateRange(exp.startDate, exp.endDate), exp.location)}
            items={exp.items}
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
            items={edu.items}
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
                items={other.items}
                tagsLabel={other.tagsLabel}
                tags={other.tags}
              />
            ))}
          </>
        )}
      </article>
    </div>
  );
}
