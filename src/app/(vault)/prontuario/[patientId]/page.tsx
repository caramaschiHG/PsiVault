import { notFound } from "next/navigation";
import Link from "next/link";
import { getPatientRepository } from "@/lib/patients/store";
import { getAppointmentRepository } from "@/lib/appointments/store";
import { getClinicalNoteRepository } from "@/lib/clinical/store";
import { getDocumentRepository } from "@/lib/documents/store";
import { resolveSession } from "@/lib/supabase/session";
import { EmptyState } from "@/app/(vault)/components/empty-state";
import { buildTimeline, buildNotesByAppointment } from "./timeline";

const DOC_LABELS: Record<string, string> = {
  session_note: "Nota de sessão",
  session_record: "Registro de sessão",
  receipt: "Recibo",
  declaration: "Declaração",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

function serviceLabel(mode: "IN_PERSON" | "ONLINE" | "HYBRID"): string {
  return mode === "ONLINE" ? "Online" : "Presencial";
}

export default async function ProntuarioPatientPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const { workspaceId } = await resolveSession();

  const [patient, appointments, notes, documents] = await Promise.all([
    getPatientRepository().findById(patientId, workspaceId),
    getAppointmentRepository().listByPatient(patientId, workspaceId),
    getClinicalNoteRepository().listByPatient(patientId, workspaceId),
    getDocumentRepository().listActiveByPatient(patientId, workspaceId),
  ]);

  if (!patient) {
    notFound();
  }

  const timeline = buildTimeline(appointments, new Date());
  const notesByAppointment = buildNotesByAppointment(notes);
  const sortedDocuments = [...documents].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const { upcoming, completedVisible, completedHidden, dismissedAll } = timeline;
  const isEmpty = !upcoming && completedVisible.length === 0;

  return (
    <main style={shellStyle}>
      {/* Breadcrumb */}
      <nav style={breadcrumbStyle} aria-label="Localização">
        <Link href="/prontuario" style={breadcrumbLinkStyle}>
          Prontuário
        </Link>
        <span style={breadcrumbSepStyle} aria-hidden="true">
          →
        </span>
        <span style={breadcrumbCurrentStyle}>{patient.fullName}</span>
      </nav>

      {/* Cabeçalho do paciente */}
      <header style={headerStyle}>
        <h1 style={h1Style}>{patient.fullName}</h1>
        {patient.socialName && (
          <p style={socialNameStyle}>Conhecido como {patient.socialName}</p>
        )}
        <Link href={`/patients/${patientId}`} style={cadastralLinkStyle}>
          Dados cadastrais
        </Link>
      </header>

      {/* Histórico de atendimentos */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Histórico de atendimentos</h2>
        <hr style={hrStyle} />

        {/* Próximo atendimento */}
        {upcoming && (
          <div style={upcomingEntryStyle}>
            <span style={proximaTagStyle}>Próxima</span>
            <span style={entryDateStyle}>{formatDate(upcoming.startsAt)}</span>
            <span style={entryMetaStyle}>{serviceLabel(upcoming.careMode)}</span>
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <EmptyState
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
            }
            title="Nenhum atendimento registrado"
            description="Agende o primeiro atendimento para iniciar o acompanhamento."
            actionLabel="Agendar atendimento"
            actionHref={`/agenda/new?patientId=${patientId}`}
          />
        )}

        {/* Atendimentos concluídos visíveis */}
        {completedVisible.map((appt, idx) => {
          const note = notesByAppointment.get(appt.id);
          return (
            <div key={appt.id} style={entryStyle}>
              <div style={entryLeftStyle}>
                <span style={entryDateStyle}>{formatDate(appt.startsAt)}</span>
                <span style={entryNameStyle}>Atendimento {idx + 1}</span>
                <span style={entryMetaStyle}>{serviceLabel(appt.careMode)}</span>
              </div>
              {note && (
                <Link href={`/sessions/${appt.id}/note`} style={noteLinkStyle}>
                  Ver nota
                </Link>
              )}
            </div>
          );
        })}

        {/* Atendimentos concluídos ocultos */}
        {completedHidden.length > 0 && (
          <details style={detailsStyle}>
            <summary style={summaryStyle}>
              Ver mais ({completedHidden.length} atendimento
              {completedHidden.length !== 1 ? "s" : ""})
            </summary>
            <div style={detailsBodyStyle}>
              {completedHidden.map((appt, idx) => {
                const note = notesByAppointment.get(appt.id);
                const sessionNum = completedVisible.length + idx + 1;
                return (
                  <div key={appt.id} style={entryStyle}>
                    <div style={entryLeftStyle}>
                      <span style={entryDateStyle}>{formatDate(appt.startsAt)}</span>
                      <span style={entryNameStyle}>Atendimento {sessionNum}</span>
                      <span style={entryMetaStyle}>{serviceLabel(appt.careMode)}</span>
                    </div>
                    {note && (
                      <Link href={`/sessions/${appt.id}/note`} style={noteLinkStyle}>
                        Ver nota
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </details>
        )}

        {/* Dispensados */}
        {dismissedAll.length > 0 && (
          <details style={detailsStyle}>
            <summary style={summaryStyle}>
              {dismissedAll.length} atendimento
              {dismissedAll.length !== 1 ? "s" : ""} dispensado
              {dismissedAll.length !== 1 ? "s" : ""}
            </summary>
            <div style={detailsBodyStyle}>
              {dismissedAll.map((appt) => (
                <div key={appt.id} style={dismissedEntryStyle}>
                  <span style={entryDateStyle}>{formatDate(appt.startsAt)}</span>
                  <span style={entryMetaStyle}>
                    {appt.status === "CANCELED" ? "Cancelado" : "Não compareceu"}
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}
      </section>

      {/* Documentos clínicos */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Documentos clínicos</h2>
        <hr style={hrStyle} />

        {sortedDocuments.length === 0 ? (
          <p style={emptyDocStyle}>Nenhum documento gerado neste acompanhamento.</p>
        ) : (
          <ul style={docListStyle}>
            {sortedDocuments.map((doc) => (
              <li key={doc.id} style={docItemStyle}>
                <div style={docLeftStyle}>
                  <span style={docTypeStyle}>
                    {DOC_LABELS[doc.type] ?? doc.type}
                  </span>
                  <span style={docDateStyle}>{formatDate(doc.createdAt)}</span>
                </div>
                <Link href={`/patients/${patientId}/documents/${doc.id}`} style={noteLinkStyle}>
                  Visualizar
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

const shellStyle = {
  padding: "2rem 2.5rem",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "2rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const breadcrumbStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  fontSize: "0.8125rem",
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;

const breadcrumbLinkStyle = {
  color: "var(--color-accent)",
  textDecoration: "none",
} satisfies React.CSSProperties;

const breadcrumbSepStyle = {
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;

const breadcrumbCurrentStyle = {
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const headerStyle = {
  display: "grid",
  gap: "0.375rem",
} satisfies React.CSSProperties;

const h1Style = {
  fontFamily: "var(--font-serif)",
  fontSize: "var(--font-size-page-title)",
  fontWeight: 700,
  color: "var(--color-text-1)",
  margin: 0,
  lineHeight: 1.15,
} satisfies React.CSSProperties;

const socialNameStyle = {
  fontSize: "var(--font-size-meta)",
  color: "var(--color-text-3)",
  margin: 0,
} satisfies React.CSSProperties;

const cadastralLinkStyle = {
  fontSize: "0.8125rem",
  color: "var(--color-accent)",
  textDecoration: "none",
  marginTop: "0.25rem",
  width: "fit-content",
} satisfies React.CSSProperties;

const sectionStyle = {
  display: "grid",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const h2Style = {
  fontSize: "var(--font-size-body)",
  fontWeight: 600,
  color: "var(--color-text-1)",
  margin: 0,
} satisfies React.CSSProperties;

const hrStyle = {
  border: "none",
  borderTop: "1px solid var(--color-border)",
  margin: 0,
} satisfies React.CSSProperties;

const upcomingEntryStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem 0",
  borderBottom: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

const proximaTagStyle = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--color-brown-mid)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
} satisfies React.CSSProperties;

const entryStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.75rem 0",
  borderBottom: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

const entryLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const entryDateStyle = {
  fontSize: "var(--font-size-meta)",
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const entryNameStyle = {
  fontSize: "var(--font-size-meta)",
  color: "var(--color-text-1)",
  fontWeight: 500,
} satisfies React.CSSProperties;

const entryMetaStyle = {
  fontSize: "var(--font-size-meta)",
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;

const noteLinkStyle = {
  fontSize: "0.8125rem",
  color: "var(--color-accent)",
  textDecoration: "none",
  flexShrink: 0,
} satisfies React.CSSProperties;

const detailsStyle = {
  borderBottom: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

const summaryStyle = {
  fontSize: "var(--font-size-meta)",
  color: "var(--color-text-3)",
  cursor: "pointer",
  padding: "0.75rem 0",
  listStyle: "none",
} satisfies React.CSSProperties;

const detailsBodyStyle = {
  display: "grid",
  paddingBottom: "0.5rem",
} satisfies React.CSSProperties;

const dismissedEntryStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.5rem 0",
  borderBottom: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

const emptyDocStyle = {
  fontSize: "var(--font-size-meta)",
  color: "var(--color-text-3)",
  margin: 0,
} satisfies React.CSSProperties;

const docListStyle = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "grid",
  gap: 0,
} satisfies React.CSSProperties;

const docItemStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.75rem 0",
  borderBottom: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

const docLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const docTypeStyle = {
  fontSize: "var(--font-size-meta)",
  color: "var(--color-text-1)",
  fontWeight: 500,
} satisfies React.CSSProperties;

const docDateStyle = {
  fontSize: "var(--font-size-meta)",
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;
