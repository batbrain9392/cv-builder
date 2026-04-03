import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useRef, useState } from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';

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
import './App.css';

const EMPTY_EXPERIENCE = {
  role: '',
  company: '',
  url: '',
  startDate: '',
  location: '',
  bullets: [''],
  techStack: '',
};

const EMPTY_EDUCATION = {
  degree: '',
  institution: '',
  institutionUrl: '',
  startYear: '',
  location: '',
  bullets: [''],
};

const MESSAGE_TIMEOUT_MS = 3000;

const defaultValues = cvFormSchema.parse(seedData);

export function App() {
  const [message, setMessage] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showMessage = useCallback((text: string) => {
    clearTimeout(messageTimerRef.current);
    setMessage(text);
    messageTimerRef.current = setTimeout(() => setMessage(null), MESSAGE_TIMEOUT_MS);
  }, []);

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
    setMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (typeof reader.result !== 'string') return;
        const data = JSON.parse(reader.result);
        const parsed = cvFormSchema.safeParse(data);
        if (parsed.success) {
          reset(parsed.data);
          showMessage('Loaded.');
        } else {
          showMessage('Invalid cv.json.');
        }
      } catch {
        showMessage('Could not parse file.');
      }
    };
    reader.readAsText(file);
  };

  const onExportJson: SubmitHandler<CvFormData> = (data) => {
    downloadBlob(
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      'cv.json',
    );
  };

  const onExportDocx: SubmitHandler<CvFormData> = async (data) => {
    setExporting(true);
    try {
      downloadBlob(await createCvDocxBlob(data), 'cv.docx');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <FormActions
        onImport={onImport}
        onExportJson={handleSubmit(onExportJson)}
        onExportDocx={handleSubmit(onExportDocx)}
        exporting={exporting}
        message={message}
      />

      <div className="app-layout">
        <form className="app-form">
          <fieldset>
            <legend>Job Description URL (optional)</legend>
            <div>
              <label htmlFor="jobDescriptionUrl">
                URL
                <input
                  id="jobDescriptionUrl"
                  {...register('jobDescriptionUrl')}
                  placeholder="https://boards.greenhouse.io/..."
                  aria-describedby={
                    errors.jobDescriptionUrl ? 'jobDescriptionUrl-error' : undefined
                  }
                />
              </label>
              {errors.jobDescriptionUrl && (
                <p id="jobDescriptionUrl-error" role="alert">
                  {errors.jobDescriptionUrl.message}
                </p>
              )}
            </div>
          </fieldset>

          <PersonalInfoFields
            register={register}
            errors={errors.personalInfo}
            linkFields={links.fields}
            onAppendLink={() => links.append({ label: '', url: '' })}
            onRemoveLink={links.remove}
          />

          <fieldset>
            <legend>Professional Summary</legend>
            <div>
              <label htmlFor="summary">
                Summary
                <textarea
                  id="summary"
                  {...register('summary')}
                  rows={6}
                  placeholder="Write a professional summary."
                  aria-describedby={errors.summary ? 'summary-error' : undefined}
                />
              </label>
              {errors.summary && (
                <p id="summary-error" role="alert">
                  {errors.summary.message}
                </p>
              )}
            </div>
          </fieldset>

          <fieldset>
            <legend>Experience</legend>
            <button type="button" onClick={() => experience.insert(0, EMPTY_EXPERIENCE)}>
              + Add Experience
            </button>

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
              />
            ))}
          </fieldset>

          <EducationFields
            fields={education.fields}
            register={register}
            control={control}
            errors={errors.education}
            onAdd={() => education.append(EMPTY_EDUCATION)}
            onRemove={education.remove}
          />

          <fieldset>
            <legend>Others</legend>
            <button type="button" onClick={() => others.insert(0, EMPTY_EXPERIENCE)}>
              + Add Other
            </button>

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
              />
            ))}
          </fieldset>
        </form>

        <CvPreviewPanel control={control} defaultValues={defaultValues} />
      </div>
    </div>
  );
}
