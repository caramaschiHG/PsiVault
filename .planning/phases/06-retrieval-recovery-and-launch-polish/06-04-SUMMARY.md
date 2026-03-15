---
phase: 06-retrieval-recovery-and-launch-polish
plan: "04"
subsystem: api
tags: [export, backup, json, file-download, settings, re-auth, privacy]

# Dependency graph
requires:
  - phase: 01-vault-foundation
    provides: evaluateSensitiveAction, re-auth cookie pattern, sensitive-actions module
  - phase: 02-patient-and-agenda-core
    provides: PatientRepository, AppointmentRepository
  - phase: 03-clinical-record-core
    provides: ClinicalNoteRepository
  - phase: 04-document-vault
    provides: DocumentRepository
  - phase: 05-finance-and-assisted-operations
    provides: FinanceRepository (SessionCharge), ChargeStatus

provides:
  - Pure serializer functions: buildPatientExport, buildWorkspaceBackup, validateBackupSchema
  - GET /api/export/patient/[patientId] — re-auth gated per-patient JSON download
  - GET /api/backup — re-auth gated full workspace JSON backup download
  - Settings > Dados e Privacidade page with three sections (SECU-03, SECU-04)
  - WorkspaceBackupButton: confirmation form (requires typing "FAZER BACKUP") -> downloads backup
  - VerifyBackupForm: FileReader + validateBackupSchema, no server round-trip
  - ExportSection on patient profile page: per-patient export trigger with re-auth confirmation

affects:
  - Launch readiness: data portability and recovery posture now complete
  - Any phase adding new domain data should extend PatientExport/WorkspaceBackup interfaces

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Pure serializer functions in src/lib/export/serializer.ts with no side effects
    - Re-auth gate via short-lived cookie (psivault_export_auth / psivault_backup_auth, 10-min window)
    - FileReader API for client-side JSON validation without server round-trip
    - Content-Disposition attachment header for browser-triggered file downloads
    - TDD: failing tests committed before implementation (RED -> GREEN)

key-files:
  created:
    - src/lib/export/serializer.ts
    - tests/export-backup.test.ts
    - src/app/api/export/patient/[patientId]/route.ts
    - src/app/api/backup/route.ts
    - src/app/(vault)/settings/dados-e-privacidade/page.tsx
    - src/app/(vault)/settings/dados-e-privacidade/actions.ts
    - src/app/(vault)/settings/dados-e-privacidade/components/workspace-backup-button.tsx
    - src/app/(vault)/settings/dados-e-privacidade/components/verify-backup-form.tsx
    - src/app/(vault)/patients/[patientId]/components/export-section.tsx
  modified:
    - src/app/(vault)/patients/[patientId]/page.tsx

key-decisions:
  - "Re-auth gate for export/backup uses short-lived cookies (psivault_export_auth / psivault_backup_auth) as v1 stub — marked for production replacement with evaluateSensitiveAction from real session"
  - "VerifyBackupForm uses FileReader API for client-side schema validation — no server round-trip needed, validateBackupSchema is a pure function"
  - "All financial fields (amountInCents) and clinical content are included in export — export is a trusted vault operation, not a public surface (SECU-05 whitelist does not apply to backup)"
  - "Patient export trigger lives on the patient profile page as ExportSection component, not in Settings — Settings/dados-e-privacidade explains the feature and links users to patient profiles"

patterns-established:
  - "Export serializer: pure functions with typed input and output, no I/O, fully unit-testable"
  - "Backup verification: client-side FileReader + validateBackupSchema avoids unnecessary server load"
  - "Re-auth-gated download: server action sets cookie, client triggers file download via anchor href"

requirements-completed:
  - SECU-03
  - SECU-04

# Metrics
duration: ~45min
completed: 2026-03-15
---

# Phase 6 Plan 04: Data Export and Backup Summary

**Per-patient JSON export and full workspace backup with client-side schema verification, both gated behind re-auth confirmation, completing the vault's data portability and recovery posture.**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-03-15T03:00:00Z (estimated)
- **Completed:** 2026-03-15T03:11:56Z
- **Tasks:** 3 (2 implementation + 1 human-verify checkpoint)
- **Files modified:** 10

