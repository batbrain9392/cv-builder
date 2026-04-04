import { useCallback, useEffect, useRef } from 'react';
import { useWatch, type Control } from 'react-hook-form';

import { EmojiIcon } from '@/components/EmojiIcon';

import type { CvFormData } from '../cvFormSchema.ts';

import { CV_LAYOUT } from '../cvConstants.ts';
import { CvPreview } from './CvPreview.tsx';

const A4_WIDTH_PX = (CV_LAYOUT.pageWidthMm / 25.4) * 96;

/**
 * useWatch without a `name` returns DeepPartialSkipArrayKey, but when
 * `defaultValue` is a complete CvFormData every field is guaranteed present
 * at runtime. This helper narrows the type without a type assertion.
 */
function useFormData(control: Control<CvFormData>, defaultValues: CvFormData): CvFormData {
  const watched = useWatch({ control, defaultValue: defaultValues });
  return Object.assign({}, defaultValues, watched) satisfies CvFormData;
}

interface CvPreviewPanelProps {
  control: Control<CvFormData>;
  defaultValues: CvFormData;
}

export function CvPreviewPanel({ control, defaultValues }: CvPreviewPanelProps) {
  const data = useFormData(control, defaultValues);
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
        <h2 className="flex items-center gap-3 text-xl font-bold tracking-tight">
          <EmojiIcon emoji="📄" /> Preview
        </h2>
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
