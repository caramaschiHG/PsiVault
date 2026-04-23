import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveSession } from "@/lib/supabase/session";
import { getPracticeProfileSnapshot } from "@/lib/setup/profile";
import { SERVICE_MODE_OPTIONS } from "@/lib/setup/constants";
import { completeProfileAction } from "./actions";
import { MaskedInput } from "@/components/ui/masked-input";

export const dynamic = "force-dynamic";

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
        <h1 className="auth-title">Configure seu consultório.</h1>
        <p className="auth-copy">
          Esses dados identificam você nos documentos clínicos e configuram sua agenda.
        </p>

        <form
          action={completeProfileAction}
          style={{ display: "grid", gap: "1rem" } satisfies React.CSSProperties}
        >
          <div style={fieldGridStyle}>
            <div className="input-floating-label-wrap">
              <input
                id="profile-fullName"
                className="auth-input"
                name="fullName"
                placeholder=" "
                defaultValue={profile.fullName ?? defaultName}
                required
              />
              <label htmlFor="profile-fullName" className="input-floating-label">Nome profissional</label>
            </div>

            <div className="input-floating-label-wrap">
              <MaskedInput
                mask="crp"
                id="profile-crp"
                className="auth-input"
                name="crp"
                placeholder=" "
                defaultValue={profile.crp ?? ""}
                required
              />
              <label htmlFor="profile-crp" className="input-floating-label">CRP</label>
            </div>

            <div className="input-floating-label-wrap">
              <input
                id="profile-contactEmail"
                className="auth-input"
                name="contactEmail"
                placeholder=" "
                defaultValue={profile.contactEmail ?? defaultEmail}
                type="email"
              />
              <label htmlFor="profile-contactEmail" className="input-floating-label">E-mail de contato</label>
            </div>

            <div className="input-floating-label-wrap">
              <MaskedInput
                mask="phone"
                id="profile-contactPhone"
                className="auth-input"
                name="contactPhone"
                placeholder=" "
                defaultValue={profile.contactPhone ?? ""}
              />
              <label htmlFor="profile-contactPhone" className="input-floating-label">Telefone</label>
            </div>

            <div className="input-floating-label-wrap">
              <input
                id="profile-duration"
                className="auth-input"
                name="defaultAppointmentDurationMinutes"
                type="number"
                min={1}
                placeholder=" "
                defaultValue={profile.defaultAppointmentDurationMinutes ?? 50}
              />
              <label htmlFor="profile-duration" className="input-floating-label">Duração padrão da sessão (min)</label>
            </div>

            <div className="input-floating-label-wrap">
              <input
                id="profile-price"
                className="auth-input"
                name="defaultSessionPriceInCents"
                type="number"
                min={1}
                placeholder=" "
                defaultValue={profile.defaultSessionPriceInCents ?? 18000}
              />
              <label htmlFor="profile-price" className="input-floating-label">Valor padrão em centavos</label>
            </div>
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
