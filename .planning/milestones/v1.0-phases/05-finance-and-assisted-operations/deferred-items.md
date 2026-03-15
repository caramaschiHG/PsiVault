# Deferred Items — Phase 05-finance-and-assisted-operations

## Pre-existing TypeScript Errors (from 05-01)

**Source:** `tests/appointment-conflicts.test.ts`, `tests/agenda-view-model.test.ts`, `tests/appointment-defaults.test.ts`

**Root cause:** Phase 05-01 extended the `Appointment` model with new optional fields (`priceInCents`, `meetingLink`, `remoteIssueNote`, `careMode` now typed as `AppointmentCareMode`). Test fixtures in those files use plain string literals for `careMode` and `status` without `as const` or type cast, causing TypeScript strict errors.

**Impact:** `npx tsc --noEmit` exits with errors referencing only test files; all `src/` files compile cleanly. Vitest runtime is unaffected (200/200 tests pass).

**Recommended fix:** Add `as const` or explicit type casts to fixture objects in the affected test files. This is a test-only change with no production impact.

**Out of scope for 05-02:** Not caused by this plan's changes.
