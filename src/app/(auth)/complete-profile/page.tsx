import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveSession } from "@/lib/supabase/session";
import { getPracticeProfileSnapshot } from "@/lib/setup/profile";
import { SERVICE_MODE_OPTIONS } from "@/lib/setup/constants";
import { completeProfileAction } from "./actions";

const serviceModeLabels: Record<string, string> = {
  [SERVICE_MODE_OPTIONS.inPerson]: "Presencial",
  [SERVICE_MODE_OPTIONS.online]: "Online",
  [SERVICE_MODE_OPTIONS.hybrid]: "Híbrido",
};

export default async function CompleteProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { accountId, workspaceId } = await resolveSession();
  const profile = await getPracticeProfileSnapshot(accountId, workspaceId);

  // Already filled — skip straight to the vault
  if (profile.crp?.trim()) {
    redirect("/inicio");
  }

  const defaultName = (user.user_metadata?.display_name as string | undefined) ?? "";
  const defaultEmail = user.email ?? "";

  return (
    <main className="auth-shell">
      <p className="auth-brand">PsiVault</p>
      <section className="auth-card auth-card--wide">
        <p className="auth-eyebrow">Perfil profissional</p>
        <h1 className="auth-title">Complete seu cadastro.</h1>
        <p className="auth-copy">
          Esses dados identificam você nos documentos clínicos e configuram sua agenda.
        </p>

        <form
          action={completeProfileAction}
          style={{ display: "grid", gap: "1rem" } satisfies React.CSSProperties}
        >
          <div style={fieldGridStyle}>
            <label className="auth-label">
              Nome profissional
              <input
                className="auth-input"
                name="fullName"
                placeholder="Dra. Helena Prado"
                defaultValue={profile.fullName ?? defaultName}
                required
              />
            </label>

            <label className="auth-label">
              CRP
              <input
                className="auth-input"
                name="crp"
                placeholder="CRP 00/000000"
                defaultValue={profile.crp ?? ""}
                required
              />
            </label>

            <label className="auth-label">
              E-mail de contato
              <input
                className="auth-input"
                name="contactEmail"
                placeholder="contato@consultorio.com.br"
                defaultValue={profile.contactEmail ?? defaultEmail}
                type="email"
              />
            </label>

            <label className="auth-label">
              Telefone
              <input
                className="auth-input"
                name="contactPhone"
                placeholder="+55 11 99999-9999"
                defaultValue={profile.contactPhone ?? ""}
              />
            </label>

            <label className="auth-label">
              Duração padrão da sessão (min)
              <input
                className="auth-input"
                name="defaultAppointmentDurationMinutes"
                type="number"
                min={1}
                defaultValue={profile.defaultAppointmentDurationMinutes ?? 50}
              />
            </label>

            <label className="auth-label">
              Valor padrão em centavos
              <input
                className="auth-input"
                name="defaultSessionPriceInCents"
                type="number"
                min={1}
                defaultValue={profile.defaultSessionPriceInCents ?? 18000}
              />
            </label>
          </div>

          <div style={{ display: "grid", gap: "0.6rem" } satisfies React.CSSProperties}>
            <span style={{ fontWeight: 700, fontSize: "0.875rem" } satisfies React.CSSProperties}>
              Modalidades atendidas
            </span>
            <div style={checkboxGridStyle}>
              {Object.values(SERVICE_MODE_OPTIONS).map((mode) => (
                <label key={mode} style={checkboxCardStyle}>
                  <input
                    name="serviceModes"
                    type="checkbox"
                    value={mode}
                    defaultChecked={profile.serviceModes.includes(mode)}
                  />
                  {serviceModeLabels[mode]}
                </label>
              ))}
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ width: "100%" } satisfies React.CSSProperties}
            type="submit"
          >
            Entrar no PsiVault
          </button>
        </form>
      </section>
    </main>
  );
}

const fieldGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "0.85rem",
} satisfies React.CSSProperties;

const checkboxGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "0.6rem",
} satisfies React.CSSProperties;

const checkboxCardStyle = {
  display: "flex",
  gap: "0.5rem",
  alignItems: "center",
  padding: "0.75rem 0.9rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-0)",
  border: "1px solid var(--color-border)",
  fontSize: "0.875rem",
} satisfies React.CSSProperties;
