import type { UseFormRegister, Control, FieldArrayWithId, FieldErrors } from 'react-hook-form';

import type { CvFormData } from '../cvFormSchema.ts';

import { BulletsTextarea } from './BulletsTextarea.tsx';

interface CertificationFieldsProps {
  fields: FieldArrayWithId<CvFormData, 'certifications', 'id'>[];
  register: UseFormRegister<CvFormData>;
  control: Control<CvFormData>;
  errors?: FieldErrors<CvFormData>['certifications'];
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function CertificationFields({
  fields,
  register,
  control,
  errors,
  onAdd,
  onRemove,
}: CertificationFieldsProps) {
  return (
    <fieldset>
      <legend>Certifications</legend>
      <button type="button" onClick={onAdd}>
        + Add Certification
      </button>

      {fields.map((field, index) => {
        const entryErrors = errors?.[index];
        return (
          <div key={field.id} className="repeatable-item">
            <div>
              <label htmlFor={`cert-title-${index}`}>
                Title
                <input
                  id={`cert-title-${index}`}
                  {...register(`certifications.${index}.title`)}
                  aria-describedby={entryErrors?.title ? `cert-title-${index}-error` : undefined}
                />
              </label>
              {entryErrors?.title && (
                <p id={`cert-title-${index}-error`} role="alert">
                  {entryErrors.title.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor={`cert-issuer-${index}`}>
                Issuer
                <input
                  id={`cert-issuer-${index}`}
                  {...register(`certifications.${index}.issuer`)}
                  aria-describedby={entryErrors?.issuer ? `cert-issuer-${index}-error` : undefined}
                />
              </label>
              {entryErrors?.issuer && (
                <p id={`cert-issuer-${index}-error`} role="alert">
                  {entryErrors.issuer.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor={`cert-date-${index}`}>
                Date
                <input
                  id={`cert-date-${index}`}
                  {...register(`certifications.${index}.date`)}
                  placeholder="Aug 2021"
                  aria-describedby={entryErrors?.date ? `cert-date-${index}-error` : undefined}
                />
              </label>
              {entryErrors?.date && (
                <p id={`cert-date-${index}-error`} role="alert">
                  {entryErrors.date.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor={`cert-location-${index}`}>
                Location
                <input
                  id={`cert-location-${index}`}
                  {...register(`certifications.${index}.location`)}
                  aria-describedby={
                    entryErrors?.location ? `cert-location-${index}-error` : undefined
                  }
                />
              </label>
              {entryErrors?.location && (
                <p id={`cert-location-${index}-error`} role="alert">
                  {entryErrors.location.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor={`cert-course-url-${index}`}>
                Course URL
                <input
                  id={`cert-course-url-${index}`}
                  {...register(`certifications.${index}.courseUrl`)}
                  placeholder="https://"
                  aria-describedby={
                    entryErrors?.courseUrl ? `cert-course-url-${index}-error` : undefined
                  }
                />
              </label>
              {entryErrors?.courseUrl && (
                <p id={`cert-course-url-${index}-error`} role="alert">
                  {entryErrors.courseUrl.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor={`cert-cert-url-${index}`}>
                Certificate URL
                <input
                  id={`cert-cert-url-${index}`}
                  {...register(`certifications.${index}.certificateUrl`)}
                  placeholder="https://"
                  aria-describedby={
                    entryErrors?.certificateUrl ? `cert-cert-url-${index}-error` : undefined
                  }
                />
              </label>
              {entryErrors?.certificateUrl && (
                <p id={`cert-cert-url-${index}-error`} role="alert">
                  {entryErrors.certificateUrl.message}
                </p>
              )}
            </div>
            <BulletsTextarea
              control={control}
              name={`certifications.${index}.bullets`}
              id={`cert-bullets-${index}`}
              label="Bullets (one per line)"
              rows={3}
            />

            <button type="button" onClick={() => onRemove(index)}>
              Remove Certification
            </button>
          </div>
        );
      })}
    </fieldset>
  );
}
