import { PrismaClient, type Workspace } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultPrisma__: PrismaClient | undefined;
}

const prismaClient = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

const extendedClient = prismaClient.$extends({
  query: {
    async $allOperations({ operation, model, args, query }) {
      const start = performance.now();
      const result = await query(args);
      const duration = performance.now() - start;

      if (process.env.NODE_ENV === "development" && duration > 500) {
        // eslint-disable-next-line no-console
        console.warn(
          `[Slow Query] ${model ?? "raw"}.${operation} took ${duration.toFixed(2)}ms`
        );
      }

      return result;
    },
  },
});

export const db =
  globalThis.__psivaultPrisma__ ?? extendedClient;

globalThis.__psivaultPrisma__ = db;

export function buildOwnedWorkspaceSelector(accountId: string, workspaceId: string) {
  return {
    id_ownerAccountId: {
      id: workspaceId,
      ownerAccountId: accountId,
    },
  } as const;
}

export function ownsWorkspace(
  workspace: Pick<Workspace, "id" | "ownerAccountId">,
  accountId: string,
  workspaceId: string,
) {
  return workspace.id === workspaceId && workspace.ownerAccountId === accountId;
}
