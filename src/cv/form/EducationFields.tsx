import type { UseFormRegister, Control, FieldArrayWithId, FieldErrors } from 'react-hook-form';

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
import { SectionToolbar } from './SectionToolbar.tsx';

interface EducationAiProps {
  canGenerate: boolean;
  generatingHighlights: boolean;
  generatedHighlights: string[] | null;
  onGenerateHighlights: () => void;
  onUseHighlights: () => void;
  onCopyHighlights: () => void;
  onDismissHighlights: () => void;
}

interface EducationFieldsProps {
  fields: FieldArrayWithId<CvFormData, 'education', 'id'>[];
  register: UseFormRegister<CvFormData>;
  control: Control<CvFormData>;
  errors?: FieldErrors<CvFormData>['education'];
  onAdd: () => void;
  onRemove: (index: number) => void;
  toggleSignal?: { n: number; open: boolean };
  onCollapse: () => void;
  onExpand: () => void;
  getAiProps?: (index: number) => EducationAiProps;
}

function EducationEntry({
  index,
  register,
  control,
  errors,
  onRemove,
  toggleSignal,
  ai,
}: {
  index: number;
  register: UseFormRegister<CvFormData>;
  control: Control<CvFormData>;
  errors?: FieldErrors<CvFormData>['education'];
  onRemove: () => void;
  toggleSignal?: { n: number; open: boolean };
  ai?: EducationAiProps;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (toggleSignal && toggleSignal.n > 0) setOpen(toggleSignal.open);
  }, [toggleSignal]);
  const entryErrors = errors?.[index];

  const degree = useWatch({ control, name: `education.${index}.degree` });
  const institution = useWatch({ control, name: `education.${index}.institution` });
  const summary = [degree, institution].filter(Boolean).join(' at ') || 'New entry';

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
            aria-label={`Remove education: ${summary}`}
          >
            <TrashIcon />
          </Button>
        </div>

        <CollapsibleContent>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={entryErrors?.degree ? true : undefined}>
                  <FieldLabel htmlFor={`edu-degree-${index}`}>Degree</FieldLabel>
                  <Input
                    id={`edu-degree-${index}`}
                    {...register(`education.${index}.degree`)}
                    aria-invalid={entryErrors?.degree ? true : undefined}
                    aria-describedby={entryErrors?.degree ? `edu-degree-${index}-error` : undefined}
                  />
                  {entryErrors?.degree && (
                    <FieldError id={`edu-degree-${index}-error`} errors={[entryErrors.degree]} />
                  )}
                </Field>

                <Field data-invalid={entryErrors?.institution ? true : undefined}>
                  <FieldLabel htmlFor={`edu-institution-${index}`}>Institution</FieldLabel>
                  <Input
                    id={`edu-institution-${index}`}
                    {...register(`education.${index}.institution`)}
                    aria-invalid={entryErrors?.institution ? true : undefined}
                    aria-describedby={
                      entryErrors?.institution ? `edu-institution-${index}-error` : undefined
                    }
                  />
                  {entryErrors?.institution && (
                    <FieldError
                      id={`edu-institution-${index}-error`}
                      errors={[entryErrors.institution]}
                    />
                  )}
                </Field>
              </div>

              <Field data-invalid={entryErrors?.institutionUrl ? true : undefined}>
                <FieldLabel htmlFor={`edu-url-${index}`}>Institution URL</FieldLabel>
                <Input
                  id={`edu-url-${index}`}
                  {...register(`education.${index}.institutionUrl`)}
                  placeholder="https://"
                  aria-invalid={entryErrors?.institutionUrl ? true : undefined}
                  aria-describedby={
                    entryErrors?.institutionUrl ? `edu-url-${index}-error` : undefined
                  }
                />
                {entryErrors?.institutionUrl && (
                  <FieldError id={`edu-url-${index}-error`} errors={[entryErrors.institutionUrl]} />
                )}
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field data-invalid={entryErrors?.startYear ? true : undefined}>
                  <FieldLabel htmlFor={`edu-start-${index}`}>Start Year</FieldLabel>
                  <Input
                    id={`edu-start-${index}`}
                    {...register(`education.${index}.startYear`)}
                    placeholder="2010"
                    aria-invalid={entryErrors?.startYear ? true : undefined}
                    aria-describedby={
                      entryErrors?.startYear ? `edu-start-${index}-error` : undefined
                    }
                  />
                  {entryErrors?.startYear && (
                    <FieldError id={`edu-start-${index}-error`} errors={[entryErrors.startYear]} />
                  )}
                </Field>

                <Field data-invalid={entryErrors?.endYear ? true : undefined}>
                  <FieldLabel htmlFor={`edu-end-${index}`}>End Year</FieldLabel>
                  <Input
                    id={`edu-end-${index}`}
                    {...register(`education.${index}.endYear`)}
                    placeholder="2014"
                    aria-invalid={entryErrors?.endYear ? true : undefined}
                    aria-describedby={entryErrors?.endYear ? `edu-end-${index}-error` : undefined}
                  />
                  {entryErrors?.endYear && (
                    <FieldError id={`edu-end-${index}-error`} errors={[entryErrors.endYear]} />
                  )}
                </Field>

                <Field data-invalid={entryErrors?.location ? true : undefined}>
                  <FieldLabel htmlFor={`edu-location-${index}`}>Location</FieldLabel>
                  <Input
                    id={`edu-location-${index}`}
                    {...register(`education.${index}.location`)}
                    aria-invalid={entryErrors?.location ? true : undefined}
                    aria-describedby={
                      entryErrors?.location ? `edu-location-${index}-error` : undefined
                    }
                  />
                  {entryErrors?.location && (
                    <FieldError
                      id={`edu-location-${index}-error`}
                      errors={[entryErrors.location]}
                    />
                  )}
                </Field>
              </div>

              <HighlightsInput
                control={control}
                name={`education.${index}.bullets`}
                id={`edu-highlights-${index}`}
                label="Highlights"
              />

              {ai && (
                <HighlightsAiEnhance
                  canGenerate={ai.canGenerate}
                  generating={ai.generatingHighlights}
                  generatedBullets={ai.generatedHighlights}
                  onGenerate={ai.onGenerateHighlights}
                  onUse={ai.onUseHighlights}
                  onCopy={ai.onCopyHighlights}
                  onDismiss={ai.onDismissHighlights}
                  promptId={`edu-ai-prompt-${index}`}
                  registerPrompt={register(`education.${index}.aiHighlightsPrompt`)}
                />
              )}
            </FieldGroup>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function EducationFields({
  fields,
  register,
  control,
  errors,
  onAdd,
  onRemove,
  toggleSignal,
  onCollapse,
  onExpand,
  getAiProps,
}: EducationFieldsProps) {
  return (
    <div className="space-y-4">
      <SectionToolbar
        title="Education"
        count={fields.length}
        onCollapse={onCollapse}
        onExpand={onExpand}
        onAdd={onAdd}
        addLabel="Add Education"
      />

      {fields.map((field, index) => (
        <EducationEntry
          key={field.id}
          index={index}
          register={register}
          control={control}
          errors={errors}
          onRemove={() => onRemove(index)}
          toggleSignal={toggleSignal}
          ai={getAiProps?.(index)}
        />
      ))}
    </div>
  );
}
