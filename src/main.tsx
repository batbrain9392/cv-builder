import * as Sentry from '@sentry/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';

import { App } from './App.tsx';
import { loadDefaultValues } from './cv/loadDefaultValues.ts';
import { patchIosKeyboardGap } from './lib/patchIosKeyboardGap.ts';
import { initSentry } from './lib/sentry.ts';
import './index.css';

initSentry();
patchIosKeyboardGap();

/** Unregister any previously registered service workers after removing offline caching. */
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      void registration.unregister();
    }
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
