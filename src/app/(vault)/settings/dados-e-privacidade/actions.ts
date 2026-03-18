"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const REAUTH_COOKIE_MAX_AGE_SECONDS = 60 * 10; // 10 minutes

interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function confirmBackupAuthAction(input: {
  password: string;
}): Promise<ActionResult> {
  if (!input.password) {
    return { ok: false, error: "Senha obrigatória." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { ok: false, error: "Sessão inválida. Faça login novamente." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: input.password,
  });

  if (error) {
    return { ok: false, error: "Senha incorreta." };
  }

  const cookieStore = await cookies();
  cookieStore.set("psivault_backup_auth", String(Date.now()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REAUTH_COOKIE_MAX_AGE_SECONDS,
  });

  return { ok: true };
}

export async function exportPatientAuthAction(input: {
  password: string;
}): Promise<ActionResult> {
  if (!input.password) {
    return { ok: false, error: "Senha obrigatória." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { ok: false, error: "Sessão inválida. Faça login novamente." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: input.password,
  });

  if (error) {
    return { ok: false, error: "Senha incorreta." };
  }

  const cookieStore = await cookies();
  cookieStore.set("psivault_export_auth", String(Date.now()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REAUTH_COOKIE_MAX_AGE_SECONDS,
  });

  return { ok: true };
}
