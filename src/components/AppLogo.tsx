import { Link } from 'react-router';

import { RobotIcon } from '@/components/RobotIcon';

export function AppLogo() {
  return (
    <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
      <RobotIcon className="size-6 [--background:var(--primary)]" aria-hidden="true" />
      BioBot
    </Link>
  );
}
