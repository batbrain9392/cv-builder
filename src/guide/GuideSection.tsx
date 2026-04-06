import type { ComponentType, ReactNode } from 'react';

import { GuideStepBadge } from '@/guide/GuideStepBadge';

interface GuideSectionProps {
  id: string;
  step: number;
  icon: ComponentType<{ className?: string }>;
  title: string;
  alt?: boolean;
  children: ReactNode;
}

export function GuideSection({ id, step, icon: Icon, title, alt, children }: GuideSectionProps) {
  return (
    <section
      id={id}
      className={`px-4 py-16 sm:py-20 lg:px-6 xl:px-8 ${alt ? 'bg-secondary text-secondary-foreground' : 'bg-background text-foreground'}`}
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <GuideStepBadge step={step} />
          <Icon className="size-5 text-primary-text" aria-hidden="true" />
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}
