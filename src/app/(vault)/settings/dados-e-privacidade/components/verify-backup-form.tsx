"use client";

/**
 * VerifyBackupForm — validates an uploaded backup file client-side.
 *
 * Uses FileReader to parse the uploaded JSON and passes it to validateBackupSchema.
 * No server round-trip required — validation is purely structural.
 */

import { useState } from "react";
import { validateBackupSchema } from "../../../../../lib/export/serializer";

type VerifyResult = "valid" | "invalid" | "parse_error" | null;

export function VerifyBackupForm() {
  const [result, setResult] = useState<VerifyResult>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target!.result as string);
        setResult(validateBackupSchema(data) ? "valid" : "invalid");
      } catch {
        setResult("parse_error");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div style={containerStyle}>
      <label style={fileInputLabelStyle}>
        <span style={fileInputTextStyle}>
          {fileName ? fileName : "Selecionar arquivo de backup (.json)"}
        </span>
        <input
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          style={hiddenInputStyle}
        />
      </label>

      {result === "valid" && (
        <p style={validResultStyle}>
          Backup valido — estrutura verificada com sucesso.
        </p>
      )}

      {result === "invalid" && (
        <p style={invalidResultStyle}>
          Arquivo invalido — estrutura do backup nao reconhecida.
        </p>
      )}

      {result === "parse_error" && (
        <p style={errorResultStyle}>
          Erro ao ler arquivo — verifique se o arquivo e um JSON valido.
        </p>
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const containerStyle = {
  display: "grid",
  gap: "0.75rem",
  maxWidth: "480px",
} satisfies React.CSSProperties;

const fileInputLabelStyle = {
  display: "flex",
  alignItems: "center",
  padding: "0.65rem 1rem",
  borderRadius: "var(--radius-sm)",
  border: "1px dashed var(--color-taupe)",
  background: "var(--color-surface-1)",
  cursor: "pointer",
  fontSize: "0.875rem",
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const fileInputTextStyle = {
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap" as const,
} satisfies React.CSSProperties;

const hiddenInputStyle = {
  position: "absolute" as const,
  width: "1px",
  height: "1px",
  opacity: 0,
  overflow: "hidden",
} satisfies React.CSSProperties;

const validResultStyle = {
  margin: 0,
  padding: "0.65rem 1rem",
  borderRadius: "var(--radius-sm)",
  background: "var(--color-success-bg)",
  border: "1px solid var(--color-success-border)",
  color: "var(--color-success-text)",
  fontSize: "0.9rem",
  fontWeight: 500,
} satisfies React.CSSProperties;

const invalidResultStyle = {
  margin: 0,
  padding: "0.65rem 1rem",
  borderRadius: "var(--radius-sm)",
  background: "var(--color-warning-bg)",
  border: "1px solid var(--color-border-med)",
  color: "var(--color-warning-text)",
  fontSize: "0.9rem",
  fontWeight: 500,
} satisfies React.CSSProperties;

const errorResultStyle = {
  margin: 0,
  padding: "0.65rem 1rem",
  borderRadius: "var(--radius-sm)",
  background: "var(--color-error-bg)",
  border: "1px solid var(--color-error-border)",
  color: "var(--color-error-text)",
  fontSize: "0.9rem",
  fontWeight: 500,
} satisfies React.CSSProperties;
