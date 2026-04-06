import { type RefObject, useEffect, useState } from 'react';

/**
 * Returns `true` while the observed element intersects the viewport.
 * Uses `IntersectionObserver` — no per-frame scroll cost.
 */
export function useIsInView(
  ref: RefObject<HTMLElement | null>,
  options?: { root?: RefObject<HTMLElement | null>; threshold?: number },
): boolean {
  const [inView, setInView] = useState(false);

  const root = options?.root;
  const threshold = options?.threshold ?? 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      root: root?.current ?? null,
      threshold,
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, root, threshold]);

  return inView;
}
