# Phase 11: Finance & Ops Persistence - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the in-memory `SessionChargeRepository`, `AuditEventRepository`, and `ReminderRepository` with Prisma implementations backed by Supabase. This requires:
1. Adding `SessionCharge`, `AuditEvent`, and `Reminder` models to `schema.prisma`
2. Running a Prisma migration
3. Implementing `createPrismaFinanceRepository()`, `createPrismaAuditRepository()`, and `createPrismaReminderRepository()`
4. Updating `store.ts` files to use Prisma instead of in-memory
5. Centralizing the audit repository (currently fragmented across action files) into a single `src/lib/audit/store.ts`
6. Wiring the backup route to use the real Prisma audit repository

No UI changes. No new features. Scope is persistence layer only.

**Requirements covered:** REPO-05 (Finance), REPO-06 (Audit). Reminders is implied under ops persistence — no separate requirement ID needed.

</domain>

<decisions>
## Implementation Decisions

### Reminder scope
- Phase 11 includes `PrismaReminderRepository` alongside Finance and Audit — all three in-memory ops repos are replaced in this phase
- No new REPO requirement ID for Reminders — it's implied under Phase 11 ops persistence scope

### Audit consolidation
- Create `src/lib/audit/store.ts` with a centralized `getAuditRepository()` function (same pattern as `src/lib/finance/store.ts` and `src/lib/reminders/store.ts`)
- Update all action files that currently define a local `getAuditRepository()` to import from the new centralized store — removes ~6 duplicate in-memory instantiations
- `AuditEvent` Prisma model has **no `updatedAt` field** — append-only is intentional; the immutable audit trail is a feature
- Wire the backup route (`src/app/api/backup/route.ts`) to call `getAuditRepository().listForWorkspace()` — remove the placeholder comment; Phase 11 is complete when backup includes real audit data
- `AuditEvent.type` stored as plain **TEXT** — no Postgres enum; new event types can be added without a migration

### Reminder.link storage
- `Reminder.link` stored as **two nullable columns**: `link_type: String?` and `link_id: String?` (not JSONB) — explicit, indexable, no JSON parsing
- `linkType` stored as **TEXT** — no enum; consistent with AuditEvent.type and DocumentType patterns
- If a `Patient` is hard-deleted, their linked Reminders **cascade delete** — FK relation with `onDelete: Cascade` matching the pattern of ClinicalNote and PracticeDocument
- Indexing decisions for `(workspaceId, linkType, linkId)` and `(workspaceId, completedAt)` are **Claude's discretion**

### Finance (SessionCharge) schema
- `paymentMethod` stored as **nullable TEXT** — preserves the `PaymentMethod | string | null` union type without a migration barrier for new methods
- No DB-level constraint enforcing `pago` status implies non-null `amountInCents` — application logic (updateSessionCharge) handles this
- **Index on `[workspaceId, createdAt]`** — supports the dashboard `listByWorkspaceAndMonth` queries
- `appointmentId` is a **formal FK relation** to `Appointment` with `onDelete: Cascade` — if an Appointment is hard-deleted, its charge cascades; consistent with ClinicalNote cascade

### Repository wiring
- Same immediate-swap pattern as Phase 9 and 10 — no feature flags, no fallback
- `createPrismaFinanceRepository()` in `src/lib/finance/repository.prisma.ts`, replaces `createInMemorySessionChargeRepository()` in `src/lib/finance/store.ts`
- `createPrismaAuditRepository()` in `src/lib/audit/repository.prisma.ts`, replaces `createInMemoryAuditRepository()` in the new `src/lib/audit/store.ts`
- `createPrismaReminderRepository()` in `src/lib/reminders/repository.prisma.ts`, replaces `createInMemoryReminderRepository()` in `src/lib/reminders/store.ts`

### Test verification approach
- Existing domain tests are the verification contract: `tests/finance-domain.test.ts`, `tests/audit-events.test.ts`, `tests/reminder-domain.test.ts` must all pass
- No new Prisma-specific integration tests required — same approach as Phase 10
- Tests run against Prisma after store.ts swaps

### Claude's Discretion
- Exact Prisma field naming conventions (snake_case `@map` annotations)
- Index selection for Reminder queries (`completedAt`, `linkType/linkId`)
- `@default(now())` vs explicit `createdAt` handling for AuditEvent (occurredAt maps to createdAt)
- Whether AuditEvent needs a separate `occurred_at` column or maps to `created_at`

</decisions>

<specifics>
## Specific Ideas

- Mirror Phase 10 implementation closely: `mapToDomain()` + upsert pattern for Finance and Reminders; `append()` uses `create()` (not upsert) for AuditEvent since it's append-only
- The audit consolidation in this phase resolves a known v1 tech debt: fragmented audit repos per action file

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/db.ts`: Prisma client singleton — already used by Phase 9 and 10 implementations
- `src/lib/patients/repository.prisma.ts`: Reference for `mapToDomain()` + upsert pattern
- `src/lib/appointments/repository.prisma.ts`: Reference for nullable fields and FK relations
- `src/lib/finance/store.ts`: Already has the `getFinanceRepository()` pattern — just swap from in-memory to Prisma
- `src/lib/reminders/store.ts`: Same — `getReminderRepository()` pattern ready for swap
- Phase 10 CONTEXT.md and implementation: direct reference for schema, migration, and store swap pattern

### Established Patterns
- `store.ts` global singleton: `globalThis.__psivault*Repository__ ??= createPrisma*Repository()`
- `mapToDomain()` adapter: Converts Prisma model to domain model, handles field name differences
- Upsert on `save()`: `db.*.upsert({ where: { id }, update: data, create: { id, ...data } })`
- `create()` for append-only: `AuditEvent.append()` uses `db.auditEvent.create()` — no upsert needed
- TEXT storage for open-ended enums: DocumentType, ServiceMode pattern

### Integration Points
- `src/lib/finance/store.ts` — update import from `createInMemorySessionChargeRepository` to `createPrismaFinanceRepository`
- `src/lib/reminders/store.ts` — update import from `createInMemoryReminderRepository` to `createPrismaReminderRepository`
- `src/lib/audit/store.ts` (NEW) — create with `getAuditRepository()` using `createPrismaAuditRepository`
- All action files with local `getAuditRepository()` (patients, appointments, sessions, reminders, documents) — update to import from `src/lib/audit/store`
- `src/app/api/backup/route.ts` — wire audit listing to `getAuditRepository().listForWorkspace()`
- `prisma/schema.prisma` — add `SessionCharge`, `AuditEvent`, and `Reminder` models with FK relations
- `Workspace` model — needs `sessionCharges`, `auditEvents`, `reminders` relation fields
- `Patient` model — needs `reminders` relation field (for cascade)
- `Appointment` model — needs `sessionCharge` relation field (one-to-one, onDelete: Cascade)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 11-finance-ops-persistence*
*Context gathered: 2026-03-17*
