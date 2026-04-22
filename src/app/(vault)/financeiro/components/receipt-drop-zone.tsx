"use client";

import { useRef, useState } from "react";

interface ReceiptDropZoneProps {
  expenseId: string;
  currentReceipt: { fileName: string; mimeType: string } | null;
  onFileAccepted: (file: File) => void;
  onRemove: () => void;
  isUploading?: boolean;
  uploadError?: string | null;
}

type DropZoneState = "idle" | "drag-over" | "uploading" | "uploaded" | "error";

export function ReceiptDropZone({
  currentReceipt,
  onFileAccepted,
  onRemove,
  isUploading = false,
  uploadError = null,
}: ReceiptDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive state but also use isDragOver separately in JSX
  const state: DropZoneState = isUploading
    ? "uploading"
    : uploadError
    ? "error"
    : currentReceipt
    ? "uploaded"
    : "idle";

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileAccepted(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileAccepted(file);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  }

  const containerStyle: React.CSSProperties = {
    minHeight: "160px",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-6)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--space-3)",
    transition: "background 120ms, border-color 120ms",
    cursor: state === "idle" ? "pointer" : "default",
    ...(isDragOver
      ? {
          border: "1.5px solid var(--color-accent)",
          background: "var(--color-accent-light)",
        }
      : state === "error"
      ? {
          border: "1px solid var(--color-error-text)",
          background: "var(--color-error-bg)",
        }
      : {
          border: "1.5px dashed var(--color-border-med)",
          background: "var(--color-surface-0)",
        }),
  };

  return (
    <div
      style={containerStyle}
      role="button"
      tabIndex={state === "idle" ? 0 : -1}
      aria-label={state === "idle" ? "Área de upload de comprovante" : undefined}
      aria-describedby="receipt-helper"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onKeyDown={state === "idle" ? handleKeyDown : undefined}
      onClick={state === "idle" ? () => fileInputRef.current?.click() : undefined}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        aria-label="Selecionar arquivo de comprovante"
        onChange={handleFileChange}
        style={hiddenInputStyle}
      />

      {state === "idle" && (
        <>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
            <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
          </svg>
          <p style={mainTextStyle}>Arraste o comprovante aqui</p>
          <p style={orTextStyle}>ou</p>
          <button
            className="btn-secondary"
            type="button"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            style={selectBtnStyle}
          >
            Selecionar arquivo
          </button>
          <p id="receipt-helper" style={helperTextStyle}>PDF, JPG ou PNG · até 10 MB</p>
        </>
      )}

      {state === "uploading" && (
        <p style={mainTextStyle}>Enviando arquivo…</p>
      )}

      {state === "uploaded" && currentReceipt && (
        <div style={previewStyle} onClick={(e) => e.stopPropagation()}>
          <div style={previewInfoStyle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
            </svg>
            <div>
              <p style={fileNameStyle}>{currentReceipt.fileName}</p>
              <p style={fileTypeStyle}>{currentReceipt.mimeType === "application/pdf" ? "PDF" : "Imagem"}</p>
            </div>
          </div>
          <div style={previewActionsStyle}>
            <button
              className="btn-ghost"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={smallBtnStyle}
            >
              Substituir comprovante
            </button>
            <button
              type="button"
              onClick={onRemove}
              style={removeIconBtnStyle}
              aria-label="Remover comprovante"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {state === "error" && (
        <div style={errorContentStyle} onClick={(e) => e.stopPropagation()}>
          <p style={errorTextStyle}>{uploadError}</p>
          <button
            className="btn-ghost"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={smallBtnStyle}
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}

const hiddenInputStyle = {
  position: "absolute",
  width: "1px",
  height: "1px",
  opacity: 0,
  pointerEvents: "none",
} satisfies React.CSSProperties;

const mainTextStyle = {
  margin: 0,
  fontSize: "var(--font-size-body)",
  fontWeight: 500,
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const orTextStyle = {
  margin: 0,
  fontSize: "var(--font-size-meta)",
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;

const helperTextStyle = {
  margin: 0,
  fontSize: "var(--font-size-xs)",
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;

const selectBtnStyle = {
  fontSize: "var(--font-size-sm)",
} satisfies React.CSSProperties;

const previewStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-3)",
} satisfies React.CSSProperties;

const previewInfoStyle = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-3)",
  flex: 1,
  minWidth: 0,
} satisfies React.CSSProperties;

const fileNameStyle = {
  margin: 0,
  fontSize: "var(--font-size-meta)",
  fontWeight: 500,
  color: "var(--color-text-1)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} satisfies React.CSSProperties;

const fileTypeStyle = {
  margin: 0,
  fontSize: "var(--font-size-xs)",
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;

const previewActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-2)",
  flexShrink: 0,
} satisfies React.CSSProperties;

const smallBtnStyle = {
  fontSize: "var(--font-size-sm)",
  padding: "4px 10px",
  height: "auto",
} satisfies React.CSSProperties;

const removeIconBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--color-text-3)",
  padding: "var(--space-1)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "var(--radius-xs)",
} satisfies React.CSSProperties;

const errorContentStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "var(--space-3)",
} satisfies React.CSSProperties;

const errorTextStyle = {
  margin: 0,
  fontSize: "var(--font-size-meta)",
  color: "var(--color-error-text)",
  textAlign: "center",
} satisfies React.CSSProperties;
