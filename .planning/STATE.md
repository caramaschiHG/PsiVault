---
gsd_state_version: 1.0
milestone: v1.4
milestone_name: Performance Profunda
status: Roadmap defined — awaiting planning
stopped_at: Phase 27 context gathered
last_updated: "2026-04-23T15:33:38.652Z"
progress:
  total_phases: 5
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# STATE

## Project Reference

**Core Value**: Psicólogos conseguem gerenciar toda sua prática clínica em um único lugar, com segurança e praticidade profissional.
**Current Focus**: Milestone v1.4 Performance Profunda — roadmap definido, aguardando início do planning da Phase 27

## Current Position

Phase: 27 — Diagnóstico e Fundação de Dados
Plan: —
**Status**: Roadmap defined
**Last activity**: 2026-04-23 — Roadmap v1.4 criado com 5 fases e 25 requisitos mapeados

**Progress**:
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0% (0/5 phases)

## Performance Metrics

- N/A (baseline será estabelecido na Phase 27)

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

### Todos

- Iniciar `/gsd-plan-phase 27` quando aprovado

### Blockers

- N/A

## Session Continuity

Last session: 2026-04-23T15:33:38.631Z
Stopped at: Phase 27 context gathered
Resume file: .planning/phases/27-diagn-stico-e-funda-o-de-dados/27-CONTEXT.md
