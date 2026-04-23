import type { SessionCharge } from "@/lib/finance/model";
import type { Patient } from "../domain-types";

interface TopPatientsSectionProps {
  enrichedCharges: SessionCharge[];
  patientIndex: Map<string, Patient>;
}

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const insightSectionStyle: React.CSSProperties = {
  padding: "1rem 1.25rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  display: "grid",
  gap: "0.75rem",
};

const insightContentStyle: React.CSSProperties = {
  display: "grid",
  gap: "0.5rem",
};

const topPatientRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.5rem 0",
  borderBottom: "1px solid var(--color-border)",
};

const topPatientRankStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#888",
  width: 20,
  textAlign: "center",
};

const topPatientNameStyle: React.CSSProperties = {
  flex: 1,
  fontSize: "0.85rem",
  fontWeight: 500,
  color: "#333",
};

const topPatientValueStyle: React.CSSProperties = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "var(--color-success-text)",
  fontVariantNumeric: "tabular-nums",
};

const topPatientSessionsStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#888",
};

export default async function TopPatientsSection({ enrichedCharges, patientIndex }: TopPatientsSectionProps) {
  const patientRevenue = new Map<string, { received: number; sessions: number; name: string }>();
  for (const charge of enrichedCharges) {
    if (!patientRevenue.has(charge.patientId)) {
      const patient = patientIndex.get(charge.patientId);
      patientRevenue.set(charge.patientId, {
        received: 0,
        sessions: 0,
        name: patient?.socialName ?? patient?.fullName ?? charge.patientId,
      });
    }
    const entry = patientRevenue.get(charge.patientId)!;
    entry.sessions++;
    if (charge.status === "pago" && charge.amountInCents) entry.received += charge.amountInCents / 100;
  }
  const topPatients = Array.from(patientRevenue.entries())
    .map(([, data]) => data)
    .sort((a, b) => b.received - a.received)
    .slice(0, 5);

  if (topPatients.length === 0) return null;

  return (
    <div className="vault-page-transition" style={insightSectionStyle}>
      <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "var(--color-accent)" }}>
        Top pacientes por receita
      </p>
      <div style={insightContentStyle}>
        {topPatients.map((p, i) => (
          <div key={i} style={topPatientRowStyle}>
            <span style={topPatientRankStyle}>{i + 1}</span>
            <span style={topPatientNameStyle}>{p.name}</span>
            <span style={topPatientValueStyle}>{currency.format(p.received)}</span>
            <span style={topPatientSessionsStyle}>
              {p.sessions} sess{p.sessions === 1 ? "ão" : "ões"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
