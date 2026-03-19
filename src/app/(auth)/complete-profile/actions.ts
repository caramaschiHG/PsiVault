"use server";

import { redirect } from "next/navigation";
import { resolveSession } from "@/lib/supabase/session";
import { savePracticeProfile } from "@/lib/setup/profile";

export async function completeProfileAction(formData: FormData) {
  const { accountId, workspaceId } = await resolveSession();
  await savePracticeProfile({
    accountId,
    workspaceId,
    fullName: formData.get("fullName") as string,
    crp: formData.get("crp") as string,
    contactEmail: formData.get("contactEmail") as string,
    contactPhone: formData.get("contactPhone") as string,
    defaultAppointmentDurationMinutes: formData.get("defaultAppointmentDurationMinutes") as string,
    defaultSessionPriceInCents: formData.get("defaultSessionPriceInCents") as string,
    serviceModes: formData.getAll("serviceModes").filter((v): v is string => typeof v === "string"),
  });
  redirect("/inicio");
}
