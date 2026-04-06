import * as Sentry from '@sentry/react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  fallback: ReactNode | ((reset: () => void) => ReactNode);
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
    Sentry.captureException(error, {
      contexts: { react: { componentStack: info.componentStack ?? '' } },
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      return typeof fallback === 'function' ? fallback(this.handleReset) : fallback;
    }
    return this.props.children;
  }
}
