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

  const workspace = await db.workspace.findUnique({
    where: { ownerAccountId: accountId },
    select: { id: true },
  });

  if (!workspace) {
    redirect("/sign-in");
  }

  return { accountId, workspaceId: workspace.id };
}
