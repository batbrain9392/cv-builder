import OpenAI from 'openai';

import type { CvFormData } from '../cvFormSchema.ts';

const MODEL = 'gpt-4.1-mini';

function buildCvContext(data: CvFormData): string {
  const { personalInfo, summary, experience, education, others } = data;

  const lines: string[] = [
    `Name: ${personalInfo.name}`,
    `Title: ${personalInfo.title}`,
    `Location: ${personalInfo.location}`,
    `Email: ${personalInfo.email}`,
    `Phone: ${personalInfo.phone}`,
  ];

  if (personalInfo.links.length > 0) {
    lines.push(`Links: ${personalInfo.links.map((l) => `${l.label}: ${l.url}`).join(', ')}`);
  }

  if (summary) {
    lines.push('', '--- Current Summary ---', summary);
  }

  if (experience.length > 0) {
    lines.push('', '--- Experience ---');
    for (const exp of experience) {
      lines.push(
        `${exp.role} at ${exp.company} (${exp.startDate}${exp.endDate ? ` – ${exp.endDate}` : ''}, ${exp.location})`,
      );
      for (const b of exp.bullets) lines.push(`  • ${b}`);
      if (exp.tags?.length) lines.push(`  ${exp.tagsLabel ?? 'Tags'}: ${exp.tags.join(', ')}`);
    }
  }

  if (education.length > 0) {
    lines.push('', '--- Education ---');
    for (const edu of education) {
      lines.push(
        `${edu.degree}, ${edu.institution} (${edu.startYear}${edu.endYear ? ` – ${edu.endYear}` : ''}, ${edu.location})`,
      );
      for (const b of edu.bullets) lines.push(`  • ${b}`);
    }
  }

  if (others.length > 0) {
    lines.push('', '--- Other ---');
    for (const o of others) {
      lines.push(
        `${o.role}, ${o.company} (${o.startDate}${o.endDate ? ` – ${o.endDate}` : ''}, ${o.location})`,
      );
      for (const b of o.bullets) lines.push(`  • ${b}`);
    }
  }

  return lines.join('\n');
}

async function generate(apiKey: string, instructions: string, input: string): Promise<string> {
  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const response = await client.responses.create({
    model: MODEL,
    instructions,
    input,
  });

  return response.output_text;
}

export async function generateSummary(
  apiKey: string,
  prompt: string,
  cvData: CvFormData,
  jobDescriptionText: string,
): Promise<string> {
  const input = [
    '--- Candidate CV ---',
    buildCvContext(cvData),
    '',
    '--- Job Description ---',
    jobDescriptionText,
  ].join('\n');

  return generate(apiKey, prompt, input);
}

function buildEntryContext(
  entry: CvFormData['experience'][number] | CvFormData['education'][number],
): string {
  const lines: string[] = [];
  if ('role' in entry) {
    lines.push(
      `${entry.role} at ${entry.company} (${entry.startDate}${entry.endDate ? ` – ${entry.endDate}` : ''}, ${entry.location})`,
    );
    if (entry.tags?.length) lines.push(`${entry.tagsLabel ?? 'Tags'}: ${entry.tags.join(', ')}`);
  } else {
    lines.push(
      `${entry.degree}, ${entry.institution} (${entry.startYear}${entry.endYear ? ` – ${entry.endYear}` : ''}, ${entry.location})`,
    );
  }
  lines.push('', 'Current highlights:');
  for (const b of entry.bullets) lines.push(`• ${b}`);
  return lines.join('\n');
}

export async function generateHighlights(
  apiKey: string,
  prompt: string,
  entry: CvFormData['experience'][number] | CvFormData['education'][number],
  jobDescriptionText: string,
): Promise<string[]> {
  const input = [
    '--- Entry ---',
    buildEntryContext(entry),
    '',
    '--- Job Description ---',
    jobDescriptionText,
  ].join('\n');

  const raw = await generate(apiKey, prompt, input);
  return raw
    .split('\n')
    .map((line) => line.replace(/^[\s•\-*]+/, '').trim())
    .filter(Boolean);
}

export type HighlightsResultMap = Map<string, string[]>;

export async function generateAllHighlights(
  apiKey: string,
  cvData: CvFormData,
  jobDescriptionText: string,
): Promise<HighlightsResultMap> {
  const results: HighlightsResultMap = new Map();

  const tasks: {
    path: string;
    entry: CvFormData['experience'][number] | CvFormData['education'][number];
  }[] = [];

  cvData.experience.forEach((entry, i) => tasks.push({ path: `experience.${i}`, entry }));
  cvData.education.forEach((entry, i) => tasks.push({ path: `education.${i}`, entry }));
  cvData.others.forEach((entry, i) => tasks.push({ path: `others.${i}`, entry }));

  const settled = await Promise.allSettled(
    tasks.map(async ({ path, entry }) => {
      const prompt = entry.aiHighlightsPrompt || '';
      const bullets = await generateHighlights(apiKey, prompt, entry, jobDescriptionText);
      return { path, bullets };
    }),
  );

  for (const result of settled) {
    if (result.status === 'fulfilled') {
      results.set(result.value.path, result.value.bullets);
    }
  }

  return results;
}

export async function generateCoverLetter(
  apiKey: string,
  prompt: string,
  cvData: CvFormData,
  jobDescriptionText: string,
): Promise<string> {
  const input = [
    '--- Candidate CV ---',
    buildCvContext(cvData),
    '',
    '--- Job Description ---',
    jobDescriptionText,
  ].join('\n');

  return generate(apiKey, prompt, input);
}
