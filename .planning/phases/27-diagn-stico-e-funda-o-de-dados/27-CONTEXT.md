# Phase 27: Diagnóstico e Fundação de Dados - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Adicionar ferramentas de diagnóstico objetivo de performance (bundle analyzer, CWV instrumentation, query logging), otimizar o banco de dados (índices compostos, connection pooling), e estender column selection para search de pacientes. Tudo como foundation para as fases subsequentes de streaming, cache e assets.

**Requirements mapeados:** PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, PERF-06

</domain>

<decisions>
## Implementation Decisions

### Core Web Vitals Instrumentation (PERF-02)
- **D-01:** Endpoint interno no app (`/api/metrics`) que recebe métricas do browser via `web-vitals` library e grava em tabela no PostgreSQL.
- **D-02:** Não usar serviço externo nesta fase. RUM fica no próprio banco para simplicidade e controle total dos dados.

### Bundle Analysis (PERF-01)
- **D-03:** Bundle analyzer (`@next/bundle-analyzer`) configurado como script manual: `ANALYZE=true pnpm build` gera relatório HTML.
- **D-04:** CI gate com thresholds será adicionado na Phase 31 (Observabilidade), quando já tivermos baseline realista.

### Database Indexing (PERF-03)
- **D-05:** Adicionar obrigatoriamente os 2 índices sugeridos pela research:
  - `Appointment.[workspaceId, status, startsAt]`
  - `SessionCharge.[workspaceId, status, createdAt]`
- **D-06:** Após adicionar os 2 índices, rodar `EXPLAIN ANALYZE` nas queries mais críticas (financeiro, agenda, pacientes) dentro da mesma fase para identificar índices adicionais.

### Connection Pooling (PERF-04)
- **D-07:** Configurar Supavisor transaction mode (`DATABASE_URL` com `pgbouncer=true&prepareThreshold=0`).
- **D-08:** Manter `DIRECT_URL` (porta 5432) exclusivamente para migrations. Não alterar `directUrl` existente no `schema.prisma`.

### Query Logging (PERF-05)
- **D-09:** Prisma `$extends` middleware loga queries >500ms **apenas em desenvolvimento** (`NODE_ENV === 'development'`).
- **D-10:** Em produção, usar Supabase Observability (`pg_stat_statements`) para monitoramento de queries lentas — sem middleware Prisma em prod.

### Column Selection para Search (PERF-06)
- **D-11:** Estender `LIST_SELECT` pattern (já existente em `src/lib/patients/repository.prisma.ts`) para endpoints de search de pacientes.
- **D-12:** Manter `importantObservations: null` em todas as queries de listagem/search — não incluir o campo bruto em nenhum select de listagem.

### the agent's Discretion
- O planner pode decidir o schema exato da tabela `PerformanceMetric` (colunas, índices, TTL/retention).
- O planner pode decidir a estratégia de amostragem do endpoint `/api/metrics` (throttling, batching, deduplicação).
- O planner pode decidir quais queries adicionais rodar `EXPLAIN ANALYZE` além das críticas óbvias.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Visão, constraints, key decisions (especialmente v1.3 performance fixes)
- `.planning/REQUIREMENTS.md` — PERF-01 a PERF-06 com critérios de aceitação
- `.planning/research/SUMMARY.md` — Recomendações de stack, pitfalls e phase ordering

### Database
- `prisma/schema.prisma` — Schema atual com índices existentes (Appointment, SessionCharge, Patient)
- `src/lib/db.ts` — PrismaClient singleton e connection setup

### Patterns Existentes
- `src/lib/patients/repository.prisma.ts` — `LIST_SELECT` pattern (linha 28) e `listActive`/`listArchived`
- `src/lib/finance/repository.prisma.ts` — `listByWorkspaceAndDateRange` (consolidação de queries)
- `src/lib/clinical/repository.prisma.ts` — `findByAppointmentIds` (batch query pattern)

### Configuração
- `next.config.ts` — `optimizePackageImports` já configurado
- `package.json` — Dependências atuais (Next.js 15.2.4, Prisma 6.6.0, React 19)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/db.ts` — PrismaClient singleton com `globalThis.__psivaultPrisma__`. Pode ser estendido com `$extends` para query logging.
- `src/lib/patients/repository.prisma.ts` — `LIST_SELECT` pattern (linha 28) com `Prisma.validator<Prisma.PatientSelect>()` já estabelecido.
- `src/lib/*/repository.prisma.ts` — Repository pattern consistente em todos os domínios.

### Established Patterns
- **Repository pattern**: Interfaces em `repository.ts`, implementações Prisma em `repository.prisma.ts`, singletons em `store.ts`.
- **Workspace-scoped queries**: Toda query tem `where: { workspaceId }` como primeiro filtro.
- **Soft deletes**: `deletedAt IS NULL` em todas as listagens ativas.
- **`LIST_SELECT`**: Campos sensíveis excluídos de listagens (ex: `importantObservations: null`).
- **Server Actions**: Arquivo `actions.ts` junto às pages, sempre com `"use server"` no topo.
- **Caching**: `revalidatePath("/financeiro", "page")` em 13 server actions (v1.3). Cache do Next.js habilitado (force-dynamic removido).

### Integration Points
- `src/app/(vault)/financeiro/page.tsx` — Carrega dados pesados (trend, year, prev, charges). Uma das páginas-alvo para baseline de performance.
- `src/app/(vault)/inicio/page.tsx` — Dashboard com múltiplas seções de dados. Outra página-alvo para baseline.
- `src/middleware.ts` — Session resolution com JWT AAL fast-path. Não deve ser alterado nesta fase.
- `src/lib/db.ts` — Ponto único de PrismaClient. Ideal para adicionar `$extends` query logging.

</code_context>

<specifics>
## Specific Ideas

- O bundle analyzer deve gerar um arquivo HTML estático que possa ser aberto no browser sem servidor.
- A tabela de métricas CWV deve ser simples: `metric_name`, `value`, `rating` (good/needs-improvement/poor), `page_path`, `workspace_id` (nullable), `session_id` (nullable), `created_at`.
- O endpoint `/api/metrics` deve aceitar POST com body JSON array de métricas (batching) para reduzir requests.
- Índices adicionais identificados via EXPLAIN devem ser documentados em um comentário no schema.prisma ou em um ADR separado.

</specifics>

<deferred>
## Deferred Ideas

- CI gate de bundle size com thresholds automáticos — Phase 31 (Observabilidade)
- Serviço externo de RUM (ex: Vercel Speed Insights, Google Analytics 4) — v1.5+ se necessário
- React Compiler — v1.5+ (aguardar SWC integration)
- Deep memory leak investigation — apenas se dados de campo mostrarem degradação

### Reviewed Todos (not folded)
- Nenhum todo pendente relevante para esta fase.

</deferred>

---

*Phase: 27-diagn-stico-e-funda-o-de-dados*
*Context gathered: 2026-04-23*