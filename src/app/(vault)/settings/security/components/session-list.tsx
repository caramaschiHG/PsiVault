import type { VisibleSession } from "../../../../../lib/security/session-control";

export function SessionList({ sessions }: { sessions: VisibleSession[] }) {
  return (
    <section style={sectionStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>Sessões ativas</p>
          <h2 style={titleStyle}>Onde seu vault está aberto agora</h2>
        </div>
        <p style={copyStyle}>Veja os acessos em linguagem simples e encerre o que não for mais necessário.</p>
      </div>

      <div style={listStyle}>
        {sessions.map((session) => (
          <article key={session.id} style={cardStyle}>
            <div style={{ display: "grid", gap: "0.45rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <strong>{session.title}</strong>
                <span style={session.isCurrent ? currentPillStyle : pillStyle}>
                  {session.isCurrent ? "Protegida agora" : "Pode ser encerrada"}
                </span>
              </div>
              <p style={detailStyle}>{session.detail}</p>
              <p style={metaStyle}>{session.lastSeenLabel}</p>
            </div>
            <button type="button" disabled={!session.canRevoke} style={session.canRevoke ? buttonStyle : disabledButtonStyle}>
              {session.canRevoke ? "Encerrar acesso" : "Sessão atual"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

const sectionStyle = {
  display: "grid",
  gap: "1rem",
} satisfies React.CSSProperties;

const headerStyle = {
  display: "grid",
  gap: "0.45rem",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  fontSize: "var(--font-size-label)",
  color: "var(--color-brown-mid)",
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "1.35rem",
} satisfies React.CSSProperties;

const copyStyle = {
  margin: 0,
  color: "var(--color-text-2)",
  lineHeight: 1.6,
} satisfies React.CSSProperties;

const listStyle = {
  display: "grid",
  gap: "0.85rem",
} satisfies React.CSSProperties;

const cardStyle = {
  display: "grid",
  gap: "1rem",
  padding: "1.1rem",
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

const pillStyle = {
  padding: "0.3rem 0.65rem",
  borderRadius: "var(--radius-pill)",
  background: "var(--color-accent-light)",
  color: "var(--color-accent)",
  fontSize: "0.75rem",
} satisfies React.CSSProperties;

const currentPillStyle = {
  ...pillStyle,
  background: "var(--color-success-bg)",
  color: "var(--color-success-text)",
} satisfies React.CSSProperties;

const detailStyle = {
  margin: 0,
  color: "var(--color-text-1)",
  lineHeight: 1.5,
} satisfies React.CSSProperties;

const metaStyle = {
  margin: 0,
  color: "var(--color-text-3)",
  fontSize: "0.92rem",
} satisfies React.CSSProperties;

const buttonStyle = {
  justifySelf: "start",
  padding: "0.7rem 1rem",
  borderRadius: "var(--radius-pill)",
  border: "1px solid var(--color-border-med)",
  background: "var(--color-surface-1)",
  color: "var(--color-accent)",
  cursor: "pointer",
} satisfies React.CSSProperties;

const disabledButtonStyle = {
  ...buttonStyle,
  opacity: 0.6,
  cursor: "not-allowed",
} satisfies React.CSSProperties;
