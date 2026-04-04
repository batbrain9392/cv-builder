import { Menu } from '@base-ui/react/menu';
import { DownloadIcon, FolderOpenIcon, InfoIcon, SaveIcon } from 'lucide-react';
import { Link } from 'react-router';

import { AppHeader } from '@/components/AppHeader';
import { menuItemClass } from '@/components/menuItemClass';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onLoad: () => void;
  onSave: () => void;
  onDownload: () => void;
}

export function FormActions({ onLoad, onSave, onDownload }: FormActionsProps) {
  return (
    <AppHeader
      mobileMenuItems={
        <Menu.Item className={menuItemClass} render={<Link to="/" />}>
          <InfoIcon className="size-4" />
          Why BioBot?
        </Menu.Item>
      }
    >
      {/* Icon-only on mobile bottom bar, labelled on desktop top bar */}
      <Button
        variant="inverted"
        size="icon-sm"
        className="sm:hidden"
        onClick={onLoad}
        aria-label="Load data"
      >
        <FolderOpenIcon />
      </Button>
      <Button
        variant="inverted"
        size="icon-sm"
        className="sm:hidden"
        onClick={onSave}
        aria-label="Save to browser"
      >
        <SaveIcon />
      </Button>
      <Button
        variant="inverted"
        size="icon-sm"
        className="sm:hidden"
        onClick={onDownload}
        aria-label="Download CV"
      >
        <DownloadIcon />
      </Button>

      <Button variant="inverted" size="sm" className="hidden sm:inline-flex" onClick={onLoad}>
        <FolderOpenIcon data-icon="inline-start" />
        Load
      </Button>
      <Button variant="inverted" size="sm" className="hidden sm:inline-flex" onClick={onSave}>
        <SaveIcon data-icon="inline-start" />
        Save
      </Button>
      <Button variant="inverted" size="sm" className="hidden sm:inline-flex" onClick={onDownload}>
        <DownloadIcon data-icon="inline-start" />
        Download
      </Button>

      <Link
        to="/"
        className="hidden items-center gap-1 rounded-lg border border-primary-foreground/30 px-2.5 py-1 text-[0.8rem] font-medium text-primary-foreground hover:bg-primary-foreground/15 sm:inline-flex"
      >
        <InfoIcon className="size-3.5" />
        Why BioBot?
      </Link>
    </AppHeader>
  );
}
