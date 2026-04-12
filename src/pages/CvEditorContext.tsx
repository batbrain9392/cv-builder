import type {
  Control,
  FieldErrors,
  UseFieldArrayReturn,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';

import { createContext, useContext } from 'react';

import type { CvFormData } from '../cv/cvFormSchema.ts';
import type { useAiGeneration } from '../cv/useAiGeneration.ts';
import type { SectionKey, ToolsSectionKey } from './useCvEditorForm.ts';

export interface CvEditorContextValue {
  // form API (kept explicit so consumers know these come from react-hook-form)
  register: UseFormRegister<CvFormData>;
  control: Control<CvFormData>;
  errors: FieldErrors<CvFormData>;
  setValue: UseFormSetValue<CvFormData>;
  handleSubmit: UseFormHandleSubmit<CvFormData>;

  // field arrays
  links: UseFieldArrayReturn<CvFormData, 'personalInfo.links'>;
  experience: UseFieldArrayReturn<CvFormData, 'experience'>;
  education: UseFieldArrayReturn<CvFormData, 'education'>;
  others: UseFieldArrayReturn<CvFormData, 'others'>;

  // refs / import
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // layout
  isDesktop: boolean;
  isStarterData: boolean;
  mobilePreviewRef: React.RefObject<HTMLDivElement | null>;

  // banners / hints
  showBackupBanner: boolean;
  setShowBackupBanner: (v: boolean) => void;
  showEditorGuideHint: boolean;
  onDismissEditorGuideHint: () => void;

  // card / section collapse state
  toolsOpen: boolean;
  setToolsOpen: (open: boolean) => void;
  mainCardOpen: boolean;
  setMainCardOpen: (open: boolean) => void;
  sections: Record<SectionKey, boolean>;
  setSectionOpen: (key: SectionKey, open: boolean) => void;
  toolsSections: Record<ToolsSectionKey, boolean>;
  setToolsSectionOpen: (key: ToolsSectionKey, open: boolean) => void;
  summaryAiOpen: boolean;
  setSummaryAiOpen: (open: boolean) => void;
  anySectionOpen: boolean;
  anyToolsSectionOpen: boolean;
  expandAllSections: () => void;
  collapseAllSections: () => void;
  expandAllToolsSections: () => void;
  collapseAllToolsSections: () => void;

  // entry expand/collapse signals (force-expand nested collapsibles)
  expSignal: { n: number; open: boolean };
  setExpSignal: React.Dispatch<React.SetStateAction<{ n: number; open: boolean }>>;
  eduSignal: { n: number; open: boolean };
  setEduSignal: React.Dispatch<React.SetStateAction<{ n: number; open: boolean }>>;
  othSignal: { n: number; open: boolean };
  setOthSignal: React.Dispatch<React.SetStateAction<{ n: number; open: boolean }>>;

  // AI
  aiApiKey: string | undefined;
  canGenerate: boolean;
  ai: ReturnType<typeof useAiGeneration>;

  // export / dialog state
  exporting: boolean;
  apiKeyWarningOpen: boolean;
  setApiKeyWarningOpen: (v: boolean) => void;
  downloadDialogOpen: boolean;
  setDownloadDialogOpen: (v: boolean) => void;
  clearConfirmOpen: boolean;
  setClearConfirmOpen: (v: boolean) => void;

  // export actions
  onExportJson: (data: CvFormData) => void;
  onExportDocx: (data: CvFormData) => Promise<void>;
  onExportJsonWithKey: () => void;
  onExportJsonWithoutKey: () => void;
  onValidationError: () => void;
  handleDownloadClick: () => void;

  // other actions
  onImportParsed: (data: CvFormData) => void;
  scrollToImport: () => void;
  onSaveToBrowser: () => void;
  onClearAll: () => void;
}

const CvEditorContext = createContext<CvEditorContextValue | null>(null);

export const CvEditorProvider = CvEditorContext.Provider;

export function useCvEditor(): CvEditorContextValue {
  const ctx = useContext(CvEditorContext);
  if (!ctx) throw new Error('useCvEditor must be used inside CvEditorProvider');
  return ctx;
}
