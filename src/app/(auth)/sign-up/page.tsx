export const dynamic = "force-dynamic";

import { signUp } from "../actions";
import { translateAuthError } from "../auth-errors";
import { AuthForm } from "../components/auth-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { PasswordInput } from "../components/password-input";
import { MaskedInput } from "@/components/ui/masked-input";

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
    <div className="auth-page">
      <aside className="auth-brand-panel">
        <div className="auth-brand-panel-inner">
          <div className="auth-brand-mark">PsiVault</div>
          <div className="auth-brand-body">
            <p className="auth-brand-tagline">
              Tudo que você precisa para a rotina clínica, em um só lugar.
            </p>
            <ul className="auth-brand-points">
              <li>Prontuários organizados e seguros</li>
              <li>Agenda inteligente com recorrências</li>
              <li>Autenticação em dois fatores obrigatória</li>
              <li>Backup automático dos seus dados</li>
            </ul>
          </div>
          <p className="auth-brand-foot">Para psicólogos brasileiros</p>
        </div>
      </aside>

      <main className="auth-form-panel">
        <div className="auth-form-inner">
          <p className="auth-eyebrow">Criar conta</p>
          <h1 className="auth-title">Configure sua conta profissional.</h1>
          <p className="auth-copy">
            Após verificar o e-mail, você configura o segundo fator e já pode usar o vault.
          </p>

          <form className="auth-form" action={signUp}>
            <AuthForm>
              <div className="input-floating-label-wrap">
                <input
                  id="signup-displayName"
                  className={`auth-input ${errorField === "displayName" ? "input-error input-error-shake" : ""}`}
                  name="displayName"
                  placeholder=" "
                  required
                  onAnimationEnd={(e) => {
                    if (e.animationName === "inputShake") {
                      e.currentTarget.classList.remove("input-error-shake");
                    }
                  }}
                />
                <label htmlFor="signup-displayName" className="input-floating-label">Nome profissional</label>
              </div>
              {errorField === "displayName" && errorMessage && (
                <span className="auth-field-error">{errorMessage}</span>
              )}

              <div className="input-floating-label-wrap">
                <MaskedInput
                  mask="crp"
                  id="signup-crp"
                  className={`auth-input ${errorField === "crp" ? "input-error input-error-shake" : ""}`}
                  name="crp"
                  placeholder=" "
                  required
                  onAnimationEnd={(e) => {
                    if (e.animationName === "inputShake") {
                      e.currentTarget.classList.remove("input-error-shake");
                    }
                  }}
                />
                <label htmlFor="signup-crp" className="input-floating-label">CRP</label>
              </div>
              {errorField === "crp" && errorMessage && (
                <span className="auth-field-error">{errorMessage}</span>
              )}

              <div className="input-floating-label-wrap">
                <input
                  id="signup-email"
                  className={`auth-input ${errorField === "email" ? "input-error input-error-shake" : ""}`}
                  name="email"
                  placeholder=" "
                  type="email"
                  required
                  onAnimationEnd={(e) => {
                    if (e.animationName === "inputShake") {
                      e.currentTarget.classList.remove("input-error-shake");
                    }
                  }}
                />
                <label htmlFor="signup-email" className="input-floating-label">E-mail</label>
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

              <PasswordInput
                name="confirmPassword"
                label="Confirmar senha"
                errorShake={errorField === "confirmPassword"}
                required
              />
              {errorField === "confirmPassword" && errorMessage && (
                <span className="auth-field-error">{errorMessage}</span>
              )}

              <SubmitButton label="Continuar para verificação" fullWidth />

              {errorMessage && !errorField && (
                <div className="auth-alert auth-alert--error">{errorMessage}</div>
              )}
            </AuthForm>
          </form>

          <p className="auth-footer">
            Já tem conta?{" "}
            <a href="/sign-in">Entrar</a>
          </p>
        </div>
      </main>
    </div>
  );
}
