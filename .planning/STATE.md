---
gsd_state_version: 1.0
milestone: v1.4
milestone_name: Performance Profunda
status: Phase 28 planned — ready for execution
stopped_at: Phase 28 planning complete
last_updated: "2026-04-23T16:30:00.000Z"
progress:
  total_phases: 5
  completed_phases: 1
  total_plans: 7
  completed_plans: 3
---

# STATE

## Project Reference

**Core Value**: Psicólogos conseguem gerenciar toda sua prática clínica em um único lugar, com segurança e praticidade profissional.
**Current Focus**: Milestone v1.4 Performance Profunda — Phase 28 planned (4 plans), ready for execution

## Current Position

Phase: 28 — Streaming e Suspense Granular
Plan: 01–04 (planned)
**Status**: Planning complete. All 4 plans validated and committed.
**Last activity**: 2026-04-23 — Phase 28 planning completed

**Progress**:
[███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 20% (1/5 phases)

## Performance Metrics

- Phase 27 duration: ~50 min total
- 3 plans executed, 10 commits created
- 407 tests passing (no regressions)
- Build successful with no TypeScript errors

## Accumulated Context

### Decisions

- [v1.3 Phase 23]: React.cache() é request-scoped (por render tree) — não persiste entre requests. Correto para dados de auth.
- [v1.3 Phase 23]: signout link (/api/auth/signout) mantido como `<a href>` — API route não deve usar Link.
- [v1.3 Phase 23]: Baseline de testes = 407 (roadmap tinha 351 desatualizado).
- [v1.3 Phase 25]: listByWorkspaceAndDateRange adicionado ao SessionChargeRepository — uma query cobre todos os meses (trend + year).
- [v1.3 Phase 25]: revalidatePath("/financeiro", "page") em todas as 13 server actions — preserva cache do vault layout.
- [v1.3 Phase 26]: findByAppointmentIds retorna Set<string> — agenda só precisa checar presença, não conteúdo da nota.
- [v1.3 Phase 26]: importantObservations: null em listActive/listArchived (Prisma + in-memory). findById e listAllByWorkspace retornam completo.
- [v1.3 Phase 26]: listAllByWorkspace adicionado para backup/export — único caller que precisa de importantObservations em bulk.
- [v1.4 Roadmap]: Phase 27 first — database performance é foundation; indexes e pooling beneficiam todas as fases subsequentes.
- [v1.4 Roadmap]: Phase 29 depois de Phase 28 — caching não deve mascarar queries lentas; arquitetura de streaming estável antes de cache.
- [v1.4 Roadmap]: Phase 31 last — medição before/after requer todas as otimizações anteriores instaladas.
- [v1.4 Phase 27]: Bundle analyzer ativado condicionalmente via ANALYZE=true — não adiciona overhead em builds normais.
- [v1.4 Phase 27]: CWV collector envia métricas anonimamente (workspaceId null permitido) — dados de timing não contêm PII.
- [v1.4 Phase 27]: Query logging threshold 500ms — suficiente para capturar queries lentas sem poluir console.
- [v1.4 Phase 27]: searchByName usa database-level search com LIST_SELECT — elimina carregamento de todos os pacientes em memória.
- [v1.4 Phase 28]: Async sections para /financeiro computam a partir de dados core (charges, patients) carregados no page.tsx pai — valor está na renderização progressiva, não no fetch independente.
- [v1.4 Phase 28]: Async sections para /inicio carregam seus próprios dados independentemente.
- [v1.4 Phase 28]: React 19 `use` API utilizado em RemindersSection para streaming de promises para Client Components.
- [v1.4 Phase 28]: Skeletons usam mesmas variáveis CSS dos componentes reais para zero CLS.
- [v1.4 Phase 28]: Error boundaries por seção via AsyncBoundary (Client Component) — erro em uma seção não quebra a página.

### Todos

- Executar `/gsd-execute-phase 28` para iniciar implementação

### Blockers

- N/A

## Session Continuity

Last session: 2026-04-23T16:30:00.000Z
Stopped at: Phase 28 planning complete — 4 plans created, validated, and committed
Resume file: .planning/phases/28-streaming-suspense/28-01-PLAN.md
