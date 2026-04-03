import type { UseFormRegisterReturn } from 'react-hook-form';

import {
  CheckIcon,
  ChevronDownIcon,
  ClipboardIcon,
  Loader2Icon,
  SparklesIcon,
  XIcon,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Field, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

interface HighlightsAiEnhanceProps {
  canGenerate: boolean;
  generating: boolean;
  generatedBullets: string[] | null;
  onGenerate: () => void;
  onUse: () => void;
  onCopy: () => void;
  onDismiss: () => void;
  promptId: string;
  registerPrompt: UseFormRegisterReturn;
}

export function HighlightsAiEnhance({
  canGenerate,
  generating,
  generatedBullets,
  onGenerate,
  onUse,
  onCopy,
  onDismiss,
  promptId,
  registerPrompt,
}: HighlightsAiEnhanceProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        render={
          <button
            type="button"
            aria-label="Enhance highlights with AI"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          />
        }
      >
        <SparklesIcon className="size-3.5" />
        <ChevronDownIcon
          className={'size-3.5 transition-transform' + (open ? ' rotate-180' : '')}
        />
        Enhance with AI
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!canGenerate || generating}
            onClick={onGenerate}
            aria-busy={generating || undefined}
          >
            {generating ? (
              <Loader2Icon className="animate-spin" data-icon="inline-start" />
            ) : (
              <SparklesIcon data-icon="inline-start" />
            )}
            {generating ? 'Generating…' : 'Generate with AI'}
          </Button>
          {!canGenerate && (
            <span className="text-xs text-muted-foreground">
              Requires API key and job description
            </span>
          )}
        </div>

        {generatedBullets && (
          <div className="space-y-2 rounded-lg border border-dashed border-primary/30 bg-muted/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                AI-generated highlights
              </span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={onCopy}
                  aria-label="Copy to clipboard"
                >
                  <ClipboardIcon />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={onDismiss}
                  aria-label="Dismiss"
                >
                  <XIcon />
                </Button>
              </div>
            </div>
            <ul className="list-disc space-y-1 pl-4 text-sm">
              {generatedBullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
            <Button type="button" variant="default" size="sm" onClick={onUse}>
              <CheckIcon data-icon="inline-start" />
              Use these highlights
            </Button>
          </div>
        )}

        <Field>
          <FieldLabel htmlFor={promptId}>AI prompt</FieldLabel>
          <Textarea id={promptId} {...registerPrompt} rows={4} className="text-xs" />
        </Field>
      </CollapsibleContent>
    </Collapsible>
  );
}
