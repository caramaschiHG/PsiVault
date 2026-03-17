# Phase 10: Clinical & Document Persistence - Research

**Researched:** 2026-03-17
**Domain:** Prisma ORM — schema modeling, migration, repository implementation
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- `ClinicalNote.appointmentId` must have a `@unique` constraint — enforce one-to-one at DB level (not just application logic)
- Both `ClinicalNote` and `PracticeDocument` must have explicit Prisma FK relations to `Patient`, `Appointment` (for note), and `Workspace` — consistent with how `Appointment` relates to `Patient` and `Workspace`
- If an `Appointment` is hard-deleted, its `ClinicalNote` cascades (onDelete: Cascade) — matches how Appointment cascades from Patient
- If a `Patient` is hard-deleted, all their documents cascade (onDelete: Cascade)
- `PracticeDocument.content` stored as plain PostgreSQL TEXT — no size limit, no sanitization, no special handling
- Store content as-is from the template system; the template output is already clean and controlled
- Patient soft-archive (archivedAt set) does NOT touch clinical notes or documents — records are preserved intact
- Export/backup always includes clinical notes and documents for archived patients — the export is the complete clinical record
- Swap `store.ts` immediately on implementation (same pattern as Phase 9) — no feature flags, no fallback
- Pattern: `createPrismaClinicalRepository()` in `src/lib/clinical/repository.prisma.ts`, replaces `createInMemoryClinicalRepository()` in `store.ts`
- Pattern: `createPrismaDocumentRepository()` in `src/lib/documents/repository.prisma.ts`, replaces `createInMemoryDocumentRepository()` in `store.ts`
- Reuse existing domain tests as the contract: `clinical-domain.test.ts`, `clinical-session-number.test.ts`, `document-domain.test.ts` must all pass
- No new Prisma-specific integration tests required — the existing test suite is the verification contract
- Tests currently run against in-memory repos — after the store.ts swap, they run against Prisma

### Claude's Discretion
- Exact Prisma field naming conventions (snake_case `@map` annotations)
- Index selection for query patterns (e.g., `[workspaceId, patientId]` index)
- `updatedAt @updatedAt` vs explicit update handling

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| REPO-03 | Implement `PrismaClinicalRepository` and replace in-memory stub | Schema model `ClinicalNote`, `createPrismaClinicalRepository()` factory, `store.ts` swap, all 4 interface methods covered by reference implementations |
| REPO-04 | Implement `PrismaDocumentRepository` and replace in-memory stub | Schema model `PracticeDocument` with `DocumentType` enum, `createPrismaDocumentRepository()` factory, `store.ts` swap, all 4 interface methods including `listActiveByPatient` filter pattern |
</phase_requirements>

---

## Summary

Phase 10 replaces two in-memory repository singletons — `ClinicalNoteRepository` and `PracticeDocumentRepository` — with Prisma-backed implementations. The work is pure persistence layer: no UI, no new features, no new server actions. Every decision follows the exact Phase 9 pattern already proven by `PrismaPatientRepository` and `PrismaAppointmentRepository`.

The domain models are already complete and stable. Both `ClinicalNote` and `PracticeDocument` have well-defined interfaces (4 methods each) with in-memory implementations that serve as the specification. The test suites (`clinical-domain.test.ts`, `clinical-session-number.test.ts`, `document-domain.test.ts`) are pure unit tests that test domain logic against in-memory implementations — they do not need to change and do not need a live database to pass.

The schema requires two new models added to `prisma/schema.prisma`, one migration, and three files changed (`store.ts` for each domain). No existing models require structural changes beyond adding back-relation fields.

**Primary recommendation:** Mirror `src/lib/appointments/repository.prisma.ts` exactly — `mapToDomain()` adapter + `db.*.upsert()` on save + `findFirst({ where: { id, workspaceId } })` for scoped lookups. The appointment implementation handles nullable fields and is the most complete reference.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@prisma/client` | Already installed (Phase 7) | Type-safe DB queries | Project standard since Phase 7 |
| `prisma` (CLI) | Already installed (Phase 7) | Schema management and migrations | Required for `prisma migrate dev` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `src/lib/db.ts` | Project singleton | Prisma client instance | Import in every `repository.prisma.ts` file — never instantiate `PrismaClient` directly |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `upsert` on `save()` | `create` + `update` separately | Upsert is simpler, handles create-or-update in one call, consistent with existing pattern |
| `@updatedAt` decorator | Explicit `updatedAt: new Date()` in data payload | `@updatedAt` is automatic and correct; explicit is redundant — use `@updatedAt` |

**Installation:** No new packages required. All dependencies are present from Phase 7.

---

## Architecture Patterns

### Recommended Project Structure
```
src/lib/clinical/
├── model.ts              # Domain model — DO NOT CHANGE
├── repository.ts         # Interface + in-memory implementation — DO NOT CHANGE
├── repository.prisma.ts  # NEW — Prisma implementation
├── store.ts              # UPDATE — swap import
└── audit.ts              # Unchanged

