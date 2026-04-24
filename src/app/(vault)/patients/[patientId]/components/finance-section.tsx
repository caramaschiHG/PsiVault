/**
 * FinanceSection — charge history for a single patient.
 *
 * Pure presentational server component: all data comes from props.
 * Each charge row has an inline <details> form for editing status,
 * amount, and payment method without requiring a client component.
 *
 * Security policy (SECU-05): form inputs handle amountInCents only on
 * server-side processing; no financial amounts stored in client-visible URLs.
 */

import type { SessionCharge, ChargeStatus, PaymentMethod } from "../../../../../lib/finance/model";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const CHARGE_STATUS_COLORS: Record<ChargeStatus, { background: string; color: string }> = {
  pago: { background: "rgba(20, 83, 45, 0.1)", color: "#14532d" },
  pendente: { background: "rgba(120, 53, 15, 0.1)", color: "var(--color-amber-dark)" },
  atrasado: { background: "rgba(153, 27, 27, 0.1)", color: "var(--color-error-text)" },
};

const CHARGE_STATUS_LABELS: Record<ChargeStatus, string> = {
  pago: "Pago",
  pendente: "Pendente",
  atrasado: "Atrasado",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: "Pix",
  transferencia: "Transferência",
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  cheque: "Cheque",
};

function formatAmount(amountInCents: number | null): string {
  if (amountInCents === null) return "Sem valor definido";
  return currencyFormatter.format(amountInCents / 100);
}

function formatPaymentMethod(method: PaymentMethod | string | null): string {
  if (!method) return "–";
  return PAYMENT_METHOD_LABELS[method as string] ?? String(method);
}

interface FinanceSectionProps {
  charges: SessionCharge[];
  patientId: string;
  updateChargeAction: (formData: FormData) => Promise<void>;
}

