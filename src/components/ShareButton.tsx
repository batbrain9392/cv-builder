import { Share2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { shareApp } from '@/lib/share';

interface ShareButtonProps {
  variant?: 'inverted' | 'default' | 'outline' | 'ghost';
  size?: 'icon-sm' | 'icon' | 'sm' | 'default';
  label?: string;
}

export function ShareButton({ variant = 'inverted', size = 'icon-sm', label }: ShareButtonProps) {
  return (
    <Tooltip label="Share">
      <Button variant={variant} size={size} onClick={shareApp} aria-label="Share">
        <Share2Icon />
        {label && <span>{label}</span>}
      </Button>
    </Tooltip>
  );
}
