import { ChevronDownIcon } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface GuidePhaseProps {
  id: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function GuidePhase({ id, title, open, onOpenChange, children }: GuidePhaseProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(open ? undefined : 0);

  const measure = useCallback(() => {
    if (!contentRef.current) return;
    setHeight(open ? contentRef.current.scrollHeight : 0);
  }, [open]);

  useEffect(measure, [measure]);

  useEffect(() => {
    if (!open || !contentRef.current) return;
    const ro = new ResizeObserver(() => {
      if (contentRef.current) setHeight(contentRef.current.scrollHeight);
    });
    ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [open]);

  return (
    <section id={id} className="border-b last:border-b-0">
      <div className="sticky top-[93px] z-30 lg:top-[52px]">
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          aria-expanded={open}
          aria-controls={`${id}-content`}
          className={cn(
            'flex w-full items-center justify-between bg-background/95 px-4 py-4 text-left backdrop-blur sm:px-6 lg:px-8',
            open && 'border-b',
          )}
        >
          <h2 className="text-lg font-bold tracking-tight sm:text-xl">{title}</h2>
          <ChevronDownIcon
            className={cn(
              'size-5 shrink-0 text-muted-foreground transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </button>
      </div>
      <div
        id={`${id}-content`}
        role="region"
        aria-labelledby={id}
        className="overflow-hidden transition-[height] duration-300 ease-in-out"
        style={{ height: height === undefined ? 'auto' : height }}
      >
        <div ref={contentRef} className="px-4 pt-8 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
