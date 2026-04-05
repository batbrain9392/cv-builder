import type { Control } from 'react-hook-form';

import { useController } from 'react-hook-form';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

import type { CvFormData } from '../cvFormSchema.ts';

import { MarkdownHint } from './MarkdownHint.tsx';

type HighlightsPath =
  | `experience.${number}.items`
  | `education.${number}.items`
  | `others.${number}.items`
  | 'skills';

interface HighlightsInputProps {
  control: Control<CvFormData>;
  name: HighlightsPath;
  id: string;
  label: string;
  hint?: string;
}

export function HighlightsInput({ control, name, id, label, hint }: HighlightsInputProps) {
  const { field, fieldState } = useController({ control, name });

  const arr: string[] = Array.isArray(field.value) ? field.value : [];
  const value = arr.map((b) => `- ${b}`).join('\n');

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const raw = e.target.value;
    const lines = raw.split('\n').map((l) => l.replace(/^[-*]\s?/, ''));
    field.onChange(lines.length > 0 ? lines : ['']);
  }

  return (
    <Field data-invalid={fieldState.invalid || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea
        id={id}
        value={value}
        onChange={handleChange}
        onBlur={field.onBlur}
        rows={1}
        aria-invalid={fieldState.invalid || undefined}
        aria-describedby={`${id}-hint` + (fieldState.invalid ? ` ${id}-error` : '')}
      />
      <MarkdownHint id={`${id}-hint`}>
        {hint ?? 'One highlight per line, using markdown list format.'}
      </MarkdownHint>
      {fieldState.invalid && <FieldError id={`${id}-error`} errors={[fieldState.error]} />}
    </Field>
  );
}
