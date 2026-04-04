import { ArrowUpIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ScrollToTopFabProps {
  visible: boolean;
  className?: string;
  onClick: () => void;
}

export function ScrollToTopFab({ visible, className, onClick }: ScrollToTopFabProps) {
  return (
    <Button
      variant="secondary"
      size="icon-lg"
      className={cn(
        'fixed z-50 rounded-full border shadow-md transition-all duration-300 hover:scale-105 active:scale-100',
        visible ? 'scale-100 opacity-100' : 'pointer-events-none scale-75 opacity-0',
        className,
      )}
      onClick={onClick}
      aria-label="Scroll to top"
    >
      <ArrowUpIcon className="size-4" />
    </Button>
  );
}
