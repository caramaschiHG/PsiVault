import type { CSSProperties } from "react";

type ChargeStatus = "pago" | "pendente" | "atrasado";
type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "canceled" | "no-show";

interface StatusBadgeProps {
  status: ChargeStatus | AppointmentStatus;
  variant?: "charge" | "appointment";
  className?: string;
}

const CHARGE_STYLES: Record<ChargeStatus, { background: string; color: string; label: string }> = {
  pago: { background: "var(--charge-paid-bg)", color: "var(--charge-paid-text)", label: "Pago" },
  pendente: { background: "var(--charge-pending-bg)", color: "var(--charge-pending-text)", label: "Pendente" },
  atrasado: { background: "var(--charge-overdue-bg)", color: "var(--charge-overdue-text)", label: "Atrasado" },
};

const APPOINTMENT_STYLES: Record<AppointmentStatus, { background: string; color: string; label: string }> = {
  scheduled: {
    background: "var(--status-scheduled-bg)",
    color: "var(--color-accent)",
    label: "Agendada",
  },
  confirmed: {
    background: "var(--status-confirmed-bg)",
    color: "var(--charge-paid-text)",
    label: "Confirmada",
  },
  completed: {
    background: "var(--status-completed-bg)",
    color: "var(--color-accent)",
    label: "Realizada",
  },
  canceled: {
    background: "var(--status-canceled-bg)",
    color: "var(--color-text-3)",
    label: "Cancelada",
  },
  "no-show": {
    background: "var(--status-no-show-bg)",
    color: "var(--charge-overdue-text)",
    label: "Não compareceu",
  },
};

const badgeStyle = {
  display: "inline-block",
  fontSize: "var(--font-size-xs)",
  fontWeight: 600,
  padding: "0.2rem 0.625rem",
  borderRadius: "var(--radius-pill)",
  whiteSpace: "nowrap" as const,
} satisfies CSSProperties;

export function StatusBadge({ status, variant = "charge", className }: StatusBadgeProps) {
  const styles = variant === "charge"
    ? CHARGE_STYLES[status as ChargeStatus] ?? CHARGE_STYLES.pendente
    : APPOINTMENT_STYLES[status as AppointmentStatus] ?? APPOINTMENT_STYLES.scheduled;

  return (
    <span
      className={className}
      style={{
        ...badgeStyle,
        background: styles.background,
        color: styles.color,
      }}
    >
      {styles.label}
    </span>
  );
}
