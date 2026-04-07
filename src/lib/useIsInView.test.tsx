import { act, cleanup, render, within } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { useIsInView } from './useIsInView';

let fire: (isIntersecting: boolean) => void;

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

      fire = (isIntersecting: boolean) => {
        const target = document.createElement('div');
        const rect = DOMRect.fromRect({ x: 0, y: 0, width: 10, height: 10 });
        const entry: IntersectionObserverEntry = {
          isIntersecting,
          boundingClientRect: rect,
          intersectionRatio: isIntersecting ? 1 : 0,
          intersectionRect: rect,
          rootBounds: null,
          target,
          time: performance.now(),
        };
        cb([entry], instance);
      };

      return instance;
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function VisibilityReadout({ showTarget, threshold }: { showTarget: boolean; threshold: number }) {
  const [inView, targetRef] = useIsInView({ threshold });
  return (
    <>
      {showTarget ? <div ref={targetRef} data-testid="target" /> : null}
      <span data-testid="in-view">{inView ? 'in' : 'out'}</span>
    </>
  );
}

function VisibilityWithScrollRoot({ showTarget }: { showTarget: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inView, targetRef] = useIsInView({ root: scrollRef, threshold: 0 });
  return (
    <div ref={scrollRef} data-testid="scroll-root" style={{ height: 120, overflow: 'auto' }}>
      {showTarget ? <div ref={targetRef} data-testid="target" /> : null}
      <span data-testid="in-view">{inView ? 'in' : 'out'}</span>
    </div>
  );
}

describe('useIsInView', () => {
  it('reports in view after the observer fires', () => {
    const { container } = render(<VisibilityReadout showTarget threshold={0} />);
    const view = within(container);
    expect(view.getByTestId('in-view')).toHaveTextContent('out');

    act(() => {
      fire(true);
    });
    expect(view.getByTestId('in-view')).toHaveTextContent('in');
  });

  it('resets to out when the target unmounts without changing other options', () => {
    const { container, rerender } = render(<VisibilityReadout showTarget threshold={0} />);
    const view = within(container);
    act(() => {
      fire(true);
    });
    expect(view.getByTestId('in-view')).toHaveTextContent('in');

    rerender(<VisibilityReadout showTarget={false} threshold={0} />);
    expect(view.getByTestId('in-view')).toHaveTextContent('out');
  });

  it('uses a non-viewport root when provided', () => {
    const { container } = render(<VisibilityWithScrollRoot showTarget />);
    const view = within(container);
    expect(view.getByTestId('in-view')).toHaveTextContent('out');

    act(() => {
      fire(true);
    });
    expect(view.getByTestId('in-view')).toHaveTextContent('in');
  });
});
