import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import type { CvFormData } from './cv/cvFormSchema.ts';

import { CvEditorPage } from './pages/CvEditorPage.tsx';

const LandingPage = lazy(() => import('./pages/LandingPage.tsx'));

export function App({ defaultValues }: { defaultValues: CvFormData }) {
  return (
    <Routes>
      <Route
        index
        element={
          <Suspense
            fallback={
              <div className="flex h-dvh items-center justify-center bg-background text-muted-foreground">
                Loading…
              </div>
            }
          >
            <LandingPage />
          </Suspense>
        }
      />
      <Route path="app" element={<CvEditorPage defaultValues={defaultValues} />} />
    </Routes>
  );
}
