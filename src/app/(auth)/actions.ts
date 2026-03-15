"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AUTH_ROUTE_PATHS } from "@/lib/supabase/constants";

export async function signIn(formData: FormData): Promise<void> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // For now we just throw or redirect back with error in URL
    // Proper error handling will be added in Phase 8 polish
    redirect(`${AUTH_ROUTE_PATHS.signIn}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(AUTH_ROUTE_PATHS.mfaSetup);
}

export async function signUp(formData: FormData): Promise<void> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("displayName") as string;
  
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    redirect(`${AUTH_ROUTE_PATHS.signUp}?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    const { db } = await import("@/lib/db");
    
    // Provision Account and Workspace locally
    await db.account.create({
      data: {
        id: data.user.id,
        email: data.user.email!,
        displayName: displayName,
        workspace: {
          create: {
            slug: `ws_${data.user.id.substring(0, 8)}`,
            displayName: `Consultório de ${displayName}`,
          }
        }
      }
    });
  }

  redirect(AUTH_ROUTE_PATHS.verifyEmail);
}
