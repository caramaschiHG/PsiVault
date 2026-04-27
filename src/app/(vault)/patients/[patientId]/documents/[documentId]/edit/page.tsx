/**
 * Document edit page — /patients/[patientId]/documents/[documentId]/edit
 *
 * Server component. Guards: patient exists, document exists and is not archived.
 * Pre-fills editor with current doc.content (locked mutability decision from CONTEXT.md).
 * Submits via updateDocumentAction which fires document.updated audit event.
 */

import { notFound } from "next/navigation";
import { getPatientRepository } from "../../../../../../../lib/patients/store";
import { getDocumentRepository } from "../../../../../../../lib/documents/store";
import { updateDocumentAction } from "./actions";
import { DOCUMENT_TYPE_LABELS } from "../../../../../../../lib/documents/presenter";
import { resolveSession } from "../../../../../../../lib/supabase/session";
import { DocumentEditorForm } from "./components/document-editor-form";

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
  const backHref = `/patients/${patientId}/documents/${documentId}`;

  const patientDisplayName = patient.socialName
    ? `${patient.fullName} (${patient.socialName})`
    : patient.fullName;

  return (
    <main style={shellStyle}>
      {/* Breadcrumb */}
      <nav style={navStyle} className="focus-mode-hideable">
        <Link href="/patients" style={navLinkStyle}>
          Pacientes
        </Link>
        <span style={navSepStyle}>/</span>
        <Link href={`/patients/${patientId}`} style={navLinkStyle}>
          {patient.fullName}
        </Link>
        <span style={navSepStyle}>/</span>
        <Link href={backHref} style={navLinkStyle}>
          {typeLabel}
        </Link>
        <span style={navSepStyle}>/</span>
        <span style={navCurrentStyle}>Editar</span>
      </nav>

      {/* Page heading */}
      <header style={headerStyle} className="focus-mode-hideable">
        <p style={eyebrowStyle}>Edição de documento</p>
        <h1 style={titleStyle}>Editar — {typeLabel}</h1>
      </header>

      {/* Edit form */}
      <DocumentEditorForm
        initialHtml={doc.content}
        documentId={doc.id}
        patientId={patientId}
        patientName={patientDisplayName}
        backHref={backHref}
        updateAction={updateDocumentAction}
      />
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
  color: "var(--color-accent)",
  textDecoration: "none",
  fontWeight: 500,
} satisfies React.CSSProperties;

const navSepStyle = {
  color: "var(--color-taupe)",
} satisfies React.CSSProperties;

const navCurrentStyle = {
  color: "var(--color-text-2)",
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
  color: "var(--color-brown-mid)",
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "1.5rem",
  color: "var(--color-kbd-text)",
} satisfies React.CSSProperties;

const formStyle = {
  display: "grid",
  gap: "1rem",
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
  borderRadius: "var(--radius-pill)",
  border: "none",
  background: "var(--color-accent)",
} satisfies React.CSSProperties;

const cancelLinkStyle = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--color-text-3)",
  textDecoration: "none",
} satisfies React.CSSProperties;
