import type React from 'react';

import { cn } from '@/lib/utils';

function Card({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<'div'> & { size?: 'default' | 'sm' }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        'group/card flex flex-col gap-2 overflow-hidden rounded-xl border-l-3 border-l-primary bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 data-[size=sm]:gap-1.5 data-[size=sm]:py-3',
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3',
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({
  className,
  as: Comp = 'h3',
  ...props
}: React.ComponentProps<'h3'> & { as?: 'h2' | 'h3' | 'h4' }) {
  return (
    <Comp
      data-slot="card-title"
      className={cn(
        'font-heading text-base leading-snug font-medium text-primary-text group-data-[size=sm]/card:text-sm',
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-4 group-data-[size=sm]/card:px-3', className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, CardContent };
