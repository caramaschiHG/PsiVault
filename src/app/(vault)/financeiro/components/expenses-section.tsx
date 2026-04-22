"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { Expense } from "@/lib/expenses/model";
import type { ExpenseCategory } from "@/lib/expense-categories/model";
import { ExpenseStatCards } from "./expense-stat-cards";
import { ExpenseViewToggle } from "./expense-view-toggle";
import { ExpenseList } from "./expense-list";
import { ExpenseGroupedList } from "./expense-grouped-list";
import { ExpenseSidePanel } from "./expense-side-panel";
import { ExpenseCategoryModal } from "./expense-category-modal";
import { ExpenseFilters } from "./expense-filters";

interface ExpensesSectionProps {
  expenses: Expense[];
  categories: ExpenseCategory[];
}

export function ExpensesSection({ expenses, categories }: ExpensesSectionProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [view, setView] = useState<"flat" | "grouped">("flat");
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const q = searchParams.get("q") ?? "";
  const categoryFilter = searchParams.get("category") ?? "";
  const minValue = searchParams.get("minValue") ?? "";
  const maxValue = searchParams.get("maxValue") ?? "";
  const month = searchParams.get("month") ?? "";

  const hasFilters = !!(q || categoryFilter || minValue || maxValue || month);

  const filteredExpenses = useMemo(() => {
    let result = expenses.filter((e) => e.deletedAt === null);

    if (q) {
      const lower = q.toLowerCase();
      result = result.filter((e) => e.description.toLowerCase().includes(lower));
    }

    if (categoryFilter) {
      result = result.filter((e) => e.categoryId === categoryFilter);
    }

    if (minValue) {
      const min = parseFloat(minValue.replace(",", "."));
      if (!isNaN(min)) {
        result = result.filter((e) => e.amountInCents >= min * 100);
      }
    }

    if (maxValue) {
      const max = parseFloat(maxValue.replace(",", "."));
      if (!isNaN(max)) {
        result = result.filter((e) => e.amountInCents <= max * 100);
      }
    }

    if (month) {
      const [year, mon] = month.split("-").map(Number);
      result = result.filter((e) => {
        const d = new Date(e.dueDate);
        return d.getFullYear() === year && d.getMonth() + 1 === mon;
      });
    }

    return result;
  }, [expenses, q, categoryFilter, minValue, maxValue, month]);

  function openCreate() {
    setSelectedExpense(null);
    setPanelOpen(true);
  }

  function openEdit(expense: Expense) {
    setSelectedExpense(expense);
    setPanelOpen(true);
  }

  function handleSaved() {
    setPanelOpen(false);
  }

  function handleDeleted() {
    setPanelOpen(false);
  }

  function clearFilters() {
    const params = new URLSearchParams();
    params.set("tab", "despesas");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div style={shellStyle}>
      {/* Stat cards */}
      <ExpenseStatCards expenses={expenses.filter((e) => e.deletedAt === null)} categories={categories} />

      {/* Filters */}
      <ExpenseFilters categories={categories} />

      {/* Action bar */}
      <div style={actionBarStyle}>
        <button className="btn-primary" type="button" onClick={openCreate}>
          + Nova despesa
        </button>
        <ExpenseViewToggle view={view} onViewChange={setView} />
        <button className="btn-secondary" type="button" onClick={() => setCategoryModalOpen(true)}>
          Gerenciar categorias
        </button>
      </div>

      {/* List or empty state */}
      {filteredExpenses.length === 0 && hasFilters ? (
        <div style={emptyStyle}>
          <p style={emptyTextStyle}>Nenhuma despesa encontrada</p>
          <button type="button" className="btn-ghost" onClick={clearFilters}>
            Limpar filtros
          </button>
        </div>
      ) : view === "flat" ? (
        <ExpenseList expenses={filteredExpenses} categories={categories} onSelect={openEdit} />
      ) : (
        <ExpenseGroupedList expenses={filteredExpenses} categories={categories} onSelect={openEdit} />
      )}

      {/* Side panel */}
      <ExpenseSidePanel
        expense={selectedExpense}
        categories={categories}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />

      {/* Category modal */}
      <ExpenseCategoryModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        categories={categories}
      />
    </div>
  );
}

const shellStyle = {
  display: "grid",
  gap: "var(--space-6)",
} satisfies React.CSSProperties;

const actionBarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-3)",
} satisfies React.CSSProperties;

const emptyStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "var(--space-3)",
  padding: "var(--space-8)",
  textAlign: "center",
} satisfies React.CSSProperties;

const emptyTextStyle = {
  color: "var(--color-text-2)",
  fontSize: "var(--font-size-sm)",
} satisfies React.CSSProperties;
