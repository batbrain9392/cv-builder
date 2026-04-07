import {
  type RefCallback,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

export type UseIsInViewOptions = {
  /** Intersection observer root; `null` uses the viewport. */
  root?: RefObject<HTMLElement | null> | null;
  /** 0–1; can be a single value or array (see IntersectionObserver). */
  threshold?: number | number[];
  rootMargin?: string;
};

/**
 * Observe whether an element intersects the observer root (viewport when `root` is omitted).
 *
 * Returns `[isInView, ref]` — pass `ref` to the element to observe. Updates correctly on mount
 * and unmount without relying on `ref.current` in effect dependency lists.
 */
export function useIsInView(
  options?: UseIsInViewOptions,
): readonly [boolean, RefCallback<HTMLElement | null>] {
  const [inView, setInView] = useState(false);
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [rootEl, setRootEl] = useState<Element | null>(null);

  const rootOption = options?.root ?? null;
  const threshold = options?.threshold ?? 0;
  const rootMargin = options?.rootMargin ?? '0px';

  useLayoutEffect(() => {
    setRootEl(rootOption?.current ?? null);
  }, [rootOption, node]);

  useEffect(() => {
    if (!node) {
      setInView(false);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      root: rootEl,
      rootMargin,
      threshold,
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, rootEl, rootMargin, threshold]);

  const setTargetRef = useCallback((el: HTMLElement | null) => {
    setNode(el);
  }, []);

  return [inView, setTargetRef];
}
