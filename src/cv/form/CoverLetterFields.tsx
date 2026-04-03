import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';

import {
  CheckIcon,
  ChevronDownIcon,
  ClipboardIcon,
  Loader2Icon,
  SparklesIcon,
  XIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { BlockMarkdown } from '@/cv/preview/Markdown.tsx';

import type { CvFormData } from '../cvFormSchema.ts';

import { MarkdownHint } from './MarkdownHint.tsx';

interface CoverLetterFieldsProps {
  register: UseFormRegister<CvFormData>;
  control: Control<CvFormData>;
  errors: FieldErrors<CvFormData>;
  generating: boolean;
  generatedText: string | null;
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
  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const enabled = useWatch({ control, name: 'coverLetterEnabled' });
  const apiKey = useWatch({ control, name: 'aiApiKey' });
  const jdText = useWatch({ control, name: 'jobDescriptionText' });
  const canGenerate = Boolean(apiKey) && Boolean(jdText);

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen} className="flex flex-col gap-2">
        <CardHeader>
          <CollapsibleTrigger
            render={
              <button
                type="button"
                aria-label="Toggle cover letter"
                className="flex w-full items-center justify-between text-left"
              />
            }
          >
            <CardTitle>
              Cover Letter{' '}
              <span className="text-sm font-normal text-muted-foreground">(optional)</span>
            </CardTitle>
            <ChevronDownIcon
              className={
                'size-4 shrink-0 text-muted-foreground transition-transform' +
                (open ? ' rotate-180' : '')
              }
            />
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent>
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

              {enabled && (
                <>
                  <Field data-invalid={errors.coverLetter ? true : undefined}>
                    <FieldLabel htmlFor="coverLetter" className="sr-only">
                      Cover Letter
                    </FieldLabel>
                    <Textarea
                      id="coverLetter"
                      {...register('coverLetter')}
                      rows={10}
                      aria-invalid={errors.coverLetter ? true : undefined}
                      aria-describedby={
                        'coverLetter-hint' + (errors.coverLetter ? ' coverLetter-error' : '')
                      }
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
                          aria-label="Enhance cover letter with AI"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        />
                      }
                    >
                      <SparklesIcon className="size-3.5" />
                      <ChevronDownIcon
                        className={'size-3.5 transition-transform' + (aiOpen ? ' rotate-180' : '')}
                      />
                      Enhance with AI
                    </CollapsibleTrigger>

                    <CollapsibleContent className="space-y-3 pt-2">
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
                            <SparklesIcon data-icon="inline-start" />
                          )}
                          {generating ? 'Generating…' : 'Generate with AI'}
                        </Button>
                        {!canGenerate && (
                          <span className="text-xs text-muted-foreground">
                            Requires API key and job description
                          </span>
                        )}
                      </div>

                      {generatedText && (
                        <div className="space-y-2 rounded-lg border border-dashed border-primary/30 bg-muted/50 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                              AI-generated cover letter
                            </span>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => onCopy(generatedText)}
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
                          <BlockMarkdown text={generatedText} className="text-sm" />
                          <Button type="button" variant="default" size="sm" onClick={onUse}>
                            <CheckIcon data-icon="inline-start" />
                            Use this cover letter
                          </Button>
                        </div>
                      )}

                      <Field>
                        <FieldLabel htmlFor="aiCoverLetterPrompt">AI prompt</FieldLabel>
                        <Textarea
                          id="aiCoverLetterPrompt"
                          {...register('aiCoverLetterPrompt')}
                          rows={4}
                          className="text-xs"
                        />
                      </Field>
                    </CollapsibleContent>
                  </Collapsible>
                </>
              )}
            </FieldGroup>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
