import type { ParseCvResult } from './parseCvFromText.ts';

import {
  extractTextFromDocx,
  fileToBase64,
  fileToText,
  INLINE_GEMINI_MIME_TYPES,
  MAX_FILE_SIZE,
  resolveMimeType,
  SUPPORTED_MIME_TYPES,
} from './fileUtils.ts';
import { parseCvFromText, SYSTEM_PROMPT, validateParsedCv } from './parseCvFromText.ts';

const MODEL = 'gemini-2.5-flash';

export async function parseCvFromFile(apiKey: string, file: File): Promise<ParseCvResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File exceeds maximum size of 10 MB.');
  }

  const mimeType = resolveMimeType(file);

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
