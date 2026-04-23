"use client";

import type { SessionCharge } from "@/lib/finance/model";

interface YearSummaryExportButtonProps {
  yearSummary: {
    month: number;
    monthLabel: string;
    received: number;
    pending: number;
    overdue: number;
    sessions: number;
  }[];
  year: number;
}

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function ExportIrButton({ yearSummary, year }: YearSummaryExportButtonProps) {
  function handleExport() {
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
  }

  return (
    <button
      type="button"
      className="btn-ghost"
      style={{ fontSize: "0.85rem", padding: "0.5rem 0.75rem" }}
      onClick={handleExport}
    >
      📄 Exportar resumo IR
    </button>
  );
}

export { ExportIrButton };
