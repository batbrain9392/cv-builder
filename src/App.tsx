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
import { useCallback, useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Toaster } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';

import type { CvFormData } from './cv/cvFormSchema.ts';

import seedData from '../content/cv.json';
import { generateCoverLetter, generateSummary } from './cv/ai/generateWithAi.ts';
import {
  cvFormSchema,
  DEFAULT_COVER_LETTER_PROMPT,
  DEFAULT_SUMMARY_PROMPT,
} from './cv/cvFormSchema.ts';
import { downloadBlob } from './cv/downloadBlob.ts';
import { createCvDocxBlob } from './cv/export/CvDocxDocument.ts';
import { AiSettingsFields } from './cv/form/AiSettingsFields.tsx';
import { CoverLetterFields } from './cv/form/CoverLetterFields.tsx';
import { EducationFields } from './cv/form/EducationFields.tsx';
import { ExperienceEntryFields } from './cv/form/ExperienceEntryFields.tsx';
import { FormActions } from './cv/form/FormActions.tsx';
import { PersonalInfoFields } from './cv/form/PersonalInfoFields.tsx';
import { SectionToolbar } from './cv/form/SectionToolbar.tsx';
import { CvPreviewPanel } from './cv/preview/CvPreviewPanel.tsx';

const EMPTY_EXPERIENCE = {
  role: '',
  company: '',
  url: '',
  startDate: '',
  location: '',
  bullets: [''],
  tagsLabel: '',
  tags: [],
};

const EMPTY_EDUCATION = {
  degree: '',
  institution: '',
  institutionUrl: '',
  startYear: '',
  location: '',
  bullets: [''],
};

const AI_FIELD_DEFAULTS: Partial<CvFormData> = {
  aiApiKey: '',
  jobDescriptionText: '',
  aiSummaryPrompt: DEFAULT_SUMMARY_PROMPT,
  coverLetterEnabled: false,
  coverLetter: '',
  aiCoverLetterPrompt: DEFAULT_COVER_LETTER_PROMPT,
};

const defaultValues = cvFormSchema.parse(seedData);

export function App() {
  const [exporting, setExporting] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string | null>(null);
  const [summaryPromptOpen, setSummaryPromptOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const togglePreview = useCallback(() => setPreviewOpen((o) => !o), []);
  const [expSignal, setExpSignal] = useState({ n: 0, open: true });
  const [eduSignal, setEduSignal] = useState({ n: 0, open: true });
  const [othSignal, setOthSignal] = useState({ n: 0, open: true });

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
        const withDefaults = { ...AI_FIELD_DEFAULTS, ...data };
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

  const onExportJson: SubmitHandler<CvFormData> = (data) => {
    downloadBlob(
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      'cv.json',
    );
    toast.success('JSON exported.');
  };

  const onExportDocx: SubmitHandler<CvFormData> = async (data) => {
    setExporting(true);
    try {
      downloadBlob(await createCvDocxBlob(data), 'cv.docx');
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
        values.aiSummaryPrompt ?? '',
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
    setValue('summary', generatedSummary, { shouldValidate: true, shouldDirty: true });
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
        values.aiCoverLetterPrompt ?? '',
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
    setValue('coverLetter', generatedCoverLetter, { shouldValidate: true, shouldDirty: true });
    setGeneratedCoverLetter(null);
    toast.success('Cover letter applied.');
  };

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
                Fill in the sections below. Changes are reflected in the preview instantly.
              </p>
            </div>

            {/* Personal Info */}
            <PersonalInfoFields
              register={register}
              errors={errors.personalInfo}
              linkFields={links.fields}
              onAppendLink={() => links.append({ label: '', url: '' })}
              onRemoveLink={links.remove}
            />

            {/* AI Settings */}
            <AiSettingsFields register={register} errors={errors} />

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
                    <p id="summary-hint" className="text-xs text-muted-foreground">
                      A concise professional summary highlighting your key strengths.
                    </p>
                    {errors.summary && <FieldError id="summary-error" errors={[errors.summary]} />}
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
                        </span>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onCopyGenerated(generatedSummary)}
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
                      <p className="whitespace-pre-wrap text-sm">{generatedSummary}</p>
                      <Button type="button" variant="default" size="sm" onClick={onUseSummary}>
                        <CheckIcon data-icon="inline-start" />
                        Use this summary
                      </Button>
                    </div>
                  )}

                  <Collapsible open={summaryPromptOpen} onOpenChange={setSummaryPromptOpen}>
                    <CollapsibleTrigger
                      render={
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        />
                      }
                    >
                      <ChevronDownIcon
                        className={
                          'size-3.5 transition-transform' + (summaryPromptOpen ? ' rotate-180' : '')
                        }
                      />
                      Customize AI prompt
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <Field>
                        <FieldLabel htmlFor="aiSummaryPrompt" className="sr-only">
                          Summary AI prompt
                        </FieldLabel>
                        <Textarea
                          id="aiSummaryPrompt"
                          {...register('aiSummaryPrompt')}
                          rows={4}
                          className="text-xs"
                        />
                      </Field>
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

              {experience.fields.map((field, index) => (
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
                />
              ))}
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

              {others.fields.map((field, index) => (
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
                />
              ))}
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
          aria-label="CV preview"
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
      >
        {previewOpen ? <XIcon /> : <EyeIcon />}
        {previewOpen ? 'Close' : 'Preview'}
      </Button>

      <Toaster position="bottom-left" />
    </div>
  );
}
