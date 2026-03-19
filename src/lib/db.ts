import { PrismaClient, type Workspace } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultPrisma__: PrismaClient | undefined;
}

export const db =
  globalThis.__psivaultPrisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

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

