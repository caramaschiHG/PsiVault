export const dynamic = "force-dynamic";

export default function VerifyEmailPage() {
  return (
    <main className="auth-shell">
      <p className="auth-brand">PsiVault</p>
      <section className="auth-card auth-card--wide">
        <div
          style={
            {
              display: "flex",
              justifyContent: "center",
              marginBottom: "1.25rem",
            } satisfies React.CSSProperties
          }
        >
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
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>

        <p className="auth-eyebrow">Verificação</p>
        <h1 className="auth-title">Verifique seu e-mail.</h1>
        <p className="auth-copy">
          Enviamos um link de confirmação. Clique nele para prosseguir.
        </p>

        <div className="auth-progress">
          <div className="auth-progress-item">
            <span className="auth-progress-num auth-progress-num--done">✓</span>
            <div className="auth-progress-text">
              <p>Criar conta</p>
            </div>
          </div>
          <div className="auth-progress-connector" />

          <div className="auth-progress-item">
            <span className="auth-progress-num auth-progress-num--active">●</span>
            <div className="auth-progress-text">
              <p>Confirmar e-mail</p>
              <p>Aguardando confirmação</p>
            </div>
          </div>
          <div className="auth-progress-connector" />

          <div className="auth-progress-item">
            <span className="auth-progress-num auth-progress-num--pending">3</span>
            <div className="auth-progress-text">
              <p>Verificação em 2 etapas</p>
            </div>
          </div>
          <div className="auth-progress-connector" />

          <div className="auth-progress-item">
            <span className="auth-progress-num auth-progress-num--pending">4</span>
            <div className="auth-progress-text">
              <p>Acesso ao vault</p>
            </div>
          </div>
        </div>

        <p
          style={
            {
              fontSize: "0.8rem",
              color: "var(--color-text-3)",
              marginTop: "0.5rem",
            } satisfies React.CSSProperties
          }
        >
          Não recebeu? Verifique a caixa de spam.
        </p>
      </section>
    </main>
  );
}
