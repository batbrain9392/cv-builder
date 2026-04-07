import type React from 'react';

import { Menu } from '@base-ui/react/menu';
import { EllipsisVerticalIcon, MoonIcon, Share2Icon, SunIcon } from 'lucide-react';

import { AppLogo } from '@/components/AppLogo';
import { menuItemClass } from '@/components/menuItemClass';
import { ShareButton } from '@/components/ShareButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { shareApp } from '@/lib/share';
import { useIsKeyboardOpen } from '@/lib/useIsKeyboardOpen';
import { useTheme } from '@/lib/useTheme';

interface AppHeaderProps {
  children?: React.ReactNode;
  mobileActionButtons?: React.ReactNode;
  mobileMenuItems?: React.ReactNode;
}

export function AppHeader({ children, mobileActionButtons, mobileMenuItems }: AppHeaderProps) {
  const { theme, toggle: toggleTheme } = useTheme();
  const keyboardOpen = useIsKeyboardOpen();

  return (
    <header
      className={
        'z-40 flex shrink-0 justify-center bg-primary py-3 text-primary-foreground' +
        ' fixed inset-x-0 bottom-0 shadow-[0_-2px_6px] shadow-black/15 dark:shadow-black/40 transition-transform duration-200' +
        ' lg:static lg:order-first lg:shadow-md lg:transition-none' +
        (keyboardOpen ? ' translate-y-full lg:translate-y-0' : '')
      }
    >
      <div className="flex w-full max-w-[1728px] items-center justify-between px-4 lg:px-6 xl:px-8">
        <AppLogo />

        <nav aria-label="App actions" className="flex items-center gap-2">
          <div className="hidden lg:flex">
            <ShareButton />
          </div>
          <ThemeToggle className="hidden lg:inline-flex" />

          {children}

          {mobileActionButtons}

          <Menu.Root>
            <Menu.Trigger
              render={
                <Button
                  variant="inverted"
                  size="icon-sm"
                  className="lg:hidden"
                  aria-label="Actions"
                />
              }
            >
              <EllipsisVerticalIcon />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner className="z-[60]" align="end" side="top" sideOffset={12}>
                <Menu.Popup className="min-w-40 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
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
