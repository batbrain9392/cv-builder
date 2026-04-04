import { Menu } from '@base-ui/react/menu';
import { BrainIcon } from 'lucide-react';
import { Link } from 'react-router';

import { AppHeader } from '@/components/AppHeader';
import { menuItemClass } from '@/components/menuItemClass';

export function FormActions() {
  return (
    <AppHeader
      mobileMenuItems={
        <Menu.Item className={menuItemClass} render={<Link to="/behind-the-bot" />}>
          <BrainIcon className="size-4" />
          Behind the Bot
        </Menu.Item>
      }
    >
      <Link
        to="/behind-the-bot"
        className="hidden items-center gap-1 rounded-lg border border-primary-foreground/30 px-2.5 py-1 text-[0.8rem] font-medium text-primary-foreground hover:bg-primary-foreground/15 sm:inline-flex"
      >
        <BrainIcon className="size-3.5" />
        Behind the Bot
      </Link>
    </AppHeader>
  );
}
