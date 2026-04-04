import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { App } from './App.tsx';
import { loadDefaultValues } from './cv/loadDefaultValues.ts';
import './index.css';

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js');
}

const el = document.getElementById('root');
if (!el) {
  throw new Error('Root element #root not found');
}

loadDefaultValues().then((defaultValues) => {
  createRoot(el).render(
    <StrictMode>
      <BrowserRouter>
        <App defaultValues={defaultValues} />
      </BrowserRouter>
    </StrictMode>,
  );
});
