import { db } from "../db";
import type { Expense, SeriesScope } from "./model";
import type { ExpenseRepository } from "./repository";
import type { Expense as PrismaExpense } from "@prisma/client";

function mapToDomain(e: PrismaExpense): Expense {
  return {
    id: e.id,
    workspaceId: e.workspaceId,
    categoryId: e.categoryId,
    description: e.description,
    amountInCents: e.amountInCents,
    dueDate: e.dueDate,
    recurrencePattern: (e.recurrencePattern as Expense["recurrencePattern"]) ?? null,
    seriesId: e.seriesId,
    seriesIndex: e.seriesIndex,
    receiptStorageKey: e.receiptStorageKey,
    receiptFileName: e.receiptFileName,
    receiptMimeType: e.receiptMimeType,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
    createdByAccountId: e.createdByAccountId,
    deletedAt: e.deletedAt,
    deletedByAccountId: e.deletedByAccountId,
  };
}

export function createPrismaExpenseRepository(): ExpenseRepository {
  return {
    async findById(workspaceId: string, id: string): Promise<Expense | null> {
      const e = await db.expense.findUnique({ where: { id } });
      if (!e || e.workspaceId !== workspaceId) return null;
      return mapToDomain(e);
    },

    async findByWorkspace(workspaceId: string, opts?: { from?: Date; to?: Date }): Promise<Expense[]> {
      const rows = await db.expense.findMany({
        where: {
          workspaceId,
          deletedAt: null,
          ...(opts?.from && {
            dueDate: {
              gte: opts.from,
              ...(opts?.to && { lt: opts.to }),
            },
          }),
        },
        orderBy: { dueDate: "asc" },
      });
      return rows.map(mapToDomain);
    },

    async findBySeries(workspaceId: string, seriesId: string): Promise<Expense[]> {
      const rows = await db.expense.findMany({
        where: { workspaceId, seriesId, deletedAt: null },
        orderBy: { seriesIndex: "asc" },
      });
      return rows.map(mapToDomain);
    },

    async create(expense: Expense): Promise<Expense> {
      const e = await db.expense.create({
        data: {
          id: expense.id,
          workspaceId: expense.workspaceId,
          categoryId: expense.categoryId,
          description: expense.description,
          amountInCents: expense.amountInCents,
          dueDate: expense.dueDate,
          recurrencePattern: expense.recurrencePattern,
          seriesId: expense.seriesId,
          seriesIndex: expense.seriesIndex,
          receiptStorageKey: expense.receiptStorageKey,
          receiptFileName: expense.receiptFileName,
          receiptMimeType: expense.receiptMimeType,
          createdByAccountId: expense.createdByAccountId,
          deletedAt: expense.deletedAt,
          deletedByAccountId: expense.deletedByAccountId,
        },
      });
      return mapToDomain(e);
    },

    async createMany(expenses: Expense[]): Promise<Expense[]> {
      const results = await db.$transaction(
        expenses.map((expense) =>
          db.expense.create({
            data: {
              id: expense.id,
              workspaceId: expense.workspaceId,
              categoryId: expense.categoryId,
              description: expense.description,
              amountInCents: expense.amountInCents,
              dueDate: expense.dueDate,
              recurrencePattern: expense.recurrencePattern,
              seriesId: expense.seriesId,
              seriesIndex: expense.seriesIndex,
              receiptStorageKey: expense.receiptStorageKey,
              receiptFileName: expense.receiptFileName,
              receiptMimeType: expense.receiptMimeType,
              createdByAccountId: expense.createdByAccountId,
              deletedAt: expense.deletedAt,
              deletedByAccountId: expense.deletedByAccountId,
            },
          }),
        ),
      );
      return results.map(mapToDomain);
    },

    async update(workspaceId: string, id: string, patch: Partial<Expense>): Promise<Expense> {
      const e = await db.expense.update({
        where: { id },
        data: { ...patch },
      });
      if (e.workspaceId !== workspaceId) throw new Error(`Workspace mismatch for expense ${id}`);
      return mapToDomain(e);
    },

    async bulkUpdate(workspaceId: string, ids: string[], patch: Partial<Expense>, now: Date): Promise<void> {
      await db.$transaction(
        ids.map((id) =>
          db.expense.update({
            where: { id },
            data: { ...patch, updatedAt: now },
          }),
        ),
      );
    },

    async softDelete(workspaceId: string, id: string, actorId: string, now: Date): Promise<void> {
      await db.expense.update({
        where: { id },
        data: { deletedAt: now, deletedByAccountId: actorId, updatedAt: now },
      });
      void workspaceId;
    },

    async softDeleteWithScope(
      workspaceId: string,
      expenseId: string,
      scope: SeriesScope,
      actorId: string,
      now: Date,
    ): Promise<void> {
      const expense = await db.expense.findUnique({ where: { id: expenseId } });
      if (!expense || expense.workspaceId !== workspaceId) return;

      if (!expense.seriesId || scope === "this") {
        await db.expense.update({
          where: { id: expenseId },
          data: { deletedAt: now, deletedByAccountId: actorId, updatedAt: now },
        });
        return;
      }

      const series = await db.expense.findMany({
        where: { workspaceId, seriesId: expense.seriesId, deletedAt: null },
      });

      const toDelete = series.filter((occ) => {
        if (scope === "all") return true;
        if (scope === "this_and_future") return (occ.seriesIndex ?? 0) >= (expense.seriesIndex ?? 0);
        return false;
      });

      const ids = toDelete.map((occ) => occ.id);
      await db.$transaction(
        ids.map((id) =>
          db.expense.update({
            where: { id },
            data: { deletedAt: now, deletedByAccountId: actorId, updatedAt: now },
          }),
        ),
      );
    },
  };
}
