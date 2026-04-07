import type { Ref, RefCallback } from 'react';

/** Composes multiple refs (callback and/or object refs) into one callback. */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined | null>): RefCallback<T> {
  return (instance: T | null) => {
    for (const ref of refs) {
      if (ref === undefined || ref === null) continue;
      if (typeof ref === 'function') {
        ref(instance);
      } else {
        Object.assign(ref, { current: instance });
      }
    }
  };
}
