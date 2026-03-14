---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: planning
stopped_at: Completed 05-03-PLAN.md
last_updated: "2026-03-14T23:24:18.241Z"
last_activity: 2026-03-14 — completed `03-03` ClinicalTimeline plan; checkpoint verified and approved
progress:
  total_phases: 6
  completed_phases: 5
  total_plans: 16
  completed_plans: 16
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-13)

**Core value:** The psychologist can finish a session, register everything correctly in a few minutes, and trust that the clinical and operational history is safe, findable, and under control.
**Current focus:** Phase 1 is complete. The vault foundation now covers auth/session, professional setup, and the visible trust surface, so the next step is Phase 2 planning.

## Current Position

Phase: 3 of 6 — **Clinical Record Core complete**
Plan: 3 of 3 completed
Status: Ready for Phase 4 planning (Document Vault)
Last activity: 2026-03-14 — completed `03-03` ClinicalTimeline plan; checkpoint verified and approved

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Total execution time: 7h 27m

**By Phase:**

| Phase | Plans | Status |
|-------|-------|--------|
| 01-vault-foundation | 3/3 | Complete |
| 02-patient-agenda-core | 0/3 | Not started |
| 03-clinical-record-core | 0/3 | Not started |
| 04-document-vault | 0/3 | Not started |
| 05-finance-assisted-ops | 0/3 | Not started |
| 06-retrieval-recovery-polish | 0/3 | Not started |
| Phase 02-patient-and-agenda-core P01 | 55 | 3 tasks | 15 files |
| Phase 02-patient-and-agenda-core P02 | 6 | 3 tasks | 12 files |
| Phase 02-patient-and-agenda-core P03 | 7 | 3 tasks | 12 files |
| Phase 02-patient-and-agenda-core P04 | 12 | 2 tasks | 2 files |
| Phase 03-clinical-record-core P01 | 2 | 2 tasks | 6 files |
| Phase 03-clinical-record-core P02 | 4 | 3 tasks | 4 files |
| Phase 03-clinical-record-core P03 | 4 | 2 tasks | 2 files |
| Phase 04-document-vault P01 | 3 | 2 tasks | 6 files |
| Phase 05-finance-and-assisted-operations P01 | 5 | 1 tasks | 11 files |
| Phase 05 P02 | 6 | 2 tasks | 6 files |
| Phase 05 P03 | 25 | 2 tasks | 6 files |

## Accumulated Context

### Decisions

