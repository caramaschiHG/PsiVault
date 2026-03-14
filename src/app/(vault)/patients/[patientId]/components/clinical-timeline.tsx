/**
 * ClinicalTimeline — chronological session history for a single patient.
 *
 * Pure presentational server component: all data comes from props.
 * Renders all appointment statuses with appropriate visual treatment:
 * - COMPLETED + note:    full-opacity card, "Ver / Editar evolução" link
 * - COMPLETED + no note: full-opacity card, "Registrar evolução" link
 * - SCHEDULED/CONFIRMED: full-opacity card, status chip, no note action
 * - CANCELED/NO_SHOW:    muted card (opacity 0.6), status chip, no note action
 */

import Link from "next/link";
import {
  buildReminderWhatsAppUrl,
  buildRescheduleWhatsAppUrl,
  buildReminderMailtoUrl,
  buildRescheduleMailtoUrl,
} from "../../../../../lib/communication/templates";

interface TimelineEntry {
  appointmentId: string;
  startsAt: Date;
  durationMinutes: number;
  careMode: "IN_PERSON" | "ONLINE";
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "NO_SHOW";
  sessionNumber: number | null; // from deriveSessionNumber
  hasNote: boolean;
  noteId: string | null;
}

interface ClinicalTimelineProps {
  entries: TimelineEntry[]; // sorted most-recent first by parent
  patientName: string;
  patientPhone: string | null;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(date: Date): string {
  const formatted = dateFormatter.format(date);
  // Capitalize first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function CareModeChip({ careMode }: { careMode: "IN_PERSON" | "ONLINE" }) {
  return (
    <span style={careModeChipStyle}>
      {careMode === "IN_PERSON" ? "Presencial" : "Online"}
    </span>
  );
}

function StatusChip({ status }: { status: TimelineEntry["status"] }) {
  switch (status) {
    case "COMPLETED":
      return <span style={completedChipStyle}>Concluída</span>;
    case "SCHEDULED":
      return <span style={scheduledChipStyle}>Agendada</span>;
    case "CONFIRMED":
      return <span style={confirmedChipStyle}>Confirmada</span>;
    case "CANCELED":
      return <span style={canceledChipStyle}>Cancelada</span>;
    case "NO_SHOW":
      return <span style={noShowChipStyle}>Não compareceu</span>;
  }
}

interface CommProps {
  patientName: string;
  patientPhone: string | null;
  startsAt: Date;
}

function ComunicacaoGroup({ patientName, patientPhone, startsAt }: CommProps) {
  const apptDate = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(startsAt);

  const apptTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(startsAt);

  const reminderWhatsApp = buildReminderWhatsAppUrl({
    patientName,
    patientPhone,
    appointmentDate: apptDate,
    appointmentTime: apptTime,
  });

  const reminderMailto = buildReminderMailtoUrl({
    patientName,
    patientEmail: null,
    appointmentDate: apptDate,
    appointmentTime: apptTime,
  });

  const rescheduleWhatsApp = buildRescheduleWhatsAppUrl({
    patientName,
    patientPhone,
    originalDate: apptDate,
    originalTime: apptTime,
  });

  const rescheduleMailto = buildRescheduleMailtoUrl({
    patientName,
    patientEmail: null,
    originalDate: apptDate,
    originalTime: apptTime,
  });

  return (
    <div style={comunicacaoGroupStyle}>
      <p style={comunicacaoGroupLabelStyle}>Comunicação</p>
      <div style={comunicacaoRowStyle}>
        <span style={comunicacaoItemLabelStyle}>Lembrete</span>
        <a href={reminderWhatsApp} target="_blank" rel="noreferrer" style={commLinkStyle}>
          WhatsApp
        </a>
        <a href={reminderMailto} target="_blank" rel="noreferrer" style={commLinkStyle}>
          Email
        </a>
      </div>
      <div style={comunicacaoRowStyle}>
        <span style={comunicacaoItemLabelStyle}>Reagendamento</span>
        <a href={rescheduleWhatsApp} target="_blank" rel="noreferrer" style={commLinkStyle}>
          WhatsApp
        </a>
        <a href={rescheduleMailto} target="_blank" rel="noreferrer" style={commLinkStyle}>
          Email
        </a>
      </div>
    </div>
  );
}

function CompletedEntryCard({ entry, patientName, patientPhone }: { entry: TimelineEntry; patientName: string; patientPhone: string | null }) {
  const sessionLabel =
    entry.sessionNumber !== null
      ? `Sessão ${entry.sessionNumber}`
      : "Consulta avulsa";

  return (
    <div style={completedCardStyle}>
      <div style={cardRowStyle}>
        <div style={cardInfoStyle}>
          <span style={sessionLabelStyle}>{sessionLabel}</span>
          <span style={dateLabelStyle}>{formatDate(entry.startsAt)}</span>
        </div>
        <div style={chipsRowStyle}>
          <CareModeChip careMode={entry.careMode} />
          {entry.hasNote ? (
            <span style={completedChipStyle}>Concluída</span>
          ) : (
            <span style={noNoteChipStyle}>Sem registro</span>
          )}
        </div>
      </div>
      <div style={actionRowStyle}>
        {entry.hasNote ? (
          <Link
            href={`/sessions/${entry.appointmentId}/note`}
            style={viewNoteLinkStyle}
          >
            Ver / Editar evolução →
          </Link>
        ) : (
          <Link
            href={`/sessions/${entry.appointmentId}/note`}
            style={registerNoteLinkStyle}
          >
            Registrar evolução →
          </Link>
        )}
      </div>
      <ComunicacaoGroup patientName={patientName} patientPhone={patientPhone} startsAt={entry.startsAt} />
    </div>
  );
}

function ScheduledEntryCard({ entry, patientName, patientPhone }: { entry: TimelineEntry; patientName: string; patientPhone: string | null }) {
  return (
    <div style={activeCardStyle}>
      <div style={cardRowStyle}>
        <div style={cardInfoStyle}>
          <span style={dateLabelStyle}>{formatDate(entry.startsAt)}</span>
          <span style={durationLabelStyle}>{entry.durationMinutes} min</span>
        </div>
        <div style={chipsRowStyle}>
          <CareModeChip careMode={entry.careMode} />
          <StatusChip status={entry.status} />
        </div>
      </div>
      <ComunicacaoGroup patientName={patientName} patientPhone={patientPhone} startsAt={entry.startsAt} />
    </div>
  );
}

function MutedEntryCard({ entry, patientName, patientPhone }: { entry: TimelineEntry; patientName: string; patientPhone: string | null }) {
  return (
    <div style={mutedCardStyle}>
      <div style={cardRowStyle}>
        <div style={cardInfoStyle}>
          <span style={mutedDateLabelStyle}>{formatDate(entry.startsAt)}</span>
        </div>
        <div style={chipsRowStyle}>
          <StatusChip status={entry.status} />
        </div>
      </div>
      <ComunicacaoGroup patientName={patientName} patientPhone={patientPhone} startsAt={entry.startsAt} />
    </div>
  );
}

export function ClinicalTimeline({ entries, patientName, patientPhone }: ClinicalTimelineProps) {
  return (
    <section style={sectionStyle}>
      <div style={headingBlockStyle}>
        <p style={eyebrowStyle}>Histórico clínico</p>
        <h2 style={titleStyle}>Linha do tempo</h2>
      </div>

      {entries.length === 0 ? (
        <p style={emptyStateStyle}>Nenhuma consulta registrada ainda.</p>
      ) : (
        <div style={entriesListStyle}>
          {entries.map((entry) => {
            if (entry.status === "COMPLETED") {
              return <CompletedEntryCard key={entry.appointmentId} entry={entry} patientName={patientName} patientPhone={patientPhone} />;
            }
            if (entry.status === "SCHEDULED" || entry.status === "CONFIRMED") {
              return <ScheduledEntryCard key={entry.appointmentId} entry={entry} patientName={patientName} patientPhone={patientPhone} />;
            }
            // CANCELED or NO_SHOW
            return <MutedEntryCard key={entry.appointmentId} entry={entry} patientName={patientName} patientPhone={patientPhone} />;
          })}
        </div>
      )}
    </section>
  );
}

// --- Style objects ---

const sectionStyle = {
  display: "grid",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const headingBlockStyle = {
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
  fontSize: "1.4rem",
} satisfies React.CSSProperties;

const emptyStateStyle = {
  margin: 0,
  color: "#78716c",
  fontSize: "0.95rem",
  padding: "1rem 0",
} satisfies React.CSSProperties;

const entriesListStyle = {
  display: "grid",
  gap: "0.625rem",
} satisfies React.CSSProperties;

// Card base — rounded card pattern matching app conventions
const baseCardStyle = {
  borderRadius: "22px",
  background: "rgba(255, 252, 247, 0.95)",
  border: "1px solid rgba(146, 64, 14, 0.16)",
  padding: "1.25rem 1.5rem",
  display: "grid",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const completedCardStyle = {
  ...baseCardStyle,
} satisfies React.CSSProperties;

const activeCardStyle = {
  ...baseCardStyle,
} satisfies React.CSSProperties;

const mutedCardStyle = {
  ...baseCardStyle,
  opacity: 0.6,
  background: "rgba(248, 246, 243, 0.75)",
} satisfies React.CSSProperties;

const cardRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap" as const,
  gap: "0.5rem",
} satisfies React.CSSProperties;

const cardInfoStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "0.2rem",
} satisfies React.CSSProperties;

const sessionLabelStyle = {
  fontWeight: 600,
  fontSize: "0.95rem",
  color: "#292524",
} satisfies React.CSSProperties;

const dateLabelStyle = {
  fontSize: "0.88rem",
  color: "#57534e",
} satisfies React.CSSProperties;

const mutedDateLabelStyle = {
  fontSize: "0.88rem",
  color: "#78716c",
} satisfies React.CSSProperties;

const durationLabelStyle = {
  fontSize: "0.8rem",
  color: "#78716c",
} satisfies React.CSSProperties;

const chipsRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const actionRowStyle = {
  display: "flex",
  alignItems: "center",
} satisfies React.CSSProperties;

// Chip base
const baseChipStyle = {
  display: "inline-block",
  padding: "0.15rem 0.6rem",
  borderRadius: "999px",
  fontSize: "0.75rem",
  fontWeight: 500,
  lineHeight: 1.5,
} satisfies React.CSSProperties;

const careModeChipStyle = {
  ...baseChipStyle,
  background: "rgba(231,229,228,0.7)",
  color: "#44403c",
} satisfies React.CSSProperties;

const completedChipStyle = {
  ...baseChipStyle,
  background: "rgba(239,246,255,0.9)",
  color: "#1e3a8a",
} satisfies React.CSSProperties;

const noNoteChipStyle = {
  ...baseChipStyle,
  background: "rgba(254,243,199,0.9)",
  color: "#92400e",
} satisfies React.CSSProperties;

const scheduledChipStyle = {
  ...baseChipStyle,
  background: "rgba(240,253,244,0.9)",
  color: "#166534",
} satisfies React.CSSProperties;

const confirmedChipStyle = {
  ...baseChipStyle,
  background: "rgba(240,253,244,0.9)",
  color: "#166534",
} satisfies React.CSSProperties;

const canceledChipStyle = {
  ...baseChipStyle,
  background: "rgba(241,245,249,0.9)",
  color: "#64748b",
} satisfies React.CSSProperties;

const noShowChipStyle = {
  ...baseChipStyle,
  background: "rgba(255,241,242,0.9)",
  color: "#9f1239",
} satisfies React.CSSProperties;

const viewNoteLinkStyle = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#9a3412",
  textDecoration: "none",
} satisfies React.CSSProperties;

