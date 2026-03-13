import type { SetupStepState } from "../../../../lib/setup/readiness";

interface SetupStepCardProps {
  index: number;
  step: SetupStepState;
  highlight?: boolean;
}

const statusCopy: Record<SetupStepState["status"], string> = {
  complete: "Concluída",
  incomplete: "Obrigatória",
  optional: "Opcional por enquanto",
};

export function SetupStepCard({
  index,
  step,
  highlight = false,
}: SetupStepCardProps) {
  return (
    <article
      style={{
        ...cardStyle,
        borderColor: highlight ? "rgba(180, 83, 9, 0.38)" : "rgba(146, 64, 14, 0.12)",
        background: highlight ? "rgba(255, 247, 237, 0.96)" : "rgba(255, 255, 255, 0.72)",
      }}
    >
      <div style={indexBadgeStyle}>{index.toString().padStart(2, "0")}</div>

      <div style={contentStyle}>
        <div style={headerStyle}>
          <div>
            <h3 style={titleStyle}>{step.title}</h3>
            <p style={statusStyle}>{statusCopy[step.status]}</p>
          </div>

          <span
            style={{
              ...chipStyle,
              color: step.required ? "#9a3412" : "#57534e",
              background: step.required
                ? "rgba(251, 191, 36, 0.18)"
                : "rgba(214, 211, 209, 0.4)",
            }}
          >
            {step.required ? "Agora" : "Depois"}
          </span>
        </div>

        {step.missingFields.length > 0 ? (
          <div style={missingStyle}>
            <p style={missingTitleStyle}>Pendências visíveis</p>
            <ul style={missingListStyle}>
              {step.missingFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p style={completeCopyStyle}>
            Este bloco já tem dados suficientes para a prontidão atual do vault.
          </p>
        )}
      </div>
    </article>
  );
}

const cardStyle = {
  padding: "1rem 1.1rem",
  borderRadius: "22px",
  border: "1px solid rgba(146, 64, 14, 0.12)",
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr)",
  gap: "1rem",
  alignItems: "start",
} satisfies React.CSSProperties;

const indexBadgeStyle = {
  width: "2.75rem",
  height: "2.75rem",
  borderRadius: "999px",
  background: "#7c2d12",
  color: "#fff7ed",
  display: "grid",
  placeItems: "center",
  fontWeight: 700,
  letterSpacing: "0.08em",
} satisfies React.CSSProperties;

const contentStyle = {
  display: "grid",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "0.75rem",
  alignItems: "start",
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "1.1rem",
} satisfies React.CSSProperties;

const statusStyle = {
  margin: "0.25rem 0 0",
  color: "#78716c",
} satisfies React.CSSProperties;

const chipStyle = {
  borderRadius: "999px",
  padding: "0.35rem 0.7rem",
  fontSize: "0.8rem",
  fontWeight: 700,
  whiteSpace: "nowrap",
} satisfies React.CSSProperties;

const missingStyle = {
  borderRadius: "18px",
  padding: "0.85rem 0.95rem",
  background: "rgba(255, 255, 255, 0.76)",
  border: "1px solid rgba(146, 64, 14, 0.08)",
} satisfies React.CSSProperties;

const missingTitleStyle = {
  margin: 0,
  fontWeight: 700,
} satisfies React.CSSProperties;

const missingListStyle = {
  margin: "0.55rem 0 0",
  paddingLeft: "1.15rem",
  color: "#57534e",
  lineHeight: 1.6,
} satisfies React.CSSProperties;

const completeCopyStyle = {
  margin: 0,
  color: "#57534e",
  lineHeight: 1.6,
} satisfies React.CSSProperties;
