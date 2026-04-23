---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: Performance
status: In progress
stopped_at: Phase 25 complete — Phase 26 ready to plan
last_updated: "2026-04-22T00:00:00.000Z"
progress:
  total_phases: 4
  completed_phases: 3
  total_plans: 6
  completed_plans: 6
  percent: 75
---

# STATE

## Project Reference

**Core Value**: Psicólogos conseguem gerenciar toda sua prática clínica em um único lugar, com segurança e praticidade profissional.
**Current Focus**: Milestone v1.3 Performance — eliminar lentidão sistêmica identificada em auditoria

## Current Position

Phase: Phase 26 (next)
Plan: —
**Status**: In progress
**Last activity**: 2026-04-22 — Phase 25 complete (finance query consolidation)

**Progress**:
[████████████████████████████████████████░░░░░░░░░░░░] 75%

## Performance Metrics

- N/A

## Accumulated Context

### Decisions

- [v1.2 Phase 19]: Separated UX refactoring from new features to ensure foundation is ready before adding complexities.
- [v1.2 Phase 19]: Modals synced with URL to prevent breaking browser history.
- [v1.2 Phase 19]: On-the-fly PDF generation implemented to avoid storage overhead and timeout issues.
- [v1.2 Phase 19]: Flattened the finance summary into a chronological sequence for better readability.
- [v1.2 Phase 19]: Implemented client-side filtering on the flat list directly without grouping.
- [v1.2 Phase 19]: Used URL searchParams to control the side panel visibility instead of local state.
- [v1.2 Phase 20]: MaterializeSeriesInput omits dueDate replaced by firstOccurrenceDate for series scheduling.
- [v1.3 Audit]: força-dynamic no vault layout desabilita todo caching — removido na Phase 23.
- [v1.3 Audit]: Sidebar/bottom nav usam `<a href>` em vez de `<Link>` — migrado para Link na Phase 23.
- [v1.3 Audit]: /financeiro dispara ~44 queries de DB por page load (trend x6 + year x12 x 2 queries cada).
- [v1.3 Audit]: resolveSession() não usa React.cache() — wrappado com React.cache() na Phase 23.
- [v1.3 Audit]: Middleware faz 2-3 round-trips Supabase por request (getUser + getAuthenticatorAssuranceLevel).
- [v1.3 Phase 23]: React.cache() é request-scoped (por render tree) — não persiste entre requests. Correto para dados de auth.
- [v1.3 Phase 23]: signout link (/api/auth/signout) mantido como `<a href>` — API route não deve usar Link.
- [v1.3 Phase 23]: Baseline de testes = 407 (roadmap tinha 351 desatualizado).
- [v1.3 Phase 25]: listByWorkspaceAndDateRange adicionado ao SessionChargeRepository — uma query cobre todos os meses (trend + year).
- [v1.3 Phase 25]: current e prev deduplicated do batch — sem chamadas standalone.
- [v1.3 Phase 25]: revalidatePath("/financeiro", "page") em todas as 13 server actions — preserva cache do vault layout.

### Todos

- N/A

### Blockers

- N/A

## Session Continuity

Last session: 2026-04-22
Stopped at: Phase 25 complete — Phase 26 N+1 e Column Selection ready to plan
Resume file: None
