"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Expense } from "@/lib/expenses/model";
import type { ExpenseCategory } from "@/lib/expense-categories/model";
import { formatBRL } from "@/lib/expenses/format";

interface ExpenseListProps {
  expenses: Expense[];
  categories: ExpenseCategory[];
  onSelect: (e: Expense) => void;
}

export function ExpenseList({ expenses, categories, onSelect }: ExpenseListProps) {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const active = expenses.filter((e) => !e.deletedAt);

  if (active.length === 0) {
    return (
      <div style={emptyStyle}>
        <h3 style={emptyTitleStyle}>Sem despesas neste mês</h3>
        <p style={emptyBodyStyle}>Use &ldquo;+ Nova despesa&rdquo; para registrar o primeiro lançamento.</p>
      </div>
    );
  }

  return (
    <div style={listStyle}>
      {active.map((expense) => {
        const category = categoryMap.get(expense.categoryId);
        const categoryName = category?.name ?? "Sem categoria";
        return (
          <button
            key={expense.id}
            className="row-interactive"
            type="button"
            onClick={() => onSelect(expense)}
            style={rowStyle}
            aria-label={`Editar despesa, ${expense.description}, ${categoryName}, ${formatBRL(expense.amountInCents)}`}
          >
            {/* Date */}
            <span style={dateStyle} title={format(expense.dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}>
              {format(expense.dueDate, "dd MMM", { locale: ptBR })}
            </span>

            {/* Description */}
            <span style={descStyle}>{expense.description}</span>

            {/* Category badge */}
            <span style={badgeStyle}>{categoryName}</span>

            {/* Icons */}
            <span style={iconsStyle}>
              {expense.receiptStorageKey && (
                <span title="Comprovante anexado" aria-label="Comprovante anexado">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                  </svg>
                </span>
              )}
              {expense.seriesId && (
                <span title={expense.recurrencePattern === "MENSAL" ? "Mensal" : "Quinzenal"} aria-label={expense.recurrencePattern === "MENSAL" ? "Mensal" : "Quinzenal"}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
                  </svg>
                </span>
              )}
            </span>

            {/* Amount */}
            <span style={amountStyle}>{formatBRL(expense.amountInCents)}</span>
          </button>
        );
      })}
    </div>
  );
}

const emptyStyle = {
  padding: "var(--space-10) var(--space-4)",
  textAlign: "center",
} satisfies React.CSSProperties;

const emptyTitleStyle = {
  margin: 0,
  fontSize: "var(--font-size-h3)",
  fontWeight: 600,
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const emptyBodyStyle = {
  margin: "var(--space-2) 0 0",
  fontSize: "var(--font-size-body)",
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const listStyle = {
  display: "grid",
  gap: 0,
} satisfies React.CSSProperties;

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "80px 1fr auto auto auto",
  alignItems: "center",
  gap: "var(--space-3)",
  minHeight: "var(--space-row-height)",
  padding: "var(--space-3) var(--space-4)",
  borderBottom: "1px solid var(--color-border)",
  background: "transparent",
  border: "none",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderBottomColor: "var(--color-border)",
  cursor: "pointer",
  width: "100%",
  textAlign: "left",
} satisfies React.CSSProperties;

const dateStyle = {
  fontSize: "var(--font-size-meta)",
  color: "var(--color-text-2)",
  flexShrink: 0,
} satisfies React.CSSProperties;

const descStyle = {
  fontSize: "var(--font-size-body)",
  fontWeight: 500,
  color: "var(--color-text-1)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} satisfies React.CSSProperties;

const badgeStyle = {
  background: "var(--color-surface-3)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text-2)",
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
  padding: "2px 8px",
  borderRadius: "var(--radius-pill)",
  whiteSpace: "nowrap",
} satisfies React.CSSProperties;

const iconsStyle = {
  display: "flex",
  gap: "var(--space-1)",
  alignItems: "center",
} satisfies React.CSSProperties;

const amountStyle = {
  fontSize: "var(--font-size-body)",
  fontWeight: 600,
  color: "var(--color-text-1)",
  fontVariantNumeric: "tabular-nums",
  textAlign: "right",
  whiteSpace: "nowrap",
} satisfies React.CSSProperties;
