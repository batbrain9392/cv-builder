import { type RefObject } from 'react';

import { useIsInView } from './useIsInView';

/**
 * Returns `true` once the observed element has scrolled fully out of the
 * viewport (above the top edge). Reverts to `false` when scrolled back into
 * view. Uses `IntersectionObserver` so there is no per-frame scroll cost.
 */
export function useIsScrolledPast(ref: RefObject<HTMLElement | null>): boolean {
  return !useIsInView(ref);
}
