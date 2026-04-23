import { getPatientRepository } from "@/lib/patients/store";
import { getFinanceRepository } from "@/lib/finance/store";
import { getAppointmentRepository } from "@/lib/appointments/store";
import { deriveMonthlySnapshot, countPendingCharges } from "@/lib/dashboard/aggregation";
import { Section } from "@/components/ui/section";
import { StatCard } from "@/components/ui/stat-card";

interface SnapshotSectionProps {
  workspaceId: string;
}

const snapshotGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "var(--space-3)",
};

export default async function SnapshotSection({ workspaceId }: SnapshotSectionProps) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const monthFrom = new Date(Date.UTC(year, month - 1, 1));
  const monthTo = new Date(Date.UTC(year, month, 1));

  const [activePatients, archivedPatients, monthlyCharges, monthlyAppointments] = await Promise.all([
    getPatientRepository().listActive(workspaceId),
    getPatientRepository().listArchived(workspaceId),
    getFinanceRepository().listByWorkspaceAndMonth(workspaceId, year, month),
    getAppointmentRepository().listByDateRange(workspaceId, monthFrom, monthTo),
  ]);

  const snapshot = deriveMonthlySnapshot({ activePatients, monthlyCharges, monthlyAppointments });
  const pendingChargeCount = countPendingCharges(monthlyCharges);

  return (
    <div className="vault-page-transition">
      <Section title="Resumo do mês">
        <div style={snapshotGridStyle}>
          <StatCard label="Pacientes ativos" value={snapshot.activePatientCount} />
          <StatCard label="Atendimentos realizados" value={snapshot.completedSessionCount} />
          <StatCard label="A receber" value={pendingChargeCount} accent href="/financeiro" />
        </div>
      </Section>
    </div>
  );
}
