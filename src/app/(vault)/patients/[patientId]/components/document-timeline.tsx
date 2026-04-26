"use client";

/**
 * DocumentTimeline — chronological document list with status badges and inline actions.
 *
 * Features:
 * - Chronological order (most recent first)
 * - Status badges with color coding
 * - Inline actions per status
 * - Quick filters
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import type { PracticeDocument, DocumentStatus } from "../../../../../lib/documents/model";
import { DOCUMENT_TYPE_LABELS, isPrivateDocumentType } from "../../../../../lib/documents/presenter";
import { STATUS_LABELS, STATUS_COLORS, FILTER_OPTIONS, type StatusFilter } from "./document-status-presenter";
import type { AppointmentCareMode } from "../../../../../lib/appointments/model";

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

interface DocumentTimelineProps {
  documents: PracticeDocument[];
  patientId: string;
  patientName: string;
  appointments?: Record<string, { startsAt: Date; careMode: AppointmentCareMode }>;
}

function StatusBadge({ status }: { status: DocumentStatus }) {
  const colors = STATUS_COLORS[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.25rem",
      padding: "0.15rem 0.5rem", borderRadius: "var(--radius-pill)",
      background: colors.bg, color: colors.text,
      fontSize: "0.72rem", fontWeight: 600, border: `1px solid ${colors.border}`,
    }}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function AppointmentBadge({ doc, appointments }: { doc: PracticeDocument; appointments?: Record<string, { startsAt: Date; careMode: AppointmentCareMode }> }) {
  if (!doc.appointmentId) return null;
  const appt = appointments?.[doc.appointmentId];
  if (!appt) {
    return (
      <span style={{ fontSize: "0.72rem", color: "var(--color-text-4)", fontWeight: 500 }}>
        Atendimento removido
      </span>
    );
  }
  const dateLabel = shortDateFormatter.format(appt.startsAt);
  const timeLabel = timeFormatter.format(appt.startsAt);
  return (
    <Link
      href="/agenda"
      style={{ fontSize: "0.72rem", color: "var(--color-text-3)", fontWeight: 500, textDecoration: "none" }}
      title={`Ver atendimento de ${dateLabel}, ${timeLabel}`}
    >
      Atendimento de {dateLabel}, {timeLabel}
    </Link>
  );
}

function DocumentActions({ doc, patientId }: { doc: PracticeDocument; patientId: string }) {
  const actions: { label: string; href?: string; action?: string; variant?: "primary" | "secondary" }[] = [];

  switch (doc.status) {
    case "draft":
      actions.push(
        { label: "Continuar", href: `/patients/${patientId}/documents/${doc.id}/edit`, variant: "primary" },
        { label: "Finalizar", action: "finalize", variant: "secondary" },
      );
      break;
    case "finalized":
      actions.push(
        { label: "Assinar", action: "sign", variant: "primary" },
        { label: "Editar", href: `/patients/${patientId}/documents/${doc.id}/edit`, variant: "secondary" },
        { label: "Visualizar", href: `/patients/${patientId}/documents/${doc.id}`, variant: "secondary" },
      );
      break;
    case "signed":
      actions.push(
        { label: "Entregar", action: "deliver", variant: "primary" },
        { label: "Baixar PDF", href: `/api/patients/${patientId}/documents/${doc.id}/pdf`, variant: "secondary" },
        { label: "Visualizar", href: `/patients/${patientId}/documents/${doc.id}`, variant: "secondary" },
      );
      break;
    case "delivered":
      actions.push(
        { label: "Visualizar", href: `/patients/${patientId}/documents/${doc.id}`, variant: "secondary" },
        { label: "Baixar PDF", href: `/api/patients/${patientId}/documents/${doc.id}/pdf`, variant: "secondary" },
      );
      break;
    case "archived":
      actions.push(
        { label: "Visualizar", href: `/patients/${patientId}/documents/${doc.id}`, variant: "secondary" },
      );
      break;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
      {actions.map((action) => {
        const style = action.variant === "primary" ? primaryActionStyle : secondaryActionStyle;
        if (action.href) {
          return (
            <Link key={action.label} href={action.href} style={style}>
              {action.label}
            </Link>
          );
        }
        // For server actions (finalize, sign, deliver), render a form
        if (action.action) {
          return (
            <form
              key={action.label}
              action={`/patients/${patientId}/documents/${doc.id}/${action.action}`}
              style={{ display: "inline" }}
            >
              <input type="hidden" name="documentId" value={doc.id} />
              <input type="hidden" name="patientId" value={patientId} />
              <button type="submit" style={{ ...style, cursor: "pointer" }}>
                {action.label}
              </button>
            </form>
          );
        }
        return null;
      })}
    </div>
  );
}

export function DocumentTimeline({ documents, patientId, patientName, appointments }: DocumentTimelineProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");

  const filteredDocuments = useMemo(() => {
    const sorted = [...documents].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (filter === "all") return sorted;
    return sorted.filter((d) => d.status === filter);
  }, [documents, filter]);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            style={{
              padding: "0.3rem 0.7rem", borderRadius: "var(--radius-pill)",
              fontSize: "0.78rem", fontWeight: 500, border: "1px solid",
              cursor: "pointer",
              ...(filter === opt.value
                ? { background: "var(--color-accent)", color: "var(--color-surface-0)", borderColor: "var(--color-accent)" }
                : { background: "var(--color-surface-0)", color: "var(--color-text-2)", borderColor: "var(--color-border-med)" }
              ),
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filteredDocuments.length === 0 ? (
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-3)", padding: "1rem 0" }}>
          Nenhum documento encontrado para este filtro.
        </p>
      ) : (
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {filteredDocuments.map((doc) => {
            const isPrivate = isPrivateDocumentType(doc.type);
            return (
              <div
                key={doc.id}
                style={{
                  display: "grid", gap: "0.5rem",
                  padding: "0.85rem 1rem", borderRadius: "var(--radius-md)",
                  background: "var(--color-surface-1)", border: "1px solid var(--color-border)",
                }}
              >
                {/* Header: type + status + date */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text-1)" }}>
                      {DOCUMENT_TYPE_LABELS[doc.type]}
                    </span>
                    {isPrivate && (
                      <span style={{
                        display: "inline-block", padding: "0.08rem 0.4rem", borderRadius: "var(--radius-pill)",
                        background: "var(--color-accent-light)", color: "var(--color-warning-text)", fontSize: "0.68rem",
                        fontWeight: 600, textTransform: "uppercase",
                      }}>Privado</span>
                    )}
                    <StatusBadge status={doc.status} />
                    {doc.appointmentId && (
                      <>
                        <span style={{ color: "var(--color-text-4)", fontSize: "0.72rem" }}>·</span>
                        <AppointmentBadge doc={doc} appointments={appointments} />
                      </>
                    )}
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>
                    {shortDateFormatter.format(doc.createdAt)} · {timeFormatter.format(doc.createdAt)}
                  </span>
                </div>

                {/* Meta info */}
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-3)" }}>
                  Criado por {doc.createdByName}
                  {doc.editedAt && doc.editedAt > doc.createdAt && " · editado"}
                </div>

                {/* Actions */}
                <DocumentActions doc={doc} patientId={patientId} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const primaryActionStyle: React.CSSProperties = {
  padding: "0.25rem 0.6rem", borderRadius: "var(--radius-sm)",
  background: "var(--color-accent)", color: "var(--color-surface-0)",
  fontSize: "0.78rem", fontWeight: 600, textDecoration: "none",
  border: "none",
};

const secondaryActionStyle: React.CSSProperties = {
  padding: "0.25rem 0.6rem", borderRadius: "var(--radius-sm)",
  background: "var(--color-surface-2)", color: "var(--color-accent)",
  fontSize: "0.78rem", fontWeight: 500, textDecoration: "none",
  border: "1px solid var(--color-border-med)",
};
