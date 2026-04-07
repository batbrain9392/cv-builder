import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { LG_MEDIA_QUERY } from '@/lib/breakpoints.ts';
import { clearCv, hasUserCv, saveCv } from '@/lib/cvStorage.ts';
import {
  dismissEditorGuideHint,
  isEditorGuideHintDismissed,
} from '@/lib/editorGuideHintStorage.ts';
import { useMediaQuery } from '@/lib/useMediaQuery';

import type { CvFormData } from '../cv/cvFormSchema.ts';

import { cvFormSchema, DEFAULT_HIGHLIGHTS_PROMPT } from '../cv/cvFormSchema.ts';
import { EMPTY_DEFAULTS } from '../cv/loadDefaultValues.ts';
import { useAiGeneration } from '../cv/useAiGeneration.ts';
import { useCvExport } from '../cv/useCvExport.ts';

const SECTION_KEYS = [
  'personalInfo',
  'summary',
  'skills',
  'experience',
  'education',
  'others',
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

function allSections(open: boolean): Record<SectionKey, boolean> {
  return {
    personalInfo: open,
    summary: open,
    skills: open,
    experience: open,
    education: open,
    others: open,
  };
}

const TOOLS_SECTION_KEYS = ['aiSettings', 'importData', 'jobDescription', 'coverLetter'] as const;
export type ToolsSectionKey = (typeof TOOLS_SECTION_KEYS)[number];

function allToolsSections(open: boolean): Record<ToolsSectionKey, boolean> {
  return {
    aiSettings: open,
    importData: open,
    jobDescription: open,
    coverLetter: open,
  };
}

export const EMPTY_ENTRY = {
  role: '',
  company: '',
  url: '',
  startDate: '',
  location: '',
  items: [''],
  tagsLabel: '',
  tags: [],
  aiHighlightsPrompt: DEFAULT_HIGHLIGHTS_PROMPT,
};

export const EMPTY_EDUCATION = {
  degree: '',
  institution: '',
  institutionUrl: '',
  startYear: '',
  location: '',
  items: [''],
  aiHighlightsPrompt: DEFAULT_HIGHLIGHTS_PROMPT,
};

export function useCvEditorForm(defaultValues: CvFormData) {
  const mobilePreviewRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);

  const [isStarterData, setIsStarterData] = useState(() => !hasUserCv());
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mainCardOpen, setMainCardOpen] = useState(true);
  const [sections, setSections] = useState<Record<SectionKey, boolean>>(() => allSections(false));
  const [toolsSections, setToolsSections] = useState<Record<ToolsSectionKey, boolean>>(() =>
    allToolsSections(false),
  );
  const [summaryAiOpen, setSummaryAiOpen] = useState(false);
  const [expSignal, setExpSignal] = useState({ n: 0, open: true });
  const [eduSignal, setEduSignal] = useState({ n: 0, open: true });
  const [othSignal, setOthSignal] = useState({ n: 0, open: true });

  const setSectionOpen = useCallback((key: SectionKey, open: boolean) => {
    setSections((prev) => ({ ...prev, [key]: open }));
  }, []);

  const setToolsSectionOpen = useCallback((key: ToolsSectionKey, open: boolean) => {
    setToolsSections((prev) => ({ ...prev, [key]: open }));
  }, []);

  const expandAllSections = useCallback(() => {
    setSections(allSections(true));
    setExpSignal((s) => ({ n: s.n + 1, open: true }));
    setEduSignal((s) => ({ n: s.n + 1, open: true }));
    setOthSignal((s) => ({ n: s.n + 1, open: true }));
  }, []);

  const collapseAllSections = useCallback(() => {
    setSections(allSections(false));
    setExpSignal((s) => ({ n: s.n + 1, open: false }));
    setEduSignal((s) => ({ n: s.n + 1, open: false }));
    setOthSignal((s) => ({ n: s.n + 1, open: false }));
  }, []);

  const expandAllToolsSections = useCallback(() => {
    setToolsSections(allToolsSections(true));
  }, []);

  const collapseAllToolsSections = useCallback(() => {
    setToolsSections(allToolsSections(false));
  }, []);

  const anySectionOpen = useMemo(() => SECTION_KEYS.some((k) => sections[k]), [sections]);
  const anyToolsSectionOpen = useMemo(
    () => TOOLS_SECTION_KEYS.some((k) => toolsSections[k]),
    [toolsSections],
  );

  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [showBackupBanner, setShowBackupBanner] = useState(false);
  const [editorGuideHintDismissed, setEditorGuideHintDismissed] = useState(() =>
    isEditorGuideHintDismissed(),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showEditorGuideHint = !editorGuideHintDismissed;

  const onDismissEditorGuideHint = useCallback(() => {
    dismissEditorGuideHint();
    setEditorGuideHintDismissed(true);
  }, []);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = useForm<CvFormData>({
    resolver: zodResolver(cvFormSchema),
    defaultValues,
  });

  const aiApiKey = useWatch({ control, name: 'aiApiKey' });
  const canGenerate = Boolean(aiApiKey);

  const links = useFieldArray({ control, name: 'personalInfo.links' });
  const experience = useFieldArray({ control, name: 'experience' });
  const education = useFieldArray({ control, name: 'education' });
  const others = useFieldArray({ control, name: 'others' });

  const afterImport = useCallback(
    (data: CvFormData) => {
      saveCv(data);
      setIsStarterData(false);
      setShowBackupBanner(true);
      setToolsOpen(false);
      setMainCardOpen(true);
      setSections(allSections(true));
      if (!isDesktop) {
        requestAnimationFrame(() => {
          mobilePreviewRef.current?.scrollIntoView({ behavior: 'smooth' });
        });
      }
    },
    [isDesktop],
  );

  const {
    exporting,
    apiKeyWarningOpen,
    setApiKeyWarningOpen,
    onImport,
    onExportJson,
    onExportDocx,
    onExportJsonWithKey,
    onExportJsonWithoutKey,
  } = useCvExport(
    reset,
    () => {
      setShowBackupBanner(false);
      setDownloadDialogOpen(false);
    },
    afterImport,
  );

  const ai = useAiGeneration(getValues, setValue, canGenerate);

  const onImportParsed = useCallback(
    (data: CvFormData) => {
      reset(data);
      afterImport(data);
      toast.success('CV imported. Review and edit your data.');
    },
    [reset, afterImport],
  );

  const onClearAll = useCallback(() => {
    reset(EMPTY_DEFAULTS);
    clearCv();
    setIsStarterData(false);
    setClearConfirmOpen(false);
    toast.success('All data cleared.');
  }, [reset]);

  const onSaveToBrowser = useCallback(() => {
    saveCv(getValues());
    setIsStarterData(false);
    toast.success('Saved to browser.');
  }, [getValues]);

  const onValidationError = useCallback(() => {
    toast.error('Please fix the highlighted errors before downloading.');
    setDownloadDialogOpen(false);
  }, []);

  const scrollToImport = useCallback(() => {
    setToolsOpen(true);
    requestAnimationFrame(() => {
      document
        .getElementById('tools-import-title')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const onPickJsonFile = () => fileInputRef.current?.click();

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImport(e);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadClick = () => {
    onSaveToBrowser();
    setDownloadDialogOpen(true);
  };

  return {
    // refs
    mobilePreviewRef,
    fileInputRef,

    // layout state
    isDesktop,
    isStarterData,

    // form
    register,
    control,
    handleSubmit,
    errors,
    setValue,

    // field arrays
    links,
    experience,
    education,
    others,

    // section collapse state
    toolsOpen,
    setToolsOpen,
    mainCardOpen,
    setMainCardOpen,
    sections,
    setSectionOpen,
    toolsSections,
    setToolsSectionOpen,
    summaryAiOpen,
    setSummaryAiOpen,
    expSignal,
    setExpSignal,
    eduSignal,
    setEduSignal,
    othSignal,
    setOthSignal,
    anySectionOpen,
    anyToolsSectionOpen,
    expandAllSections,
    collapseAllSections,
    expandAllToolsSections,
    collapseAllToolsSections,

    // dialog state
    downloadDialogOpen,
    setDownloadDialogOpen,
    clearConfirmOpen,
    setClearConfirmOpen,
    showBackupBanner,
    setShowBackupBanner,
    showEditorGuideHint,
    onDismissEditorGuideHint,

    // AI
    aiApiKey,
    canGenerate,
    ai,

    // export
    exporting,
    apiKeyWarningOpen,
    setApiKeyWarningOpen,
    onExportJson,
    onExportDocx,
    onExportJsonWithKey,
    onExportJsonWithoutKey,

    // actions
    onImportParsed,
    onClearAll,
    onSaveToBrowser,
    onValidationError,
    scrollToImport,
    onPickJsonFile,
    handleImport,
    handleDownloadClick,
  };
}
