'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { Button } from '@/components/ui/Button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant='ghost'
      size='sm'>
      {theme === 'light' ? 'Dark mode' : 'Light mode'}
    </Button>
  );
}
