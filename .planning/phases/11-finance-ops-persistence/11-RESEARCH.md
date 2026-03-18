# Phase 11: Finance & Ops Persistence - Research

**Researched:** 2026-03-17
**Domain:** Prisma ORM — schema modeling, migration, repository implementation (Finance, Audit, Reminders)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Scope:**
- Phase 11 includes `PrismaFinanceRepository`, `PrismaAuditRepository`, AND `PrismaReminderRepository` — all three in-memory ops repos replaced in this phase
- No new REPO requirement ID for Reminders — implied under Phase 11 ops persistence scope

**Audit consolidation:**
- Create `src/lib/audit/store.ts` with a centralized `getAuditRepository()` function (same pattern as `src/lib/finance/store.ts` and `src/lib/reminders/store.ts`)
- Update all action files that currently define a local `getAuditRepository()` to import from the new centralized store — removes the ~6 duplicate in-memory instantiations
- `AuditEvent` Prisma model has NO `updatedAt` field — append-only is intentional; the immutable audit trail is a feature
- Wire the backup route (`src/app/api/backup/route.ts`) to call `getAuditRepository().listForWorkspace()` — remove the placeholder comment; Phase 11 is complete when backup includes real audit data
- `AuditEvent.type` stored as plain TEXT — no Postgres enum; new event types can be added without a migration

**Reminder.link storage:**
- `Reminder.link` stored as two nullable columns: `link_type: String?` and `link_id: String?` (not JSONB) — explicit, indexable, no JSON parsing
- `linkType` stored as TEXT — no enum; consistent with AuditEvent.type and DocumentType patterns
- If a `Patient` is hard-deleted, their linked Reminders cascade delete — FK relation with `onDelete: Cascade`
- Indexing decisions for `(workspaceId, linkType, linkId)` and `(workspaceId, completedAt)` are Claude's discretion

**Finance (SessionCharge) schema:**
- `paymentMethod` stored as nullable TEXT — preserves the `PaymentMethod | string | null` union without a migration barrier for new methods
- No DB-level constraint enforcing `pago` status implies non-null `amountInCents` — application logic handles this
- Index on `[workspaceId, createdAt]` — supports the dashboard `listByWorkspaceAndMonth` queries
- `appointmentId` is a formal FK relation to `Appointment` with `onDelete: Cascade` — if an Appointment is hard-deleted, its charge cascades

**Repository wiring:**
- Same immediate-swap pattern as Phase 9 and 10 — no feature flags, no fallback
- `createPrismaFinanceRepository()` in `src/lib/finance/repository.prisma.ts`, replaces `createInMemorySessionChargeRepository()` in `src/lib/finance/store.ts`
- `createPrismaAuditRepository()` in `src/lib/audit/repository.prisma.ts`, replaces `createInMemoryAuditRepository()` in the new `src/lib/audit/store.ts`
- `createPrismaReminderRepository()` in `src/lib/reminders/repository.prisma.ts`, replaces `createInMemoryReminderRepository()` in `src/lib/reminders/store.ts`

**Test verification approach:**
- Existing domain tests are the verification contract: `tests/finance-domain.test.ts`, `tests/audit-events.test.ts`, `tests/reminder-domain.test.ts` must all pass
- No new Prisma-specific integration tests required — same approach as Phase 10
- Tests run against Prisma after store.ts swaps

### Claude's Discretion
- Exact Prisma field naming conventions (snake_case `@map` annotations)
- Index selection for Reminder queries (`completedAt`, `linkType/linkId`)
- `@default(now())` vs explicit `createdAt` handling for AuditEvent (`occurredAt` maps to `created_at`)
- Whether AuditEvent needs a separate `occurred_at` column or maps to `created_at`

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| REPO-05 | Implement `PrismaFinanceRepository` and replace in-memory stub | `SessionCharge` schema model with `appointmentId` FK cascade, `paymentMethod` as TEXT, index on `[workspaceId, createdAt]`; 6 interface methods mapped to Prisma queries; `store.ts` swap pattern verified |
| REPO-06 | Implement `PrismaAuditRepository` and replace in-memory stub | `AuditEvent` schema model with no `updatedAt`, `type`/`actor`/`subject`/`metadata` flattened from nested domain shape; `append()` uses `create()` not `upsert()`; centralized `src/lib/audit/store.ts` eliminates 6 duplicate local singletons; backup route wired to real data |
</phase_requirements>

