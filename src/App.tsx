import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronsDownUpIcon, ChevronsUpDownIcon, EyeIcon, PlusIcon, XIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';

import type { CvFormData } from './cv/cvFormSchema.ts';

import seedData from '../content/cv.json';
import { cvFormSchema } from './cv/cvFormSchema.ts';
import { downloadBlob } from './cv/downloadBlob.ts';
import { createCvDocxBlob } from './cv/export/CvDocxDocument.ts';
import { EducationFields } from './cv/form/EducationFields.tsx';
import { ExperienceEntryFields } from './cv/form/ExperienceEntryFields.tsx';
import { FormActions } from './cv/form/FormActions.tsx';
import { PersonalInfoFields } from './cv/form/PersonalInfoFields.tsx';
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

const defaultValues = cvFormSchema.parse(seedData);

export function App() {
  const [exporting, setExporting] = useState(false);
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
  } = useForm<CvFormData>({
    resolver: zodResolver(cvFormSchema),
    defaultValues,
  });

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
        const parsed = cvFormSchema.safeParse(data);
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

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
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

      <main className="min-h-0 flex-1 overflow-hidden lg:flex">
        {/* Form panel - full width on mobile, half on desktop */}
        <form
          id="cv-editor"
          aria-label="CV editor"
          className="h-full space-y-8 overflow-y-auto p-4 pb-20 lg:flex-1 lg:p-6 lg:pb-6 xl:p-8 xl:pb-8"
        >
          <div>
            <h2 className="text-xl font-bold tracking-tight">Edit your CV</h2>
            <p className="text-sm text-muted-foreground">
              Fill in the sections below. Changes are reflected in the preview instantly.
            </p>
          </div>

          {/* Job Description URL */}
          <Card>
            <CardHeader>
              <CardTitle>
                Job Description URL{' '}
                <span className="text-sm font-normal text-muted-foreground">(optional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field data-invalid={errors.jobDescriptionUrl ? true : undefined}>
                  <FieldLabel htmlFor="jobDescriptionUrl" className="sr-only">
                    Job Description URL
                  </FieldLabel>
                  <Input
                    id="jobDescriptionUrl"
                    {...register('jobDescriptionUrl')}
                    placeholder="https://boards.greenhouse.io/..."
                    aria-invalid={errors.jobDescriptionUrl ? true : undefined}
                    aria-describedby={
                      errors.jobDescriptionUrl ? 'jobDescriptionUrl-error' : undefined
                    }
                  />
                  {errors.jobDescriptionUrl && (
                    <FieldError id="jobDescriptionUrl-error" errors={[errors.jobDescriptionUrl]} />
                  )}
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

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
                  <FieldLabel htmlFor="summary">Summary</FieldLabel>
                  <Textarea
                    id="summary"
                    {...register('summary')}
                    rows={6}
                    placeholder="Write a professional summary."
                    aria-invalid={errors.summary ? true : undefined}
                    aria-describedby={errors.summary ? 'summary-error' : undefined}
                  />
                  {errors.summary && <FieldError id="summary-error" errors={[errors.summary]} />}
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Experience */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-primary">Experience</h2>
              <div className="flex items-center gap-2">
                {experience.fields.length > 0 && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground sm:size-auto sm:px-2.5"
                      aria-label="Collapse all"
                      onClick={() => setExpSignal((s) => ({ n: s.n + 1, open: false }))}
                    >
                      <ChevronsDownUpIcon />
                      <span className="sr-only sm:not-sr-only">Collapse All</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground sm:size-auto sm:px-2.5"
                      aria-label="Expand all"
                      onClick={() => setExpSignal((s) => ({ n: s.n + 1, open: true }))}
                    >
                      <ChevronsUpDownIcon />
                      <span className="sr-only sm:not-sr-only">Expand All</span>
                    </Button>
                  </>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="border-primary/30 text-primary hover:bg-primary/10 sm:size-auto sm:px-2.5"
                  aria-label="Add experience"
                  onClick={() => experience.insert(0, EMPTY_EXPERIENCE)}
                >
                  <PlusIcon />
                  <span className="sr-only sm:not-sr-only">Add Experience</span>
                </Button>
              </div>
            </div>

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
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-primary">Others</h2>
              <div className="flex items-center gap-2">
                {others.fields.length > 0 && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground sm:size-auto sm:px-2.5"
                      aria-label="Collapse all"
                      onClick={() => setOthSignal((s) => ({ n: s.n + 1, open: false }))}
                    >
                      <ChevronsDownUpIcon />
                      <span className="sr-only sm:not-sr-only">Collapse All</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground sm:size-auto sm:px-2.5"
                      aria-label="Expand all"
                      onClick={() => setOthSignal((s) => ({ n: s.n + 1, open: true }))}
                    >
                      <ChevronsUpDownIcon />
                      <span className="sr-only sm:not-sr-only">Expand All</span>
                    </Button>
                  </>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="border-primary/30 text-primary hover:bg-primary/10 sm:size-auto sm:px-2.5"
                  aria-label="Add other"
                  onClick={() => others.insert(0, EMPTY_EXPERIENCE)}
                >
                  <PlusIcon />
                  <span className="sr-only sm:not-sr-only">Add Other</span>
                </Button>
              </div>
            </div>

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
            'fixed inset-y-0 right-0 z-50 w-full border-l bg-background overflow-y-auto transition-transform duration-200 ease-in-out' +
            ' lg:static lg:z-auto lg:block lg:w-1/2 lg:translate-x-0 lg:bg-muted' +
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
