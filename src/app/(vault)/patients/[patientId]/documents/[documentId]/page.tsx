/**
 * Document view page — A4 paper layout.
 *
 * Shows the full document content in a simulated A4 paper view.
 * Provides download link, edit button, and archive action.
 * Only shown when document belongs to the given patient (cross-patient guard).
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatientRepository } from "@/lib/patients/store";
import { getDocumentRepository } from "@/lib/documents/store";
import { getPracticeProfileSnapshot } from "@/lib/setup/profile";
import { createClient } from "@/lib/supabase/server";
import { archiveDocumentAction } from "./actions";
import { DocumentPaperView } from "../components/document-paper-view";
import { DocumentPaperScaler } from "../components/document-paper-scaler";
import { canSignDocument } from "@/lib/documents/model";
import {
  DOCUMENT_TYPE_LABELS,
  canExportDocumentAsPdf,
  isPrivateDocumentType,
} from "@/lib/documents/presenter";
import { resolveSession } from "@/lib/supabase/session";
import { richTextHtmlToPlainText } from "@/lib/documents/rich-text";

interface DocumentViewPageProps {
  params: Promise<{ patientId: string; documentId: string }>;
}

export default async function DocumentViewPage({ params }: DocumentViewPageProps) {
  const { workspaceId } = await resolveSession();
  const { patientId, documentId } = await params;

  const patientRepo = getPatientRepository();
  const docRepo = getDocumentRepository();

  const patient = await patientRepo.findById(patientId, workspaceId);
  if (!patient) notFound();

  const doc = await docRepo.findById(documentId, workspaceId);
  if (!doc) notFound();

  // Cross-patient guard (SECU-05)
  if (doc.patientId !== patient.id) notFound();

  const typeLabel = DOCUMENT_TYPE_LABELS[doc.type];
  const dataUri = `data:text/plain;charset=utf-8,${encodeURIComponent(
    doc.type === "session_record" ? richTextHtmlToPlainText(doc.content) : doc.content,
  )}`;
  const isActive = doc.archivedAt === null;
  const isPrivate = isPrivateDocumentType(doc.type);

  // Signature image — generate a short-lived signed URL if asset exists
  const profile = await getPracticeProfileSnapshot(undefined, workspaceId);
  let signatureImageUrl: string | null = null;
  if (profile.signatureAsset?.storageKey) {
    const supabase = await createClient();
    const { data } = await supabase.storage
      .from("signatures")
      .createSignedUrl(profile.signatureAsset.storageKey, 3600);
    signatureImageUrl = data?.signedUrl ?? null;
  }

  return (
    <main style={shellStyle}>
      {/* Breadcrumb */}
      <nav style={navStyle}>
        <Link href="/patients" style={navLinkStyle}>
          Pacientes
        </Link>
        <span style={navSepStyle}>›</span>
        <Link href={`/patients/${patientId}`} style={navLinkStyle}>
          {patient.fullName}
        </Link>
        <span style={navSepStyle}>›</span>
        <span style={navCurrentStyle}>{typeLabel}</span>
      </nav>

      {/* A4 Paper View */}
      <DocumentPaperScaler>
        <DocumentPaperView
          typeLabel={typeLabel}
          patientName={patient.fullName}
          professionalName={doc.createdByName}
          crp={profile.crp ?? "CRP não informado"}
          createdAt={doc.createdAt}
          editedAt={doc.editedAt}
          status={doc.status}
          content={doc.content}
          isPrivate={isPrivate}
          signatureImageUrl={signatureImageUrl}
        />
      </DocumentPaperScaler>

      {/* Actions */}
      <section style={actionsStyle}>
        {!isPrivate && (
          <a href={dataUri} download={`${typeLabel}-${doc.id}.txt`} style={downloadLinkStyle}>
            Baixar documento
          </a>
        )}

        {!isPrivate && canExportDocumentAsPdf(doc.type) && (
          <a
            href={`/api/patients/${patientId}/documents/${doc.id}/pdf`}
            style={downloadLinkStyle}
          >
            Baixar PDF
          </a>
        )}

        {/* Placeholder for Plan 39-03 preview modal */}
        {!isPrivate && canExportDocumentAsPdf(doc.type) && (
          <button disabled style={{ ...downloadLinkStyle, opacity: 0.5, cursor: "not-allowed" }}>
            Visualizar PDF
          </button>
        )}

        {isActive && (
          <Link href={`/patients/${patientId}/documents/${doc.id}/edit`} style={editLinkStyle}>
            Editar documento
          </Link>
        )}

        {/* Placeholder for sign action (Plan 39-03) */}
        {isActive && canSignDocument(doc) && (
          <button disabled style={{ ...editLinkStyle, opacity: 0.5, cursor: "not-allowed" }}>
            Assinar
          </button>
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
  padding: "2rem 2.5rem",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "1.25rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const navStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  fontSize: "0.82rem",
} satisfies React.CSSProperties;

const navLinkStyle = {
  color: "var(--color-text-2)",
  textDecoration: "none",
  fontWeight: 500,
} satisfies React.CSSProperties;

const navSepStyle = {
  color: "var(--color-text-4)",
  fontSize: "0.75rem",
} satisfies React.CSSProperties;

const navCurrentStyle = {
  color: "var(--color-text-3)",
  fontWeight: 500,
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
  color: "var(--color-accent)",
  textDecoration: "none",
  padding: "0.45rem 1rem",
  borderRadius: "var(--radius-pill)",
  border: "1px solid rgba(146, 64, 14, 0.3)",
  background: "rgba(255, 247, 237, 0.6)",
} satisfies React.CSSProperties;

const editLinkStyle = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--color-accent)",
  textDecoration: "none",
  padding: "0.45rem 1rem",
  borderRadius: "var(--radius-pill)",
  border: "1px solid var(--color-border-med)",
  background: "var(--color-accent-light)",
} satisfies React.CSSProperties;

const archiveFormStyle = {
  display: "inline",
} satisfies React.CSSProperties;

const archiveButtonStyle = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--color-text-3)",
  cursor: "pointer",
  padding: "0.45rem 1rem",
  borderRadius: "var(--radius-pill)",
  border: "1px solid rgba(120, 113, 108, 0.3)",
  background: "rgba(248, 246, 243, 0.8)",
} satisfies React.CSSProperties;
