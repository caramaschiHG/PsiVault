/**
 * Document view page — read-only provenance view.
 *
 * Shows the full document content with a provenance header.
 * Provides download link, edit button, and archive action.
 * Only shown when document belongs to the given patient (cross-patient guard).
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatientRepository } from "../../../../../../lib/patients/store";
import { getDocumentRepository } from "../../../../../../lib/documents/store";
import { archiveDocumentAction } from "./actions";
import type { DocumentType } from "../../../../../../lib/documents/model";

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  declaration_of_attendance: "Declaração de Comparecimento",
  receipt: "Recibo de Pagamento",
  anamnesis: "Anamnese",
  psychological_report: "Laudo Psicológico",
  consent_and_service_contract: "Contrato de Prestação de Serviços",
};

const longDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
});

const longDateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
});

const WORKSPACE_ID = "ws_1";

interface DocumentViewPageProps {
  params: Promise<{ patientId: string; documentId: string }>;
}

export default async function DocumentViewPage({ params }: DocumentViewPageProps) {
  const { patientId, documentId } = await params;

  const patientRepo = getPatientRepository();
  const docRepo = getDocumentRepository();

  const patient = patientRepo.findById(patientId, WORKSPACE_ID);
  if (!patient) notFound();

  const doc = docRepo.findById(documentId, WORKSPACE_ID);
  if (!doc) notFound();

  // Cross-patient guard (SECU-05)
  if (doc.patientId !== patient.id) notFound();

  const typeLabel = DOCUMENT_TYPE_LABELS[doc.type];
  const dataUri = `data:text/plain;charset=utf-8,${encodeURIComponent(doc.content)}`;
  const isActive = doc.archivedAt === null;

  return (
    <main style={shellStyle}>
      {/* Breadcrumb */}
      <nav style={navStyle}>
        <Link href="/patients" style={navLinkStyle}>
          Pacientes
        </Link>
        <span style={navSepStyle}>/</span>
        <Link href={`/patients/${patientId}`} style={navLinkStyle}>
          {patient.fullName}
        </Link>
        <span style={navSepStyle}>/</span>
        <span style={navCurrentStyle}>{typeLabel}</span>
      </nav>

      {/* Provenance header */}
      <section style={provenanceStyle}>
        <p style={eyebrowStyle}>Documento clínico</p>
        <h1 style={titleStyle}>{typeLabel}</h1>
        <div style={metaGridStyle}>
          <div style={metaRowStyle}>
            <span style={metaLabelStyle}>Paciente</span>
            <span style={metaValueStyle}>{patient.fullName}</span>
          </div>
          <div style={metaRowStyle}>
            <span style={metaLabelStyle}>Gerado por</span>
            <span style={metaValueStyle}>{doc.createdByName}</span>
          </div>
          <div style={metaRowStyle}>
            <span style={metaLabelStyle}>Criado em</span>
            <span style={metaValueStyle}>{longDateFormatter.format(doc.createdAt)}</span>
          </div>
          {doc.editedAt && (
            <div style={metaRowStyle}>
              <span style={metaLabelStyle}>Editado em</span>
              <span style={metaValueStyle}>{longDateTimeFormatter.format(doc.editedAt)}</span>
            </div>
          )}
          {doc.archivedAt && (
            <div style={metaRowStyle}>
              <span style={metaLabelStyle}>Arquivado em</span>
              <span style={{ ...metaValueStyle, color: "#9f1239" }}>
                {longDateFormatter.format(doc.archivedAt)}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Document content */}
      <section style={contentSectionStyle}>
        <pre style={contentPreStyle}>{doc.content}</pre>
      </section>

      {/* Actions */}
      <section style={actionsStyle}>
        <a href={dataUri} download={`${typeLabel}-${doc.id}.txt`} style={downloadLinkStyle}>
          Baixar documento
        </a>

        {isActive && (
          <Link href={`/patients/${patientId}/documents/${doc.id}/edit`} style={editLinkStyle}>
            Editar documento
          </Link>
        )}

        {isActive && (
          <form action={archiveDocumentAction} style={archiveFormStyle}>
            <input type="hidden" name="documentId" value={doc.id} />
            <input type="hidden" name="patientId" value={patientId} />
            <button type="submit" style={archiveButtonStyle}>
              Arquivar documento
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

// --- Style objects ---

const shellStyle = {
  minHeight: "100vh",
  padding: "2rem",
  display: "grid",
  gap: "1.25rem",
  alignContent: "start",
  maxWidth: "800px",
} satisfies React.CSSProperties;

const navStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.9rem",
  color: "#78716c",
} satisfies React.CSSProperties;

const navLinkStyle = {
  color: "#9a3412",
  textDecoration: "none",
  fontWeight: 500,
} satisfies React.CSSProperties;

const navSepStyle = {
  color: "#d4c5b5",
} satisfies React.CSSProperties;

const navCurrentStyle = {
  color: "#57534e",
  fontWeight: 500,
} satisfies React.CSSProperties;

const provenanceStyle = {
  padding: "1.35rem 1.5rem",
  borderRadius: "22px",
  background: "rgba(255, 247, 237, 0.9)",
  border: "1px solid rgba(146, 64, 14, 0.16)",
  display: "grid",
  gap: "0.75rem",
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
  fontSize: "1.5rem",
  color: "#292524",
} satisfies React.CSSProperties;

const metaGridStyle = {
  display: "grid",
  gap: "0.35rem",
} satisfies React.CSSProperties;

const metaRowStyle = {
  display: "flex",
  gap: "0.5rem",
  fontSize: "0.88rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const metaLabelStyle = {
  color: "#78716c",
  minWidth: "7rem",
} satisfies React.CSSProperties;

const metaValueStyle = {
  color: "#292524",
  fontWeight: 500,
} satisfies React.CSSProperties;

const contentSectionStyle = {
  padding: "1.5rem",
  borderRadius: "22px",
  background: "rgba(255, 252, 247, 0.95)",
  border: "1px solid rgba(146, 64, 14, 0.12)",
} satisfies React.CSSProperties;

const contentPreStyle = {
  margin: 0,
  fontFamily: "inherit",
  fontSize: "0.95rem",
  lineHeight: 1.75,
  color: "#292524",
  whiteSpace: "pre-wrap" as const,
  wordBreak: "break-word" as const,
} satisfies React.CSSProperties;

const actionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const downloadLinkStyle = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#9a3412",
  textDecoration: "none",
  padding: "0.45rem 1rem",
  borderRadius: "999px",
  border: "1px solid rgba(146, 64, 14, 0.3)",
  background: "rgba(255, 247, 237, 0.6)",
} satisfies React.CSSProperties;

const editLinkStyle = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#1e40af",
  textDecoration: "none",
  padding: "0.45rem 1rem",
  borderRadius: "999px",
  border: "1px solid rgba(30, 64, 175, 0.25)",
  background: "rgba(239, 246, 255, 0.7)",
} satisfies React.CSSProperties;

const archiveFormStyle = {
  display: "inline",
} satisfies React.CSSProperties;

const archiveButtonStyle = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#78716c",
  cursor: "pointer",
  padding: "0.45rem 1rem",
  borderRadius: "999px",
  border: "1px solid rgba(120, 113, 108, 0.3)",
  background: "rgba(248, 246, 243, 0.8)",
} satisfies React.CSSProperties;
