import { useWatch, type Control } from 'react-hook-form';

import type { CvFormData } from '../cvFormSchema.ts';

import { CvPreview } from './CvPreview.tsx';

const identity = (v: CvFormData) => v;

interface CvPreviewPanelProps {
  control: Control<CvFormData>;
  defaultValues: CvFormData;
}

export function CvPreviewPanel({ control, defaultValues }: CvPreviewPanelProps) {
  const data = useWatch({ control, defaultValue: defaultValues, compute: identity });
  return (
    <aside className="app-preview">
      <div className="cv-preview-wrapper">
        <CvPreview data={data} />
      </div>
    </aside>
  );
}
