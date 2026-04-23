export const dynamic = "force-dynamic";

import { signIn } from "../actions";
import { translateAuthError } from "../auth-errors";
import { AuthForm } from "../components/auth-form";
import { SubmitButton } from "@/components/ui/submit-button";
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
    <div className="auth-page">
      <aside className="auth-brand-panel">
        <div className="auth-brand-panel-inner">
          <div className="auth-brand-mark">PsiVault</div>
          <div className="auth-brand-body">
            <p className="auth-brand-tagline">
              Rotina clínica com calma, sigilo e clareza.
            </p>
            <ul className="auth-brand-points">
              <li>Prontuário eletrônico organizado</li>
              <li>Agenda e sessões integradas</li>
              <li>Documentos, recibos e declarações</li>
              <li>Acesso seguro com autenticação em dois fatores</li>
            </ul>
          </div>
          <p className="auth-brand-foot">Para psicólogos brasileiros</p>
        </div>
      </aside>

      <main className="auth-form-panel">
        <div className="auth-form-inner">
          <p className="auth-eyebrow">Entrar</p>
          <h1 className="auth-title">Bem-vindo de volta.</h1>
          <p className="auth-copy">Acesse seu vault clínico.</p>

          {successMessage && (
            <div
              className="auth-alert auth-alert--success"
              style={{ marginBottom: "1.25rem" } satisfies React.CSSProperties}
            >
              {successMessage}
            </div>
          )}

          <form className="auth-form" action={signIn}>
            <AuthForm>
              <div className="input-floating-label-wrap">
                <input
                  id="signin-email"
                  className={`auth-input ${errorField === "email" ? "input-error input-error-shake" : ""}`}
                  type="email"
                  name="email"
                  placeholder=" "
                  required
                  onAnimationEnd={(e) => {
                    if (e.animationName === "inputShake") {
                      e.currentTarget.classList.remove("input-error-shake");
                    }
                  }}
                />
                <label htmlFor="signin-email" className="input-floating-label">E-mail</label>
              </div>
              {errorField === "email" && errorMessage && (
                <span className="auth-field-error">{errorMessage}</span>
              )}

              <PasswordInput
                name="password"
                label="Senha"
                errorShake={errorField === "password"}
                required
              />
              {errorField === "password" && errorMessage && (
                <span className="auth-field-error">{errorMessage}</span>
              )}

              <div style={{ textAlign: "right" } satisfies React.CSSProperties}>
                <a
                  href="/reset-password"
                  className="link-subtle"
                  style={{ fontSize: "0.875rem" } satisfies React.CSSProperties}
                >
                  Esqueceu a senha?
                </a>
              </div>

              <SubmitButton label="Entrar" fullWidth />

              {errorMessage && !errorField && (
                <div className="auth-alert auth-alert--error">{errorMessage}</div>
              )}
            </AuthForm>
          </form>

          <p className="auth-footer">
            Não tem conta?{" "}
            <a href="/sign-up">Criar conta</a>
          </p>
        </div>
      </main>
    </div>
  );
}
