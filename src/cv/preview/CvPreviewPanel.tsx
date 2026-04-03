import { useCallback, useEffect, useRef } from 'react';
import { useWatch, type Control } from 'react-hook-form';

import type { CvFormData } from '../cvFormSchema.ts';

import { CV_LAYOUT } from '../cvConstants.ts';
import { CvPreview } from './CvPreview.tsx';

const identity = (v: CvFormData) => v;

const A4_WIDTH_PX = (CV_LAYOUT.pageWidthMm / 25.4) * 96;

interface CvPreviewPanelProps {
  control: Control<CvFormData>;
  defaultValues: CvFormData;
}

export function CvPreviewPanel({ control, defaultValues }: CvPreviewPanelProps) {
  const data = useWatch({ control, defaultValue: defaultValues, compute: identity });
  const wrapperRef = useRef<HTMLDivElement>(null);

  const updateScale = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const available = el.clientWidth;
    if (available >= A4_WIDTH_PX) {
      el.style.removeProperty('--cv-scale');
    } else {
      el.style.setProperty('--cv-scale', String(available / A4_WIDTH_PX));
    }
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScale]);

  return (
    <div className="p-4 lg:p-6 xl:p-8">
      <div className="mb-8">
        <h2 className="text-xl font-bold tracking-tight">Preview</h2>
        <p className="text-sm text-muted-foreground">
          What you see is what recruiters get. Download DOCX (save as PDF from Word if needed), or
          Export Data as JSON to pick up where you left off.
        </p>
      </div>
      <div ref={wrapperRef} className="flex justify-center">
        <CvPreview data={data} />
      </div>
    </div>
  );
}
