import { db } from "../db";
import type { ExpenseCategoryRepository } from "./repository";
import type { ExpenseCategory } from "./model";

function mapToDomain(row: {
  id: string;
  workspaceId: string;
  name: string;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  deletedByAccountId: string | null;
}): ExpenseCategory {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    name: row.name,
    archived: row.archived,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
    deletedByAccountId: row.deletedByAccountId,
  };
}

export function createPrismaExpenseCategoryRepository(): ExpenseCategoryRepository {
  return {
    async findById(workspaceId: string, id: string): Promise<ExpenseCategory | null> {
      const row = await db.expenseCategory.findFirst({ where: { id, workspaceId } });
      return row ? mapToDomain(row) : null;
    },

    async findByWorkspace(workspaceId: string): Promise<ExpenseCategory[]> {
      const rows = await db.expenseCategory.findMany({
        where: { workspaceId, deletedAt: null },
        orderBy: { name: "asc" },
      });
      return rows.map(mapToDomain);
    },

    async findActiveByWorkspace(workspaceId: string): Promise<ExpenseCategory[]> {
      const rows = await db.expenseCategory.findMany({
        where: { workspaceId, archived: false, deletedAt: null },
        orderBy: { name: "asc" },
      });
      return rows.map(mapToDomain);
    },

    async create(category: ExpenseCategory): Promise<ExpenseCategory> {
      const row = await db.expenseCategory.create({
        data: {
          id: category.id,
          workspaceId: category.workspaceId,
          name: category.name,
          archived: category.archived,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          deletedAt: null,
          deletedByAccountId: null,
        },
      });
      return mapToDomain(row);
    },

    async update(workspaceId: string, id: string, patch: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
      const row = await db.expenseCategory.update({
        where: { id, workspaceId },
        data: { ...patch, updatedAt: patch.updatedAt ?? new Date() },
      });
      return mapToDomain(row);
    },

    async softDelete(workspaceId: string, id: string, actorId: string, now: Date): Promise<void> {
      await db.expenseCategory.update({
        where: { id, workspaceId },
        data: { deletedAt: now, deletedByAccountId: actorId },
      });
    },
  };
}
