import { ChevronsDownUpIcon, ChevronsUpDownIcon, ChevronDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CollapsibleCardProps {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expandCollapseAll?: { anyOpen: boolean; onExpand: () => void; onCollapse: () => void };
  children: React.ReactNode;
}

export function CollapsibleCard({
  id,
  title,
  description,
  open,
  onOpenChange,
  expandCollapseAll,
  children,
}: CollapsibleCardProps) {
  return (
    <Card>
      <Collapsible open={open} onOpenChange={onOpenChange} className="flex flex-col gap-2">
        <div className="flex items-center pr-4 group-data-[size=sm]/card:pr-3">
          <CollapsibleTrigger
            render={
              <button
                type="button"
                aria-labelledby={id}
                className="flex-1 cursor-pointer text-left"
              />
            }
          >
            <CardHeader>
              <CardTitle id={id} className="flex items-center gap-1.5">
                <ChevronDownIcon
                  className={
                    'size-3.5 shrink-0 text-muted-foreground transition-transform' +
                    (open ? ' rotate-180' : '')
                  }
                />
                {title}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>

          {expandCollapseAll && open && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground sm:size-auto sm:px-2.5"
              onClick={(e) => {
                e.stopPropagation();
                if (expandCollapseAll.anyOpen) {
                  expandCollapseAll.onCollapse();
                } else {
                  expandCollapseAll.onExpand();
                }
              }}
            >
              {expandCollapseAll.anyOpen ? <ChevronsDownUpIcon /> : <ChevronsUpDownIcon />}
              <span className="sr-only sm:not-sr-only">
                {expandCollapseAll.anyOpen ? 'Collapse All' : 'Expand All'}
              </span>
            </Button>
          )}
        </div>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
