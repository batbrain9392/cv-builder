import type { UseFormReset } from 'react-hook-form';

import { useRef, useState } from 'react';
import { toast } from 'sonner';

import type { CvFormData } from './cvFormSchema.ts';

import { sortCvSections } from './cvFormatters.ts';
import { cvFormSchema } from './cvFormSchema.ts';
import { downloadBlob } from './downloadBlob.ts';
import { createCvDocxBlob } from './export/CvDocxDocument.ts';
import { AI_FIELD_DEFAULTS, backfillEntryPrompts } from './loadDefaultValues.ts';

export function useCvExport(
  reset: UseFormReset<CvFormData>,
  onExported?: () => void,
  onJsonImported?: (data: CvFormData) => void,
) {
  const [exporting, setExporting] = useState(false);
  const [apiKeyWarningOpen, setApiKeyWarningOpen] = useState(false);
  const pendingExportData = useRef<CvFormData | null>(null);

  const doExportJson = (data: CvFormData) => {
    const sorted = sortCvSections(data);
    downloadBlob(
      new Blob([JSON.stringify(sorted, null, 2)], { type: 'application/json' }),
      'cv.json',
    );
    toast.success('JSON exported.');
    onExported?.();
  };

  const onExportJson = (data: CvFormData) => {
    if (data.aiApiKey) {
      pendingExportData.current = data;
      setApiKeyWarningOpen(true);
    } else {
      doExportJson(data);
    }
  };

  const onExportJsonWithKey = () => {
    if (pendingExportData.current) {
      doExportJson(pendingExportData.current);
      pendingExportData.current = null;
    }
    setApiKeyWarningOpen(false);
  };

  const onExportJsonWithoutKey = () => {
    if (pendingExportData.current) {
      doExportJson({ ...pendingExportData.current, aiApiKey: '' });
      pendingExportData.current = null;
    }
    setApiKeyWarningOpen(false);
  };

  const onExportDocx = async (data: CvFormData) => {
    setExporting(true);
    const minWait = new Promise((r) => setTimeout(r, 400));
    try {
      const sorted = sortCvSections(data);
      const [blob] = await Promise.all([createCvDocxBlob(sorted), minWait]);
      downloadBlob(blob, 'cv.docx');
      toast.success('DOCX exported.');
      onExported?.();
    } finally {
      setExporting(false);
    }
  };

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (typeof reader.result !== 'string') return;
        const data = JSON.parse(reader.result);
        const withDefaults = backfillEntryPrompts({ ...AI_FIELD_DEFAULTS, ...data });
        const parsed = cvFormSchema.safeParse(withDefaults);
        if (parsed.success) {
          const sorted = sortCvSections(parsed.data);
          reset(sorted);
          onJsonImported?.(sorted);
          toast.success('CV data loaded successfully.');
        } else {
          toast.error('Invalid cv.json format.');
        }
      } catch {
        toast.error('Could not parse file.');
      }
    };
    reader.readAsText(file);
  };

  return {
    exporting,
    apiKeyWarningOpen,
    setApiKeyWarningOpen,
    onImport,
    onExportJson,
    onExportDocx,
    onExportJsonWithKey,
    onExportJsonWithoutKey,
  };
}
