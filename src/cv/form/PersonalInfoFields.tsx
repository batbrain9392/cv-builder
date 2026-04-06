import type { UseFormRegister, FieldArrayWithId, FieldErrors } from 'react-hook-form';

import { PlusIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

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
    <FieldGroup>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={errors?.name ? true : undefined}>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            {...register('personalInfo.name')}
            aria-invalid={errors?.name ? true : undefined}
            aria-describedby={errors?.name ? 'name-error' : undefined}
          />
          {errors?.name && <FieldError id="name-error" errors={[errors.name]} />}
        </Field>

        <Field data-invalid={errors?.title ? true : undefined}>
          <FieldLabel htmlFor="title">Professional Title</FieldLabel>
          <Input
            id="title"
            {...register('personalInfo.title')}
            aria-invalid={errors?.title ? true : undefined}
            aria-describedby={errors?.title ? 'title-error' : undefined}
          />
          {errors?.title && <FieldError id="title-error" errors={[errors.title]} />}
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field data-invalid={errors?.location ? true : undefined}>
          <FieldLabel htmlFor="location">Location</FieldLabel>
          <Input
            id="location"
            {...register('personalInfo.location')}
            aria-invalid={errors?.location ? true : undefined}
            aria-describedby={errors?.location ? 'location-error' : undefined}
          />
          {errors?.location && <FieldError id="location-error" errors={[errors.location]} />}
        </Field>

        <Field data-invalid={errors?.email ? true : undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            {...register('personalInfo.email')}
            aria-invalid={errors?.email ? true : undefined}
            aria-describedby={errors?.email ? 'email-error' : undefined}
          />
          {errors?.email && <FieldError id="email-error" errors={[errors.email]} />}
        </Field>

        <Field data-invalid={errors?.phone ? true : undefined}>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <Input
            id="phone"
            {...register('personalInfo.phone')}
            aria-invalid={errors?.phone ? true : undefined}
            aria-describedby={errors?.phone ? 'phone-error' : undefined}
          />
          {errors?.phone && <FieldError id="phone-error" errors={[errors.phone]} />}
        </Field>
      </div>

      {linkFields.map((field, index) => (
        <div key={field.id} className="flex items-end gap-2">
          <Field className="flex-1">
            <FieldLabel
              htmlFor={`link-label-${index}`}
              className={index > 0 ? 'sr-only' : undefined}
            >
              Label
            </FieldLabel>
            <Input
              id={`link-label-${index}`}
              {...register(`personalInfo.links.${index}.label`)}
              placeholder="LinkedIn"
            />
          </Field>
          <Field className="flex-[2]">
            <FieldLabel htmlFor={`link-url-${index}`} className={index > 0 ? 'sr-only' : undefined}>
              URL
            </FieldLabel>
            <Input
              id={`link-url-${index}`}
              {...register(`personalInfo.links.${index}.url`)}
              placeholder="https://"
            />
          </Field>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-foreground/40 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onRemoveLink(index)}
            aria-label={`Remove link ${index + 1}`}
          >
            <XIcon />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start border-primary/30 text-primary-text hover:bg-primary/10"
        onClick={onAppendLink}
      >
        <PlusIcon data-icon="inline-start" />
        Add Link
      </Button>
    </FieldGroup>
  );
}
