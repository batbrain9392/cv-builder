import { type RefObject, useEffect, useState } from 'react';

/**
 * Returns `true` while the observed element intersects the viewport.
 * Uses `IntersectionObserver` — no per-frame scroll cost.
 */
export function useIsInView(ref: RefObject<HTMLElement | null>): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0,
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return inView;
}
