import type React from 'react';

import { Menu } from '@base-ui/react/menu';
import {
  BotIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  MoonIcon,
  Share2Icon,
  SunIcon,
} from 'lucide-react';
import { Link } from 'react-router';

import { InstallPwa } from '@/components/InstallPwa';
import { menuItemClass } from '@/components/menuItemClass';
import { ShareButton } from '@/components/ShareButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { shareApp } from '@/lib/share';
import { useInstallPwa } from '@/lib/useInstallPwa';
import { useTheme } from '@/lib/useTheme';

interface AppHeaderProps {
  children?: React.ReactNode;
  mobileMenuItems?: React.ReactNode;
}

export function AppHeader({ children, mobileMenuItems }: AppHeaderProps) {
  const { theme, toggle: toggleTheme } = useTheme();
  const { state: installState, handleInstall } = useInstallPwa();

  return (
    <header className="z-40 flex shrink-0 justify-center bg-primary py-3 text-primary-foreground shadow-md">
      <div className="flex w-full max-w-[1728px] items-center justify-between px-4 lg:px-6 xl:px-8">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <BotIcon className="size-6" aria-hidden="true" />
          BioBot
        </Link>

        <nav aria-label="App actions" className="flex items-center gap-2">
          <div className="hidden sm:flex">
            <InstallPwa />
          </div>
          <div className="hidden sm:flex">
            <ShareButton />
          </div>
          <ThemeToggle className="hidden sm:inline-flex" />

          {children}

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
                  {installState !== 'standalone' && (
                    <Menu.Item
                      className={menuItemClass}
                      onClick={installState === 'installable' ? handleInstall : undefined}
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
                  {mobileMenuItems}
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </nav>
      </div>
    </header>
  );
}
