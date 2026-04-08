"use client";

/**
 * PatientForm — essentials-first intake and edit form.
 *
 * Progressive disclosure:
 * - Core identity (fullName) is always visible.
 * - Contact fields (email, phone) follow immediately.
 * - Secondary sections (social name, guardian, emergency contact,
 *   important observations) are present in the DOM but visually
 *   separated as optional context — not hidden behind JS toggles
 *   so the form remains accessible and server-renderable.
 *
 * Important observations are scoped to this form only and must not
 * appear in list views or agenda surfaces.
 */

import type { Patient } from "../../../../lib/patients/model";
import { createPatientAction, updatePatientAction } from "../actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { MaskedInput } from "@/components/ui/masked-input";

interface PatientFormProps {
  patient?: Patient;
}

export function PatientForm({ patient }: PatientFormProps) {
  const isEdit = Boolean(patient);
  const action = isEdit ? updatePatientAction : createPatientAction;

  return (
    <form action={action} style={formStyle}>
      {isEdit && (
        <input name="patientId" type="hidden" value={patient!.id} />
      )}

      {/* Section 1: Core identity */}
      <section style={sectionStyle}>
        <div style={sectionHeadingStyle}>
          <p style={eyebrowStyle}>Essenciais</p>
          <h2 style={sectionTitleStyle}>Identidade</h2>
        </div>

        <div className="form-grid">
          <label style={labelStyle}>
            Nome completo <span style={requiredMarkStyle}>*</span>
            <input
              defaultValue={patient?.fullName ?? ""}
              name="fullName"
              placeholder="Ana Clara Silva"
              required
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            E-mail
            <input
              defaultValue={patient?.email ?? ""}
              name="email"
              placeholder="ana@example.com"
              style={inputStyle}
              type="email"
            />
          </label>

          <label style={labelStyle}>
            Telefone
            <MaskedInput
              mask="phone"
              defaultValue={patient?.phone ?? ""}
              name="phone"
              placeholder="(11) 91234-5678"
              style={inputStyle}
            />
          </label>
        </div>
      </section>

      {/* Section 2: Social name — secondary context when present */}
      <section style={sectionStyle}>
        <div style={sectionHeadingStyle}>
          <p style={eyebrowStyle}>Opcional</p>
          <h2 style={sectionTitleStyle}>Nome social</h2>
          <p style={sectionCopyStyle}>
            Preencha somente quando o paciente usa um nome social diferente do nome civil.
            O nome completo continua sendo o campo principal.
          </p>
        </div>

        <label style={labelStyle}>
          Nome social
          <input
            defaultValue={patient?.socialName ?? ""}
            name="socialName"
            placeholder="Carol"
            style={inputStyle}
          />
        </label>
      </section>

      {/* Section 3: Guardian — relevant for minors or caregiver contexts */}
      <section style={sectionStyle}>
        <div style={sectionHeadingStyle}>
          <p style={eyebrowStyle}>Opcional</p>
          <h2 style={sectionTitleStyle}>Responsável</h2>
          <p style={sectionCopyStyle}>
            Preencha quando o paciente for menor de idade ou tiver um responsável legal.
          </p>
        </div>

        <div className="form-grid">
          <label style={labelStyle}>
            Nome do responsável
            <input
              defaultValue={patient?.guardianName ?? ""}
              name="guardianName"
              placeholder="Maria Santos"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Telefone do responsável
            <MaskedInput
              mask="phone"
              defaultValue={patient?.guardianPhone ?? ""}
              name="guardianPhone"
              placeholder="(11) 98765-4321"
              style={inputStyle}
            />
          </label>
        </div>
      </section>

      {/* Section 4: Emergency contact */}
      <section style={sectionStyle}>
        <div style={sectionHeadingStyle}>
          <p style={eyebrowStyle}>Opcional</p>
          <h2 style={sectionTitleStyle}>Contato de emergência</h2>
        </div>

        <div className="form-grid">
          <label style={labelStyle}>
            Nome
            <input
              defaultValue={patient?.emergencyContactName ?? ""}
              name="emergencyContactName"
              placeholder="Lucia Alves"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Telefone
            <MaskedInput
              mask="phone"
              defaultValue={patient?.emergencyContactPhone ?? ""}
              name="emergencyContactPhone"
              placeholder="(11) 97654-3210"
              style={inputStyle}
            />
          </label>
        </div>
      </section>

      {/* Section 5: Important observations — profile-only */}
      <section style={sectionStyle}>
        <div style={sectionHeadingStyle}>
          <p style={eyebrowStyle}>Somente neste perfil</p>
          <h2 style={sectionTitleStyle}>Observações importantes</h2>
          <p style={sectionCopyStyle}>
            Estas informações ficam visíveis apenas aqui. Elas não aparecem na agenda,
            em listas ou em outras superfícies do vault.
          </p>
        </div>

        <label style={labelStyle}>
          Observações
          <textarea
            defaultValue={patient?.importantObservations ?? ""}
            name="importantObservations"
            placeholder="Anotações relevantes para o atendimento..."
            rows={4}
            style={textareaStyle}
          />
        </label>
      </section>

      <div style={actionsStyle}>
        <SubmitButton
          label={isEdit ? "Salvar alterações" : "Criar paciente"}
        />
      </div>
    </form>
  );
}

const formStyle = {
  display: "grid",
  gap: "1.5rem",
} satisfies React.CSSProperties;

const sectionStyle = {
  display: "grid",
  gap: "1rem",
  padding: "1.5rem",
  borderRadius: "24px",
  background: "rgba(255, 252, 247, 0.92)",
  border: "1px solid rgba(146, 64, 14, 0.14)",
  boxShadow: "0 8px 24px rgba(120, 53, 15, 0.06)",
} satisfies React.CSSProperties;

const sectionHeadingStyle = {
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

const sectionTitleStyle = {
  margin: 0,
  fontSize: "1.25rem",
} satisfies React.CSSProperties;

const sectionCopyStyle = {
  margin: 0,
  fontSize: "0.9rem",
  lineHeight: 1.6,
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;

const labelStyle = {
  display: "grid",
  gap: "0.42rem",
  fontWeight: 600,
  fontSize: "0.93rem",
} satisfies React.CSSProperties;

const requiredMarkStyle = {
  color: "#9a3412",
} satisfies React.CSSProperties;

const inputStyle = {
  borderRadius: "16px",
  border: "1px solid rgba(120, 53, 15, 0.16)",
  padding: "0.9rem 1rem",
  background: "#fffdfa",
  fontWeight: 400,
} satisfies React.CSSProperties;

const textareaStyle = {
  ...inputStyle,
  resize: "vertical" as const,
  lineHeight: 1.6,
} satisfies React.CSSProperties;

const actionsStyle = {
  display: "flex",
  gap: "0.75rem",
} satisfies React.CSSProperties;
