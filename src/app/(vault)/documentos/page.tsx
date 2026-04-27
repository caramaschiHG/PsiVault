/**
 * /documentos — Global documents dashboard.
 *
 * Server component. Shows all workspace documents with filters by type, status, patient, date.
 */

import Link from "next/link";
import { resolveSession } from "../../../lib/supabase/session";
import { getDocumentRepository } from "../../../lib/documents/store";
import { getPatientRepository } from "../../../lib/patients/store";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "../components/empty-state";
import { DOCUMENT_TYPE_LABELS, statusLabel } from "../../../lib/documents/presenter";
import type { DocumentType, DocumentStatus } from "../../../lib/documents/model";

interface DocumentosPageProps {
  searchParams: Promise<{
    type?: string;
    status?: string;
    patientId?: string;
  }>;
}

export default async function DocumentosPage({ searchParams }: DocumentosPageProps) {
  const { workspaceId } = await resolveSession();
  const docRepo = getDocumentRepository();
  const patientRepo = getPatientRepository();

  const [docs, patients] = await Promise.all([
    docRepo.listAllByWorkspace(workspaceId),
    patientRepo.listActive(workspaceId),
  ]);

  const params = await searchParams;
  const filterType = params.type as DocumentType | undefined;
  const filterStatus = params.status as DocumentStatus | undefined;
  const filterPatientId = params.patientId;

  const patientMap = new Map(patients.map((p) => [p.id, p]));

  const filtered = docs.filter((doc) => {
    if (filterType && doc.type !== filterType) return false;
    if (filterStatus && doc.status !== filterStatus) return false;
    if (filterPatientId && doc.patientId !== filterPatientId) return false;
    return true;
  });

  // Group by type for counts
  const countsByType = new Map<DocumentType, number>();
  for (const doc of docs) {
    countsByType.set(doc.type, (countsByType.get(doc.type) ?? 0) + 1);
  }

  const typeFilterHref = (type: DocumentType) => {
    const sp = new URLSearchParams();
    if (filterType === type) {
      // toggle off
    } else {
      sp.set("type", type);
    }
    if (filterStatus) sp.set("status", filterStatus);
    if (filterPatientId) sp.set("patientId", filterPatientId);
    return `/documentos?${sp.toString()}`;
  };

  const statusFilterHref = (status: DocumentStatus) => {
    const sp = new URLSearchParams();
    if (filterType) sp.set("type", filterType);
    if (filterStatus === status) {
      // toggle off
    } else {
      sp.set("status", status);
    }
    if (filterPatientId) sp.set("patientId", filterPatientId);
    return `/documentos?${sp.toString()}`;
  };

  return (
    <main style={shellStyle}>
      <PageHeader
        title="Documentos"
        description={
          docs.length === 0
            ? "Nenhum documento ainda."
            : `${docs.length} documento${docs.length > 1 ? "s" : ""} no workspace.`
        }
      />

      {/* Type filters with counts */}
      <div style={filtersRowStyle}>
        {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((type) => {
          const count = countsByType.get(type) ?? 0;
          const active = filterType === type;
          return (
            <Link
              key={type}
              href={typeFilterHref(type)}
              style={{
                ...filterChipStyle,
                background: active ? "var(--color-accent)" : "var(--color-surface-2)",
                color: active ? "#fff" : "var(--color-text-2)",
                borderColor: active ? "var(--color-accent)" : "var(--color-border-med)",
              }}
            >
              {DOCUMENT_TYPE_LABELS[type]}
              <span style={countBadgeStyle}>{count}</span>
            </Link>
          );
        })}
      </div>

      {/* Status filters */}
      <div style={filtersRowStyle}>
        {(["draft", "finalized", "signed", "delivered", "archived"] as DocumentStatus[]).map((s) => {
          const active = filterStatus === s;
          return (
            <Link
              key={s}
              href={statusFilterHref(s)}
              style={{
                ...statusChipStyle,
                background: active ? "var(--color-accent)" : "var(--color-surface-2)",
                color: active ? "#fff" : "var(--color-text-2)",
                borderColor: active ? "var(--color-accent)" : "var(--color-border-med)",
              }}
            >
              {statusLabel(s)}
            </Link>
          );
        })}
      </div>

      {/* Document list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          }
          title="Nenhum documento encontrado"
          description="Tente remover os filtros ou crie um novo documento a partir de um paciente."
        />
      ) : (
        <div style={listStyle}>
          {filtered.map((doc) => {
            const patient = patientMap.get(doc.patientId);
            return (
              <Link
                key={doc.id}
                href={`/patients/${doc.patientId}/documents/${doc.id}`}
                style={itemStyle}
              >
                <div style={itemMetaStyle}>
                  <span style={typeLabelStyle}>{DOCUMENT_TYPE_LABELS[doc.type]}</span>
                  <span style={statusBadgeStyle(doc.status)}>{statusLabel(doc.status)}</span>
                </div>
                <div style={itemBodyStyle}>
                  <span style={patientNameStyle}>{patient?.fullName ?? "Paciente desconhecido"}</span>
                  <span style={dateStyle}>
                    {doc.createdAt.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

const shellStyle = {
  display: "grid",
  gap: "1.25rem",
  padding: "1.5rem",
} satisfies React.CSSProperties;

const filtersRowStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: "0.5rem",
} satisfies React.CSSProperties;

const filterChipStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  padding: "0.35rem 0.75rem",
  borderRadius: "var(--radius-pill)",
  border: "1px solid",
  fontSize: "0.8rem",
  fontWeight: 500,
  textDecoration: "none",
  transition: "background var(--duration-100) ease-out, color var(--duration-100) ease-out, border-color var(--duration-100) ease-out",
} satisfies React.CSSProperties;

const statusChipStyle = {
  ...filterChipStyle,
  padding: "0.25rem 0.6rem",
  fontSize: "0.75rem",
} satisfies React.CSSProperties;

const countBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "1.25rem",
  height: "1.25rem",
  padding: "0 0.35rem",
  borderRadius: "var(--radius-pill)",
  background: "rgba(0,0,0,0.15)",
  fontSize: "0.7rem",
  fontWeight: 600,
} satisfies React.CSSProperties;

const listStyle = {
  display: "grid",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const itemStyle = {
  display: "grid",
  gap: "0.35rem",
  padding: "0.75rem 1rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  textDecoration: "none",
  transition: "background var(--duration-100) ease-out, border-color var(--duration-100) ease-out",
} satisfies React.CSSProperties;

const itemMetaStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const itemBodyStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const typeLabelStyle = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--color-text-3)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
} satisfies React.CSSProperties;

function statusBadgeStyle(status: DocumentStatus): React.CSSProperties {
  const colors: Record<DocumentStatus, { bg: string; text: string }> = {
    draft: { bg: "rgba(146, 64, 14, 0.1)", text: "var(--color-brown-mid)" },
    finalized: { bg: "rgba(37, 99, 235, 0.1)", text: "var(--color-accent)" },
    signed: { bg: "rgba(22, 163, 74, 0.1)", text: "var(--color-forest)" },
    delivered: { bg: "rgba(100, 116, 139, 0.1)", text: "var(--color-text-3)" },
    archived: { bg: "rgba(0,0,0,0.06)", text: "var(--color-text-3)" },
  };
  return {
    fontSize: "0.7rem",
    fontWeight: 600,
    padding: "0.15rem 0.5rem",
    borderRadius: "var(--radius-pill)",
    background: colors[status].bg,
    color: colors[status].text,
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
  };
}

const patientNameStyle = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const dateStyle = {
  fontSize: "0.78rem",
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;