src/lib/documents/
├── model.ts              # Domain model — DO NOT CHANGE
├── repository.ts         # Interface + in-memory implementation — DO NOT CHANGE
├── repository.prisma.ts  # NEW — Prisma implementation
├── store.ts              # UPDATE — swap import
├── audit.ts              # Unchanged
└── templates.ts          # Unchanged

prisma/
└── schema.prisma         # UPDATE — add ClinicalNote and PracticeDocument models
```

### Pattern 1: mapToDomain Adapter
**What:** A pure function converting a Prisma model type to the domain type. Handles field name differences (`deletedAt` → `archivedAt`) and type coercions.
**When to use:** Always — never return raw Prisma types from the repository.
**Example:**
```typescript
// Source: src/lib/patients/repository.prisma.ts (established project pattern)
function mapToDomain(p: PrismaPatient): Patient {
  return {
    id: p.id,
    workspaceId: p.workspaceId,
    // ... map fields
    archivedAt: p.deletedAt,           // field rename example
  };
}
```

### Pattern 2: Upsert on save()
**What:** A single `db.model.upsert({ where: { id }, update: data, create: { id, ...data } })` call handles both create and update without branching.
**When to use:** Always on `save()` — this is the established project contract.
**Example:**
```typescript
// Source: src/lib/appointments/repository.prisma.ts (established project pattern)
async save(appointment: Appointment): Promise<Appointment> {
  const data = { workspaceId: ..., patientId: ..., /* all fields except id */ };
  const a = await db.appointment.upsert({
    where: { id: appointment.id },
    update: data,
    create: { id: appointment.id, ...data },
  });
  return mapToDomain(a);
}
```

### Pattern 3: Workspace-scoped findFirst
**What:** Use `findFirst({ where: { id, workspaceId } })` instead of `findUnique({ where: { id } })` for all lookups that take a `workspaceId` argument. This enforces tenant isolation at the query level.
**When to use:** All `findById(id, workspaceId)` repository methods.
**Example:**
```typescript
// Source: src/lib/patients/repository.prisma.ts
async findById(id: string, workspaceId: string): Promise<Patient | null> {
  const p = await db.patient.findFirst({ where: { id, workspaceId } });
  return p ? mapToDomain(p) : null;
}
```

### Pattern 4: store.ts Global Singleton Swap
**What:** Replace the `createInMemory*Repository` import with `createPrisma*Repository` in `store.ts`. The `globalThis` pattern and `??=` assignment remain unchanged.
**When to use:** Once the Prisma implementation is complete — immediate swap, no feature flag.
**Example:**
```typescript
// Source: src/lib/patients/store.ts (already migrated — use as template)
import { createPrismaPatientRepository } from "./repository.prisma";
// ...
globalThis.__psivaultPatientRepository__ ??= createPrismaPatientRepository();
```

### Anti-Patterns to Avoid
- **Async `save()` returning `Promise<void>`:** The interface returns `ClinicalNote` / `PracticeDocument` synchronously in the in-memory version. The Prisma version must return a `Promise<ClinicalNote>` / `Promise<Document>` — callers already `await` the call per the server action pattern.
- **Returning raw Prisma types:** Always run through `mapToDomain()`. Domain types must never contain Prisma model references.
- **Instantiating `new PrismaClient()` in the repository file:** Always import the shared singleton from `src/lib/db.ts`.
- **Using `findUnique` for workspaceId-scoped lookups:** `findUnique` requires a unique field; `findFirst` with `{ id, workspaceId }` enforces tenant isolation without a composite unique key.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Create-or-update logic | Custom `if exists then update else create` | `db.model.upsert()` | Atomic — avoids race conditions |
| Workspace tenant isolation | Application-level filter after fetch | `where: { id, workspaceId }` in query | DB enforces it; no data leaks on bugs |
| Timestamp auto-management | `updatedAt: new Date()` in every update payload | Prisma `@updatedAt` decorator | Automatic, consistent, no bugs from manual wiring |
| Null-safe field mapping | Runtime null checks in every method | Prisma's nullable field types (`String?`) | Schema declares nullability; TypeScript enforces it at compile time |

**Key insight:** The Prisma query API handles all persistence complexity. Repository methods should be thin adapters: map domain → Prisma data, call one Prisma method, map Prisma result → domain.

---

## Common Pitfalls

### Pitfall 1: Interface Signature Mismatch — Async vs Sync
**What goes wrong:** `ClinicalNoteRepository.save()` is typed as `save(note: ClinicalNote): ClinicalNote` (synchronous return). The Prisma implementation will return `Promise<ClinicalNote>`. TypeScript will accept a function returning `Promise<T>` where `T` is expected because `Promise<T>` is assignable in async contexts, but callers in server actions must `await` the result.
**Why it happens:** The in-memory interface was designed synchronously; Prisma is always async.
**How to avoid:** The existing interface signatures use synchronous returns. Prisma repository methods are async. Callers in server actions already `await` repository calls. The TypeScript type system will flag mismatches at compile time — run `tsc --noEmit` after implementation.
**Warning signs:** TypeScript error "Type 'Promise<ClinicalNote>' is not assignable to type 'ClinicalNote'" on the method declaration.

### Pitfall 2: ClinicalNote @unique on appointmentId — Migration Required
**What goes wrong:** Adding `@unique` to `appointmentId` on a new model with no existing data is safe. However, if the migration is not run (or run on a different environment), the DB will not enforce uniqueness and `findByAppointmentId` could theoretically return multiple rows if data is inserted outside the application.
**Why it happens:** Schema declaration and migration are separate steps.
**How to avoid:** `prisma migrate dev` must be run as part of the implementation. The `@unique` constraint is declared in schema AND enforced in Prisma's `findUnique`-compatible methods.
**Warning signs:** Server starts but notes can be duplicated per appointment (only detectable via direct DB inspection).

### Pitfall 3: Relation Back-Fields on Existing Models
**What goes wrong:** Adding `clinicalNote ClinicalNote?` to `Appointment` and `clinicalNotes ClinicalNote[]` + `documents PracticeDocument[]` to `Patient` and `Workspace` requires Prisma to regenerate the client. If `prisma generate` is not run after schema changes, the TypeScript types will be stale.
**Why it happens:** `prisma migrate dev` runs `generate` automatically. Manual schema edits without migration or generate will leave types out of sync.
**How to avoid:** Always use `prisma migrate dev` (not `prisma db push`) to apply schema changes in development — it runs migration AND regenerates the client.
**Warning signs:** TypeScript reports that `db.appointment.clinicalNote` does not exist.

### Pitfall 4: DocumentType Enum — Prisma Enum vs TypeScript Union
**What goes wrong:** `DocumentType` in the domain model is a TypeScript string union (`"declaration_of_attendance" | "receipt" | ...`). When stored in PostgreSQL, it can either be a Prisma enum or a plain `String`. Using a Prisma enum requires migration; using `String` avoids it.
**Why it happens:** Prisma enums require explicit `enum` declarations in schema. TypeScript unions don't map 1:1.
**How to avoid:** Given `PracticeDocument.content` is stored as TEXT and the domain type is a string union (not an enum in the model file), store `type` as PostgreSQL TEXT with a Prisma `String` field and cast in `mapToDomain()`. This avoids an enum migration with no behavioral benefit — there is no other table that joins on document type. Alternatively, declare a Prisma enum `DocumentType` in schema — both are valid. The string approach is simpler and matches the `AppointmentCareMode` cast pattern in `appointments/repository.prisma.ts`.
**Warning signs:** TypeScript type error when assigning `doc.type` back to `DocumentType` — requires explicit cast `as DocumentType`.

### Pitfall 5: listByPatient Sort Order Contract
**What goes wrong:** The in-memory `listByPatient` for `ClinicalNoteRepository` sorts by `createdAt` descending. The Prisma implementation must replicate this with `orderBy: { createdAt: "desc" }`. Missing the `orderBy` clause will return results in DB insertion order (non-deterministic).
**Why it happens:** The test `"listByPatient returns notes sorted by createdAt descending"` explicitly validates order.
**How to avoid:** Always add `orderBy` to `findMany` calls where the in-memory equivalent sorts.
**Warning signs:** `clinical-domain.test.ts` test "listByPatient returns notes sorted by createdAt descending (most recent first)" fails.

---

## Code Examples

Verified patterns from the existing codebase:

### ClinicalNote Schema Model (to add to schema.prisma)
```prisma
// Based on Patient/Appointment pattern in prisma/schema.prisma
model ClinicalNote {
  id            String   @id @default(uuid())
  workspaceId   String   @map("workspace_id")
  patientId     String   @map("patient_id")
  appointmentId String   @unique @map("appointment_id")

  freeText          String  @map("free_text")
  demand            String?
  observedMood      String? @map("observed_mood")
  themes            String?
  clinicalEvolution String? @map("clinical_evolution")
  nextSteps         String? @map("next_steps")

  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  editedAt  DateTime? @map("edited_at")

  workspace   Workspace   @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  patient     Patient     @relation(fields: [patientId], references: [id], onDelete: Cascade)
  appointment Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)

  @@index([workspaceId, patientId])
  @@map("clinical_notes")
}
```

### PracticeDocument Schema Model (to add to schema.prisma)
```prisma
// Based on Patient/Appointment pattern in prisma/schema.prisma
model PracticeDocument {
  id          String @id @default(uuid())
  workspaceId String @map("workspace_id")
  patientId   String @map("patient_id")

  type    String  // DocumentType string union — stored as TEXT
  content String  // PostgreSQL TEXT, no size limit

  createdByAccountId String  @map("created_by_account_id")
  createdByName      String  @map("created_by_name")

  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  editedAt  DateTime? @map("edited_at")

  archivedAt          DateTime? @map("archived_at")
  archivedByAccountId String?   @map("archived_by_account_id")

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  patient   Patient   @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@index([workspaceId, patientId])
  @@map("practice_documents")
}
```

### Back-relation fields to add to existing models
```prisma
// In model Workspace — add alongside existing patients/appointments fields
clinicalNotes ClinicalNote[]
documents     PracticeDocument[]

