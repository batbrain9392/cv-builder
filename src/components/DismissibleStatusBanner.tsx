import type React from 'react';

import { InfoIcon, XIcon } from 'lucide-react';

const shellClass =
  'flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/10 px-3.5 py-3 text-sm text-foreground';

const dismissBtnClass =
  'mt-0.5 shrink-0 rounded-sm p-0.5 text-foreground/60 transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';

export interface DismissibleStatusBannerProps {
  /** Accessible name for the live region (distinguishes multiple `role="status"` banners). */
  'aria-label': string;
  onDismiss: () => void;
  dismissAriaLabel: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function DismissibleStatusBanner({
  'aria-label': ariaLabel,
  onDismiss,
  dismissAriaLabel,
  children,
  icon = <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />,
}: DismissibleStatusBannerProps) {
  return (
    <div role="status" aria-label={ariaLabel} className={shellClass}>
      {icon}
      <div className="min-w-0 flex-1">{children}</div>
      <button
        type="button"
        onClick={onDismiss}
        className={dismissBtnClass}
        aria-label={dismissAriaLabel}
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
}
