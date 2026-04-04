import { Menu } from '@base-ui/react/menu';
import { DownloadIcon, InfoIcon } from 'lucide-react';
import { Link } from 'react-router';

import { AppHeader } from '@/components/AppHeader';
import { menuItemClass } from '@/components/menuItemClass';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onDownload: () => void;
}

export function FormActions({ onDownload }: FormActionsProps) {
  return (
    <AppHeader
      mobileMenuItems={
        <Menu.Item className={menuItemClass} render={<Link to="/" />}>
          <InfoIcon className="size-4" />
          Why BioBot?
        </Menu.Item>
      }
    >
      <Button
        variant="inverted"
        size="icon-sm"
        className="sm:hidden"
        onClick={onDownload}
        aria-label="Download CV"
      >
        <DownloadIcon />
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
