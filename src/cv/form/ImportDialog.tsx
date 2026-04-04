import { Dialog } from '@base-ui/react/dialog';
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  FileJsonIcon,
  Loader2Icon,
  SparklesIcon,
  XIcon,
} from 'lucide-react';
import { useCallback, useState } from 'react';

import { GeminiIcon } from '@/components/GeminiIcon';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import type { CvFormData } from '../cvFormSchema.ts';

import { GEMINI_HELP_STEPS } from '../ai/geminiHelpSteps.tsx';
import { parseCvFromText, type ParseCvResult } from '../ai/parseCvFromText.ts';
import { BackupReminder } from './BackupReminder.tsx';

type Step = 'choose' | 'api-key' | 'paste' | 'done';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPickJsonFile: () => void;
  onImportParsed: (data: CvFormData) => void;
  currentApiKey: string;
}

export function ImportDialog({
  open,
  onOpenChange,
  onPickJsonFile,
  onImportParsed,
  currentApiKey,
}: ImportDialogProps) {
  const [step, setStep] = useState<Step>('choose');
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [cvText, setCvText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseCvResult | null>(null);
  const [error, setError] = useState('');

  const resetState = useCallback(() => {
    setStep('choose');
    setApiKey(currentApiKey);
    setCvText('');
    setParsing(false);
    setParseResult(null);
    setError('');
  }, [currentApiKey]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) resetState();
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetState],
  );

  const handlePickJson = () => {
    handleOpenChange(false);
    // Delay allows the dialog close animation to finish before the native
    // file picker opens, which prevents focus-restoration conflicts.
    setTimeout(() => onPickJsonFile(), 150);
  };

  const handleStartFresh = () => {
    setApiKey(currentApiKey);
    setStep('api-key');
  };

  const handleParse = async () => {
    setParsing(true);
    setError('');
    setParseResult(null);
    try {
      const result = await parseCvFromText(apiKey, cvText);
      setParseResult(result);
      if (result.issues.length === 0) {
        setStep('done');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CV.');
    } finally {
      setParsing(false);
    }
  };

  const handleLoadAnyway = () => {
    if (parseResult) setStep('done');
  };

  const handleFinish = () => {
    if (parseResult) {
      onImportParsed({ ...parseResult.data, aiApiKey: apiKey });
    }
    handleOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border bg-popover text-popover-foreground shadow-lg">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <Dialog.Title className="text-base font-semibold">
              {step === 'choose' && 'Load CV data'}
              {step === 'api-key' && 'Step 1: Gemini API Key'}
              {step === 'paste' && 'Step 2: Paste your CV'}
              {step === 'done' && 'Import complete'}
            </Dialog.Title>
            <Dialog.Close render={<Button variant="ghost" size="icon-xs" aria-label="Close" />}>
              <XIcon />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {step === 'choose' && (
              <ChooseStep onPickJson={handlePickJson} onStartFresh={handleStartFresh} />
            )}
            {step === 'api-key' && <ApiKeyStep apiKey={apiKey} onApiKeyChange={setApiKey} />}
            {step === 'paste' && (
              <PasteStep
                cvText={cvText}
                onCvTextChange={setCvText}
                parsing={parsing}
                error={error}
                parseResult={parseResult}
              />
            )}
            {step === 'done' && <DoneStep />}
          </div>

          <div className="flex items-center justify-between border-t px-6 py-4">
            <div>
              {(step === 'api-key' || step === 'paste') && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(step === 'paste' ? 'api-key' : 'choose')}
                  disabled={parsing}
                >
                  <ArrowLeftIcon data-icon="inline-start" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {step === 'api-key' && (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setStep('paste')}
                  disabled={!apiKey.trim()}
                >
                  Next
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
              )}
              {step === 'paste' && !parseResult?.issues.length && (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleParse}
                  disabled={parsing || !cvText.trim()}
                  aria-busy={parsing || undefined}
                >
                  {parsing ? (
                    <Loader2Icon className="animate-spin" data-icon="inline-start" />
                  ) : (
                    <GeminiIcon className="size-3.5" data-icon="inline-start" />
                  )}
                  {parsing ? 'Parsing\u2026' : 'Parse with Gemini'}
                </Button>
              )}
              {step === 'paste' && parseResult && parseResult.issues.length > 0 && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setParseResult(null);
                      setError('');
                    }}
                  >
                    Try again
                  </Button>
                  <Button type="button" variant="default" size="sm" onClick={handleLoadAnyway}>
                    Load anyway
                  </Button>
                </>
              )}
              {step === 'done' && (
                <Button type="button" variant="default" size="sm" onClick={handleFinish}>
                  Open editor
                </Button>
              )}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ChooseStep({
  onPickJson,
  onStartFresh,
}: {
  onPickJson: () => void;
  onStartFresh: () => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">How would you like to get started?</p>
      <button
        type="button"
        onClick={onPickJson}
        className="flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <FileJsonIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <span className="block text-left">
          <span className="block text-sm font-medium">I have previously exported data</span>
          <span className="block text-xs text-muted-foreground">
            Load a cv.json file previously exported from this app.
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={onStartFresh}
        className="flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <SparklesIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <span className="block text-left">
          <span className="block text-sm font-medium">Start fresh with my CV</span>
          <span className="block text-xs text-muted-foreground">
            Paste your CV text and let Gemini parse it into the editor for you.
          </span>
        </span>
      </button>
    </div>
  );
}

