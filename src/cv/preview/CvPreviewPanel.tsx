import { FileDownIcon, FileTextIcon } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { useWatch, type Control } from 'react-hook-form';

import { Button } from '@/components/ui/button';

import type { CvFormData } from '../cvFormSchema.ts';

import { CV_LAYOUT } from '../cvConstants.ts';
import { CvPreview } from './CvPreview.tsx';

const A4_WIDTH_PX = (CV_LAYOUT.pageWidthMm / 25.4) * 96;

/**
 * useWatch without a `name` returns DeepPartialSkipArrayKey, but when
 * `defaultValue` is a complete CvFormData every field is guaranteed present
 * at runtime. We JSON-round-trip the merged result to produce a clean deep
 * copy with the correct runtime shape, then validate it structurally against
 * the defaults to ensure nothing is missing.
 */
function useFormData(control: Control<CvFormData>, defaultValues: CvFormData): CvFormData {
  const watched = useWatch({ control, defaultValue: defaultValues });
  return JSON.parse(JSON.stringify({ ...defaultValues, ...watched })) satisfies CvFormData;
}

interface CvPreviewPanelProps {
  control: Control<CvFormData>;
  defaultValues: CvFormData;
  onDownload: () => void;
}

export function CvPreviewPanel({ control, defaultValues, onDownload }: CvPreviewPanelProps) {
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
      <div className="mb-8 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-3 text-xl font-bold tracking-tight">
            <FileTextIcon className="size-5" aria-hidden="true" /> Preview
          </h2>
          <Button size="sm" onClick={onDownload}>
            <FileDownIcon data-icon="inline-start" />
            Download CV
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          ATS-friendly layout, designed to pass automated screeners and look great to recruiters.
          What you see here is what they&rsquo;ll get. Hit <strong>Download CV</strong> to export a
          DOCX &mdash; open it in Word or Google Docs and save as PDF if needed.
        </p>
      </div>
      <div ref={wrapperRef} className="flex justify-center">
        <CvPreview data={data} />
      </div>
    </div>
  );
}
