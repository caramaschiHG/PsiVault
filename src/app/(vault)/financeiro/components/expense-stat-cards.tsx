"use client";

import type { Expense } from "@/lib/expenses/model";
import type { ExpenseCategory } from "@/lib/expense-categories/model";
import { formatBRL } from "@/lib/expenses/format";

interface ExpenseStatCardsProps {
  expenses: Expense[];
  categories: ExpenseCategory[];
}

export function ExpenseStatCards({ expenses, categories }: ExpenseStatCardsProps) {
  const active = expenses.filter((e) => !e.deletedAt);

  const totalCents = active.reduce((s, e) => s + e.amountInCents, 0);
  const count = active.length;

  // Maior categoria: sum by categoryId
  const categoryTotals = new Map<string, number>();
  for (const e of active) {
    categoryTotals.set(e.categoryId, (categoryTotals.get(e.categoryId) ?? 0) + e.amountInCents);
  }
  let topCategoryId: string | null = null;
  let topCategoryTotal = 0;
  for (const [catId, total] of categoryTotals) {
    if (total > topCategoryTotal) {
      topCategoryTotal = total;
      topCategoryId = catId;
    }
  }
  const topCategory = topCategoryId
    ? categories.find((c) => c.id === topCategoryId)
    : null;

  return (
    <div style={gridStyle}>
      {/* Total do mês */}
      <article role="status" style={cardStyle}>
        <p style={eyebrowStyle}>TOTAL DO MÊS</p>
        <p style={valueStyle}>{formatBRL(totalCents)}</p>
        <p style={subStyle}>{count} despesa{count !== 1 ? "s" : ""}</p>
      </article>

      {/* Lançamentos */}
      <article role="status" style={cardStyle}>
        <p style={eyebrowStyle}>LANÇAMENTOS</p>
        <p style={valueStyle}>{count}</p>
        <p style={subStyle}>neste mês</p>
      </article>

      {/* Maior categoria */}
      <article role="status" style={cardStyle}>
        <p style={eyebrowStyle}>MAIOR CATEGORIA</p>
        <p style={{ ...valueStyle, fontSize: "var(--font-size-h2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {topCategory ? topCategory.name : "—"}
        </p>
        <p style={subStyle}>{topCategoryTotal > 0 ? formatBRL(topCategoryTotal) : "sem despesas"}</p>
      </article>
    </div>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "var(--space-3)",
} satisfies React.CSSProperties;

const cardStyle = {
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-sm)",
  padding: "var(--space-4) var(--space-5)",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  fontSize: "var(--font-size-xs)",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "var(--letter-spacing-widest)",
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const valueStyle = {
  margin: "var(--space-1) 0 0",
  fontSize: "var(--font-size-display)",
  fontWeight: 700,
  color: "var(--color-text-1)",
  fontVariantNumeric: "tabular-nums",
  lineHeight: "var(--line-height-tight)",
} satisfies React.CSSProperties;

const subStyle = {
  margin: "var(--space-1) 0 0",
  fontSize: "var(--font-size-meta)",
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;
