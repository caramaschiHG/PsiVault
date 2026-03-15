# Phase 2: Patient and Agenda Core — Research

**Researched:** 2026-03-13
**Domain:** Patient registration, patient profile summary, archive/recover, appointment lifecycle, weekly recurrence, conflict prevention, day/week agenda views, and quick next-session flow inside the existing Phase 1 vault architecture
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PATI-01 | Professional can create a patient profile with basic identification and contact data | Use a narrow patient aggregate with essentials-first identity and contact fields |
| PATI-02 | Professional can record social name, emergency contact, legal guardian, and important observations when relevant | Keep these as optional patient fields shown progressively and hidden from secondary surfaces |
| PATI-03 | Professional can open a patient profile and immediately see last session, pending items, documents, and financial status | Add an operational summary view-model now, with scheduling-backed data and future-safe defaults for documents/finance |
| PATI-04 | Professional can archive a patient without deleting the clinical history | Use soft archive on the patient record; never move history to a second table |
| SCHD-01 | Professional can create an appointment linked to a patient with date, time, duration, and care mode | Use an appointment occurrence model with patient link, duration, status, and explicit care mode |
| SCHD-02 | Professional can reschedule or cancel an appointment | Treat reschedule and cancel as explicit lifecycle operations with visible history |
| SCHD-03 | Professional can mark an appointment as confirmed, completed, canceled, or no-show | Keep explicit appointment statuses; do not collapse `confirmed` away |
| SCHD-04 | Professional can create recurring weekly appointments | Support weekly series only in Phase 2; avoid a general recurrence engine |
| SCHD-05 | Professional can view agenda in daily and weekly layouts | Build agenda from derived day/week view-models over concrete appointment occurrences |
| SCHD-06 | System warns about conflicting appointment times before saving | Conflict logic should run in domain code before commit and hard-block normal saves |
| SCHD-07 | Professional can create the next session quickly from an existing appointment or patient context | Use a shared defaults initializer that reuses last relevant appointment data, then falls back to practice profile defaults |

</phase_requirements>

---

## Summary

Phase 2 should extend the Phase 1 modular-monolith shape rather than inventing a new service layer. The current codebase already prefers:

- Prisma and workspace-scoped ownership helpers in `src/lib/db.ts`
- thin `use server` action wrappers that delegate to `src/lib/...`
- pure domain/view-model helpers tested with Vitest
- structured audit events with redacted metadata
- server-rendered pages that compose typed presentational components

The planning implication is straightforward: Phase 2 should add `patients` and `appointments` domain modules under `src/lib/`, keep mutations thin in `src/app/.../actions.ts`, and make day/week agenda data a derived server-side view model.

The most important design constraint is not the calendar UI. It is keeping a stable domain shape that later clinical, document, and finance phases can attach to without rewriting patient or appointment history.

---

## Standard Stack

### Keep

| Library / Pattern | Why It Should Stay |
|-------------------|--------------------|
| Next.js App Router | Already defines the route and page composition model |
| Prisma + PostgreSQL | Best fit for patient, appointment, and future linked records |
| Vitest | Existing domain-test baseline is already in place |
| Existing audit event contract | Phase 2 needs auditability for archive/recover and appointment lifecycle changes |
| Existing workspace ownership model | Every patient and appointment must remain workspace-scoped |

### Add Deliberately

| Library / Pattern | Recommendation |
|-------------------|----------------|
| `zod` at action boundaries | Worth adding in Phase 2 because patient and scheduling forms are materially more complex than Phase 1 setup forms |
| Prisma-backed repositories mirroring current in-memory style | Keeps domain logic testable while moving real persistence into Phase 2 |

### Avoid

| Temptation | Why Not In Phase 2 |
|------------|--------------------|
| Full calendar framework or drag-and-drop scheduling | Adds UI complexity before the lifecycle and conflict rules are stable |
| Generic recurrence/RRULE engine | Weekly-only recurrence is enough for the requirement set |
| Background-job-dependent schedule generation | There is no existing job substrate, and Phase 2 does not need one to ship |

---

## Architecture Patterns

### Pattern 1: Narrow Patient Aggregate with Soft Archive

Phase 2 patient data should stay intentionally narrow. The product needs enough identity/contact structure to operate well, but it should not drift into a full intake dossier yet.

Recommended patient shape:

