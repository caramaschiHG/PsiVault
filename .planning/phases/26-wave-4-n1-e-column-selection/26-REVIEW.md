---
phase: 26-wave-4-n1-e-column-selection
reviewed: 2026-04-23T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - src/lib/clinical/repository.ts
  - src/lib/clinical/repository.prisma.ts
  - src/app/(vault)/agenda/page.tsx
  - src/lib/patients/repository.prisma.ts
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: issues_found
---

# Phase 26: Code Review Report

**Reviewed:** 2026-04-23
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Phase 26 delivers two targeted query optimisations: collapsing an N+1 clinical-note existence check into a single `findByAppointmentIds` batch call (QUERY-04), and excluding `importantObservations` from all list queries at the SQL layer with a dedicated `LIST_SELECT` + `mapListToDomain` path (QUERY-05).

Both goals are structurally correct and the security boundary (`workspaceId` scope) is preserved throughout. However, one **critical data-integrity bug** was found in the backup route, two **schema/type mismatches** were found across the `ClinicalNote` model and the Prisma `findByAppointmentIds` implementation, and one logic asymmetry exists in the in-memory vs Prisma implementations.

---

## Critical Issues

### CR-01: Backup exports patients with `importantObservations: null` — sensitive field silently lost

**File:** `src/app/api/backup/route.ts:46-50` (triggered by change in `src/lib/patients/repository.prisma.ts:108-121`)

**Issue:** `GET /api/backup` calls `patientRepo.listActive(workspaceId)` and `patientRepo.listArchived(workspaceId)` and then serialises every patient into the backup JSON. After this phase both list methods now return `importantObservations: null` unconditionally. The backup therefore silently omits this field for every patient — the value exists in the database but is never exported. A user restoring from this backup permanently loses all important observations they had recorded.

The field is marked in the model comment as "profile-only, must not leak to lists or agenda" — which is the correct constraint for UI listing surfaces. The backup route, however, is an explicit full-data export where the constraint should be lifted, or the backup route must call `findById` per patient to retrieve the full record.

**Fix:**

Option A (minimal) — add a dedicated `listAllForBackup` method that calls `findMany` without `select: LIST_SELECT`, or simply reuse `mapToDomain` (the existing full mapper) inside the backup query path.

Option B (preferred, no new interface method needed) — replace the `listActive`/`listArchived` calls in the backup route with direct repo calls that explicitly opt into the full projection:

```typescript
// src/app/api/backup/route.ts
// Replace the parallel list calls with findById-based full loads, OR
// add a backup-specific query in the Prisma repo that uses mapToDomain:

async listAllForExport(workspaceId: string): Promise<Patient[]> {
  const rows = await db.patient.findMany({ where: { workspaceId } });
  return rows.map(mapToDomain); // full mapper — importantObservations included
}
```

Then update `buildWorkspaceBackup` call to use this method instead.

---

## Warnings

### WR-01: `ClinicalNote.appointmentId` is non-nullable in domain model but Prisma schema has a second nullable variant — `filter(Boolean)` cast is fragile

**File:** `src/lib/clinical/repository.prisma.ts:63`

**Issue:** The production `ClinicalNote` model (`prisma/schema.prisma:228`) declares `appointmentId String @unique` — **non-nullable**. The domain model `src/lib/clinical/model.ts:18` also declares `appointmentId: string` (non-nullable). Yet the Prisma `findByAppointmentIds` implementation does:

```typescript
return new Set(rows.map((r) => r.appointmentId).filter(Boolean) as string[]);
```

`filter(Boolean)` only makes sense if `r.appointmentId` can be `null | undefined`. With the current schema it is always `string`, so the cast and filter are noise that TypeScript already rejects at the type level (the generated type is `string`, not `string | null`). This is fine in production today, but it signals a copy-paste from a different query context (possibly the `FinanceCharge.appointmentId` which **is** nullable at line 278 of the schema). If the field ever becomes nullable, the filter silently hides notes from the set rather than failing loudly.

**Fix:**
```typescript
// repository.prisma.ts line 63 — remove the redundant filter and cast
return new Set(rows.map((r) => r.appointmentId));
```

This makes the TypeScript types accurate and removes the implicit behaviour dependency.

---

### WR-02: In-memory `findByAppointmentIds` and Prisma `findByAppointmentIds` have asymmetric early-exit — test/prod divergence

**File:** `src/lib/clinical/repository.ts:52-61` vs `src/lib/clinical/repository.prisma.ts:57-64`

**Issue:** The Prisma implementation short-circuits when `ids.length === 0` (line 58) and returns `new Set()` immediately, avoiding a DB round trip. The in-memory implementation has no such guard — it iterates the full store unnecessarily. This is not a production bug (Prisma is the production path) but it creates a behaviour gap between the two implementations:

