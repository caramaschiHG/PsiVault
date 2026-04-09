/**
 * DocumentsSection — redesigned: grouped by type with count badges.
 *
 * Design principles:
 * - Group by document type (collapsible sections)
 * - Count badges per type
 * - Most recent first within each group
 * - Empty state with clear CTA
 */

import Link from "next/link";
import type { PracticeDocument, DocumentType } from "../../../../../lib/documents/model";
import { canShareDocument, DOCUMENT_TYPE_LABELS, isPrivateDocumentType } from "../../../../../lib/documents/presenter";
import {
  buildDocumentDeliveryWhatsAppUrl,
  buildDocumentDeliveryMailtoUrl,
} from "../../../../../lib/communication/templates";
import { EmptyState } from "../../../components/empty-state";

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

interface DocumentsSectionProps {
  documents: PracticeDocument[];
  patientId: string;
  patientName: string;
  patientPhone: string | null;
}

function groupByType(docs: PracticeDocument[]): Map<DocumentType, PracticeDocument[]> {
  const map = new Map<DocumentType, PracticeDocument[]>();
  // Sort by date (most recent first)
  const sorted = [...docs].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  for (const doc of sorted) {
    if (!map.has(doc.type)) map.set(doc.type, []);
    map.get(doc.type)!.push(doc);
  }
  return map;
}

function DocumentRow({ doc, patientName, patientPhone }: { doc: PracticeDocument; patientName: string; patientPhone: string | null }) {
  const isPrivate = isPrivateDocumentType(doc.type);
  const waUrl = buildDocumentDeliveryWhatsAppUrl({ patientName, patientPhone, documentType: DOCUMENT_TYPE_LABELS[doc.type] });
  const mailtoUrl = buildDocumentDeliveryMailtoUrl({ patientName, patientEmail: null, documentType: DOCUMENT_TYPE_LABELS[doc.type] });

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0.75rem 1rem", borderRadius: "var(--radius-md)",
      background: "rgba(255,252,247,0.95)", border: "1px solid rgba(146,64,14,0.1)",
      gap: "0.5rem",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
        <span style={{ fontWeight: 500, fontSize: "0.88rem", color: "var(--color-text-1)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          {DOCUMENT_TYPE_LABELS[doc.type]}
          {isPrivate && (
            <span style={{
              display: "inline-block", padding: "0.08rem 0.4rem", borderRadius: "var(--radius-pill)",
              background: "rgba(146,64,14,0.1)", color: "var(--color-warning-text)", fontSize: "0.68rem",
              fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em",
            }}>Privado</span>
          )}
        </span>
        <span style={{ fontSize: "0.78rem", color: "var(--color-text-3)" }}>
          {shortDateFormatter.format(doc.createdAt)}
          {doc.editedAt && doc.editedAt > doc.createdAt && " · editado"}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
        {canShareDocument(doc.type) && (
          <details style={{ position: "relative" }}>
            <summary style={{
              cursor: "pointer", fontSize: "0.8rem", fontWeight: 500, color: "var(--color-accent)",
              padding: "0.15rem 0.5rem", borderRadius: "var(--radius-xs)",
              background: "rgba(255,247,237,0.6)", border: "1px solid rgba(146,64,14,0.2)",
            }}>Enviar</summary>
            <div style={{
              position: "absolute", right: 0, top: "100%", zIndex: "var(--z-dropdown)",
              display: "flex", gap: "0.3rem", padding: "0.4rem",
              borderRadius: "var(--radius-sm)", background: "var(--color-surface-0)", border: "1px solid rgba(146,64,14,0.15)",
              boxShadow: "var(--shadow-dropdown)",
            }}>
              <a href={waUrl} target="_blank" rel="noreferrer" className="external-link" style={{ fontSize: "0.78rem", color: "var(--color-accent)", textDecoration: "none", fontWeight: 500, padding: "0.1rem 0.4rem", borderRadius: "var(--radius-xs)", background: "rgba(255,247,237,0.8)", border: "1px solid rgba(146,64,14,0.2)" }}>WhatsApp</a>
              <a href={mailtoUrl} target="_blank" rel="noreferrer" className="external-link" style={{ fontSize: "0.78rem", color: "var(--color-accent)", textDecoration: "none", fontWeight: 500, padding: "0.1rem 0.4rem", borderRadius: "var(--radius-xs)", background: "rgba(255,247,237,0.8)", border: "1px solid rgba(146,64,14,0.2)" }}>Email</a>
            </div>
          </details>
        )}
        <Link href={`/patients/${doc.patientId}/documents/${doc.id}`} style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--color-accent)", textDecoration: "none" }}>
          Ver →
        </Link>
      </div>
    </div>
  );
}

function TypeGroup({ type, docs, patientName, patientPhone }: { type: DocumentType; docs: PracticeDocument[]; patientName: string; patientPhone: string | null }) {
  return (
    <details open style={{
      borderRadius: "var(--radius-md)", border: "1px solid rgba(146,64,14,0.12)", overflow: "hidden",
    }}>
      <summary style={{
        padding: "0.7rem 1rem", cursor: "pointer", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "0.5rem",
        background: "rgba(255,247,237,0.5)", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-1)",
      }}>
        <span>{DOCUMENT_TYPE_LABELS[type]}</span>
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          minWidth: "1.4rem", height: "1.4rem", padding: "0 0.35rem",
          borderRadius: "var(--radius-pill)", background: "rgba(146,64,14,0.1)", color: "var(--color-warning-text)",
          fontSize: "0.7rem", fontWeight: 600,
        }}>
          {docs.length}
        </span>
      </summary>
      <div style={{ display: "grid", gap: "0.4rem", padding: "0.5rem 0.75rem 0.75rem" }}>
        {docs.map((doc) => (
          <DocumentRow key={doc.id} doc={doc} patientName={patientName} patientPhone={patientPhone} />
        ))}
      </div>
    </details>
  );
}

export function DocumentsSection({ documents, patientId, patientName, patientPhone }: DocumentsSectionProps) {
  const grouped = groupByType(documents);

  return (
    <section style={{ display: "grid", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "grid", gap: "0.25rem" }}>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.14em", fontSize: "0.72rem", color: "var(--color-brown-mid)" }}>Documentos clínicos</p>
          <h2 style={{ margin: 0, fontSize: "1.4rem" }}>Documentos</h2>
        </div>
        <Link href={`/patients/${patientId}/documents/new`} style={{
          fontSize: "0.85rem", fontWeight: 500, color: "var(--color-accent)", textDecoration: "none",
          padding: "0.35rem 0.85rem", borderRadius: "var(--radius-pill)",
          border: "1px solid rgba(146,64,14,0.3)", background: "rgba(255,247,237,0.6)",
        }}>
          Novo documento +
        </Link>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>}
          title="Nenhum documento gerado ainda"
          description="Crie declarações, recibos, laudos e registros privados para este paciente."
          actionLabel="Novo documento"
          actionHref={`/patients/${patientId}/documents/new`}
        />
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {Array.from(grouped.entries()).map(([type, docs]) => (
            <TypeGroup key={type} type={type} docs={docs} patientName={patientName} patientPhone={patientPhone} />
          ))}
        </div>
      )}
    </section>
  );
}
