import type React from 'react';

import { Menu } from '@base-ui/react/menu';
import {
  BotIcon,
  EllipsisVerticalIcon,
  FileDownIcon,
  FileOutputIcon,
  FolderOpenIcon,
  Loader2Icon,
} from 'lucide-react';
import { useRef } from 'react';

import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportJson: () => void;
  onExportDocx: () => void;
  exporting: boolean;
}

const menuItemClass =
  'flex cursor-default items-center gap-2 rounded-md px-3 py-2 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground';

export function FormActions({ onImport, onExportJson, onExportDocx, exporting }: FormActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImport(e);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header className="z-40 flex shrink-0 items-center justify-between bg-primary px-4 py-3 text-primary-foreground shadow-md lg:px-6 xl:px-8">
      <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <BotIcon className="size-6" />
        Bot-ter Than You
      </h1>

      <nav aria-label="CV actions" className="flex items-center gap-2">
        <ThemeToggle />

        {/* Mobile: overflow menu */}
        <Menu.Root>
          <Menu.Trigger
            render={
              <Button
                variant="inverted"
                size="icon-sm"
                className="sm:hidden"
                aria-label="Actions"
              />
            }
          >
            <EllipsisVerticalIcon />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner align="end" sideOffset={12}>
              <Menu.Popup className="z-50 min-w-40 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
                <Menu.Item className={menuItemClass} onClick={() => fileInputRef.current?.click()}>
                  <FolderOpenIcon className="size-4" />
                  Load data
                </Menu.Item>
                <Menu.Item className={menuItemClass} onClick={onExportJson}>
                  <FileOutputIcon className="size-4" />
                  Export data
                </Menu.Item>
                <Menu.Item className={menuItemClass} disabled={exporting} onClick={onExportDocx}>
                  {exporting ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <FileDownIcon className="size-4" />
                  )}
                  {exporting ? 'Downloading…' : 'Download DOCX'}
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>

        {/* Desktop: full buttons */}
        <Button
          variant="inverted"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={() => fileInputRef.current?.click()}
        >
          <FolderOpenIcon data-icon="inline-start" />
          Load data
        </Button>

        <Button
          variant="inverted"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={onExportJson}
        >
          <FileOutputIcon data-icon="inline-start" />
          Export data
        </Button>

        <Button
          variant="inverted-fill"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={onExportDocx}
          disabled={exporting}
          aria-busy={exporting || undefined}
        >
          {exporting ? (
            <Loader2Icon className="animate-spin" data-icon="inline-start" />
          ) : (
            <FileDownIcon data-icon="inline-start" />
          )}
          {exporting ? 'Downloading…' : 'Download DOCX'}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          aria-label="Import CV JSON"
          onChange={handleImport}
          className="hidden"
        />
      </nav>
    </header>
  );
}
