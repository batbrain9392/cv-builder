import { useRef, useState } from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import type { CvFormData } from './lib/cvFormSchema.ts';
import { cvFormSchema } from './lib/cvFormSchema.ts';
import { CvPdfDocument } from './lib/CvPdfDocument.tsx';
import seedData from '../content/cv.json';
import './App.css';

export function App() {
  const [message, setMessage] = useState<string | null>(null);
  const [pdfPreviewData, setPdfPreviewData] = useState<CvFormData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CvFormData>({
    resolver: zodResolver(cvFormSchema),
    defaultValues: seedData as CvFormData,
  });

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

  const onExportPdf: SubmitHandler<CvFormData> = (data) => {
    setPdfPreviewData(data);
  };

  const handleDownloadPdf = async () => {
    if (!pdfPreviewData) return;
    const blob = await pdf(<CvPdfDocument data={pdfPreviewData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <header>
        <h1>CV Builder</h1>

        <div>
          <input ref={fileInputRef} type='file' accept='.json' onChange={onImport} />
          <button type='button' onClick={handleSubmit(onExport)}>
            Export data
          </button>
          <button type='button' onClick={handleSubmit(onExportPdf)}>
            Export as PDF
          </button>
        </div>

        {message && <p>{message}</p>}
      </header>

      <form>
        <fieldset>
          <legend>Job Description URL (optional)</legend>
          <div>
            <input
              {...register('jobDescriptionUrl')}
              placeholder='https://boards.greenhouse.io/...'
            />
            {errors.jobDescriptionUrl && <p>{errors.jobDescriptionUrl.message}</p>}
          </div>
        </fieldset>

        <fieldset>
          <legend>Personal Information</legend>
          <div>
            <div>
              <label htmlFor='name'>Full Name</label>
              <input id='name' {...register('personalInfo.name')} />
              {errors.personalInfo?.name && <p>{errors.personalInfo.name.message}</p>}
            </div>

            <div>
              <label htmlFor='title'>Professional Title</label>
              <input id='title' {...register('personalInfo.title')} />
              {errors.personalInfo?.title && <p>{errors.personalInfo.title.message}</p>}
            </div>

            <div>
              <label htmlFor='location'>Location</label>
              <input id='location' {...register('personalInfo.location')} />
              {errors.personalInfo?.location && <p>{errors.personalInfo.location.message}</p>}
            </div>

            <div>
              <label htmlFor='email'>Email</label>
              <input id='email' type='email' {...register('personalInfo.email')} />
              {errors.personalInfo?.email && <p>{errors.personalInfo.email.message}</p>}
            </div>

            <div>
              <label htmlFor='phone'>Phone</label>
              <input id='phone' {...register('personalInfo.phone')} />
              {errors.personalInfo?.phone && <p>{errors.personalInfo.phone.message}</p>}
            </div>

            {linkFields.map((field, index) => (
              <div key={field.id}>
                <label>Label</label>
                <input {...register(`personalInfo.links.${index}.label` as const)} placeholder='LinkedIn' />
                <label>URL</label>
                <input {...register(`personalInfo.links.${index}.url` as const)} placeholder='https://' />
                <button type='button' onClick={() => removeLink(index)}>Remove</button>
              </div>
            ))}

            <button type='button' onClick={() => appendLink({ label: '', url: '' })}>
              + Add Link
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend>Professional Summary</legend>
          <div>
            <textarea {...register('summary')} rows={6} placeholder='Write a professional summary.' />
            {errors.summary && <p>{errors.summary.message}</p>}
          </div>
        </fieldset>

        <fieldset>
          <legend>Experience</legend>
          <button
            type='button'
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
            <div key={field.id} className='repeatable-item'>
              <div>
                <div>
                  <label>Role</label>
                  <input {...register(`experience.${index}.role` as const)} />
                </div>
                <div>
                  <label>Company</label>
                  <input {...register(`experience.${index}.company` as const)} />
                </div>
                <div>
                  <label>URL</label>
                  <input {...register(`experience.${index}.url` as const)} placeholder='https://' />
                </div>
                <div>
                  <label>Start Date</label>
                  <input {...register(`experience.${index}.startDate` as const)} placeholder='Dec 2022' />
                </div>
                <div>
                  <label>End Date</label>
                  <input {...register(`experience.${index}.endDate` as const)} placeholder='Present' />
                </div>
                <div>
                  <label>Location</label>
                  <input {...register(`experience.${index}.location` as const)} />
                </div>
              </div>

              <div>
                <label>Bullets (one per line)</label>
                <textarea
                  {...register(`experience.${index}.bullets` as const)}
                  rows={4}
                  placeholder='Bullet 1&#10;Bullet 2'
                />
              </div>

              <div>
                <label>Tech Stack</label>
                <input {...register(`experience.${index}.techStack` as const)} placeholder='React, TypeScript, Zod' />
              </div>

              <button type='button' onClick={() => removeExperience(index)}>
                Remove Experience
              </button>
            </div>
          ))}
        </fieldset>

        <fieldset>
          <legend>Certifications</legend>
          <button
            type='button'
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
            <div key={field.id} className='repeatable-item'>
              <div>
                <label>Title</label>
                <input {...register(`certifications.${index}.title` as const)} />
              </div>
              <div>
                <label>Issuer</label>
                <input {...register(`certifications.${index}.issuer` as const)} />
              </div>
              <div>
                <label>Date</label>
                <input {...register(`certifications.${index}.date` as const)} placeholder='Aug 2021' />
              </div>
              <div>
                <label>Location</label>
                <input {...register(`certifications.${index}.location` as const)} />
              </div>
              <div>
                <label>Course URL</label>
                <input {...register(`certifications.${index}.courseUrl` as const)} placeholder='https://' />
              </div>
              <div>
                <label>Certificate URL</label>
                <input {...register(`certifications.${index}.certificateUrl` as const)} placeholder='https://' />
              </div>
              <div>
                <label>Bullets (one per line)</label>
                <textarea
                  {...register(`certifications.${index}.bullets` as const)}
                  rows={3}
                  placeholder='Bullet 1&#10;Bullet 2'
                />
              </div>

              <button type='button' onClick={() => removeCertification(index)}>
                Remove Certification
              </button>
            </div>
          ))}
        </fieldset>

        <fieldset>
          <legend>Others</legend>
          <button
            type='button'
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
            <div key={field.id} className='repeatable-item'>
              <div>
                <div>
                  <label>Role</label>
                  <input {...register(`others.${index}.role` as const)} />
                </div>
                <div>
                  <label>Company</label>
                  <input {...register(`others.${index}.company` as const)} />
                </div>
                <div>
                  <label>URL</label>
                  <input {...register(`others.${index}.url` as const)} placeholder='https://' />
                </div>
                <div>
                  <label>Start Date</label>
                  <input {...register(`others.${index}.startDate` as const)} placeholder='2019' />
                </div>
                <div>
                  <label>End Date</label>
                  <input {...register(`others.${index}.endDate` as const)} placeholder='2020' />
                </div>
                <div>
                  <label>Location</label>
                  <input {...register(`others.${index}.location` as const)} />
                </div>
              </div>

              <div>
                <label>Bullets (one per line)</label>
                <textarea
                  {...register(`others.${index}.bullets` as const)}
                  rows={3}
                  placeholder='Bullet 1&#10;Bullet 2'
                />
              </div>

              <div>
                <label>Tech Stack</label>
                <input {...register(`others.${index}.techStack` as const)} />
              </div>

              <button type='button' onClick={() => removeOther(index)}>
                Remove
              </button>
            </div>
          ))}
        </fieldset>
      </form>

      {pdfPreviewData && (
        <div className='pdf-modal-overlay' onClick={() => setPdfPreviewData(null)}>
          <div className='pdf-modal' onClick={(e) => e.stopPropagation()}>
            <div className='pdf-modal-header'>
              <button type='button' onClick={handleDownloadPdf}>
                Download PDF
              </button>
              <button type='button' onClick={() => setPdfPreviewData(null)}>
                Close
              </button>
            </div>
            <PDFViewer width='100%' height='100%' showToolbar={false}>
              <CvPdfDocument data={pdfPreviewData} />
            </PDFViewer>
          </div>
        </div>
      )}
    </div>
  );
}
