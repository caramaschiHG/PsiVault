"use client";

import { useEffect, useRef, useState, useTransition, useCallback } from "react";
import type { Expense, SeriesScope } from "@/lib/expenses/model";
import type { ExpenseCategory } from "@/lib/expense-categories/model";
import { parseBRLToCents } from "@/lib/expenses/format";
import { RecurrenceScopeDialog } from "./recurrence-scope-dialog";
import { ReceiptDropZone } from "./receipt-drop-zone";
import {
  createExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
  attachReceiptAction,
} from "../actions";

interface ExpenseSidePanelProps {
  expense: Expense | null;
  categories: ExpenseCategory[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (expense: Expense) => void;
  onDeleted: () => void;
}

type Step = "form" | "upload";

export function ExpenseSidePanel({
  expense,
  categories,
  open,
  onOpenChange,
  onSaved,
  onDeleted,
}: ExpenseSidePanelProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [savedExpenseId, setSavedExpenseId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Receipt state
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form fields
  const [dueDate, setDueDate] = useState(today());
  const [amountDisplay, setAmountDisplay] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [recurrence, setRecurrence] = useState<"UNICA" | "MENSAL" | "QUINZENAL">("UNICA");
  const [repeatFor, setRepeatFor] = useState(12);

  // Scope dialog
  const [scopeDialogOpen, setScopeDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"save" | "delete" | null>(null);
  const [pendingPatch, setPendingPatch] = useState<{
    description?: string;
    amountInCents?: number;
    categoryId?: string;
  } | null>(null);

  // Reset form when expense changes
  useEffect(() => {
    if (!open) return;
    setStep("form");
    setSavedExpenseId(null);
    setFormError(null);
    setPendingFile(null);
    setUploadError(null);
    if (expense) {
      setDueDate(toDateInput(expense.dueDate));
      setAmountDisplay(centsToDisplay(expense.amountInCents));
      setDescription(expense.description);
      setCategoryId(expense.categoryId);
      setRecurrence(expense.recurrencePattern ?? "UNICA");
      setRepeatFor(12);
    } else {
      setDueDate(today());
      setAmountDisplay("");
      setDescription("");
      setCategoryId(categories.find((c) => !c.archived)?.id ?? "");
      setRecurrence("UNICA");
      setRepeatFor(12);
    }
  }, [open, expense, categories]);

  // Focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") { onOpenChange(false); return; }
      if (e.key !== "Tab" || !drawerRef.current) return;
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    },
    [onOpenChange]
  );

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    requestAnimationFrame(() => { drawerRef.current?.focus(); });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  // BRL formatting handler
  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    if (!digits) { setAmountDisplay(""); return; }
    const cents = parseInt(digits, 10);
    const formatted = (cents / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    setAmountDisplay(formatted);
  }

  function getFormPatch() {
    const amountInCents = parseBRLToCents(amountDisplay) ?? 0;
    return { description, amountInCents, categoryId };
  }

  async function doCreate(scope?: SeriesScope) {
    setFormError(null);
    const fd = new FormData();
    fd.set("dueDate", dueDate);
    fd.set("amount", amountDisplay);
    fd.set("description", description);
    fd.set("categoryId", categoryId);
    if (recurrence !== "UNICA") {
      fd.set("recurrencePattern", recurrence);
      fd.set("repeatFor", String(repeatFor));
    }
    const result = await createExpenseAction(null, fd);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    if (result.expenseId) {
      setSavedExpenseId(result.expenseId);
      // Build a minimal expense object to call onSaved
      const saved: Expense = {
        id: result.expenseId,
        workspaceId: "",
        categoryId,
        description,
        amountInCents: parseBRLToCents(amountDisplay) ?? 0,
        dueDate: new Date(dueDate),
        recurrencePattern: recurrence !== "UNICA" ? recurrence : null,
        seriesId: null,
        seriesIndex: null,
        receiptStorageKey: null,
        receiptFileName: null,
        receiptMimeType: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByAccountId: "",
        deletedAt: null,
        deletedByAccountId: null,
      };
      onSaved(saved);
      setStep("upload");
    }
  }

  async function doUpdate(scope: SeriesScope) {
    if (!expense) return;
    const patch = pendingPatch ?? getFormPatch();
    const result = await updateExpenseAction(expense.id, scope, patch);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    onSaved({ ...expense, ...patch });
    onOpenChange(false);
  }

  async function doDelete(scope: SeriesScope) {
    if (!expense) return;
    const result = await deleteExpenseAction(expense.id, scope);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    onDeleted();
    onOpenChange(false);
  }

  function handleSave() {
    if (!expense) {
      // Create
      startTransition(() => doCreate());
    } else if (expense.seriesId) {
      // Edit recurring — show scope dialog
      setPendingAction("save");
      setPendingPatch(getFormPatch());
      setScopeDialogOpen(true);
    } else {
      // Edit single
      startTransition(() => doUpdate("this"));
    }
  }

  function handleDelete() {
    if (!expense) return;
    if (expense.seriesId) {
      setPendingAction("delete");
      setScopeDialogOpen(true);
    } else {
      startTransition(() => doDelete("this"));
    }
  }

  function handleScopeConfirm(scope: SeriesScope) {
    if (pendingAction === "save") startTransition(() => doUpdate(scope));
    else if (pendingAction === "delete") startTransition(() => doDelete(scope));
    setPendingAction(null);
    setPendingPatch(null);
  }

  async function handleFileAccepted(file: File) {
    const expId = savedExpenseId ?? expense?.id;
    if (!expId) return;
    setIsUploading(true);
    setUploadError(null);
    const fd = new FormData();
    fd.set("expenseId", expId);
    fd.set("file", file);
    const result = await attachReceiptAction(null, fd);
    setIsUploading(false);
    if (result.error) {
      setUploadError(result.error);
    } else {
      setPendingFile(file);
    }
  }

  function handleRemoveReceipt() {
    setPendingFile(null);
  }

  const isEditMode = expense !== null;
  const activeCategories = categories.filter((c) => !c.archived);

  const currentReceipt = pendingFile
    ? { fileName: pendingFile.name, mimeType: pendingFile.type }
    : expense?.receiptFileName
    ? { fileName: expense.receiptFileName, mimeType: expense.receiptMimeType ?? "application/octet-stream" }
    : null;

  return (
    <>
      {/* Overlay */}
      <div className="side-panel-overlay" onClick={() => onOpenChange(false)} aria-hidden="true" />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className="side-panel-drawer"
        style={drawerStyle}
        role="dialog"
        aria-modal="true"
        aria-label={isEditMode ? "Editar despesa" : "Nova despesa"}
        tabIndex={-1}
      >
        <button
          className="side-panel-close"
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Fechar painel"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div style={drawerBodyStyle}>
          {step === "form" && (
            <>
              <h2 style={drawerTitleStyle}>
                {isEditMode ? "Editar despesa" : "Nova despesa"}
              </h2>
              <div style={separatorStyle} />

              <div style={formStyle}>
                {/* Data */}
                <div style={fieldStyle}>
                  <label style={labelStyle} htmlFor="exp-dueDate">Data</label>
                  <input
                    id="exp-dueDate"
                    className="input-field"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>

                {/* Valor */}
                <div style={fieldStyle}>
                  <label style={labelStyle} htmlFor="exp-amount">Valor</label>
                  <input
                    id="exp-amount"
                    className="input-field"
                    type="text"
                    inputMode="numeric"
                    placeholder="0,00"
                    value={amountDisplay}
                    onChange={handleAmountChange}
                  />
                </div>

                {/* Descrição */}
                <div style={fieldStyle}>
                  <label style={labelStyle} htmlFor="exp-description">Descrição</label>
                  <input
                    id="exp-description"
                    className="input-field"
                    type="text"
                    placeholder='Ex: "Aluguel sala 302 — abril/26"'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Categoria */}
                <div style={fieldStyle}>
                  <label style={labelStyle} htmlFor="exp-category">Categoria</label>
                  <select
                    id="exp-category"
                    className="input-field"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                  >
                    <option value="" disabled>Selecione uma categoria</option>
                    {activeCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Recorrência */}
                <div style={fieldStyle}>
                  <label style={labelStyle}>Recorrência</label>
                  <div style={segmentedStyle}>
                    {(["UNICA", "MENSAL", "QUINZENAL"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setRecurrence(opt)}
                        style={recurrence === opt ? activeSegStyle : inactiveSegStyle}
                        aria-pressed={recurrence === opt}
                      >
                        {opt === "UNICA" ? "Única" : opt === "MENSAL" ? "Mensal" : "Quinzenal"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Repetir por */}
                {recurrence !== "UNICA" && (
                  <div style={fieldStyle}>
                    <label style={labelStyle} htmlFor="exp-repeatFor">Repetir por</label>
                    <div style={repeatRowStyle}>
                      <input
                        id="exp-repeatFor"
                        className="input-field"
                        type="number"
                        min={1}
                        max={60}
                        value={repeatFor}
                        onChange={(e) => setRepeatFor(parseInt(e.target.value, 10) || 1)}
                        style={repeatInputStyle}
                      />
                      <span style={helperStyle}>
                        {repeatFor} ocorrência{repeatFor !== 1 ? "s" : ""} serão criadas a partir desta data
                      </span>
                    </div>
                  </div>
                )}

                {formError && (
                  <p style={errorStyle} role="alert">{formError}</p>
                )}
              </div>

              {/* Footer etapa 1 */}
              <div style={footerStyle}>
                <div>
                  {isEditMode && (
                    <button
                      className="btn-danger"
                      type="button"
                      onClick={handleDelete}
                      disabled={isPending}
                    >
                      Excluir despesa
                    </button>
                  )}
                </div>
                <div style={footerRightStyle}>
                  <button className="btn-ghost" type="button" onClick={() => onOpenChange(false)}>
                    Cancelar
                  </button>
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={handleSave}
                    disabled={isPending}
                  >
                    {isPending ? "Salvando…" : "Salvar despesa"}
                  </button>
                </div>
              </div>
            </>
          )}

          {step === "upload" && (
            <>
              <h2 style={drawerTitleStyle}>Anexar comprovante</h2>
              <div style={separatorStyle} />

              <div style={{ marginTop: "var(--space-4)" }}>
                <ReceiptDropZone
                  expenseId={savedExpenseId ?? ""}
                  currentReceipt={currentReceipt}
                  onFileAccepted={handleFileAccepted}
                  onRemove={handleRemoveReceipt}
                  isUploading={isUploading}
                  uploadError={uploadError}
                />
              </div>

              {/* Footer etapa 2 */}
              <div style={footerStyle}>
                <button
                  className="btn-ghost"
                  type="button"
                  onClick={() => onOpenChange(false)}
                >
                  Concluir sem comprovante
                </button>
                <button
                  className="btn-primary"
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={!currentReceipt}
                >
                  Concluir
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Scope dialog */}
      <RecurrenceScopeDialog
        open={scopeDialogOpen}
        onOpenChange={setScopeDialogOpen}
        mode={pendingAction === "delete" ? "delete" : "edit"}
        onConfirm={handleScopeConfirm}
      />
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function toDateInput(d: Date): string {
  return new Date(d).toISOString().split("T")[0];
}

function centsToDisplay(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const drawerStyle = {
  position: "fixed",
  right: 0,
  top: 0,
  height: "100%",
  width: "26rem",
  maxWidth: "100vw",
  zIndex: "var(--z-modal)",
  background: "var(--color-surface-1)",
  borderLeft: "1px solid var(--color-border)",
  boxShadow: "var(--shadow-side-panel)",
  display: "flex",
  flexDirection: "column",
  outline: "none",
} satisfies React.CSSProperties;

const drawerBodyStyle = {
  flex: 1,
  overflowY: "auto",
  padding: "3rem 1.25rem 1.5rem",
  display: "flex",
  flexDirection: "column",
} satisfies React.CSSProperties;

const drawerTitleStyle = {
  margin: "0 0 var(--space-4)",
  fontSize: "var(--font-size-h2)",
  fontWeight: 600,
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const separatorStyle = {
  height: "1px",
  background: "var(--color-border)",
  marginBottom: "var(--space-4)",
} satisfies React.CSSProperties;

const formStyle = {
  display: "grid",
  gap: "var(--space-4)",
  flex: 1,
} satisfies React.CSSProperties;

const fieldStyle = {
  display: "grid",
  gap: "var(--space-2)",
} satisfies React.CSSProperties;

const labelStyle = {
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const segmentedStyle = {
  display: "inline-flex",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-pill)",
  padding: "2px",
} satisfies React.CSSProperties;

const baseSegStyle = {
  height: "36px",
  padding: "6px 14px",
  fontSize: "var(--font-size-sm)",
  border: "none",
  borderRadius: "var(--radius-pill)",
  cursor: "pointer",
  background: "transparent",
} satisfies React.CSSProperties;

const activeSegStyle = {
  ...baseSegStyle,
  background: "var(--color-surface-0)",
  boxShadow: "var(--shadow-xs)",
  color: "var(--color-text-1)",
  fontWeight: 600,
} satisfies React.CSSProperties;

const inactiveSegStyle = {
  ...baseSegStyle,
  color: "var(--color-text-2)",
  fontWeight: 500,
} satisfies React.CSSProperties;

const repeatRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-3)",
} satisfies React.CSSProperties;

const repeatInputStyle = {
  width: "80px",
} satisfies React.CSSProperties;

const helperStyle = {
  fontSize: "var(--font-size-meta)",
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const errorStyle = {
  margin: 0,
  fontSize: "var(--font-size-sm)",
  color: "var(--color-error-text)",
} satisfies React.CSSProperties;

const footerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: "var(--space-6)",
  marginTop: "auto",
  gap: "var(--space-3)",
} satisfies React.CSSProperties;

const footerRightStyle = {
  display: "flex",
  gap: "var(--space-2)",
} satisfies React.CSSProperties;
