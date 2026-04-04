import { MoonIcon, SunIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { useTheme } from '@/lib/useTheme';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const label = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';

  return (
    <Tooltip label={label}>
      <Button
        variant="inverted"
        size="icon-sm"
        onClick={toggle}
        aria-label={label}
        className={className}
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </Button>
    </Tooltip>
  );
}
