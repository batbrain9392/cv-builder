import type { ReactNode } from 'react';

export interface HelpStep {
  title: string;
  body: ReactNode;
}

export const GEMINI_HELP_STEPS: HelpStep[] = [
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
    title: 'Copy the key and paste it into the API key field',
    body: (
      <>
        Once the key is generated, copy it (it starts with{' '}
        <code className="rounded bg-muted px-1 text-[0.7rem]">AIza</code>) and paste it into the
        Gemini API Key field. It is only sent directly to Google from your browser.{' '}
        <strong>
          Save a copy of the key somewhere safe (e.g.&nbsp;a password manager) &mdash; Google
          won&rsquo;t show it again.
        </strong>
      </>
    ),
  },
];
