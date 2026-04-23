import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const REPORT_PATH = path.join(process.cwd(), ".planning", "milestones", "v1.4-PERFORMANCE-REPORT.md");
const LIGHTHOUSE_DIR = path.join(process.cwd(), ".planning", "performance", "lighthouse");

async function fetchRum() {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        page_path,
        metric_name,
        percentile_cont(0.75) WITHIN GROUP (ORDER BY value) as p75,
        COUNT(*)::int as samples
      FROM performance_metrics
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY page_path, metric_name
      ORDER BY page_path, metric_name
    `;
    return rows;
  } catch {
    console.warn("Aviso: não foi possível consultar métricas RUM (banco indisponível).");
    return [];
  }
}

async function fetchLighthouse() {
  try {
    const entries = fs.readdirSync(LIGHTHOUSE_DIR);
    const jsonFiles = entries.filter((f) => f.endsWith(".json"));
    if (jsonFiles.length === 0) return null;
    jsonFiles.sort();
    const latest = jsonFiles[jsonFiles.length - 1];
    const content = fs.readFileSync(path.join(LIGHTHOUSE_DIR, latest), "utf-8");
    return { file: latest, data: JSON.parse(content) };
  } catch {
    return null;
  }
}

function formatRumTable(rows) {
  if (!rows || rows.length === 0) {
    return ["_Nenhuma métrica RUM coletada nos últimos 30 dias._", ""];
  }
  const lines = [
    "| Página | Métrica | p75 | Amostras |",
    "|--------|---------|-----|----------|",
  ];
  for (const row of rows) {
    const p75 = typeof row.p75 === "number" ? row.p75.toFixed(3) : String(row.p75);
    lines.push(`| ${row.page_path} | ${row.metric_name} | ${p75} | ${row.samples} |`);
  }
  lines.push("");
  return lines;
}

function formatLighthouse(lighthouse) {
  if (!lighthouse) {
    return [
      "_Nenhum relatório Lighthouse encontrado._",
      "",
      "Execute `pnpm lighthouse` para gerar um relatório.",
      "",
    ];
  }
  const lines = [
    `**Arquivo:** \`${lighthouse.file}\``,
    "",
  ];
  const runs = Array.isArray(lighthouse.data) ? lighthouse.data : [lighthouse.data];
  for (const run of runs.slice(0, 3)) {
    const url = run?.requestedUrl || run?.finalUrl || "—";
    const lhr = run?.lhr || run;
    const perf = lhr?.categories?.performance?.score;
    const perfLabel = typeof perf === "number" ? `${Math.round(perf * 100)}` : "N/A";
    const lcp = lhr?.audits?.["largest-contentful-paint"]?.numericValue;
    const lcpLabel = typeof lcp === "number" ? `${(lcp / 1000).toFixed(2)}s` : "N/A";
    const cls = lhr?.audits?.["cumulative-layout-shift"]?.numericValue;
    const clsLabel = typeof cls === "number" ? cls.toFixed(3) : "N/A";
    lines.push(`- **URL:** ${url}`);
    lines.push(`  - Performance score: ${perfLabel}`);
    lines.push(`  - LCP: ${lcpLabel}`);
    lines.push(`  - CLS: ${clsLabel}`);
    lines.push("");
  }
  return lines;
}

async function main() {
  const [rumRows, lighthouse] = await Promise.all([fetchRum(), fetchLighthouse()]);

  const lines = [
    "# v1.4 Performance Profunda — Relatório de Observabilidade",
    "",
    `Gerado em: ${new Date().toISOString()}`,
    "",
    "## Sobre este relatório",
    "",
    "Este documento consolida a infraestrutura de observabilidade instalada na **Phase 31** do milestone v1.4 Performance Profunda.",
    "Ele é gerado automaticamente pelo script `pnpm performance:report` e deve ser versionado no repositório.",
    "",
    "## Infraestrutura instalada",
    "",
    "- **Lighthouse CI**: auditoria automatizada de CWV em builds locais (`pnpm lighthouse`).",
    "- **RUM (Real User Monitoring)**: coleta contínua de LCP, INP, CLS, TTFB, FCP via `CwvCollector`.",
    "- **memlab**: detecção de memory leaks em fluxo de navegação (`pnpm memlab`).",
    "- **react-scan**: overlay de re-renders em desenvolvimento (dev-only).",
    "",
    "## Thresholds definidos",
    "",
    "| Métrica | Threshold | Tipo |",
    "|---------|-----------|------|",
    "| LCP | < 2.5s | error (falha build) |",
    "| CLS | < 0.1 | error (falha build) |",
    "| INP | monitorado | advisory |",
    "| TTFB | monitorado | advisory |",
    "",
    "## RUM — Últimos 30 dias",
    "",
    ...formatRumTable(rumRows),
    "## Lighthouse CI — Última execução",
    "",
    ...formatLighthouse(lighthouse),
    "## memlab",
    "",
    "Execute `pnpm memlab` e verifique o relatório no terminal.",
    "Se forem detectados leaks, documente-os nesta seção manualmente.",
    "",
    "## Próximos passos acionáveis",
    "",
    "- [ ] Revisar métricas RUM semanalmente via `/admin/performance`.",
    "- [ ] Executar `pnpm lighthouse` após mudanças significativas no bundle.",
    "- [ ] Executar `pnpm memlab` a cada release para detectar regressões de memória.",
    "- [ ] Revisar e ajustar thresholds de CWV conforme baseline se estabiliza.",
    "",
    "---",
    "*Relatório gerado automaticamente. Não edite manualmente — suas alterações serão sobrescritas.*",
    "",
  ];

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, lines.join("\n"), "utf-8");
  console.log(`Relatório gerado: ${REPORT_PATH}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