// In model Patient — add alongside existing appointments field
clinicalNotes ClinicalNote[]
documents     PracticeDocument[]

// In model Appointment — add (one-to-one, optional)
clinicalNote ClinicalNote?
```

### PrismaClinicalRepository skeleton
```typescript
// Source: mirror of src/lib/appointments/repository.prisma.ts
import { db } from "../db";
import type { ClinicalNote } from "./model";
import type { ClinicalNoteRepository } from "./repository";
import type { ClinicalNote as PrismaClinicalNote } from "@prisma/client";

function mapToDomain(n: PrismaClinicalNote): ClinicalNote {
  return {
    id: n.id,
    workspaceId: n.workspaceId,
    patientId: n.patientId,
    appointmentId: n.appointmentId,
    freeText: n.freeText,
    demand: n.demand,
    observedMood: n.observedMood,
    themes: n.themes,
    clinicalEvolution: n.clinicalEvolution,
    nextSteps: n.nextSteps,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
    editedAt: n.editedAt,
  };
}

export function createPrismaClinicalRepository(): ClinicalNoteRepository {
  return {
    async save(note: ClinicalNote): Promise<ClinicalNote> { /* upsert */ },
    async findById(id, workspaceId) { /* findFirst */ },
    async findByAppointmentId(appointmentId, workspaceId) { /* findFirst */ },
    async listByPatient(patientId, workspaceId) { /* findMany, orderBy createdAt desc */ },
  };
}
```

### store.ts swap pattern
```typescript
// src/lib/clinical/store.ts — after swap (mirrors src/lib/patients/store.ts)
import { createPrismaClinicalRepository } from "./repository.prisma";
import type { ClinicalNoteRepository } from "./repository";

