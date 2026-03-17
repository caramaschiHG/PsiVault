# Phase 10: Clinical & Document Persistence - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the in-memory `ClinicalNoteRepository` and `PracticeDocumentRepository` with Prisma implementations backed by Supabase. This requires:
1. Adding `ClinicalNote` and `PracticeDocument` models to `schema.prisma`
2. Running a Prisma migration
3. Implementing `createPrismaClinicalRepository()` and `createPrismaDocumentRepository()`
4. Updating `store.ts` files to use Prisma instead of in-memory

No UI changes. No new features. Scope is persistence layer only.

</domain>

<decisions>
## Implementation Decisions

### Data integrity constraints
- `ClinicalNote.appointmentId` must have a `@unique` constraint — enforce one-to-one at DB level (not just application logic)
- Both `ClinicalNote` and `PracticeDocument` must have explicit Prisma FK relations to `Patient`, `Appointment` (for note), and `Workspace` — consistent with how `Appointment` relates to `Patient` and `Workspace`
- If an `Appointment` is hard-deleted, its `ClinicalNote` cascades (onDelete: Cascade) — matches how Appointment cascades from Patient
- If a `Patient` is hard-deleted, all their documents cascade (onDelete: Cascade)

### Document content storage
- `PracticeDocument.content` stored as plain PostgreSQL TEXT — no size limit, no sanitization, no special handling
- Store content as-is from the template system; the template output is already clean and controlled

### Data retention on archive
- Patient soft-archive (archivedAt set) does NOT touch clinical notes or documents — records are preserved intact
- Export/backup always includes clinical notes and documents for archived patients — the export is the complete clinical record

### Repository wiring
- Swap `store.ts` immediately on implementation (same pattern as Phase 9) — no feature flags, no fallback
- Pattern: `createPrismaClinicalRepository()` in `src/lib/clinical/repository.prisma.ts`, replaces `createInMemoryClinicalRepository()` in `store.ts`
- Pattern: `createPrismaDocumentRepository()` in `src/lib/documents/repository.prisma.ts`, replaces `createInMemoryDocumentRepository()` in `store.ts`

### Test verification approach
- Reuse existing domain tests as the contract: `clinical-domain.test.ts`, `clinical-session-number.test.ts`, `document-domain.test.ts` must all pass
- No new Prisma-specific integration tests required — the existing test suite is the verification contract
- Tests currently run against in-memory repos — after the store.ts swap, they run against Prisma

### Claude's Discretion
- Exact Prisma field naming conventions (snake_case `@map` annotations)
- Index selection for query patterns (e.g., `[workspaceId, patientId]` index)
- `updatedAt @updatedAt` vs explicit update handling

</decisions>

<specifics>
## Specific Ideas

No specific requirements beyond the above — implementation should closely mirror the Phase 9 Prisma pattern from `src/lib/patients/repository.prisma.ts` and `src/lib/appointments/repository.prisma.ts`.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/db.ts`: Prisma client singleton — already used by Phase 9 implementations
- `src/lib/patients/repository.prisma.ts`: Reference implementation — `mapToDomain()` + upsert pattern to follow exactly
- `src/lib/appointments/repository.prisma.ts`: Reference for more complex mapping with nullable fields

### Established Patterns
- `store.ts` global singleton pattern: `globalThis.__psivault*Repository__ ??= createPrisma*Repository()`
- Repository interface contracts: `ClinicalNoteRepository` (4 methods) and `PracticeDocumentRepository` (4 methods) — all must be implemented
- `mapToDomain()` adapter: Converts Prisma model to domain model, handles field name differences
- Upsert on `save()`: Phase 9 uses `db.*.upsert({ where: { id }, update: data, create: { id, ...data } })`

### Integration Points
- `src/lib/clinical/store.ts` — update import from `createInMemoryClinicalRepository` to `createPrismaClinicalRepository`
- `src/lib/documents/store.ts` — update import from `createInMemoryDocumentRepository` to `createPrismaDocumentRepository`
- `prisma/schema.prisma` — add `ClinicalNote` and `PracticeDocument` models with relations to `Patient`, `Appointment`, `Workspace`
- `Workspace` model in schema — needs `clinicalNotes` and `documents` relation fields added
- `Patient` model — needs `clinicalNotes` and `documents` relation fields added
- `Appointment` model — needs `clinicalNote` relation field added (one-to-one)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 10-clinical-document-persistence*
*Context gathered: 2026-03-17*
