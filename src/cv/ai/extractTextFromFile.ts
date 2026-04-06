import { extractTextFromDocx, fileToBase64, fileToText } from './fileUtils.ts';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MODEL = 'gemini-2.5-flash';

const OCR_PROMPT =
  'Extract all text content from this document or image. Return only the raw text, preserving the original structure and line breaks. No commentary.';

const INLINE_GEMINI_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

function inferMimeFromFileName(fileName: string): string | undefined {
  const ext = fileName.toLowerCase().split('.').pop();
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

export async function extractTextFromFile(apiKey: string, file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File exceeds maximum size of 10 MB.');
  }

  let mimeType = file.type.trim();
  if (!mimeType) {
    const inferred = inferMimeFromFileName(file.name);
    if (inferred) mimeType = inferred;
  }

  if (INLINE_GEMINI_MIME_TYPES.has(mimeType)) {
    const base64 = await fileToBase64(file);
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
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
