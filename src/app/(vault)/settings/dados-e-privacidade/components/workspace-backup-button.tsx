"use client";

/**
 * WorkspaceBackupButton — triggers a full workspace backup download.
 *
 * Flow:
 * 1. Button "Fazer backup completo" → shows confirmation form
 * 2. User enters current password (v1 stub: any value passes) + types "FAZER BACKUP"
 * 3. Server action confirmBackupAuthAction sets "psivault_backup_auth" cookie
 * 4. On success: navigate to /api/backup which triggers the file download
 *
 * v1 stub: password validation always passes in the server action.
 * Production: replace with real credential verification.
 */

import { useState, useTransition } from "react";
import { confirmBackupAuthAction } from "../actions";

type Step = "idle" | "confirming" | "error";

export function WorkspaceBackupButton() {
  const [step, setStep] = useState<Step>("idle");
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    setStep("confirming");
    setPassword("");
    setConfirmText("");
    setErrorMessage("");
  }

  function handleCancel() {
    setStep("idle");
    setPassword("");
    setConfirmText("");
    setErrorMessage("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (confirmText.trim().toUpperCase() !== "FAZER BACKUP") {
      setErrorMessage('Digite "FAZER BACKUP" para continuar.');
      return;
    }

    startTransition(async () => {
      const result = await confirmBackupAuthAction({ password });

      if (!result.ok) {
        setErrorMessage(result.error ?? "Erro ao confirmar. Tente novamente.");
        setStep("error");
        return;
      }

      // Trigger download: navigate to /api/backup which sets Content-Disposition attachment
      window.location.href = "/api/backup";
      setStep("idle");
      setPassword("");
      setConfirmText("");
    });
  }

  if (step === "idle") {
    return (
      <button onClick={handleOpen} style={primaryButtonStyle}>
        Fazer backup completo
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <p style={formNoteStyle}>
        Para gerar o backup, confirme sua senha e digite <strong>FAZER BACKUP</strong> abaixo.
      </p>

      <label style={labelStyle}>
        Senha atual
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Sua senha"
          required
          style={inputStyle}
          autoComplete="current-password"
        />
      </label>

      <label style={labelStyle}>
        Confirmação
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="FAZER BACKUP"
          required
          style={inputStyle}
          spellCheck={false}
          autoComplete="off"
        />
      </label>

      {errorMessage && <p style={errorStyle}>{errorMessage}</p>}

      <div style={actionsStyle}>
        <button type="submit" disabled={isPending} style={primaryButtonStyle}>
          {isPending ? "Gerando backup…" : "Confirmar e baixar"}
        </button>
        <button type="button" onClick={handleCancel} style={secondaryButtonStyle}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const formStyle = {
  display: "grid",
  gap: "0.75rem",
  maxWidth: "400px",
} satisfies React.CSSProperties;

const formNoteStyle = {
  margin: 0,
  fontSize: "0.9rem",
  color: "var(--color-text-2)",
  lineHeight: 1.6,
} satisfies React.CSSProperties;

const labelStyle = {
  display: "grid",
  gap: "0.35rem",
  fontSize: "0.875rem",
  color: "var(--color-warm-brown)",
  fontWeight: 500,
} satisfies React.CSSProperties;

const inputStyle = {
  padding: "0.5rem 0.75rem",
  borderRadius: "8px",
  border: "1px solid var(--color-taupe)",
  fontSize: "0.9rem",
  outline: "none",
  background: "var(--color-surface-1)",
} satisfies React.CSSProperties;

const actionsStyle = {
  display: "flex",
  gap: "0.75rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const primaryButtonStyle = {
  padding: "0.55rem 1.25rem",
  borderRadius: "10px",
  border: "none",
  background: "var(--color-accent)",
  color: "#fff",
  fontWeight: 600,
  fontSize: "0.9rem",
  cursor: "pointer",
} satisfies React.CSSProperties;

const secondaryButtonStyle = {
  padding: "0.55rem 1.1rem",
  borderRadius: "10px",
  border: "1px solid var(--color-taupe)",
  background: "transparent",
  color: "var(--color-text-2)",
  fontWeight: 500,
  fontSize: "0.9rem",
  cursor: "pointer",
} satisfies React.CSSProperties;

const errorStyle = {
  margin: 0,
  fontSize: "0.85rem",
  color: "var(--color-error-text)",
} satisfies React.CSSProperties;
