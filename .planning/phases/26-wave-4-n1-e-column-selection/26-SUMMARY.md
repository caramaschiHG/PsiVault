# Phase 26 — Wave 4: N+1 e Column Selection

**one_liner**: Eliminou N+1 na agenda (clinical notes batch) e excluiu importantObservations de todas as queries de listagem de pacientes.

## Summary

### What was built

**QUERY-04 — Clinical Notes Batch:**
- Added `findByAppointmentIds(ids: string[], workspaceId: string): Promise<Set<string>>` to `ClinicalNoteRepository` interface, in-memory implementation, and Prisma implementation
- In-memory: iterates store once, builds Set of matched appointment IDs
- Prisma: single `findMany` with `appointmentId: { in: ids }` + `select: { appointmentId: true }`
- Refactored `agenda/page.tsx`: `Promise.all(completedAppts.map(findByAppointmentId))` → single `findByAppointmentIds` call
- `notedAppointmentIds` now comes directly as `Set<string>` from batch result

**QUERY-05 — Patient Column Selection:**
- Added `LIST_SELECT` (Prisma.validator) to `repository.prisma.ts` omitting `importantObservations`
- Added `PatientListRow` type (Prisma.PatientGetPayload)
- Added `mapListToDomain` function setting `importantObservations: null` for list surfaces
- Updated `listActive` and `listArchived` to use `select: LIST_SELECT` + `mapListToDomain`
- `findById` and new `listAllByWorkspace` use full `mapToDomain` (complete data)
- In-memory `listActive`/`listArchived` now also null out `importantObservations` to match Prisma behavior
- Added `listAllByWorkspace` to interface + in-memory + Prisma — used by backup route to preserve full data

### Decisions

- `findByAppointmentIds` returns `Set<string>` — agenda only checks presence, not content
- Backup route uses `listAllByWorkspace` (full data) — prevents data loss on backup export
- `importantObservations` remains `string | null` in `Patient` interface (not optional) — null for list surfaces, populated for individual lookups

### Metrics

- Agenda with N completed appointments: N queries → 1 query for clinical notes
- `importantObservations` excluded from SQL in all list queries (not just JS)
- Tests: 407/407 passing

### Review findings resolved

- CR-01 (CRITICAL): Added `listAllByWorkspace` to protect backup route from data loss
- WR-01: Removed dead `.filter(Boolean)` from Prisma `findByAppointmentIds` (non-nullable field)
- WR-02: Added empty-array guard to in-memory `findByAppointmentIds`
- WR-03: In-memory `listActive`/`listArchived` now mirror Prisma behavior (null importantObservations)
