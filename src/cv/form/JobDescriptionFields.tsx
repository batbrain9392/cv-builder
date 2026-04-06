import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { useCallback, useState } from 'react';

import { EmojiIcon } from '@/components/EmojiIcon';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { FileDropZone } from '@/components/ui/FileDropZone';
import { Textarea } from '@/components/ui/textarea';

import type { CvFormData } from '../cvFormSchema.ts';

import { extractTextFromFile } from '../ai/extractTextFromFile.ts';

interface JobDescriptionFieldsProps {
  register: UseFormRegister<CvFormData>;
  errors: FieldErrors<CvFormData>;
  currentApiKey: string;
  onJobDescriptionExtracted: (text: string) => void;
}

function resolveMimeForExtraction(file: File): string {
  const trimmedType = file.type.trim();
  if (trimmedType) return trimmedType;
  const ext = file.name.toLowerCase().split('.').pop();
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
      return '';
  }
}

function fileNeedsGeminiExtraction(file: File): boolean {
  const mime = resolveMimeForExtraction(file);
  return (
    mime === 'application/pdf' ||
    mime === 'image/png' ||
    mime === 'image/jpeg' ||
    mime === 'image/webp'
  );
}

export function JobDescriptionFields({
  register,
  errors,
  currentApiKey,
  onJobDescriptionExtracted,
}: JobDescriptionFieldsProps) {
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [dropZoneKey, setDropZoneKey] = useState(0);

  const handleFile = useCallback((file: File) => {
    setExtractError('');
    setJdFile(file);
  }, []);

  const handleExtract = useCallback(async () => {
    if (!jdFile) return;
    const keyTrimmed = currentApiKey.trim();
    if (fileNeedsGeminiExtraction(jdFile) && !keyTrimmed) {
      setExtractError(
        'Add your Gemini API key above to extract text from PDFs or images. Word (.docx) and .txt files work without a key.',
      );
      return;
    }
    setExtractError('');
    setExtracting(true);
    try {
      const text = await extractTextFromFile(keyTrimmed, jdFile);
      onJobDescriptionExtracted(text);
      setJdFile(null);
      setDropZoneKey((k) => k + 1);
    } catch (e) {
      setExtractError(e instanceof Error ? e.message : 'Extraction failed.');
    } finally {
      setExtracting(false);
    }
  }, [currentApiKey, jdFile, onJobDescriptionExtracted]);

  const needsKeyForSelection =
    jdFile !== null && fileNeedsGeminiExtraction(jdFile) && !currentApiKey.trim();

  return (
    <section aria-labelledby="jd-title" className="space-y-1.5">
      <h3 id="jd-title" className="flex items-center gap-1.5 text-sm font-semibold">
        <EmojiIcon emoji="🎯" />
        Job Description <span className="font-normal text-muted-foreground">(optional)</span>
      </h3>
      <FieldGroup>
        <p className="text-xs text-muted-foreground">
          Upload or paste the full job posting text. The AI uses this to tailor your summary, cover
          letter, and experience highlights to match the specific role — picking up on keywords,
          required skills, and tone.
        </p>

        <div className="space-y-2 p-3">
          <FileDropZone
            key={dropZoneKey}
            accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,.txt"
            acceptLabel="PDF, Word, image, or text file"
            onFile={handleFile}
            disabled={extracting}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleExtract}
              disabled={!jdFile || extracting || needsKeyForSelection}
            >
              Extract text
            </Button>
          </div>
          {needsKeyForSelection && (
            <p className="text-xs text-muted-foreground">
              Add your Gemini API key in AI settings to extract from PDF or image files. .docx and
              .txt work in the browser without a key.
            </p>
          )}
          {extracting && <p className="text-xs text-muted-foreground">Extracting text…</p>}
          {extractError ? (
            <p className="text-xs text-destructive" role="alert">
              {extractError}
            </p>
          ) : null}
        </div>

        <Field data-invalid={errors.jobDescriptionText ? true : undefined}>
          <FieldLabel htmlFor="jobDescriptionText">Job Description</FieldLabel>
          <Textarea
            id="jobDescriptionText"
            {...register('jobDescriptionText')}
            rows={6}
            placeholder="Paste the job description here…"
            aria-invalid={errors.jobDescriptionText ? true : undefined}
            aria-describedby="jobDescriptionText-hint"
          />
          <p id="jobDescriptionText-hint" className="text-xs text-muted-foreground">
            Tip: select all the text on the job listing page (Ctrl+A / ⌘A), copy it, and paste here.
            Extra formatting or boilerplate won't affect the results.
          </p>
          {errors.jobDescriptionText && (
            <FieldError id="jobDescriptionText-error" errors={[errors.jobDescriptionText]} />
          )}
        </Field>
      </FieldGroup>
    </section>
  );
}
