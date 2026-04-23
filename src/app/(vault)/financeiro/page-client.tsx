/**
 * /financeiro — Interactive client parts: charge list, filters, tabs, drawer.
 */

"use client";

import { useTransition, useState, useMemo, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@/components/ui/tabs";
import type { SessionCharge, Patient } from "./domain-types";
import { EmptyState } from "@/app/(vault)/components/empty-state";
import { ChargeSidePanel } from "./components/charge-side-panel";
import { ExpensesAsyncSection } from "./components/expenses-async-section";
import { SectionSkeleton } from "@/components/streaming/section-skeleton";

const ptBRDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: "PIX",
  transferencia: "Transferência",
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  cheque: "Cheque",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pago: { bg: "var(--color-success-bg)", text: "var(--color-success-text)", label: "Pago" },
  pendente: { bg: "var(--color-warning-bg)", text: "var(--color-warning-text)", label: "Pendente" },
  atrasado: { bg: "var(--color-error-bg)", text: "var(--color-error-text)", label: "Atrasado" },
};

type FilterStatus = "todos" | "pendente" | "pago" | "atrasado";

interface FinanceiroPageProps {
  initialCharges: SessionCharge[];
  patients: Patient[];
  summary: { totalSessions: number; totalReceivedCents: number; totalPendingCents: number };
  overdueCount: number;
  year: number;
  month: number;
  monthLabel: string;
  prevHref: string;
  nextHref: string;
  drawerId: string | null;
  workspaceId: string;
}

