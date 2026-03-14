/**
 * DocumentsSection — active documents list for a single patient.
 *
 * Pure presentational server component: all data comes from props.
 * Security policy (SECU-05): NEVER renders doc.content — only type label and date.
 */

import Link from "next/link";
import type { PracticeDocument, DocumentType } from "../../../../../lib/documents/model";

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
}

export function DocumentsSection({ documents, patientId }: DocumentsSectionProps) {
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
        <p style={emptyStateStyle}>Nenhum documento registrado.</p>
      ) : (
        <div style={listStyle}>
          {documents.map((doc) => (
            <div key={doc.id} style={rowStyle}>
              <div style={rowInfoStyle}>
                <span style={typeLabelStyle}>
                  {DOCUMENT_TYPE_LABELS[doc.type]}
                </span>
                <span style={dateLabelStyle}>
                  {shortDateFormatter.format(doc.createdAt)}
                </span>
              </div>
              <Link
                href={`/patients/${patientId}/documents/${doc.id}`}
                style={viewLinkStyle}
              >
                Ver →
              </Link>
            </div>
          ))}
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
  color: "#b45309",
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "1.4rem",
} satisfies React.CSSProperties;

const newDocLinkStyle = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#9a3412",
  textDecoration: "none",
  padding: "0.35rem 0.85rem",
  borderRadius: "999px",
  border: "1px solid rgba(146, 64, 14, 0.3)",
  background: "rgba(255, 247, 237, 0.6)",
} satisfies React.CSSProperties;

const emptyStateStyle = {
  margin: 0,
  color: "#78716c",
  fontSize: "0.95rem",
  padding: "0.5rem 0",
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
  color: "#292524",
} satisfies React.CSSProperties;

const dateLabelStyle = {
  fontSize: "0.8rem",
  color: "#78716c",
} satisfies React.CSSProperties;

const viewLinkStyle = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#9a3412",
  textDecoration: "none",
  whiteSpace: "nowrap" as const,
} satisfies React.CSSProperties;
