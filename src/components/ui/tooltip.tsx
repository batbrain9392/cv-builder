import type { ReactElement } from 'react';

import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';

interface TooltipProps {
  label: string;
  children: ReactElement;
}

export function Tooltip({ label, children }: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger delay={400} render={children} />
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner sideOffset={8} className="z-50">
          <TooltipPrimitive.Popup className="rounded-md bg-foreground px-2.5 py-1 text-xs text-background shadow-md">
            {label}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
