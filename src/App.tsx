import { AlertDialog } from '@base-ui/react/alert-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckIcon,
  ChevronDownIcon,
  ClipboardIcon,
  EyeIcon,
  Loader2Icon,
  SparklesIcon,
  XIcon,
} from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray, useWatch, type SubmitHandler } from 'react-hook-form';
import { Route, Routes } from 'react-router';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Toaster } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownHint } from '@/cv/form/MarkdownHint.tsx';
import { BlockMarkdown } from '@/cv/preview/Markdown.tsx';
import { useMediaQuery } from '@/lib/useMediaQuery';

import type { AiResult } from './cv/ai/generateWithAi.ts';
import type { CvFormData } from './cv/cvFormSchema.ts';

import {
  generateCoverLetter,
  generateHighlights,
  generateSummary,
} from './cv/ai/generateWithAi.ts';
import {
  cvFormSchema,
  DEFAULT_COVER_LETTER_PROMPT,
  DEFAULT_HIGHLIGHTS_PROMPT,
  DEFAULT_SUMMARY_PROMPT,
} from './cv/cvFormSchema.ts';
import { downloadBlob } from './cv/downloadBlob.ts';
import { createCvDocxBlob } from './cv/export/CvDocxDocument.ts';
import { AiSettingsFields } from './cv/form/AiSettingsFields.tsx';
import { CoverLetterFields } from './cv/form/CoverLetterFields.tsx';
import { EducationFields } from './cv/form/EducationFields.tsx';
import { ExperienceEntryFields } from './cv/form/ExperienceEntryFields.tsx';
import { FormActions } from './cv/form/FormActions.tsx';
import { JobDescriptionFields } from './cv/form/JobDescriptionFields.tsx';
import { PersonalInfoFields } from './cv/form/PersonalInfoFields.tsx';
import { SectionToolbar } from './cv/form/SectionToolbar.tsx';
import { AI_FIELD_DEFAULTS, backfillEntryPrompts } from './cv/loadDefaultValues.ts';
import { CvPreviewPanel } from './cv/preview/CvPreviewPanel.tsx';

const AboutPage = lazy(() => import('./pages/AboutPage.tsx'));

const EMPTY_EXPERIENCE = {
  role: '',
  company: '',
  url: '',
  startDate: '',
  location: '',
  bullets: [''],
  tagsLabel: '',
  tags: [],
  aiHighlightsPrompt: DEFAULT_HIGHLIGHTS_PROMPT,
};

const EMPTY_EDUCATION = {
  degree: '',
  institution: '',
  institutionUrl: '',
  startYear: '',
  location: '',
  bullets: [''],
  aiHighlightsPrompt: DEFAULT_HIGHLIGHTS_PROMPT,
};

export function App({ defaultValues }: { defaultValues: CvFormData }) {
  return (
    <Routes>
      <Route index element={<CvEditorPage defaultValues={defaultValues} />} />
      <Route
        path="behind-the-bot"
        element={
          <Suspense
            fallback={
              <div className="flex h-dvh items-center justify-center bg-background text-muted-foreground">
                Loading…
              </div>
            }
          >
            <AboutPage />
          </Suspense>
        }
      />
    </Routes>
  );
}

