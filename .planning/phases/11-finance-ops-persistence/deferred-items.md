# Deferred Items — Phase 11

## Pre-existing TypeScript errors in test files (out of scope)

Found during Task 2 (`npx tsc --noEmit`). These errors exist in test files that predate Phase 11 work and are not caused by this plan's changes.

- `tests/appointment-conflicts.test.ts`: Multiple `status: string` not assignable to `AppointmentStatus`, and `careMode: string` not assignable to `AppointmentCareMode`
- `tests/agenda-view-model.test.ts`: `AgendaCard` missing index signature for `Record<string, unknown>` cast
- `tests/appointment-defaults.test.ts`: `NextSessionDefaults` missing index signature for `Record<string, unknown>` cast

These should be addressed in a dedicated test cleanup task (Phase 14 quality hardening).
