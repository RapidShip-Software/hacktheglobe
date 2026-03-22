"use client";

import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  autoRetry?: boolean;
  maxRetries?: number;
};

type State = {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
};

class ErrorBoundary extends Component<Props, State> {
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch() {
    const maxRetries = this.props.maxRetries ?? 3;
    if (this.props.autoRetry !== false && this.state.retryCount < maxRetries) {
      this.retryTimer = setTimeout(() => {
        this.setState((prev) => ({
          hasError: false,
          error: null,
          retryCount: prev.retryCount + 1,
        }));
      }, 500);
    }
  }

  componentWillUnmount() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
  }

  render() {
    const maxRetries = this.props.maxRetries ?? 3;
    if (this.state.hasError) {
      // If auto-retrying, render nothing (silent retry)
      if (this.props.autoRetry !== false && this.state.retryCount < maxRetries) {
        return this.props.fallback ?? null;
      }

      return (
        <div className="flex items-center justify-center min-h-[200px] p-8">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
              <span className="text-xl">!</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h3>
            <p className="text-sm text-gray-500 mb-4">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null, retryCount: 0 })}
              className="px-4 py-2 rounded-xl bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
