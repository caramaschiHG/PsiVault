/**
 * Active patients list — privacy-safe.
 *
 * Refatorado com componentes UI unificados (Phase 4 — UI/UX Polish).
 * Usa: PageHeader, Section, List, ListItem, ListEmpty.
 */

import Link from "next/link";
import { getPatientRepository } from "../../../lib/patients/store";
import { PatientForm } from "./components/patient-form";
import { EmptyState } from "../components/empty-state";
import { resolveSession } from "../../../lib/supabase/session";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { List, ListItem, ListEmpty } from "@/components/ui/list";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function PatientsPage() {
  const { workspaceId } = await resolveSession();
  const repo = getPatientRepository();
  const patients = await repo.listActive(workspaceId);

  return (
    <main style={shellStyle}>
      {/* Page heading */}
      <PageHeader
        title="Pacientes"
        description={
          patients.length === 0
            ? "Nenhum paciente ativo ainda."
            : `${patients.length} paciente${patients.length > 1 ? "s" : ""} ativo${patients.length > 1 ? "s" : ""}.`
        }
        actions={
          <Link href="/patients/archive" className="btn-secondary">
            Ver arquivo
          </Link>
        }
      />

      {/* Patient list */}
      <Section title="">
        {patients.length === 0 ? (
          <ListEmpty
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            }
            title="Nenhum paciente ainda"
            description="Comece adicionando o primeiro paciente ao sistema."
            actionLabel="Adicionar paciente"
            actionHref="#form"
          />
        ) : (
          <List variant="bordered" aria-label="Lista de pacientes ativos">
            {patients.map((patient) => (
              <ListItem key={patient.id} href={`/patients/${patient.id}`}>
                <div style={patientContentStyle}>
                  <div>
                    <strong style={patientNameStyle}>{patient.fullName}</strong>
                    {patient.socialName && (
                      <span style={socialNameStyle}> ({patient.socialName})</span>
                    )}
                  </div>
                  {(patient.email || patient.phone) && (
                    <p style={patientMetaStyle}>
                      {[patient.email, patient.phone].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </ListItem>
            ))}
          </List>
        )}
      </Section>

      {/* FAB mobile */}
      <a
        href="#form"
        className="fab-mobile"
        style={{
          position: "fixed",
          bottom: "5.5rem",
          right: "1.5rem",
          width: "3.5rem",
          height: "3.5rem",
          borderRadius: "50%",
          backgroundColor: "var(--color-accent)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow-lg)",
          fontSize: "1.5rem",
          textDecoration: "none",
          zIndex: "var(--z-dropdown)",
        } satisfies React.CSSProperties}
        aria-label="Adicionar paciente"
      >
        +
      </a>

      {/* Form section */}
      <Separator />
      <Section
        title="Cadastrar paciente"
        variant="plain"
      >
        <PatientForm />
      </Section>
    </main>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const shellStyle: React.CSSProperties = {
  padding: "var(--space-page-padding-y) var(--space-page-padding-x)",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "var(--space-6)",
  alignContent: "start",
};

const patientContentStyle: React.CSSProperties = {
  display: "grid",
  gap: "var(--space-1)",
};

const patientNameStyle: React.CSSProperties = {
  fontSize: "var(--font-size-body)",
  color: "var(--color-text-1)",
};

const socialNameStyle: React.CSSProperties = {
  fontWeight: 400,
  color: "var(--color-text-3)",
  fontSize: "var(--font-size-body-sm)",
};

const patientMetaStyle: React.CSSProperties = {
  margin: "var(--space-1) 0 0",
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-3)",
  lineHeight: "var(--line-height-base)",
};
