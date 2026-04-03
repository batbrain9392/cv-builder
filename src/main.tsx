import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App.tsx';
import { loadDefaultValues } from './cv/loadDefaultValues.ts';
import './index.css';

const el = document.getElementById('root');
if (!el) {
  throw new Error('Root element #root not found');
}

loadDefaultValues().then((defaultValues) => {
  createRoot(el).render(
    <StrictMode>
      <App defaultValues={defaultValues} />
    </StrictMode>,
  );
});
