import type { ExpenseCategory } from "./model";

export interface ExpenseCategoryRepository {
  findById(workspaceId: string, id: string): Promise<ExpenseCategory | null>;
  findByWorkspace(workspaceId: string): Promise<ExpenseCategory[]>;
  findActiveByWorkspace(workspaceId: string): Promise<ExpenseCategory[]>;
  create(category: ExpenseCategory): Promise<ExpenseCategory>;
  update(workspaceId: string, id: string, patch: Partial<ExpenseCategory>): Promise<ExpenseCategory>;
  softDelete(workspaceId: string, id: string, actorId: string, now: Date): Promise<void>;
}

export class InMemoryExpenseCategoryRepository implements ExpenseCategoryRepository {
  private store = new Map<string, ExpenseCategory>();

  findById(workspaceId: string, id: string): Promise<ExpenseCategory | null> {
    const cat = this.store.get(id) ?? null;
    if (!cat || cat.workspaceId !== workspaceId) return Promise.resolve(null);
    return Promise.resolve(cat);
  }

  findByWorkspace(workspaceId: string): Promise<ExpenseCategory[]> {
    const result: ExpenseCategory[] = [];
    for (const cat of this.store.values()) {
      if (cat.workspaceId === workspaceId && cat.deletedAt === null) {
        result.push(cat);
      }
    }
    return Promise.resolve(result);
  }

  findActiveByWorkspace(workspaceId: string): Promise<ExpenseCategory[]> {
    const result: ExpenseCategory[] = [];
    for (const cat of this.store.values()) {
      if (cat.workspaceId === workspaceId && cat.deletedAt === null && cat.archived === false) {
        result.push(cat);
      }
    }
    return Promise.resolve(result);
  }

  create(category: ExpenseCategory): Promise<ExpenseCategory> {
    this.store.set(category.id, category);
    return Promise.resolve(category);
  }

  update(workspaceId: string, id: string, patch: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    const cat = this.store.get(id);
    if (!cat || cat.workspaceId !== workspaceId) {
      return Promise.reject(new Error(`ExpenseCategory not found: ${id}`));
    }
    const updated = { ...cat, ...patch };
    this.store.set(id, updated);
    return Promise.resolve(updated);
  }

  softDelete(workspaceId: string, id: string, actorId: string, now: Date): Promise<void> {
    const cat = this.store.get(id);
    if (!cat || cat.workspaceId !== workspaceId) {
      return Promise.reject(new Error(`ExpenseCategory not found: ${id}`));
    }
    this.store.set(id, { ...cat, deletedAt: now, deletedByAccountId: actorId });
    return Promise.resolve();
  }
}
