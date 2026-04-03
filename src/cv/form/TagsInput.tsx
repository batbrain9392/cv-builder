import type { Control } from 'react-hook-form';

import { XIcon } from 'lucide-react';
import { useCallback, useMemo, useState, type KeyboardEvent } from 'react';
import { useController } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import type { CvFormData } from '../cvFormSchema.ts';

type TagsPath = `experience.${number}.tags` | `others.${number}.tags`;

interface TagsInputProps {
  control: Control<CvFormData>;
  name: TagsPath;
  id: string;
}

export function TagsInput({ control, name, id }: TagsInputProps) {
  const { field } = useController({ control, name });
  const tags = useMemo(() => field.value ?? [], [field.value]);
  const [draft, setDraft] = useState('');

  const addTag = useCallback(
    (raw: string) => {
      const tag = raw.trim();
      if (!tag) return;
      if (tags.includes(tag)) {
        setDraft('');
        return;
      }
      field.onChange([...tags, tag]);
      setDraft('');
    },
    [field, tags],
  );

  const removeTag = useCallback(
    (index: number) => {
      field.onChange(tags.filter((_, i) => i !== index));
    },
    [field, tags],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(draft);
    }
    if (e.key === 'Backspace' && draft === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleBlur = () => {
    addTag(draft);
    field.onBlur();
  };

  return (
    <div className="flex flex-col gap-2">
      <Input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        aria-describedby={`${id}-hint`}
      />
      <p id={`${id}-hint`} className="text-xs text-muted-foreground">
        Type and press Enter to add.
      </p>
      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <Badge key={`${tag}-${i}`} render={<li />} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                aria-label={`Remove ${tag}`}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
        </ul>
      )}
    </div>
  );
}
