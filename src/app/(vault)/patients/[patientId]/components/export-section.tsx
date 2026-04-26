"use client";

/**
 * ExportSection — per-patient data export trigger on the patient profile.
 *
 * Flow:
 * 1. "Exportar dados do paciente" button → shows confirmation form
 * 2. User enters password + types "EXPORTAR"
 * 3. exportPatientAuthAction sets "psivault_export_auth" cookie
 * 4. On success: navigates to /api/export/patient/[patientId] which downloads JSON
 *
 * v1 stub: password validation always passes in the server action.
 */

import { useState, useTransition } from "react";
import { exportPatientAuthAction } from "../../../settings/dados-e-privacidade/actions";

interface ExportSectionProps {
  patientId: string;
  patientName: string;
}

type Step = "idle" | "confirming" | "error";

export function ExportSection({ patientId, patientName }: ExportSectionProps) {
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

    if (confirmText.trim().toUpperCase() !== "EXPORTAR") {
      setErrorMessage('Digite "EXPORTAR" para continuar.');
      return;
    }

    startTransition(async () => {
      const result = await exportPatientAuthAction({ password });

      if (!result.ok) {
        setErrorMessage(result.error ?? "Erro ao confirmar. Tente novamente.");
        setStep("error");
        return;
      }

      // Trigger download: navigate to /api/export/patient/[patientId]
      window.location.href = `/api/export/patient/${patientId}`;
      setStep("idle");
      setPassword("");
      setConfirmText("");
    });
  }

  return (
    <section style={sectionStyle}>
      <p style={eyebrowStyle}>Portabilidade</p>
      <h2 style={titleStyle}>Exportar dados do paciente</h2>
      <p style={descStyle}>
        Gera um arquivo JSON com todos os dados de <strong>{patientName}</strong>: perfil,
        consultas, prontuários, documentos e cobranças. Requer confirmação de senha.
      </p>

      {step === "idle" || step === "error" ? (
        <button onClick={handleOpen} style={buttonStyle}>
          Exportar dados do paciente
        </button>
      ) : null}

      {step === "confirming" && (
        <form onSubmit={handleSubmit} style={formStyle}>
          <p style={formNoteStyle}>
            Para exportar, confirme sua senha e digite <strong>EXPORTAR</strong> abaixo.
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
              placeholder="EXPORTAR"
              required
              style={inputStyle}
              spellCheck={false}
              autoComplete="off"
            />
          </label>

          {errorMessage && <p style={errorStyle} role="alert">{errorMessage}</p>}

          <div style={actionsStyle}>
            <button type="submit" disabled={isPending} style={primaryButtonStyle}>
              {isPending ? "Confirmando…" : "Confirmar e exportar"}
            </button>
            <button type="button" onClick={handleCancel} style={secondaryButtonStyle}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const sectionStyle = {
  padding: "1.35rem 1.5rem",
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  display: "grid",
  gap: "0.6rem",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.14em",
  fontSize: "0.72rem",
  color: "var(--color-brown-mid)",
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "1.15rem",
  fontWeight: 600,
} satisfies React.CSSProperties;

const descStyle = {
  margin: 0,
  fontSize: "0.875rem",
  color: "var(--color-text-2)",
  lineHeight: 1.65,
} satisfies React.CSSProperties;

const buttonStyle = {
  justifySelf: "start",
  padding: "0.5rem 1.1rem",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--color-border-med)",
  background: "transparent",
  color: "var(--color-accent)",
  fontWeight: 600,
  fontSize: "0.875rem",
  cursor: "pointer",
} satisfies React.CSSProperties;

const formStyle = {
  display: "grid",
  gap: "0.7rem",
  maxWidth: "380px",
} satisfies React.CSSProperties;

const formNoteStyle = {
  margin: 0,
  fontSize: "0.875rem",
  color: "var(--color-text-2)",
  lineHeight: 1.6,
} satisfies React.CSSProperties;

const labelStyle = {
  display: "grid",
  gap: "0.3rem",
  fontSize: "0.875rem",
  color: "var(--color-warm-brown)",
  fontWeight: 500,
} satisfies React.CSSProperties;

const inputStyle = {
  padding: "0.5rem 0.75rem",
  borderRadius: "var(--radius-sm)",
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
  padding: "0.5rem 1.1rem",
  borderRadius: "var(--radius-sm)",
  border: "none",
  background: "var(--color-accent)",
  color: "#fff7ed",
  fontWeight: 600,
  fontSize: "0.875rem",
  cursor: "pointer",
} satisfies React.CSSProperties;

const secondaryButtonStyle = {
  padding: "0.5rem 1rem",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--color-taupe)",
  background: "transparent",
  color: "var(--color-text-2)",
  fontWeight: 500,
  fontSize: "0.875rem",
  cursor: "pointer",
} satisfies React.CSSProperties;

const errorStyle = {
  margin: 0,
  fontSize: "0.83rem",
  color: "var(--color-error-text)",
} satisfies React.CSSProperties;
