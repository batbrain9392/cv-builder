import { AlertDialog } from '@base-ui/react/alert-dialog';

import { Button } from '@/components/ui/button';

import { DownloadDialog } from '../cv/form/DownloadDialog.tsx';

interface CvEditorDialogsProps {
  apiKeyWarningOpen: boolean;
  setApiKeyWarningOpen: (open: boolean) => void;
  onExportJsonWithoutKey: () => void;
  onExportJsonWithKey: () => void;

  clearConfirmOpen: boolean;
  setClearConfirmOpen: (open: boolean) => void;
  onClearAll: () => void;

  downloadDialogOpen: boolean;
  setDownloadDialogOpen: (open: boolean) => void;
  onExportJson: () => void;
  onExportDocx: () => void;
  exporting: boolean;
}

export function CvEditorDialogs({
  apiKeyWarningOpen,
  setApiKeyWarningOpen,
  onExportJsonWithoutKey,
  onExportJsonWithKey,
  clearConfirmOpen,
  setClearConfirmOpen,
  onClearAll,
  downloadDialogOpen,
  setDownloadDialogOpen,
  onExportJson,
  onExportDocx,
  exporting,
}: CvEditorDialogsProps) {
  return (
    <>
      <AlertDialog.Root open={apiKeyWarningOpen} onOpenChange={setApiKeyWarningOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs" />
          <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-popover p-6 text-popover-foreground shadow-lg">
            <AlertDialog.Title className="text-base font-semibold">
              Your export contains a Gemini API key
            </AlertDialog.Title>
            <AlertDialog.Description
              render={<div />}
              className="mt-3 space-y-3 text-sm text-muted-foreground"
            >
              <p>
                The JSON file you&rsquo;re about to download includes your Gemini API key. Choose
                how to proceed:
              </p>
              <ul className="space-y-2">
                <li className="rounded-md border bg-muted/40 p-2.5">
                  <strong className="text-foreground">Export without key</strong>
                  <p className="mt-0.5">
                    Strips the key from the file. Safe to share or commit. You&rsquo;ll need to
                    re-enter the key next time you load this file.
                  </p>
                </li>
                <li className="rounded-md border bg-muted/40 p-2.5">
                  <strong className="text-foreground">Export with key</strong>
                  <p className="mt-0.5">
                    Keeps the key in the file for convenience. Do not share this file publicly —
                    anyone with it can use your key.
                  </p>
                </li>
              </ul>
            </AlertDialog.Description>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <AlertDialog.Close render={<Button variant="secondary" size="sm" />}>
                Cancel
              </AlertDialog.Close>
              <Button variant="outline" size="sm" onClick={onExportJsonWithoutKey}>
                Export without key
              </Button>
              <Button variant="default" size="sm" onClick={onExportJsonWithKey}>
                Export with key
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <AlertDialog.Root open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs" />
          <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-popover p-6 text-popover-foreground shadow-lg">
            <AlertDialog.Title className="text-base font-semibold">
              Clear all data?
            </AlertDialog.Title>
            <AlertDialog.Description
              render={<div />}
              className="mt-3 space-y-2 text-sm text-muted-foreground"
            >
              <p>
                This will erase all CV data from the form and from your browser&rsquo;s local
                storage. You can&rsquo;t undo this.
              </p>
              <p>
                If you haven&rsquo;t already, use the <strong>Download</strong> button first to save
                a JSON backup.
              </p>
            </AlertDialog.Description>
            <div className="mt-4 flex justify-end gap-2">
              <AlertDialog.Close render={<Button variant="secondary" size="sm" />}>
                Cancel
              </AlertDialog.Close>
              <Button variant="destructive" size="sm" onClick={onClearAll}>
                Clear everything
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <DownloadDialog
        open={downloadDialogOpen}
        onOpenChange={setDownloadDialogOpen}
        onExportJson={onExportJson}
        onExportDocx={onExportDocx}
        exporting={exporting}
      />
    </>
  );
}
