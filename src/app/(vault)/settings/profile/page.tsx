import {
  SERVICE_MODE_OPTIONS,
  SETUP_STEP_IDS,
  SETUP_STEP_TITLES,
} from "../../../../lib/setup/constants";
import { getPracticeProfileSnapshot } from "../../../../lib/setup/profile";
import { buildSetupReadiness } from "../../../../lib/setup/readiness";
import {
  removeSignatureAssetAction,
  savePracticeProfileAction,
  saveSignatureAssetAction,
} from "../../setup/actions";
import { SignatureUpload } from "./components/signature-upload";
import { resolveSession } from "../../../../lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { MaskedInput } from "@/components/ui/masked-input";
import { SubmitButton } from "@/components/ui/submit-button";

const serviceModeLabels: Record<string, string> = {
  [SERVICE_MODE_OPTIONS.inPerson]: "Presencial",
  [SERVICE_MODE_OPTIONS.online]: "Online",
  [SERVICE_MODE_OPTIONS.hybrid]: "Híbrido",
};

export default async function ProfileSettingsPage() {
  const { accountId, workspaceId } = await resolveSession();
  const profile = await getPracticeProfileSnapshot(accountId, workspaceId);
  const readiness = buildSetupReadiness(profile);

  const supabase = await createClient();
  let signatureImageUrl: string | null = null;
  if (profile.signatureAsset?.storageKey) {
    const { data } = await supabase.storage
      .from("signatures")
      .createSignedUrl(profile.signatureAsset.storageKey, 3600);
    signatureImageUrl = data?.signedUrl ?? null;
  }

  return (
    <main style={shellStyle}>
      <section style={heroStyle}>
        <p style={eyebrowStyle}>Perfil profissional</p>
        <h1 style={titleStyle}>Identidade, padrões do consultório e assinatura em um só lugar.</h1>
        <p style={copyStyle}>
          Mantenha seu perfil atualizado para que documentos gerados carreguem os dados corretos.
        </p>
      </section>

      <section style={gridStyle}>
        <form action={savePracticeProfileAction} style={formCardStyle}>
          <div style={sectionHeadingStyle}>
            <p style={sectionEyebrowStyle}>{SETUP_STEP_TITLES.identity}</p>
            <h2 style={sectionTitleStyle}>Dados-base da profissional</h2>
          </div>

          <div style={fieldGridStyle}>
            <label style={labelStyle}>
              Nome profissional
              <input
                defaultValue={profile.fullName ?? ""}
                name="fullName"
                placeholder="Dra. Helena Prado"
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              CRP
              <MaskedInput
                mask="crp"
                defaultValue={profile.crp ?? ""}
                name="crp"
                placeholder="CRP 00/000000"
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              E-mail de contato
              <input
                defaultValue={profile.contactEmail ?? ""}
                name="contactEmail"
                placeholder="contato@consultorio.com.br"
                style={inputStyle}
                type="email"
              />
            </label>
            <label style={labelStyle}>
              Telefone
              <MaskedInput
                mask="phone"
                defaultValue={profile.contactPhone ?? ""}
                name="contactPhone"
                placeholder="(11) 99999-9999"
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Duração padrão da sessão
              <input
                defaultValue={profile.defaultAppointmentDurationMinutes ?? ""}
                min={1}
                name="defaultAppointmentDurationMinutes"
                style={inputStyle}
                type="number"
              />
            </label>
            <label style={labelStyle}>
              Valor padrão da sessão (R$)
              <input
                defaultValue={
                  profile.defaultSessionPriceInCents
                    ? profile.defaultSessionPriceInCents / 100
                    : ""
                }
                min={0.01}
                name="defaultSessionPriceInReais"
                step="0.01"
                style={inputStyle}
                type="number"
              />
            </label>
            <label style={labelStyle}>
              Linha teórica
              <input
                defaultValue={profile.theoreticalOrientation ?? ""}
                name="theoreticalOrientation"
                placeholder="Ex: Psicanálise"
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Pensador de preferência
              <select
                defaultValue={profile.preferredThinker ?? ""}
                name="preferredThinker"
                style={selectStyle}
              >
                <option value="">Selecione um pensador</option>
                <option value="Freud">Sigmund Freud</option>
                <option value="Lacan">Jacques Lacan</option>
                <option value="Winnicott">Donald Winnicott</option>
                <option value="Klein">Melanie Klein</option>
                <option value="Bion">Wilfred Bion</option>
              </select>
            </label>
          </div>

          <div style={modesSectionStyle}>
            <span style={labelCaptionStyle}>Modalidades atendidas</span>
            <div style={checkboxGridStyle}>
              {Object.values(SERVICE_MODE_OPTIONS).map((mode) => (
                <label key={mode} style={checkboxCardStyle}>
                  <input
                    defaultChecked={profile.serviceModes.includes(mode)}
                    name="serviceModes"
                    type="checkbox"
                    value={mode}
                  />
                  {serviceModeLabels[mode]}
                </label>
              ))}
            </div>
          </div>

          <SubmitButton label="Salvar perfil e padrões" />
        </form>

        <aside style={sidebarStyle}>
          <section style={sideCardStyle}>
            <p style={sectionEyebrowStyle}>
              {SETUP_STEP_TITLES[SETUP_STEP_IDS.signatureAsset]}
            </p>
            <h2 style={sectionTitleStyle}>Assinatura profissional</h2>
            <p style={sideCopyStyle}>
              Aparece no rodapé dos documentos clínicos gerados.
            </p>

            <SignatureUpload
              saveAction={saveSignatureAssetAction}
              removeAction={removeSignatureAssetAction}
              currentFileName={profile.signatureAsset?.fileName ?? null}
              currentImageUrl={signatureImageUrl}
              professionalName={profile.fullName ?? ""}
              crp={profile.crp ?? ""}
            />
          </section>

          <section style={sideCardStyle}>
            <p style={sectionEyebrowStyle}>Estado atual</p>
            <h2 style={sectionTitleStyle}>Resumo de prontidão</h2>
            <p style={sideCopyStyle}>
              {readiness.progressLabel} •{" "}
              {readiness.vaultReady ? "Vault pronto" : "Pendências obrigatórias abertas"}
            </p>
            <ul style={statusListStyle}>
              {readiness.steps.map((step) => {
                const done = step.status === "complete";
                return (
                  <li key={step.id} style={{ ...statusItemStyle, opacity: done ? 1 : 0.55 }}>
                    <span style={{ color: done ? "#047857" : "var(--color-text-3)", fontWeight: 600 }}>
                      {done ? "✓" : "✗"}
                    </span>
                    <span>{step.title}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>
      </section>
    </main>
  );
}

const shellStyle = {
  minHeight: "100vh",
  padding: "2rem 2.5rem",
  display: "grid",
  gap: "1.25rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const heroStyle = {
  width: "min(880px, 100%)",
  padding: "1.7rem 1.8rem",
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface-2)",
  border: "1px solid var(--color-border-med)",
  boxShadow: "0 22px 64px rgba(120, 53, 15, 0.1)",
} satisfies React.CSSProperties;

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(380px, 1fr)",
  gap: "1.5rem",
  alignItems: "start",
} satisfies React.CSSProperties;

const formCardStyle = {
  padding: "2rem",
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface-2)",
  border: "1px solid var(--color-border-med)",
  boxShadow: "0 22px 64px rgba(120, 53, 15, 0.1)",
  display: "grid",
  gap: "1.5rem",
} satisfies React.CSSProperties;

const sidebarStyle = {
  display: "grid",
  gap: "1.5rem",
} satisfies React.CSSProperties;

const sideCardStyle = {
  padding: "2rem",
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface-2)",
  border: "1px solid var(--color-border-med)",
  boxShadow: "0 22px 64px rgba(120, 53, 15, 0.1)",
  display: "grid",
  gap: "1.5rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  fontSize: "var(--font-size-label)",
  color: "var(--color-brown-mid)",
} satisfies React.CSSProperties;

