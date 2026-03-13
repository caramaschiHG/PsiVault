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
  fontSize: "0.72rem",
  color: "#b45309",
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "1.35rem",
} satisfies React.CSSProperties;

const copyStyle = {
  margin: 0,
  color: "#57534e",
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
  borderRadius: "20px",
  background: "rgba(255, 255, 255, 0.82)",
  border: "1px solid rgba(146, 64, 14, 0.12)",
} satisfies React.CSSProperties;

const pillStyle = {
  padding: "0.3rem 0.65rem",
  borderRadius: "999px",
  background: "rgba(217, 119, 6, 0.08)",
  color: "#9a3412",
  fontSize: "0.75rem",
} satisfies React.CSSProperties;

const currentPillStyle = {
  ...pillStyle,
  background: "rgba(5, 150, 105, 0.1)",
  color: "#047857",
} satisfies React.CSSProperties;

const detailStyle = {
  margin: 0,
  color: "#292524",
  lineHeight: 1.5,
} satisfies React.CSSProperties;

const metaStyle = {
  margin: 0,
  color: "#78716c",
  fontSize: "0.92rem",
} satisfies React.CSSProperties;

const buttonStyle = {
  justifySelf: "start",
  padding: "0.7rem 1rem",
  borderRadius: "999px",
  border: "1px solid rgba(146, 64, 14, 0.18)",
  background: "#fff7ed",
  color: "#9a3412",
  cursor: "pointer",
} satisfies React.CSSProperties;

const disabledButtonStyle = {
  ...buttonStyle,
  opacity: 0.6,
  cursor: "not-allowed",
} satisfies React.CSSProperties;