- [INIT-01]: Product is a web-first SaaS MVP for solo Brazilian psychologists, not a generic clinic ERP.
- [INIT-02]: v1 includes the full office loop: patient -> schedule -> session record -> document -> payment state.
- [INIT-03]: Security posture is strong from day one: MFA, auditability, backup/export, and strict sensitive-data handling are foundational.
- [INIT-04]: Communication remains assistive and outbound-contextual; no chat/inbox in v1.
- [INIT-05]: Multi-user clinic management, built-in telehealth, and AI clinical writing are deferred beyond v1.
- [INIT-06]: Roadmap order follows operational dependency: foundation -> patient/agenda -> clinical -> documents -> finance/ops -> retrieval/polish.
- [01-01-01]: TOTP is the first mandatory MFA factor so Phase 1 enforces MFA now without blocking future passkey expansion.
- [01-01-02]: Workspace ownership is explicit in schema and code so later domains inherit a stable account boundary.
- [01-01-03]: Vault access policy stays centralized: sign-in, verify-email, then MFA setup before protected routes.
- [01-02-01]: Setup readiness must stay reusable outside the UI, with required and optional steps exposed from one contract.
- [01-02-02]: Signature assets remain optional for vault readiness but must already exist as a reusable profile/storage contract.
- [01-02-03]: Professional profile persistence should be explicit in server actions and services without forcing build-time database reads.
- [Phase 01-vault-foundation]: Audit storage remains behind a repository abstraction in Phase 1 so later phases can add durable persistence without changing the event contract.
- [Phase 01-vault-foundation]: Security settings surfaces should stay human-readable and calm, using friendly session labels instead of forensic wording.
- [Phase 01-vault-foundation]: Sensitive actions use a 10-minute re-auth window plus explicit confirmation text before completion.
- [Phase 02-patient-and-agenda-core]: Patient soft archive uses explicit archivedAt + archivedByAccountId fields rather than a status enum for unambiguous reversibility.
- [Phase 02-patient-and-agenda-core]: PatientOperationalSummary defaults session fields to null (not empty strings) so the contract stays honest before the scheduling domain hydrates it.
- [Phase 02-patient-and-agenda-core]: importantObservations is profile-only by design — excluded from all list and agenda surfaces to enforce Phase 1 privacy baseline.
- [Phase 02-02]: HYBRID care mode excluded from appointment booking — only IN_PERSON and ONLINE are valid per-occurrence values to prevent ambiguous care-mode data.
- [Phase 02-02]: Rescheduling creates a new occurrence linked via rescheduledFromId — original row stays immutable to preserve visible history and audit trail.
- [Phase 02-02]: Weekly series materialized as concrete rows at creation time so agenda queries are simple date-range scans, not rule expansions at render time.
- [Phase 02-02]: Finalized occurrences (COMPLETED/CANCELED/NO_SHOW) are never overwritten by series edits — they represent completed clinical facts.
- [Phase 02-03]: AgendaCard uses Intl.DateTimeFormat with UTC midnight day anchors so appointments are bucketed into correct local calendar day
- [Phase 02-03]: quick next-session defaults never include date/time — professional must choose slot intentionally to avoid silent scheduling assumptions
- [Phase 02-03]: derivePatientSummaryFromAppointments uses AppointmentForSummary structural subset to avoid circular dependency between patient and appointment domains
- [Phase 02-03]: pendingItemsCount counts future SCHEDULED appointments (actionable scheduling pendency needing confirmation)
- [Phase 02-04]: priceInCents URL param reserved but not forwarded to AppointmentForm — finance domain arrives in Phase 5
- [Phase 02-04]: nextSessionActions map built server-side in agenda/page.tsx keeping view components presentational and free of data-fetching concerns
- [Phase 03-clinical-record-core]: ClinicalNote structured fields default to null (not empty strings) so the contract stays honest when not filled
- [Phase 03-clinical-record-core]: deriveSessionNumber counts only COMPLETED appointments — CANCELED and NO_SHOW are excluded from session numbering
- [Phase 03-clinical-record-core]: Audit metadata restricted to appointmentId only (SECU-05) — clinical content never leaks into audit or log surfaces
- [Phase 03-clinical-record-core]: editedAt is null on creation and set to now on every updateClinicalNote call, distinguishing pristine from edited notes
- [Phase 03-02]: Server actions passed as props to NoteComposerForm client component keeping action file collocated with route
- [Phase 03-02]: nullCoerce helper converts blank FormData strings to null for structured clinical fields (SECU-05)
- [Phase 03-02]: Note entry points merged into nextSessionActions React.Fragment to avoid touching view component signatures
- [Phase 03-03]: ClinicalTimeline is a pure presentational server component — all data loaded in the page and passed as props to keep data-fetching concerns in one place
- [Phase 03-03]: notesByAppointment map built server-side in patient profile page for O(1) note lookup per appointment without N+1 repository calls
- [Phase 04-document-vault]: Receipt template uses R$ ________ placeholder — Phase 5 finance domain will enrich with real payment data
- [Phase 04-document-vault]: createdByName is a snapshot field frozen at document creation time — professional name changes do not retroactively affect documents
- [Phase 05-01]: ChargeStatus uses Portuguese literals (pendente/pago/atrasado) to match domain language and avoid translation at the UI layer
- [Phase 05-01]: updateAppointmentOnlineCare is a dedicated function separate from a generic update — keeps ONLINE care concern isolated and testable
- [Phase 05-01]: remoteIssueNote guard enforced at model layer (throws Error) not server-action layer — correctness closest to data
- [Phase 05-01]: Charge audit metadata whitelist: only chargeId, appointmentId, and newStatus included — never amountInCents or paymentMethod (SECU-05)
- [Phase 05-02]: revalidatePath imported from next/cache not next/navigation — server action cache invalidation uses the cache module
- [Phase 05-02]: listActive + listArchived used to aggregate all patients for monthly /financeiro view — avoids adding listAll to PatientRepository interface
- [Phase 05-02]: Vault layout created from scratch — no (vault)/layout.tsx existed; new file wraps all vault routes with shared navigation
- [Phase 05-03]: ONLINE care fields rendered for all appointment statuses so professionals can update meeting links post-session
- [Phase 05-03]: appointment.updated added to AppointmentAuditEventType union to support meetingLink/remoteIssueNote server actions
- [Phase 05-03]: Comunicacao section rendered for ALL appointment statuses (COMM-01/COMM-02) per domain spec

### Pending Todos

- Plan Phase 2 (`patient and agenda core`) now that the foundation phase is fully executed.
- Decide whether `tsconfig.tsbuildinfo` should be ignored or cleaned up in repo tooling.

### Blockers/Concerns

- `.planning/config.json` carries an unrelated local modification and remains intentionally unstaged.
- `tsconfig.tsbuildinfo` is untracked build output and should stay out of future plan commits unless tooling chooses to manage it.

## Session Continuity

Last session: 2026-03-14T23:18:56.834Z
Stopped at: Completed 05-03-PLAN.md
Resume: Start Phase 4 planning (Document Vault)
