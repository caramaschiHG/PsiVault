"use client";

import { useState } from "react";
import type { Expense } from "@/lib/expenses/model";
import type { ExpenseCategory } from "@/lib/expense-categories/model";
import { ExpenseStatCards } from "./expense-stat-cards";
import { ExpenseViewToggle } from "./expense-view-toggle";
import { ExpenseList } from "./expense-list";
import { ExpenseGroupedList } from "./expense-grouped-list";
import { ExpenseSidePanel } from "./expense-side-panel";
import { ExpenseCategoryModal } from "./expense-category-modal";

interface ExpensesSectionProps {
  expenses: Expense[];
  categories: ExpenseCategory[];
}

export function ExpensesSection({ expenses, categories }: ExpensesSectionProps) {
  const [view, setView] = useState<"flat" | "grouped">("flat");
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

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

  return (
    <div style={shellStyle}>
      {/* Stat cards */}
      <ExpenseStatCards expenses={expenses} categories={categories} />

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

      {/* List */}
      {view === "flat" ? (
        <ExpenseList expenses={expenses} categories={categories} onSelect={openEdit} />
      ) : (
        <ExpenseGroupedList expenses={expenses} categories={categories} onSelect={openEdit} />
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
