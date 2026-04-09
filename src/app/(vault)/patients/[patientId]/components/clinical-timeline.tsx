/**
 * ClinicalTimeline — redesigned with simplified cards and visual timeline.
 *
 * Design principles:
 * - Scannability first: date + session + status + note badge
 * - Details on demand: communication collapsed in <details>
 * - Visual narrative: sessions grouped by month with timeline line
 */

import Link from "next/link";
import {
  buildReminderWhatsAppUrl,
  buildRescheduleWhatsAppUrl,
  buildReminderMailtoUrl,
  buildRescheduleMailtoUrl,
} from "../../../../../lib/communication/templates";
import { EmptyState } from "../../../components/empty-state";

interface TimelineEntry {
  appointmentId: string;
  startsAt: Date;
  durationMinutes: number;
  careMode: "IN_PERSON" | "ONLINE";
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "NO_SHOW";
  sessionNumber: number | null;
  hasNote: boolean;
  noteId: string | null;
}

interface ClinicalTimelineProps {
  patientId: string;
  upcoming: TimelineEntry[];
  completed: TimelineEntry[];
  dismissed: TimelineEntry[];
  patientName: string;
  patientPhone: string | null;
}

const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(date: Date): string {
  const f = dateFormatter.format(date);
  return f.charAt(0).toUpperCase() + f.slice(1);
}

