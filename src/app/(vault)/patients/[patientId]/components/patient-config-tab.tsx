"use client";

/**
 * PatientConfigTab — "Configurações" tab content.
 * Shows: edit form, important observations, export section.
 */

import type { Patient } from "@/lib/patients/model";
import { PatientForm } from "../../components/patient-form";
import { ExportSection } from "./export-section";

interface PatientConfigTabProps {
  patient: Patient;
  patientName: string;
}

export function PatientConfigTab({ patient, patientName }: PatientConfigTabProps) {
  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <section style={{ display: "grid", gap: "0.75rem" }}>
        <div style={{ display: "grid", gap: "0.25rem" }}>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.7rem", color: "var(--color-brown-mid)", fontWeight: 600 }}>
            Dados do paciente
          </p>
          <h2 style={{ margin: 0, fontSize: "1.4rem" }}>Editar informações</h2>
        </div>
        <PatientForm patient={patient} />
      </section>

      {patient.importantObservations && (
        <section style={{
          padding: "1.35rem 1.5rem",
          borderRadius: "22px",
          background: "rgba(255, 247, 237, 0.9)",
          border: "1px solid rgba(146, 64, 14, 0.16)",
          display: "grid",
          gap: "0.5rem",
        }}>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.7rem", color: "var(--color-brown-mid)", fontWeight: 600 }}>
            Somente neste perfil
          </p>
          <h2 style={{ margin: 0, fontSize: "1.15rem" }}>Observações importantes</h2>
          <p style={{ margin: 0, lineHeight: 1.7, color: "#44403c", whiteSpace: "pre-wrap" }}>
            {patient.importantObservations}
          </p>
        </section>
      )}

      <ExportSection patientId={patient.id} patientName={patientName} />
    </div>
  );
}
