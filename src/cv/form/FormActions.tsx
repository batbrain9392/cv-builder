import { Menu } from '@base-ui/react/menu';
import { DownloadIcon, EyeIcon, InfoIcon, SaveIcon, Trash2Icon } from 'lucide-react';
import { Link } from 'react-router';

import { AppHeader } from '@/components/AppHeader';
import { menuItemClass } from '@/components/menuItemClass';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

interface FormActionsProps {
  onClear: () => void;
  onSave: () => void;
  onDownload: () => void;
  onScrollToPreview: () => void;
  previewVisible: boolean;
}

export function FormActions({
  onClear,
  onSave,
  onDownload,
  onScrollToPreview,
  previewVisible,
}: FormActionsProps) {
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
              variant="inverted"
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
              variant="inverted-fill"
              size="icon-sm"
              className="lg:hidden"
              onClick={onDownload}
              aria-label="Download"
            >
              <DownloadIcon />
            </Button>
          </Tooltip>
          <Tooltip label="Scroll to preview">
            <Button
              variant="inverted"
              size="icon-sm"
              className={
                'lg:hidden transition-all duration-300' +
                (previewVisible ? ' opacity-40 pointer-events-none' : '')
              }
              onClick={onScrollToPreview}
              aria-label="Scroll to preview"
            >
              <EyeIcon />
            </Button>
          </Tooltip>
        </>
      }
      mobileMenuItems={
        <Menu.Item className={menuItemClass} render={<Link to="/" />}>
          <InfoIcon className="size-4" />
          Why BioBot?
        </Menu.Item>
      }
    >
      <Link
        to="/"
        className="hidden items-center gap-1 rounded-lg border border-primary-foreground/30 px-2.5 py-1 text-[0.8rem] font-medium text-primary-foreground hover:bg-primary-foreground/15 lg:inline-flex"
      >
        <InfoIcon className="size-3.5" />
        Why BioBot?
      </Link>
    </AppHeader>
  );
}
