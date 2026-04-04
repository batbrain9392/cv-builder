import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { EmojiIcon } from '@/components/EmojiIcon';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

import type { CvFormData } from '../cvFormSchema.ts';

interface JobDescriptionFieldsProps {
  register: UseFormRegister<CvFormData>;
  errors: FieldErrors<CvFormData>;
}

export function JobDescriptionFields({ register, errors }: JobDescriptionFieldsProps) {
  return (
    <section aria-labelledby="jd-title" className="space-y-1.5">
      <h3 id="jd-title" className="flex items-center gap-1.5 text-sm font-semibold">
        <EmojiIcon emoji="🎯" />
        Job Description <span className="font-normal text-muted-foreground">(optional)</span>
      </h3>
      <FieldGroup>
        <p className="text-xs text-muted-foreground">
          Copy the full job posting text and paste it here. The AI uses this to tailor your summary,
          cover letter, and experience highlights to match the specific role — picking up on
          keywords, required skills, and tone.
        </p>
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
