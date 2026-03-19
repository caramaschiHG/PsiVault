"use server";

import { revalidatePath } from "next/cache";
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
  savePracticeProfile({
    fullName: readFormValue(formData, "fullName"),
    crp: readFormValue(formData, "crp"),
    contactEmail: readFormValue(formData, "contactEmail"),
    contactPhone: readFormValue(formData, "contactPhone"),
    defaultAppointmentDurationMinutes: readFormValue(
      formData,
      "defaultAppointmentDurationMinutes",
    ),
    defaultSessionPriceInCents: readFormValue(
      formData,
      "defaultSessionPriceInCents",
    ),
    serviceModes: formData.getAll("serviceModes").filter(
      (value): value is string => typeof value === "string",
    ),
  });
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

  const { accountId } = await resolveSession();
  const uuid = crypto.randomUUID();
  const storageKey = `signatures/${accountId}/${uuid}-${file.name}`;

  const buffer = await file.arrayBuffer();
  const supabase = await createClient();

  const { error: uploadError } = await supabase.storage
    .from("signatures")
    .upload(storageKey, buffer, { contentType: file.type });

  if (uploadError) {
    return { error: `Erro no upload: ${uploadError.message}` };
  }

  saveSignatureAsset({
    storageKey,
    fileName: file.name,
    mimeType: file.type,
    fileSize: file.size,
  });

  revalidatePath("/settings/profile");
  return {};
}

export async function removeSignatureAssetAction() {
  clearSignatureAsset();
  revalidatePath("/settings/profile");
}
