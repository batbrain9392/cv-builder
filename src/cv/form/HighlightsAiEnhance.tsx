import type { UseFormRegisterReturn } from 'react-hook-form';

import { CheckIcon, ChevronDownIcon, ClipboardIcon, Loader2Icon, XIcon } from 'lucide-react';
import { useState } from 'react';

import type { AiResult } from '@/cv/ai/generateWithAi.ts';

import { GeminiIcon } from '@/components/GeminiIcon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Field, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { InlineMarkdown } from '@/cv/preview/Markdown.tsx';

interface HighlightsAiEnhanceProps {
  canGenerate: boolean;
  generating: boolean;
  generatedItems: AiResult<string[]> | null;
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
  generatedItems,
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
            className="flex items-center hover:opacity-80"
          />
        }
      >
        <Badge variant="secondary" className="h-auto gap-1 text-xs [&>svg]:!size-3.5">
          <GeminiIcon className="size-3.5" />
          <ChevronDownIcon
            className={'size-3.5 transition-transform' + (open ? ' rotate-180' : '')}
          />
          Enhance with AI
        </Badge>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-3 pt-2">
        <Field>
          <FieldLabel htmlFor={promptId}>AI prompt</FieldLabel>
          <Textarea
            id={promptId}
            {...registerPrompt}
            rows={4}
            className="text-xs"
            placeholder="Rewrite these highlights concisely, emphasising relevant skills and achievements."
          />
        </Field>

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
              <GeminiIcon className="size-4" data-icon="inline-start" />
            )}
            {generating ? 'Generating…' : 'Generate with AI'}
          </Button>
          {!canGenerate && <span className="text-xs text-muted-foreground">Requires API key</span>}
        </div>

        {generatedItems && (
          <div className="space-y-2 rounded-lg border border-dashed border-primary/30 bg-muted/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                AI-generated highlights
                {generatedItems.reasoning && (
                  <span className="block font-normal">{generatedItems.reasoning}</span>
                )}
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
              {generatedItems.content.map((item, i) => (
                <li key={i}>
                  <InlineMarkdown text={item} />
                </li>
              ))}
            </ul>
            <Button type="button" variant="default" size="sm" onClick={onUse}>
              <CheckIcon data-icon="inline-start" />
              Use these highlights
            </Button>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
