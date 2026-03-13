"use server";

import {
  clearSignatureAsset,
  savePracticeProfile,
  saveSignatureAsset,
} from "../../../lib/setup/profile";

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

export async function saveSignatureAssetAction(formData: FormData) {
  saveSignatureAsset({
    fileName: readFormValue(formData, "fileName"),
    mimeType: readFormValue(formData, "mimeType"),
    fileSize: readFormValue(formData, "fileSize"),
  });
}

export async function removeSignatureAssetAction() {
  clearSignatureAsset();
}
