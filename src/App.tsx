import { AlertDialog } from '@base-ui/react/alert-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckIcon,
  ChevronDownIcon,
  ClipboardIcon,
  EyeIcon,
  FolderOpenIcon,
  Loader2Icon,
  PenLineIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Route, Routes } from 'react-router';
import { toast } from 'sonner';

import { EmojiIcon } from '@/components/EmojiIcon';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GeminiIcon } from '@/components/GeminiIcon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Toaster } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownHint } from '@/cv/form/MarkdownHint.tsx';
import { BlockMarkdown } from '@/cv/preview/Markdown.tsx';

import type { CvFormData } from './cv/cvFormSchema.ts';

import { cvFormSchema, DEFAULT_HIGHLIGHTS_PROMPT } from './cv/cvFormSchema.ts';
import { AiSettingsFields } from './cv/form/AiSettingsFields.tsx';
import { BackupReminder } from './cv/form/BackupReminder.tsx';
import { CoverLetterFields } from './cv/form/CoverLetterFields.tsx';
import { DownloadDialog } from './cv/form/DownloadDialog.tsx';
import { EducationFields } from './cv/form/EducationFields.tsx';
import { ExperienceEntryFields } from './cv/form/ExperienceEntryFields.tsx';
import { FormActions } from './cv/form/FormActions.tsx';
import { ImportDialog } from './cv/form/ImportDialog.tsx';
import { JobDescriptionFields } from './cv/form/JobDescriptionFields.tsx';
import { PersonalInfoFields } from './cv/form/PersonalInfoFields.tsx';
import { SectionToolbar } from './cv/form/SectionToolbar.tsx';
import { EMPTY_DEFAULTS } from './cv/loadDefaultValues.ts';
import { CvPreviewPanel } from './cv/preview/CvPreviewPanel.tsx';
import { useAiGeneration } from './cv/useAiGeneration.ts';
import { useCvExport } from './cv/useCvExport.ts';

const AboutPage = lazy(() => import('./pages/AboutPage.tsx'));

