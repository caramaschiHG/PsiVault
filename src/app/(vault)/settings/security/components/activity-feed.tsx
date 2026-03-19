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
  display: "flex",
  justifyContent: "space-between",
  gap: "1rem",
  flexWrap: "wrap",
  padding: "1.1rem",
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

const detailStyle = {
  margin: 0,
  color: "var(--color-text-1)",
  lineHeight: 1.5,
} satisfies React.CSSProperties;

const metaStyle = {
  color: "var(--color-text-3)",
  fontSize: "0.92rem",
} satisfies React.CSSProperties;
