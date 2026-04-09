"use server";

import { revalidatePath } from "next/cache";
import { resolveSession } from "@/lib/supabase/session";
import { getFinanceRepository } from "@/lib/finance/store";
import { getPatientRepository } from "@/lib/patients/store";
import { createSessionCharge } from "@/lib/finance/model";

const createId = () => `chg_${crypto.randomUUID().slice(0, 12)}`;

export async function markChargeAsPaidAction(
  chargeId: string,
  paymentMethod?: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { workspaceId } = await resolveSession();
    const financeRepo = getFinanceRepository();

    const charge = await financeRepo.findById(chargeId, workspaceId);
    if (!charge) {
      return { ok: false, error: "Cobrança não encontrada." };
    }

    const updated = {
      ...charge,
      status: "pago" as const,
      paymentMethod: paymentMethod ?? charge.paymentMethod,
      paidAt: new Date(),
    };
    await financeRepo.save(updated);
    revalidatePath("/financeiro");
    return { ok: true };
  } catch (err) {
    console.error("[markChargeAsPaidAction]", err);
    return { ok: false, error: "Erro ao marcar como pago." };
  }
}

export async function undoChargePaymentAction(
  chargeId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { workspaceId } = await resolveSession();
    const financeRepo = getFinanceRepository();

    const charge = await financeRepo.findById(chargeId, workspaceId);
    if (!charge) {
      return { ok: false, error: "Cobrança não encontrada." };
    }

    const updated = {
      ...charge,
      status: "pendente" as const,
      paymentMethod: null,
      paidAt: null,
    };
    await financeRepo.save(updated);
    revalidatePath("/financeiro");
    return { ok: true };
  } catch (err) {
    console.error("[undoChargePaymentAction]", err);
    return { ok: false, error: "Erro ao desfazer pagamento." };
  }
}

export async function createManualChargeAction(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { workspaceId } = await resolveSession();
    const financeRepo = getFinanceRepository();
    const patientRepo = getPatientRepository();

    const patientId = formData.get("patientId") as string;
    const amountBrl = parseFloat(formData.get("amountBrl") as string);
    const dateStr = formData.get("date") as string;

    if (!patientId) return { ok: false, error: "Selecione um paciente." };
    if (isNaN(amountBrl) || amountBrl <= 0) return { ok: false, error: "Valor inválido." };

    const amountInCents = Math.round(amountBrl * 100);

    const patients = await patientRepo.listActive(workspaceId);
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return { ok: false, error: "Paciente não encontrado." };

    const date = dateStr ? new Date(dateStr + "T00:00:00Z") : new Date();

    const charge = createSessionCharge(
      {
        workspaceId,
        patientId,
        appointmentId: "",
        amountInCents,
      },
      { now: date, createId },
    );

    await financeRepo.save(charge);
    revalidatePath("/financeiro");
    return { ok: true };
  } catch (err) {
    console.error("[createManualChargeAction]", err);
    return { ok: false, error: "Erro ao adicionar cobrança." };
  }
}

export async function exportFinanceCSVAction(
  year: number,
  month: number,
): Promise<string | null> {
  try {
    const { workspaceId } = await resolveSession();
    const financeRepo = getFinanceRepository();
    const patientRepo = getPatientRepository();

    const [activePatients, archivedPatients] = await Promise.all([
      patientRepo.listActive(workspaceId),
      patientRepo.listArchived(workspaceId),
    ]);
    const allPatients = [...activePatients, ...archivedPatients];
    const patientNameMap = new Map<string, string>(
      allPatients.map((p) => [p.id, p.socialName ?? p.fullName]),
    );

    const charges = await financeRepo.listByWorkspaceAndMonth(workspaceId, year, month);

    const statusLabels: Record<string, string> = {
      pago: "Pago",
      pendente: "Pendente",
      atrasado: "Atrasado",
    };

    const currencyFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
    const dateFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });

    const header = "Paciente,Data,Status,Valor";
    const rows = charges.map((c) => {
      const name = `"${patientNameMap.get(c.patientId) ?? c.patientId}"`;
      const date = dateFmt.format(c.createdAt);
      const status = statusLabels[c.status] ?? c.status;
      const amount = c.amountInCents !== null ? currencyFmt.format(c.amountInCents / 100) : "—";
      return `${name},${date},${status},${amount}`;
    });

    return [header, ...rows].join("\n");
  } catch (err) {
    console.error("[exportFinanceCSVAction]", err);
    return null;
  }
}