- `id`
- `workspaceId`
- `legalName`
- `socialName?`
- `dateOfBirth?`
- `contactPhone?`
- `contactEmail?`
- `guardianName?`
- `guardianPhone?`
- `emergencyContactName?`
- `emergencyContactPhone?`
- `importantObservations?`
- `archivedAt?`
- `createdAt`
- `updatedAt`

Planning implications:

- Keep guardian, emergency contact, and observations on the same aggregate for v1 simplicity.
- `importantObservations` is sensitive and should only appear in the primary patient profile/form.
- Archive should be soft delete via `archivedAt`, not row removal and not a separate archive table.
- Add an index optimized for active-patient flows, for example active-by-workspace and name sorting/filtering.

### Pattern 2: Operational Summary as a Stable Contract, Not a UI Afterthought

`PATI-03` forces Phase 2 to define a patient summary contract now, even though documents and finance arrive in later phases. The correct move is to define the summary shape now and allow some fields to be real data immediately while others stay future-safe.

Recommended summary contract:

- `lastSession`
- `nextSession`
- `pendingItemsCount`
- `documentCount`
- `financialStatus`

Recommended Phase 2 behavior:

- `lastSession`: derive from the most recent completed or no-show appointment
- `nextSession`: derive from the next scheduled or confirmed appointment
- `pendingItemsCount`: start with scheduling-derived pendencies only, especially upcoming appointments still needing confirmation
- `documentCount`: expose `0` for now through a stable contract rather than leaving the surface undefined
- `financialStatus`: expose a clear empty state such as `not_started` until finance tracking exists

This lets Phase 2 satisfy the summary requirement without pretending that Phase 4 and Phase 5 already exist.

### Pattern 3: Appointment Occurrences as the Agenda Source of Truth

Phase 2 should store concrete appointment occurrences as rows. Agenda day/week views, conflict checks, status transitions, and patient history are all simpler when they query actual occurrences rather than expanding recurrence rules at render time.

Recommended appointment shape:

- `id`
- `workspaceId`
- `patientId`
- `seriesId?`
- `startsAt`
- `endsAt`
- `durationMinutes`
- `careMode`
- `priceInCents?`
- `status`
- `rescheduledFromAppointmentId?`
- `createdAt`
- `updatedAt`

Status set:

- `scheduled`
- `confirmed`
- `completed`
- `canceled`
- `no_show`

Important modeling note:

- The existing Phase 1 `ServiceMode` enum includes `HYBRID`, which is valid for practice capability but not for a single booked session.
- Phase 2 should either introduce a dedicated appointment care-mode enum with only `IN_PERSON` and `ONLINE`, or strictly validate that appointment writes reject `HYBRID`.

### Pattern 4: Weekly Recurrence Through Series Metadata plus Materialized Occurrences

Do not hand-roll a general-purpose recurrence engine. Phase 2 only needs weekly recurrence.

Recommended series shape:

- `id`
- `workspaceId`
- `patientId`
- `startsOn`
- `endsOn?`
- `weekday`
- `startTime`
- `durationMinutes`
- `careMode`
- `priceInCents?`
- `active`
- `createdAt`
- `updatedAt`

Occurrence rows should carry:

- `seriesId`
- enough concrete timing data for agenda queries
- stable status/history independent from the series template

This keeps the agenda queryable with normal Prisma filters and makes later patient timelines easier.

### Pattern 5: Edit Scope Is a Domain Operation, Not a UI Toggle

For recurring appointments, the UI can offer scope labels, but the real behavior must live in domain logic:

- `this_occurrence`: change only one occurrence row
- `this_and_future`: split the series boundary at the chosen occurrence and regenerate only the affected future occurrences
- `whole_series`: update all future occurrences in the series plus the series template

Hard rules:

- Never rewrite finalized historical occurrences (`completed`, `no_show`, `canceled`) just because a series was edited later.
- If the edit would create conflicts in any affected future occurrence, the whole transaction should fail.
- When changing time or date for one occurrence, preserve the original history trail through audit and link fields rather than silently overwriting the past.

### Pattern 6: Reschedule Should Preserve Visible History

Rescheduling must be legible later in patient/appointment context. A plain in-place overwrite is too lossy.

Recommended approach:

- create the replacement occurrence
- link it with `rescheduledFromAppointmentId`
- keep the original occurrence as historical context, marked in a clearly non-active state and described by an audit/event summary

