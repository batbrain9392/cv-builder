import type { ParseCvResult } from './parseCvFromText.ts';

import { extractTextFromDocx, fileToBase64, fileToText } from './fileUtils.ts';
import { parseCvFromText, SYSTEM_PROMPT, validateParsedCv } from './parseCvFromText.ts';

const SUPPORTED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

const INLINE_GEMINI_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const MODEL = 'gemini-2.5-flash';

function inferMimeFromFileName(fileName: string): string | undefined {
  const lower = fileName.toLowerCase();
  const dot = lower.lastIndexOf('.');
  if (dot === -1) return undefined;
  const ext = lower.slice(dot + 1);
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt':
      return 'text/plain';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    default:
      return undefined;
  }
}

export async function parseCvFromFile(apiKey: string, file: File): Promise<ParseCvResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File exceeds maximum size of 10 MB.');
  }

  let mimeType = file.type.trim();
  if (!mimeType) {
    const inferred = inferMimeFromFileName(file.name);
    if (inferred) mimeType = inferred;
  }

  if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
    throw new Error('Unsupported file type.');
  }

  if (INLINE_GEMINI_MIME_TYPES.has(mimeType)) {
    const base64 = await fileToBase64(file);
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      },
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { data: base64, mimeType } },
            {
              text: 'Parse this CV document into structured JSON matching the schema in your instructions.',
            },
          ],
        },
      ],
    });

    const text = response.text;
    if (!text) throw new Error('Gemini returned an empty response.');

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('Gemini returned invalid JSON. Please try again.');
    }

    return validateParsedCv(parsed);
  }

  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const docText = await extractTextFromDocx(file);
    return parseCvFromText(apiKey, docText);
  }

  if (mimeType === 'text/plain') {
    const plainText = await fileToText(file);
    return parseCvFromText(apiKey, plainText);
  }

  throw new Error('Unsupported file type.');
}
