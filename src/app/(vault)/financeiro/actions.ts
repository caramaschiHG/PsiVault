"use server";

import { revalidatePath } from "next/cache";
import { resolveSession } from "@/lib/supabase/session";
import { getFinanceRepository } from "@/lib/finance/store";
import { getPatientRepository } from "@/lib/patients/store";
import { createSessionCharge } from "@/lib/finance/model";
import { getExpenseCategoryStore } from "@/lib/expense-categories/store";
import { getExpenseStore } from "@/lib/expenses/store";
import { createExpenseCategory, renameExpenseCategory, archiveExpenseCategory } from "@/lib/expense-categories/model";
import { createExpense, type SeriesScope } from "@/lib/expenses/model";
import { materializeSeries } from "@/lib/expenses/series";
import { parseBRLToCents } from "@/lib/expenses/format";
import { validateReceiptFile } from "@/lib/expenses/upload-validation";
import { buildExpenseReceiptStorageKey, uploadExpenseReceipt, deleteExpenseReceipt } from "@/lib/expenses/storage";
import { createClient } from "@/lib/supabase/server";

const createId = () => `chg_${crypto.randomUUID().slice(0, 12)}`;
const createExpenseCategoryId = () => `excat_${crypto.randomUUID().slice(0, 12)}`;
const createExpenseId = () => `exp_${crypto.randomUUID().slice(0, 12)}`;
const createSeriesId = () => `expser_${crypto.randomUUID().slice(0, 12)}`;

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
    revalidatePath("/financeiro", "page");
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
    revalidatePath("/financeiro", "page");
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
        appointmentId: null,
        amountInCents,
      },
      { now: date, createId },
    );

    await financeRepo.save(charge);
    revalidatePath("/financeiro", "page");
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

    // Single-month CSV export — intentionally uses per-month query, not the batch range
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

// ─── Expense Category Actions ─────────────────────────────────────────────────

export async function createExpenseCategoryAction(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string; categoryId?: string }> {
  const { workspaceId } = await resolveSession();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 1 || name.length > 60) {
    return { error: "Nome da categoria precisa ter entre 1 e 60 caracteres." };
  }
  const repo = getExpenseCategoryStore().repository;
  const category = createExpenseCategory(
    { workspaceId, name },
    { now: new Date(), createId: createExpenseCategoryId },
  );
  await repo.create(category);
  revalidatePath("/financeiro", "page");
  return { categoryId: category.id };
}

export async function renameExpenseCategoryAction(
  categoryId: string,
  newName: string,
): Promise<{ error?: string }> {
  const { workspaceId } = await resolveSession();
  const name = newName.trim();
  if (name.length < 1 || name.length > 60) {
    return { error: "Nome da categoria precisa ter entre 1 e 60 caracteres." };
  }
  const repo = getExpenseCategoryStore().repository;
  const category = await repo.findById(workspaceId, categoryId);
  if (!category) return { error: "Categoria não encontrada." };
  const updated = renameExpenseCategory(category, name, { now: new Date() });
  await repo.update(workspaceId, categoryId, updated);
  revalidatePath("/financeiro", "page");
  return {};
}

export async function archiveExpenseCategoryAction(
  categoryId: string,
): Promise<{ error?: string }> {
  const { workspaceId } = await resolveSession();
  const repo = getExpenseCategoryStore().repository;
  const category = await repo.findById(workspaceId, categoryId);
  if (!category) return { error: "Categoria não encontrada." };
  const updated = archiveExpenseCategory(category, { now: new Date() });
  await repo.update(workspaceId, categoryId, updated);
  revalidatePath("/financeiro", "page");
  return {};
}

// ─── Expense Actions ──────────────────────────────────────────────────────────

export async function createExpenseAction(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string; expenseId?: string }> {
  const { accountId, workspaceId } = await resolveSession();

  const description = String(formData.get("description") ?? "").trim();
  const amountText = String(formData.get("amount") ?? "");
  const amountInCents = parseBRLToCents(amountText);
  const categoryId = String(formData.get("categoryId") ?? "");
  const dueDateStr = String(formData.get("dueDate") ?? "");
  const recurrenceRaw = formData.get("recurrencePattern");
  const recurrencePattern =
    recurrenceRaw === "MENSAL" || recurrenceRaw === "QUINZENAL" ? recurrenceRaw : null;

  if (description.length < 1 || description.length > 200) return { error: "Descrição inválida." };
  if (!amountInCents || amountInCents <= 0) return { error: "Valor inválido." };
  if (!categoryId) return { error: "Categoria obrigatória." };
  const dueDate = new Date(dueDateStr);
  if (Number.isNaN(dueDate.getTime())) return { error: "Data inválida." };

  const categoryRepo = getExpenseCategoryStore().repository;
  const category = await categoryRepo.findById(workspaceId, categoryId);
  if (!category) return { error: "Categoria não encontrada." };

  const repo = getExpenseStore().repository;

  if (recurrencePattern) {
    const series = materializeSeries(
      {
        workspaceId,
        categoryId,
        description,
        amountInCents,
        recurrencePattern,
        firstOccurrenceDate: dueDate,
        createdByAccountId: accountId,
      },
      { now: new Date(), createId: createExpenseId, createSeriesId },
    );
    await repo.createMany(series);
    revalidatePath("/financeiro", "page");
    return { expenseId: series[0].id };
  } else {
    const expense = createExpense(
      { workspaceId, categoryId, description, amountInCents, dueDate, createdByAccountId: accountId },
      { now: new Date(), createId: createExpenseId },
    );
    await repo.create(expense);
    revalidatePath("/financeiro", "page");
    return { expenseId: expense.id };
  }
}

