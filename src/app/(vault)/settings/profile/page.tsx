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

const serviceModeLabels: Record<string, string> = {
  [SERVICE_MODE_OPTIONS.inPerson]: "Presencial",
  [SERVICE_MODE_OPTIONS.online]: "Online",
  [SERVICE_MODE_OPTIONS.hybrid]: "Híbrido",
};

export default function ProfileSettingsPage() {
  const profile = getPracticeProfileSnapshot();
  const readiness = buildSetupReadiness(profile);

  return (
    <main style={shellStyle}>
      <section style={heroStyle}>
        <p style={eyebrowStyle}>Perfil profissional</p>
        <h1 style={titleStyle}>Identidade, padrões do consultório e assinatura em um só lugar.</h1>
        <p style={copyStyle}>
          Este formulário reúne os dados que o setup hub usa para decidir a
          prontidão do vault e que as próximas fases vão reutilizar em agenda,
          documentos e histórico operacional.
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
              <input
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
              <input
                defaultValue={profile.contactPhone ?? ""}
                name="contactPhone"
                placeholder="+55 11 99999-9999"
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
              Valor padrão em centavos
              <input
                defaultValue={profile.defaultSessionPriceInCents ?? ""}
                min={1}
                name="defaultSessionPriceInCents"
                style={inputStyle}
                type="number"
              />
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

          <button style={buttonStyle} type="submit">
            Salvar perfil e padrões
          </button>
        </form>

        <aside style={sidebarStyle}>
          <section style={sideCardStyle}>
            <p style={sectionEyebrowStyle}>
              {SETUP_STEP_TITLES[SETUP_STEP_IDS.signatureAsset]}
            </p>
            <h2 style={sectionTitleStyle}>Assinatura profissional</h2>
            <p style={sideCopyStyle}>
              Opcional agora, mas pronta para reaproveitamento quando os fluxos
              de documentos entrarem no produto.
            </p>

            <form action={saveSignatureAssetAction} style={miniFormStyle}>
              <label style={labelStyle}>
                Nome do arquivo
                <input
                  defaultValue={profile.signatureAsset?.fileName ?? "assinatura-helena.png"}
                  name="fileName"
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                MIME type
                <input
                  defaultValue={profile.signatureAsset?.mimeType ?? "image/png"}
                  name="mimeType"
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Tamanho em bytes
                <input
                  defaultValue={profile.signatureAsset?.fileSize ?? 4200}
                  min={1}
                  name="fileSize"
                  style={inputStyle}
                  type="number"
                />
              </label>
              <button style={buttonStyle} type="submit">
                {profile.signatureAsset ? "Substituir assinatura" : "Salvar assinatura"}
              </button>
            </form>

            <form action={removeSignatureAssetAction}>
              <button style={secondaryButtonStyle} type="submit">
                Remover assinatura salva
              </button>
            </form>

            <div style={signatureSummaryStyle}>
              <strong>
                {profile.signatureAsset
                  ? profile.signatureAsset.fileName
                  : "Nenhuma assinatura armazenada ainda"}
              </strong>
              <p style={metaCopyStyle}>
                {profile.signatureAsset
                  ? `${profile.signatureAsset.mimeType} • ${profile.signatureAsset.storageKey}`
                  : "O vault continua funcional sem esse ativo nesta fase."}
              </p>
            </div>
          </section>

          <section style={sideCardStyle}>
            <p style={sectionEyebrowStyle}>Estado atual</p>
            <h2 style={sectionTitleStyle}>Resumo de prontidão</h2>
            <p style={sideCopyStyle}>
              {readiness.progressLabel} •{" "}
              {readiness.vaultReady ? "Vault pronto" : "Pendências obrigatórias abertas"}
            </p>
            <ul style={statusListStyle}>
              {readiness.steps.map((step) => (
                <li key={step.id}>
                  {step.title}: {step.status}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </section>
    </main>
  );
}

const shellStyle = {
  minHeight: "100vh",
  padding: "2rem",
  display: "grid",
  gap: "1.25rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const heroStyle = {
  maxWidth: "980px",
  padding: "1.7rem 1.8rem",
  borderRadius: "28px",
  background: "rgba(255, 252, 247, 0.92)",
  border: "1px solid rgba(146, 64, 14, 0.14)",
  boxShadow: "0 22px 64px rgba(120, 53, 15, 0.1)",
} satisfies React.CSSProperties;

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.4fr) minmax(300px, 0.9fr)",
  gap: "1.25rem",
  alignItems: "start",
} satisfies React.CSSProperties;

const formCardStyle = {
  padding: "1.5rem",
  borderRadius: "28px",
  background: "rgba(255, 252, 247, 0.92)",
  border: "1px solid rgba(146, 64, 14, 0.14)",
  boxShadow: "0 22px 64px rgba(120, 53, 15, 0.1)",
  display: "grid",
  gap: "1.25rem",
} satisfies React.CSSProperties;

const sidebarStyle = {
  display: "grid",
  gap: "1rem",
} satisfies React.CSSProperties;

const sideCardStyle = {
  padding: "1.35rem",
  borderRadius: "24px",
  background: "rgba(255, 252, 247, 0.9)",
  border: "1px solid rgba(146, 64, 14, 0.14)",
  display: "grid",
  gap: "0.9rem",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  fontSize: "0.72rem",
  color: "#b45309",
} satisfies React.CSSProperties;

const titleStyle = {
  marginBottom: "0.75rem",
  fontSize: "2.2rem",
  lineHeight: 1.05,
} satisfies React.CSSProperties;

const copyStyle = {
  marginTop: 0,
  maxWidth: "68ch",
  lineHeight: 1.6,
  color: "#57534e",
} satisfies React.CSSProperties;

const sectionHeadingStyle = {
  display: "grid",
  gap: "0.25rem",
} satisfies React.CSSProperties;

const sectionEyebrowStyle = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontSize: "0.72rem",
  color: "#b45309",
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
  borderRadius: "16px",
  border: "1px solid rgba(120, 53, 15, 0.16)",
  padding: "0.9rem 1rem",
  background: "#fffdfa",
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
  borderRadius: "16px",
  background: "rgba(255, 255, 255, 0.74)",
  border: "1px solid rgba(146, 64, 14, 0.1)",
} satisfies React.CSSProperties;

const buttonStyle = {
  border: 0,
  borderRadius: "16px",
  padding: "0.95rem 1.1rem",
  background: "#9a3412",
  color: "#fff7ed",
  fontWeight: 700,
} satisfies React.CSSProperties;

const secondaryButtonStyle = {
  ...buttonStyle,
  background: "#fff7ed",
  color: "#9a3412",
  border: "1px solid rgba(146, 64, 14, 0.18)",
} satisfies React.CSSProperties;

const sideCopyStyle = {
  margin: 0,
  lineHeight: 1.6,
  color: "#57534e",
} satisfies React.CSSProperties;

const miniFormStyle = {
  display: "grid",
  gap: "0.85rem",
} satisfies React.CSSProperties;

const signatureSummaryStyle = {
  padding: "0.9rem 1rem",
  borderRadius: "18px",
  background: "rgba(255, 255, 255, 0.78)",
  border: "1px solid rgba(146, 64, 14, 0.1)",
} satisfies React.CSSProperties;

const metaCopyStyle = {
  marginBottom: 0,
  color: "#57534e",
  lineHeight: 1.6,
} satisfies React.CSSProperties;

const statusListStyle = {
  margin: 0,
  paddingLeft: "1.15rem",
  color: "#57534e",
  lineHeight: 1.6,
} satisfies React.CSSProperties;
