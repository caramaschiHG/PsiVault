import React from "react";
import { sanitizeRichTextHtml } from "@/lib/documents/rich-text";
import type { DocumentStatus } from "@/lib/documents/model";

interface DocumentPaperViewProps {
  typeLabel: string;
  patientName: string;
  professionalName: string;
  crp: string;
  createdAt: Date;
  editedAt: Date | null;
  status: DocumentStatus;
  content: string;
  isPrivate: boolean;
  signatureImageUrl?: string | null;
}

const longDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
});

const longDateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
});

export function DocumentPaperView({
  typeLabel,
  patientName,
  professionalName,
  crp,
  createdAt,
  editedAt,
  status,
  content,
  isPrivate,
  signatureImageUrl,
}: DocumentPaperViewProps) {
  const hasHtml = content.includes("<") && content.includes(">");

  return (
    <div style={paperStyle}>
      {/* Watermarks */}
      {status === "draft" && (
        <div style={draftWatermarkStyle}>RASCUNHO</div>
      )}
      {status === "archived" && (
        <div style={archivedWatermarkStyle}>ARQUIVADO</div>
      )}

      {/* Header */}
      <div style={headerStyle}>
        <p style={kickerStyle}>Documento clínico</p>
        <h1 style={paperTitleStyle}>{typeLabel}</h1>
        <div style={metaGridStyle}>
          <div style={metaRowStyle}>
            <span style={metaLabelStyle}>Paciente</span>
            <span style={metaValueStyle}>{patientName}</span>
          </div>
          <div style={metaRowStyle}>
            <span style={metaLabelStyle}>Profissional</span>
            <span style={metaValueStyle}>{professionalName}</span>
          </div>
          <div style={metaRowStyle}>
            <span style={metaLabelStyle}>CRP</span>
            <span style={metaValueStyle}>{crp}</span>
          </div>
          <div style={metaRowStyle}>
            <span style={metaLabelStyle}>Data de criação</span>
            <span style={metaValueStyle}>{longDateFormatter.format(createdAt)}</span>
          </div>
          {editedAt && (
            <div style={metaRowStyle}>
              <span style={metaLabelStyle}>Data de edição</span>
              <span style={metaValueStyle}>{longDateTimeFormatter.format(editedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {hasHtml ? (
          <div
            style={richTextStyle}
            dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(content) }}
          />
        ) : (
          <div style={plainTextStyle}>{content}</div>
        )}
      </div>

      {/* Signature block */}
      {status === "signed" && signatureImageUrl && !isPrivate && (
        <div style={signatureBlockStyle}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={signatureImageUrl}
            alt="Assinatura profissional"
            style={signatureImgStyle}
          />
          <div style={signatureLineStyle} />
          <p style={signatureCaptionStyle}>
            {professionalName} — {crp} — {longDateFormatter.format(createdAt)}
          </p>
        </div>
      )}
    </div>
  );
}

const paperStyle: React.CSSProperties = {
  width: "210mm",
  minHeight: "297mm",
  background: "var(--color-surface-0)",
  boxShadow: "var(--shadow-sm)",
  padding: "25mm 20mm 30mm",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "11pt",
  lineHeight: 1.65,
  color: "var(--color-text-1)",
  position: "relative",
  overflow: "hidden",
};

const watermarkBase: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%) rotate(-30deg)",
  fontSize: "72px",
  fontWeight: 700,
  fontFamily: "Helvetica, Arial, sans-serif",
  pointerEvents: "none",
  userSelect: "none",
  whiteSpace: "nowrap",
  letterSpacing: "0.05em",
};

const draftWatermarkStyle: React.CSSProperties = {
  ...watermarkBase,
  color: "var(--color-border-med)",
};

const archivedWatermarkStyle: React.CSSProperties = {
  ...watermarkBase,
  color: "var(--color-border)",
};

const headerStyle: React.CSSProperties = {
  marginBottom: "24px",
  paddingBottom: "16px",
  borderBottom: "1px solid var(--color-border)",
};

const kickerStyle: React.CSSProperties = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "1.2px",
  fontSize: "9px",
  color: "var(--color-brown-mid)",
  fontFamily: "Helvetica, Arial, sans-serif",
  marginBottom: "8px",
};

const paperTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "22px",
  fontFamily: "Helvetica, Arial, sans-serif",
  fontWeight: 700,
  marginBottom: "12px",
  color: "var(--color-text-1)",
};

const metaGridStyle: React.CSSProperties = {
  display: "grid",
  gap: "6px",
};

const metaRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  fontSize: "11px",
  alignItems: "baseline",
};

const metaLabelStyle: React.CSSProperties = {
  color: "var(--color-text-3)",
  fontSize: "10px",
  minWidth: "120px",
  fontFamily: "Helvetica, Arial, sans-serif",
};

const metaValueStyle: React.CSSProperties = {
  color: "var(--color-text-1)",
  fontSize: "11px",
  fontWeight: 500,
};

const contentStyle: React.CSSProperties = {
  marginTop: "24px",
};

const plainTextStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "inherit",
  fontSize: "inherit",
  lineHeight: 1.75,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  color: "inherit",
};

const richTextStyle: React.CSSProperties = {
  fontSize: "inherit",
  lineHeight: 1.75,
  color: "inherit",
};

const signatureBlockStyle: React.CSSProperties = {
  marginTop: "40px",
  paddingTop: "16px",
  borderTop: "1px solid var(--color-border)",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "8px",
};

const signatureImgStyle: React.CSSProperties = {
  maxHeight: "80px",
  objectFit: "contain",
};

const signatureLineStyle: React.CSSProperties = {
  width: "200px",
  height: "1px",
  background: "var(--color-border-med)",
};

const signatureCaptionStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "10px",
  color: "var(--color-text-2)",
  fontFamily: "Helvetica, Arial, sans-serif",
};
