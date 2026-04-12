import { CheckIcon, ClipboardIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { BlockMarkdown } from '@/cv/preview/Markdown.tsx';

interface GeneratedSummaryCardProps {
  summary: { content: string; reasoning: string };
  onCopy: (text: string) => void;
  onDismiss: () => void;
  onUse: () => void;
}

export function GeneratedSummaryCard({
  summary,
  onCopy,
  onDismiss,
  onUse,
}: GeneratedSummaryCardProps) {
  return (
    <div className="space-y-2 rounded-lg border border-dashed border-primary/30 bg-muted/50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          AI-generated summary
          {summary.reasoning && <span className="block font-normal">{summary.reasoning}</span>}
        </span>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onCopy(summary.content)}
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
      <BlockMarkdown text={summary.content} className="text-sm" />
      <Button type="button" variant="default" size="sm" onClick={onUse}>
        <CheckIcon data-icon="inline-start" />
        Use this summary
      </Button>
    </div>
  );
}
