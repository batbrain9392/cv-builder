import type React from 'react';

import { Popover } from '@base-ui/react/popover';

import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { useInstallPwa } from '@/lib/useInstallPwa';

function PwaIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <path d="M12 7v5" />
      <path d="M9 10l3 3 3-3" />
    </svg>
  );
}

interface InstallPwaProps {
  variant?: 'inverted' | 'inverted-fill' | 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'icon-sm' | 'icon' | 'sm' | 'default';
  label?: string;
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

export function InstallPwa({
  variant = 'inverted',
  size = 'icon-sm',
  label,
  wrapper: Wrapper,
}: InstallPwaProps = {}) {
  const { state, handleInstall } = useInstallPwa();

  if (state === 'standalone') return null;

  const wrap = (node: React.ReactNode) => (Wrapper ? <Wrapper>{node}</Wrapper> : node);

  if (state === 'installable') {
    return wrap(
      <Tooltip label="Install app">
        <Button variant={variant} size={size} onClick={handleInstall} aria-label="Install app">
          <PwaIcon />
          {label && <span>{label}</span>}
        </Button>
      </Tooltip>,
    );
  }

  const hint =
    state === 'ios' ? (
      <p>
        Tap the{' '}
        <strong className="inline-flex items-baseline gap-0.5">
          Share
          <ShareIcon className="inline size-3.5 self-center" />
        </strong>{' '}
        button in Safari, then choose <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
      </p>
    ) : (
      <p>
        In your browser menu, look for <strong>&ldquo;Install app&rdquo;</strong> or{' '}
        <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
      </p>
    );

  return wrap(
    <Popover.Root>
      <Tooltip label="Install app">
        <Popover.Trigger render={<Button variant={variant} size={size} aria-label="Install app" />}>
          <PwaIcon />
          {label && <span>{label}</span>}
        </Popover.Trigger>
      </Tooltip>
      <Popover.Portal>
        <Popover.Positioner align="end" sideOffset={12}>
          <Popover.Popup className="z-50 max-w-64 rounded-lg border bg-popover p-3 text-sm text-popover-foreground shadow-md">
            {hint}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>,
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}