---

## Summary

Phase 11 replaces three remaining in-memory repository singletons — `SessionChargeRepository`, `AuditEventRepository`, and `ReminderRepository` — with Prisma-backed implementations connected to the Supabase PostgreSQL database. The work is pure persistence layer: no UI, no new features.

The domain models and interfaces are already complete and stable. All three repositories have well-defined interfaces with in-memory implementations that serve as the specification. The test suites (`tests/finance-domain.test.ts`, `tests/audit-events.test.ts`, `tests/reminder-domain.test.ts`) are pure unit tests against in-memory implementations — they do not require a live database to pass and do not need to change.

The key complexity additions relative to Phase 10 are: (1) `AuditEvent`'s nested domain shape (`actor`, `subject`, `metadata`) must be flattened to columns for storage and reconstructed in `mapToDomain()`; (2) `Reminder.link` must be split from a domain object `{ type, id }` into two nullable columns; (3) the audit consolidation task deduplicates six local `getAuditRepository()` stubs across action files; (4) the backup route receives a real implementation replacing the `never[]` stub.

**Primary recommendation:** Mirror `src/lib/clinical/repository.prisma.ts` for Finance and Reminders (upsert pattern). Use `db.auditEvent.create()` — not upsert — for `AuditEventRepository.append()`, since audit events are append-only and never modified.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@prisma/client` | (project-pinned) | Database access layer | Already used by Phases 7–10 across all repositories |
| Prisma ORM | (project-pinned) | Schema DSL + migration | Established as the project ORM in Phase 7 (INFRA-02) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `src/lib/db.ts` | N/A | Prisma client singleton | Import `db` from here in all repository.prisma.ts files |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Flat columns for AuditEvent actor/subject/metadata | JSONB columns | JSONB is less structured, harder to query, inconsistent with project's column-per-field pattern |
| Two columns for Reminder.link | Single JSONB column | Two columns are indexable, explicit, no JSON parsing at runtime — decided in CONTEXT.md |

**Installation:** No new packages required — all dependencies established in earlier phases.

---

## Architecture Patterns

### Recommended Project Structure
```
src/lib/
├── finance/
│   ├── model.ts          # SessionCharge domain (unchanged)
│   ├── repository.ts     # In-memory impl (unchanged)
│   ├── repository.prisma.ts  # NEW: PrismaFinanceRepository
│   └── store.ts          # UPDATE: swap to createPrismaFinanceRepository
├── audit/
│   ├── events.ts         # AuditEvent domain (unchanged)
│   ├── repository.ts     # In-memory impl (unchanged, kept for tests)
│   ├── repository.prisma.ts  # NEW: PrismaAuditRepository
│   └── store.ts          # NEW: centralized getAuditRepository() singleton
├── reminders/
│   ├── model.ts          # Reminder domain (unchanged)
│   ├── repository.ts     # In-memory impl (unchanged)
│   ├── repository.prisma.ts  # NEW: PrismaReminderRepository
│   └── store.ts          # UPDATE: swap to createPrismaReminderRepository
prisma/
└── schema.prisma         # UPDATE: add SessionCharge, AuditEvent, Reminder models
```

### Pattern 1: Upsert on save() — Finance and Reminders
**What:** `db.*.upsert({ where: { id }, update: data, create: { id, ...data } })` — idempotent write for entities that can be created or updated
**When to use:** Any domain entity that uses `save()` for both creation and updates (SessionCharge, Reminder)
**Example:**
```typescript
// Source: src/lib/clinical/repository.prisma.ts (Phase 10 reference)
async save(charge: SessionCharge): Promise<SessionCharge> {
  const data = { /* all mutable fields */ };
  const c = await db.sessionCharge.upsert({
    where: { id: charge.id },
    update: data,
    create: { id: charge.id, ...data },
  });
  return mapToDomain(c);
}
```

### Pattern 2: create() for append-only — AuditEvent
**What:** `db.auditEvent.create({ data: { id, ...fields } })` — no upsert because audit events are never modified
**When to use:** AuditEventRepository.append() only
**Example:**
```typescript
// Source: Pattern derived from src/lib/audit/repository.ts (append semantics)
async append(event: AuditEvent): Promise<AuditEvent> {
  const e = await db.auditEvent.create({
    data: {
      id: event.id,
      workspaceId: event.actor.workspaceId,
      type: event.type,
      occurredAt: event.occurredAt,
      actorAccountId: event.actor.accountId,
      actorSessionId: event.actor.sessionId ?? null,
      actorDisplayName: event.actor.displayName ?? null,
      subjectKind: event.subject?.kind ?? null,
      subjectId: event.subject?.id ?? null,
      subjectLabel: event.subject?.label ?? null,
      summary: event.summary,
      metadata: event.metadata as Prisma.JsonObject,
    },
  });
  return mapToDomain(e);
}
```

### Pattern 3: mapToDomain() — reconstruct nested domain shapes
**What:** All Prisma models map flat DB columns back to the domain's nested shape in `mapToDomain()`
**When to use:** Every repository.prisma.ts — adapter between Prisma model and domain model
**Example for AuditEvent (most complex):**
```typescript
// Source: Pattern derived from src/lib/audit/events.ts + repository.ts domain shape
function mapToDomain(e: PrismaAuditEvent): AuditEvent {
  return {
    id: e.id,
    type: e.type,
    occurredAt: e.occurredAt,
    actor: {
      accountId: e.actorAccountId,
      workspaceId: e.workspaceId,
      sessionId: e.actorSessionId,
      displayName: e.actorDisplayName,
    },
    subject: e.subjectKind != null && e.subjectId != null
      ? { kind: e.subjectKind, id: e.subjectId, label: e.subjectLabel }
      : undefined,
    summary: e.summary,
    metadata: (e.metadata as Record<string, unknown>) ?? {},
  };
}
```

### Pattern 4: Centralized audit store (NEW for Phase 11)
**What:** `src/lib/audit/store.ts` with `getAuditRepository()` — exact same singleton pattern as `src/lib/finance/store.ts`
**When to use:** This is created once; all action files import `getAuditRepository` from this module instead of defining local functions
```typescript
// Source: src/lib/finance/store.ts pattern
import { createPrismaAuditRepository } from "./repository.prisma";
import type { AuditEventRepository } from "./repository";

