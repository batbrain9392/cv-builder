import type { ComponentType, ReactNode } from 'react';

const VARIANT_CLASSES = {
  info: 'border-primary/30 bg-primary/5 dark:bg-primary/10',
  warning: 'border-destructive/30 bg-destructive/5 dark:bg-destructive/10',
  privacy: 'border-primary/30 bg-primary/5 dark:bg-primary/10',
} as const;

interface GuideCalloutProps {
  icon: ComponentType<{ className?: string }>;
  variant?: keyof typeof VARIANT_CLASSES;
  children: ReactNode;
}

export function GuideCallout({ icon: Icon, variant = 'info', children }: GuideCalloutProps) {
  return (
    <div className={`flex gap-3 rounded-xl border p-4 ${VARIANT_CLASSES[variant]}`}>
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
