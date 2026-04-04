import { Dialog } from '@base-ui/react/dialog';
import { FileDownIcon, FileJsonIcon, Loader2Icon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExportJson: () => void;
  onExportDocx: () => void;
  exporting: boolean;
}

export function DownloadDialog({
  open,
  onOpenChange,
  onExportJson,
  onExportDocx,
  exporting,
}: DownloadDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border bg-popover text-popover-foreground shadow-lg">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <Dialog.Title className="text-base font-semibold">Download your CV</Dialog.Title>
            <Dialog.Close render={<Button variant="ghost" size="icon-xs" aria-label="Close" />}>
              <XIcon />
            </Dialog.Close>
          </div>

          <div className="space-y-3 px-6 py-4">
            <Dialog.Description className="text-sm text-muted-foreground">
              Pick a format:
            </Dialog.Description>

            <button
              type="button"
              onClick={onExportJson}
              className="flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <FileJsonIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <span className="block text-left">
                <span className="block text-sm font-medium">JSON backup</span>
                <span className="block text-xs text-muted-foreground">
                  Saves your full CV data so you can reload and edit it later. Think of it as a save
                  file.
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={onExportDocx}
              disabled={exporting}
              className="flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            >
              {exporting ? (
                <Loader2Icon className="mt-0.5 size-5 shrink-0 animate-spin text-muted-foreground" />
              ) : (
                <FileDownIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              )}
              <span className="block text-left">
                <span className="block text-sm font-medium">
                  {exporting ? 'Downloading\u2026' : 'Word document (.docx)'}
                </span>
                <span className="block text-xs text-muted-foreground">
                  A polished, ready-to-send resume. Best for job applications and recruiters.
                </span>
              </span>
            </button>

            <p className="pt-1 text-xs text-muted-foreground">
              Tip: always keep a JSON backup of your latest changes. Store it in Google Drive,
              iCloud, or similar &mdash; this app does not save data to the cloud.
            </p>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
