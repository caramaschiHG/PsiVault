/**
 * DocumentsSection — active documents list for a single patient.
 *
 * Pure presentational server component: all data comes from props.
 * Security policy (SECU-05): NEVER renders doc.content — only type label and date.
 */

import Link from "next/link";
import type { PracticeDocument, DocumentType } from "../../../../../lib/documents/model";
import {
  buildDocumentDeliveryWhatsAppUrl,
  buildDocumentDeliveryMailtoUrl,
} from "../../../../../lib/communication/templates";
import { EmptyState } from "../../../components/empty-state";

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  declaration_of_attendance: "Declaração de Comparecimento",
  receipt: "Recibo de Pagamento",
  anamnesis: "Anamnese",
  psychological_report: "Laudo Psicológico",
  consent_and_service_contract: "Contrato de Prestação de Serviços",
};

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
});

interface DocumentsSectionProps {
  documents: PracticeDocument[]; // already filtered to active (non-archived)
  patientId: string;
  patientName: string;
  patientPhone: string | null;
}

export function DocumentsSection({ documents, patientId, patientName, patientPhone }: DocumentsSectionProps) {
  return (
    <section style={sectionStyle}>
      <div style={headingRowStyle}>
        <div style={headingBlockStyle}>
          <p style={eyebrowStyle}>Documentos clínicos</p>
          <h2 style={titleStyle}>Documentos</h2>
        </div>
        <Link
          href={`/patients/${patientId}/documents/new?type=declaration_of_attendance`}
          style={newDocLinkStyle}
        >
          Novo documento +
        </Link>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          }
          title="Nenhum documento gerado ainda"
          description="Crie declarações, recibos e laudos para este paciente."
          actionLabel="Novo documento"
          actionHref={`/patients/${patientId}/documents/new?type=declaration_of_attendance`}
        />
      ) : (
        <div style={listStyle}>
          {documents.map((doc) => {
            const docTypeLabel = DOCUMENT_TYPE_LABELS[doc.type];
            const waUrl = buildDocumentDeliveryWhatsAppUrl({
              patientName,
              patientPhone,
              documentType: docTypeLabel,
            });
            const mailtoUrl = buildDocumentDeliveryMailtoUrl({
              patientName,
              patientEmail: null,
              documentType: docTypeLabel,
            });

            return (
              <div key={doc.id} style={rowStyle}>
                <div style={rowInfoStyle}>
                  <span style={typeLabelStyle}>{docTypeLabel}</span>
                  <span style={dateLabelStyle}>
                    {shortDateFormatter.format(doc.createdAt)}
                  </span>
                </div>
                <div style={rowActionsStyle}>
                  <details style={enviarDetailsStyle}>
                    <summary style={enviarSummaryStyle}>Enviar</summary>
                    <div style={enviarLinksStyle}>
                      <a href={waUrl} target="_blank" rel="noreferrer" style={commLinkStyle}>
                        WhatsApp
                      </a>
                      <a href={mailtoUrl} target="_blank" rel="noreferrer" style={commLinkStyle}>
                        Email
                      </a>
                    </div>
                  </details>
                  <Link
                    href={`/patients/${patientId}/documents/${doc.id}`}
                    style={viewLinkStyle}
                  >
                    Ver →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// --- Style objects ---

const sectionStyle = {
  display: "grid",
  gap: "0.75rem",
  padding: "1.35rem 1.5rem",
  borderRadius: "22px",
  background: "rgba(255, 247, 237, 0.9)",
  border: "1px solid rgba(146, 64, 14, 0.16)",
} satisfies React.CSSProperties;

const headingRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap" as const,
  gap: "0.5rem",
} satisfies React.CSSProperties;

const headingBlockStyle = {
  display: "grid",
  gap: "0.25rem",
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
  fontSize: "1.4rem",
} satisfies React.CSSProperties;

const newDocLinkStyle = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--color-accent)",
  textDecoration: "none",
  padding: "0.35rem 0.85rem",
  borderRadius: "999px",
  border: "1px solid rgba(146, 64, 14, 0.3)",
  background: "rgba(255, 247, 237, 0.6)",
} satisfies React.CSSProperties;

const listStyle = {
  display: "grid",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const rowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.875rem 1.1rem",
  borderRadius: "14px",
  background: "rgba(255, 252, 247, 0.95)",
  border: "1px solid rgba(146, 64, 14, 0.12)",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const rowInfoStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "0.2rem",
} satisfies React.CSSProperties;

const typeLabelStyle = {
  fontWeight: 500,
  fontSize: "0.9rem",
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const dateLabelStyle = {
  fontSize: "0.8rem",
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;

const viewLinkStyle = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--color-accent)",
  textDecoration: "none",
  whiteSpace: "nowrap" as const,
} satisfies React.CSSProperties;

const rowActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.625rem",
  flexShrink: 0,
} satisfies React.CSSProperties;

const enviarDetailsStyle = {
  position: "relative" as const,
} satisfies React.CSSProperties;

const enviarSummaryStyle = {
  cursor: "pointer",
  fontSize: "0.82rem",
  fontWeight: 500,
  color: "var(--color-accent)",
  padding: "0.15rem 0.5rem",
  borderRadius: "6px",
  background: "var(--color-accent-light)",
  border: "1px solid var(--color-border-med)",
  listStyle: "none" as const,
} satisfies React.CSSProperties;

const enviarLinksStyle = {
  position: "absolute" as const,
  right: 0,
  top: "100%",
  zIndex: 10,
  display: "flex",
  gap: "0.4rem",
  padding: "0.5rem",
  borderRadius: "8px",
  background: "#fff",
  border: "1px solid rgba(146, 64, 14, 0.15)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  whiteSpace: "nowrap" as const,
} satisfies React.CSSProperties;

const commLinkStyle = {
  fontSize: "0.8rem",
  color: "var(--color-accent)",
  textDecoration: "none",
  fontWeight: 500,
  padding: "0.15rem 0.5rem",
  borderRadius: "6px",
  background: "rgba(255, 247, 237, 0.8)",
  border: "1px solid rgba(146, 64, 14, 0.2)",
} satisfies React.CSSProperties;
