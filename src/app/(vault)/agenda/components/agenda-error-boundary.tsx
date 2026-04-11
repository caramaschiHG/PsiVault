"use client";

import { Component, type ReactNode } from "react";

interface Props {
  fallback?: (error: Error, reset: () => void) => ReactNode;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class AgendaErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return (
        <div style={{ padding: "2rem", fontFamily: "monospace" }}>
          <h2 style={{ color: "#dc2626", marginBottom: "0.5rem" }}>
            Erro ao carregar a agenda
          </h2>
          <pre
            style={{
              fontSize: "0.75rem",
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: "0.5rem",
              overflow: "auto",
              maxHeight: "400px",
            }}
          >
            {this.state.error.message}
          </pre>
          <button
            onClick={this.reset}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              background: "var(--color-accent)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
