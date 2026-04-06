import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  id?: string;
  title: React.ReactNode;
  /** Controlled mode — omit both to use internal state (starts collapsed). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function CollapsibleSection({
  id,
  title,
  open: controlledOpen,
  onOpenChange: controlledOnChange,
  defaultOpen = false,
  children,
  className,
}: CollapsibleSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = isControlled ? controlledOnChange : setInternalOpen;

  return (
    <section aria-labelledby={id}>
      <Collapsible open={open} onOpenChange={onOpenChange} className={cn('space-y-3', className)}>
        <CollapsibleTrigger
          render={
            <button
              type="button"
              aria-labelledby={id}
              className="flex w-full items-center gap-1.5 rounded-md text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          }
        >
          <ChevronDownIcon
            className={cn(
              'size-3.5 shrink-0 text-muted-foreground transition-transform',
              open && 'rotate-180',
            )}
          />
          <h3 id={id} className="flex items-center gap-1.5 text-sm font-semibold">
            {title}
          </h3>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-3">{children}</CollapsibleContent>
      </Collapsible>
    </section>
  );
}
