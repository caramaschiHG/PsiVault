import { getMetricsRepository } from "@/lib/metrics/store";
import { notFound } from "next/navigation";
import type React from "react";

export default async function PerformanceDashboardPage() {
  if (process.env.ENABLE_PERF_DASHBOARD !== "1") {
    notFound();
  }

  const repo = getMetricsRepository();
  const rows = await repo.getP75ByPagePath(7);

  const byPage = rows.reduce<Record<string, typeof rows>>((acc, row) => {
    if (!acc[row.pagePath]) acc[row.pagePath] = [];
    acc[row.pagePath].push(row);
    return acc;
  }, {});

  return (
    <div style={{ padding: "2rem", maxWidth: "960px" }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem" }}>
        Observabilidade de Performance
      </h1>
      <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
        Percentil 75 (p75) das Core Web Vitals — últimos 7 dias
      </p>

      {Object.entries(byPage).map(([page, metrics]) => (
        <section key={page} style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            {page}
          </h2>
          <div style={{ overflowX: "auto" as const }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Métrica</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>p75</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.metricName}>
                    <td style={tdStyle}>{m.metricName}</td>
                    <td style={{ ...tdStyle, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      {typeof m.p75 === "number" ? m.p75.toFixed(3) : String(m.p75)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {rows.length === 0 && (
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          Nenhuma métrica coletada nos últimos 7 dias. Verifique se o CwvCollector está ativo.
        </p>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid var(--color-border)",
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid var(--color-border-subtle)",
};
