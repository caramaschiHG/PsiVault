export const ALLOWED_RECEIPT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export const MAX_RECEIPT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export type ReceiptValidationResult =
  | { ok: true }
  | { ok: false; error: string };

export function validateReceiptFile(file: File): ReceiptValidationResult {
  if (file.size === 0) {
    return { ok: false, error: "Arquivo vazio." };
  }
  if (!ALLOWED_RECEIPT_MIME_TYPES.includes(file.type as (typeof ALLOWED_RECEIPT_MIME_TYPES)[number])) {
    return { ok: false, error: "Formato não suportado. Use PDF, JPG ou PNG." };
  }
  if (file.size > MAX_RECEIPT_SIZE_BYTES) {
    return { ok: false, error: "Arquivo muito grande. Máximo: 10MB." };
  }
  return { ok: true };
}
