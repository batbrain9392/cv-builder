import type { CvFormData } from './cvFormSchema.ts';
import './CvPreview.css';

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function Header({ info }: { info: CvFormData['personalInfo'] }) {
  const contactLine = [info.email, info.phone, info.location].join(' | ');
  const linksLine = info.links.map((l) => stripProtocol(l.url)).join(' | ');

  return (
    <div>
      <div className='cv-preview-header-line1'>
        <span className='cv-preview-name'>{info.name}</span>
        <span className='cv-preview-header-sep'>{' \u2014 '}</span>
        <span className='cv-preview-title'>{info.title}</span>
      </div>
      <div className={linksLine ? 'cv-preview-contact' : 'cv-preview-contact-last'}>{contactLine}</div>
      {linksLine && <div className='cv-preview-contact-last'>{linksLine}</div>}
    </div>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <div>
      <div className='cv-preview-section-heading'>{children}</div>
      <div className='cv-preview-section-rule' />
    </div>
  );
}

function ExperienceEntry({
  entry,
}: {
  entry: CvFormData['experience'][number];
}) {
  const dateParts = [entry.startDate, entry.endDate].filter(Boolean).join(' \u2013 ');
  const meta = [dateParts, entry.location].filter(Boolean).join(' | ');

  return (
    <div>
      <div className='cv-preview-entry-title'>
        {entry.role}, {entry.company}
      </div>
      <div className='cv-preview-entry-meta'>{meta}</div>
      {entry.bullets.map((b, i) => (
        <div key={i} className='cv-preview-bullet'>
          {'\u2022 '}
          {b}
        </div>
      ))}
      {entry.techStack ? (
        <div className='cv-preview-tech-stack'>Tech: {entry.techStack}</div>
      ) : null}
    </div>
  );
}

function EducationEntry({
  entry,
}: {
  entry: CvFormData['education'][number];
}) {
  const dateParts = [entry.startYear, entry.endYear].filter(Boolean).join(' \u2013 ');
  const meta = [dateParts, entry.location].filter(Boolean).join(' | ');

  return (
    <div>
      <div className='cv-preview-entry-title'>
        {entry.degree}, {entry.institution}
      </div>
      <div className='cv-preview-entry-meta'>{meta}</div>
      {entry.bullets.map((b, i) => (
        <div key={i} className='cv-preview-bullet'>
          {'\u2022 '}
          {b}
        </div>
      ))}
    </div>
  );
}

function CertificationEntry({
  entry,
}: {
  entry: CvFormData['certifications'][number];
}) {
  const meta = [entry.date, entry.location].filter(Boolean).join(' | ');

  return (
    <div>
      <div className='cv-preview-entry-title'>
        {entry.title}, {entry.issuer}
      </div>
      <div className='cv-preview-entry-meta'>{meta}</div>
      {entry.bullets.map((b, i) => (
        <div key={i} className='cv-preview-bullet'>
          {'\u2022 '}
          {b}
        </div>
      ))}
    </div>
  );
}

interface CvPreviewProps {
  data: CvFormData;
}

export function CvPreview({ data }: CvPreviewProps) {
  return (
    <div className='cv-preview'>
      <Header info={data.personalInfo} />

      <SectionHeading>Professional Summary</SectionHeading>
      <div className='cv-preview-summary'>{data.summary}</div>

      <SectionHeading>Work Experience</SectionHeading>
      {data.experience.map((exp, i) => (
        <ExperienceEntry key={i} entry={exp} />
      ))}

      <SectionHeading>Education</SectionHeading>
      {data.education.map((edu, i) => (
        <EducationEntry key={i} entry={edu} />
      ))}

      <SectionHeading>Technical Skills</SectionHeading>
      <div className='cv-preview-skills'>{data.skills.join(', ')}</div>

      {data.certifications.length > 0 && (
        <div>
          <SectionHeading>Certifications</SectionHeading>
          {data.certifications.map((cert, i) => (
            <CertificationEntry key={i} entry={cert} />
          ))}
        </div>
      )}

      {data.others.length > 0 && (
        <div>
          <SectionHeading>Other Experience</SectionHeading>
          {data.others.map((other, i) => (
            <ExperienceEntry key={i} entry={other} />
          ))}
        </div>
      )}
    </div>
  );
}
