---
phase: 02-patient-and-agenda-core
plan: 01
subsystem: patient
tags: [prisma, nextjs, typescript, vitest, in-memory-store]

requires:
  - phase: 01-vault-foundation
    provides: Workspace model, AuditEvent contract, AuditRepository, redactForLogs, PracticeProfile pattern

provides:
  - Patient aggregate with workspace-scoped soft archive semantics
  - PatientRepository with active/archived selectors (in-memory, ready for DB swap)
  - Patient lifecycle audit helpers wired to Phase 1 AuditEvent contract
  - Essentials-first patient intake form with progressive optional field disclosure
  - Active patients list (privacy-safe, no importantObservations)
  - Archive view with explicit reactivation (redirects to recovered patient profile)
  - Stable PatientOperationalSummary contract with safe fallback states
  - Identity-first patient profile page (header -> summary block -> edit form)
  - 28 automated tests: 15 domain + 13 summary contract

affects:
  - 02-02-agenda (will hydrate lastSession/nextSession in PatientOperationalSummary)
  - 03-clinical-record-core (will extend summary with clinical items count)
  - 04-document-vault (will set documentCount in summary)
  - 05-finance-assisted-ops (will set financialStatus in summary)

tech-stack:
  added: []
  patterns:
    - in-memory-module-store (globalThis singleton for server-side state across requests, mirrors Phase 1 profile pattern)
    - tdd-red-green-commit (write failing tests first, implement to pass, commit each phase)
    - stable-summary-contract (derivePatientSummary accepts optional domain inputs so downstream can hydrate without changing the shape)
    - essentials-first-form (core fields visible, optional sections clearly separated with labels)
    - privacy-safe-list (importantObservations excluded from all list/agenda surfaces)

key-files:
  created:
    - prisma/schema.prisma (Patient model added)
    - src/lib/patients/model.ts
    - src/lib/patients/repository.ts
    - src/lib/patients/audit.ts
    - src/lib/patients/summary.ts
    - src/lib/patients/store.ts
    - src/app/(vault)/patients/page.tsx
    - src/app/(vault)/patients/archive/page.tsx
    - src/app/(vault)/patients/actions.ts
    - src/app/(vault)/patients/components/patient-form.tsx
    - src/app/(vault)/patients/components/patient-profile-header.tsx
    - src/app/(vault)/patients/components/patient-summary-cards.tsx
    - src/app/(vault)/patients/[patientId]/page.tsx
    - tests/patient-domain.test.ts
    - tests/patient-summary.test.ts
  modified:
    - prisma/schema.prisma

key-decisions:
  - "Patient soft archive uses explicit archivedAt + archivedByAccountId fields rather than a status enum — makes reversibility explicit and recovery intent unambiguous in code."
  - "PatientRepository selectors (listActive/listArchived) are kept separate so scheduling and agenda domains can always query only active patients without needing filter logic at call sites."
  - "importantObservations is profile-only by design — excluded from list shapes, archive view, and summary cards to enforce the privacy baseline established in Phase 1."
  - "PatientOperationalSummary defaults all session fields to null rather than placeholder strings, keeping the contract honest before the scheduling domain exists."
  - "Recovery action redirects to the recovered patient profile page, not a generic list — consistent with the context that the action restores a specific patient."

patterns-established:
  - "Patient intake form: essentials first (fullName required), then contact, then progressive optional sections (social name, guardian, emergency, observations) — each section has an eyebrow label explaining when to fill it."
  - "Summary contract hydration: derivePatientSummary accepts optional inputs keyed by domain — downstream phases add inputs without changing outputs or consumers."
  - "Audit wiring: patient lifecycle events reuse createAuditEvent from Phase 1 — no parallel event style invented."

requirements-completed: [PATI-01, PATI-02, PATI-03, PATI-04]

duration: 55min
completed: 2026-03-13
---

# Phase 2 Plan 1: Patient Aggregate and Vault Surfaces Summary

