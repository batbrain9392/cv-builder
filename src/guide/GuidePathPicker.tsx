import type { ComponentType } from 'react';

interface PathCard {
  icon: ComponentType<{ className?: string }>;
  label: string;
  description: string;
  targetId: string;
}

interface GuidePathPickerProps {
  paths: PathCard[];
  onSelect: (id: string) => void;
}

export function GuidePathPicker({ paths, onSelect }: GuidePathPickerProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {paths.map((p) => (
        <button
          key={p.targetId}
          type="button"
          onClick={() => onSelect(p.targetId)}
          className="group flex flex-col gap-2 rounded-xl border bg-card p-4 text-left text-card-foreground ring-1 ring-foreground/5 transition-shadow hover:shadow-md hover:ring-primary/30"
        >
          <p.icon
            className="size-5 text-primary-text transition-transform group-hover:scale-110"
            aria-hidden="true"
          />
          <p className="text-sm font-semibold">{p.label}</p>
          <p className="text-xs text-muted-foreground">{p.description}</p>
        </button>
      ))}
    </div>
  );
}