function getMonthKey(date: Date): string {
  return `${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function groupByMonth(entries: TimelineEntry[]): [string, TimelineEntry[]][] {
  const map = new Map<string, TimelineEntry[]>();
  for (const e of entries) {
    const key = getMonthKey(e.startsAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return Array.from(map.entries());
}

// ─── Badges ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TimelineEntry["status"] }) {
  const config = {
    COMPLETED: { label: "Concluída", bg: "rgba(245,235,220,0.9)", color: "var(--color-warning-text)" },
    SCHEDULED: { label: "Agendada", bg: "rgba(240,253,244,0.9)", color: "var(--color-success-text)" },
    CONFIRMED: { label: "Confirmada", bg: "rgba(240,253,244,0.9)", color: "var(--color-success-text)" },
    CANCELED: { label: "Cancelada", bg: "rgba(241,245,249,0.9)", color: "var(--color-slate)" },
    NO_SHOW: { label: "Não compareceu", bg: "rgba(255,241,242,0.9)", color: "var(--color-rose)" },
  }[status];

  return (
    <span style={{
      display: "inline-block", padding: "0.15rem 0.55rem", borderRadius: "var(--radius-pill)",
      fontSize: "0.7rem", fontWeight: 500, background: config.bg, color: config.color,
    }}>
      {config.label}
    </span>
  );
}

function NoteBadge({ hasNote }: { hasNote: boolean }) {
  if (!hasNote) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.2rem",
      padding: "0.15rem 0.55rem", borderRadius: "var(--radius-pill)",
      fontSize: "0.7rem", fontWeight: 500,
      background: "var(--color-note-badge-bg)", color: "var(--color-note-blue)",
    }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><line x1="12" x2="12" y1="18" y2="12"/><line x1="9" x2="15" y1="15" y2="15"/>
      </svg>
      Prontuário
    </span>
  );
}

// ─── Communication (collapsed) ───────────────────────────────────────────────

function ComunicacaoGroup({ patientName, patientPhone, startsAt }: {
  patientName: string; patientPhone: string | null; startsAt: Date;
}) {
  const apptDate = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" }).format(startsAt);
  const apptTime = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(startsAt);

  const reminderWA = buildReminderWhatsAppUrl({ patientName, patientPhone, appointmentDate: apptDate, appointmentTime: apptTime });
  const reminderMail = buildReminderMailtoUrl({ patientName, patientEmail: null, appointmentDate: apptDate, appointmentTime: apptTime });
  const rescheduleWA = buildRescheduleWhatsAppUrl({ patientName, patientPhone, originalDate: apptDate, originalTime: apptTime });
  const rescheduleMail = buildRescheduleMailtoUrl({ patientName, patientEmail: null, originalDate: apptDate, originalTime: apptTime });

  return (
    <details style={{ marginTop: "0.5rem", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", background: "var(--color-surface-1)", border: "1px solid var(--color-border)" }}>
      <summary style={{ cursor: "pointer", fontSize: "0.72rem", fontWeight: 600, color: "var(--color-brown-mid)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Comunicação
      </summary>
      <div style={{ display: "grid", gap: "0.4rem", marginTop: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--color-warm-brown)", minWidth: "6rem" }}>Lembrete</span>
          <a href={reminderWA} target="_blank" rel="noreferrer" style={commLinkStyle}>WhatsApp</a>
          <a href={reminderMail} target="_blank" rel="noreferrer" style={commLinkStyle}>Email</a>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--color-warm-brown)", minWidth: "6rem" }}>Reagendamento</span>
          <a href={rescheduleWA} target="_blank" rel="noreferrer" style={commLinkStyle}>WhatsApp</a>
          <a href={rescheduleMail} target="_blank" rel="noreferrer" style={commLinkStyle}>Email</a>
        </div>
      </div>
    </details>
  );
}

// ─── Entry Cards ─────────────────────────────────────────────────────────────

function CompletedEntryCard({ entry, patientId }: { entry: TimelineEntry; patientId: string }) {
  const sessionLabel = entry.sessionNumber !== null ? `Sessão ${entry.sessionNumber}` : "Consulta avulsa";

  return (
    <div style={entryCardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.4rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text-1)" }}>{sessionLabel}</span>
          <span style={{ fontSize: "0.85rem", color: "var(--color-text-2)" }}>{formatDate(entry.startsAt)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <StatusBadge status="COMPLETED" />
          <NoteBadge hasNote={entry.hasNote} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.35rem" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>
          {entry.careMode === "IN_PERSON" ? "Presencial" : "Online"} · {entry.durationMinutes} min
        </span>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        {entry.hasNote ? (
          <Link href={`/sessions/${entry.appointmentId}/note`} style={actionLinkStyle}>
            Ver / Editar prontuário →
          </Link>
        ) : (
          <Link href={`/sessions/${entry.appointmentId}/note`} style={actionLinkPrimaryStyle}>
            Registrar prontuário →
          </Link>
        )}
      </div>
    </div>
  );
}

function ScheduledEntryCard({ entry, patientName, patientPhone }: { entry: TimelineEntry; patientName: string; patientPhone: string | null }) {
  return (
    <div style={{ ...entryCardStyle, borderColor: "rgba(22,101,52,0.2)", background: "rgba(240,253,244,0.6)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.4rem" }}>
        <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text-1)" }}>{formatDate(entry.startsAt)}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <StatusBadge status={entry.status} />
        </div>
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--color-text-3)", marginTop: "0.25rem" }}>
        {entry.careMode === "IN_PERSON" ? "Presencial" : "Online"} · {entry.durationMinutes} min
      </div>
      <ComunicacaoGroup patientName={patientName} patientPhone={patientPhone} startsAt={entry.startsAt} />
    </div>
  );
}

function MutedEntryCard({ entry }: { entry: TimelineEntry }) {
  return (
    <div style={{ ...entryCardStyle, opacity: 0.6, background: "rgba(248,246,243,0.6)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.4rem" }}>
        <span style={{ fontSize: "0.85rem", color: "var(--color-text-3)" }}>{formatDate(entry.startsAt)}</span>
        <StatusBadge status={entry.status} />
      </div>
    </div>
  );
}

// ─── Month Group ─────────────────────────────────────────────────────────────

function MonthGroup({ month, entries, patientId, patientName, patientPhone, type }: {
  month: string; entries: TimelineEntry[]; patientId: string;
  patientName: string; patientPhone: string | null;
  type: "completed" | "upcoming";
}) {
  return (
    <div style={{ position: "relative" }}>
      <p style={{
        position: "sticky", top: 0, zIndex: "var(--z-base)",
        margin: "0 0 0.5rem", padding: "0.25rem 0.5rem",
        fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase",
        letterSpacing: "0.1em", color: "var(--color-text-3)",
        background: "var(--color-bg)", borderRadius: "var(--radius-xs)",
      }}>
        {month}
      </p>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        {entries.map((entry) =>
          type === "completed"
            ? <CompletedEntryCard key={entry.appointmentId} entry={entry} patientId={patientId} />
            : <ScheduledEntryCard key={entry.appointmentId} entry={entry} patientName={patientName} patientPhone={patientPhone} />
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ClinicalTimeline({ patientId, upcoming, completed, dismissed, patientName, patientPhone }: ClinicalTimelineProps) {
  const hasAny = upcoming.length > 0 || completed.length > 0 || dismissed.length > 0;

  const completedByMonth = groupByMonth(completed);
  const upcomingByMonth = groupByMonth(upcoming);

  const dismissedCount = dismissed.length;
  const canceledCount = dismissed.filter((e) => e.status === "CANCELED").length;
  const noShowCount = dismissed.filter((e) => e.status === "NO_SHOW").length;
  const dismissedLabel = [
    canceledCount > 0 ? `${canceledCount} cancelada${canceledCount > 1 ? "s" : ""}` : "",
    noShowCount > 0 ? `${noShowCount} falta${noShowCount > 1 ? "s" : ""}` : "",
  ].filter(Boolean).join(" e ") || `${dismissedCount} dispensada${dismissedCount > 1 ? "s" : ""}`;

  return (
    <section style={{ display: "grid", gap: "0.75rem" }}>
      <div style={{ display: "grid", gap: "0.25rem" }}>
        <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.14em", fontSize: "0.72rem", color: "var(--color-brown-mid)" }}>Histórico clínico</p>
        <h2 style={{ margin: 0, fontSize: "1.4rem" }}>Linha do tempo</h2>
      </div>

      {!hasAny ? (
        <EmptyState
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>}
          title="Nenhuma sessão registrada ainda"
          description="As consultas aparecerão aqui conforme forem agendadas."
        />
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div style={{ display: "grid", gap: "1rem" }}>
              <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-3)" }}>
                Próximas consultas
              </p>
              {upcomingByMonth.map(([month, entries]) => (
                <MonthGroup key={month} month={month} entries={entries} patientId={patientId} patientName={patientName} patientPhone={patientPhone} type="upcoming" />
              ))}
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-3)" }}>
                Sessões realizadas
              </p>
              {completedByMonth.map(([month, entries]) => (
                <MonthGroup key={month} month={month} entries={entries} patientId={patientId} patientName={patientName} patientPhone={patientPhone} type="completed" />
              ))}
            </div>
          )}

          {/* Dismissed */}
          {dismissed.length > 0 && (
            <details style={{ borderRadius: "var(--radius-md)", border: "1px solid rgba(146,64,14,0.12)", overflow: "hidden" }}>
              <summary style={{ padding: "0.6rem 1rem", fontSize: "0.82rem", fontWeight: 500, color: "var(--color-text-3)", cursor: "pointer" }}>
                {dismissedLabel}
              </summary>
              <div style={{ display: "grid", gap: "0.5rem", padding: "0 1rem 0.75rem" }}>
                {dismissed.map((entry) => <MutedEntryCard key={entry.appointmentId} entry={entry} />)}
              </div>
            </details>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const entryCardStyle: React.CSSProperties = {
  borderRadius: "var(--radius-lg)",
  background: "rgba(255,252,247,0.95)",
  border: "1px solid rgba(146,64,14,0.12)",
  padding: "1rem 1.25rem",
  display: "grid",
  gap: "0.25rem",
  transition: "box-shadow 150ms ease, border-color 150ms ease",
};

const actionLinkStyle: React.CSSProperties = {
  fontSize: "0.85rem", fontWeight: 500, color: "var(--color-accent)", textDecoration: "none",
};

const actionLinkPrimaryStyle: React.CSSProperties = {
  fontSize: "0.85rem", fontWeight: 600, color: "var(--color-brown-mid)", textDecoration: "none",
};

const commLinkStyle: React.CSSProperties = {
  fontSize: "0.75rem", color: "var(--color-accent)", textDecoration: "none", fontWeight: 500,
  padding: "0.1rem 0.4rem", borderRadius: "var(--radius-xs)",
  background: "rgba(255,247,237,0.8)", border: "1px solid rgba(146,64,14,0.15)",
};
