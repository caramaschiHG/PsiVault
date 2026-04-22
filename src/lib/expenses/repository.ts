import type { Expense, SeriesScope } from "./model";

export interface ExpenseRepository {
  findById(workspaceId: string, id: string): Promise<Expense | null>;
  findByWorkspace(workspaceId: string, opts?: { from?: Date; to?: Date }): Promise<Expense[]>;
  findBySeries(workspaceId: string, seriesId: string): Promise<Expense[]>;
  create(expense: Expense): Promise<Expense>;
  createMany(expenses: Expense[]): Promise<Expense[]>;
  update(workspaceId: string, id: string, patch: Partial<Expense>): Promise<Expense>;
  bulkUpdate(workspaceId: string, ids: string[], patch: Partial<Expense>, now: Date): Promise<void>;
  softDelete(workspaceId: string, id: string, actorId: string, now: Date): Promise<void>;
  softDeleteWithScope(
    workspaceId: string,
    expenseId: string,
    scope: SeriesScope,
    actorId: string,
    now: Date,
  ): Promise<void>;
}

export class InMemoryExpenseRepository implements ExpenseRepository {
  private store = new Map<string, Expense>();

  async findById(workspaceId: string, id: string): Promise<Expense | null> {
    const e = this.store.get(id) ?? null;
    if (!e || e.workspaceId !== workspaceId) return null;
    return e;
  }

  async findByWorkspace(workspaceId: string, opts?: { from?: Date; to?: Date }): Promise<Expense[]> {
    const result: Expense[] = [];
    for (const e of this.store.values()) {
      if (e.workspaceId !== workspaceId || e.deletedAt !== null) continue;
      if (opts?.from && e.dueDate < opts.from) continue;
      if (opts?.to && e.dueDate >= opts.to) continue;
      result.push(e);
    }
    return result;
  }

  async findBySeries(workspaceId: string, seriesId: string): Promise<Expense[]> {
    const result: Expense[] = [];
    for (const e of this.store.values()) {
      if (e.workspaceId !== workspaceId || e.seriesId !== seriesId || e.deletedAt !== null) continue;
      result.push(e);
    }
    return result.sort((a, b) => (a.seriesIndex ?? 0) - (b.seriesIndex ?? 0));
  }

  async create(expense: Expense): Promise<Expense> {
    this.store.set(expense.id, expense);
    return expense;
  }

  async createMany(expenses: Expense[]): Promise<Expense[]> {
    for (const e of expenses) {
      this.store.set(e.id, e);
    }
    return expenses;
  }

  async update(workspaceId: string, id: string, patch: Partial<Expense>): Promise<Expense> {
    const e = this.store.get(id);
    if (!e || e.workspaceId !== workspaceId) {
      throw new Error(`Expense not found: ${id}`);
    }
    const updated = { ...e, ...patch };
    this.store.set(id, updated);
    return updated;
  }

  async bulkUpdate(workspaceId: string, ids: string[], patch: Partial<Expense>, now: Date): Promise<void> {
    for (const id of ids) {
      const e = this.store.get(id);
      if (!e || e.workspaceId !== workspaceId) continue;
      this.store.set(id, { ...e, ...patch, updatedAt: now });
    }
  }

  async softDelete(workspaceId: string, id: string, actorId: string, now: Date): Promise<void> {
    const e = this.store.get(id);
    if (!e || e.workspaceId !== workspaceId) return;
    this.store.set(id, { ...e, deletedAt: now, deletedByAccountId: actorId, updatedAt: now });
  }

  async softDeleteWithScope(
    workspaceId: string,
    expenseId: string,
    scope: SeriesScope,
    actorId: string,
    now: Date,
  ): Promise<void> {
    const expense = this.store.get(expenseId);
    if (!expense || expense.workspaceId !== workspaceId) return;

    if (!expense.seriesId || scope === "this") {
      await this.softDelete(workspaceId, expenseId, actorId, now);
      return;
    }

    const series = await this.findBySeries(workspaceId, expense.seriesId);
    const toDelete = series.filter((occ) => {
      if (scope === "all") return true;
      if (scope === "this_and_future") return (occ.seriesIndex ?? 0) >= (expense.seriesIndex ?? 0);
      return false;
    });

    for (const occ of toDelete) {
      await this.softDelete(workspaceId, occ.id, actorId, now);
    }
  }
}
