import { useCallback, useEffect, useRef, useState } from 'react';

import { isInStandaloneMode } from '@/lib/pwa';

type PromptFn = () => Promise<{ outcome: 'accepted' | 'dismissed' }>;

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
}

export type InstallState = 'standalone' | 'installable' | 'ios' | 'manual';

export function useInstallPwa() {
  const [canInstall, setCanInstall] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const promptRef = useRef<PromptFn | null>(null);

  useEffect(() => {
    if (isInStandaloneMode()) return;

    if (isIos()) {
      setIsIosDevice(true);
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

    const installedHandler = () => {
      promptRef.current = null;
      setCanInstall(false);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
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

  let state: InstallState;
  if (isInStandaloneMode()) {
    state = 'standalone';
  } else if (canInstall) {
    state = 'installable';
  } else if (isIosDevice) {
    state = 'ios';
  } else {
    state = 'manual';
  }

  return { state, handleInstall };
}
