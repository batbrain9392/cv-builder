import type { UseFormRegister, FieldArrayWithId, FieldErrors } from 'react-hook-form';

import type { CvFormData } from '../cvFormSchema.ts';

interface PersonalInfoFieldsProps {
  register: UseFormRegister<CvFormData>;
  errors?: FieldErrors<CvFormData>['personalInfo'];
  linkFields: FieldArrayWithId<CvFormData, 'personalInfo.links', 'id'>[];
  onAppendLink: () => void;
  onRemoveLink: (index: number) => void;
}

export function PersonalInfoFields({
  register,
  errors,
  linkFields,
  onAppendLink,
  onRemoveLink,
}: PersonalInfoFieldsProps) {
  return (
    <fieldset>
      <legend>Personal Information</legend>
      <div>
        <div>
          <label htmlFor="name">
            Full Name
            <input
              id="name"
              {...register('personalInfo.name')}
              aria-describedby={errors?.name ? 'name-error' : undefined}
            />
          </label>
          {errors?.name && (
            <p id="name-error" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="title">
            Professional Title
            <input
              id="title"
              {...register('personalInfo.title')}
              aria-describedby={errors?.title ? 'title-error' : undefined}
            />
          </label>
          {errors?.title && (
            <p id="title-error" role="alert">
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="location">
            Location
            <input
              id="location"
              {...register('personalInfo.location')}
              aria-describedby={errors?.location ? 'location-error' : undefined}
            />
          </label>
          {errors?.location && (
            <p id="location-error" role="alert">
              {errors.location.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email">
            Email
            <input
              id="email"
              type="email"
              {...register('personalInfo.email')}
              aria-describedby={errors?.email ? 'email-error' : undefined}
            />
          </label>
          {errors?.email && (
            <p id="email-error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone">
            Phone
            <input
              id="phone"
              {...register('personalInfo.phone')}
              aria-describedby={errors?.phone ? 'phone-error' : undefined}
            />
          </label>
          {errors?.phone && (
            <p id="phone-error" role="alert">
              {errors.phone.message}
            </p>
          )}
        </div>

        {linkFields.map((field, index) => (
          <div key={field.id}>
            <label htmlFor={`link-label-${index}`}>
              Label
              <input
                id={`link-label-${index}`}
                {...register(`personalInfo.links.${index}.label`)}
                placeholder="LinkedIn"
              />
            </label>
            <label htmlFor={`link-url-${index}`}>
              URL
              <input
                id={`link-url-${index}`}
                {...register(`personalInfo.links.${index}.url`)}
                placeholder="https://"
              />
            </label>
            <button type="button" onClick={() => onRemoveLink(index)}>
              Remove
            </button>
          </div>
        ))}

        <button type="button" onClick={onAppendLink}>
          + Add Link
        </button>
      </div>
    </fieldset>
  );
}
