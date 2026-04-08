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
                CRP
                <MaskedInput
                  mask="crp"
                  className="auth-input"
                  name="crp"
                  placeholder="CRP 06/000000"
                  required
                />
                {errorField === "crp" && errorMessage && (
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

              <label className="auth-label">
                Confirmar senha
                <PasswordInput
                  name="confirmPassword"
                  placeholder="Repita a senha"
                  required
                />
                {errorField === "confirmPassword" && errorMessage && (
                  <span className="auth-field-error">{errorMessage}</span>
                )}
              </label>

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
