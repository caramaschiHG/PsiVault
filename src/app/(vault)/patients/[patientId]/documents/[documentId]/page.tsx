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
import { DocumentPaperView } from "../components/document-paper-view";
import { DocumentPaperScaler } from "../components/document-paper-scaler";
import { DocumentActions } from "./components/document-actions";
import { DOCUMENT_TYPE_LABELS, isPrivateDocumentType } from "@/lib/documents/presenter";
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
      <DocumentActions
        patientId={patientId}
        documentId={documentId}
        status={doc.status}
        isPrivate={isPrivate}
        hasSignature={!!profile.signatureAsset?.storageKey}
        typeLabel={typeLabel}
        dataUri={dataUri}
        isActive={isActive}
      />
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
