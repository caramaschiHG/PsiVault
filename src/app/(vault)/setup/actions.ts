"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "../../../lib/cache/tags";
import {
  clearSignatureAsset,
  savePracticeProfile,
  saveSignatureAsset,
} from "../../../lib/setup/profile";
import { createClient } from "../../../lib/supabase/server";
import { resolveSession } from "../../../lib/supabase/session";

function readFormValue(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

export async function savePracticeProfileAction(formData: FormData) {
  const { accountId, workspaceId } = await resolveSession();

  await savePracticeProfile({
    accountId,
    workspaceId,
    fullName: readFormValue(formData, "fullName"),
    crp: readFormValue(formData, "crp"),
    contactEmail: readFormValue(formData, "contactEmail"),
    contactPhone: readFormValue(formData, "contactPhone"),
    defaultAppointmentDurationMinutes: readFormValue(
      formData,
      "defaultAppointmentDurationMinutes",
    ),
    defaultSessionPriceInCents: (() => {
      const raw = readFormValue(formData, "defaultSessionPriceInReais");
      const reais = parseFloat(raw);
      return Number.isFinite(reais) && reais > 0 ? String(Math.round(reais * 100)) : "";
    })(),
    serviceModes: formData.getAll("serviceModes").filter(
      (value): value is string => typeof value === "string",
    ),
    theoreticalOrientation: readFormValue(formData, "theoreticalOrientation"),
    preferredThinker: readFormValue(formData, "preferredThinker"),
  });

  revalidatePath("/settings/profile", "page");
  revalidateTag(CACHE_TAGS.practiceProfile);
}

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function saveSignatureAssetAction(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Nenhum arquivo selecionado." };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { error: "Formato não suportado. Use PNG, JPG ou SVG." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "Arquivo muito grande. Máximo: 2MB." };
  }

  const { accountId, workspaceId } = await resolveSession();
  const uuid = crypto.randomUUID();
  const storageKey = `${accountId}/${uuid}-${file.name}`;

  const buffer = await file.arrayBuffer();
  const supabase = await createClient();

  const { error: uploadError } = await supabase.storage
    .from("signatures")
    .upload(storageKey, buffer, { contentType: file.type });

  if (uploadError) {
    return { error: `Erro no upload: ${uploadError.message}` };
  }

  await saveSignatureAsset({
    accountId,
    workspaceId,
    storageKey,
    fileName: file.name,
    mimeType: file.type,
    fileSize: file.size,
  });

  revalidatePath("/settings/profile", "page");
  revalidateTag(CACHE_TAGS.practiceProfile);
  return {};
}

export async function removeSignatureAssetAction() {
  const { accountId, workspaceId } = await resolveSession();

  await clearSignatureAsset(accountId, workspaceId);
  revalidatePath("/settings/profile", "page");
  revalidateTag(CACHE_TAGS.practiceProfile);
}
