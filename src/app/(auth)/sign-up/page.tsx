export const dynamic = "force-dynamic";

import { signUp } from "../actions";
import { translateAuthError } from "../auth-errors";
import { AuthForm } from "../components/auth-form";
import { SubmitButton } from "../components/submit-button";
import { PasswordInput } from "../components/password-input";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; field?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params.error
    ? translateAuthError(decodeURIComponent(params.error))
    : null;
  const errorField = params.field ?? null;

  return (
    <main className="auth-shell">
      <p className="auth-brand">PsiVault</p>
      <section className="auth-card">
        <p className="auth-eyebrow">Criar conta</p>
        <h1 className="auth-title">Abra sua conta com e-mail e senha.</h1>
        <p className="auth-copy">
          O acesso completo ao vault só é liberado depois da verificação de
          e-mail e da configuração do segundo fator.
        </p>

        <form className="auth-form" action={signUp}>
          <AuthForm>
            <label className="auth-label">
              Nome profissional
              <input
                className="auth-input"
                name="displayName"
                placeholder="Dra. Helena Prado"
                required
              />
              {errorField === "displayName" && errorMessage && (
                <span className="auth-field-error">{errorMessage}</span>
              )}
            </label>

            <label className="auth-label">
              E-mail
              <input
                className="auth-input"
                name="email"
                placeholder="voce@consultorio.com.br"
                type="email"
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
                placeholder="Crie uma senha forte"
                required
              />
              <p
                style={
                  {
                    fontSize: "0.8rem",
                    color: "var(--color-text-3)",
                    margin: 0,
                  } satisfies React.CSSProperties
                }
              >
                Use pelo menos 8 caracteres.
              </p>
              {errorField === "password" && errorMessage && (
                <span className="auth-field-error">{errorMessage}</span>
              )}
            </label>

            <SubmitButton label="Continuar para verificação" />

            {errorMessage && !errorField && (
              <div className="auth-alert auth-alert--error">{errorMessage}</div>
            )}
          </AuthForm>
        </form>

        <p className="auth-footer">
          Já tem conta?{" "}
          <a href="/sign-in">Entrar</a>
        </p>
      </section>
    </main>
  );
}