const titleStyle = {
  marginBottom: "0.75rem",
  fontSize: "var(--font-size-page-title)",
  lineHeight: 1.2,
} satisfies React.CSSProperties;

const copyStyle = {
  marginTop: 0,
  maxWidth: "68ch",
  lineHeight: 1.6,
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const sectionHeadingStyle = {
  display: "grid",
  gap: "0.25rem",
} satisfies React.CSSProperties;

const sectionEyebrowStyle = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontSize: "var(--font-size-label)",
  color: "var(--color-accent)",
} satisfies React.CSSProperties;

const sectionTitleStyle = {
  margin: 0,
  fontSize: "1.35rem",
} satisfies React.CSSProperties;

const fieldGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "1rem",
} satisfies React.CSSProperties;

const labelStyle = {
  display: "grid",
  gap: "0.42rem",
  fontWeight: 600,
} satisfies React.CSSProperties;

const inputStyle = {
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-border-med)",
  padding: "0.9rem 1rem",
  background: "var(--color-surface-0)",
} satisfies React.CSSProperties;

const selectStyle = {
  ...inputStyle,
  appearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 1rem top 50%",
  backgroundSize: "0.65rem auto",
  paddingRight: "2.5rem",
} satisfies React.CSSProperties;

const modesSectionStyle = {
  display: "grid",
  gap: "0.6rem",
} satisfies React.CSSProperties;

const labelCaptionStyle = {
  fontWeight: 700,
} satisfies React.CSSProperties;

const checkboxGridStyle = {
  display: "grid",
  gap: "0.75rem",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
} satisfies React.CSSProperties;

const checkboxCardStyle = {
  display: "flex",
  gap: "0.55rem",
  alignItems: "center",
  padding: "0.85rem 0.95rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-0)",
  border: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

const sideCopyStyle = {
  margin: 0,
  lineHeight: 1.6,
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const signatureSummaryStyle = {
  padding: "0.9rem 1rem",
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface-0)",
  border: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

const metaCopyStyle = {
  marginBottom: 0,
  color: "var(--color-text-2)",
  lineHeight: 1.6,
} satisfies React.CSSProperties;

const statusListStyle = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "grid",
  gap: "0.45rem",
} satisfies React.CSSProperties;

const statusItemStyle = {
  display: "flex",
  gap: "0.5rem",
  color: "var(--color-text-2)",
  lineHeight: 1.5,
} satisfies React.CSSProperties;