This is more transparent than simply mutating one row and relying on hidden logs.

### Pattern 7: Conflict Checks Belong in `src/lib/appointments/conflicts.ts`

Conflict handling should be pure domain logic with no UI-only interpretation.

Recommended overlap rule:

- conflict exists when `newStart < existingEnd && newEnd > existingStart`
- adjacent appointments where `newStart === existingEnd` are allowed

Recommended blocking set:

- appointments in `scheduled`
- appointments in `confirmed`

Recommended non-blocking set:

- `canceled`
- `completed`
- `no_show`

Other rules:

- conflicts are always workspace-local
- care mode does not bypass conflicts; a solo professional cannot double-book online and in-person at the same time
- archived patients should not be schedulable, even if their old history still exists

### Pattern 8: Agenda View Models Should Be Derived Server-Side

The current app already favors server-rendered page composition plus presentational components. Phase 2 should keep that shape.

Recommended agenda model split:

- domain queries and derivation in `src/lib/appointments/agenda.ts`
- day/week page composition in `src/app/(vault)/agenda/...`
- presentational `AppointmentCard` and `AgendaColumn` style components under route-specific components

Day/week implications:

- day view is the primary surface
- week view is required, but should reuse the same appointment card anatomy in a denser layout
- cards should show patient name, time, status chip, and care-mode icon plus label
- do not surface `importantObservations`, guardian data, or emergency contact on agenda/list cards
- avoid drag-and-drop in Phase 2; explicit edit flows are safer and clearer

### Pattern 9: Quick Next-Session Is a Shared Defaults Initializer

The quick next-session flow should not be implemented as two unrelated entry points.

Recommended initializer precedence:

1. latest relevant appointment for that patient
2. practice profile defaults from Phase 1

Fields to prefill:

- patient
- duration
- care mode
- price

Fields that must remain explicit:

- new date
- new time

Blocking rules:

- archived patient cannot start quick next-session
- if the source appointment was exceptional, prefer its actual occurrence values over practice defaults

---

## Recommended Module Split

Phase 2 planning should stay close to the established repo pattern:

- `src/lib/patients/model.ts`
- `src/lib/patients/repository.ts`
- `src/lib/patients/summary.ts`
- `src/lib/patients/audit.ts`
- `src/lib/appointments/model.ts`
- `src/lib/appointments/repository.ts`
- `src/lib/appointments/conflicts.ts`
- `src/lib/appointments/recurrence.ts`
- `src/lib/appointments/agenda.ts`
- `src/lib/appointments/defaults.ts`
- `src/lib/appointments/audit.ts`
- `src/app/(vault)/patients/...`
- `src/app/(vault)/agenda/...`
- `src/app/(vault)/appointments/actions.ts`

Mutation pattern should match Phase 1:

- action parses `FormData`
- boundary validation/coercion happens there
- domain modules do the real work
- repository persists
- audit event is emitted
- page revalidation happens at the edge

---

## Don't Hand-Roll

- Do not build a generic RFC5545 recurrence engine.
- Do not create a second “archived patients” table.
- Do not store patient operational summary as manually maintained columns.
- Do not expose observations, guardian data, or emergency contact on agenda cards or secondary lists.
- Do not make conflict handling a front-end-only behavior.
- Do not auto-pick the next session date/time in the quick rebooking flow.
- Do not treat `confirmed` as an implicit visual state with no explicit domain value.

---

## Common Pitfalls

- Reusing the practice-level `HYBRID` service mode as an appointment value creates ambiguity in the agenda.
- Implementing archive as delete-plus-restore later will break future patient-linked domains.
- Building recurrence without clear edit-scope semantics will make every later schedule mutation fragile.
- Letting reschedule overwrite the original slot erases history the professional will later need.
- Making the patient summary depend only on future document/finance work leaves `PATI-03` effectively unresolved.
- Showing too much patient detail in lists and agenda surfaces will violate the privacy posture already established in Phase 1.

---

## Planning Implications

Recommended Phase 2 plan breakdown remains correct:

1. `02-01`: patient data model, forms, archive flow, and profile summary
2. `02-02`: appointment model, recurrence logic, status transitions, and conflict rules
3. `02-03`: daily/weekly agenda UX and quick next-session workflow

Recommended execution shape:

