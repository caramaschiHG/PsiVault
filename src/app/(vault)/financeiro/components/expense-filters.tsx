"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { ExpenseCategory } from "@/lib/expense-categories/model";

interface ExpenseFiltersProps {
  categories: ExpenseCategory[];
}

export function ExpenseFilters({ categories }: ExpenseFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [localQ, setLocalQ] = useState(searchParams.get("q") ?? "");

  const category = searchParams.get("category") ?? "";
  const minValue = searchParams.get("minValue") ?? "";
  const maxValue = searchParams.get("maxValue") ?? "";
  const month = searchParams.get("month") ?? "";

  const hasFilters = !!(localQ || category || minValue || maxValue || month);

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (!params.has("tab")) params.set("tab", "despesas");
    router.replace(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilter("q", localQ || null);
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQ]);

  function clearAll() {
    setLocalQ("");
    const params = new URLSearchParams();
    params.set("tab", "despesas");
    router.replace(`${pathname}?${params.toString()}`);
  }

  const filterContent = (
    <div style={rowStyle}>
      <div style={fieldStyle}>
        <div className="input-floating-label-wrap">
          <input
            id="expense-filter-q"
            className="input-field"
            type="text"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder=" "
            style={inputStyle}
          />
          <label htmlFor="expense-filter-q" className="input-floating-label">Buscar por descrição</label>
        </div>
      </div>

      <div style={fieldStyle}>
        <div className="input-floating-label-wrap">
          <select
            id="expense-filter-category"
            className={`input-field ${category ? "select-has-value" : ""}`}
            value={category}
            onChange={(e) => updateFilter("category", e.target.value || null)}
            style={inputStyle}
          >
            <option value="">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <label htmlFor="expense-filter-category" className="input-floating-label">Categoria</label>
        </div>
      </div>

      <div style={fieldStyle}>
        <div className="input-floating-label-wrap">
          <input
            id="expense-filter-min"
            className="input-field"
            type="text"
            value={minValue}
            onChange={(e) => updateFilter("minValue", e.target.value || null)}
            placeholder=" "
            style={{ ...inputStyle, width: "6rem" }}
          />
          <label htmlFor="expense-filter-min" className="input-floating-label">Valor mín.</label>
        </div>
      </div>

      <div style={fieldStyle}>
        <div className="input-floating-label-wrap">
          <input
            id="expense-filter-max"
            className="input-field"
            type="text"
            value={maxValue}
            onChange={(e) => updateFilter("maxValue", e.target.value || null)}
            placeholder=" "
            style={{ ...inputStyle, width: "6rem" }}
          />
          <label htmlFor="expense-filter-max" className="input-floating-label">Valor máx.</label>
        </div>
      </div>

      <div style={fieldStyle}>
        <div className="input-floating-label-wrap">
          <input
            id="expense-filter-month"
            className="input-field"
            type="month"
            value={month}
            onChange={(e) => updateFilter("month", e.target.value || null)}
            placeholder=" "
            style={inputStyle}
          />
          <label htmlFor="expense-filter-month" className="input-floating-label">Mês</label>
        </div>
      </div>

      {hasFilters && (
        <div style={clearBtnWrapStyle}>
          <button
            type="button"
            className="btn-ghost"
            onClick={clearAll}
            style={clearBtnStyle}
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: always visible row */}
      <div style={desktopWrapStyle}>{filterContent}</div>

      {/* Mobile: collapsible */}
      <details style={mobileWrapStyle} className="details-animated">
        <summary style={summaryStyle}>Filtros</summary>
        <div style={mobileContentStyle} className="details-animated-content">{filterContent}</div>
      </details>
    </>
  );
}

const rowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--space-3)",
  alignItems: "flex-end",
} satisfies React.CSSProperties;

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-1)",
} satisfies React.CSSProperties;

const inputStyle = {
  minWidth: "10rem",
} satisfies React.CSSProperties;

const clearBtnWrapStyle = {
  display: "flex",
  alignItems: "flex-end",
} satisfies React.CSSProperties;

const clearBtnStyle = {
  whiteSpace: "nowrap",
} satisfies React.CSSProperties;

const desktopWrapStyle = {
  display: "block",
} satisfies React.CSSProperties;

const mobileWrapStyle = {
  display: "none",
} satisfies React.CSSProperties;

const mobileContentStyle = {
  paddingTop: "var(--space-3)",
} satisfies React.CSSProperties;

const summaryStyle = {
  cursor: "pointer",
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
  color: "var(--color-text-2)",
  userSelect: "none",
} satisfies React.CSSProperties;
