import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

interface BulletsTextareaProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  id: string;
  label: string;
  rows?: number;
  placeholder?: string;
}

export function BulletsTextarea<T extends FieldValues>({
  control,
  name,
  id,
  label,
  rows = 4,
  placeholder = 'Bullet 1\nBullet 2',
}: BulletsTextareaProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = Array.isArray(field.value) ? field.value.join('\n') : (field.value ?? '');
        return (
          <div>
            <label htmlFor={id}>
              {label}
              <textarea
                id={id}
                ref={field.ref}
                name={field.name}
                value={value}
                onChange={(e) => {
                  const lines = e.target.value.split('\n');
                  field.onChange(lines.length === 1 && lines[0] === '' ? [''] : lines);
                }}
                onBlur={field.onBlur}
                rows={rows}
                placeholder={placeholder}
                aria-describedby={fieldState.error ? `${id}-error` : undefined}
              />
            </label>
            {fieldState.error?.message && (
              <p id={`${id}-error`} role="alert">
                {fieldState.error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