function CvEditorPage({ defaultValues }: { defaultValues: CvFormData }) {
  const [exporting, setExporting] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<AiResult<string> | null>(null);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<AiResult<string> | null>(null);
  const [summaryAiOpen, setSummaryAiOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const togglePreview = useCallback(() => setPreviewOpen((o) => !o), []);
  const [expSignal, setExpSignal] = useState({ n: 0, open: true });
  const [eduSignal, setEduSignal] = useState({ n: 0, open: true });
  const [othSignal, setOthSignal] = useState({ n: 0, open: true });
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    if (!previewOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [previewOpen]);

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
  const jdText = useWatch({ control, name: 'jobDescriptionText' });
  const canGenerate = Boolean(aiApiKey) && Boolean(jdText);

  const links = useFieldArray({ control, name: 'personalInfo.links' });
  const experience = useFieldArray({ control, name: 'experience' });
  const education = useFieldArray({ control, name: 'education' });
  const others = useFieldArray({ control, name: 'others' });

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
          reset(parsed.data);
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

  const [apiKeyWarningOpen, setApiKeyWarningOpen] = useState(false);
  const pendingExportData = useRef<CvFormData | null>(null);

  const doExportJson = (data: CvFormData) => {
    downloadBlob(
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      'cv.json',
    );
    toast.success('JSON exported.');
  };

  const onExportJson: SubmitHandler<CvFormData> = (data) => {
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

  const onExportDocx: SubmitHandler<CvFormData> = async (data) => {
    setExporting(true);
    const minWait = new Promise((r) => setTimeout(r, 400));
    try {
      const [blob] = await Promise.all([createCvDocxBlob(data), minWait]);
      downloadBlob(blob, 'cv.docx');
      toast.success('DOCX exported.');
    } finally {
      setExporting(false);
    }
  };

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

  type HighlightsAiState = Record<
    string,
    { generating: boolean; result: AiResult<string[]> | null }
  >;
  const [highlightsAi, setHighlightsAi] = useState<HighlightsAiState>({});

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

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <a
        href="#cv-editor"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to editor
      </a>
      <FormActions
        onImport={onImport}
        onExportJson={handleSubmit(onExportJson)}
        onExportDocx={handleSubmit(onExportDocx)}
        exporting={exporting}
      />

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Form panel - full width on mobile, half on desktop */}
        <div className="min-h-0 flex-1 overscroll-contain overflow-y-auto lg:flex-1">
          <form
            id="cv-editor"
            aria-label="CV editor"
            className="space-y-8 p-4 pb-20 lg:p-6 lg:pb-6 xl:p-8 xl:pb-8"
          >
            <div>
              <h2 className="text-xl font-bold tracking-tight">Edit your CV</h2>
              <p className="text-sm text-muted-foreground">
                Let's face it: the AI writes better than you, works harder than you, and doesn't
                need coffee. Use its superiority to convince a human to hire you.
              </p>
            </div>

            {/* AI Assist */}
            <AiSettingsFields register={register} errors={errors} />

            {/* Job Description */}
            <JobDescriptionFields register={register} errors={errors} />

            {/* Cover Letter */}
            <CoverLetterFields
              register={register}
              control={control}
              errors={errors}
              generating={generatingCoverLetter}
              generatedText={generatedCoverLetter}
              onGenerate={onGenerateCoverLetter}
              onUse={onUseCoverLetter}
              onCopy={onCopyGenerated}
              onDismiss={() => setGeneratedCoverLetter(null)}
            />

            {/* Personal Info */}
            <PersonalInfoFields
              register={register}
              errors={errors.personalInfo}
              linkFields={links.fields}
              onAppendLink={() => links.append({ label: '', url: '' })}
              onRemoveLink={links.remove}
            />

            {/* Professional Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field data-invalid={errors.summary ? true : undefined}>
                    <FieldLabel htmlFor="summary" className="sr-only">
                      Summary
                    </FieldLabel>
                    <Textarea
                      id="summary"
                      {...register('summary')}
                      rows={6}
                      aria-invalid={errors.summary ? true : undefined}
                      aria-describedby={'summary-hint' + (errors.summary ? ' summary-error' : '')}
                    />
                    <MarkdownHint id="summary-hint">
                      A concise professional summary highlighting your key strengths.
                    </MarkdownHint>
                    {errors.summary && <FieldError id="summary-error" errors={[errors.summary]} />}
                  </Field>

                  <Collapsible open={summaryAiOpen} onOpenChange={setSummaryAiOpen}>
                    <CollapsibleTrigger
                      render={
                        <button
                          type="button"
                          aria-label="Enhance summary with AI"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        />
                      }
                    >
                      <SparklesIcon className="size-3.5" />
                      <ChevronDownIcon
                        className={
                          'size-3.5 transition-transform' + (summaryAiOpen ? ' rotate-180' : '')
                        }
                      />
                      Enhance with AI
                    </CollapsibleTrigger>

                    <CollapsibleContent className="space-y-3 pt-2">
                      <Field>
                        <FieldLabel htmlFor="aiSummaryPrompt">AI prompt</FieldLabel>
                        <Textarea
                          id="aiSummaryPrompt"
                          {...register('aiSummaryPrompt')}
                          rows={4}
                          className="text-xs"
                          placeholder="Rewrite the professional summary to highlight experience and skills most relevant to the job description. Keep it to 3–5 sentences."
                        />
                      </Field>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={!canGenerate || generatingSummary}
                          onClick={onGenerateSummary}
                          aria-busy={generatingSummary || undefined}
                        >
                          {generatingSummary ? (
                            <Loader2Icon className="animate-spin" data-icon="inline-start" />
                          ) : (
                            <SparklesIcon data-icon="inline-start" />
                          )}
                          {generatingSummary ? 'Generating…' : 'Generate with AI'}
                        </Button>
                        {!canGenerate && (
                          <span className="text-xs text-muted-foreground">
                            Requires API key and job description
                          </span>
                        )}
                      </div>

                      {generatedSummary && (
                        <div className="space-y-2 rounded-lg border border-dashed border-primary/30 bg-muted/50 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                              AI-generated summary
                              {generatedSummary.reasoning && (
                                <span className="block font-normal">
                                  {generatedSummary.reasoning}
                                </span>
                              )}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => onCopyGenerated(generatedSummary.content)}
                                aria-label="Copy to clipboard"
                              >
                                <ClipboardIcon />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => setGeneratedSummary(null)}
                                aria-label="Dismiss"
                              >
                                <XIcon />
                              </Button>
                            </div>
                          </div>
                          <BlockMarkdown text={generatedSummary.content} className="text-sm" />
                          <Button type="button" variant="default" size="sm" onClick={onUseSummary}>
                            <CheckIcon data-icon="inline-start" />
                            Use this summary
                          </Button>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Experience */}
            <div className="space-y-4">
              <SectionToolbar
                title="Experience"
                count={experience.fields.length}
                onCollapse={() => setExpSignal((s) => ({ n: s.n + 1, open: false }))}
                onExpand={() => setExpSignal((s) => ({ n: s.n + 1, open: true }))}
                onAdd={() => experience.insert(0, EMPTY_EXPERIENCE)}
                addLabel="Add Experience"
              />

              {experience.fields.map((field, index) => {
                const ai = buildEntryAiProps(`experience.${index}`);
                return (
                  <ExperienceEntryFields
                    key={field.id}
                    index={index}
                    prefix={`experience.${index}`}
                    idPrefix="exp"
                    register={register}
                    control={control}
                    errors={errors.experience}
                    onRemove={() => experience.remove(index)}
                    removeLabel="Remove Experience"
                    toggleSignal={expSignal}
                    canGenerate={ai.canGenerate}
                    generatingHighlights={ai.generatingHighlights}
                    generatedHighlights={ai.generatedHighlights}
                    onGenerateHighlights={ai.onGenerateHighlights}
                    onUseHighlights={ai.onUseHighlights}
                    onCopyHighlights={ai.onCopyHighlights}
                    onDismissHighlights={ai.onDismissHighlights}
                  />
                );
              })}
            </div>

            {/* Education */}
            <EducationFields
              fields={education.fields}
              register={register}
              control={control}
              errors={errors.education}
              onAdd={() => education.append(EMPTY_EDUCATION)}
              onRemove={education.remove}
              toggleSignal={eduSignal}
              onCollapse={() => setEduSignal((s) => ({ n: s.n + 1, open: false }))}
              onExpand={() => setEduSignal((s) => ({ n: s.n + 1, open: true }))}
              getAiProps={(index) => buildEntryAiProps(`education.${index}`)}
            />

            {/* Others */}
            <div className="space-y-4">
              <SectionToolbar
                title="Others"
                count={others.fields.length}
                onCollapse={() => setOthSignal((s) => ({ n: s.n + 1, open: false }))}
                onExpand={() => setOthSignal((s) => ({ n: s.n + 1, open: true }))}
                onAdd={() => others.insert(0, EMPTY_EXPERIENCE)}
                addLabel="Add Other"
              />

              {others.fields.map((field, index) => {
                const ai = buildEntryAiProps(`others.${index}`);
                return (
                  <ExperienceEntryFields
                    key={field.id}
                    index={index}
                    prefix={`others.${index}`}
                    idPrefix="other"
                    register={register}
                    control={control}
                    errors={errors.others}
                    onRemove={() => others.remove(index)}
                    removeLabel="Remove"
                    toggleSignal={othSignal}
                    canGenerate={ai.canGenerate}
                    generatingHighlights={ai.generatingHighlights}
                    generatedHighlights={ai.generatedHighlights}
                    onGenerateHighlights={ai.onGenerateHighlights}
                    onUseHighlights={ai.onUseHighlights}
                    onCopyHighlights={ai.onCopyHighlights}
                    onDismissHighlights={ai.onDismissHighlights}
                  />
                );
              })}
            </div>
          </form>
        </div>

        {/* Preview panel — always in DOM, slides in on mobile */}
        {previewOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-xs lg:hidden"
            onClick={togglePreview}
            aria-hidden
          />
        )}
        <aside
          id="cv-preview-panel"
          aria-label="CV preview"
          inert={!isDesktop && !previewOpen ? true : undefined}
          className={
            'fixed inset-y-0 right-0 z-50 w-full border-l bg-muted overflow-y-auto transition-transform duration-200 ease-in-out' +
            ' lg:static lg:z-auto lg:block lg:w-1/2 lg:translate-x-0' +
            (previewOpen ? ' translate-x-0' : ' translate-x-full')
          }
        >
          <CvPreviewPanel control={control} defaultValues={defaultValues} />
        </aside>
      </main>

      {/* Mobile FAB — toggles preview open/close from the same spot */}
      <Button
        size="lg"
        className="fixed right-4 bottom-4 z-50 gap-2 shadow-lg lg:hidden"
        onClick={togglePreview}
        aria-label={previewOpen ? 'Close preview' : 'Open preview'}
        aria-expanded={previewOpen}
        aria-controls="cv-preview-panel"
      >
        {previewOpen ? <XIcon /> : <EyeIcon />}
        {previewOpen ? 'Close' : 'Preview'}
      </Button>

      <AlertDialog.Root open={apiKeyWarningOpen} onOpenChange={setApiKeyWarningOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs" />
          <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-popover p-6 text-popover-foreground shadow-lg">
            <AlertDialog.Title className="text-base font-semibold">
              Your export contains a Gemini API key
            </AlertDialog.Title>
            <AlertDialog.Description
              render={<div />}
              className="mt-3 space-y-3 text-sm text-muted-foreground"
            >
              <p>
                The JSON file you&rsquo;re about to download includes your Gemini API key. Choose
                how to proceed:
              </p>
              <ul className="space-y-2">
                <li className="rounded-md border bg-muted/40 p-2.5">
                  <strong className="text-foreground">Export without key</strong>
                  <p className="mt-0.5">
                    Strips the key from the file. Safe to share or commit. You&rsquo;ll need to
                    re-enter the key next time you load this file.
                  </p>
                </li>
                <li className="rounded-md border bg-muted/40 p-2.5">
                  <strong className="text-foreground">Export with key</strong>
                  <p className="mt-0.5">
                    Keeps the key in the file for convenience. Do not share this file publicly —
                    anyone with it can use your key.
                  </p>
                </li>
              </ul>
            </AlertDialog.Description>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <AlertDialog.Close render={<Button variant="secondary" size="sm" />}>
                Cancel
              </AlertDialog.Close>
              <Button variant="outline" size="sm" onClick={onExportJsonWithoutKey}>
                Export without key
              </Button>
              <Button variant="default" size="sm" onClick={onExportJsonWithKey}>
                Export with key
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <Toaster position="bottom-left" />
    </div>
  );
}