- `02-01` establishes the patient aggregate, active/archive queries, operational summary contract, and patient profile shell
- `02-02` establishes the occurrence/series model, recurrence edit scopes, status transitions, conflict engine, and audit hooks
- `02-03` consumes those domain contracts to build the day/week agenda and quick next-session entry points

Cross-plan dependency notes:

- `02-03` should not invent new scheduling rules; it should consume the domain contracts from `02-02`
- `02-01` should define the operational summary contract before `02-03` builds patient-context navigation and quick actions
- audit event naming for patient and appointment lifecycle changes should be fixed early so the later patient timeline can reuse them

---

## Validation Architecture

Phase 2 should stay aligned with the current test architecture: pure-domain Vitest suites first, UI/manual validation second.

### Automated Layers

1. **Schema and model invariants**
   - patient soft-archive fields exist
   - appointment status and recurrence relations exist
   - workspace scoping remains explicit

2. **Pure domain tests**
   - patient normalization and optional-field handling
   - archive/recover behavior
   - operational summary derivation and fallback states
   - conflict detection logic
   - recurrence generation and scope editing
   - quick next-session default selection

3. **Repository and mutation tests**
   - archived patients drop from active selectors but remain recoverable
   - recurring edit-scope operations preserve finalized historical occurrences
   - reschedule operations preserve linkage/history
   - audit events are emitted with redacted metadata

4. **View-model tests**
   - day agenda ordering and block labels
   - week agenda grouping
   - status chip text and care-mode label rendering inputs
   - privacy-safe agenda/patient-list cards

### Suggested Test Files

- `tests/patient-domain.test.ts`
- `tests/patient-summary.test.ts`
- `tests/appointment-conflicts.test.ts`
- `tests/appointment-recurrence.test.ts`
- `tests/appointment-defaults.test.ts`
- `tests/agenda-view-model.test.ts`

### Manual Validation Checklist

- creating a patient shows the essentials-first flow
- social name and optional contacts appear only when relevant
- archived patient disappears from active patient flows
- restoring a patient returns directly to the patient profile
- conflicting appointment save is blocked before commit
- recurring edit scopes behave differently and predictably
- daily view reads clearly at a glance
- weekly view stays legible without becoming a spreadsheet
- quick next-session prepopulates patient, duration, mode, and price but leaves date/time empty

### Tooling Recommendation

- Keep `vitest` as the mandatory verification path for Phase 2
- Do not make browser E2E a blocker for this phase unless `02-03` introduces interactions that domain/view-model tests cannot cover
- If `zod` is introduced, validate it with dedicated boundary tests rather than mixing parsing logic into UI tests

---

## Code Examples

### Patient summary contract

```ts
interface PatientOperationalSummary {
  patientId: string;
  lastSession: AppointmentDigest | null;
  nextSession: AppointmentDigest | null;
  pendingItemsCount: number;
  documentCount: number;
  financialStatus: "not_started" | "paid" | "pending" | "overdue" | "mixed";
}
```

### Conflict rule

```ts
function overlaps(
  candidateStart: Date,
  candidateEnd: Date,
  existingStart: Date,
  existingEnd: Date,
) {
  return candidateStart < existingEnd && candidateEnd > existingStart;
}
```

### Quick next-session defaults

```ts
interface NextSessionDefaults {
  patientId: string;
  durationMinutes: number;
  careMode: "in_person" | "online";
  priceInCents: number | null;
  startsAt: null;
}
```

---

## Sources

- `.planning/phases/02-patient-and-agenda-core/02-CONTEXT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/ROADMAP.md`
- `docs/architecture/phase-01-vault-foundation.md`
- `prisma/schema.prisma`
- `src/lib/db.ts`
- `src/lib/setup/profile.ts`
- `src/lib/setup/readiness.ts`
- `src/lib/setup/constants.ts`
- `src/lib/auth/session.ts`
- `src/lib/audit/events.ts`
- `src/lib/audit/repository.ts`
- `src/lib/logging/redaction.ts`
- `src/lib/security/session-control.ts`
- `src/lib/security/sensitive-actions.ts`
- `src/app/(vault)/setup/actions.ts`
- `src/app/(vault)/setup/page.tsx`
- `src/app/(vault)/settings/profile/page.tsx`
- `src/app/(vault)/settings/security/page.tsx`
- `tests/auth-session.test.ts`
- `tests/setup-readiness.test.ts`
- `tests/audit-events.test.ts`

---
*Research completed: 2026-03-13*
*Ready for planning: yes*
