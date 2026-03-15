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
  borderRadius: "10px",
  border: "1px dashed #d4c5b5",
  background: "rgba(255, 252, 247, 0.7)",
  cursor: "pointer",
  fontSize: "0.875rem",
  color: "#57534e",
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
  borderRadius: "10px",
  background: "rgba(220, 252, 231, 0.8)",
  border: "1px solid rgba(22, 163, 74, 0.25)",
  color: "#15803d",
  fontSize: "0.9rem",
  fontWeight: 500,
} satisfies React.CSSProperties;

const invalidResultStyle = {
  margin: 0,
  padding: "0.65rem 1rem",
  borderRadius: "10px",
  background: "rgba(255, 251, 235, 0.9)",
  border: "1px solid rgba(180, 83, 9, 0.25)",
  color: "#92400e",
  fontSize: "0.9rem",
  fontWeight: 500,
} satisfies React.CSSProperties;

const errorResultStyle = {
  margin: 0,
  padding: "0.65rem 1rem",
  borderRadius: "10px",
  background: "rgba(254, 242, 242, 0.9)",
  border: "1px solid rgba(185, 28, 28, 0.2)",
  color: "#b91c1c",
  fontSize: "0.9rem",
  fontWeight: 500,
} satisfies React.CSSProperties;
