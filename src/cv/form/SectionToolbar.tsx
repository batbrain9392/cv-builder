import { ChevronsDownUpIcon, ChevronsUpDownIcon, PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface SectionToolbarProps {
  title: React.ReactNode;
  count: number;
  onCollapse: () => void;
  onExpand: () => void;
  onAdd: () => void;
  addLabel: string;
}

export function SectionToolbar({
  title,
  count,
  onCollapse,
  onExpand,
  onAdd,
  addLabel,
}: SectionToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-1.5 text-base font-semibold text-primary">{title}</h2>
      <div className="flex items-center gap-2">
        {count > 0 && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground sm:size-auto sm:px-2.5"
              aria-label="Collapse all"
              onClick={onCollapse}
            >
              <ChevronsDownUpIcon />
              <span className="sr-only sm:not-sr-only">Collapse All</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground sm:size-auto sm:px-2.5"
              aria-label="Expand all"
              onClick={onExpand}
            >
              <ChevronsUpDownIcon />
              <span className="sr-only sm:not-sr-only">Expand All</span>
            </Button>
          </>
        )}
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="border-primary/30 text-primary hover:bg-primary/10 sm:size-auto sm:px-2.5"
          aria-label={addLabel}
          onClick={onAdd}
        >
          <PlusIcon />
          <span className="sr-only sm:not-sr-only">{addLabel}</span>
        </Button>
      </div>
    </div>
  );
}
