import type { UseFormRegister, Control, FieldErrors } from 'react-hook-form';

import { ChevronsDownUpIcon, ChevronsUpDownIcon, TrashIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import type { CvFormData } from '../cvFormSchema.ts';

import { HighlightsAiEnhance } from './HighlightsAiEnhance.tsx';
import { HighlightsInput } from './HighlightsInput.tsx';
import { TagsInput } from './TagsInput.tsx';

type ExperienceErrors = FieldErrors<CvFormData>['experience'];

interface ExperienceEntryFieldsProps {
  index: number;
  prefix: `experience.${number}` | `others.${number}`;
  idPrefix: string;
  register: UseFormRegister<CvFormData>;
  control: Control<CvFormData>;
  errors?: ExperienceErrors;
  onRemove: () => void;
  removeLabel: string;
  toggleSignal?: { n: number; open: boolean };
  canGenerate?: boolean;
  generatingHighlights?: boolean;
  generatedHighlights?: import('@/cv/ai/generateWithAi.ts').AiResult<string[]> | null;
  onGenerateHighlights?: () => void;
  onUseHighlights?: () => void;
  onCopyHighlights?: () => void;
  onDismissHighlights?: () => void;
}

export function ExperienceEntryFields({
  index,
  prefix,
  idPrefix,
  register,
  control,
  errors,
  onRemove,
  removeLabel,
  toggleSignal,
  canGenerate = false,
  generatingHighlights = false,
  generatedHighlights = null,
  onGenerateHighlights,
  onUseHighlights,
  onCopyHighlights,
  onDismissHighlights,
}: ExperienceEntryFieldsProps) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (toggleSignal && toggleSignal.n > 0) setOpen(toggleSignal.open);
  }, [toggleSignal]);
  const entryErrors = errors?.[index];

  const role = useWatch({ control, name: `${prefix}.role` });
  const company = useWatch({ control, name: `${prefix}.company` });
  const summary = [role, company].filter(Boolean).join(' at ') || 'New entry';

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen} className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-4">
          <CollapsibleTrigger
            render={<Button variant="ghost" className="flex-1 justify-start gap-2 text-left" />}
          >
            {open ? (
              <ChevronsDownUpIcon className="size-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate text-sm font-medium">{summary}</span>
          </CollapsibleTrigger>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-foreground/40 hover:bg-destructive/10 hover:text-destructive"
            onClick={onRemove}
            aria-label={`${removeLabel}: ${summary}`}
          >
            <TrashIcon />
          </Button>
        </div>

        <CollapsibleContent>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={entryErrors?.role ? true : undefined}>
                  <FieldLabel htmlFor={`${idPrefix}-role-${index}`}>Role</FieldLabel>
                  <Input
                    id={`${idPrefix}-role-${index}`}
                    {...register(`${prefix}.role`)}
                    aria-invalid={entryErrors?.role ? true : undefined}
                    aria-describedby={
                      entryErrors?.role ? `${idPrefix}-role-${index}-error` : undefined
                    }
                  />
                  {entryErrors?.role && (
                    <FieldError
                      id={`${idPrefix}-role-${index}-error`}
                      errors={[entryErrors.role]}
                    />
                  )}
                </Field>

                <Field data-invalid={entryErrors?.company ? true : undefined}>
                  <FieldLabel htmlFor={`${idPrefix}-company-${index}`}>Company</FieldLabel>
                  <Input
                    id={`${idPrefix}-company-${index}`}
                    {...register(`${prefix}.company`)}
                    aria-invalid={entryErrors?.company ? true : undefined}
                    aria-describedby={
                      entryErrors?.company ? `${idPrefix}-company-${index}-error` : undefined
                    }
                  />
                  {entryErrors?.company && (
                    <FieldError
                      id={`${idPrefix}-company-${index}-error`}
                      errors={[entryErrors.company]}
                    />
                  )}
                </Field>
              </div>

              <Field data-invalid={entryErrors?.url ? true : undefined}>
                <FieldLabel htmlFor={`${idPrefix}-url-${index}`}>URL</FieldLabel>
                <Input
                  id={`${idPrefix}-url-${index}`}
                  {...register(`${prefix}.url`)}
                  placeholder="https://"
                  aria-invalid={entryErrors?.url ? true : undefined}
                  aria-describedby={entryErrors?.url ? `${idPrefix}-url-${index}-error` : undefined}
                />
                {entryErrors?.url && (
                  <FieldError id={`${idPrefix}-url-${index}-error`} errors={[entryErrors.url]} />
                )}
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field data-invalid={entryErrors?.startDate ? true : undefined}>
                  <FieldLabel htmlFor={`${idPrefix}-start-${index}`}>Start Date</FieldLabel>
                  <Input
                    id={`${idPrefix}-start-${index}`}
                    {...register(`${prefix}.startDate`)}
                    placeholder="Dec 2022"
                    aria-invalid={entryErrors?.startDate ? true : undefined}
                    aria-describedby={
                      entryErrors?.startDate ? `${idPrefix}-start-${index}-error` : undefined
                    }
                  />
                  {entryErrors?.startDate && (
                    <FieldError
                      id={`${idPrefix}-start-${index}-error`}
                      errors={[entryErrors.startDate]}
                    />
                  )}
                </Field>

                <Field data-invalid={entryErrors?.endDate ? true : undefined}>
                  <FieldLabel htmlFor={`${idPrefix}-end-${index}`}>End Date</FieldLabel>
                  <Input
                    id={`${idPrefix}-end-${index}`}
                    {...register(`${prefix}.endDate`)}
                    placeholder="Present"
                    aria-invalid={entryErrors?.endDate ? true : undefined}
                    aria-describedby={
                      entryErrors?.endDate ? `${idPrefix}-end-${index}-error` : undefined
                    }
                  />
                  {entryErrors?.endDate && (
                    <FieldError
                      id={`${idPrefix}-end-${index}-error`}
                      errors={[entryErrors.endDate]}
                    />
                  )}
                </Field>

                <Field data-invalid={entryErrors?.location ? true : undefined}>
                  <FieldLabel htmlFor={`${idPrefix}-location-${index}`}>Location</FieldLabel>
                  <Input
                    id={`${idPrefix}-location-${index}`}
                    {...register(`${prefix}.location`)}
                    aria-invalid={entryErrors?.location ? true : undefined}
                    aria-describedby={
                      entryErrors?.location ? `${idPrefix}-location-${index}-error` : undefined
                    }
                  />
                  {entryErrors?.location && (
                    <FieldError
                      id={`${idPrefix}-location-${index}-error`}
                      errors={[entryErrors.location]}
                    />
                  )}
                </Field>
              </div>

              <HighlightsInput
                control={control}
                name={`${prefix}.items`}
                id={`${idPrefix}-highlights-${index}`}
                label="Highlights"
              />

              {onGenerateHighlights &&
                onUseHighlights &&
                onCopyHighlights &&
                onDismissHighlights && (
                  <HighlightsAiEnhance
                    canGenerate={canGenerate}
                    generating={generatingHighlights}
                    generatedItems={generatedHighlights}
                    onGenerate={onGenerateHighlights}
                    onUse={onUseHighlights}
                    onCopy={onCopyHighlights}
                    onDismiss={onDismissHighlights}
                    promptId={`${idPrefix}-ai-prompt-${index}`}
                    registerPrompt={register(`${prefix}.aiHighlightsPrompt`)}
                  />
                )}

              <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                <Field>
                  <FieldLabel htmlFor={`${idPrefix}-tags-label-${index}`}>Tags Label</FieldLabel>
                  <Input
                    id={`${idPrefix}-tags-label-${index}`}
                    {...register(`${prefix}.tagsLabel`)}
                    aria-describedby={`${idPrefix}-tags-label-${index}-hint`}
                  />
                  <p
                    id={`${idPrefix}-tags-label-${index}-hint`}
                    className="text-xs text-muted-foreground"
                  >
                    e.g. Tech, Tools, Skills
                  </p>
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${idPrefix}-tags-${index}`}>Tags</FieldLabel>
                  <TagsInput
                    control={control}
                    name={`${prefix}.tags`}
                    id={`${idPrefix}-tags-${index}`}
                  />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