**Workspace-scoped patient aggregate with soft archive semantics, essentials-first intake form, privacy-safe active/archive views, and stable operational summary contract with identity-first profile — 28 tests across domain and summary layers**

## Performance

- **Duration:** ~55 min
- **Started:** 2026-03-13T23:12:41Z
- **Completed:** 2026-03-13T23:38:00Z
- **Tasks:** 3 completed
- **Files modified:** 15

## Accomplishments

- Patient aggregate defined with explicit archive semantics (soft, reversible) and workspace-scoped in-memory repository with active/archived selectors
- Essentials-first intake form with progressive disclosure of optional fields; importantObservations excluded from all list and agenda surfaces
- Stable PatientOperationalSummary contract (lastSession, nextSession, pendingItemsCount, documentCount, financialStatus) with safe fallback states ready for scheduling domain hydration

## Task Commits

Each task was committed atomically:

1. **Task 1: Define patient aggregate, archive semantics, and persistence contract** - `1deb044` (feat)
2. **Task 2: Build patient intake, active/archive views, and recovery actions** - `748e307` (feat)
3. **Task 3: Define patient operational summary contract and identity-first profile shell** - `a02931f` (feat)

## Files Created/Modified

- `prisma/schema.prisma` - Added Patient model with workspace-scoped soft archive and index on [workspaceId, archivedAt]
- `src/lib/patients/model.ts` - Patient aggregate shape, createPatient, archivePatient, recoverPatient, updatePatient
- `src/lib/patients/repository.ts` - PatientRepository interface and in-memory implementation with active/archived selectors
- `src/lib/patients/audit.ts` - Patient lifecycle audit helpers wired to Phase 1 AuditEvent contract
- `src/lib/patients/summary.ts` - PatientOperationalSummary contract, derivePatientSummary, getSummaryLabel
- `src/lib/patients/store.ts` - Module-level in-memory store (globalThis singleton, mirrors Phase 1 profile pattern)
- `src/app/(vault)/patients/actions.ts` - Server actions: createPatient, updatePatient, archivePatient, recoverPatient
- `src/app/(vault)/patients/page.tsx` - Active patients list (privacy-safe)
- `src/app/(vault)/patients/archive/page.tsx` - Archive view with explicit reactivation
- `src/app/(vault)/patients/components/patient-form.tsx` - Essentials-first form with progressive optional sections
- `src/app/(vault)/patients/components/patient-profile-header.tsx` - Identity-first header (legal name leads, social name secondary)
- `src/app/(vault)/patients/components/patient-summary-cards.tsx` - Operational summary cards with fallback copy
- `src/app/(vault)/patients/[patientId]/page.tsx` - Profile page: identity -> summary -> edit form
- `tests/patient-domain.test.ts` - 15 TDD tests: create, optional fields, archive/recover, audit helpers
- `tests/patient-summary.test.ts` - 13 TDD tests: contract shape, label helpers, stability before scheduling

## Decisions Made

- Soft archive uses `archivedAt` + `archivedByAccountId` fields rather than a status enum — reversibility is explicit and recovery semantics are unambiguous in code.
- Repository selectors are kept separate (listActive/listArchived) so downstream domains never need to filter at call sites.
- `importantObservations` is profile-only by design — enforces the privacy baseline from Phase 1 redaction policy.
- `PatientOperationalSummary` defaults session fields to null (not empty strings) — keeps the contract honest before scheduling domain exists.
- Recovery action redirects to the specific recovered patient profile, not a generic list.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Patient domain is complete and stable. Phase 2 Plan 2 (02-02 agenda) can safely use `PatientRepository.listActive` to scope appointments to active patients.
- `PatientOperationalSummary` is ready to receive `lastSession` and `nextSession` from the scheduling domain once appointment occurrences exist.
- All 43 tests pass (28 new + 15 from Phase 1).

---
*Phase: 02-patient-and-agenda-core*
*Completed: 2026-03-13*
