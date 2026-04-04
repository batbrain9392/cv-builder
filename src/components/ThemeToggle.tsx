import { MoonIcon, SunIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return 'light';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const label = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';

  return (
    <Tooltip label={label}>
      <Button variant="inverted" size="icon-sm" onClick={toggle} aria-label={label}>
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </Button>
    </Tooltip>
  );
}
