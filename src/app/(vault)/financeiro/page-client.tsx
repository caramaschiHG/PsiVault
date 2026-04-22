/**
 * /financeiro — Monthly financial summary with actions.
 *
 * Features:
 * - Month navigation
 * - Overdue indicators (auto-computed)
 * - Inadimplência cards (pending, overdue, received)
 * - Filters: status, patient
 * - Quick pay (1 click with payment method popover)
 * - Patient-grouped list with totals
 * - Monthly trend chart
 * - CSV export
 */

"use client";

import { useTransition, useState, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@/components/ui/tabs";
import type { SessionCharge, Patient } from "./domain-types";
import { EmptyState } from "@/app/(vault)/components/empty-state";
import { ChargeSidePanel } from "./components/charge-side-panel";

const ptBRDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

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
  trends: { monthLabel: string; totalReceived: number; totalPending: number; totalSessions: number }[];
  prevMonthReceived: number;
  yearSummary: { month: number; monthLabel: string; received: number; pending: number; overdue: number; sessions: number }[];
  topPatients: { name: string; received: number; sessions: number }[];
  forecast: number;
  scheduledCount: number;
  drawerId: string | null;
  expenses?: import("@/lib/expenses/model").Expense[];
  categories?: import("@/lib/expense-categories/model").ExpenseCategory[];
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
  trends,
  prevMonthReceived,
  yearSummary,
  topPatients,
  forecast,
  scheduledCount,
  drawerId,
  expenses: _expenses,
  categories: _categories,
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
  const [showYearView, setShowYearView] = useState(false);
  const [showTopPatients, setShowTopPatients] = useState(false);

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

  function handleExportIR(yearSummary: { month: number; monthLabel: string; received: number; pending: number; overdue: number; sessions: number }[], year: number) {
    const header = "Mês,Total Recebido,Qtd Sessões,Média por Sessão";
    const rows = yearSummary
      .filter((m) => m.received > 0)
      .map((m) => {
        const avg = m.sessions > 0 ? m.received / m.sessions : 0;
        return `${m.monthLabel},${currency.format(m.received)},${m.sessions},${currency.format(avg)}`;
      });
    const totalReceived = yearSummary.reduce((s, m) => s + m.received, 0);
    const totalSessions = yearSummary.reduce((s, m) => s + m.sessions, 0);
    rows.push("");
    rows.push(`TOTAL ANO,${currency.format(totalReceived)},${totalSessions},`);

    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ir-psivault-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Resumo IR exportado ✓");
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

  const maxTrend = Math.max(...trends.map((t) => t.totalReceived), 1);

  return (
    <main style={shellStyle}>
      {/* Toast */}
      {toast && <div style={toastStyle}>{toast}</div>}

      {/* Page heading */}
      <div style={headingBlockStyle}>
        <p style={eyebrowStyle}>Resumo financeiro</p>
        <h1 style={titleStyle}>Financeiro</h1>
      </div>

      {/* Month navigation */}
      <div style={monthNavStyle}>
        <a href={prevHref} style={navArrowStyle}>
          ← Anterior
        </a>
        <span style={monthLabelStyle}>{monthLabel}</span>
        <a href={nextHref} style={navArrowStyle}>
          Próximo →
        </a>
      </div>

      {/* Inadimplência cards */}
      <div style={summaryCardsStyle}>
        <div style={{ ...miniCardStyle, borderLeft: "3px solid var(--color-success-text)" }}>
          <p style={miniCardLabelStyle}>Recebido</p>
          <p style={miniCardValueStyle}>{currency.format(summary.totalReceivedCents / 100)}</p>
          {prevMonthReceived > 0 && (
            <p style={variationStyle}>
              {summary.totalReceivedCents / 100 >= prevMonthReceived ? (
                <span style={{ color: "var(--color-success-text)" }}>↑ +{Math.round(((summary.totalReceivedCents / 100 - prevMonthReceived) / prevMonthReceived) * 100)}%</span>
              ) : (
                <span style={{ color: "var(--color-error-text)" }}>↓ -{Math.round(((prevMonthReceived - summary.totalReceivedCents / 100) / prevMonthReceived) * 100)}%</span>
              )}
              <span style={{ color: "#999", marginLeft: "0.25rem" }}>vs {MONTH_LABELS[month === 1 ? 11 : month - 2]}</span>
            </p>
          )}
        </div>
        <div style={{ ...miniCardStyle, borderLeft: "3px solid var(--color-warning-text)" }}>
          <p style={miniCardLabelStyle}>Pendente</p>
          <p style={miniCardValueStyle}>{currency.format(summary.totalPendingCents / 100)}</p>
        </div>
        <div style={{ ...miniCardStyle, borderLeft: "3px solid var(--color-error-text)" }}>
          <p style={miniCardLabelStyle}>Atrasado</p>
          <p style={{ ...miniCardValueStyle, color: "var(--color-error-text)" }}>
            {overdueCount} {overdueCount === 1 ? "cobrança" : "cobranças"}
          </p>
        </div>
        {forecast > 0 && (
          <div style={{ ...miniCardStyle, borderLeft: "3px solid #2563eb" }}>
            <p style={miniCardLabelStyle}>Previsão</p>
            <p style={miniCardValueStyle}>{currency.format(forecast)}</p>
            <p style={{ ...variationStyle, color: "#999" }}>
              {scheduledCount} sess{scheduledCount === 1 ? "ão" : "ões"}
            </p>
          </div>
        )}
      </div>

      {/* Trend chart */}
      {trends.length > 0 && (
        <div style={trendCardStyle}>
          <div style={trendHeaderStyle}>
            <p style={trendLabelStyle}>Receita mensal</p>
            <span style={trendTotalStyle}>
              {currency.format(trends.reduce((s, t) => s + t.totalReceived, 0))}
            </span>
          </div>
          <div style={chartContainerStyle}>
            {[0, 25, 50, 75, 100].map((pct) => (
              <div key={pct} style={{ position: "absolute", left: 0, right: 0, bottom: `${pct}%`, borderTop: "1px solid var(--color-border, #e5e5e5)", opacity: 0.4 }} />
            ))}
            {trends.map((t) => (
              <div key={t.monthLabel} style={barWrapperStyle}>
                <div
                  style={{
                    ...barStyle,
                    height: `${(t.totalReceived / maxTrend) * 100}%`,
                  }}
                  title={`${t.monthLabel}: ${currency.format(t.totalReceived)}`}
                />
                <span style={barLabelStyle}>{t.monthLabel}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
          </TabList>
          <TabPanels>
            <TabPanel value="extrato">
              {renderChargeList(filteredCharges)}
            </TabPanel>
            <TabPanel value="atrasados">
              {renderChargeList(filteredCharges.filter((c) => c.status === "atrasado"))}
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}

      {/* ─── Top patients section ─────────────────────────────────────────── */}
      {topPatients.length > 0 && (
        <div style={insightSectionStyle}>
          <button
            style={insightToggleStyle}
            onClick={() => setShowTopPatients((v) => !v)}
          >
            {showTopPatients ? "▾" : "▸"} Top pacientes por receita
          </button>
          {showTopPatients && (
            <div style={insightContentStyle}>
              {topPatients.map((p, i) => (
                <div key={i} style={topPatientRowStyle}>
                  <span style={topPatientRankStyle}>{i + 1}</span>
                  <span style={topPatientNameStyle}>{p.name}</span>
                  <span style={topPatientValueStyle}>
                    {currency.format(p.received)}
                  </span>
                  <span style={topPatientSessionsStyle}>
                    {p.sessions} sess{p.sessions === 1 ? "ão" : "ões"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Year summary section ─────────────────────────────────────────── */}
      <div style={insightSectionStyle}>
        <button
          style={insightToggleStyle}
          onClick={() => setShowYearView((v) => !v)}
        >
          {showYearView ? "▾" : "▸"} Ver ano completo ({year})
        </button>
        {showYearView && (
          <div style={insightContentStyle}>
            <div style={yearTableStyle}>
              <div style={yearTableHeaderStyle}>
                <span style={{ flex: 2 }}>Mês</span>
                <span style={yearTableColStyle}>Recebido</span>
                <span style={yearTableColStyle}>Pendente</span>
                <span style={yearTableColStyle}>Atrasado</span>
                <span style={yearTableColStyle}>Sessões</span>
              </div>
              {yearSummary.map((m) => (
                <div
                  key={m.month}
                  style={{
                    ...yearTableRowStyle,
                    ...(m.month === month ? yearTableCurrentMonthStyle : {}),
                  }}
                >
                  <span style={{ flex: 2, fontWeight: m.month === month ? 700 : 400 }}>
                    {m.monthLabel}
                  </span>
                  <span style={{ ...yearTableColStyle, color: "var(--color-success-text)" }}>
                    {m.received > 0 ? currency.format(m.received) : "—"}
                  </span>
                  <span style={{ ...yearTableColStyle, color: "var(--color-warning-text)" }}>
                    {m.pending > 0 ? currency.format(m.pending) : "—"}
                  </span>
                  <span style={{ ...yearTableColStyle, color: "var(--color-error-text)" }}>
                    {m.overdue > 0 ? currency.format(m.overdue) : "—"}
                  </span>
                  <span style={yearTableColStyle}>{m.sessions || "—"}</span>
                </div>
              ))}
              <div style={yearTableTotalStyle}>
                <span style={{ flex: 2, fontWeight: 700 }}>Total</span>
                <span style={{ ...yearTableColStyle, fontWeight: 700, color: "var(--color-success-text)" }}>
                  {currency.format(yearSummary.reduce((s, m) => s + m.received, 0))}
                </span>
                <span style={{ ...yearTableColStyle, fontWeight: 700, color: "var(--color-warning-text)" }}>
                  {currency.format(yearSummary.reduce((s, m) => s + m.pending, 0))}
                </span>
                <span style={{ ...yearTableColStyle, fontWeight: 700, color: "var(--color-error-text)" }}>
                  {currency.format(yearSummary.reduce((s, m) => s + m.overdue, 0))}
                </span>
                <span style={{ ...yearTableColStyle, fontWeight: 700 }}>
                  {yearSummary.reduce((s, m) => s + (m.sessions || 0), 0)}
                </span>
              </div>
            </div>
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
              <Button variant="ghost" size="sm" onClick={() => handleExportIR(yearSummary, year)}>
                📄 Exportar resumo IR
              </Button>
            </div>
          </div>
        )}
      </div>

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
                <div style={{ marginTop: "1rem", padding: "1.25rem", background: "var(--color-surface-1, #fafaf8)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
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
                <div style={{ marginTop: "1rem", padding: "1.25rem", background: "var(--color-surface-1, #fafaf8)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
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
    </main>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const shellStyle: React.CSSProperties = {
  padding: "2rem 2.5rem",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "1.25rem",
  alignContent: "start",
};

const toastStyle: React.CSSProperties = {
  position: "fixed",
  top: "1.5rem",
  right: "1.5rem",
  padding: "0.75rem 1.25rem",
  borderRadius: "var(--radius-md, 8px)",
  background: "var(--color-success-text)",
  color: "#fff",
  fontSize: "0.875rem",
  fontWeight: 600,
  zIndex: "var(--z-toast)",
  animation: "fadeIn 0.2s ease-out",
};

const headingBlockStyle: React.CSSProperties = { display: "grid", gap: "0.25rem" };

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontSize: "0.7rem",
  color: "var(--color-brown-mid, #a3784f)",
  fontWeight: 600,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "1.5rem",
  fontWeight: 700,
  fontFamily: "var(--font-serif, Georgia, serif)",
};

const monthNavStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "0.75rem 1.25rem",
  borderRadius: "var(--radius-md, 8px)",
  background: "var(--color-surface-1, #fafaf8)",
  border: "1px solid var(--color-border, #e5e5e5)",
};

const navArrowStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  padding: "0.375rem 0.75rem",
  color: "var(--color-text-2, #444)",
  textDecoration: "none",
};

const monthLabelStyle: React.CSSProperties = {
  flex: 1,
  textAlign: "center",
  fontWeight: 600,
  fontSize: "1rem",
};

const summaryCardsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "0.75rem",
};

const miniCardStyle: React.CSSProperties = {
  padding: "1rem 1.25rem",
  borderRadius: "var(--radius-md, 8px)",
  background: "var(--color-surface-1, #fafaf8)",
  border: "1px solid var(--color-border, #e5e5e5)",
};

const miniCardLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#666",
  fontWeight: 600,
};

const miniCardValueStyle: React.CSSProperties = {
  margin: "0.25rem 0 0",
  fontSize: "1.25rem",
  fontWeight: 700,
  color: "var(--color-text-1)",
};

const trendCardStyle: React.CSSProperties = {
  padding: "1.25rem 1.5rem",
  borderRadius: "var(--radius-md, 8px)",
  background: "var(--color-surface-1, #fafaf8)",
  border: "1px solid var(--color-border, #e5e5e5)",
  display: "grid",
  gap: "1rem",
};

const trendHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const trendLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "#888",
  fontWeight: 600,
};

const trendTotalStyle: React.CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 700,
  fontFamily: "var(--font-serif, Georgia, serif)",
  color: "#222",
  lineHeight: 1,
};

const chartContainerStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "flex-end",
  gap: "0.75rem",
  height: "120px",
};

const barWrapperStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.375rem",
  height: "100%",
  justifyContent: "flex-end",
};

const barStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "60px",
  background: "var(--color-accent, #2d7d6f)",
  borderRadius: "var(--radius-sm, 4px) var(--radius-sm, 4px) 0 0",
  minHeight: "4px",
};

const barLabelStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  color: "#888",
  fontWeight: 500,
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
  background: "var(--color-surface-1, #fafaf8)",
  border: "1px solid var(--color-border, #e5e5e5)",
  borderRadius: "var(--radius-md, 8px)",
  padding: "0.2rem",
};

const filterBtnStyle: React.CSSProperties = {
  padding: "0.375rem 0.75rem",
  fontSize: "0.8rem",
  border: "none",
  borderRadius: "var(--radius-sm, 4px)",
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
  border: "1px solid var(--color-border, #e5e5e5)",
  borderRadius: "var(--radius-sm, 4px)",
  background: "#fff",
  minWidth: 180,
};

const inlineFormCardStyle: React.CSSProperties = {
  padding: "1.25rem",
  borderRadius: "var(--radius-md, 8px)",
  background: "var(--color-surface-1, #fafaf8)",
  border: "1px solid var(--color-border, #e5e5e5)",
};

const inlineFormStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  alignItems: "flex-end",
  flexWrap: "wrap",
};

const inputStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  fontSize: "0.85rem",
  border: "1px solid var(--color-border, #e5e5e5)",
  borderRadius: "var(--radius-sm, 4px)",
};

const emptyContainerStyle: React.CSSProperties = {
  display: "grid",
  gap: "0.5rem",
  padding: "2rem",
  textAlign: "center",
  alignItems: "center",
};

const emptyTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "1.125rem",
  fontWeight: 600,
};

const emptyDescStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "0.9rem",
  color: "#888",
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
  borderRadius: "var(--radius-md, 8px)",
  background: "var(--color-surface-1, #fafaf8)",
  border: "1px solid var(--color-border, #e5e5e5)",
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
  borderRadius: "var(--radius-sm, 4px)",
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
  borderRadius: "var(--radius-sm, 4px)",
  background: "var(--color-success-text)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const undoBtnStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  padding: "0.25rem 0.5rem",
  border: "none",
  borderRadius: "var(--radius-sm, 4px)",
  background: "transparent",
  color: "#999",
  cursor: "pointer",
};

const paymentPopoverStyle: React.CSSProperties = {
  position: "absolute",
  right: 0,
  top: "100%",
  zIndex: "var(--z-dropdown)",
  padding: "0.75rem",
  borderRadius: "var(--radius-md, 8px)",
  background: "#fff",
  border: "1px solid var(--color-border, #e5e5e5)",
  boxShadow: "var(--shadow-dropdown)",
  minWidth: 200,
};

const paymentMethodsRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.375rem",
};

const methodBtnStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  padding: "0.3rem 0.625rem",
  border: "1px solid var(--color-border, #e5e5e5)",
  borderRadius: "var(--radius-sm, 4px)",
  background: "var(--color-surface-warm)",
  cursor: "pointer",
  fontWeight: 500,
};

const cancelPayStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  padding: "0.25rem 0.5rem",
  border: "none",
  background: "transparent",
  color: "#999",
  cursor: "pointer",
  marginTop: "0.375rem",
};



