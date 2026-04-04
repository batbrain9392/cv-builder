import type React from 'react';

import { Menu } from '@base-ui/react/menu';
import {
  BotIcon,
  BrainIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  FolderOpenIcon,
  MoonIcon,
  Share2Icon,
  SunIcon,
} from 'lucide-react';
import { Link } from 'react-router';

import { InstallPwa } from '@/components/InstallPwa';
import { ShareButton } from '@/components/ShareButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { shareApp } from '@/lib/share';
import { useInstallPwa } from '@/lib/useInstallPwa';
import { useTheme } from '@/lib/useTheme';

interface FormActionsProps {
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenImportDialog: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const menuItemClass =
  'flex cursor-default items-center gap-2 rounded-md px-3 py-2 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground';

export function FormActions({ onImport, onOpenImportDialog, fileInputRef }: FormActionsProps) {
  const { theme, toggle: toggleTheme } = useTheme();
  const { state: installState, handleInstall } = useInstallPwa();

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImport(e);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header className="z-40 flex shrink-0 justify-center bg-primary py-3 text-primary-foreground shadow-md">
      <div className="flex w-full max-w-[1728px] items-center justify-between px-4 lg:px-6 xl:px-8">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <BotIcon className="size-6" aria-hidden="true" />
          BioBot
        </Link>

        <nav aria-label="CV actions" className="flex items-center gap-2">
          <div className="hidden sm:flex">
            <InstallPwa />
          </div>
          <div className="hidden sm:flex">
            <ShareButton />
          </div>
          <ThemeToggle className="hidden sm:inline-flex" />

          <Link
            to="/behind-the-bot"
            className="hidden items-center gap-1 rounded-lg border border-primary-foreground/30 px-2.5 py-1 text-[0.8rem] font-medium text-primary-foreground hover:bg-primary-foreground/15 sm:inline-flex"
          >
            <BrainIcon className="size-3.5" />
            Behind the Bot
          </Link>

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
                  {(installState === 'installable' || installState === 'dev-only') && (
                    <Menu.Item
                      className={menuItemClass}
                      onClick={handleInstall}
                      disabled={installState === 'dev-only'}
                    >
                      <DownloadIcon className="size-4" />
                      Install app
                    </Menu.Item>
                  )}
                  <Menu.Item className={menuItemClass} onClick={shareApp}>
                    <Share2Icon className="size-4" />
                    Share
                  </Menu.Item>
                  <Menu.Item className={menuItemClass} onClick={toggleTheme}>
                    {theme === 'light' ? (
                      <MoonIcon className="size-4" />
                    ) : (
                      <SunIcon className="size-4" />
                    )}
                    {theme === 'light' ? 'Dark mode' : 'Light mode'}
                  </Menu.Item>
                  <Menu.Item className={menuItemClass} render={<Link to="/behind-the-bot" />}>
                    <BrainIcon className="size-4" />
                    Behind the Bot
                  </Menu.Item>
                  <Menu.Item className={menuItemClass} onClick={onOpenImportDialog}>
                    <FolderOpenIcon className="size-4" />
                    Load data
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
            onClick={onOpenImportDialog}
          >
            <FolderOpenIcon data-icon="inline-start" />
            Load data
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
      </div>
    </header>
  );
}
