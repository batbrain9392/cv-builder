import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { CvFormData } from './cvFormSchema.ts';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: '15mm',
    lineHeight: 1.3,
  },

  // Header
  headerLine1: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  name: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
  },
  headerSep: {
    fontSize: 11,
    marginHorizontal: 6,
  },
  titleInHeader: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
  },
  contactLine: {
    fontSize: 9,
    color: '#333333',
    marginBottom: 10,
  },

  // Sections
  sectionHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 2,
  },
  sectionRule: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#888888',
    marginBottom: 4,
  },

  // Experience / Education / Cert / Others entries
  entryTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    marginTop: 4,
  },
  entryMeta: {
    fontSize: 9,
    color: '#444444',
    marginBottom: 2,
  },
  bullet: {
    fontSize: 9.5,
    marginLeft: 12,
    marginBottom: 1,
  },
  techStack: {
    fontSize: 9,
    color: '#444444',
    marginLeft: 12,
    marginTop: 1,
    marginBottom: 2,
  },

  // Summary
  summary: {
    fontSize: 10,
    marginBottom: 2,
  },

  // Skills
  skills: {
    fontSize: 10,
  },
});

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

interface CvPdfDocumentProps {
  data: CvFormData;
}

function Header({ info }: { info: CvFormData['personalInfo'] }) {
  const contactParts = [info.email, info.phone, info.location];
  const linkUrls = info.links.map((l) => stripProtocol(l.url));
  const allContact = [...contactParts, ...linkUrls].join(' | ');

  return (
    <View>
      <View style={styles.headerLine1}>
        <Text style={styles.name}>{info.name}</Text>
        <Text style={styles.headerSep}>{' \u2014 '}</Text>
        <Text style={styles.titleInHeader}>{info.title}</Text>
      </View>
      <Text style={styles.contactLine}>{allContact}</Text>
    </View>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <View>
      <Text style={styles.sectionHeading}>{children}</Text>
      <View style={styles.sectionRule} />
    </View>
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
    <View>
      <Text style={styles.entryTitle}>
        {entry.role}, {entry.company}
      </Text>
      <Text style={styles.entryMeta}>{meta}</Text>
      {entry.bullets.map((b, i) => (
        <Text key={i} style={styles.bullet}>
          {'\u2022 '}
          {b}
        </Text>
      ))}
      {entry.techStack ? (
        <Text style={styles.techStack}>Tech: {entry.techStack}</Text>
      ) : null}
    </View>
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
    <View>
      <Text style={styles.entryTitle}>
        {entry.degree}, {entry.institution}
      </Text>
      <Text style={styles.entryMeta}>{meta}</Text>
      {entry.bullets.map((b, i) => (
        <Text key={i} style={styles.bullet}>
          {'\u2022 '}
          {b}
        </Text>
      ))}
    </View>
  );
}

function CertificationEntry({
  entry,
}: {
  entry: CvFormData['certifications'][number];
}) {
  const meta = [entry.date, entry.location].filter(Boolean).join(' | ');

  return (
    <View>
      <Text style={styles.entryTitle}>
        {entry.title}, {entry.issuer}
      </Text>
      <Text style={styles.entryMeta}>{meta}</Text>
      {entry.bullets.map((b, i) => (
        <Text key={i} style={styles.bullet}>
          {'\u2022 '}
          {b}
        </Text>
      ))}
    </View>
  );
}

export function CvPdfDocument({ data }: CvPdfDocumentProps) {
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <Header info={data.personalInfo} />

        <SectionHeading>Professional Summary</SectionHeading>
        <Text style={styles.summary}>{data.summary}</Text>

        <SectionHeading>Work Experience</SectionHeading>
        {data.experience.map((exp, i) => (
          <ExperienceEntry key={i} entry={exp} />
        ))}

        <SectionHeading>Education</SectionHeading>
        {data.education.map((edu, i) => (
          <EducationEntry key={i} entry={edu} />
        ))}

        <SectionHeading>Technical Skills</SectionHeading>
        <Text style={styles.skills}>{data.skills.join(', ')}</Text>

        {data.certifications.length > 0 && (
          <View>
            <SectionHeading>Certifications</SectionHeading>
            {data.certifications.map((cert, i) => (
              <CertificationEntry key={i} entry={cert} />
            ))}
          </View>
        )}

        {data.others.length > 0 && (
          <View>
            <SectionHeading>Other Experience</SectionHeading>
            {data.others.map((other, i) => (
              <ExperienceEntry key={i} entry={other} />
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
