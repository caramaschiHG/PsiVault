---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: Performance
status: Ready to plan
stopped_at: Roadmap created — Phase 23 ready to plan
last_updated: "2026-04-22T00:00:00.000Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# STATE

## Project Reference

**Core Value**: Psicólogos conseguem gerenciar toda sua prática clínica em um único lugar, com segurança e praticidade profissional.
**Current Focus**: Milestone v1.3 Performance — eliminar lentidão sistêmica identificada em auditoria

## Current Position

Phase: Phase 23 (not started)
Plan: —
**Status**: Ready to plan
**Last activity**: 2026-04-22 — Roadmap created (Phases 23–26)

**Progress**:
[                                                            ] 0%

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
- [v1.3 Audit]: força-dynamic no vault layout desabilita todo caching — remover na Wave 1.
- [v1.3 Audit]: Sidebar/bottom nav usam `<a href>` em vez de `<Link>` — causa full reload em cada click.
- [v1.3 Audit]: /financeiro dispara ~44 queries de DB por page load (trend x6 + year x12 x 2 queries cada).
- [v1.3 Audit]: resolveSession() não usa React.cache() — executa Supabase + DB call a cada invocação.
- [v1.3 Audit]: Middleware faz 2-3 round-trips Supabase por request (getUser + getAuthenticatorAssuranceLevel).

### Todos

- N/A

### Blockers

- N/A

## Session Continuity

Last session: 2026-04-22
Stopped at: Milestone v1.3 started — requirements phase
Resume file: None
