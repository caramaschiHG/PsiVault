/**
 * Document edit page — /patients/[patientId]/documents/[documentId]/edit
 *
 * Server component. Guards: patient exists, document exists and is not archived.
 * Pre-fills textarea with current doc.content (locked mutability decision from CONTEXT.md).
 * Submits via updateDocumentAction which fires document.updated audit event.
 */

import { notFound } from "next/navigation";
import { getPatientRepository } from "../../../../../../../lib/patients/store";
import { getDocumentRepository } from "../../../../../../../lib/documents/store";
import { updateDocumentAction } from "./actions";
import type { DocumentType } from "../../../../../../../lib/documents/model";
import { DOCUMENT_TYPE_LABELS } from "../../../../../../../lib/documents/presenter";
import Link from "next/link";
import { resolveSession } from "../../../../../../../lib/supabase/session";

interface DocumentEditPageProps {
  params: Promise<{ patientId: string; documentId: string }>;
}

export default async function DocumentEditPage({ params }: DocumentEditPageProps) {
  const { workspaceId } = await resolveSession();
  const { patientId, documentId } = await params;

  const patientRepo = getPatientRepository();
  const docRepo = getDocumentRepository();

  const patient = await patientRepo.findById(patientId, workspaceId);
  if (!patient) notFound();

  const doc = await docRepo.findById(documentId, workspaceId);
  if (!doc || doc.archivedAt !== null) notFound();

  // Cross-patient guard
  if (doc.patientId !== patient.id) notFound();

  const typeLabel = DOCUMENT_TYPE_LABELS[doc.type];

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
        <Link href={`/patients/${patientId}/documents/${documentId}`} style={navLinkStyle}>
          {typeLabel}
        </Link>
        <span style={navSepStyle}>/</span>
        <span style={navCurrentStyle}>Editar</span>
      </nav>

      {/* Page heading */}
      <header style={headerStyle}>
        <p style={eyebrowStyle}>Edição de documento</p>
        <h1 style={titleStyle}>Editar — {typeLabel}</h1>
      </header>

      {/* Edit form */}
      <form action={updateDocumentAction} style={formStyle}>
        <input type="hidden" name="documentId" value={doc.id} />
        <input type="hidden" name="patientId" value={patientId} />
        <textarea
          name="content"
          defaultValue={doc.content}
          rows={24}
          required
          style={textareaStyle}
        />
        <div style={actionsStyle}>
          <button type="submit" style={submitButtonStyle}>
            Salvar alterações
          </button>
          <Link href={`/patients/${patientId}/documents/${documentId}`} style={cancelLinkStyle}>
            Cancelar
          </Link>
        </div>
      </form>
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
  color: "var(--color-text-3)",
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

const headerStyle = {
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
  fontSize: "1.5rem",
  color: "#292524",
} satisfies React.CSSProperties;

const formStyle = {
  display: "grid",
  gap: "1rem",
} satisfies React.CSSProperties;

const textareaStyle = {
  width: "100%",
  fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace",
  fontSize: "0.9rem",
  lineHeight: 1.75,
  padding: "1.25rem",
  borderRadius: "16px",
  border: "1px solid rgba(146, 64, 14, 0.2)",
  background: "rgba(255, 252, 247, 0.95)",
  color: "#292524",
  resize: "vertical" as const,
  boxSizing: "border-box" as const,
} satisfies React.CSSProperties;

const actionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const submitButtonStyle = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#fff",
  cursor: "pointer",
  padding: "0.55rem 1.25rem",
  borderRadius: "999px",
  border: "none",
  background: "#9a3412",
} satisfies React.CSSProperties;

const cancelLinkStyle = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--color-text-3)",
  textDecoration: "none",
} satisfies React.CSSProperties;
