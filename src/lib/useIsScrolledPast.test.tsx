import { render, act } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { useIsScrolledPast } from './useIsScrolledPast';

let fire: (isIntersecting: boolean, bottom: number) => void;

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn((cb: IntersectionObserverCallback) => {
      const instance: IntersectionObserver = {
        observe: vi.fn(),
        disconnect: vi.fn(),
        unobserve: vi.fn(),
        root: null,
        rootMargin: '',
        thresholds: [0],
        takeRecords: () => [],
      };

      fire = (isIntersecting: boolean, bottom: number) => {
        const rect = DOMRect.fromRect({ x: 0, y: bottom - 100, width: 100, height: 100 });
        const entry: IntersectionObserverEntry = {
          isIntersecting,
          boundingClientRect: rect,
          intersectionRatio: isIntersecting ? 1 : 0,
          intersectionRect: rect,
          rootBounds: null,
          target: document.createElement('div'),
          time: performance.now(),
        };
        cb([entry], instance);
      };

      return instance;
    }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

function TestHarness({ onValue }: { onValue: (v: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const scrolledPast = useIsScrolledPast(ref);
  onValue(scrolledPast);
  return <div ref={ref} />;
}

describe('useIsScrolledPast', () => {
  it('returns false initially', () => {
    const values: boolean[] = [];
    render(<TestHarness onValue={(v) => values.push(v)} />);
    expect(values.at(-1)).toBe(false);
  });

  it('returns true when element is above viewport (bottom < 0)', () => {
    const values: boolean[] = [];
    render(<TestHarness onValue={(v) => values.push(v)} />);

    act(() => fire(false, -100));

    expect(values.at(-1)).toBe(true);
  });

  it('returns false when element is below viewport (bottom > 0, not intersecting)', () => {
    const values: boolean[] = [];
    render(<TestHarness onValue={(v) => values.push(v)} />);

    act(() => fire(false, 500));

    expect(values.at(-1)).toBe(false);
  });

  it('returns false when element comes back into view', () => {
    const values: boolean[] = [];
    render(<TestHarness onValue={(v) => values.push(v)} />);

    act(() => fire(false, -50));
    expect(values.at(-1)).toBe(true);

    act(() => fire(true, 200));
    expect(values.at(-1)).toBe(false);
  });
});
