import {
  AlertTriangleIcon,
  ChevronDownIcon,
  FileJsonIcon,
  FolderOpenIcon,
  Loader2Icon,
  SparklesIcon,
} from 'lucide-react';
import { useCallback, useState } from 'react';

import { GeminiIcon } from '@/components/GeminiIcon';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileDropZone } from '@/components/ui/FileDropZone';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import type { CvFormData } from '../cvFormSchema.ts';

import { parseCvFromFile } from '../ai/parseCvFromFile.ts';
import { parseCvFromText, type ParseCvResult } from '../ai/parseCvFromText.ts';

interface ImportDataFieldsProps {
  currentApiKey: string;
  onPickJsonFile: () => void;
  onImportParsed: (data: CvFormData) => void;
}

export function ImportDataFields({
  currentApiKey,
  onPickJsonFile,
  onImportParsed,
}: ImportDataFieldsProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dropZoneKey, setDropZoneKey] = useState(0);
  const [cvText, setCvText] = useState('');
  const [textOpen, setTextOpen] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseCvResult | null>(null);
  const [error, setError] = useState('');

  const resetDropZone = useCallback(() => {
    setFile(null);
    setDropZoneKey((k) => k + 1);
  }, []);

  const handleParseFile = useCallback(async () => {
    if (!currentApiKey.trim() || !file) return;
    setParsing(true);
    setError('');
    setParseResult(null);
    try {
      const result = await parseCvFromFile(currentApiKey, file);
      setParseResult(result);
      if (result.issues.length === 0) {
        onImportParsed({ ...result.data, aiApiKey: currentApiKey });
        resetDropZone();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CV.');
    } finally {
      setParsing(false);
    }
  }, [currentApiKey, file, onImportParsed, resetDropZone]);

  const handleParseText = useCallback(async () => {
    if (!currentApiKey.trim()) return;
    setParsing(true);
    setError('');
    setParseResult(null);
    try {
      const result = await parseCvFromText(currentApiKey, cvText);
      setParseResult(result);
      if (result.issues.length === 0) {
        onImportParsed({ ...result.data, aiApiKey: currentApiKey });
        setCvText('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CV.');
    } finally {
      setParsing(false);
    }
  }, [currentApiKey, cvText, onImportParsed]);

  const handleLoadAnyway = useCallback(() => {
    if (parseResult) {
      onImportParsed({ ...parseResult.data, aiApiKey: currentApiKey });
      setCvText('');
      resetDropZone();
      setParseResult(null);
    }
  }, [parseResult, currentApiKey, onImportParsed, resetDropZone]);

  const handleTryAgain = useCallback(() => {
    setParseResult(null);
    setError('');
  }, []);

  const hasIssues = parseResult !== null && parseResult.issues.length > 0;

  return (
    <section aria-labelledby="import-data-title" className="space-y-3">
      <h3 id="import-data-title" className="flex items-center gap-1.5 text-sm font-semibold">
        <FolderOpenIcon className="size-4" />
        Load Existing Data
      </h3>
      <p className="text-xs text-muted-foreground">
        Already have a CV? Upload a file or paste text and let Gemini parse it.
      </p>

      <div className="space-y-3 rounded-lg border p-3">
        <div className="flex items-start gap-3">
          <SparklesIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <span className="block text-left">
            <span className="block text-sm font-medium">Upload your CV</span>
            <span className="block text-xs text-muted-foreground">
              PDF, Word document, image, or plain text file. Gemini will parse it into structured
              fields.
            </span>
          </span>
        </div>

        <FileDropZone
          key={dropZoneKey}
          accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,.txt"
          acceptLabel="PDF, Word, images, or plain text"
          onFile={(f) => {
            setFile(f);
            setParseResult(null);
            setError('');
          }}
          onClear={() => {
            setFile(null);
            setParseResult(null);
            setError('');
          }}
          disabled={parsing}
        />

        <div className="flex flex-wrap items-center gap-2">
          {!hasIssues && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleParseFile}
              disabled={parsing || !file || !currentApiKey.trim()}
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
          {!currentApiKey.trim() && file && (
            <span className="text-xs text-muted-foreground">
              Enter a Gemini API key above first
            </span>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {hasIssues && (
        <div
          role="alert"
          className="space-y-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-3 py-2.5"
        >
          <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
            Parsed successfully, but some data needs your attention.
          </p>
          <p className="text-xs text-muted-foreground">
            Load the data and fix these in the editor:
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {parseResult.issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="mt-px shrink-0" aria-hidden="true">
                  ☐
                </span>
                {issue}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={handleTryAgain}>
              Try again
            </Button>
            <Button type="button" variant="default" size="sm" onClick={handleLoadAnyway}>
              Load anyway
            </Button>
          </div>
        </div>
      )}

      <Collapsible open={textOpen} onOpenChange={setTextOpen}>
        <CollapsibleTrigger
          render={
            <button
              type="button"
              aria-expanded={textOpen}
              aria-label={textOpen ? 'Hide paste text section' : 'Show paste text section'}
              className="w-full rounded-md text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          }
        >
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ChevronDownIcon
              className={cn('size-3.5 transition-transform', textOpen && 'rotate-180')}
            />
            Or paste text instead
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-3">
          <Textarea
            aria-label="CV text to import"
            value={cvText}
            onChange={(e) => {
              setCvText(e.target.value);
              setParseResult(null);
              setError('');
            }}
            rows={4}
            placeholder="Paste your CV text here..."
            disabled={parsing}
            className="text-sm"
          />

          <div className="flex flex-wrap items-center gap-2">
            {!hasIssues && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleParseText}
                disabled={parsing || !cvText.trim() || !currentApiKey.trim()}
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
            {!currentApiKey.trim() && cvText.trim() && (
              <span className="text-xs text-muted-foreground">
                Enter a Gemini API key above first
              </span>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <button
        type="button"
        onClick={onPickJsonFile}
        className="flex w-full items-start gap-3 rounded-lg border border-dashed border-border/80 bg-muted/20 p-3 text-left transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <FileJsonIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <span className="block text-left">
          <span className="block text-sm font-medium text-muted-foreground">Load JSON backup</span>
          <span className="block text-xs text-muted-foreground">
            Import a cv.json file previously exported from this app.
          </span>
        </span>
      </button>
    </section>
  );
}
