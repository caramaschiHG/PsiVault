import { getFinanceRepository } from "@/lib/finance/store";
import { getPatientRepository } from "@/lib/patients/store";
import { getAppointmentRepository } from "@/lib/appointments/store";
import { autoMarkOverdue } from "@/lib/finance/model";
import { Section } from "@/components/ui/section";
import { List, ListItem } from "@/components/ui/list";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";

interface PendingChargesSectionProps {
  workspaceId: string;
}

const chargeItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-3)",
  flexWrap: "wrap",
};

const chargePatientStyle: React.CSSProperties = {
  fontSize: "var(--font-size-body-sm)",
  fontWeight: 500,
  color: "var(--color-text-1)",
  flex: 1,
};

const chargeAmountStyle: React.CSSProperties = {
  fontSize: "var(--font-size-body-sm)",
  fontWeight: 600,
  color: "var(--color-text-2)",
  fontVariantNumeric: "tabular-nums",
};

export default async function PendingChargesSection({ workspaceId }: PendingChargesSectionProps) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;

  const monthlyCharges = await getFinanceRepository().listByWorkspaceAndMonth(workspaceId, year, month);
  const pendingOverdueCharges = monthlyCharges.filter((c) => c.status === "pendente" || c.status === "atrasado");

  const pendingApptIds = pendingOverdueCharges
    .filter((c) => c.appointmentId)
    .map((c) => c.appointmentId as string);

  let pendingApptMap = new Map<string, Date>();
  if (pendingApptIds.length > 0) {
    const appts = await db.appointment.findMany({
      where: { id: { in: pendingApptIds } },
      select: { id: true, startsAt: true },
    });
    pendingApptMap = new Map(appts.map((a) => [a.id, a.startsAt]));
  }

  const enrichedPendingOverdue = autoMarkOverdue(pendingOverdueCharges, pendingApptMap, now)
    .filter((c) => c.status === "pendente" || c.status === "atrasado")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3);

  const patients = await getPatientRepository().listActive(workspaceId);
  const patientNameMap = new Map<string, string>(patients.map((p) => [p.id, p.socialName ?? p.fullName]));

  const currencyFmt = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const statusLabel = (s: string) => (s === "atrasado" ? "Atrasado" : "Pendente");

  return (
    <div className="vault-page-transition">
      <Section
        title="A receber"
        action={
          <a href="/financeiro" className="link-subtle" style={{ fontSize: "var(--font-size-sm)" }}>
            Ver financeiro →
          </a>
        }
      >
        {enrichedPendingOverdue.length === 0 ? (
          <p style={{ color: "var(--color-text-3)", fontSize: "var(--font-size-sm)", margin: 0, padding: "var(--space-4) 0" }}>
            Nenhuma cobrança pendente
          </p>
        ) : (
          <List variant="separated">
            {enrichedPendingOverdue.map((charge, idx) => (
              <ListItem key={charge.id} divider={idx < enrichedPendingOverdue.length - 1}>
                <div style={chargeItemStyle}>
                  <Badge variant={charge.status === "atrasado" ? "danger" : "warning"} size="sm" dot>
                    {statusLabel(charge.status)}
                  </Badge>
                  <span style={chargePatientStyle}>{patientNameMap.get(charge.patientId) ?? "Paciente"}</span>
                  <span style={chargeAmountStyle}>
                    {charge.amountInCents !== null ? currencyFmt.format(charge.amountInCents / 100) : "—"}
                  </span>
                </div>
              </ListItem>
            ))}
          </List>
        )}
      </Section>
    </div>
  );
}