declare global {
  var __psivaultAudit__: AuditEventRepository | undefined;
}

export function getAuditRepository(): AuditEventRepository {
  globalThis.__psivaultAudit__ ??= createPrismaAuditRepository();
  return globalThis.__psivaultAudit__;
}
```

### Pattern 5: Reminder.link two-column mapping
**What:** Domain `Reminder.link: { type, id } | null` maps to `link_type: String?` + `link_id: String?` in DB
**When to use:** mapToDomain reconstructs link; save() splits it
```typescript
// In save():
linkType: reminder.link?.type ?? null,
linkId: reminder.link?.id ?? null,

// In mapToDomain():
link: r.linkType != null && r.linkId != null
  ? { type: r.linkType as ReminderLinkType, id: r.linkId }
  : null,
```

### Anti-Patterns to Avoid
- **Upsert for AuditEvent:** Never upsert audit events — `append()` uses `create()` only. Audit records are immutable by design.
- **Storing actor/subject as JSONB:** The domain shape has flat fields; use flat columns for explicit schema, query capability, and type safety.
- **Creating a new audit local singleton in action files:** After Phase 11, all action files must import `getAuditRepository` from `src/lib/audit/store` — no new local stubs.
- **Changing test files:** The existing tests import `createInMemorySessionChargeRepository` directly — that's intentional unit testing. The store.ts swap makes the running app use Prisma without touching tests.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| UTC month boundaries in listByMonth | Custom date arithmetic in raw SQL | Prisma `gte`/`lt` with `new Date(Date.UTC(year, month-1, 1))` | Already proven in in-memory impl; Prisma translates correctly to Postgres |
| JSON metadata serialization | Manual serialize/deserialize | Prisma `Json` field type | Prisma handles Postgres JSONB natively; cast `metadata as Prisma.JsonObject` on write |
| Workspace-scoped query security | Application-layer filter after broad fetch | Always include `workspaceId` in Prisma `where` clause | Prevents cross-workspace data leaks; consistent with all prior repositories |
| Global singleton lifecycle | Module-level `let` variable | `globalThis.__psivault*__` pattern | Next.js hot reload destroys module-level vars; globalThis persists across reloads in dev |

---

## Common Pitfalls

### Pitfall 1: AuditEvent.metadata stored as Prisma.Json
**What goes wrong:** TypeScript type error — Prisma Json field won't accept `Record<string, unknown>` without a cast
**Why it happens:** Prisma's `Json` type is strict; domain uses `Record<string, unknown>`
**How to avoid:** Cast on write: `metadata: event.metadata as Prisma.JsonObject`. Cast on read: `metadata: (e.metadata as Record<string, unknown>) ?? {}`
**Warning signs:** TS error `Type 'Record<string, unknown>' is not assignable to type 'JsonValue'`

### Pitfall 2: AuditEvent.occurredAt vs createdAt column name
**What goes wrong:** The domain field is `occurredAt` but Prisma convention uses `created_at`; confusion leads to wrong column used for listForWorkspace ordering
**Why it happens:** AuditEvent intentionally omits `updatedAt` (append-only), and `occurredAt` semantically replaces `createdAt`
**How to avoid:** Use `occurredAt DateTime @default(now()) @map("occurred_at")` — a dedicated column with its own semantic name, NOT aliased to `created_at`. Order `listForWorkspace` by `{ occurredAt: "desc" }`.
**Warning signs:** Audit events appear in wrong order, or migration creates unexpected `created_at` column alongside `occurred_at`

### Pitfall 3: Reminder.link null reconstruction
**What goes wrong:** `link_type` is not null but `link_id` IS null (or vice versa) — partial data leads to invalid link object
**Why it happens:** Data integrity edge case if columns are set independently
**How to avoid:** In `mapToDomain`, always check BOTH `linkType != null && linkId != null` before constructing the link object. In `save()`, always set both or neither (both to null).

### Pitfall 4: Finance repository interfaces are synchronous in existing in-memory impl
**What goes wrong:** `SessionChargeRepository.save()` and other methods are currently synchronous (`void` / `SessionCharge | null` return types). The Prisma implementation returns Promises. TypeScript will error if the interface doesn't match.
**Why it happens:** The in-memory implementation was written before Prisma; interfaces were sync. Phases 9 and 10 already updated their interfaces to `Promise<T>`.
**How to avoid:** Update `SessionChargeRepository` and `ReminderRepository` interfaces to return `Promise<T>` for all methods before implementing the Prisma versions. Update the in-memory implementations too (make them return `Promise.resolve()`). Same process applied to `ClinicalNoteRepository` in Phase 10 (confirmed pattern).
**Warning signs:** TypeScript error `Type 'Promise<SessionCharge>' is not assignable to type 'SessionCharge'`

### Pitfall 5: AuditEventRepository.listForWorkspace is synchronous
**What goes wrong:** The `AuditEventRepository` interface currently has `listForWorkspace(workspaceId: string): AuditEvent[]` — synchronous. The Prisma implementation must be async.
**Why it happens:** The audit test at line 140 calls `repository.listForWorkspace("ws_1")` without `await` — the existing test assumes synchronous return. However, the test uses `createInMemoryAuditRepository()` directly, not the store — so the in-memory impl can stay sync; only the Prisma impl is async.
**How to avoid:** Add an async overload or update the interface to `Promise<AuditEvent[]>`. Since the test imports `createInMemoryAuditRepository` directly (not through the store), keeping the in-memory impl sync while making the interface accept both (or making in-memory return Promise.resolve) is the clean path. Mirror how Phase 10 handled this for ClinicalNoteRepository.
**Warning signs:** Audit test fails after interface change if `await` is not added to the test's `listForWorkspace` call — BUT the test uses in-memory directly, so it will still work if in-memory returns `Promise.resolve([...])` and the test uses `await`.

### Pitfall 6: Action files using local audit globals after Phase 11
**What goes wrong:** Action files define `var __psivaultAppointmentAudit__`, `var __psivaultPatientAudit__`, etc. — each is a separate in-memory store, so audit events from different action files are siloed and never visible in the unified audit trail.
**Why it happens:** Original Phase 1 design created per-domain local stubs as temporary placeholders.
**How to avoid:** The consolidation task creates `src/lib/audit/store.ts` with a single `__psivaultAudit__` global. Every action file drops its local `getAuditRepository` declaration and imports from the new store. The backup route imports `getAuditRepository` and replaces `const auditEvents: never[] = []`.
**Warning signs:** Audit events appear in per-domain silos; backup still shows empty audit array

### Pitfall 7: Appointment relation field missing from schema
**What goes wrong:** `SessionCharge.appointmentId` is a formal FK to `Appointment` — but the `Appointment` model in `schema.prisma` does not yet have a `sessionCharge` back-relation field. Prisma will fail schema validation.
**Why it happens:** The `Appointment` model currently only has a `clinicalNote ClinicalNote?` relation.
**How to avoid:** Add `sessionCharge SessionCharge?` to the `Appointment` model block (back-relation). Similarly add `reminders Reminder[]` to `Patient` and `Workspace`, and `auditEvents AuditEvent[]` to `Workspace`.

---

## Code Examples

### SessionCharge Prisma model
```prisma
// Source: CONTEXT.md decisions + Phase 10 migration.sql pattern
model SessionCharge {
  id          String @id @default(uuid())
  workspaceId String @map("workspace_id")
  patientId   String @map("patient_id")
  appointmentId String @unique @map("appointment_id")

  status        String  // ChargeStatus: "pendente" | "pago" | "atrasado"
  amountInCents Int?    @map("amount_in_cents")
  paymentMethod String? @map("payment_method") // nullable TEXT; PaymentMethod | string | null
  paidAt        DateTime? @map("paid_at")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  workspace   Workspace   @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  patient     Patient     @relation(fields: [patientId], references: [id], onDelete: Cascade)
  appointment Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)

  @@index([workspaceId, createdAt])
  @@index([workspaceId, patientId])
  @@map("session_charges")
}
```

### AuditEvent Prisma model
```prisma
// Source: CONTEXT.md decisions + AuditEvent domain shape (events.ts)
model AuditEvent {
  id          String @id @default(uuid())
  workspaceId String @map("workspace_id")

  type        String   // TEXT — no enum; new event types without migration
  occurredAt  DateTime @default(now()) @map("occurred_at")

  // Actor fields (flattened from AuditActor)
  actorAccountId  String  @map("actor_account_id")
  actorSessionId  String? @map("actor_session_id")
  actorDisplayName String? @map("actor_display_name")

  // Subject fields (flattened from AuditSubject, all nullable)
  subjectKind  String? @map("subject_kind")
  subjectId    String? @map("subject_id")
  subjectLabel String? @map("subject_label")

  summary  String
  metadata Json   @default("{}")

  // NO updatedAt — append-only, immutable audit trail

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([workspaceId, occurredAt])
  @@map("audit_events")
}
```

### Reminder Prisma model
```prisma
// Source: CONTEXT.md decisions + Reminder domain model (model.ts)
model Reminder {
  id          String @id @default(uuid())
  workspaceId String @map("workspace_id")
  patientId   String? @map("patient_id") // null for free-standing reminders

  title String

  dueAt       DateTime? @map("due_at")
  completedAt DateTime? @map("completed_at")

  // ReminderLink split into two nullable columns
  linkType String? @map("link_type") // "patient" | "appointment" | "document" | "charge"
  linkId   String? @map("link_id")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  patient   Patient?  @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@index([workspaceId, completedAt])
  @@index([workspaceId, linkType, linkId])
  @@map("reminders")
}
```

### UTC month boundary query — listByWorkspaceAndMonth
```typescript
// Source: src/lib/finance/repository.ts (in-memory reference)
async listByWorkspaceAndMonth(
  workspaceId: string,
  year: number,
  month: number,
): Promise<SessionCharge[]> {
  const from = new Date(Date.UTC(year, month - 1, 1));
  const to = new Date(Date.UTC(year, month, 1));
  const charges = await db.sessionCharge.findMany({
    where: {
      workspaceId,
      createdAt: { gte: from, lt: to },
    },
    orderBy: { createdAt: "desc" },
  });
  return charges.map(mapToDomain);
}
```

### Action file consolidation pattern (audit)
```typescript
// BEFORE (e.g., src/app/(vault)/patients/actions.ts):
import { createInMemoryAuditRepository } from "../../../lib/audit/repository";
declare global { var __psivaultPatientAudit__: ... }
function getAuditRepository() { ... }

