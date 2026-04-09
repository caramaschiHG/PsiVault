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
import { Button } from "@/components/ui/button";
import type { SessionCharge, Patient } from "./domain-types";

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
  pago: { bg: "#dcfce7", text: "#166534", label: "Pago" },
  pendente: { bg: "#fef3c7", text: "#92400e", label: "Pendente" },
  atrasado: { bg: "#fee2e2", text: "#991b1b", label: "Atrasado" },
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
}: FinanceiroPageProps) {
  const [charges, setCharges] = useState(initialCharges);
  const [filterPatient, setFilterPatient] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("todos");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [payingCharge, setPayingCharge] = useState<string | null>(null);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
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

  // Group by patient
  const grouped = useMemo(() => {
    const map = new Map<string, SessionCharge[]>();
    for (const charge of filteredCharges) {
      const key = charge.patientId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(charge);
    }
    return map;
  }, [filteredCharges]);

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

  async function handleAddCharge(formData: FormData) {
    setFormError(null);
    startTransition(async () => {
      const mod = await import("./actions");
      const result = await mod.createManualChargeAction(formData);
      if (result.ok) {
        setShowAddForm(false);
        window.location.reload();
      } else {
        setFormError(result.error ?? "Erro desconhecido.");
      }
    });
  }

  function handleExport() {
    startTransition(async () => {
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
    });
  }

  async function handleQuickPay(chargeId: string, method: string) {
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
      setPayingCharge(null);
      showToast("Pagamento registrado ✓");
    }
  }

  async function handleUndoPay(chargeId: string) {
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
        <div style={{ ...miniCardStyle, borderLeft: "3px solid #166534" }}>
          <p style={miniCardLabelStyle}>Recebido</p>
          <p style={miniCardValueStyle}>{currency.format(summary.totalReceivedCents / 100)}</p>
          {prevMonthReceived > 0 && (
            <p style={variationStyle}>
              {summary.totalReceivedCents / 100 >= prevMonthReceived ? (
                <span style={{ color: "#166534" }}>↑ +{Math.round(((summary.totalReceivedCents / 100 - prevMonthReceived) / prevMonthReceived) * 100)}%</span>
              ) : (
                <span style={{ color: "#991b1b" }}>↓ -{Math.round(((prevMonthReceived - summary.totalReceivedCents / 100) / prevMonthReceived) * 100)}%</span>
              )}
              <span style={{ color: "#999", marginLeft: "0.25rem" }}>vs {MONTH_LABELS[month === 1 ? 11 : month - 2]}</span>
            </p>
          )}
        </div>
        <div style={{ ...miniCardStyle, borderLeft: "3px solid #92400e" }}>
          <p style={miniCardLabelStyle}>Pendente</p>
          <p style={miniCardValueStyle}>{currency.format(summary.totalPendingCents / 100)}</p>
        </div>
        <div style={{ ...miniCardStyle, borderLeft: "3px solid #991b1b" }}>
          <p style={miniCardLabelStyle}>Atrasado</p>
          <p style={{ ...miniCardValueStyle, color: "#991b1b" }}>
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
          <Button variant="secondary" size="sm" onClick={() => setShowAddForm((v) => !v)}>
            {showAddForm ? "Fechar" : "+ Cobrança"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExport} isLoading={isPending}>
            Exportar
          </Button>
        </div>
      </div>

      {/* Inline add form */}
      {showAddForm && (
        <div style={inlineFormCardStyle}>
          <form action={handleAddCharge} style={inlineFormStyle}>
            <select name="patientId" required defaultValue="" style={inputStyle}>
              <option value="" disabled>Paciente</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.socialName ?? p.fullName}</option>
              ))}
            </select>
            <input type="date" name="date" defaultValue={new Date().toISOString().split("T")[0]} style={inputStyle} />
            <input type="number" name="amountBrl" placeholder="Valor (R$)" required min="0.01" step="0.01" style={inputStyle} />
            <Button type="submit" variant="primary" isLoading={isPending}>Adicionar</Button>
          </form>
          {formError && <p style={formErrorStyle}>{formError}</p>}
        </div>
      )}

      {/* Charge list */}
      {charges.length === 0 ? (
        <div style={emptyContainerStyle}>
          <p style={emptyTitleStyle}>Nenhuma cobrança este mês</p>
          <p style={emptyDescStyle}>Tudo em dia! Nenhuma sessão concluída neste período.</p>
          <Button variant="primary" onClick={() => setShowAddForm(true)}>Adicionar primeira cobrança</Button>
        </div>
      ) : filteredCharges.length === 0 ? (
        <p style={noFilterResultStyle}>Nenhuma cobrança para os filtros selecionados.</p>
      ) : (
        <div style={listStyle}>
          {Array.from(grouped.entries()).map(([patientId, patientCharges]) => {
            const patient = patientMap.get(patientId);
            const patientName = patient?.socialName ?? patient?.fullName ?? patientId;
            const totals = patientTotals.get(patientId) ?? { paid: 0, pending: 0, overdue: 0 };
            const isExpanded = expandedPatient === patientId;
            const hasMultiple = patientCharges.length > 1;

            return (
              <div key={patientId} style={patientGroupStyle}>
                {/* Patient header — clickable to expand */}
                <div
                  style={patientHeaderStyle}
                  onClick={() => hasMultiple && setExpandedPatient(isExpanded ? null : patientId)}
                  className={hasMultiple ? "clickable" : ""}
                >
                  <h3 style={patientNameHeadingStyle}>{patientName}</h3>
                  <div style={patientTotalsRowStyle}>
                    {totals.paid > 0 && (
                      <span style={{ ...totalBadgeStyle, background: "#dcfce7", color: "#166534" }}>
                        Recebido: {currency.format(totals.paid / 100)}
                      </span>
                    )}
                    {totals.pending > 0 && (
                      <span style={{ ...totalBadgeStyle, background: "#fef3c7", color: "#92400e" }}>
                        Pendente: {currency.format(totals.pending / 100)}
                      </span>
                    )}
                    {totals.overdue > 0 && (
                      <span style={{ ...totalBadgeStyle, background: "#fee2e2", color: "#991b1b" }}>
                        Atrasado: {currency.format(totals.overdue / 100)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Charges */}
                {patientCharges.map((charge, idx) => {
                  const showCharge = !hasMultiple || isExpanded || idx < 2;
                  if (!showCharge) return null;

                  const color = STATUS_COLORS[charge.status] ?? STATUS_COLORS.pendente;
                  const isPaying = payingCharge === charge.id;

                  return (
                    <div key={charge.id} style={rowStyle}>
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

                        {charge.status === "pago" ? (
                          <button
                            style={undoBtnStyle}
                            onClick={() => handleUndoPay(charge.id)}
                            title="Desfazer pagamento"
                          >
                            ↩ Desfazer
                          </button>
                        ) : isPaying ? (
                          <div style={paymentPopoverStyle}>
                            <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#666" }}>
                              Forma de pagamento:
                            </p>
                            <div style={paymentMethodsRowStyle}>
                              {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                                <button
                                  key={key}
                                  style={methodBtnStyle}
                                  onClick={() => handleQuickPay(charge.id, key)}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                            <button
                              style={cancelPayStyle}
                              onClick={() => setPayingCharge(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            style={payBtnStyle}
                            onClick={() => setPayingCharge(charge.id)}
                            title="Registrar pagamento"
                          >
                            ✓ Receber
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Show more indicator */}
                {hasMultiple && !isExpanded && patientCharges.length > 2 && (
                  <button
                    style={showMoreStyle}
                    onClick={() => setExpandedPatient(patientId)}
                  >
                    +{patientCharges.length - 2} mais
                  </button>
                )}
                {hasMultiple && isExpanded && (
                  <button
                    style={showLessStyle}
                    onClick={() => setExpandedPatient(null)}
                  >
                    Recolher
                  </button>
                )}
              </div>
            );
          })}
        </div>
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
                  <span style={{ ...yearTableColStyle, color: "#166534" }}>
                    {m.received > 0 ? currency.format(m.received) : "—"}
                  </span>
                  <span style={{ ...yearTableColStyle, color: "#92400e" }}>
                    {m.pending > 0 ? currency.format(m.pending) : "—"}
                  </span>
                  <span style={{ ...yearTableColStyle, color: "#991b1b" }}>
                    {m.overdue > 0 ? currency.format(m.overdue) : "—"}
                  </span>
                  <span style={yearTableColStyle}>{m.sessions || "—"}</span>
                </div>
              ))}
              <div style={yearTableTotalStyle}>
                <span style={{ flex: 2, fontWeight: 700 }}>Total</span>
                <span style={{ ...yearTableColStyle, fontWeight: 700, color: "#166534" }}>
                  {currency.format(yearSummary.reduce((s, m) => s + m.received, 0))}
                </span>
                <span style={{ ...yearTableColStyle, fontWeight: 700, color: "#92400e" }}>
                  {currency.format(yearSummary.reduce((s, m) => s + m.pending, 0))}
                </span>
                <span style={{ ...yearTableColStyle, fontWeight: 700, color: "#991b1b" }}>
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
  background: "#166534",
  color: "#fff",
  fontSize: "0.875rem",
  fontWeight: 600,
  zIndex: 9999,
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
  color: "#222",
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
  background: "#2d7d6f",
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

const patientGroupStyle: React.CSSProperties = { display: "grid", gap: "0.375rem" };

const patientHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.5rem 0.75rem",
  borderRadius: "var(--radius-sm, 4px)",
  flexWrap: "wrap",
  gap: "0.5rem",
};

const patientNameHeadingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "0.95rem",
  fontWeight: 600,
  fontFamily: "var(--font-serif, Georgia, serif)",
  color: "#444",
};

const patientTotalsRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
};

const totalBadgeStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  padding: "0.2rem 0.5rem",
  borderRadius: "var(--radius-sm, 4px)",
  fontWeight: 600,
};

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
  background: "#166534",
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
  zIndex: 100,
  padding: "0.75rem",
  borderRadius: "var(--radius-md, 8px)",
  background: "#fff",
  border: "1px solid var(--color-border, #e5e5e5)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
  background: "#fafaf8",
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

const showMoreStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  padding: "0.375rem 0.75rem",
  border: "none",
  background: "transparent",
  color: "var(--color-accent, #2d7d6f)",
  cursor: "pointer",
  fontWeight: 600,
  textAlign: "left",
};

const showLessStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  padding: "0.375rem 0.75rem",
  border: "none",
  background: "transparent",
  color: "#888",
  cursor: "pointer",
  textAlign: "left",
};

const formErrorStyle: React.CSSProperties = {
  margin: "0.5rem 0 0",
  fontSize: "0.8rem",
  color: "#dc2626",
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
  color: "#166534",
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
