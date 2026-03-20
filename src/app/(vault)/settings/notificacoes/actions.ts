"use server";

import { revalidatePath } from "next/cache";
import { resolveSession } from "../../../../lib/supabase/session";
import { getSmtpConfigRepository } from "../../../../lib/notifications/smtp-config-store";
import { encryptSmtpPassword } from "../../../../lib/notifications/crypto";
import { verifySmtpConnection } from "../../../../lib/notifications/mailer";
import type { WorkspaceSmtpConfig } from "../../../../lib/notifications/smtp-config";

function generateId() {
  const buffer = new Uint8Array(9);
  globalThis.crypto.getRandomValues(buffer);
  return Array.from(buffer, (v) => v.toString(16).padStart(2, "0")).join("");
}

export type SmtpActionResult = { success: boolean; error?: string; message?: string };

export async function saveSmtpConfigAction(
  _prevState: SmtpActionResult | null,
  formData: FormData,
): Promise<SmtpActionResult> {
  const { workspaceId } = await resolveSession();
  const repo = getSmtpConfigRepository();

  const host = String(formData.get("host") ?? "").trim();
  const port = Number(formData.get("port") ?? 587);
  const secure = formData.get("secure") === "true";
  const username = String(formData.get("username") ?? "").trim();
  const passwordRaw = String(formData.get("password") ?? "").trim();
  const fromName = String(formData.get("fromName") ?? "").trim();
  const fromEmail = String(formData.get("fromEmail") ?? "").trim();
  const sendReminder24h = formData.get("sendReminder24h") === "on";
  const sendReminder1h = formData.get("sendReminder1h") === "on";
  const sendConfirmation = formData.get("sendConfirmation") === "on";
  const sendCancellation = formData.get("sendCancellation") === "on";

  if (!host || !username || !fromName || !fromEmail) {
    return { success: false, error: "Preencha todos os campos obrigatórios." };
  }

  try {
    const existing = await repo.findByWorkspace(workspaceId);

    // Only re-encrypt if a new password was provided
    let passwordCiphertext: string;
    if (passwordRaw) {
      passwordCiphertext = encryptSmtpPassword(passwordRaw);
    } else if (existing?.passwordCiphertext) {
      passwordCiphertext = existing.passwordCiphertext;
    } else {
      return { success: false, error: "Informe a senha SMTP." };
    }

    const config: WorkspaceSmtpConfig = {
      id: existing?.id ?? generateId(),
      workspaceId,
      host,
      port,
      secure,
      username,
      passwordCiphertext,
      fromName,
      fromEmail,
      sendReminder24h,
      sendReminder1h,
      sendConfirmation,
      sendCancellation,
      createdAt: existing?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };

    await repo.save(config);
    revalidatePath("/settings/notificacoes");
    return { success: true, message: "Configuração salva com sucesso." };
  } catch (err) {
    console.error("[saveSmtpConfigAction]", err);
    return { success: false, error: "Erro ao salvar configuração." };
  }
}

export async function testSmtpConnectionAction(
  _prevState: SmtpActionResult | null,
  formData: FormData,
): Promise<SmtpActionResult> {
  const { workspaceId } = await resolveSession();
  const repo = getSmtpConfigRepository();

  const host = String(formData.get("host") ?? "").trim();
  const port = Number(formData.get("port") ?? 587);
  const secure = formData.get("secure") === "true";
  const username = String(formData.get("username") ?? "").trim();
  const passwordRaw = String(formData.get("password") ?? "").trim();
  const fromName = String(formData.get("fromName") ?? "").trim();
  const fromEmail = String(formData.get("fromEmail") ?? "").trim();

  if (!host || !username || !fromName || !fromEmail) {
    return { success: false, error: "Preencha todos os campos antes de testar." };
  }

  try {
    const existing = await repo.findByWorkspace(workspaceId);

    let passwordCiphertext: string;
    if (passwordRaw) {
      passwordCiphertext = encryptSmtpPassword(passwordRaw);
    } else if (existing?.passwordCiphertext) {
      passwordCiphertext = existing.passwordCiphertext;
    } else {
      return { success: false, error: "Informe a senha SMTP para testar." };
    }

    const testConfig: WorkspaceSmtpConfig = {
      id: "test",
      workspaceId,
      host,
      port,
      secure,
      username,
      passwordCiphertext,
      fromName,
      fromEmail,
      sendReminder24h: true,
      sendReminder1h: true,
      sendConfirmation: true,
      sendCancellation: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await verifySmtpConnection(testConfig);
    return { success: true, message: "Conexão bem-sucedida. SMTP configurado corretamente." };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Falha na conexão: ${msg}` };
  }
}