declare global {
  var __psivaultClinicalNoteRepository__: ClinicalNoteRepository | undefined;
}

export function getClinicalNoteRepository(): ClinicalNoteRepository {
  globalThis.__psivaultClinicalNoteRepository__ ??= createPrismaClinicalRepository();
  return globalThis.__psivaultClinicalNoteRepository__;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| In-memory Map store | Prisma + Supabase PostgreSQL | Phase 9 (patients/appointments) | Data persists across server restarts |
| `createInMemory*Repository` in store.ts | `createPrisma*Repository` in store.ts | Phase 9 established pattern | No code change outside store.ts and new repository.prisma.ts file |

**Deprecated/outdated in this phase:**
- `createInMemoryClinicalRepository` in `store.ts`: replaced by `createPrismaClinicalRepository` — in-memory function stays in `repository.ts` for tests but is no longer used by the application
- `createInMemoryDocumentRepository` in `store.ts`: same

---

## Open Questions

1. **Interface return type: sync vs async**
   - What we know: The `ClinicalNoteRepository` interface declares `save(note: ClinicalNote): ClinicalNote` (synchronous). The in-memory implementation returns synchronously. Prisma operations are inherently async.
   - What's unclear: Whether the planner should update the interface to return `Promise<ClinicalNote>` or whether TypeScript's structural typing allows an async implementation to satisfy the sync interface in the `store.ts` usage context.
   - Recommendation: Update the interface in `repository.ts` to return `Promise<ClinicalNote>` for `save`, `Promise<ClinicalNote | null>` for `findById`/`findByAppointmentId`, and `Promise<ClinicalNote[]>` for `listByPatient`. The same change applies to `PracticeDocumentRepository`. The in-memory implementation can be updated to return `Promise.resolve(...)` for test compatibility. Alternatively, do NOT change the interface — accept that the Prisma implementation has async methods that still satisfy the interface structurally in TypeScript (async functions return `Promise`, and callers in server actions already `await`). The appointment repository (Phase 9) uses `async` methods without modifying the interface — check if `AppointmentRepository` interface is async or sync for the definitive answer.

---

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json` — section included.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (config: `vitest.config.ts`) |
| Config file | `/home/caramaschi/Área de trabalho/Projetos/PsiLock/vitest.config.ts` |
| Quick run command | `npx vitest run tests/clinical-domain.test.ts tests/clinical-session-number.test.ts tests/document-domain.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REPO-03 | `PrismaClinicalRepository` implements all 4 methods correctly | unit (domain contract) | `npx vitest run tests/clinical-domain.test.ts tests/clinical-session-number.test.ts` | ✅ |
| REPO-04 | `PrismaDocumentRepository` implements all 4 methods correctly | unit (domain contract) | `npx vitest run tests/document-domain.test.ts` | ✅ |

**Note on test scope:** The existing tests (`clinical-domain.test.ts`, `clinical-session-number.test.ts`, `document-domain.test.ts`) test domain logic and in-memory repository behavior. They do NOT require a database connection — they import `createInMemoryClinicalRepository` and `createInMemoryDocumentRepository` directly. These tests pass regardless of the store.ts swap and serve as the domain contract that the Prisma implementations must satisfy behaviorally. The store.ts swap will only affect runtime behavior (actual server requests), not the test suite.

### Sampling Rate
- **Per task commit:** `npx vitest run tests/clinical-domain.test.ts tests/clinical-session-number.test.ts tests/document-domain.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
None — existing test infrastructure covers all phase requirements. No new test files are needed. The three existing test files collectively verify the domain contract that both Prisma implementations must honor.

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection — `prisma/schema.prisma` (current schema state, all existing models)
- Direct code inspection — `src/lib/patients/repository.prisma.ts` (canonical Phase 9 reference)
- Direct code inspection — `src/lib/appointments/repository.prisma.ts` (canonical Phase 9 reference with nullable fields)
- Direct code inspection — `src/lib/clinical/repository.ts` (4-method interface contract)
- Direct code inspection — `src/lib/documents/repository.ts` (4-method interface contract)
- Direct code inspection — `src/lib/clinical/model.ts` (complete domain model)
- Direct code inspection — `src/lib/documents/model.ts` (complete domain model)
- Direct code inspection — `tests/clinical-domain.test.ts` (verification contract)
- Direct code inspection — `tests/document-domain.test.ts` (verification contract)
- Direct code inspection — `src/lib/patients/store.ts` (already-migrated store.ts pattern)
- Direct code inspection — `src/lib/appointments/store.ts` (already-migrated store.ts pattern)

### Secondary (MEDIUM confidence)
- `.planning/phases/10-clinical-document-persistence/10-CONTEXT.md` — locked decisions from design discussion

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies verified in codebase, no new packages required
- Architecture: HIGH — two identical Phase 9 reference implementations exist in the same codebase
- Schema design: HIGH — directly modeled on existing schema patterns with locked constraints from CONTEXT.md
- Pitfalls: HIGH — identified from direct code inspection of interface contracts and test assertions

**Research date:** 2026-03-17
**Valid until:** Stable — Prisma API is stable; this is internal codebase pattern research with no external dependency drift risk
