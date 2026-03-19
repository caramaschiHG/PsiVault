import { requestPasswordReset, updatePassword } from "../actions";
import { translateAuthError } from "../auth-errors";
import { AuthForm } from "../components/auth-form";
import { SubmitButton } from "../components/submit-button";
import { PasswordInput } from "../components/password-input";

function LockIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="11" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    code?: string;
    error?: string;
    field?: string;
    success?: string;
  }>;
}) {
  const params = await searchParams;
  const code = params.code ? decodeURIComponent(params.code) : null;
  const rawError = params.error ? decodeURIComponent(params.error) : null;
  const errorMessage = rawError ? translateAuthError(rawError) : null;
  const errorField = params.field ?? null;
  const successMessage = params.success
    ? decodeURIComponent(params.success)
    : null;

  const isTokenExpired =
    rawError === "Token has expired or is invalid" ||
    (errorMessage?.includes("expirou") ?? false);

  if (code) {
    return (
      <main className="auth-shell">
        <p className="auth-brand">PsiVault</p>
        <section className="auth-card">
          <div
            style={
              {
                display: "flex",
                justifyContent: "center",
                marginBottom: "1.25rem",
              } satisfies React.CSSProperties
            }
          >
            <LockIcon />
          </div>

          <p className="auth-eyebrow">Nova senha</p>
          <h1 className="auth-title">Crie uma nova senha para o vault.</h1>
          <p className="auth-copy">
            Escolha uma senha forte. Ela será sua única credencial de acesso.
          </p>

          <form className="auth-form" action={updatePassword}>
            <AuthForm>
              <input type="hidden" name="code" value={code} />

              <label className="auth-label">
                Nova senha
                <PasswordInput
                  name="password"
                  placeholder="Nova senha segura"
                  required
                />
              </label>

              <label className="auth-label">
                Confirmar nova senha
                <PasswordInput
                  name="confirmPassword"
                  placeholder="Repita a nova senha"
                  required
                />
                {errorField === "confirmPassword" && errorMessage && (
                  <span className="auth-field-error">{errorMessage}</span>
                )}
              </label>

              <SubmitButton label="Atualizar senha" />

              {errorMessage && !errorField && !isTokenExpired && (
                <div className="auth-alert auth-alert--error">{errorMessage}</div>
              )}

              {isTokenExpired && (
                <div className="auth-alert auth-alert--error">
                  {errorMessage}{" "}
                  <a
                    href="/reset-password"
                    style={
                      {
                        color: "var(--color-accent)",
                        fontWeight: 600,
                        textDecoration: "underline",
                      } satisfies React.CSSProperties
                    }
                  >
                    Solicitar novo link
                  </a>
                </div>
              )}
            </AuthForm>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-shell">
      <p className="auth-brand">PsiVault</p>
      <section className="auth-card">
        <div
          style={
            {
              display: "flex",
              justifyContent: "center",
              marginBottom: "1.25rem",
            } satisfies React.CSSProperties
          }
        >
          <LockIcon />
        </div>

        <p className="auth-eyebrow">Recuperar acesso</p>
        <h1 className="auth-title">Recupere o acesso ao seu vault.</h1>
        <p className="auth-copy">
          Enviaremos um link de recuperação para o seu e-mail.
        </p>

        {successMessage && (
          <div
            className="auth-alert auth-alert--success"
            style={{ marginBottom: "1rem" } satisfies React.CSSProperties}
          >
            {successMessage}
          </div>
        )}

        <form className="auth-form" action={requestPasswordReset}>
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
            </label>

            <SubmitButton label="Enviar link de recuperação" />

            {errorMessage && !errorField && (
              <div className="auth-alert auth-alert--error">{errorMessage}</div>
            )}
          </AuthForm>
        </form>

        <p className="auth-footer">
          Lembrou a senha?{" "}
          <a href="/sign-in">Entrar</a>
        </p>
      </section>
    </main>
  );
}
