import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';

import { GeminiIcon } from '@/components/GeminiIcon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import type { CvFormData } from '../cvFormSchema.ts';

import { GEMINI_HELP_STEPS } from '../ai/geminiHelpSteps.tsx';

interface AiSettingsFieldsProps {
  register: UseFormRegister<CvFormData>;
  errors: FieldErrors<CvFormData>;
}

export function AiSettingsFields({ register, errors }: AiSettingsFieldsProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen} className="flex flex-col gap-2">
        <CardHeader>
          <CollapsibleTrigger
            render={
              <button
                type="button"
                aria-label="Toggle Gemini Spark"
                className="flex w-full items-center justify-between text-left"
              />
            }
          >
            <CardTitle className="flex items-center gap-1.5">
              <GeminiIcon className="h-4" />
              Gemini Spark{' '}
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
                This app uses Google Gemini for AI features. Gemini has a free tier with no billing
                required — just a Google account and an API key.
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
                  Your API key is stored in the exported JSON file. Never share that file publicly.
                  Keep the key backed up safely (e.g.&nbsp;a password manager) &mdash; Google
                  won&rsquo;t show it again after creation.
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
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