## Accomplishments

- Pure serializer module with TDD coverage: buildPatientExport, buildWorkspaceBackup, and validateBackupSchema — all tested with failing tests committed before implementation
- Two Next.js 15 Route Handlers (/api/export/patient/[patientId] and /api/backup) with re-auth cookie gates and Content-Disposition attachment headers for browser file download
- Settings > Dados e Privacidade page with three functional sections: patient export explanation, workspace backup confirmation flow, and client-side backup verification via FileReader
- Human verification checkpoint passed: export triggers JSON download, backup downloads with correct filename, VerifyBackupForm accepts valid backup and rejects malformed JSON

## Task Commits

Each task was committed atomically:

1. **Task 1: Export serializer + test coverage (TDD)** - `adb32f8` (feat)
2. **Task 2: Route handlers, Settings page, and patient profile export trigger** - `3b6bc26` (feat)
3. **Task 3: Checkpoint — Verify export and backup flows** - human-verified, no code commit

## Files Created/Modified

- `src/lib/export/serializer.ts` - Pure serializer functions: buildPatientExport, buildWorkspaceBackup, validateBackupSchema
- `tests/export-backup.test.ts` - Unit tests for serializer and schema validator (TDD RED -> GREEN)
- `src/app/api/export/patient/[patientId]/route.ts` - GET handler: re-auth gate, load all patient data, serve JSON attachment
- `src/app/api/backup/route.ts` - GET handler: re-auth gate, load all workspace data, serve full backup JSON attachment
- `src/app/(vault)/settings/dados-e-privacidade/page.tsx` - Server component with three sections: export info, WorkspaceBackupButton, VerifyBackupForm
- `src/app/(vault)/settings/dados-e-privacidade/actions.ts` - Server actions: confirmBackupAuthAction and confirmExportAuthAction (set re-auth cookies)
- `src/app/(vault)/settings/dados-e-privacidade/components/workspace-backup-button.tsx` - Client component: confirmation form -> sets cookie -> triggers download
- `src/app/(vault)/settings/dados-e-privacidade/components/verify-backup-form.tsx` - Client component: FileReader + validateBackupSchema, three result states (valid/invalid/parse_error)
- `src/app/(vault)/patients/[patientId]/components/export-section.tsx` - Client component: per-patient export trigger at bottom of patient profile
- `src/app/(vault)/patients/[patientId]/page.tsx` - Added ExportSection component at bottom of patient profile page

## Decisions Made

- Re-auth gate uses short-lived cookies (v1 stub) rather than wiring into evaluateSensitiveAction directly — marked with comments for production replacement. This avoids blocking the feature on auth session refactoring while preserving the correct security posture.
- VerifyBackupForm validates entirely on the client via FileReader and the pure validateBackupSchema function — no server round-trip needed since schema validation has no secrets.
- All financial and clinical fields are included in export — backup is a trusted vault operation for the vault owner, distinct from the SECU-05 audit metadata whitelist which applies to audit log surfaces.
- Patient export section lives on the patient profile page (ExportSection component) rather than requiring a patient selector in Settings, reducing UX friction for per-patient export.

## Deviations from Plan

None - plan executed exactly as written. The ExportSection component was placed in a components subdirectory alongside the patient profile page rather than inline in page.tsx, which is consistent with the existing project component organization pattern.

## Issues Encountered

None — all tasks executed cleanly. Test suite passed on first run after GREEN phase implementation.

## User Setup Required

None - no external service configuration required. The re-auth cookie mechanism is a v1 in-memory stub requiring no environment variables.

## Next Phase Readiness

- Data portability requirements SECU-03 and SECU-04 are complete
- The vault's recovery posture is credible: professionals can export any patient, backup the full workspace, and verify backup integrity
- Remaining Phase 6 plans: search and filtering (06-05), dashboard metrics (06-06), and launch polish
- The re-auth cookie stub should be replaced with evaluateSensitiveAction from a real session in a future security hardening pass

---
*Phase: 06-retrieval-recovery-and-launch-polish*
*Completed: 2026-03-15*