export default function FinanceiroPageClient({
  initialCharges,
  patients,
  summary,
  overdueCount,
  year,
  month,
  monthLabel,
  prevHref,
  nextHref,
  drawerId,
  workspaceId,
}: FinanceiroPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [charges, setCharges] = useState(initialCharges);
  const [filterPatient, setFilterPatient] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("todos");
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [payingCharge, setPayingCharge] = useState<string | null>(null);
  const [undoingCharge, setUndoingCharge] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const patientMap = useMemo(() => {
    const map = new Map<string, Patient>();
    for (const p of patients) map.set(p.id, p);
    return map;
  }, [patients]);

  // Filter charges
  const filteredCharges = useMemo(() => {
    let result = charges;
    if (filterPatient) result = result.filter((c) => c.patientId === filterPatient);
    if (filterStatus !== "todos") result = result.filter((c) => c.status === filterStatus);
    return result;
  }, [charges, filterPatient, filterStatus]);

  // Patient totals
  const patientTotals = useMemo(() => {
    const map = new Map<string, { paid: number; pending: number; overdue: number }>();
    for (const charge of charges) {
      if (!map.has(charge.patientId)) map.set(charge.patientId, { paid: 0, pending: 0, overdue: 0 });
      const t = map.get(charge.patientId)!;
      const amount = charge.amountInCents ?? 0;
      if (charge.status === "pago") t.paid += amount;
      else if (charge.status === "atrasado") t.overdue += amount;
      else t.pending += amount;
    }
    return map;
  }, [charges]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function openDrawer(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("drawer", id);
    router.push(`${pathname}?${params.toString()}`);
  }

  function closeDrawer() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("drawer");
    router.push(`${pathname}?${params.toString()}`);
  }

  async function handleAddCharge(formData: FormData) {
    setFormError(null);
    startTransition(async () => {
      const mod = await import("./actions");
      const result = await mod.createManualChargeAction(formData);
      if (result.ok) {
        closeDrawer();
        window.location.reload();
      } else {
        setFormError(result.error ?? "Erro desconhecido.");
      }
    });
  }

  function handleExport() {
    setExporting(true);
    try {
      const patientNameMap = new Map<string, string>(
        patients.map((p) => [p.id, p.socialName ?? p.fullName]),
      );
      const filtered = filteredCharges;
      const header = "Data,Paciente,Status,Valor,Forma de Pagamento,Pago Em";
      const rows = filtered.map((c) => {
        const name = `"${patientNameMap.get(c.patientId) ?? c.patientId}"`;
        const date = ptBRDate.format(c.createdAt);
        const status = STATUS_COLORS[c.status]?.label ?? c.status;
        const amount = c.amountInCents !== null ? currency.format(c.amountInCents / 100) : "—";
        const method = c.paymentMethod ? (PAYMENT_METHOD_LABELS[c.paymentMethod] ?? c.paymentMethod) : "—";
        const paidAt = c.paidAt ? ptBRDate.format(new Date(c.paidAt)) : "—";
        return `${date},${name},${status},${amount},${method},${paidAt}`;
      });
      const csv = [header, ...rows].join("\n");
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financeiro-${year}-${String(month).padStart(2, "0")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  async function handleQuickPay(chargeId: string, method: string) {
    setPayingCharge(chargeId);
    try {
      const mod = await import("./actions");
      const result = await mod.markChargeAsPaidAction(chargeId, method);
      if (result.ok) {
        setCharges((prev) =>
          prev.map((c) =>
            c.id === chargeId
              ? { ...c, status: "pago" as const, paymentMethod: method, paidAt: new Date() }
              : c,
          ),
        );
        showToast("Pagamento registrado ✓");
      }
    } finally {
      setPayingCharge(null);
    }
  }

  async function handleUndoPay(chargeId: string) {
    setUndoingCharge(chargeId);
    try {
      const mod = await import("./actions");
      const result = await mod.undoChargePaymentAction(chargeId);
      if (result.ok) {
        setCharges((prev) =>
          prev.map((c) =>
            c.id === chargeId ? { ...c, status: "pendente" as const, paymentMethod: null, paidAt: null } : c,
          ),
        );
        showToast("Pagamento desfeito");
      }
    } finally {
      setUndoingCharge(null);
    }
  }

  function renderChargeList(list: SessionCharge[]) {
    if (list.length === 0) {
      return <p style={noFilterResultStyle}>Nenhuma cobrança para os filtros selecionados.</p>;
    }
    return (
      <div style={listStyle}>
        {list.map((charge) => {
          const patient = patientMap.get(charge.patientId);
          const patientName = patient?.socialName ?? patient?.fullName ?? charge.patientId;
          const color = STATUS_COLORS[charge.status] ?? STATUS_COLORS.pendente;
          const isPaying = payingCharge === charge.id;

          return (
            <div 
              key={charge.id} 
              style={{ ...rowStyle, cursor: "pointer" }}
              onClick={() => openDrawer(charge.id)}
            >
              <div style={rowLeftStyle}>
                <span
                  style={{
                    ...statusBadgeStyle,
                    background: color.bg,
                    color: color.text,
                  }}
                >
                  {color.label}
                </span>
                <span style={dateLabelStyle}>{ptBRDate.format(charge.createdAt)}</span>
                <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#333" }}>{patientName}</span>
                {charge.paymentMethod && (
                  <span style={methodLabelStyle}>
                    {PAYMENT_METHOD_LABELS[charge.paymentMethod] ?? charge.paymentMethod}
                  </span>
                )}
              </div>
              <div style={rowRightStyle}>
                <span style={amountLabelStyle}>
                  {charge.amountInCents !== null ? currency.format(charge.amountInCents / 100) : "—"}
                </span>

                {charge.status !== "pago" && (
                  <button
                    style={payBtnStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      openDrawer(charge.id);
                    }}
                    title="Registrar pagamento"
                  >
                    ✓ Receber
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {/* Toast */}
      {toast && <div style={toastStyle}>{toast}</div>}

      {/* Actions bar */}
      <div style={actionsBarStyle}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          {/* Status filter */}
          <div style={filterGroupStyle}>
            {(["todos", "pendente", "atrasado", "pago"] as FilterStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  ...filterBtnStyle,
                  ...(filterStatus === s ? filterBtnActiveStyle : {}),
                }}
              >
                {s === "todos" ? "Todos" : STATUS_COLORS[s]?.label ?? s}
              </button>
            ))}
          </div>

          {/* Patient filter */}
          <select
            value={filterPatient}
            onChange={(e) => setFilterPatient(e.target.value)}
            style={patientSelectStyle}
          >
            <option value="">Todos os pacientes</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.socialName ?? p.fullName}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button variant="secondary" size="sm" onClick={() => openDrawer("nova")}>
            + Cobrança
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExport} isLoading={exporting}>
            Exportar
          </Button>
        </div>
      </div>

      {/* Charge list */}
      {charges.length === 0 ? (
        <>
          <EmptyState
            icon={
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            }
            title="Nenhuma cobrança este mês"
            description="Tudo em dia! Nenhuma sessão concluída neste período."
          />
          <div style={{ textAlign: "center", paddingBottom: "2rem" }}>
            <Button variant="primary" onClick={() => openDrawer("nova")}>Adicionar primeira cobrança</Button>
          </div>
        </>
      ) : (
        <Tabs defaultValue="extrato" searchParamKey="tab">
          <TabList>
            <Tab value="extrato">Extrato</Tab>
            <Tab value="atrasados">Atrasados</Tab>
            <Tab value="despesas">Despesas</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="extrato">
              {renderChargeList(filteredCharges)}
            </TabPanel>
            <TabPanel value="atrasados">
              {renderChargeList(filteredCharges.filter((c) => c.status === "atrasado"))}
            </TabPanel>
            <TabPanel value="despesas">
              <Suspense fallback={<SectionSkeleton />}>
                <ExpensesAsyncSection workspaceId={workspaceId} />
              </Suspense>
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}

      <ChargeSidePanel drawerId={drawerId} onClose={closeDrawer}>
        {drawerId === "nova" && (
          <form action={handleAddCharge} style={{ display: "grid", gap: "1.25rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600, fontFamily: "var(--font-serif)" }}>Nova Cobrança</h2>
            <div style={{ display: "grid", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 500, color: "#444" }}>Paciente</label>
              <select name="patientId" required defaultValue="" style={inputStyle}>
                <option value="" disabled>Selecione um paciente</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.socialName ?? p.fullName}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "grid", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 500, color: "#444" }}>Data da sessão</label>
              <input type="date" name="date" defaultValue={new Date().toISOString().split("T")[0]} style={inputStyle} />
            </div>
            <div style={{ display: "grid", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 500, color: "#444" }}>Valor (R$)</label>
              <input type="number" name="amountBrl" placeholder="0.00" required min="0.01" step="0.01" style={inputStyle} />
            </div>
            
            {formError && <p style={formErrorStyle} role="alert">{formError}</p>}
            
            <div style={{ marginTop: "1rem" }}>
              <Button type="submit" variant="primary" isLoading={isPending} style={{ width: "100%" }}>
                Salvar Cobrança
              </Button>
            </div>
          </form>
        )}
        
        {drawerId && drawerId !== "nova" && charges.find(c => c.id === drawerId) && (() => {
          const c = charges.find(c => c.id === drawerId)!;
          const patient = patientMap.get(c.patientId);
          const patientName = patient?.socialName ?? patient?.fullName ?? c.patientId;
          const color = STATUS_COLORS[c.status] ?? STATUS_COLORS.pendente;

          return (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600, fontFamily: "var(--font-serif)" }}>Detalhes da Cobrança</h2>
              
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#666", textTransform: "uppercase" }}>Paciente</p>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "1rem", fontWeight: 500, color: "#111" }}>{patientName}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#666", textTransform: "uppercase" }}>Data da sessão</p>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "1rem", color: "#111" }}>{ptBRDate.format(c.createdAt)}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#666", textTransform: "uppercase" }}>Valor</p>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "1rem", color: "#111" }}>
                    {c.amountInCents !== null ? currency.format(c.amountInCents / 100) : "—"}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#666", textTransform: "uppercase" }}>Status</p>
                  <span style={{ ...statusBadgeStyle, background: color.bg, color: color.text, display: "inline-block", marginTop: "0.25rem" }}>
                    {color.label}
                  </span>
                </div>
              </div>

              {c.status === "pago" ? (
                <div style={{ marginTop: "1rem", padding: "1.25rem", background: "var(--color-surface-1)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                  <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-success-text)" }}>Pagamento recebido</p>
                  <p style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: "#555" }}>
                    Forma de pagamento: <span style={{ fontWeight: 500 }}>{PAYMENT_METHOD_LABELS[c.paymentMethod || ""] ?? c.paymentMethod}</span>
                  </p>
                  <Button 
                    variant="secondary" 
                    onClick={() => handleUndoPay(c.id)} 
                    disabled={undoingCharge === c.id}
                    style={{ width: "100%" }}
                  >
                    {undoingCharge === c.id ? "Desfazendo..." : "↩ Desfazer pagamento"}
                  </Button>
                </div>
              ) : (
                <div style={{ marginTop: "1rem", padding: "1.25rem", background: "var(--color-surface-1)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                  <p style={{ margin: "0 0 0.75rem", fontSize: "0.9rem", fontWeight: 600, color: "#111" }}>Registrar Recebimento</p>
                  <div style={{ display: "grid", gap: "0.5rem" }}>
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => handleQuickPay(c.id, key)}
                        disabled={payingCharge === c.id}
                        style={{
                          padding: "0.625rem",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-sm)",
                          background: "#fff",
                          cursor: payingCharge === c.id ? "not-allowed" : "pointer",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          textAlign: "left",
                          color: "#333",
                        }}
                      >
                        {payingCharge === c.id ? "Salvando..." : label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </ChargeSidePanel>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const toastStyle: React.CSSProperties = {
  position: "fixed",
  top: "1.5rem",
  right: "1.5rem",
  padding: "0.75rem 1.25rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-success-text)",
  color: "#fff",
  fontSize: "0.875rem",
  fontWeight: 600,
  zIndex: "var(--z-toast)",
  animation: "fadeIn 0.2s ease-out",
};

const actionsBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "0.75rem",
};

const filterGroupStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.25rem",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  padding: "0.2rem",
};

const filterBtnStyle: React.CSSProperties = {
  padding: "0.375rem 0.75rem",
  fontSize: "0.8rem",
  border: "none",
  borderRadius: "var(--radius-sm)",
  background: "transparent",
  color: "#555",
  cursor: "pointer",
  fontWeight: 500,
};

const filterBtnActiveStyle: React.CSSProperties = {
  background: "var(--color-teal)",
  color: "#fff",
  fontWeight: 600,
};

const patientSelectStyle: React.CSSProperties = {
  padding: "0.375rem 0.75rem",
  fontSize: "0.85rem",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  background: "#fff",
  minWidth: 180,
};

const inputStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  fontSize: "0.85rem",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
};

const formErrorStyle: React.CSSProperties = {
  margin: "0.5rem 0 0",
  fontSize: "0.8rem",
  color: "var(--color-error-text)",
};

const noFilterResultStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "2rem",
  color: "#888",
  fontSize: "0.9rem",
};

const listStyle: React.CSSProperties = { display: "grid", gap: "1rem" };

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.625rem 1rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  gap: "0.75rem",
  flexWrap: "wrap",
};

const rowLeftStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.625rem",
  flexWrap: "wrap",
};

const statusBadgeStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  padding: "0.2rem 0.5rem",
  borderRadius: "var(--radius-sm)",
  fontWeight: 600,
};

const dateLabelStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "#888",
};

const methodLabelStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  color: "#aaa",
  fontStyle: "italic",
};

const rowRightStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
};

const amountLabelStyle: React.CSSProperties = {
  fontSize: "0.9rem",
  color: "#333",
  fontWeight: 600,
  minWidth: 80,
  textAlign: "right",
};

const payBtnStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  padding: "0.3rem 0.75rem",
  border: "none",
  borderRadius: "var(--radius-sm)",
  background: "var(--color-success-text)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};
