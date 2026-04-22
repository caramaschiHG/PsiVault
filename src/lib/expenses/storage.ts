import type { SupabaseClient } from "@supabase/supabase-js";

export const RECEIPTS_BUCKET = "expense-receipts";
const SIGNED_URL_TTL_SECONDS = 120;

export function buildExpenseReceiptStorageKey(args: {
  workspaceId: string;
  expenseId: string;
  fileName: string;
}): string {
  const safeName = args.fileName.replace(/[^\w.\-]/g, "_");
  return `${args.workspaceId}/${args.expenseId}/${crypto.randomUUID()}-${safeName}`;
}

export async function uploadExpenseReceipt(
  supabase: SupabaseClient,
  args: { storageKey: string; buffer: ArrayBuffer; mimeType: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .upload(args.storageKey, args.buffer, { contentType: args.mimeType });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteExpenseReceipt(
  supabase: SupabaseClient,
  storageKey: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.storage.from(RECEIPTS_BUCKET).remove([storageKey]);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getExpenseReceiptSignedUrl(
  supabase: SupabaseClient,
  storageKey: string,
): Promise<string | null> {
  const { data } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .createSignedUrl(storageKey, SIGNED_URL_TTL_SECONDS);
  return data?.signedUrl ?? null;
}