const registerNoteLinkStyle = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#b45309",
  textDecoration: "none",
} satisfies React.CSSProperties;

// ─── Comunicacao group styles ──────────────────────────────────────────────────

const comunicacaoGroupStyle = {
  marginTop: "0.5rem",
  padding: "0.625rem 0.75rem",
  borderRadius: "10px",
  background: "rgba(240, 253, 244, 0.7)",
  border: "1px solid rgba(16, 185, 129, 0.15)",
  display: "grid",
  gap: "0.3rem",
} satisfies React.CSSProperties;

const comunicacaoGroupLabelStyle = {
  margin: 0,
  fontSize: "0.7rem",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "#065f46",
} satisfies React.CSSProperties;

const comunicacaoRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
} satisfies React.CSSProperties;

const comunicacaoItemLabelStyle = {
  fontSize: "0.78rem",
  color: "#44403c",
  minWidth: "7rem",
} satisfies React.CSSProperties;

const commLinkStyle = {
  fontSize: "0.78rem",
  color: "#9a3412",
  textDecoration: "none",
  fontWeight: 500,
  padding: "0.12rem 0.45rem",
  borderRadius: "6px",
  background: "rgba(255, 247, 237, 0.8)",
  border: "1px solid rgba(146, 64, 14, 0.2)",
} satisfies React.CSSProperties;
