import {
  extractTextFromDocx,
  fileToBase64,
  fileToText,
  INLINE_GEMINI_MIME_TYPES,
  MAX_FILE_SIZE,
  resolveMimeType,
} from './fileUtils.ts';
import { generateContent } from './geminiClient.ts';

const MODEL = 'gemini-2.5-flash';

const OCR_PROMPT =
  'Extract all text content from this document or image. Return only the raw text, preserving the original structure and line breaks. No commentary.';

export async function extractTextFromFile(apiKey: string, file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File exceeds maximum size of 10 MB.');
  }

  const mimeType = resolveMimeType(file);

  if (INLINE_GEMINI_MIME_TYPES.has(mimeType)) {
    const base64 = await fileToBase64(file);
    const response = await generateContent(apiKey, {
      model: MODEL,
      config: { systemInstruction: OCR_PROMPT },
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { data: base64, mimeType } },
            { text: 'Extract all text from this document.' },
          ],
        },
      ],
    });
    const text = response.text;
    if (!text) throw new Error('Gemini returned an empty response.');
    return text;
  }

  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractTextFromDocx(file);
  }

  if (mimeType === 'text/plain') {
    return fileToText(file);
  }

  throw new Error('Unsupported file type.');
}