export function FinanceSection({ charges, patientId: _patientId, updateChargeAction }: FinanceSectionProps) {
  return (
    <section style={sectionStyle}>
      <div style={headingBlockStyle}>
        <p style={eyebrowStyle}>Cobranças de sessão</p>
        <h2 style={titleStyle}>Financeiro</h2>
      </div>

      {charges.length === 0 ? (
        <p style={emptyStateStyle}>Nenhuma sessão concluída ainda.</p>
      ) : (
        <div style={listStyle}>
          {charges.map((charge) => {
            const statusColors = CHARGE_STATUS_COLORS[charge.status];
            const amountValue =
              charge.amountInCents !== null
                ? (charge.amountInCents / 100).toFixed(2)
                : "";

            return (
              <div key={charge.id} style={rowStyle}>
                {/* Row summary */}
                <div style={rowInfoStyle}>
                  <span style={sessionLabelStyle}>
                    Sessão em {dateFormatter.format(charge.createdAt)}
                  </span>
                  <div style={metaRowStyle}>
                    <span
                      style={{
                        ...statusBadgeStyle,
                        background: statusColors.background,
                        color: statusColors.color,
                      }}
                    >
                      {CHARGE_STATUS_LABELS[charge.status]}
                    </span>
                    <span style={amountStyle}>{formatAmount(charge.amountInCents)}</span>
                    {charge.paymentMethod && (
                      <span style={methodStyle}>
                        {formatPaymentMethod(charge.paymentMethod)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Inline collapsible edit form — zero JS with <details> */}
                <details style={detailsStyle} className="details-animated">
                  <summary style={summaryStyle}>Editar cobrança</summary>
                  <div className="details-animated-content">
                    <form action={updateChargeAction} style={formStyle}>
                      <input type="hidden" name="chargeId" value={charge.id} />

                      <div style={fieldGroupStyle}>
                        <label style={labelStyle} htmlFor={`status-${charge.id}`}>
                          Status
                        </label>
                        <select
                          id={`status-${charge.id}`}
                          name="status"
                          defaultValue={charge.status}
                          style={selectStyle}
                        >
                          <option value="pendente">Pendente</option>
                          <option value="pago">Pago</option>
                          <option value="atrasado">Atrasado</option>
                        </select>
                      </div>

                      <div style={fieldGroupStyle}>
                        <label style={labelStyle} htmlFor={`amount-${charge.id}`}>
                          Valor (R$)
                        </label>
                        <input
                          id={`amount-${charge.id}`}
                          type="number"
                          name="amount"
                          defaultValue={amountValue}
                          min="0"
                          step="0.01"
                          placeholder="0,00"
                          style={inputStyle}
                        />
                      </div>

                      <div style={fieldGroupStyle}>
                        <label style={labelStyle} htmlFor={`paymentMethod-${charge.id}`}>
                          Forma de pagamento
                        </label>
                        <select
                          id={`paymentMethod-${charge.id}`}
                          name="paymentMethod"
                          defaultValue={charge.paymentMethod ?? ""}
                          style={selectStyle}
                        >
                          <option value="">Não informado</option>
                          <option value="pix">Pix</option>
                          <option value="transferencia">Transferência</option>
                          <option value="dinheiro">Dinheiro</option>
                          <option value="cartao">Cartão</option>
                          <option value="cheque">Cheque</option>
                        </select>
                      </div>

                      <button type="submit" style={submitStyle}>
                        Salvar
                      </button>
                    </form>
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// --- Style objects ---

const sectionStyle = {
  display: "grid",
  gap: "0.75rem",
  padding: "1.35rem 1.5rem",
  borderRadius: "var(--radius-lg)",
  background: "rgba(255, 247, 237, 0.9)",
  border: "1px solid rgba(146, 64, 14, 0.16)",
} satisfies React.CSSProperties;

const headingBlockStyle = {
  display: "grid",
  gap: "0.25rem",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.14em",
  fontSize: "0.72rem",
  color: "var(--color-brown-mid)",
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "1.4rem",
} satisfies React.CSSProperties;

const emptyStateStyle = {
  margin: 0,
  color: "var(--color-text-3)",
  fontSize: "0.95rem",
  padding: "0.5rem 0",
} satisfies React.CSSProperties;

const listStyle = {
  display: "grid",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const rowStyle = {
  display: "grid",
  gap: "0.5rem",
  padding: "0.875rem 1.1rem",
  borderRadius: "var(--radius-md)",
  background: "rgba(255, 252, 247, 0.95)",
  border: "1px solid rgba(146, 64, 14, 0.12)",
} satisfies React.CSSProperties;

const rowInfoStyle = {
  display: "grid",
  gap: "0.35rem",
} satisfies React.CSSProperties;

const sessionLabelStyle = {
  fontWeight: 500,
  fontSize: "0.9rem",
  color: "var(--color-kbd-text)",
} satisfies React.CSSProperties;

const metaRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const statusBadgeStyle = {
  display: "inline-block",
  fontSize: "0.75rem",
  fontWeight: 600,
  padding: "0.15rem 0.55rem",
  borderRadius: "var(--radius-pill)",
} satisfies React.CSSProperties;

const amountStyle = {
  fontSize: "0.875rem",
  color: "var(--color-warm-brown)",
} satisfies React.CSSProperties;

const methodStyle = {
  fontSize: "0.8rem",
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;

const detailsStyle = {
  marginTop: "0.25rem",
} satisfies React.CSSProperties;

const summaryStyle = {
  cursor: "pointer",
  fontSize: "0.825rem",
  color: "var(--color-accent)",
  fontWeight: 500,
  userSelect: "none" as const,
} satisfies React.CSSProperties;

const formStyle = {
  display: "grid",
  gap: "0.75rem",
  marginTop: "0.75rem",
  padding: "0.875rem",
  borderRadius: "var(--radius-sm)",
  background: "rgba(255, 247, 237, 0.6)",
  border: "1px solid rgba(146, 64, 14, 0.1)",
} satisfies React.CSSProperties;

const fieldGroupStyle = {
  display: "grid",
  gap: "0.3rem",
} satisfies React.CSSProperties;

const labelStyle = {
  fontSize: "0.8rem",
  fontWeight: 500,
  color: "var(--color-warm-brown)",
} satisfies React.CSSProperties;

const selectStyle = {
  padding: "0.4rem 0.6rem",
  borderRadius: "var(--radius-sm)",
  border: "1px solid rgba(146, 64, 14, 0.2)",
  background: "rgba(255, 252, 247, 0.95)",
  fontSize: "0.875rem",
  color: "var(--color-kbd-text)",
} satisfies React.CSSProperties;

const inputStyle = {
  padding: "0.4rem 0.6rem",
  borderRadius: "var(--radius-sm)",
  border: "1px solid rgba(146, 64, 14, 0.2)",
  background: "rgba(255, 252, 247, 0.95)",
  fontSize: "0.875rem",
  color: "var(--color-kbd-text)",
  width: "100%",
  boxSizing: "border-box" as const,
} satisfies React.CSSProperties;

const submitStyle = {
  justifySelf: "start",
  padding: "0.4rem 1rem",
  borderRadius: "var(--radius-pill)",
  border: "1px solid rgba(146, 64, 14, 0.3)",
  background: "rgba(255, 247, 237, 0.6)",
  color: "var(--color-accent)",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
} satisfies React.CSSProperties;
