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
import { getPracticeProfileSnapshot } from "../../../../../../lib/setup/profile";
import { createClient } from "../../../../../../lib/supabase/server";
import { archiveDocumentAction } from "./actions";
import type { DocumentType } from "../../../../../../lib/documents/model";
import {
  DOCUMENT_TYPE_LABELS,
  canExportDocumentAsPdf,
  isPrivateDocumentType,
} from "../../../../../../lib/documents/presenter";
import { resolveSession } from "../../../../../../lib/supabase/session";
import { richTextHtmlToPlainText, sanitizeRichTextHtml } from "../../../../../../lib/documents/rich-text";

const longDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
});

const longDateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
});

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

      {/* Provenance header */}
      <section style={provenanceStyle}>
        <p style={eyebrowStyle}>Documento clínico</p>
        <h1 style={titleStyle}>{typeLabel}</h1>
        {isPrivate && <p style={privateNoticeStyle}>Uso exclusivo do psicólogo. Não entra no prontuário nem em exportações.</p>}
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
              <span style={{ ...metaValueStyle, color: "var(--color-rose)" }}>
                {longDateFormatter.format(doc.archivedAt)}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Document content */}
      <section style={contentSectionStyle}>
        {doc.type === "session_record" ? (
          <div
            style={contentRichStyle}
            dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(doc.content) }}
          />
        ) : (
          <pre style={contentPreStyle}>{doc.content}</pre>
        )}

        {signatureImageUrl && !isPrivate && (
          <div style={signatureBlockStyle}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={signatureImageUrl}
              alt="Assinatura profissional"
              style={signatureImgStyle}
            />
          </div>
        )}
      </section>

      {/* Actions */}
      <section style={actionsStyle}>
        {!isPrivate && (
          <a href={dataUri} download={`${typeLabel}-${doc.id}.txt`} style={downloadLinkStyle}>
            Baixar documento
          </a>
        )}

        {!isPrivate && profile.signatureAsset && canExportDocumentAsPdf(doc.type) && (
          <a
            href={`/api/patients/${patientId}/documents/${doc.id}/pdf`}
            style={downloadLinkStyle}
          >
            Baixar PDF
          </a>
        )}

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

const provenanceStyle = {
  padding: "1.35rem 1.5rem",
  borderRadius: "var(--radius-lg)",
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
  color: "var(--color-brown-mid)",
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "1.5rem",
  color: "var(--color-kbd-text)",
} satisfies React.CSSProperties;

const privateNoticeStyle = {
  margin: 0,
  fontSize: "0.88rem",
  color: "var(--color-warning-text)",
  fontWeight: 500,
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
  color: "var(--color-text-3)",
  minWidth: "7rem",
} satisfies React.CSSProperties;

const metaValueStyle = {
  color: "var(--color-kbd-text)",
  fontWeight: 500,
} satisfies React.CSSProperties;

const contentSectionStyle = {
  padding: "1.5rem",
  borderRadius: "var(--radius-lg)",
  background: "rgba(255, 252, 247, 0.95)",
  border: "1px solid rgba(146, 64, 14, 0.12)",
} satisfies React.CSSProperties;

const contentPreStyle = {
  margin: 0,
  fontFamily: "inherit",
  fontSize: "0.95rem",
  lineHeight: 1.75,
  color: "var(--color-kbd-text)",
  whiteSpace: "pre-wrap" as const,
  wordBreak: "break-word" as const,
} satisfies React.CSSProperties;

const contentRichStyle = {
  color: "var(--color-kbd-text)",
  fontSize: "0.95rem",
  lineHeight: 1.75,
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

const signatureBlockStyle = {
  marginTop: "1.5rem",
  paddingTop: "1rem",
  borderTop: "1px solid rgba(146, 64, 14, 0.1)",
} satisfies React.CSSProperties;

const signatureImgStyle = {
  maxHeight: "80px",
  objectFit: "contain" as const,
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