- If a test seeds the store with notes whose `appointmentId` matches something in an empty `ids` array it will still return `new Set()` (the `idSet` is empty so `idSet.has(...)` is always false) — so the result is correct. However, if future logic calls `ids.length` to branch before calling the method (counting on the contract not to return data for an empty list), the in-memory path may behave differently if the guard is ever expected at the interface boundary.

More concretely: the **interface** (`repository.ts:16`) does not document the empty-array contract, so callers should not rely on it — but omitting it from in-memory makes unit tests slightly less representative of the Prisma path.

**Fix:**
```typescript
// repository.ts — in-memory findByAppointmentIds, add guard matching Prisma
async findByAppointmentIds(ids: string[], workspaceId: string): Promise<Set<string>> {
  if (ids.length === 0) return new Set();
  const result = new Set<string>();
  const idSet = new Set(ids);
  for (const note of store.values()) {
    if (note.workspaceId === workspaceId && note.appointmentId && idSet.has(note.appointmentId)) {
      result.add(note.appointmentId);
    }
  }
  return result;
},
```

---

### WR-03: `importantObservations: null` silently diverges between in-memory and Prisma `listActive`/`listArchived` — in-memory tests may pass while Prisma returns `null`

**File:** `src/lib/patients/repository.ts:40-53` vs `src/lib/patients/repository.prisma.ts:108-135`

**Issue:** The in-memory `listActive` and `listArchived` return the full patient from the store as-is (including whatever `importantObservations` was set on seed data). The Prisma `listActive`/`listArchived` now always return `importantObservations: null` via `mapListToDomain`.

If any test seeds patients with non-null `importantObservations` and then asserts the returned list to verify some field (e.g. equality checks), the test passes with in-memory but the assertion would differ in meaning for the Prisma path. More critically, any downstream code path that reaches `patient.importantObservations` after a `listActive` call and relies on the real value will silently read `null` in production.

Audit of current callers of `listActive`/`listArchived` confirmed that no call site currently reads `importantObservations` from the list result — the only rendering of this field goes through `findById` (patient profile page). However, the `actions/search.ts` and `financeiro` pages receive the list-sourced patients and may in future display the field. The asymmetry is a **latent contract violation** at the interface level: the interface `PatientRepository` does not document that `importantObservations` is always `null` from list methods.

**Fix:** Document the contract explicitly in the interface:

```typescript
// src/lib/patients/repository.ts
/** All non-archived patients scoped to a workspace, ordered by fullName.
 * NOTE: `importantObservations` is always `null` in list results.
 * Use `findById` to retrieve the full patient including sensitive fields. */
listActive(workspaceId: string): Promise<Patient[]>;

/** All archived patients scoped to a workspace, ordered by archivedAt desc.
 * NOTE: `importantObservations` is always `null` in list results. */
listArchived(workspaceId: string): Promise<Patient[]>;
```

Additionally, update the in-memory implementation to mirror the Prisma behaviour:
```typescript
async listActive(workspaceId) {
  return [...store.values()]
    .filter((p) => p.workspaceId === workspaceId && p.archivedAt === null)
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "pt-BR"))
    .map((p) => ({ ...p, importantObservations: null })); // mirror Prisma contract
},
```

---

## Info

### IN-01: `notedAppointmentIds` assignment is a no-op alias — minor clarity issue

**File:** `src/app/(vault)/agenda/page.tsx:235`

**Issue:** After the batch refactor:
```typescript
const notedAppointmentIds = agendaNoteResults; // Set<string> from batch query
```
`agendaNoteResults` is already the `Set<string>` — the intermediate alias adds no transformation. It is harmless but is a leftover artefact of the previous code structure where a transformation step existed here.

**Fix:** Either remove the alias and use `agendaNoteResults` directly at line 375, or inline the assignment into the destructuring at line 195:
```typescript
const [notedAppointmentIds, overdueCharges] = await Promise.all([...]);
```

---

### IN-02: `headingTextStyle` and `eyebrowStyle` are defined but never referenced in the JSX

**File:** `src/app/(vault)/agenda/page.tsx:777-789`

**Issue:** Two style constants (`headingTextStyle` at line 777 and `eyebrowStyle` at line 782) are defined at module scope but are not used anywhere in the component's return value. TypeScript does not flag unused `const` in `.tsx` files by default.

**Fix:** Remove both dead style constants:
```typescript
// Delete lines 777–789:
// const headingTextStyle = { ... }
// const eyebrowStyle = { ... }
```

---

_Reviewed: 2026-04-23_
_Reviewer: gsd-code-reviewer (claude-sonnet-4.6)_
_Depth: standard_
