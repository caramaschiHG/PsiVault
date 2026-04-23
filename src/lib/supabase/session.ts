import { createClient } from "./server";
import { db } from "@/lib/db";
import { logServerRenderError, logServerRenderInfo, observeServerStage } from "@/lib/observability/server-render";
import { redirect } from "next/navigation";
import { cache } from 'react'

export interface ResolvedSession {
  accountId: string;
  workspaceId: string;
}

/**
 * Resolves the authenticated user's accountId and workspaceId from the Supabase session.
 * Redirects to sign-in if unauthenticated or workspace not found.
 */
export const resolveSession = cache(async (): Promise<ResolvedSession> => {
  const route = "lib.resolveSession";
  const supabase = await observeServerStage(route, "createSupabaseClient", () => createClient());
  const {
    data: { user },
  } = await observeServerStage(route, "getSupabaseUser", () => supabase.auth.getUser());

  if (!user) {
    logServerRenderInfo(route, "redirectUnauthenticated");
    redirect("/sign-in");
  }

  const accountId = user.id;
  const baseMetadata = { accountId };

  try {
    let workspace = await observeServerStage(
      route,
      "findWorkspace",
      () =>
        db.workspace.findUnique({
          where: { ownerAccountId: accountId },
          select: { id: true },
        }),
      baseMetadata,
    );

    if (!workspace) {
      logServerRenderInfo(route, "workspaceMissing:autoProvision", baseMetadata);

      // Auto-provision account + workspace for users authenticated via Supabase
      // who don't yet have a Prisma record (e.g. created via Supabase dashboard).
      const email = user.email ?? `${accountId}@unknown`;
      const displayName = (user.user_metadata?.display_name as string | undefined) ?? email;
      const result = await observeServerStage(
        route,
        "autoProvisionWorkspace",
        () =>
          db.account.upsert({
            where: { id: accountId },
            update: {},
            create: {
              id: accountId,
              email,
              displayName,
              workspace: {
                create: {
                  slug: `ws_${accountId.substring(0, 8)}`,
                  displayName: `Consultório de ${displayName}`,
                },
              },
            },
            select: { workspace: { select: { id: true } } },
          }),
        baseMetadata,
      );
      workspace = result.workspace;
    }

    if (!workspace?.id) {
      const sessionError = new Error("Workspace resolution returned no workspace id.");
      logServerRenderError(route, "workspaceResolutionInvariant", sessionError, baseMetadata);
      throw sessionError;
    }

    logServerRenderInfo(route, "resolved", {
      accountId,
      workspaceId: workspace.id,
    });

    return { accountId, workspaceId: workspace.id };
  } catch (error) {
    logServerRenderError(route, "resolveSessionFailed", error, baseMetadata);
    throw error;
  }
})
