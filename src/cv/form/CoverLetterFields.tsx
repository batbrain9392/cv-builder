import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';

import { CheckIcon, ChevronDownIcon, ClipboardIcon, Loader2Icon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';

import { EmojiIcon } from '@/components/EmojiIcon';
import { GeminiIcon } from '@/components/GeminiIcon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { BlockMarkdown } from '@/cv/preview/Markdown.tsx';

import type { AiResult } from '../ai/generateWithAi.ts';
import type { CvFormData } from '../cvFormSchema.ts';

import { MarkdownHint } from './MarkdownHint.tsx';

interface CoverLetterFieldsProps {
  register: UseFormRegister<CvFormData>;
  control: Control<CvFormData>;
  errors: FieldErrors<CvFormData>;
  generating: boolean;
  generatedText: AiResult<string> | null;
  onGenerate: () => void;
  onUse: () => void;
  onCopy: (text: string) => void;
  onDismiss: () => void;
}

export function CoverLetterFields({
  register,
  control,
  errors,
  generating,
  generatedText,
  onGenerate,
  onUse,
  onCopy,
  onDismiss,
}: CoverLetterFieldsProps) {
  const [aiOpen, setAiOpen] = useState(false);
  const apiKey = useWatch({ control, name: 'aiApiKey' });
  const jdText = useWatch({ control, name: 'jobDescriptionText' });
  const canGenerate = Boolean(apiKey) && Boolean(jdText);

  return (
    <section aria-labelledby="cover-letter-title" className="space-y-1.5">
      <h3 id="cover-letter-title" className="flex items-center gap-1.5 text-sm font-semibold">
        <EmojiIcon emoji="✉️" />
        Cover Letter <span className="font-normal text-muted-foreground">(optional)</span>
      </h3>
      <FieldGroup>
        <Field orientation="horizontal">
          <label htmlFor="coverLetterEnabled" className="flex items-center gap-2 text-sm">
            <input
              id="coverLetterEnabled"
              type="checkbox"
              {...register('coverLetterEnabled')}
              className="size-4 accent-primary"
            />
            Include a cover letter
          </label>
        </Field>

        <Field data-invalid={errors.coverLetter ? true : undefined}>
          <FieldLabel htmlFor="coverLetter" className="sr-only">
            Cover Letter
          </FieldLabel>
          <Textarea
            id="coverLetter"
            {...register('coverLetter')}
            rows={10}
            aria-invalid={errors.coverLetter ? true : undefined}
            aria-describedby={'coverLetter-hint' + (errors.coverLetter ? ' coverLetter-error' : '')}
          />
          <MarkdownHint id="coverLetter-hint">
            Write manually or generate with AI below.
          </MarkdownHint>
          {errors.coverLetter && (
            <FieldError id="coverLetter-error" errors={[errors.coverLetter]} />
          )}
        </Field>

        <Collapsible open={aiOpen} onOpenChange={setAiOpen}>
          <CollapsibleTrigger
            render={
              <button
                type="button"
                aria-label="Enhance with AI"
                className="flex items-center hover:opacity-80"
              />
            }
          >
            <Badge variant="secondary" className="h-auto gap-1 text-xs [&>svg]:!size-3.5">
              <GeminiIcon className="size-3.5" />
              <ChevronDownIcon
                className={'size-3.5 transition-transform' + (aiOpen ? ' rotate-180' : '')}
              />
              Enhance with AI
            </Badge>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-3 pt-2">
            <Field>
              <FieldLabel htmlFor="aiCoverLetterPrompt">AI prompt</FieldLabel>
              <Textarea
                id="aiCoverLetterPrompt"
                {...register('aiCoverLetterPrompt')}
                rows={4}
                className="text-xs"
                placeholder="Write a concise, professional cover letter tailored to the role. One page max."
              />
            </Field>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!canGenerate || generating}
                onClick={onGenerate}
                aria-busy={generating || undefined}
              >
                {generating ? (
                  <Loader2Icon className="animate-spin" data-icon="inline-start" />
                ) : (
                  <GeminiIcon className="size-4" data-icon="inline-start" />
                )}
                {generating ? 'Generating…' : 'Generate with AI'}
              </Button>
              {!canGenerate && (
                <span className="text-xs text-muted-foreground">Requires API key</span>
              )}
            </div>

            {generatedText && (
              <div className="space-y-2 rounded-lg border border-dashed border-primary/30 bg-muted/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    AI-generated cover letter
                    {generatedText.reasoning && (
                      <span className="block font-normal">{generatedText.reasoning}</span>
                    )}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onCopy(generatedText.content)}
                      aria-label="Copy to clipboard"
                    >
                      <ClipboardIcon />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={onDismiss}
                      aria-label="Dismiss"
                    >
                      <XIcon />
                    </Button>
                  </div>
                </div>
                <BlockMarkdown text={generatedText.content} className="text-sm" />
                <Button type="button" variant="default" size="sm" onClick={onUse}>
                  <CheckIcon data-icon="inline-start" />
                  Use this cover letter
                </Button>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </FieldGroup>
    </section>
  );
}
