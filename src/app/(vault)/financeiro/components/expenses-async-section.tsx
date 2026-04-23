import { getExpenseStore } from "@/lib/expenses/store";
import { getExpenseCategoryStore } from "@/lib/expense-categories/store";
import { ExpensesSection } from "../components/expenses-section";

interface ExpensesAsyncSectionProps {
  workspaceId: string;
}

export async function ExpensesAsyncSection({ workspaceId }: ExpensesAsyncSectionProps) {
  const expenses = await getExpenseStore().repository.findByWorkspace(workspaceId);
  const categories = await getExpenseCategoryStore().repository.findActiveByWorkspace(workspaceId);
  return <ExpensesSection expenses={expenses} categories={categories} />;
}
