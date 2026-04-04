import type { UseFormGetValues, UseFormSetValue } from 'react-hook-form';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import type { AiResult } from './ai/generateWithAi.ts';
import type { CvFormData } from './cvFormSchema.ts';

import { generateCoverLetter, generateHighlights, generateSummary } from './ai/generateWithAi.ts';
import {
  DEFAULT_COVER_LETTER_PROMPT,
  DEFAULT_HIGHLIGHTS_PROMPT,
  DEFAULT_SUMMARY_PROMPT,
} from './cvFormSchema.ts';

type HighlightsAiState = Record<string, { generating: boolean; result: AiResult<string[]> | null }>;

export function useAiGeneration(
  getValues: UseFormGetValues<CvFormData>,
  setValue: UseFormSetValue<CvFormData>,
  canGenerate: boolean,
) {
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<AiResult<string> | null>(null);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<AiResult<string> | null>(null);
  const [highlightsAi, setHighlightsAi] = useState<HighlightsAiState>({});

  const onGenerateSummary = async () => {
    const values = getValues();
    if (!values.aiApiKey || !values.jobDescriptionText) return;
    setGeneratingSummary(true);
    try {
      const result = await generateSummary(
        values.aiApiKey,
        values.aiSummaryPrompt || DEFAULT_SUMMARY_PROMPT,
        values,
        values.jobDescriptionText,
      );
      setGeneratedSummary(result);
      toast.success('Summary generated. Review it below.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate summary.');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const onUseSummary = () => {
    if (!generatedSummary) return;
    setValue('summary', generatedSummary.content, { shouldValidate: true, shouldDirty: true });
    setGeneratedSummary(null);
    toast.success('Summary applied.');
  };

  const onCopyGenerated = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard.');
    } catch {
      toast.error('Failed to copy.');
    }
  };

  const onGenerateCoverLetter = async () => {
    const values = getValues();
    if (!values.aiApiKey || !values.jobDescriptionText) return;
    setGeneratingCoverLetter(true);
    try {
      const result = await generateCoverLetter(
        values.aiApiKey,
        values.aiCoverLetterPrompt || DEFAULT_COVER_LETTER_PROMPT,
        values,
        values.jobDescriptionText,
      );
      setGeneratedCoverLetter(result);
      toast.success('Cover letter generated. Review it below.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate cover letter.');
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const onUseCoverLetter = () => {
    if (!generatedCoverLetter) return;
    setValue('coverLetter', generatedCoverLetter.content, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setGeneratedCoverLetter(null);
    toast.success('Cover letter applied.');
  };

  const getHighlightsAiState = useCallback(
    (path: string) => highlightsAi[path] ?? { generating: false, result: null },
    [highlightsAi],
  );

  const onGenerateHighlights = useCallback(
    async (path: string) => {
      const values = getValues();
      if (!values.aiApiKey || !values.jobDescriptionText) return;

      setHighlightsAi((prev) => ({ ...prev, [path]: { generating: true, result: null } }));
      try {
        const parts = path.split('.');
        const section = parts[0];
        const idx = Number(parts[1]);
        const entries =
          section === 'experience'
            ? values.experience
            : section === 'education'
              ? values.education
              : values.others;
        const entry = entries[idx];
        const prompt = entry.aiHighlightsPrompt || DEFAULT_HIGHLIGHTS_PROMPT;

        const result = await generateHighlights(
          values.aiApiKey,
          prompt,
          entry,
          values.jobDescriptionText,
        );
        setHighlightsAi((prev) => ({ ...prev, [path]: { generating: false, result } }));
        toast.success('Highlights generated. Review below.');
      } catch (err) {
        setHighlightsAi((prev) => ({ ...prev, [path]: { generating: false, result: null } }));
        toast.error(err instanceof Error ? err.message : 'Failed to generate highlights.');
      }
    },
    [getValues],
  );

  const onUseHighlights = useCallback(
    (path: string) => {
      const state = highlightsAi[path];
      if (!state?.result) return;

      const [section, idxStr] = path.split('.');
      const idx = Number(idxStr);
      const opts = { shouldValidate: true, shouldDirty: true } as const;

      if (section === 'experience') {
        setValue(`experience.${idx}.bullets`, state.result.content, opts);
      } else if (section === 'education') {
        setValue(`education.${idx}.bullets`, state.result.content, opts);
      } else {
        setValue(`others.${idx}.bullets`, state.result.content, opts);
      }

      setHighlightsAi((prev) => ({ ...prev, [path]: { generating: false, result: null } }));
      toast.success('Highlights applied.');
    },
    [highlightsAi, setValue],
  );

  const onDismissHighlights = useCallback((path: string) => {
    setHighlightsAi((prev) => ({ ...prev, [path]: { generating: false, result: null } }));
  }, []);

  const onCopyHighlights = useCallback(
    async (path: string) => {
      const state = highlightsAi[path];
      if (!state?.result) return;
      try {
        await navigator.clipboard.writeText(state.result.content.join('\n'));
        toast.success('Copied to clipboard.');
      } catch {
        toast.error('Failed to copy.');
      }
    },
    [highlightsAi],
  );

  const buildEntryAiProps = useCallback(
    (path: string) => {
      const state = getHighlightsAiState(path);
      return {
        canGenerate,
        generatingHighlights: state.generating,
        generatedHighlights: state.result,
        onGenerateHighlights: () => onGenerateHighlights(path),
        onUseHighlights: () => onUseHighlights(path),
        onCopyHighlights: () => onCopyHighlights(path),
        onDismissHighlights: () => onDismissHighlights(path),
      };
    },
    [
      canGenerate,
      getHighlightsAiState,
      onGenerateHighlights,
      onUseHighlights,
      onCopyHighlights,
      onDismissHighlights,
    ],
  );

  return {
    generatingSummary,
    generatedSummary,
    setGeneratedSummary,
    onGenerateSummary,
    onUseSummary,
    onCopyGenerated,
    generatingCoverLetter,
    generatedCoverLetter,
    setGeneratedCoverLetter,
    onGenerateCoverLetter,
    onUseCoverLetter,
    buildEntryAiProps,
  };
}
