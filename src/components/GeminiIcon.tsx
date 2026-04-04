import { cn } from '@/lib/utils';

export const GEMINI_LOGO_URL = 'https://cdn.simpleicons.org/googlegemini';

export function GeminiIcon({ className, ...props }: React.ComponentProps<'img'>) {
  return (
    <img
      src={GEMINI_LOGO_URL}
      alt=""
      aria-hidden="true"
      className={cn('inline-block shrink-0 dark:invert', className)}
      loading="lazy"
      referrerPolicy="no-referrer"
      {...props}
    />
  );
}
