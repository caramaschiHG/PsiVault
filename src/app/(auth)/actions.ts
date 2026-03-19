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
    redirect(`${AUTH_ROUTE_PATHS.signIn}?error=${encodeURIComponent(error.message)}`);
  }

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const hasVerifiedTotp = factors?.totp?.some((f: { status: string }) => f.status === "verified") ?? false;
  redirect(hasVerifiedTotp ? AUTH_ROUTE_PATHS.mfaVerify : AUTH_ROUTE_PATHS.mfaSetup);
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

    // Supabase can return a user object even when the e-mail is already registered.
    // Local provisioning must therefore be idempotent instead of assuming a fresh account.
    const safeEmail = data.user.email ?? email;
    const safeDisplayName =
      displayName.trim() ||
      (data.user.user_metadata?.display_name as string | undefined) ||
      safeEmail;

    const account = await db.account.upsert({
      where: { email: safeEmail },
      update: {
        displayName: safeDisplayName,
      },
      create: {
        id: data.user.id,
        email: safeEmail,
        displayName: safeDisplayName,
      },
      select: { id: true },
    });

    await db.workspace.upsert({
      where: { ownerAccountId: account.id },
      update: {
        displayName: `Consultório de ${safeDisplayName}`,
      },
      create: {
        ownerAccountId: account.id,
        slug: `ws_${account.id.substring(0, 8)}`,
        displayName: `Consultório de ${safeDisplayName}`,
      },
    });
  }

  redirect(AUTH_ROUTE_PATHS.verifyEmail);
}

export async function requestPasswordReset(formData: FormData): Promise<void> {
  const email = formData.get("email") as string;
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  });

  redirect(
    `${AUTH_ROUTE_PATHS.resetPassword}?success=${encodeURIComponent(
      "Link de recuperação enviado. Verifique seu e-mail."
    )}`
  );
}

export async function updatePassword(formData: FormData): Promise<void> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const code = formData.get("code") as string;

  if (password !== confirmPassword) {
    redirect(
      `${AUTH_ROUTE_PATHS.resetPassword}?code=${encodeURIComponent(code)}&field=confirmPassword&error=${encodeURIComponent(
        "As senhas não coincidem."
      )}`
    );
  }

  const supabase = await createClient();

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    redirect(
      `${AUTH_ROUTE_PATHS.resetPassword}?error=${encodeURIComponent(exchangeError.message)}`
    );
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(
      `${AUTH_ROUTE_PATHS.resetPassword}?code=${encodeURIComponent(code)}&error=${encodeURIComponent(error.message)}`
    );
  }

  redirect(
    `${AUTH_ROUTE_PATHS.signIn}?success=${encodeURIComponent(
      "Senha atualizada. Faça login com a nova senha."
    )}`
  );
}