// AFTER:
import { getAuditRepository } from "../../../lib/audit/store";
// Local declaration and function deleted entirely
```

---

## Schema Changes Inventory

The following additions are required in `prisma/schema.prisma`:

**New models:** `SessionCharge`, `AuditEvent`, `Reminder`

**Back-relation fields to add to existing models:**
| Model | Field to Add |
|-------|-------------|
| `Workspace` | `sessionCharges SessionCharge[]` |
| `Workspace` | `auditEvents AuditEvent[]` |
| `Workspace` | `reminders Reminder[]` |
| `Patient` | `sessionCharges SessionCharge[]` |
| `Patient` | `reminders Reminder[]` |
| `Appointment` | `sessionCharge SessionCharge?` (one-to-one, unique FK) |

**Reminder.patientId note:** The domain `Reminder` model does not have a `patientId` field directly — the patient link is expressed via `link: { type: "patient", id: "..." }`. However, for the cascade delete on patient hard-delete to work, a direct FK is needed. The decision is `onDelete: Cascade` via the `Patient` relation. This means `patientId` on the Reminder schema is the patient's id when `linkType === "patient"`, otherwise null. The Prisma `patient` relation uses `patientId` as the FK — this is derived from `linkId` when `linkType === "patient"`.

**Alternative approach for Reminder cascade:** Store `patientId` as a dedicated FK column (not the same as `link_id`) derived from `link.id` when `link.type === "patient"`. This gives an explicit FK for cascade without conflating the link columns. Claude should pick whichever is cleaner in implementation — either is acceptable.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Sync repository interfaces | Async (Promise<T>) interfaces for Prisma | Phases 9–10 | Finance and Reminder interfaces need the same migration to async |
| Per-action-file audit singletons | Single centralized `src/lib/audit/store.ts` | Phase 11 (this phase) | Eliminates ~6 duplicate `getAuditRepository` stubs; unifies audit trail |
| `auditEvents: never[]` in backup | Real Prisma audit data via `getAuditRepository().listForWorkspace()` | Phase 11 (this phase) | Backup includes complete audit trail |

**Deprecated/outdated after Phase 11:**
- Local `var __psivaultPatientAudit__`, `__psivaultAppointmentAudit__`, `__psivaultClinicalAudit__`, `__psivaultDocumentAudit__`, `__psivaultReminderAudit__` global declarations in action files — all replaced by single `__psivaultAudit__` in `src/lib/audit/store.ts`

---

## Open Questions

1. **Reminder patientId FK column**
   - What we know: The domain `Reminder` has `link: { type, id } | null`, not a dedicated `patientId`. Cascade delete requires a Prisma FK relation to `Patient`.
   - What's unclear: Whether to use a dedicated `patientId` column on `Reminder` (separate from `link_id`) or derive the FK from `link_id` when `link_type = 'patient'`.
   - Recommendation: Use a dedicated `patientId String? @map("patient_id")` column on `Reminder` that is populated when `link.type === "patient"` and null otherwise. This gives a clean FK for cascade without overloading the `link_id` column. The `mapToDomain()` ignores this column (it's redundant with `linkType/linkId`) and the `save()` sets it from `reminder.link?.type === "patient" ? reminder.link.id : null`.

2. **AuditEventRepository interface async migration**
   - What we know: The `audit-events.test.ts` test at line 140 calls `repository.listForWorkspace("ws_1")` synchronously (no `await`). The test uses `createInMemoryAuditRepository()` directly.
   - What's unclear: Whether the interface should become `Promise<AuditEvent[]>` (requiring test update) or be left sync with the in-memory impl and a Prisma-specific override.
   - Recommendation: Update the interface to `listForWorkspace(workspaceId: string): Promise<AuditEvent[]>`. Update the in-memory impl to return `Promise.resolve(events.filter(...))`. Update the test to `await repository.listForWorkspace("ws_1")`. This is consistent with all other repositories updated in Phases 9–10.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (vitest.config.ts present) |
| Config file | `vitest.config.ts` — `environment: "node"`, `include: ["tests/**/*.test.ts"]` |
| Quick run command | `npx vitest run tests/finance-domain.test.ts tests/audit-events.test.ts tests/reminder-domain.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REPO-05 | SessionChargeRepository methods (save, findById, findByAppointmentId, listByPatient, listByMonth, listByWorkspaceAndMonth) | unit | `npx vitest run tests/finance-domain.test.ts` | ✅ |
| REPO-05 | ChargeStatus lifecycle and financial summary derivation | unit | `npx vitest run tests/finance-domain.test.ts` | ✅ |
| REPO-05 | SECU-05: charge audit metadata whitelist (no amountInCents, no paymentMethod) | unit | `npx vitest run tests/finance-domain.test.ts` | ✅ |
| REPO-06 | AuditEventRepository append + listForWorkspace | unit | `npx vitest run tests/audit-events.test.ts` | ✅ |
| REPO-06 | AuditEvent contract (occurredAt, actor, subject, metadata) | unit | `npx vitest run tests/audit-events.test.ts` | ✅ |
| REPO-06 (implied) | ReminderRepository methods (save, findById, listActive, listCompleted, listActiveByPatient, listCompletedByPatient) | unit | `npx vitest run tests/reminder-domain.test.ts` | ✅ |
| REPO-06 (implied) | SECU-05: reminder audit metadata (no title) | unit | `npx vitest run tests/reminder-domain.test.ts` | ✅ |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/finance-domain.test.ts tests/audit-events.test.ts tests/reminder-domain.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
None — existing test infrastructure covers all phase requirements. All three test files exist and are passing against in-memory implementations. The store.ts swaps in later tasks will make the running application use Prisma without modifying the tests (except for the async interface migration in `audit-events.test.ts`).

