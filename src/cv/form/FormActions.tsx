import { Menu } from '@base-ui/react/menu';
import { InfoIcon } from 'lucide-react';
import { Link } from 'react-router';

import { AppHeader } from '@/components/AppHeader';
import { menuItemClass } from '@/components/menuItemClass';

export function FormActions() {
  return (
    <AppHeader
      mobileMenuItems={
        <Menu.Item className={menuItemClass} render={<Link to="/" />}>
          <InfoIcon className="size-4" />
          Why BioBot?
        </Menu.Item>
      }
    >
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
