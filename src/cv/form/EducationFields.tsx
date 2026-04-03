import type { UseFormRegister, Control, FieldArrayWithId, FieldErrors } from 'react-hook-form';

import type { CvFormData } from '../cvFormSchema.ts';

import { BulletsTextarea } from './BulletsTextarea.tsx';

interface EducationFieldsProps {
  fields: FieldArrayWithId<CvFormData, 'education', 'id'>[];
  register: UseFormRegister<CvFormData>;
  control: Control<CvFormData>;
  errors?: FieldErrors<CvFormData>['education'];
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function EducationFields({
  fields,
  register,
  control,
  errors,
  onAdd,
  onRemove,
}: EducationFieldsProps) {
  return (
    <fieldset>
      <legend>Education</legend>
      <button type="button" onClick={onAdd}>
        + Add Education
      </button>

      {fields.map((field, index) => {
        const entryErrors = errors?.[index];
        return (
          <div key={field.id} className="repeatable-item">
            <div>
              <label htmlFor={`edu-degree-${index}`}>
                Degree
                <input
                  id={`edu-degree-${index}`}
                  {...register(`education.${index}.degree`)}
                  aria-describedby={entryErrors?.degree ? `edu-degree-${index}-error` : undefined}
                />
              </label>
              {entryErrors?.degree && (
                <p id={`edu-degree-${index}-error`} role="alert">
                  {entryErrors.degree.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor={`edu-institution-${index}`}>
                Institution
                <input
                  id={`edu-institution-${index}`}
                  {...register(`education.${index}.institution`)}
                  aria-describedby={
                    entryErrors?.institution ? `edu-institution-${index}-error` : undefined
                  }
                />
              </label>
              {entryErrors?.institution && (
                <p id={`edu-institution-${index}-error`} role="alert">
                  {entryErrors.institution.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor={`edu-url-${index}`}>
                Institution URL
                <input
                  id={`edu-url-${index}`}
                  {...register(`education.${index}.institutionUrl`)}
                  placeholder="https://"
                  aria-describedby={
                    entryErrors?.institutionUrl ? `edu-url-${index}-error` : undefined
                  }
                />
              </label>
              {entryErrors?.institutionUrl && (
                <p id={`edu-url-${index}-error`} role="alert">
                  {entryErrors.institutionUrl.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor={`edu-start-${index}`}>
                Start Year
                <input
                  id={`edu-start-${index}`}
                  {...register(`education.${index}.startYear`)}
                  placeholder="2010"
                  aria-describedby={entryErrors?.startYear ? `edu-start-${index}-error` : undefined}
                />
              </label>
              {entryErrors?.startYear && (
                <p id={`edu-start-${index}-error`} role="alert">
                  {entryErrors.startYear.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor={`edu-end-${index}`}>
                End Year
                <input
                  id={`edu-end-${index}`}
                  {...register(`education.${index}.endYear`)}
                  placeholder="2014"
                  aria-describedby={entryErrors?.endYear ? `edu-end-${index}-error` : undefined}
                />
              </label>
              {entryErrors?.endYear && (
                <p id={`edu-end-${index}-error`} role="alert">
                  {entryErrors.endYear.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor={`edu-location-${index}`}>
                Location
                <input
                  id={`edu-location-${index}`}
                  {...register(`education.${index}.location`)}
                  aria-describedby={
                    entryErrors?.location ? `edu-location-${index}-error` : undefined
                  }
                />
              </label>
              {entryErrors?.location && (
                <p id={`edu-location-${index}-error`} role="alert">
                  {entryErrors.location.message}
                </p>
              )}
            </div>

            <BulletsTextarea
              control={control}
              name={`education.${index}.bullets`}
              id={`edu-bullets-${index}`}
              label="Bullets (one per line)"
              rows={3}
            />

            <button type="button" onClick={() => onRemove(index)}>
              Remove Education
            </button>
          </div>
        );
      })}
    </fieldset>
  );
}
