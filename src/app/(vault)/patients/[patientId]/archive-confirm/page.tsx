import { notFound, redirect } from "next/navigation";
import { getPatientRepository } from "../../../../../lib/patients/store";
import { getAppointmentRepository } from "../../../../../lib/appointments/store";
import { archivePatientAction } from "../../actions";
import { resolveSession } from "../../../../../lib/supabase/session";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

interface Props {
  params: Promise<{ patientId: string }>;
}

export default async function ArchiveConfirmPage({ params }: Props) {
  const { patientId } = await params;
  const { workspaceId } = await resolveSession();

  const patientRepo = getPatientRepository();
  const apptRepo = getAppointmentRepository();

  const patient = await patientRepo.findById(patientId, workspaceId);
  if (!patient) notFound();
  if (patient.archivedAt) redirect(`/patients/${patientId}`);

  const futureAppts = await apptRepo.listFutureActiveByPatient(patientId, workspaceId, new Date());

  return (
    <main style={mainStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Arquivar paciente</h1>
        <p style={subtitleStyle}>{patient.fullName}</p>

        {futureAppts.length > 0 ? (
          <>
            <p style={infoStyle}>
              Este paciente tem <strong>{futureAppts.length} sessão{futureAppts.length !== 1 ? "s" : ""} futura{futureAppts.length !== 1 ? "s" : ""}</strong> agendada{futureAppts.length !== 1 ? "s" : ""}:
            </p>

            <ul style={listStyle}>
              {futureAppts.map((appt) => (
                <li key={appt.id} style={listItemStyle}>
                  {appt.startsAt.toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}{" "}
                  às{" "}
                  {appt.startsAt.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" "}— {appt.careMode === "IN_PERSON" ? "Presencial" : "Online"}
                </li>
              ))}
            </ul>

            <div style={formsRowStyle}>
              <form action={archivePatientAction}>
                <input type="hidden" name="patientId" value={patientId} />
                <input type="hidden" name="cancelFutureSessions" value="true" />
                <FormSubmitButton
                  label="Cancelar todas e arquivar"
                  pendingLabel="Arquivando..."
                  style={dangerButtonStyle}
                />
              </form>

              <form action={archivePatientAction}>
                <input type="hidden" name="patientId" value={patientId} />
                <input type="hidden" name="cancelFutureSessions" value="false" />
                <FormSubmitButton
                  label="Manter sessões e arquivar"
                  pendingLabel="Arquivando..."
                  style={secondaryButtonStyle}
                />
              </form>
            </div>
          </>
        ) : (
          <>
            <p style={infoStyle}>Nenhuma sessão futura agendada.</p>
            <form action={archivePatientAction}>
              <input type="hidden" name="patientId" value={patientId} />
              <input type="hidden" name="cancelFutureSessions" value="false" />
              <FormSubmitButton
                label="Arquivar paciente"
                pendingLabel="Arquivando..."
                style={dangerButtonStyle}
              />
            </form>
          </>
        )}

        <a href={`/patients/${patientId}`} style={backLinkStyle}>
          Voltar
        </a>
      </div>
    </main>
  );
}

const mainStyle = {
  display: "flex",
  justifyContent: "center",
  padding: "3rem 1.5rem",
} satisfies React.CSSProperties;

const cardStyle = {
  width: "100%",
  maxWidth: "520px",
  display: "grid",
  gap: "1.25rem",
  padding: "2rem",
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  boxShadow: "var(--shadow-md)",
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "1.4rem",
  fontFamily: "var(--font-serif)",
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const subtitleStyle = {
  margin: 0,
  fontSize: "1rem",
  fontWeight: 600,
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const infoStyle = {
  margin: 0,
  fontSize: "0.95rem",
  color: "var(--color-text-2)",
  lineHeight: 1.6,
} satisfies React.CSSProperties;

const listStyle = {
  margin: 0,
  padding: "0 0 0 1.25rem",
  display: "grid",
  gap: "0.35rem",
} satisfies React.CSSProperties;

const listItemStyle = {
  fontSize: "0.9rem",
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const formsRowStyle = {
  display: "flex",
  gap: "0.75rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const baseBtnStyle = {
  padding: "0.6rem 1.1rem",
  borderRadius: "var(--radius-md)",
  border: "1px solid",
  fontWeight: 600,
  fontSize: "0.9rem",
  cursor: "pointer",
  fontFamily: "inherit",
} satisfies React.CSSProperties;

const dangerButtonStyle = {
  ...baseBtnStyle,
  background: "transparent",
  color: "var(--color-rose)",
  borderColor: "rgba(159, 18, 57, 0.3)",
} satisfies React.CSSProperties;

const secondaryButtonStyle = {
  ...baseBtnStyle,
  background: "transparent",
  color: "var(--color-text-2)",
  borderColor: "var(--color-border-med)",
} satisfies React.CSSProperties;

const backLinkStyle = {
  fontSize: "0.9rem",
  color: "var(--color-text-3)",
  textDecoration: "none",
} satisfies React.CSSProperties;