function ApiKeyStep({
  apiKey,
  onApiKeyChange,
}: {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}) {
  return (
    <div className="space-y-4">
      {apiKey ? (
        <p className="text-sm text-muted-foreground">
          Your Gemini API key is already configured. You can update it below or continue.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Parsing uses Google Gemini. Enter your API key to get started &mdash; it&rsquo;s free.
        </p>
      )}

      <Field>
        <FieldLabel htmlFor="import-api-key">Gemini API Key</FieldLabel>
        <Input
          id="import-api-key"
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="AIza..."
          autoComplete="off"
        />
      </Field>

      <ol className="list-inside list-decimal space-y-2 rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
        {GEMINI_HELP_STEPS.map((step) => (
          <li key={step.title}>
            <strong className="text-foreground">{step.title}</strong>
            <p className="ml-5">{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PasteStep({
  cvText,
  onCvTextChange,
  parsing,
  error,
  parseResult,
}: {
  cvText: string;
  onCvTextChange: (text: string) => void;
  parsing: boolean;
  error: string;
  parseResult: ParseCvResult | null;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Copy-paste your CV content below. Plain text from a PDF, LinkedIn profile, Word doc &mdash;
        anything works.
      </p>

      <Textarea
        aria-label="CV text"
        value={cvText}
        onChange={(e) => onCvTextChange(e.target.value)}
        rows={6}
        placeholder="Paste your CV text here..."
        disabled={parsing}
        className="max-h-48 overflow-y-auto text-sm"
      />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {parseResult && parseResult.issues.length > 0 && (
        <details className="rounded-lg border border-yellow-500/30 bg-yellow-500/5">
          <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-yellow-700 dark:text-yellow-400">
            Parsed with {parseResult.issues.length} issue
            {parseResult.issues.length > 1 ? 's' : ''}
          </summary>
          <div className="space-y-2 border-t border-yellow-500/20 px-3 py-2">
            <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
              {parseResult.issues.slice(0, 8).map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
              {parseResult.issues.length > 8 && (
                <li>...and {parseResult.issues.length - 8} more</li>
              )}
            </ul>
            <p className="text-xs text-muted-foreground">
              You can load the data anyway and fix these in the editor, or try again with different
              text.
            </p>
          </div>
        </details>
      )}
    </div>
  );
}

function DoneStep() {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-3 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
          <SparklesIcon className="size-6 text-primary" />
        </div>
        <p className="text-sm font-medium">Your CV has been imported.</p>
        <p className="text-sm text-muted-foreground">
          Review and edit it in the form. The parsed data may not be perfect &mdash; check
          everything before exporting.
        </p>
      </div>
      <BackupReminder />
    </div>
  );
}
