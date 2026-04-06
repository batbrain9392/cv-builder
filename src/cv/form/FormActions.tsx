import { Menu } from '@base-ui/react/menu';
import {
  BookOpenIcon,
  CircleHelpIcon,
  DownloadIcon,
  InfoIcon,
  SaveIcon,
  Trash2Icon,
} from 'lucide-react';
import { Link } from 'react-router';

import { AppHeader } from '@/components/AppHeader';
import { menuItemClass } from '@/components/menuItemClass';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

interface FormActionsProps {
  onClear: () => void;
  onSave: () => void;
  onDownload: () => void;
  previewVisible: boolean;
}

export function FormActions({ onClear, onSave, onDownload, previewVisible }: FormActionsProps) {
  return (
    <AppHeader
      mobileActionButtons={
        <>
          <Tooltip label="Clear all">
            <Button
              variant="inverted"
              size="icon-sm"
              className="lg:hidden"
              onClick={onClear}
              aria-label="Clear all"
            >
              <Trash2Icon />
            </Button>
          </Tooltip>
          <Tooltip label="Save to browser">
            <Button
              variant={previewVisible ? 'inverted' : 'inverted-fill'}
              size="icon-sm"
              className="lg:hidden"
              onClick={onSave}
              aria-label="Save to browser"
            >
              <SaveIcon />
            </Button>
          </Tooltip>
          <Tooltip label="Download">
            <Button
              variant={previewVisible ? 'inverted-fill' : 'inverted'}
              size="icon-sm"
              className="lg:hidden"
              onClick={onDownload}
              aria-label="Download"
            >
              <DownloadIcon />
            </Button>
          </Tooltip>
        </>
      }
      mobileMenuItems={
        <>
          <Menu.Item className={menuItemClass} render={<Link to="/guide" />}>
            <BookOpenIcon className="size-4" />
            How to use
          </Menu.Item>
          <Menu.Item className={menuItemClass} render={<Link to="/" />}>
            <InfoIcon className="size-4" />
            Why BioBot?
          </Menu.Item>
        </>
      }
    >
      <Menu.Root>
        <Menu.Trigger
          render={
            <button
              type="button"
              className="hidden items-center gap-1 rounded-lg border border-primary-foreground/30 px-2.5 py-1 text-[0.8rem] font-medium text-primary-foreground hover:bg-primary-foreground/15 lg:inline-flex"
              aria-label="Help and info"
            />
          }
        >
          <CircleHelpIcon className="size-3.5" />
          Help
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner className="z-60" align="end" side="bottom" sideOffset={8}>
            <Menu.Popup className="min-w-40 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
              <Menu.Item className={menuItemClass} render={<Link to="/guide" />}>
                <BookOpenIcon className="size-4" />
                How to use
              </Menu.Item>
              <Menu.Item className={menuItemClass} render={<Link to="/" />}>
                <InfoIcon className="size-4" />
                Why BioBot?
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </AppHeader>
  );
}
