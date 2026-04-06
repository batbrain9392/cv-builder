import { FileTextIcon, InfoIcon, XIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useWatch, type Control } from 'react-hook-form';

import type { CvFormData } from '../cvFormSchema.ts';

import { CV_LAYOUT } from '../cvConstants.ts';
import { CvPreview } from './CvPreview.tsx';

const A4_WIDTH_PX = (CV_LAYOUT.pageWidthMm / 25.4) * 96;

/**
 * useWatch without a `name` returns DeepPartialSkipArrayKey, but when
 * `defaultValue` is a complete CvFormData every field is guaranteed present
 * at runtime. We watch individual top-level fields so each return type is
 * concrete, avoiding both type assertions and JSON roundtrips.
 */
function useFormData(control: Control<CvFormData>, defaultValues: CvFormData): CvFormData {
  return {
    aiApiKey: useWatch({ control, name: 'aiApiKey', defaultValue: defaultValues.aiApiKey }),
    jobDescriptionText: useWatch({
      control,
      name: 'jobDescriptionText',
      defaultValue: defaultValues.jobDescriptionText,
    }),
    aiSummaryPrompt: useWatch({
      control,
      name: 'aiSummaryPrompt',
      defaultValue: defaultValues.aiSummaryPrompt,
    }),
    personalInfo: useWatch({
      control,
      name: 'personalInfo',
      defaultValue: defaultValues.personalInfo,
    }),
    summary: useWatch({ control, name: 'summary', defaultValue: defaultValues.summary }),
    coverLetterEnabled: useWatch({
      control,
      name: 'coverLetterEnabled',
      defaultValue: defaultValues.coverLetterEnabled,
    }),
    coverLetter: useWatch({
      control,
      name: 'coverLetter',
      defaultValue: defaultValues.coverLetter,
    }),
    aiCoverLetterPrompt: useWatch({
      control,
      name: 'aiCoverLetterPrompt',
      defaultValue: defaultValues.aiCoverLetterPrompt,
    }),
    experience: useWatch({
      control,
      name: 'experience',
      defaultValue: defaultValues.experience,
    }),
    education: useWatch({ control, name: 'education', defaultValue: defaultValues.education }),
    others: useWatch({ control, name: 'others', defaultValue: defaultValues.others }),
    skills: useWatch({ control, name: 'skills', defaultValue: defaultValues.skills }),
  };
}

interface CvPreviewPanelProps {
  control: Control<CvFormData>;
  defaultValues: CvFormData;
  isStarterData?: boolean;
  onGoToImport?: () => void;
}

export function CvPreviewPanel({
  control,
  defaultValues,
  isStarterData,
  onGoToImport,
}: CvPreviewPanelProps) {
  const data = useFormData(control, defaultValues);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const showBanner = isStarterData && !bannerDismissed;
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
    <div className="px-4 py-8 lg:p-6 xl:p-8">
      <div className="mb-8 space-y-2">
        <h2 className="flex items-center gap-3 text-xl font-bold tracking-tight">
          <FileTextIcon className="size-5" aria-hidden="true" /> Preview
        </h2>
        <p className="text-sm text-muted-foreground">
          ATS-friendly layout, built to pass automated screeners. Use <strong>Download</strong>{' '}
          below to export a DOCX &mdash; open in Word or Google Docs and save as PDF.
        </p>
      </div>
      {showBanner && (
        <div
          role="status"
          className="mb-6 flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/10 px-3.5 py-3 text-sm text-foreground"
        >
          <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p className="flex-1">
            This is <strong>sample data</strong> to show how the editor works.{' '}
            {onGoToImport ? (
              <>
                <button
                  type="button"
                  onClick={onGoToImport}
                  className="font-medium text-primary-text underline underline-offset-2 hover:text-primary-text/80"
                >
                  Import your CV
                </button>{' '}
                or fill in your details to get started.
              </>
            ) : (
              'Fill in your details to get started.'
            )}
          </p>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            className="mt-0.5 shrink-0 rounded-sm p-0.5 text-foreground/60 transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="Dismiss sample data notice"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      )}
      <div ref={wrapperRef} className="flex justify-center">
        <CvPreview data={data} />
      </div>
    </div>
  );
}
