import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';

import type { CvFormData } from './cv/cvFormSchema.ts';

import seedData from '../content/cv.json';
import { cvFormSchema } from './cv/cvFormSchema.ts';
import { createCvDocxBlob } from './cv/export/CvDocxDocument.ts';
import { CvPreview } from './cv/preview/CvPreview.tsx';
import './App.css';

export function App() {
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    getValues,
  } = useForm<CvFormData>({
    resolver: zodResolver(cvFormSchema),
    defaultValues: seedData as CvFormData,
  });

  const watchedData = watch();

  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({
    control,
    name: 'personalInfo.links',
  });

  const {
    fields: experienceFields,
    insert: insertExperience,
    remove: removeExperience,
  } = useFieldArray({
    control,
    name: 'experience',
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({
    control,
    name: 'certifications',
  });

  const {
    fields: othersFields,
    insert: insertOther,
    remove: removeOther,
  } = useFieldArray({
    control,
    name: 'others',
  });

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        const parsed = cvFormSchema.safeParse(data);
        if (parsed.success) {
          reset(parsed.data);
          setMessage('Loaded.');
        } else {
          setMessage('Invalid cv.json.');
        }
      } catch {
        setMessage('Could not parse file.');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const onExport: SubmitHandler<CvFormData> = (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportDocx = async () => {
    const data = getValues();
    const blob = await createCvDocxBlob(data);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv.docx';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <header>
        <h1>CV Builder</h1>

        <div>
          <input ref={fileInputRef} type="file" accept=".json" onChange={onImport} />
          <button type="button" onClick={handleSubmit(onExport)}>
            Export data
          </button>
          <button type="button" onClick={handleExportDocx}>
            Export as DOCX
          </button>
        </div>

        {message && <p>{message}</p>}
      </header>

      <div className="app-layout">
        <form className="app-form">
          <fieldset>
            <legend>Job Description URL (optional)</legend>
            <div>
              <input
                {...register('jobDescriptionUrl')}
                placeholder="https://boards.greenhouse.io/..."
              />
              {errors.jobDescriptionUrl && <p>{errors.jobDescriptionUrl.message}</p>}
            </div>
          </fieldset>

          <fieldset>
            <legend>Personal Information</legend>
            <div>
              <div>
                <label htmlFor="name">
                  Full Name
                  <input id="name" {...register('personalInfo.name')} />
                </label>
                {errors.personalInfo?.name && <p>{errors.personalInfo.name.message}</p>}
              </div>

              <div>
                <label htmlFor="title">
                  Professional Title
                  <input id="title" {...register('personalInfo.title')} />
                </label>
                {errors.personalInfo?.title && <p>{errors.personalInfo.title.message}</p>}
              </div>

              <div>
                <label htmlFor="location">
                  Location
                  <input id="location" {...register('personalInfo.location')} />
                </label>
                {errors.personalInfo?.location && <p>{errors.personalInfo.location.message}</p>}
              </div>

              <div>
                <label htmlFor="email">
                  Email
                  <input id="email" type="email" {...register('personalInfo.email')} />
                </label>
                {errors.personalInfo?.email && <p>{errors.personalInfo.email.message}</p>}
              </div>

              <div>
                <label htmlFor="phone">
                  Phone
                  <input id="phone" {...register('personalInfo.phone')} />
                </label>
                {errors.personalInfo?.phone && <p>{errors.personalInfo.phone.message}</p>}
              </div>

              {linkFields.map((field, index) => (
                <div key={field.id}>
                  <label htmlFor={`link-label-${index}`}>
                    Label
                    <input
                      id={`link-label-${index}`}
                      {...register(`personalInfo.links.${index}.label` as const)}
                      placeholder="LinkedIn"
                    />
                  </label>
                  <label htmlFor={`link-url-${index}`}>
                    URL
                    <input
                      id={`link-url-${index}`}
                      {...register(`personalInfo.links.${index}.url` as const)}
                      placeholder="https://"
                    />
                  </label>
                  <button type="button" onClick={() => removeLink(index)}>
                    Remove
                  </button>
                </div>
              ))}

              <button type="button" onClick={() => appendLink({ label: '', url: '' })}>
                + Add Link
              </button>
            </div>
          </fieldset>

          <fieldset>
            <legend>Professional Summary</legend>
            <div>
              <textarea
                {...register('summary')}
                rows={6}
                placeholder="Write a professional summary."
              />
              {errors.summary && <p>{errors.summary.message}</p>}
            </div>
          </fieldset>

          <fieldset>
            <legend>Experience</legend>
            <button
              type="button"
              onClick={() =>
                insertExperience(0, {
                  role: '',
                  company: '',
                  url: '',
                  startDate: '',
                  location: '',
                  bullets: [''],
                  techStack: '',
                })
              }
            >
              + Add Experience
            </button>

            {experienceFields.map((field, index) => (
              <div key={field.id} className="repeatable-item">
                <div>
                  <div>
                    <label htmlFor={`exp-role-${index}`}>
                      Role
                      <input
                        id={`exp-role-${index}`}
                        {...register(`experience.${index}.role` as const)}
                      />
                    </label>
                  </div>
                  <div>
                    <label htmlFor={`exp-company-${index}`}>
                      Company
                      <input
                        id={`exp-company-${index}`}
                        {...register(`experience.${index}.company` as const)}
                      />
                    </label>
                  </div>
                  <div>
                    <label htmlFor={`exp-url-${index}`}>
                      URL
                      <input
                        id={`exp-url-${index}`}
                        {...register(`experience.${index}.url` as const)}
                        placeholder="https://"
                      />
                    </label>
                  </div>
                  <div>
                    <label htmlFor={`exp-start-${index}`}>
                      Start Date
                      <input
                        id={`exp-start-${index}`}
                        {...register(`experience.${index}.startDate` as const)}
                        placeholder="Dec 2022"
                      />
                    </label>
                  </div>
                  <div>
                    <label htmlFor={`exp-end-${index}`}>
                      End Date
                      <input
                        id={`exp-end-${index}`}
                        {...register(`experience.${index}.endDate` as const)}
                        placeholder="Present"
                      />
                    </label>
                  </div>
                  <div>
                    <label htmlFor={`exp-location-${index}`}>
                      Location
                      <input
                        id={`exp-location-${index}`}
                        {...register(`experience.${index}.location` as const)}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor={`exp-bullets-${index}`}>
                    Bullets (one per line)
                    <textarea
                      id={`exp-bullets-${index}`}
                      {...register(`experience.${index}.bullets` as const)}
                      rows={4}
                      placeholder="Bullet 1&#10;Bullet 2"
                    />
                  </label>
                </div>

                <div>
                  <label htmlFor={`exp-tech-${index}`}>
                    Tech Stack
                    <input
                      id={`exp-tech-${index}`}
                      {...register(`experience.${index}.techStack` as const)}
                      placeholder="React, TypeScript, Zod"
                    />
                  </label>
                </div>

                <button type="button" onClick={() => removeExperience(index)}>
                  Remove Experience
                </button>
              </div>
            ))}
          </fieldset>

          <fieldset>
            <legend>Certifications</legend>
            <button
              type="button"
              onClick={() =>
                appendCertification({
                  title: '',
                  issuer: '',
                  date: '',
                  location: '',
                  courseUrl: '',
                  certificateUrl: '',
                  bullets: [''],
                })
              }
            >
              + Add Certification
            </button>

            {certificationFields.map((field, index) => (
              <div key={field.id} className="repeatable-item">
                <div>
                  <label htmlFor={`cert-title-${index}`}>
                    Title
                    <input
                      id={`cert-title-${index}`}
                      {...register(`certifications.${index}.title` as const)}
                    />
                  </label>
                </div>
                <div>
                  <label htmlFor={`cert-issuer-${index}`}>
                    Issuer
                    <input
                      id={`cert-issuer-${index}`}
                      {...register(`certifications.${index}.issuer` as const)}
                    />
                  </label>
                </div>
                <div>
                  <label htmlFor={`cert-date-${index}`}>
                    Date
                    <input
                      id={`cert-date-${index}`}
                      {...register(`certifications.${index}.date` as const)}
                      placeholder="Aug 2021"
                    />
                  </label>
                </div>
                <div>
                  <label htmlFor={`cert-location-${index}`}>
                    Location
                    <input
                      id={`cert-location-${index}`}
                      {...register(`certifications.${index}.location` as const)}
                    />
                  </label>
                </div>
                <div>
                  <label htmlFor={`cert-course-url-${index}`}>
                    Course URL
                    <input
                      id={`cert-course-url-${index}`}
                      {...register(`certifications.${index}.courseUrl` as const)}
                      placeholder="https://"
                    />
                  </label>
                </div>
                <div>
                  <label htmlFor={`cert-cert-url-${index}`}>
                    Certificate URL
                    <input
                      id={`cert-cert-url-${index}`}
                      {...register(`certifications.${index}.certificateUrl` as const)}
                      placeholder="https://"
                    />
                  </label>
                </div>
                <div>
                  <label htmlFor={`cert-bullets-${index}`}>
                    Bullets (one per line)
                    <textarea
                      id={`cert-bullets-${index}`}
                      {...register(`certifications.${index}.bullets` as const)}
                      rows={3}
                      placeholder="Bullet 1&#10;Bullet 2"
                    />
                  </label>
                </div>

                <button type="button" onClick={() => removeCertification(index)}>
                  Remove Certification
                </button>
              </div>
            ))}
          </fieldset>

          <fieldset>
            <legend>Others</legend>
            <button
              type="button"
              onClick={() =>
                insertOther(0, {
                  role: '',
                  company: '',
                  url: '',
                  startDate: '',
                  location: '',
                  bullets: [''],
                  techStack: '',
                })
              }
            >
              + Add Other
            </button>

            {othersFields.map((field, index) => (
              <div key={field.id} className="repeatable-item">
                <div>
                  <div>
                    <label htmlFor={`other-role-${index}`}>
                      Role
                      <input
                        id={`other-role-${index}`}
                        {...register(`others.${index}.role` as const)}
                      />
                    </label>
                  </div>
                  <div>
                    <label htmlFor={`other-company-${index}`}>
                      Company
                      <input
                        id={`other-company-${index}`}
                        {...register(`others.${index}.company` as const)}
                      />
                    </label>
                  </div>
                  <div>
                    <label htmlFor={`other-url-${index}`}>
                      URL
                      <input
                        id={`other-url-${index}`}
                        {...register(`others.${index}.url` as const)}
                        placeholder="https://"
                      />
                    </label>
                  </div>
                  <div>
                    <label htmlFor={`other-start-${index}`}>
                      Start Date
                      <input
                        id={`other-start-${index}`}
                        {...register(`others.${index}.startDate` as const)}
                        placeholder="2019"
                      />
                    </label>
                  </div>
                  <div>
                    <label htmlFor={`other-end-${index}`}>
                      End Date
                      <input
                        id={`other-end-${index}`}
                        {...register(`others.${index}.endDate` as const)}
                        placeholder="2020"
                      />
                    </label>
                  </div>
                  <div>
                    <label htmlFor={`other-location-${index}`}>
                      Location
                      <input
                        id={`other-location-${index}`}
                        {...register(`others.${index}.location` as const)}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor={`other-bullets-${index}`}>
                    Bullets (one per line)
                    <textarea
                      id={`other-bullets-${index}`}
                      {...register(`others.${index}.bullets` as const)}
                      rows={3}
                      placeholder="Bullet 1&#10;Bullet 2"
                    />
                  </label>
                </div>

                <div>
                  <label htmlFor={`other-tech-${index}`}>
                    Tech Stack
                    <input
                      id={`other-tech-${index}`}
                      {...register(`others.${index}.techStack` as const)}
                    />
                  </label>
                </div>

                <button type="button" onClick={() => removeOther(index)}>
                  Remove
                </button>
              </div>
            ))}
          </fieldset>
        </form>

        <aside className="app-preview">
          <div className="cv-preview-wrapper">
            <CvPreview data={watchedData} />
          </div>
        </aside>
      </div>
    </div>
  );
}
