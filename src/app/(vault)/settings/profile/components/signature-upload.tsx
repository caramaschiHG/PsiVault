"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { SignatureCropModal } from "./signature-crop-modal";

interface SignatureUploadProps {
  saveAction: (
    prevState: { error?: string } | null,
    formData: FormData,
  ) => Promise<{ error?: string }>;
  removeAction: () => Promise<void>;
  currentFileName: string | null;
  currentImageUrl?: string | null;
  professionalName: string;
  crp: string;
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
const MAX_SIZE = 2 * 1024 * 1024;

function SignatureSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <div style={{ display: "grid", gap: "0.4rem" }}>
      <button type="submit" disabled={pending} style={{ ...confirmBtnStyle, ...(pending ? { opacity: 0.7, cursor: "not-allowed" } : {}) }}>
        {pending ? "Salvando..." : "Confirmar assinatura"}
      </button>
      {pending && (
        <div style={progressTrackStyle}>
          <div style={progressBarStyle} />
        </div>
      )}
    </div>
  );
}

export function SignatureUpload({
  saveAction,
  removeAction,
  currentFileName,
  currentImageUrl,
  professionalName,
  crp,
}: SignatureUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [state, formAction] = useActionState(saveAction, null);

  useEffect(() => {
    if (state && !state.error) {
      setSaved(true);
      setIsReplacing(false);
      if (previewUrl) {
         URL.revokeObjectURL(previewUrl);
         setPreviewUrl(null);
      }
      if (inputRef.current) inputRef.current.value = "";
      const t = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  
  const inputRef = useRef<HTMLInputElement>(null);

  function assignToInput(file: File) {
    try {
      const dt = new DataTransfer();
      dt.items.add(file);
      if (inputRef.current) inputRef.current.files = dt.files;
    } catch {
      // DataTransfer not available (old browser) — fall through
    }
  }

  function handleFile(file: File) {
    setClientError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setClientError("Formato não suportado. Use PNG, JPG ou SVG.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setClientError("Arquivo muito grande. Máximo: 2MB.");
      return;
    }

    // SVG: sem processamento de canvas — vai direto ao preview
    if (file.type === "image/svg+xml") {
      assignToInput(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      return;
    }

    // PNG/JPG: abrir modal de crop + digitalização
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    setCropImageUrl(URL.createObjectURL(file));
  }

  function handleCropConfirm(processedFile: File) {
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    setCropImageUrl(null);
    assignToInput(processedFile);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(processedFile));
  }

  function handleCropCancel() {
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    setCropImageUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleClear() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setClientError(null);
    if (inputRef.current) inputRef.current.value = "";
    
    if (currentImageUrl) {
      setIsReplacing(false);
    }
  }

  const error = clientError ?? state?.error;
  const displayUrl = previewUrl || (isReplacing ? null : currentImageUrl);

  return (
    <div style={wrapperStyle}>
      {cropImageUrl && (
        <SignatureCropModal
          imageUrl={cropImageUrl}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      {/* Main upload form — file input is always inside */}
      <form action={formAction} style={formStyle}>
        <input
          ref={inputRef}
          type="file"
          name="file"
          accept=".png,.jpg,.jpeg,.svg"
          style={{ display: "none" }}
          onChange={handleInputChange}
        />

        {displayUrl ? (
          /* Preview state */
          <div style={previewSectionStyle}>
            <div style={previewCardStyle}>
              <span style={previewEyebrowStyle}>
                {previewUrl ? "Assinatura digitalizada" : "Assinatura salva"}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={displayUrl} alt="Pré-visualização da assinatura" style={previewImgStyle} />
              <div style={previewMetaStyle}>
                <span style={previewNameStyle}>{professionalName || "Nome profissional"}</span>
                <span style={previewCrpStyle}>{crp || "CRP 00/000000"}</span>
              </div>
            </div>

            {error && <p style={errorStyle}>{error}</p>}

            <div style={previewActionsStyle}>
              {previewUrl && <SignatureSubmitButton />}
              {saved && <span style={savedLabelStyle}>✓ Assinatura salva</span>}
              <button type="button" style={changeBtnStyle} onClick={() => {
                if (previewUrl) {
                  handleClear();
                } else {
                  setIsReplacing(true);
                }
              }}>
                {previewUrl && currentImageUrl ? "Cancelar troca" : "Trocar imagem"}
              </button>
            </div>
          </div>
        ) : (
          /* Drop zone state */
          <>
            <div
              style={{ ...dropZoneStyle, ...(isDragging ? dropZoneActiveStyle : {}) }}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(146, 64, 14, 0.45)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <p style={dropLabelStyle}>
                {currentFileName
                  ? `Atual: ${currentFileName} — arraste ou clique para substituir`
                  : "Arraste seu arquivo de assinatura ou clique para selecionar"}
              </p>
              <p style={dropHintStyle}>PNG, JPG ou SVG • máx. 2 MB</p>
            </div>

            {isReplacing && currentImageUrl && (
               <button type="button" style={changeBtnStyle} onClick={() => setIsReplacing(false)}>
                 Cancelar troca
               </button>
            )}

            {error && <p style={errorStyle}>{error}</p>}
          </>
        )}
      </form>

      {/* Remove action — separate form */}
      {currentFileName && (
        <form action={removeAction}>
          <button type="submit" style={removeBtnStyle}>
            Remover assinatura salva
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const wrapperStyle = {
  display: "grid",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const formStyle = {
  display: "grid",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const dropZoneStyle = {
  display: "grid",
  gap: "0.4rem",
  justifyItems: "center",
  padding: "1.75rem 1.25rem",
  borderRadius: "12px",
  border: "2px dashed rgba(146, 64, 14, 0.25)",
  background: "rgba(255, 247, 237, 0.5)",
  cursor: "pointer",
  textAlign: "center" as const,
  transition: "border-color 0.15s, background 0.15s",
} satisfies React.CSSProperties;

const dropZoneActiveStyle = {
  borderColor: "rgba(146, 64, 14, 0.6)",
  background: "rgba(255, 237, 213, 0.5)",
} satisfies React.CSSProperties;

const previewEyebrowStyle = {
  fontSize: "0.8rem",
  fontWeight: 600,
  letterSpacing: "0.13em",
  textTransform: "uppercase" as const,
  color: "var(--color-accent)", // #9a3412 — contraste ≥ 4.5:1 sobre #fffcf7
} satisfies React.CSSProperties;

const dropLabelStyle = {
  margin: 0,
  fontSize: "0.85rem",
  fontWeight: 500,
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const dropHintStyle = {
  margin: 0,
  fontSize: "0.75rem",
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;

const previewSectionStyle = {
  display: "grid",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const previewCardStyle = {
  display: "grid",
  gap: "0.5rem",
  padding: "1.1rem 1.25rem",
  borderRadius: "10px",
  background: "#fffcf7",
  border: "1px solid rgba(146, 64, 14, 0.15)",
  boxShadow: "var(--shadow-md)",
} satisfies React.CSSProperties;

const previewImgStyle = {
  maxHeight: "80px",
  objectFit: "contain" as const,
  justifySelf: "start",
} satisfies React.CSSProperties;

const previewMetaStyle = {
  display: "grid",
  gap: "0.1rem",
} satisfies React.CSSProperties;

const previewNameStyle = {
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const previewCrpStyle = {
  fontSize: "0.75rem",
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;

const previewActionsStyle = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const confirmBtnStyle = {
  padding: "0.6rem 1.1rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-accent)",
  color: "#fff7ed",
  border: "none",
  fontWeight: 700,
  fontSize: "0.875rem",
  cursor: "pointer",
} satisfies React.CSSProperties;

const changeBtnStyle = {
  padding: "0.6rem 1.1rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-0)",
  color: "var(--color-text-2)",
  border: "1px solid var(--color-border-med)",
  fontWeight: 500,
  fontSize: "0.875rem",
  cursor: "pointer",
} satisfies React.CSSProperties;

const removeBtnStyle = {
  padding: "0.45rem 0.85rem",
  borderRadius: "var(--radius-md)",
  background: "transparent",
  color: "var(--color-text-3)",
  border: "1px solid var(--color-border)",
  fontSize: "0.8rem",
  cursor: "pointer",
} satisfies React.CSSProperties;

const errorStyle = {
  margin: 0,
  fontSize: "0.82rem",
  color: "#9f1239",
  fontWeight: 500,
} satisfies React.CSSProperties;

const progressTrackStyle = {
  height: "3px",
  borderRadius: "2px",
  background: "rgba(154, 52, 18, 0.15)",
  overflow: "hidden",
} satisfies React.CSSProperties;

const progressBarStyle = {
  height: "100%",
  width: "40%",
  background: "var(--color-accent)",
  borderRadius: "2px",
  animation: "progress-slide 1.2s ease-in-out infinite",
} satisfies React.CSSProperties;

const savedLabelStyle = {
  fontSize: "0.85rem",
  color: "#2d6a4f",
  fontWeight: 600,
  alignSelf: "center",
} satisfies React.CSSProperties;
