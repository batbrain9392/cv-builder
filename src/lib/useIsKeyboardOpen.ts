import { useEffect, useRef, useState } from 'react';

const THRESHOLD = 0.75;

/**
 * Detects whether the mobile virtual keyboard is likely open by comparing
 * the visual viewport height to the full window height. When the visual
 * viewport shrinks below {@link THRESHOLD} of `window.innerHeight`, the
 * keyboard is considered open.
 *
 * Works alongside `interactive-widget=resizes-content` in the viewport meta
 * tag. That directive tells supporting browsers to resize the layout viewport
 * when the keyboard opens, but not all browsers support it yet — this hook
 * acts as a complementary signal to hide fixed UI that would overlap the
 * keyboard on browsers without support.
 *
 * Returns `false` on browsers that don't support `window.visualViewport`.
 */
export function useIsKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);
  const rafId = useRef(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const check = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        setOpen(vv.height < window.innerHeight * THRESHOLD);
      });
    };

    check();

    vv.addEventListener('resize', check);
    return () => {
      vv.removeEventListener('resize', check);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return open;
}
