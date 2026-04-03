import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import type { CvFormData } from '../cvFormSchema.ts';

const HELP_STEPS = [
  {
    title: 'Sign in to Google AI Studio',
    body: (
      <>
        Go to{' '}
        <a
          href="https://aistudio.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          aistudio.google.com
        </a>{' '}
        and sign in with your Google account. Any personal Google account works.
      </>
    ),
  },
  {
    title: 'Open the API Keys page',
    body: (
      <>
        Navigate to{' '}
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          API Keys
        </a>{' '}
        (or click <strong>Get API key</strong> in the left sidebar).
      </>
    ),
  },
  {
    title: 'Pick or create a Google Cloud project',
    body: 'Click Create API key. You\u2019ll be asked to select a Google Cloud project. If you don\u2019t have one, choose Create new project \u2014 it\u2019s free and takes a few seconds. The project is just a container for your key.',
  },
  {
    title: 'Copy the key and paste it above',
    body: (
      <>
        Once the key is generated, copy it (it starts with{' '}
        <code className="rounded bg-muted px-1 text-[0.7rem]">AIza</code>) and paste it into the
        field above. It is only sent directly to Google from your browser.
      </>
    ),
  },
];

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
                aria-label="Toggle AI settings"
                className="flex w-full items-center justify-between text-left"
              />
            }
          >
            <CardTitle>
              AI Assist{' '}
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
                </p>

                <ol className="list-inside list-decimal space-y-2 rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
                  {HELP_STEPS.map((step) => (
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
