import { Route, Routes } from 'react-router';

import type { CvFormData } from './cv/cvFormSchema.ts';

import { marketingRouteElements } from './marketingRouteElements.tsx';
import { CvEditorPage } from './pages/CvEditorPage.tsx';

export function App({ defaultValues }: { defaultValues: CvFormData }) {
  return (
    <Routes>
      {marketingRouteElements}
      <Route path="app" element={<CvEditorPage defaultValues={defaultValues} />} />
    </Routes>
  );
}
