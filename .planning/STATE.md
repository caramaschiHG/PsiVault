---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: milestone
status: Ready to start Phase 10
stopped_at: Phase 10 context gathered
last_updated: "2026-03-17T22:23:08.776Z"
last_activity: 2026-03-17 — v1.2 milestone defined; phases 07–09 confirmed complete; phases 10–15 pending
progress:
  total_phases: 8
  completed_phases: 1
  total_plans: 1
  completed_plans: 1
  percent: 43
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-17 after v1.2 milestone defined)

**Core value:** The psychologist can finish a session, register everything correctly in a few minutes, and trust that the clinical and operational history is safe, findable, and under control.
**Current focus:** Phase 10 — Clinical & Document Persistence (first incomplete phase)

## Current Position

Phase: 4 of 7 (Phase 10: Clinical & Document Persistence)
Plan: —
Status: Ready to start Phase 10
Last activity: 2026-03-17 — v1.2 milestone defined; phases 07–09 confirmed complete; phases 10–15 pending

Progress: [████░░░░░░] 43%

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Total execution time: —

**By Phase:**
| Phase | Plans | Status |
|-------|-------|--------|
| 07-infrastructure-foundation | 1/1 | ✓ Complete |
| 08-authentication-workspaces | 1/1 | ✓ Complete |
| 09-patient-agenda-persistence | 1/1 | ✓ Complete |
| 10-clinical-document-persistence | 0/? | Not started |
| 11-finance-ops-persistence | 0/? | Not started |
| 12-authentication-ux | 0/? | Not started |
| 13-ui-ux-polish | 0/? | Not started |
| 14-quality-production-hardening | 0/? | Not started |

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
- [Phase 06-retrieval-recovery-and-launch-polish]: createReminderAuditEvent accepts flat input (eventType, reminderId, workspaceId, accountId, now) — simpler API than charge audit, no nested object needed
- [Phase 06-retrieval-recovery-and-launch-polish]: Wave 0 scaffold tests reference actual future import paths (no mocks) so downstream plan executors have exact contracts to implement against
- [Phase 06-retrieval-recovery-and-launch-polish]: listByWorkspaceAndMonth uses UTC boundaries matching listByMonth pattern (createdAt-based, Date.UTC, exclusive upper bound)
- [Phase 06-retrieval-recovery-and-launch-polish]: Re-auth gate for export/backup uses short-lived cookies (v1 stub) - marked for production replacement with evaluateSensitiveAction
- [Phase 06-retrieval-recovery-and-launch-polish]: VerifyBackupForm uses FileReader API for client-side schema validation - no server round-trip, validateBackupSchema is pure
- [Phase 06-retrieval-recovery-and-launch-polish]: All financial fields included in export - backup is trusted vault operation, SECU-05 whitelist does not apply to owner backup surface
- [Phase 06-retrieval-recovery-and-launch-polish]: searchAll returns flat SearchResultItem[] (not grouped) — Wave 0 test is authoritative over plan interface description; groupSearchResults helper added for UI layer
- [Phase 06-retrieval-recovery-and-launch-polish]: SearchResultItem uses type field (not domain) — matches Wave 0 scaffold contract; clinicalNotes accepted in SearchInput but never indexed (SECU-05)
- [Phase 06-02]: /inicio uses filterTodayAppointments to narrow listByDateRange to UTC day window — no new repo method needed
- [Phase 06-02]: completeReminderAction accepts reminderId string (not FormData) — cleaner .bind(null, id) binding in JSX
- [Phase 06-02]: RemindersSection placed after FinanceSection on patient profile — all operational-status sections grouped before ExportSection
- [Phase 06-05]: Settings layout kept as server component with no usePathname — page heading indicates active section, no client JS needed
- [Phase 06-05]: Tab strip renders above children without adding padding — each settings page owns its own layout padding
- [v1.2-00]: v1.2 "Lançamento" merges remaining v1.1 phases (10–11) with auth UX polish and production hardening into one release milestone.

### Pending Todos

- Plan and execute Phase 10 (Clinical & Document Persistence).
- Plan and execute Phase 11 (Finance & Ops Persistence).
- Plan and execute Phase 12 (Authentication UX).
- Plan and execute Phase 13 (UI/UX Polish).
- Plan and execute Phase 14 (Quality & Production Hardening).

### Blockers/Concerns

- `.planning/config.json` carries an unrelated local modification and remains intentionally unstaged.
- `tsconfig.tsbuildinfo` is untracked build output and should stay out of future plan commits unless tooling chooses to manage it.

## Session Continuity

Last session: 2026-03-17T22:23:08.774Z
Stopped at: Phase 10 context gathered
Resume: Plan or execute Phase 10 — /gsd:plan-phase 10
