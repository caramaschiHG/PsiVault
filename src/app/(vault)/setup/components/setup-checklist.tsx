import type { SetupReadinessState } from "../../../../lib/setup/readiness";
import { SetupStepCard } from "./setup-step-card";

interface SetupChecklistProps {
  readiness: SetupReadinessState;
}

export function SetupChecklist({ readiness }: SetupChecklistProps) {
  return (
    <section style={cardStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>Checklist guiado</p>
          <h2 style={titleStyle}>O que ainda falta para considerar o vault pronto.</h2>
        </div>
        <p style={copyStyle}>
          Cada bloco mostra o estado atual, o que ainda falta e o que pode ser
          deixado para depois sem bloquear a operação inicial.
        </p>
      </div>

      <div style={stepsStyle}>
        {readiness.steps.map((step, index) => (
          <SetupStepCard
            key={step.id}
            index={index + 1}
            step={step}
            highlight={step.required && step.status !== "complete"}
          />
        ))}
      </div>
    </section>
  );
}

const cardStyle = {
  padding: "1.5rem",
  borderRadius: "var(--radius-xl)",
  background: "rgba(255, 252, 247, 0.92)",
  border: "1px solid rgba(146, 64, 14, 0.14)",
  boxShadow: "var(--shadow-card-elevated)",
  display: "grid",
  gap: "1rem",
} satisfies React.CSSProperties;

const headerStyle = {
  display: "grid",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  fontSize: "0.72rem",
  color: "var(--color-brown-mid)",
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "1.7rem",
} satisfies React.CSSProperties;

const copyStyle = {
  margin: 0,
  color: "var(--color-text-2)",
  lineHeight: 1.6,
} satisfies React.CSSProperties;

const stepsStyle = {
  display: "grid",
  gap: "0.9rem",
} satisfies React.CSSProperties;