const EMPTY_ENTRY = {
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
  const [summaryAiOpen, setSummaryAiOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const togglePreview = useCallback(() => setPreviewOpen((o) => !o), []);
  const [expSignal, setExpSignal] = useState({ n: 0, open: true });
  const [eduSignal, setEduSignal] = useState({ n: 0, open: true });
  const [othSignal, setOthSignal] = useState({ n: 0, open: true });

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [showBackupBanner, setShowBackupBanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const {
    exporting,
    apiKeyWarningOpen,
    setApiKeyWarningOpen,
    onImport,
    onExportJson,
    onExportDocx,
    onExportJsonWithKey,
    onExportJsonWithoutKey,
  } = useCvExport(reset, () => {
    setShowBackupBanner(false);
    setDownloadDialogOpen(false);
  });

  const {
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
  } = useAiGeneration(getValues, setValue, canGenerate);

  const onImportParsed = useCallback(
    (data: CvFormData) => {
      reset(data);
      setShowBackupBanner(true);
      toast.success('CV imported. Review and edit your data.');
    },
    [reset],
  );

  const onClearAll = useCallback(() => {
    reset(EMPTY_DEFAULTS);
    setClearConfirmOpen(false);
    toast.success('All data cleared.');
  }, [reset]);

  const onPickJsonFile = () => fileInputRef.current?.click();

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImport(e);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <a
        href="#cv-editor"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to editor
      </a>

      <main className="mx-auto flex min-h-0 w-full max-w-[1728px] flex-1 overflow-hidden lg:flex-row">
        {/* Form panel — hidden on mobile when preview is open */}
        <div className={'min-h-0 flex-1 overflow-y-auto' + (previewOpen ? ' hidden lg:block' : '')}>
          <form
            id="cv-editor"
            aria-label="CV editor"
            onSubmit={(e) => e.preventDefault()}
            className="space-y-8 p-4 pb-32 lg:p-6 lg:pb-6 xl:p-8 xl:pb-8"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="flex items-center gap-3 text-xl font-bold tracking-tight">
                  <PenLineIcon className="size-5" aria-hidden="true" /> Edit your CV
                </h1>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setImportDialogOpen(true)}
                  >
                    <FolderOpenIcon data-icon="inline-start" />
                    Load data
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setClearConfirmOpen(true)}
                  >
                    <Trash2Icon data-icon="inline-start" />
                    Clear all
                  </Button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                aria-label="Import CV JSON"
                onChange={handleImport}
                className="hidden"
              />
              <p className="text-sm text-muted-foreground">
                We start you off with sample data so you can see how things look. Replace it with
                your own, or use <strong>Load data</strong> to import an existing CV. When
                you&rsquo;re done, hit <strong>Download</strong> for a JSON backup or a polished
                DOCX.
              </p>
            </div>

            {showBackupBanner && <BackupReminder onDismiss={() => setShowBackupBanner(false)} />}

            <AiSettingsFields register={register} errors={errors} />

            <JobDescriptionFields register={register} errors={errors} />

            <CoverLetterFields
              register={register}
              control={control}
              errors={errors}
              defaultExpanded={defaultValues.coverLetterEnabled}
              generating={generatingCoverLetter}
              generatedText={generatedCoverLetter}
              onGenerate={onGenerateCoverLetter}
              onUse={onUseCoverLetter}
              onCopy={onCopyGenerated}
              onDismiss={() => setGeneratedCoverLetter(null)}
            />

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
                <CardTitle className="flex items-center gap-1.5">
                  <EmojiIcon emoji="📜" /> Professional Summary
                </CardTitle>
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
                          aria-label="Enhance with AI"
                          className="flex items-center hover:opacity-80"
                        />
                      }
                    >
                      <Badge variant="secondary" className="h-auto gap-1 text-xs [&>svg]:!size-3.5">
                        <GeminiIcon className="size-3.5" />
                        <ChevronDownIcon
                          className={
                            'size-3.5 transition-transform' + (summaryAiOpen ? ' rotate-180' : '')
                          }
                        />
                        Enhance with AI
                      </Badge>
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
                            <GeminiIcon className="size-4" data-icon="inline-start" />
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
            <section aria-labelledby="section-experience" className="space-y-4">
              <SectionToolbar
                id="section-experience"
                title={
                  <>
                    <EmojiIcon emoji="💼" /> Experience
                  </>
                }
                count={experience.fields.length}
                onCollapse={() => setExpSignal((s) => ({ n: s.n + 1, open: false }))}
                onExpand={() => setExpSignal((s) => ({ n: s.n + 1, open: true }))}
                onAdd={() => experience.insert(0, EMPTY_ENTRY)}
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
            </section>

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
            <section aria-labelledby="section-others" className="space-y-4">
              <SectionToolbar
                id="section-others"
                title={
                  <>
                    <EmojiIcon emoji="🧩" /> Others
                  </>
                }
                count={others.fields.length}
                onCollapse={() => setOthSignal((s) => ({ n: s.n + 1, open: false }))}
                onExpand={() => setOthSignal((s) => ({ n: s.n + 1, open: true }))}
                onAdd={() => others.insert(0, EMPTY_ENTRY)}
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
            </section>
          </form>
        </div>

        {/* Mobile preview — shown when preview is open, hidden on desktop */}
        {previewOpen && (
          <aside
            id="cv-preview-panel"
            aria-label="CV preview"
            className="min-h-0 flex-1 overflow-y-auto bg-muted pb-32 lg:hidden"
          >
            <ErrorBoundary
              fallback={
                <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
                  <p>Preview could not be rendered. Check your form data for issues.</p>
                </div>
              }
            >
              <CvPreviewPanel
                control={control}
                defaultValues={defaultValues}
                onDownload={() => setDownloadDialogOpen(true)}
              />
            </ErrorBoundary>
          </aside>
        )}

        {/* Desktop preview — static flex child, hidden on mobile */}
        <aside
          aria-label="CV preview"
          className="hidden min-h-0 overflow-y-auto border-l bg-muted lg:block lg:w-1/2"
        >
          <ErrorBoundary
            fallback={
              <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
                <p>Preview could not be rendered. Check your form data for issues.</p>
              </div>
            }
          >
            <CvPreviewPanel
              control={control}
              defaultValues={defaultValues}
              onDownload={() => setDownloadDialogOpen(true)}
            />
          </ErrorBoundary>
        </aside>
      </main>

      <FormActions />

      {/* Mobile FAB — toggle preview panel */}
      <Button
        size="lg"
        className="fixed right-4 bottom-16 z-50 gap-2 shadow-lg lg:hidden"
        onClick={togglePreview}
        aria-label={previewOpen ? 'Close preview' : 'Open preview'}
        aria-expanded={previewOpen}
        aria-controls={previewOpen ? 'cv-preview-panel' : undefined}
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

      <AlertDialog.Root open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs" />
          <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-popover p-6 text-popover-foreground shadow-lg">
            <AlertDialog.Title className="text-base font-semibold">
              Clear all data?
            </AlertDialog.Title>
            <AlertDialog.Description
              render={<div />}
              className="mt-3 space-y-2 text-sm text-muted-foreground"
            >
              <p>
                This will erase all CV data and reset to a blank form. You can&rsquo;t undo this.
              </p>
              <p>
                If you haven&rsquo;t already, use the <strong>Download</strong> button first to save
                a JSON backup &mdash; it&rsquo;s the only way to reload your data later.
              </p>
            </AlertDialog.Description>
            <div className="mt-4 flex justify-end gap-2">
              <AlertDialog.Close render={<Button variant="secondary" size="sm" />}>
                Cancel
              </AlertDialog.Close>
              <Button variant="destructive" size="sm" onClick={onClearAll}>
                Clear everything
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <DownloadDialog
        open={downloadDialogOpen}
        onOpenChange={setDownloadDialogOpen}
        onExportJson={handleSubmit(onExportJson)}
        onExportDocx={handleSubmit(onExportDocx)}
        exporting={exporting}
      />

      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onPickJsonFile={onPickJsonFile}
        onImportParsed={onImportParsed}
        currentApiKey={aiApiKey}
      />

      <Toaster position="bottom-left" />
    </div>
  );
}
