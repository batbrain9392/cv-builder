import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { GeminiIcon } from '@/components/GeminiIcon';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import type { CvFormData } from '../cvFormSchema.ts';

import { GEMINI_HELP_STEPS } from '../ai/geminiHelpSteps.tsx';

interface AiSettingsFieldsProps {
  register: UseFormRegister<CvFormData>;
  errors: FieldErrors<CvFormData>;
}

export function AiSettingsFields({ register, errors }: AiSettingsFieldsProps) {
  return (
    <section aria-labelledby="ai-settings-title" className="space-y-1.5">
      <h3 id="ai-settings-title" className="flex items-center gap-1.5 text-sm font-semibold">
        <GeminiIcon className="h-4" />
        Gemini API <span className="font-normal text-muted-foreground">(optional)</span>
      </h3>
      <FieldGroup>
        <p className="text-xs text-muted-foreground">
          This app uses Google Gemini to parse your CV text or JSON into structured form data, and
          later to enhance your summary, cover letter, and experience highlights. Gemini has a free
          tier with no billing required &mdash; just a Google account and an API key.
        </p>
        <Field data-invalid={errors.aiApiKey ? true : undefined}>
          <FieldLabel htmlFor="aiApiKey">Gemini API Key</FieldLabel>
          <Input
            id="aiApiKey"
            type="password"
            {...register('aiApiKey')}
            placeholder="AIza..."
            autoComplete="off"
            aria-invalid={errors.aiApiKey ? true : undefined}
            aria-describedby="aiApiKey-warning"
          />
          <p id="aiApiKey-warning" className="text-xs font-medium text-destructive">
            Your API key is saved in this browser&rsquo;s local storage alongside your CV data. It
            never leaves your device, but anyone with access to this browser can read it. Keep the
            key backed up safely (e.g.&nbsp;a password manager) &mdash; Google won&rsquo;t show it
            again after creation.
          </p>

          <ol className="list-inside list-decimal space-y-2 rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
            {GEMINI_HELP_STEPS.map((step) => (
              <li key={step.title}>
                <strong className="text-foreground">{step.title}</strong>
                <p className="ml-5">{step.body}</p>
              </li>
            ))}
          </ol>

          {errors.aiApiKey && <FieldError id="aiApiKey-error" errors={[errors.aiApiKey]} />}
        </Field>
      </FieldGroup>
    </section>
  );
}
