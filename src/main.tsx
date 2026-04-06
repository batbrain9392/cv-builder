import * as Sentry from '@sentry/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import { toast } from 'sonner';

import { App } from './App.tsx';
import { loadDefaultValues } from './cv/loadDefaultValues.ts';
import { patchIosKeyboardGap } from './lib/patchIosKeyboardGap.ts';
import { initSentry } from './lib/sentry.ts';
import './index.css';

initSentry();
patchIosKeyboardGap();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/cv-builder/sw.js').then((reg) => {
    function promptUpdate(waiting: ServiceWorker) {
      toast('A new version is available.', {
        duration: Infinity,
        action: {
          label: 'Refresh',
          onClick: () => {
            waiting.postMessage('SKIP_WAITING');
          },
        },
      });
    }

    if (reg.waiting) {
      promptUpdate(reg.waiting);
    }

    reg.addEventListener('updatefound', () => {
      const installing = reg.installing;
      if (!installing) return;

      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          promptUpdate(installing);
        }
      });
    });
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

const el = document.getElementById('root');
if (!el) {
  throw new Error('Root element #root not found');
}

createRoot(el, {
  onUncaughtError: Sentry.reactErrorHandler(),
  onCaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
}).render(
  <StrictMode>
    <HashRouter>
      <App defaultValues={loadDefaultValues()} />
    </HashRouter>
  </StrictMode>,
);
