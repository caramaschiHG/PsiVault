"use client";

import { Component, Suspense, type ReactNode } from "react";

interface AsyncBoundaryProps {
  fallback: ReactNode;
  errorFallback?: (error: Error, reset: () => void) => ReactNode;
  children: ReactNode;
}

interface AsyncBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends Component<AsyncBoundaryProps, AsyncBoundaryState> {
  state: AsyncBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AsyncBoundaryState {
    return { error };
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      if (this.props.errorFallback) {
        return this.props.errorFallback(this.state.error, this.reset);
      }
      return (
        <div
          style={{
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            background: "var(--color-surface-1)",
            border: "1px solid var(--color-border)",
            display: "grid",
            gap: "0.75rem",
            alignContent: "start",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500, color: "var(--color-error-text)" }}>
            Erro ao carregar esta seção
          </p>
          <button
            type="button"
            className="btn-secondary"
            onClick={this.reset}
            style={{ justifySelf: "start" }}
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function AsyncBoundary({ fallback, errorFallback, children }: AsyncBoundaryProps) {
  return (
    <ErrorBoundary fallback={fallback} errorFallback={errorFallback}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
