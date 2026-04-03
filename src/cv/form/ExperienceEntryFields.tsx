import type { UseFormRegister, Control, FieldErrors } from 'react-hook-form';

import type { CvFormData } from '../cvFormSchema.ts';

import { BulletsTextarea } from './BulletsTextarea.tsx';

type ExperienceErrors = FieldErrors<CvFormData>['experience'];

interface ExperienceEntryFieldsProps {
  index: number;
  prefix: `experience.${number}` | `others.${number}`;
  idPrefix: string;
  register: UseFormRegister<CvFormData>;
  control: Control<CvFormData>;
  errors?: ExperienceErrors;
  onRemove: () => void;
  removeLabel: string;
}

export function ExperienceEntryFields({
  index,
  prefix,
  idPrefix,
  register,
  control,
  errors,
  onRemove,
  removeLabel,
}: ExperienceEntryFieldsProps) {
  const entryErrors = errors?.[index];
  return (
    <div className="repeatable-item">
      <div>
        <div>
          <label htmlFor={`${idPrefix}-role-${index}`}>
            Role
            <input
              id={`${idPrefix}-role-${index}`}
              {...register(`${prefix}.role`)}
              aria-describedby={entryErrors?.role ? `${idPrefix}-role-${index}-error` : undefined}
            />
          </label>
          {entryErrors?.role && (
            <p id={`${idPrefix}-role-${index}-error`} role="alert">
              {entryErrors.role.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${idPrefix}-company-${index}`}>
            Company
            <input
              id={`${idPrefix}-company-${index}`}
              {...register(`${prefix}.company`)}
              aria-describedby={
                entryErrors?.company ? `${idPrefix}-company-${index}-error` : undefined
              }
            />
          </label>
          {entryErrors?.company && (
            <p id={`${idPrefix}-company-${index}-error`} role="alert">
              {entryErrors.company.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${idPrefix}-url-${index}`}>
            URL
            <input
              id={`${idPrefix}-url-${index}`}
              {...register(`${prefix}.url`)}
              placeholder="https://"
              aria-describedby={entryErrors?.url ? `${idPrefix}-url-${index}-error` : undefined}
            />
          </label>
          {entryErrors?.url && (
            <p id={`${idPrefix}-url-${index}-error`} role="alert">
              {entryErrors.url.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${idPrefix}-start-${index}`}>
            Start Date
            <input
              id={`${idPrefix}-start-${index}`}
              {...register(`${prefix}.startDate`)}
              placeholder="Dec 2022"
              aria-describedby={
                entryErrors?.startDate ? `${idPrefix}-start-${index}-error` : undefined
              }
            />
          </label>
          {entryErrors?.startDate && (
            <p id={`${idPrefix}-start-${index}-error`} role="alert">
              {entryErrors.startDate.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${idPrefix}-end-${index}`}>
            End Date
            <input
              id={`${idPrefix}-end-${index}`}
              {...register(`${prefix}.endDate`)}
              placeholder="Present"
              aria-describedby={entryErrors?.endDate ? `${idPrefix}-end-${index}-error` : undefined}
            />
          </label>
          {entryErrors?.endDate && (
            <p id={`${idPrefix}-end-${index}-error`} role="alert">
              {entryErrors.endDate.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${idPrefix}-location-${index}`}>
            Location
            <input
              id={`${idPrefix}-location-${index}`}
              {...register(`${prefix}.location`)}
              aria-describedby={
                entryErrors?.location ? `${idPrefix}-location-${index}-error` : undefined
              }
            />
          </label>
          {entryErrors?.location && (
            <p id={`${idPrefix}-location-${index}-error`} role="alert">
              {entryErrors.location.message}
            </p>
          )}
        </div>
      </div>

      <BulletsTextarea
        control={control}
        name={`${prefix}.bullets`}
        id={`${idPrefix}-bullets-${index}`}
        label="Bullets (one per line)"
      />

      <div>
        <label htmlFor={`${idPrefix}-tech-${index}`}>
          Tech Stack
          <input
            id={`${idPrefix}-tech-${index}`}
            {...register(`${prefix}.techStack`)}
            placeholder="React, TypeScript, Zod"
            aria-describedby={
              entryErrors?.techStack ? `${idPrefix}-tech-${index}-error` : undefined
            }
          />
        </label>
        {entryErrors?.techStack && (
          <p id={`${idPrefix}-tech-${index}-error`} role="alert">
            {entryErrors.techStack.message}
          </p>
        )}
      </div>

      <button type="button" onClick={onRemove}>
        {removeLabel}
      </button>
    </div>
  );
}