---

## Sources

### Primary (HIGH confidence)
- `src/lib/audit/repository.ts` — `AuditEventRepository` interface, `createInMemoryAuditRepository` (complete contract)
- `src/lib/audit/events.ts` — `AuditEvent` domain shape, `AuditActor`, `AuditSubject`, `AuditEvent.metadata` type
- `src/lib/finance/repository.ts` — `SessionChargeRepository` interface, 6 methods, UTC boundary logic
- `src/lib/finance/model.ts` — `SessionCharge` domain shape, all fields including `paidAt`, `paymentMethod` union
- `src/lib/reminders/repository.ts` — `ReminderRepository` interface, 6 methods, `link` field access pattern
- `src/lib/reminders/model.ts` — `Reminder` domain shape, `ReminderLink`, `completedAt` semantics
- `src/lib/clinical/repository.prisma.ts` — Direct Phase 10 reference for upsert pattern, `mapToDomain()`, `findFirst({ where: { id, workspaceId } })`
- `src/lib/documents/repository.prisma.ts` — Phase 10 reference for TEXT-stored enum cast pattern
- `src/lib/patients/repository.prisma.ts` — Phase 9 reference for nullable field handling
- `prisma/schema.prisma` — Current schema state; confirmed existing models and their back-relation conventions
- `prisma/migrations/20260317194006_add_clinical_notes.../migration.sql` — Phase 10 migration SQL format reference
- `src/lib/finance/store.ts` — Confirmed store singleton pattern to replicate for audit store
- `src/lib/reminders/store.ts` — Confirmed store singleton pattern with `globalThis.__psivaultReminders__`
- `src/app/api/backup/route.ts` — Confirmed audit placeholder comment and `auditEvents: never[]` location
- `tests/finance-domain.test.ts` — Test contracts for REPO-05
- `tests/audit-events.test.ts` — Test contracts for REPO-06, confirms `listForWorkspace` sync call at line 140
- `tests/reminder-domain.test.ts` — Test contracts for Reminders; confirms link access pattern
- `.planning/phases/11-finance-ops-persistence/11-CONTEXT.md` — All locked decisions, schema decisions

### Secondary (MEDIUM confidence)
- Grep of action files — confirmed 6 distinct `getAuditRepository` local stubs: appointments/actions.ts, sessions/actions.ts, patients/[patientId]/documents/[documentId]/edit/actions.ts, patients/[patientId]/documents/[documentId]/actions.ts, patients/[patientId]/documents/new/actions.ts, actions/reminders.ts, patients/actions.ts

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; same Prisma stack used in Phases 7–10
- Architecture: HIGH — all patterns directly derived from working Phase 9 and 10 implementations in the codebase
- Pitfalls: HIGH — all pitfalls identified from direct code inspection (interface sync/async mismatch, AuditEvent Json cast, Reminder link split, audit consolidation)
- Schema design: HIGH — field-by-field verified against domain models; locked decisions from CONTEXT.md

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable Prisma stack; project-specific decisions won't change)
