import type { Control } from 'react-hook-form';

import { PencilIcon, XIcon } from 'lucide-react';
import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useController } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

import type { CvFormData } from '../cvFormSchema.ts';

type BulletsPath =
  | `experience.${number}.bullets`
  | `education.${number}.bullets`
  | `others.${number}.bullets`;

interface BulletsInputProps {
  control: Control<CvFormData>;
  name: BulletsPath;
  id: string;
  label: string;
}

export function BulletsInput({ control, name, id, label }: BulletsInputProps) {
  const { field, fieldState } = useController({ control, name });
  const bullets = useMemo(() => field.value ?? [], [field.value]);
  const [draft, setDraft] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const commitDraft = useCallback(
    (raw: string) => {
      const lines = raw
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length === 0) return;

      if (editIndex !== null) {
        const updated = [...bullets];
        updated.splice(editIndex, 1, ...lines);
        field.onChange(updated);
        setEditIndex(null);
      } else {
        field.onChange([...bullets, ...lines]);
      }
      setDraft('');
    },
    [field, bullets, editIndex],
  );

  const removeBullet = useCallback(
    (index: number) => {
      const updated = bullets.filter((_: string, i: number) => i !== index);
      field.onChange(updated.length > 0 ? updated : ['']);
      if (editIndex === index) {
        setEditIndex(null);
        setDraft('');
      } else if (editIndex !== null && editIndex > index) {
        setEditIndex(editIndex - 1);
      }
    },
    [field, bullets, editIndex],
  );

  const startEdit = useCallback(
    (index: number) => {
      setEditIndex(index);
      setDraft(bullets[index]);
      textareaRef.current?.focus();
    },
    [bullets],
  );

  const cancelEdit = useCallback(() => {
    setEditIndex(null);
    setDraft('');
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commitDraft(draft);
    }
    if (e.key === 'Escape' && editIndex !== null) {
      e.preventDefault();
      cancelEdit();
    }
  };

  const handleBlur = () => {
    if (draft.trim()) {
      commitDraft(draft);
    } else if (editIndex !== null) {
      cancelEdit();
    }
    field.onBlur();
  };

  const nonEmptyBullets = bullets.filter((b: string) => b.trim() !== '');

  return (
    <Field data-invalid={fieldState.invalid || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea
        ref={textareaRef}
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        rows={2}
        placeholder={
          editIndex !== null
            ? 'Edit bullet (Enter to save, Esc to cancel)'
            : 'Type a bullet and press Enter (paste multiple lines to add several)'
        }
        aria-invalid={fieldState.invalid || undefined}
        aria-describedby={fieldState.invalid ? `${id}-error` : undefined}
      />
      {fieldState.invalid && <FieldError id={`${id}-error`} errors={[fieldState.error]} />}
      {nonEmptyBullets.length > 0 && (
        <ul className="flex flex-col gap-1">
          {nonEmptyBullets.map((bullet: string, i: number) => (
            <li
              key={i}
              className={
                'group flex items-start gap-2 rounded-md border px-3 py-2 text-sm' +
                (editIndex === i ? ' border-ring bg-accent' : ' border-border')
              }
            >
              <span className="shrink-0 text-muted-foreground">{i + 1}.</span>
              <span className="flex-1">{bullet}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                onClick={() => startEdit(i)}
                aria-label={`Edit bullet ${i + 1}`}
              >
                <PencilIcon className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-destructive opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                onClick={() => removeBullet(i)}
                aria-label={`Remove bullet ${i + 1}`}
              >
                <XIcon className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Field>
  );
}
