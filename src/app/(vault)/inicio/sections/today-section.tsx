import { getAppointmentRepository } from "@/lib/appointments/store";
import { getPatientRepository } from "@/lib/patients/store";
import { filterTodayAppointments } from "@/lib/dashboard/aggregation";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { List, ListItem, ListEmpty } from "@/components/ui/list";
import { Badge } from "@/components/ui/badge";

interface TodaySectionProps {
  workspaceId: string;
}

const sessionCardInnerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-3)",
  gridTemplateColumns: "unset",
};

const sessionTimeStyle: React.CSSProperties = {
  fontSize: "var(--font-size-body)",
  fontWeight: 700,
  color: "var(--color-accent)",
  minWidth: "3.5rem",
  fontVariantNumeric: "tabular-nums",
};

const sessionPatientStyle: React.CSSProperties = {
  fontSize: "var(--font-size-body-sm)",
  fontWeight: 500,
  color: "var(--color-text-1)",
  flex: 1,
};

export default async function TodaySection({ workspaceId }: TodaySectionProps) {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);

  const [rawAppointments, activePatients, archivedPatients] = await Promise.all([
    getAppointmentRepository().listByDateRange(workspaceId, from, to),
    getPatientRepository().listActive(workspaceId),
    getPatientRepository().listArchived(workspaceId),
  ]);

  const todayAppointments = filterTodayAppointments(rawAppointments, from);

  const patientMap = new Map<string, string>();
  for (const p of [...activePatients, ...archivedPatients]) {
    patientMap.set(p.id, p.socialName ? `${p.fullName} (${p.socialName})` : p.fullName);
  }

  const nextAppt = todayAppointments
    .filter((a) => ["SCHEDULED", "CONFIRMED"].includes(a.status))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0];

  const minutesUntilNext = nextAppt
    ? Math.floor((new Date(nextAppt.startsAt).getTime() - now.getTime()) / 60000)
    : null;

  const contextualMessage =
    minutesUntilNext !== null && minutesUntilNext > 0 && minutesUntilNext <= 60
      ? `Seu próximo atendimento começa em ${minutesUntilNext} min`
      : `${todayAppointments.length > 0 ? `${todayAppointments.length} atendimentos` : "Nenhum atendimento"} agendados para hoje`;

  const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  const careModeLabel = (mode: string) => (mode === "ONLINE" ? "Online" : "Presencial");

  return (
    <div className="vault-page-transition">
      <PageHeader title="Início" description={contextualMessage} />
      <Section
        title="Hoje"
        action={
          <a href="/agenda" className="link-subtle" style={{ fontSize: "var(--font-size-sm)" }}>
            Ver agenda completa →
          </a>
        }
      >
        {todayAppointments.length === 0 ? (
          <ListEmpty title="Sem atendimentos hoje." actionLabel="Agendar consulta" actionHref="/appointments/new" />
        ) : (
          <List variant="separated">
            {todayAppointments.map((appt) => (
              <ListItem key={appt.id} divider={false}>
                <Card variant="interactive" padding="sm" style={sessionCardInnerStyle}>
                  <span style={sessionTimeStyle}>{timeFormatter.format(appt.startsAt)}</span>
                  <span style={sessionPatientStyle}>{patientMap.get(appt.patientId) ?? "Paciente"}</span>
                  <Badge variant="neutral" size="sm">{careModeLabel(appt.careMode)}</Badge>
                </Card>
              </ListItem>
            ))}
          </List>
        )}
      </Section>
    </div>
  );
}
