import { XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function BackupReminder({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3"
    >
      <p className="flex-1 text-sm text-muted-foreground">
        Once you&rsquo;ve reviewed your data, use the <strong>Download</strong> button to save a
        JSON backup. Keep it safe &mdash; in Google Drive, iCloud, or similar.
      </p>
      {onDismiss && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <XIcon />
        </Button>
      )}
    </div>
  );
}
