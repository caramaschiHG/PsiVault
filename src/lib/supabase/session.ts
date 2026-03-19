"use server";

import { createClient } from "./server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export interface ResolvedSession {
  accountId: string;
  workspaceId: string;
}

/**
 * Resolves the authenticated user's accountId and workspaceId from the Supabase session.
 * Redirects to sign-in if unauthenticated or workspace not found.
 */
export async function resolveSession(): Promise<ResolvedSession> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const accountId = user.id;

  let workspace = await db.workspace.findUnique({
    where: { ownerAccountId: accountId },
    select: { id: true },
  });

  if (!workspace) {
    // Auto-provision account + workspace for users authenticated via Supabase
    // who don't yet have a Prisma record (e.g. created via Supabase dashboard).
    const email = user.email ?? `${accountId}@unknown`;
    const displayName = (user.user_metadata?.display_name as string | undefined) ?? email;
    const result = await db.account.upsert({
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
    });
    workspace = result.workspace!;
  }

  return { accountId, workspaceId: workspace.id };
}
