import { NextRequest, NextResponse } from "next/server";
import { resolveSession } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { getExpenseStore } from "@/lib/expenses/store";
import { getExpenseReceiptSignedUrl } from "@/lib/expenses/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ expenseId: string }> },
) {
  const { workspaceId } = await resolveSession();
  const { expenseId } = await params;

  const expense = await getExpenseStore().repository.findById(workspaceId, expenseId);
  if (!expense || !expense.receiptStorageKey) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const supabase = await createClient();
  const url = await getExpenseReceiptSignedUrl(supabase, expense.receiptStorageKey);
  if (!url) return NextResponse.json({ error: "Falha ao gerar URL" }, { status: 500 });

  return NextResponse.redirect(url, 302);
}
