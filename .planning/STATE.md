---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: Performance
status: In progress
stopped_at: Phase 23 complete — Phase 24 ready to plan
last_updated: "2026-04-23T00:00:00.000Z"
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 2
  completed_plans: 2
  percent: 25
---

# STATE

## Project Reference

**Core Value**: Psicólogos conseguem gerenciar toda sua prática clínica em um único lugar, com segurança e praticidade profissional.
**Current Focus**: Milestone v1.3 Performance — eliminar lentidão sistêmica identificada em auditoria

## Current Position

Phase: Phase 24 (next)
Plan: —
**Status**: In progress
**Last activity**: 2026-04-22 — Phase 23 complete (navegação + cache)

**Progress**:
[███████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 25%

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

### Todos

- N/A

### Blockers

- N/A

## Session Continuity

Last session: 2026-04-22
Stopped at: Milestone v1.3 started — requirements phase
Resume file: None
