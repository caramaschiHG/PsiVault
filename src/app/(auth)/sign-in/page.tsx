import { signIn } from "../actions";
import { translateAuthError } from "../auth-errors";
import { AuthForm } from "../components/auth-form";
import { SubmitButton } from "../components/submit-button";
import { PasswordInput } from "../components/password-input";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; field?: string; success?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params.error
    ? translateAuthError(decodeURIComponent(params.error))
    : null;
  const errorField = params.field ?? null;
  const successMessage = params.success
    ? decodeURIComponent(params.success)
    : null;

  return (
    <main className="auth-shell">
      <p className="auth-brand">PsiVault</p>
      <section className="auth-card">
        <p className="auth-eyebrow">Entrar</p>
        <h1 className="auth-title">Bem-vindo de volta.</h1>

        {successMessage && (
          <div
            className="auth-alert auth-alert--success"
            style={{ marginBottom: "1rem" } satisfies React.CSSProperties}
          >
            {successMessage}
          </div>
        )}

        <form className="auth-form" action={signIn}>
          <AuthForm>
            <label className="auth-label">
              E-mail
              <input
                className="auth-input"
                type="email"
                name="email"
                placeholder="voce@consultorio.com.br"
                required
              />
              {errorField === "email" && errorMessage && (
                <span className="auth-field-error">{errorMessage}</span>
              )}
            </label>

            <label className="auth-label">
              Senha
              <PasswordInput
                name="password"
                placeholder="Sua senha"
                required
              />
              {errorField === "password" && errorMessage && (
                <span className="auth-field-error">{errorMessage}</span>
              )}
            </label>

            <div style={{ textAlign: "right" } satisfies React.CSSProperties}>
              <a
                href="/reset-password"
                className="link-subtle"
                style={{ fontSize: "0.875rem" } satisfies React.CSSProperties}
              >
                Esqueceu a senha?
              </a>
            </div>

            <SubmitButton label="Entrar" />

            {errorMessage && !errorField && (
              <div className="auth-alert auth-alert--error">{errorMessage}</div>
            )}
          </AuthForm>
        </form>

        <p className="auth-footer">
          Não tem conta?{" "}
          <a href="/sign-up">Criar conta</a>
        </p>
      </section>
    </main>
  );
}
