import { type RefObject, useEffect, useState } from 'react';

/**
 * Returns `true` once the observed element has scrolled fully above the
 * viewport top edge. Returns `false` while the element is in view or still
 * below the fold. Uses `IntersectionObserver` — no per-frame scroll cost.
 */
export function useIsScrolledPast(ref: RefObject<HTMLElement | null>): boolean {
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setScrolledPast(false);
        } else {
          setScrolledPast(entry.boundingClientRect.bottom < 0);
        }
      },
      { threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return scrolledPast;
}