const formErrorStyle: React.CSSProperties = {
  margin: "0.5rem 0 0",
  fontSize: "0.8rem",
  color: "var(--color-error-text)",
};

const variationStyle = {
  margin: "0.375rem 0 0",
  fontSize: "0.75rem",
  fontWeight: 500,
};

// Insight sections
const insightSectionStyle: React.CSSProperties = {
  padding: "1rem 1.25rem",
  borderRadius: "var(--radius-md, 8px)",
  background: "var(--color-surface-1, #fafaf8)",
  border: "1px solid var(--color-border, #e5e5e5)",
  display: "grid",
  gap: "0.75rem",
};

const insightToggleStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "var(--color-accent, #2d7d6f)",
  cursor: "pointer",
  textAlign: "left",
  padding: 0,
};

const insightContentStyle: React.CSSProperties = {
  display: "grid",
  gap: "0.5rem",
};

// Top patients
const topPatientRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.5rem 0",
  borderBottom: "1px solid var(--color-border, #e5e5e5)",
};

const topPatientRankStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#888",
  width: 20,
  textAlign: "center",
};

const topPatientNameStyle: React.CSSProperties = {
  flex: 1,
  fontSize: "0.85rem",
  fontWeight: 500,
  color: "#333",
};

const topPatientValueStyle: React.CSSProperties = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "var(--color-success-text)",
  fontVariantNumeric: "tabular-nums",
};

const topPatientSessionsStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#888",
};

// Year table
const yearTableStyle: React.CSSProperties = {
  display: "grid",
  gap: 0,
};

const yearTableHeaderStyle: React.CSSProperties = {
  display: "flex",
  padding: "0.5rem 0.75rem",
  borderBottom: "2px solid var(--color-border, #e5e5e5)",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#666",
  textTransform: "uppercase",
};

const yearTableColStyle: React.CSSProperties = {
  flex: 1,
  textAlign: "right" as const,
  fontSize: "0.82rem",
  fontVariantNumeric: "tabular-nums",
};

const yearTableRowStyle: React.CSSProperties = {
  display: "flex",
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid var(--color-border, #e5e5e5)",
  alignItems: "center",
};

const yearTableCurrentMonthStyle: React.CSSProperties = {
  background: "rgba(45, 125, 111, 0.05)",
  borderRadius: "var(--radius-sm, 4px)",
};

const yearTableTotalStyle: React.CSSProperties = {
  display: "flex",
  padding: "0.75rem",
  borderTop: "2px solid var(--color-border, #e5e5e5)",
  marginTop: "0.25rem",
  alignItems: "center",
};
