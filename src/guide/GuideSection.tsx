import type { ComponentType, ReactNode } from 'react';

import { cn } from '@/lib/utils';

const TAG_CLASSES = {
  default: 'bg-primary/10 text-primary-text',
  gemini: 'bg-accent text-accent-foreground',
  optional: 'bg-muted text-muted-foreground',
} as const;

interface GuideSectionProps {
  id: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  tag?: { label: string; variant?: keyof typeof TAG_CLASSES };
  children: ReactNode;
}

export function GuideSection({ id, icon: Icon, title, tag, children }: GuideSectionProps) {
  return (
    <section id={id} className="space-y-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <Icon className="size-5 text-primary-text" aria-hidden="true" />
        <h3 className="text-base font-bold tracking-tight sm:text-lg">{title}</h3>
        {tag && (
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium',
              TAG_CLASSES[tag.variant ?? 'default'],
            )}
          >
            {tag.label}
          </span>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
