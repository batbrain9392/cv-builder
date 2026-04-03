import { Popover } from '@base-ui/react/popover';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

type PromptFn = () => Promise<{ outcome: 'accepted' | 'dismissed' }>;

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

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
}

function isInStandaloneMode(): boolean {
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  return 'standalone' in navigator && navigator.standalone === true;
}

export function InstallPwa() {
  const [canInstall, setCanInstall] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const promptRef = useRef<PromptFn | null>(null);

  useEffect(() => {
    if (isInStandaloneMode()) return;

    if (isIos()) {
      setShowIosHint(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      if ('prompt' in e) {
        const p = e.prompt;
        if (typeof p === 'function') {
          promptRef.current = () => p.call(e);
          setCanInstall(true);
        }
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      promptRef.current = null;
      setCanInstall(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    const prompt = promptRef.current;
    if (!prompt) return;
    const { outcome } = await prompt();
    if (outcome === 'accepted') {
      promptRef.current = null;
      setCanInstall(false);
    }
  }, []);

  if (isInStandaloneMode()) return null;

  if (canInstall) {
    return (
      <Tooltip label="Install app">
        <Button variant="inverted" size="icon-sm" onClick={handleInstall} aria-label="Install app">
          <PwaIcon />
        </Button>
      </Tooltip>
    );
  }

  if (showIosHint) {
    return (
      <Popover.Root>
        <Popover.Trigger
          render={<Button variant="inverted" size="icon-sm" aria-label="Install app" />}
        >
          <PwaIcon />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner align="end" sideOffset={12}>
            <Popover.Popup className="z-50 max-w-64 rounded-lg border bg-popover p-3 text-sm text-popover-foreground shadow-md">
              <p>
                Tap the{' '}
                <strong className="inline-flex items-baseline gap-0.5">
                  Share
                  <ShareIcon className="inline size-3.5 self-center" />
                </strong>{' '}
                button in Safari, then choose <strong>&ldquo;Add to Home Screen&rdquo;</strong> to
                install this app.
              </p>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    );
  }

  if (!import.meta.env.PROD) {
    return (
      <Tooltip label="Install app (dev only)">
        <Button variant="inverted" size="icon-sm" aria-label="Install app (dev)" disabled>
          <PwaIcon />
        </Button>
      </Tooltip>
    );
  }

  return null;
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
