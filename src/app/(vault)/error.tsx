"use client";

import { useEffect } from "react";

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
  maxWidth: "420px",
} satisfies React.CSSProperties;

export default function VaultError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[vault-error-boundary]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <main style={shellStyle}>
      <div style={containerStyle}>
        <p style={{ fontSize: "var(--font-size-body)", fontWeight: 600, color: "var(--color-text-1)", margin: 0 }}>
          Algo deu errado nesta área protegida.
        </p>
        <p style={{ fontSize: "var(--font-size-meta)", color: "var(--color-text-2)", margin: 0 }}>
          Não foi possível concluir a operação ou carregar a tela. Tente novamente.
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
