import * as Sentry from '@sentry/react';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { App } from './App.tsx';
import { loadDefaultValues } from './cv/loadDefaultValues.ts';
import { initAnalytics } from './lib/analytics.ts';
import { patchIosKeyboardGap } from './lib/patchIosKeyboardGap.ts';
import { initSentry } from './lib/sentry.ts';
import './index.css';

initSentry();
initAnalytics();
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

const rootOptions = {
  onUncaughtError: Sentry.reactErrorHandler(),
  onCaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
} as const;

const app = (
  <StrictMode>
    <BrowserRouter basename="/cv-builder">
      <App defaultValues={loadDefaultValues()} />
    </BrowserRouter>
  </StrictMode>
);

const shouldHydrate = !import.meta.env.DEV && el.innerHTML.trim().length > 0;

if (shouldHydrate) {
  hydrateRoot(el, app, rootOptions);
} else {
  createRoot(el, rootOptions).render(app);
}
