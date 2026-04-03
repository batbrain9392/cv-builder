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
    title: 'Create an OpenAI account',
    body: (
      <>
        Go to{' '}
        <a
          href="https://platform.openai.com/signup"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          platform.openai.com/signup
        </a>{' '}
        and sign up (or log in if you already have one).
      </>
    ),
  },
  {
    title: 'Add billing',
    body: (
      <>
        Navigate to{' '}
        <a
          href="https://platform.openai.com/settings/organization/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          Settings &rarr; Billing
        </a>{' '}
        and add a payment method. A $5 credit is enough for thousands of generations.
      </>
    ),
  },
  {
    title: 'Generate an API key',
    body: (
      <>
        Go to{' '}
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          API Keys
        </a>
        , click <strong>Create new secret key</strong>, give it a name, and copy the key. It starts
        with <code className="rounded bg-muted px-1 text-[0.7rem]">sk-</code>.
      </>
    ),
  },
  {
    title: 'Paste it above',
    body: 'Paste the key into the field above. It is only sent directly to OpenAI from your browser — this app has no server.',
  },
];

interface AiSettingsFieldsProps {
  register: UseFormRegister<CvFormData>;
  errors: FieldErrors<CvFormData>;
}

export function AiSettingsFields({ register, errors }: AiSettingsFieldsProps) {
  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

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
              <Field data-invalid={errors.aiApiKey ? true : undefined}>
                <FieldLabel htmlFor="aiApiKey">OpenAI API Key</FieldLabel>
                <Input
                  id="aiApiKey"
                  type="password"
                  {...register('aiApiKey')}
                  placeholder="sk-..."
                  autoComplete="off"
                  aria-invalid={errors.aiApiKey ? true : undefined}
                  aria-describedby="aiApiKey-hint aiApiKey-warning"
                />
                <p id="aiApiKey-hint" className="text-xs text-muted-foreground">
                  This app is free and has no backend, so it can&rsquo;t provide an API key. Bring
                  your own from{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    platform.openai.com/api-keys
                  </a>
                  . Usage costs (typically fractions of a cent per generation) go to your OpenAI
                  account.
                </p>
                <p id="aiApiKey-warning" className="text-xs font-medium text-destructive">
                  Your API key is stored in the exported JSON file. Never share that file publicly.
                </p>

                <Collapsible open={helpOpen} onOpenChange={setHelpOpen}>
                  <CollapsibleTrigger
                    render={
                      <button
                        type="button"
                        aria-label="How do I get an API key?"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      />
                    }
                  >
                    <ChevronDownIcon
                      className={'size-3.5 transition-transform' + (helpOpen ? ' rotate-180' : '')}
                    />
                    How do I get an API key?
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ol className="mt-2 list-inside list-decimal space-y-2 rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
                      {HELP_STEPS.map((step) => (
                        <li key={step.title}>
                          <strong className="text-foreground">{step.title}</strong>
                          <p className="ml-5">{step.body}</p>
                        </li>
                      ))}
                    </ol>
                  </CollapsibleContent>
                </Collapsible>

                {errors.aiApiKey && <FieldError id="aiApiKey-error" errors={[errors.aiApiKey]} />}
              </Field>
            </FieldGroup>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
