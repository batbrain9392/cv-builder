import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from './ErrorBoundary';

function ThrowOnce({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('boom');
  return <p>child content</p>;
}

describe('ErrorBoundary', () => {
  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary fallback={<p>fallback</p>}>
        <p>ok</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('ok')).toBeInTheDocument();
    expect(screen.queryByText('fallback')).not.toBeInTheDocument();
  });

  it('renders static fallback on error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<p>static fallback</p>}>
        <ThrowOnce shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByText('static fallback')).toBeInTheDocument();
    vi.restoreAllMocks();
  });

  it('renders function fallback with reset, and reset re-renders children', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let shouldThrow = true;

    function Child() {
      if (shouldThrow) throw new Error('boom');
      return <p>recovered</p>;
    }

    render(
      <ErrorBoundary
        fallback={(reset) => (
          <div>
            <p>broken</p>
            <button onClick={reset}>retry</button>
          </div>
        )}
      >
        <Child />
      </ErrorBoundary>,
    );

    expect(screen.getByText('broken')).toBeInTheDocument();
    expect(screen.queryByText('recovered')).not.toBeInTheDocument();

    shouldThrow = false;
    await userEvent.click(screen.getByRole('button', { name: 'retry' }));

    expect(screen.getByText('recovered')).toBeInTheDocument();
    expect(screen.queryByText('broken')).not.toBeInTheDocument();
    vi.restoreAllMocks();
  });
});
