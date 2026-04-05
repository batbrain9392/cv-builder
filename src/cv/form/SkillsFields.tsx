import type { UseFormRegister, Control, FieldArrayWithId, FieldErrors } from 'react-hook-form';

import { ChevronsDownUpIcon, ChevronsUpDownIcon, TrashIcon, PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';

import { EmojiIcon } from '@/components/EmojiIcon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import type { CvFormData } from '../cvFormSchema.ts';

import { HighlightsInput } from './HighlightsInput.tsx';

interface SkillsFieldsProps {
  fields: FieldArrayWithId<CvFormData, 'skills', 'id'>[];
  register: UseFormRegister<CvFormData>;
  control: Control<CvFormData>;
  errors?: FieldErrors<CvFormData>['skills'];
  onAdd: () => void;
  onRemove: (index: number) => void;
  toggleSignal?: { n: number; open: boolean };
  onCollapse: () => void;
  onExpand: () => void;
}

function SkillEntry({
  index,
  register,
  control,
  errors,
  onRemove,
  toggleSignal,
}: {
  index: number;
  register: UseFormRegister<CvFormData>;
  control: Control<CvFormData>;
  errors?: FieldErrors<CvFormData>['skills'];
  onRemove: () => void;
  toggleSignal?: { n: number; open: boolean };
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (toggleSignal && toggleSignal.n > 0) setOpen(toggleSignal.open);
  }, [toggleSignal]);
  const entryErrors = errors?.[index];

  const category = useWatch({ control, name: `skills.${index}.category` });
  const summary = category || 'New skills group';

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
            aria-label={`Remove skills group: ${summary}`}
          >
            <TrashIcon />
          </Button>
        </div>

        <CollapsibleContent>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={entryErrors?.category ? true : undefined}>
                <FieldLabel htmlFor={`skill-category-${index}`}>
                  Category (e.g. Languages, Tools)
                </FieldLabel>
                <Input
                  id={`skill-category-${index}`}
                  {...register(`skills.${index}.category`)}
                  aria-invalid={entryErrors?.category ? true : undefined}
                  aria-describedby={
                    entryErrors?.category ? `skill-category-${index}-error` : undefined
                  }
                />
                {entryErrors?.category && (
                  <FieldError
                    id={`skill-category-${index}-error`}
                    errors={[entryErrors.category]}
                  />
                )}
              </Field>

              <HighlightsInput
                control={control}
                name={`skills.${index}.items`}
                id={`skill-items-${index}`}
                label="Skills"
              />
            </FieldGroup>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function SkillsFields({
  fields,
  register,
  control,
  errors,
  onAdd,
  onRemove,
  toggleSignal,
  onCollapse,
  onExpand,
}: SkillsFieldsProps) {
  return (
    <section aria-labelledby="section-skills" className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2
            id="section-skills"
            className="flex items-center gap-1.5 text-base font-semibold text-primary-text"
          >
            <EmojiIcon emoji="🛠️" /> Skills
          </h2>
          <div className="flex items-center gap-2">
            {fields.length > 0 && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground sm:size-auto sm:px-2.5"
                  onClick={onCollapse}
                >
                  <span className="sr-only sm:not-sr-only">Collapse All</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground sm:size-auto sm:px-2.5"
                  onClick={onExpand}
                >
                  <span className="sr-only sm:not-sr-only">Expand All</span>
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="border-primary/30 text-primary-text hover:bg-primary/10 sm:size-auto sm:px-2.5"
              onClick={onAdd}
            >
              <PlusIcon />
              <span className="sr-only sm:not-sr-only">Add Skills Group</span>
            </Button>
          </div>
        </div>
      </div>

      {fields.map((field, index) => (
        <SkillEntry
          key={field.id}
          index={index}
          register={register}
          control={control}
          errors={errors}
          onRemove={() => onRemove(index)}
          toggleSignal={toggleSignal}
        />
      ))}
    </section>
  );
}
