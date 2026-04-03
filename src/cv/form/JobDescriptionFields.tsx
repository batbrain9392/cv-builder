import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

import type { CvFormData } from '../cvFormSchema.ts';

interface JobDescriptionFieldsProps {
  register: UseFormRegister<CvFormData>;
  errors: FieldErrors<CvFormData>;
}

export function JobDescriptionFields({ register, errors }: JobDescriptionFieldsProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen} className="flex flex-col gap-2">
        <CardHeader>
          <CollapsibleTrigger
            render={
              <button
                type="button"
                aria-label="Toggle job description"
                className="flex w-full items-center justify-between text-left"
              />
            }
          >
            <CardTitle>
              Job Description{' '}
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
              <p className="text-xs text-muted-foreground">
                Copy the full job posting text and paste it here. The AI uses this to tailor your
                summary, cover letter, and experience highlights to match the specific role —
                picking up on keywords, required skills, and tone.
              </p>
              <Field data-invalid={errors.jobDescriptionText ? true : undefined}>
                <FieldLabel htmlFor="jobDescriptionText">Job Posting Text</FieldLabel>
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
                  here. Extra formatting or boilerplate won't affect the results.
                </p>
                {errors.jobDescriptionText && (
                  <FieldError id="jobDescriptionText-error" errors={[errors.jobDescriptionText]} />
                )}
              </Field>
            </FieldGroup>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