export async function updateExpenseAction(
  expenseId: string,
  scope: SeriesScope,
  patch: { description?: string; amountInCents?: number; categoryId?: string },
): Promise<{ error?: string }> {
  const { workspaceId } = await resolveSession();
  const repo = getExpenseStore().repository;
  const target = await repo.findById(workspaceId, expenseId);
  if (!target) return { error: "Despesa não encontrada." };

  if (target.seriesId && scope !== "this") {
    const series = await repo.findBySeries(workspaceId, target.seriesId);
    const fromIndex = target.seriesIndex ?? 0;
    const ids = series
      .filter((e) => {
        if (scope === "all") return true;
        return (e.seriesIndex ?? 0) >= fromIndex;
      })
      .map((e) => e.id);
    await repo.bulkUpdate(workspaceId, ids, patch, new Date());
  } else {
    await repo.update(workspaceId, expenseId, { ...patch, updatedAt: new Date() });
  }

  revalidatePath("/financeiro", "page");
  return {};
}

export async function deleteExpenseAction(
  expenseId: string,
  scope: SeriesScope,
): Promise<{ error?: string }> {
  const { accountId, workspaceId } = await resolveSession();
  const repo = getExpenseStore().repository;
  const target = await repo.findById(workspaceId, expenseId);
  if (!target) return { error: "Despesa não encontrada." };
  await repo.softDeleteWithScope(workspaceId, expenseId, scope, accountId, new Date());
  revalidatePath("/financeiro", "page");
  return {};
}

// ─── Receipt Actions ──────────────────────────────────────────────────────────

export async function attachReceiptAction(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const { workspaceId } = await resolveSession();
  const expenseId = String(formData.get("expenseId") ?? "");
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Nenhum arquivo selecionado." };

  const validation = validateReceiptFile(file);
  if (!validation.ok) return { error: validation.error };

  const repo = getExpenseStore().repository;
  const expense = await repo.findById(workspaceId, expenseId);
  if (!expense) return { error: "Despesa não encontrada." };
  if (expense.receiptStorageKey) return { error: "Despesa já possui comprovante. Use substituir." };

  const storageKey = buildExpenseReceiptStorageKey({ workspaceId, expenseId, fileName: file.name });
  const supabase = await createClient();
  const upload = await uploadExpenseReceipt(supabase, {
    storageKey,
    buffer: await file.arrayBuffer(),
    mimeType: file.type,
  });
  if (!upload.ok) return { error: `Erro no upload: ${upload.error}` };

  await repo.update(workspaceId, expenseId, {
    receiptStorageKey: storageKey,
    receiptFileName: file.name,
    receiptMimeType: file.type,
  });
  revalidatePath("/financeiro", "page");
  return {};
}

export async function replaceReceiptAction(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const { workspaceId } = await resolveSession();
  const expenseId = String(formData.get("expenseId") ?? "");
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Nenhum arquivo selecionado." };

  const validation = validateReceiptFile(file);
  if (!validation.ok) return { error: validation.error };

  const repo = getExpenseStore().repository;
  const expense = await repo.findById(workspaceId, expenseId);
  if (!expense) return { error: "Despesa não encontrada." };

  const supabase = await createClient();

  if (expense.receiptStorageKey) {
    await deleteExpenseReceipt(supabase, expense.receiptStorageKey);
  }

  const storageKey = buildExpenseReceiptStorageKey({ workspaceId, expenseId, fileName: file.name });
  const upload = await uploadExpenseReceipt(supabase, {
    storageKey,
    buffer: await file.arrayBuffer(),
    mimeType: file.type,
  });
  if (!upload.ok) return { error: `Erro no upload: ${upload.error}` };

  await repo.update(workspaceId, expenseId, {
    receiptStorageKey: storageKey,
    receiptFileName: file.name,
    receiptMimeType: file.type,
  });
  revalidatePath("/financeiro", "page");
  return {};
}

export async function removeReceiptAction(expenseId: string): Promise<{ error?: string }> {
  const { workspaceId } = await resolveSession();
  const repo = getExpenseStore().repository;
  const expense = await repo.findById(workspaceId, expenseId);
  if (!expense || !expense.receiptStorageKey) return { error: "Sem comprovante para remover." };

  const supabase = await createClient();
  await deleteExpenseReceipt(supabase, expense.receiptStorageKey);
  await repo.update(workspaceId, expenseId, {
    receiptStorageKey: null,
    receiptFileName: null,
    receiptMimeType: null,
    updatedAt: new Date(),
  });
  revalidatePath("/financeiro", "page");
  return {};
}
