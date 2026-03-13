import type { AuditActivityItem } from "../../../../../lib/audit/events";

export function ActivityFeed({ items }: { items: AuditActivityItem[] }) {
  return (
    <section style={sectionStyle}>
      <div style={{ display: "grid", gap: "0.45rem" }}>
        <p style={eyebrowStyle}>Histórico discreto</p>
        <h2 style={titleStyle}>Atividade recente do vault</h2>
        <p style={copyStyle}>
          Apenas sinais operacionais úteis aparecem aqui. Conteúdo clínico e detalhes sensíveis ficam fora dessa superfície.
        </p>
      </div>

      <div style={listStyle}>
        {items.map((item) => (
          <article key={item.id} style={cardStyle}>
            <div style={{ display: "grid", gap: "0.35rem" }}>
              <strong>{item.title}</strong>
              <p style={detailStyle}>{item.description}</p>
            </div>
            <span style={metaStyle}>{item.occurredAtLabel}</span>
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
  display: "flex",
  justifyContent: "space-between",
  gap: "1rem",
  flexWrap: "wrap",
  padding: "1.1rem",
  borderRadius: "20px",
  background: "rgba(255, 255, 255, 0.82)",
  border: "1px solid rgba(146, 64, 14, 0.12)",
} satisfies React.CSSProperties;

const detailStyle = {
  margin: 0,
  color: "#292524",
  lineHeight: 1.5,
} satisfies React.CSSProperties;

const metaStyle = {
  color: "#78716c",
  fontSize: "0.92rem",
} satisfies React.CSSProperties;
