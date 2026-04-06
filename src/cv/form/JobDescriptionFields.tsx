import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { ChevronDownIcon, SparklesIcon } from 'lucide-react';
import { useCallback, useState } from 'react';

import { EmojiIcon } from '@/components/EmojiIcon';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { FileDropZone } from '@/components/ui/FileDropZone';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import type { CvFormData } from '../cvFormSchema.ts';

import { extractTextFromFile } from '../ai/extractTextFromFile.ts';
import { INLINE_GEMINI_MIME_TYPES, resolveMimeType } from '../ai/fileUtils.ts';
import { CollapsibleSection } from './CollapsibleSection.tsx';

interface JobDescriptionFieldsProps {
  register: UseFormRegister<CvFormData>;
  errors: FieldErrors<CvFormData>;
  currentApiKey: string;
  onJobDescriptionExtracted: (text: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function fileNeedsGeminiExtraction(file: File): boolean {
  return INLINE_GEMINI_MIME_TYPES.has(resolveMimeType(file));
}

export function JobDescriptionFields({
  register,
  errors,
  currentApiKey,
  onJobDescriptionExtracted,
  open,
  onOpenChange,
}: JobDescriptionFieldsProps) {
  const [textOpen, setTextOpen] = useState(false);
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
    <CollapsibleSection
      id="jd-title"
      open={open}
      onOpenChange={onOpenChange}
      title={
        <>
          <EmojiIcon emoji="🎯" />
          Job Description <span className="font-normal text-muted-foreground">(optional)</span>
        </>
      }
    >
      <p className="text-xs text-muted-foreground">
        Upload or paste the full job posting text. The AI uses this to tailor your summary, cover
        letter, and experience highlights to match the specific role — picking up on keywords,
        required skills, and tone.
      </p>

      <div className="space-y-3 rounded-lg border p-3">
        <div className="flex items-start gap-3">
          <SparklesIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <span className="block text-left">
            <span className="block text-sm font-medium">Upload a job description</span>
            <span className="block text-xs text-muted-foreground">
              PDF, Word document, image, or plain text file. The text will be extracted into the
              field below.
            </span>
          </span>
        </div>

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

      <Collapsible open={textOpen} onOpenChange={setTextOpen}>
        <CollapsibleTrigger
          render={
            <button
              type="button"
              aria-expanded={textOpen}
              aria-label={textOpen ? 'Hide paste text section' : 'Show paste text section'}
              className="w-full rounded-md text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          }
        >
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ChevronDownIcon
              className={cn('size-3.5 transition-transform', textOpen && 'rotate-180')}
            />
            Or paste text instead
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-3">
          <FieldGroup>
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
                Tip: select all the text on the job listing page (Ctrl+A / ⌘A), copy it, and paste
                here. Extra formatting or boilerplate won&rsquo;t affect the results.
              </p>
              {errors.jobDescriptionText && (
                <FieldError id="jobDescriptionText-error" errors={[errors.jobDescriptionText]} />
              )}
            </Field>
          </FieldGroup>
        </CollapsibleContent>
      </Collapsible>
    </CollapsibleSection>
  );
}
