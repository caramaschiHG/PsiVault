"use client";
import React from "react";

const shellStyle = {
  padding: "2rem 2.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "60vh",
} satisfies React.CSSProperties;

const containerStyle = {
  textAlign: "center" as const,
  display: "grid",
  gap: "1rem",
  maxWidth: "360px",
} satisfies React.CSSProperties;

export default function AgendaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={shellStyle}>
      <div style={containerStyle}>
        <p style={{ fontSize: "var(--font-size-body)", fontWeight: 600, color: "var(--color-text-1)" }}>
          Algo deu errado
        </p>
        <p style={{ fontSize: "var(--font-size-meta)", color: "var(--color-text-2)" }}>
          Não foi possível carregar esta página. Tente novamente ou volte mais tarde.
        </p>
        {error.digest ? (
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)", margin: 0 }}>
            Cód. de rastreio: {error.digest}
          </p>
        ) : null}
        <button onClick={reset} className="btn-secondary">
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
