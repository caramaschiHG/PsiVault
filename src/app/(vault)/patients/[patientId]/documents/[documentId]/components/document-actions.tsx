"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { archiveDocumentAction, signDocumentAction } from "../actions";
import type { DocumentStatus } from "@/lib/documents/model";
import { canSignDocument } from "@/lib/documents/model";
import { canExportDocumentAsPdf } from "@/lib/documents/presenter";

const DocumentPdfPreviewModal = dynamic(
  () =>
    import("@/components/document-pdf-preview-modal").then(
      (m) => m.DocumentPdfPreviewModal,
    ),
  { ssr: false },
);

interface DocumentActionsProps {
  patientId: string;
  documentId: string;
  status: DocumentStatus;
  isPrivate: boolean;
  hasSignature: boolean;
  typeLabel: string;
  dataUri: string;
  isActive: boolean;
}

export function DocumentActions({
  patientId,
  documentId,
  status,
  isPrivate,
  hasSignature,
  typeLabel,
  dataUri,
  isActive,
}: DocumentActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pdfUrl = `/api/patients/${patientId}/documents/${documentId}/pdf`;
  const canPdf = canExportDocumentAsPdf(status as any); // any document type can now export

  return (
    <>
      <section style={actionsStyle}>
        {!isPrivate && (
          <a
            href={dataUri}
            download={`${typeLabel}-${documentId}.txt`}
            style={downloadLinkStyle}
          >
            Baixar documento
          </a>
        )}

        {!isPrivate && canPdf && (
          <>
            <button onClick={() => setIsModalOpen(true)} style={downloadLinkStyle}>
              Visualizar PDF
            </button>
            <a href={pdfUrl} style={downloadLinkStyle}>
              Baixar PDF
            </a>
          </>
        )}

        {isActive && (
          <Link
            href={`/patients/${patientId}/documents/${documentId}/edit`}
            style={editLinkStyle}
          >
            Editar documento
          </Link>
        )}

        {isActive && canSignDocument({ status } as any) && (
          <form action={signDocumentAction} style={inlineFormStyle}>
            <input type="hidden" name="documentId" value={documentId} />
            <input type="hidden" name="patientId" value={patientId} />
            <button
              type="submit"
              disabled={!hasSignature}
              title={
                hasSignature
                  ? "Assinar documento"
                  : "Configure sua assinatura em Perfil para finalizar este documento."
              }
              style={{
                ...signButtonStyle,
                ...(hasSignature
                  ? {}
                  : { opacity: 0.5, cursor: "not-allowed" }),
              }}
            >
              Assinar
            </button>
          </form>
        )}

        {isActive && (
          <form action={archiveDocumentAction} style={inlineFormStyle}>
            <input type="hidden" name="documentId" value={documentId} />
            <input type="hidden" name="patientId" value={patientId} />
            <button type="submit" style={archiveButtonStyle}>
              Arquivar documento
            </button>
          </form>
        )}
      </section>

      {isModalOpen && (
        <DocumentPdfPreviewModal
          pdfUrl={pdfUrl}
          filename={`${typeLabel}.pdf`}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

const actionsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  flexWrap: "wrap",
};

const downloadLinkStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--color-accent)",
  textDecoration: "none",
  padding: "0.45rem 1rem",
  borderRadius: "var(--radius-pill)",
  border: "1px solid var(--color-border-med)",
  background: "var(--color-surface-1)",
  cursor: "pointer",
  fontFamily: "inherit",
};

const editLinkStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--color-accent)",
  textDecoration: "none",
  padding: "0.45rem 1rem",
  borderRadius: "var(--radius-pill)",
  border: "1px solid var(--color-border-med)",
  background: "var(--color-accent-light)",
};

const signButtonStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#fff",
  padding: "0.45rem 1rem",
  borderRadius: "var(--radius-pill)",
  border: "none",
  background: "var(--color-accent)",
  cursor: "pointer",
  fontFamily: "inherit",
};

const archiveButtonStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--color-text-3)",
  cursor: "pointer",
  padding: "0.45rem 1rem",
  borderRadius: "var(--radius-pill)",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-1)",
  fontFamily: "inherit",
};

const inlineFormStyle: React.CSSProperties = {
  display: "inline",
};
