/**
 * /financeiro — Monthly financial summary with actions.
 *
 * Features:
 * - Month navigation
 * - Summary cards (sessions, received, pending)
 * - Patient filter dropdown
 * - Charge list with "Mark as paid" action
 * - Inline form to add manual charges
 * - CSV export button
 * - Monthly trend chart (last 6 months)
 */

"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SessionCharge, Patient } from "./domain-types";

const ptBRDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface FinanceiroPageProps {
  initialCharges: SessionCharge[];
  patients: Patient[];
  summary: { totalSessions: number; totalReceivedCents: number; totalPendingCents: number };
  year: number;
  month: number;
  monthLabel: string;
  prevHref: string;
  nextHref: string;
  trends: { monthLabel: string; totalReceived: number }[];
}

export default function FinanceiroPageClient({
  initialCharges,
  patients,
  summary,
  year,
  month,
  monthLabel,
  prevHref,
  nextHref,
  trends,
}: FinanceiroPageProps) {
  const [charges, setCharges] = useState(initialCharges);
  const [filterPatient, setFilterPatient] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  // Filter charges
  const filteredCharges = filterPatient
    ? charges.filter((c) => c.patientId === filterPatient)
    : charges;

  // Group by patient
  const grouped = new Map<string, SessionCharge[]>();
  for (const charge of filteredCharges) {
    const key = charge.patientId;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(charge);
  }

  // Inline add form
  async function handleAddCharge(formData: FormData) {
    setFormError(null);
    startTransition(async () => {
      const mod = await import("./actions");
      const result = await mod.createManualChargeAction(formData);
      if (result.ok) {
        setShowAddForm(false);
        // Reload via revalidation — for now just close form; user can navigate months
        window.location.reload();
      } else {
        setFormError(result.error ?? "Erro desconhecido.");
      }
    });
  }

  // CSV export
  function handleExport() {
    startTransition(async () => {
      const mod = await import("./actions");
      const csv = await mod.exportFinanceCSVAction(year, month);
      if (!csv) return;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `psivault-financeiro-${MONTH_LABELS[month - 1].toLowerCase()}-${year}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Mark as paid
  async function handleMarkPaid(chargeId: string) {
    const mod = await import("./actions");
    const result = await mod.markChargeAsPaidAction(chargeId);
    if (result.ok) {
      setCharges((prev) =>
        prev.map((c) => (c.id === chargeId ? { ...c, status: "pago" as const } : c)),
      );
    }
  }

  const maxTrend = Math.max(...trends.map((t) => t.totalReceived), 1);

  return (
    <main style={shellStyle}>
      {/* Page heading */}
      <div style={headingBlockStyle}>
        <p style={eyebrowStyle}>Resumo financeiro</p>
        <h1 style={titleStyle}>Financeiro</h1>
      </div>

      {/* Month navigation */}
      <div style={monthNavStyle}>
        <a href={prevHref} className="btn-ghost" style={navArrowStyle}>
          ← Anterior
        </a>
        <span style={monthLabelStyle}>{monthLabel}</span>
        <a href={nextHref} className="btn-ghost" style={navArrowStyle}>
          Próximo →
        </a>
      </div>

      {/* Summary cards */}
      <div style={summaryCardsStyle}>
        <div style={summaryCardStyle}>
          <p style={cardLabelStyle}>Sessões</p>
          <p style={cardValueStyle}>{summary.totalSessions}</p>
        </div>
        <div style={summaryCardStyle}>
          <p style={cardLabelStyle}>Recebido</p>
          <p style={{ ...cardValueStyle, color: "#166534" }}>
            {currency.format(summary.totalReceivedCents / 100)}
          </p>
        </div>
        <div style={summaryCardStyle}>
          <p style={cardLabelStyle}>Pendente / Atrasado</p>
          <p style={{ ...cardValueStyle, color: "#92400e" }}>
            {currency.format(summary.totalPendingCents / 100)}
          </p>
        </div>
      </div>

      {/* Trend chart */}
      {trends.length > 0 && (
        <div style={trendCardStyle}>
          <p style={trendLabelStyle}>Receita mensal</p>
          <div style={chartContainerStyle}>
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

      {/* Actions bar: filter + add + export */}
      <div style={actionsBarStyle}>
        <select
          className="input-field"
          value={filterPatient}
          onChange={(e) => setFilterPatient(e.target.value)}
          style={{ minWidth: 200 }}
        >
          <option value="">Todos os pacientes</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.socialName ?? p.fullName}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button variant="secondary" size="sm" onClick={() => setShowAddForm((v) => !v)}>
            {showAddForm ? "Fechar" : "+ Adicionar cobrança"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExport} isLoading={isPending}>
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Inline add form */}
      {showAddForm && (
        <div style={inlineFormCardStyle}>
          <form action={handleAddCharge} style={inlineFormStyle}>
            <select name="patientId" className="input-field" required defaultValue="">
              <option value="" disabled>
                Paciente
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.socialName ?? p.fullName}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="date"
              className="input-field"
              defaultValue={new Date().toISOString().split("T")[0]}
            />
            <input
              type="number"
              name="amountInCents"
              className="input-field"
              placeholder="Valor (centavos)"
              required
              min="1"
            />
            <Button type="submit" variant="primary" isLoading={isPending}>
              Adicionar
            </Button>
          </form>
          {formError && <p style={formErrorStyle}>{formError}</p>}
        </div>
      )}

      {/* Charge list */}
      {charges.length === 0 ? (
        <div style={emptyContainerStyle}>
          <p style={emptyTitleStyle}>Nenhuma cobrança este mês</p>
          <p style={emptyDescStyle}>Tudo em dia! Nenhuma sessão concluída neste período.</p>
          <Button variant="primary" onClick={() => setShowAddForm(true)}>
            Adicionar primeira cobrança
          </Button>
        </div>
      ) : filteredCharges.length === 0 ? (
        <p style={noFilterResultStyle}>Nenhuma cobrança para este paciente.</p>
      ) : (
        <div style={listStyle}>
          {Array.from(grouped.entries()).map(([patientId, patientCharges]) => {
            const patient = patients.find((p) => p.id === patientId);
            const patientName = patient?.socialName ?? patient?.fullName ?? patientId;

            return (
              <div key={patientId} style={patientGroupStyle}>
                <h3 style={patientNameHeadingStyle}>{patientName}</h3>
                {patientCharges.map((charge) => {
                  const canMarkPaid = charge.status !== "pago";
                  const statusColors = CHARGE_COLORS[charge.status] ?? CHARGE_COLORS.pendente;

                  return (
                    <div key={charge.id} className="row-interactive" style={rowStyle}>
                      <div style={rowInfoStyle}>
                        <span style={dateLabelStyle}>
                          {ptBRDate.format(charge.createdAt)}
                        </span>
                      </div>
                      <div style={rowRightStyle}>
                        <span
                          style={{
                            ...statusBadgeStyle,
                            background: statusColors.background,
                            color: statusColors.color,
                          }}
                        >
                          {CHARGE_LABELS[charge.status] ?? charge.status}
                        </span>
                        <span style={amountLabelStyle}>
                          {charge.amountInCents !== null
                            ? currency.format(charge.amountInCents / 100)
                            : "Sem valor"}
                        </span>
                        {canMarkPaid && (
                          <button
                            className="btn-ghost"
                            style={{ fontSize: "0.78rem", padding: "0.25rem 0.5rem" }}
                            onClick={() => handleMarkPaid(charge.id)}
                          >
                            Marcar como pago
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHARGE_LABELS: Record<string, string> = {
  pago: "Pago",
  pendente: "Pendente",
  atrasado: "Atrasado",
};

const CHARGE_COLORS: Record<string, { background: string; color: string }> = {
  pago: { background: "rgba(34, 197, 94, 0.1)", color: "#166534" },
  pendente: { background: "rgba(245, 158, 11, 0.1)", color: "#92400e" },
  atrasado: { background: "rgba(239, 68, 68, 0.1)", color: "#991b1b" },
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const shellStyle = {
  padding: "2rem 2.5rem",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "1.5rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const headingBlockStyle = { display: "grid", gap: "0.25rem" } satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontSize: "0.7rem",
  color: "var(--color-brown-mid)",
  fontWeight: 600,
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "var(--font-size-page-title)",
  fontWeight: 700,
  fontFamily: "var(--font-serif)",
} satisfies React.CSSProperties;

const monthNavStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "0.75rem 1.25rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

const navArrowStyle = { fontSize: "0.875rem", padding: "0.375rem 0.75rem" } satisfies React.CSSProperties;

const monthLabelStyle = {
  flex: 1,
  textAlign: "center",
  fontWeight: 600,
  fontSize: "1rem",
} satisfies React.CSSProperties;

const summaryCardsStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const summaryCardStyle = {
  padding: "1.25rem 1.5rem",
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  boxShadow: "var(--shadow-md)",
  display: "grid",
  gap: "0.4rem",
} satisfies React.CSSProperties;

const cardLabelStyle = {
  margin: 0,
  fontSize: "0.72rem",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--color-text-4)",
  fontWeight: 600,
} satisfies React.CSSProperties;

const cardValueStyle = {
  margin: 0,
  fontSize: "1.625rem",
  fontWeight: 700,
  fontFamily: "'IBM Plex Serif', serif",
  lineHeight: 1,
} satisfies React.CSSProperties;

// Trend chart
const trendCardStyle = {
  padding: "1.25rem 1.5rem",
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  display: "grid",
  gap: "1rem",
} satisfies React.CSSProperties;

const trendLabelStyle = {
  margin: 0,
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--color-text-4)",
  fontWeight: 600,
} satisfies React.CSSProperties;

const chartContainerStyle = {
  display: "flex",
  alignItems: "flex-end",
  gap: "0.75rem",
  height: "100px",
} satisfies React.CSSProperties;

const barWrapperStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.375rem",
  height: "100%",
  justifyContent: "flex-end",
} satisfies React.CSSProperties;

const barStyle = {
  width: "100%",
  maxWidth: "60px",
  background: "var(--color-accent)",
  borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
  minHeight: "4px",
  transition: "opacity 0.12s",
} satisfies React.CSSProperties;

const barLabelStyle = {
  fontSize: "0.7rem",
  color: "var(--color-text-3)",
  fontWeight: 500,
} satisfies React.CSSProperties;

// Actions bar
const actionsBarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "0.75rem",
} satisfies React.CSSProperties;

// Inline form
const inlineFormCardStyle = {
  padding: "1.25rem",
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

const inlineFormStyle = {
  display: "flex",
  gap: "0.75rem",
  alignItems: "flex-end",
  flexWrap: "wrap",
} satisfies React.CSSProperties;

// Empty state
const emptyContainerStyle = {
  display: "grid",
  gap: "0.5rem",
  padding: "2rem",
  textAlign: "center",
  alignItems: "center",
} satisfies React.CSSProperties;

const emptyTitleStyle = {
  margin: 0,
  fontSize: "1.125rem",
  fontWeight: 600,
} satisfies React.CSSProperties;

const emptyDescStyle = {
  margin: 0,
  fontSize: "0.9rem",
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;

const noFilterResultStyle = {
  textAlign: "center",
  padding: "2rem",
  color: "var(--color-text-3)",
  fontSize: "0.9rem",
} satisfies React.CSSProperties;

// Charge list
const listStyle = { display: "grid", gap: "1rem" } satisfies React.CSSProperties;

const patientGroupStyle = { display: "grid", gap: "0.5rem" } satisfies React.CSSProperties;

const patientNameHeadingStyle = {
  margin: 0,
  fontSize: "0.95rem",
  fontWeight: 600,
  fontFamily: "var(--font-serif)",
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const rowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.75rem 1.25rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  gap: "0.5rem",
  flexWrap: "wrap",
} satisfies React.CSSProperties;

const rowInfoStyle = { display: "flex", flexDirection: "column", gap: "0.2rem" } satisfies React.CSSProperties;

const dateLabelStyle = { fontSize: "0.8rem", color: "var(--color-text-3)" } satisfies React.CSSProperties;

const rowRightStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const statusBadgeStyle = {
  display: "inline-block",
  fontSize: "0.72rem",
  fontWeight: 600,
  padding: "0.2rem 0.625rem",
  borderRadius: "var(--radius-pill)",
} satisfies React.CSSProperties;

const amountLabelStyle = {
  fontSize: "0.9rem",
  color: "var(--color-text-2)",
  fontWeight: 600,
} satisfies React.CSSProperties;

const formErrorStyle = {
  margin: "0.5rem 0 0",
  fontSize: "0.8rem",
  color: "var(--color-error-text, #dc2626)",
} satisfies React.CSSProperties;
