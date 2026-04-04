import type { CvFormData } from '../cvFormSchema.ts';

const MODEL = 'gemini-2.5-flash';

const REASONING_SUFFIX =
  '\n\nAfter your main output, add a line "---REASONING---" followed by a 1–2 sentence explanation of what information you considered and why this version improves on the original.';

export interface AiResult<T> {
  content: T;
  reasoning: string;
}

export function buildCvContext(data: CvFormData): string {
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

export function splitReasoning(raw: string): { content: string; reasoning: string } {
  const marker = '---REASONING---';
  const idx = raw.indexOf(marker);
  if (idx === -1) return { content: raw.trim(), reasoning: '' };
  return {
    content: raw.slice(0, idx).trim(),
    reasoning: raw.slice(idx + marker.length).trim(),
  };
}

async function generate(apiKey: string, instructions: string, input: string): Promise<string> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: MODEL,
    config: { systemInstruction: instructions + REASONING_SUFFIX },
    contents: input,
  });

  const text = response.text;
  if (!text) throw new Error('Gemini returned an empty response.');
  return text;
}

export async function generateSummary(
  apiKey: string,
  prompt: string,
  cvData: CvFormData,
  jobDescriptionText: string,
): Promise<AiResult<string>> {
  const input = [
    '--- Candidate CV ---',
    buildCvContext(cvData),
    '',
    '--- Job Description ---',
    jobDescriptionText,
  ].join('\n');

  const raw = await generate(apiKey, prompt, input);
  return splitReasoning(raw);
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
): Promise<AiResult<string[]>> {
  const input = [
    '--- Entry ---',
    buildEntryContext(entry),
    '',
    '--- Job Description ---',
    jobDescriptionText,
  ].join('\n');

  const raw = await generate(apiKey, prompt, input);
  const { content, reasoning } = splitReasoning(raw);
  const bullets = content
    .split('\n')
    .map((line) => line.replace(/^[\s•\-*]+/, '').trim())
    .filter(Boolean);
  return { content: bullets, reasoning };
}

export async function generateCoverLetter(
  apiKey: string,
  prompt: string,
  cvData: CvFormData,
  jobDescriptionText: string,
): Promise<AiResult<string>> {
  const input = [
    '--- Candidate CV ---',
    buildCvContext(cvData),
    '',
    '--- Job Description ---',
    jobDescriptionText,
  ].join('\n');

  const raw = await generate(apiKey, prompt, input);
  return splitReasoning(raw);
}
