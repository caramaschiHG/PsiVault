# Phase 3: Clinical Record Core - Research

**Researched:** 2026-03-14
**Domain:** Clinical note composition, audit traceability, patient timeline, Next.js App Router server actions
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Note composition layout:**
- Free text is the primary and leading element — the main textarea appears at the top of the note composer.
- Optional structured fields (demanda/queixa, humor observado, temas trabalhados, evolução clínica, próximos passos) appear below the free text area, always visible, clearly secondary.
- No progressive disclosure, no toggles — the structured section is always shown as optional fields with placeholder text indicating they can be left blank.
- All structured fields are free-text inputs (short textarea or text input) — no dropdowns, no predefined vocabulary, no chip/scale pickers. The professional writes what they want.

**Note context and prefill:**
- When the note opens, the session metadata appears as a read-only header: date, session number (e.g., "Sessão 12"), duration, and care mode (presencial/online).
- The writing area starts blank — no content is prefilled from previous sessions.
- The session number context is derived from the appointment's position in the patient's appointment history.

**Note entry flow:**
- Note entry opens as a dedicated full page route: `/sessions/[appointmentId]/note`.
- Entry point 1: "Registrar evolução" button/action on the completed appointment card on the agenda.
- Entry point 2: From the appointment entry in the patient's operational summary or clinical timeline on the patient profile page.
- After saving: the professional is taken to the patient profile page (note becomes visible in the timeline, and patient context is immediately available).
- Unsaved draft: a confirmation prompt (browser-native or custom) warns before navigating away if the note has unsaved content.

### Claude's Discretion
- Edit audit model (CLIN-04): how edits are versioned and what history the professional sees — immutable snapshot per save vs. single current version with edited timestamp and audit log entry. Either is acceptable as long as the audit trail is preserved per Phase 1 contract.
- Patient timeline shape (CLIN-05): exact information density per timeline entry, whether no-show/canceled appointments appear as timeline entries, and how the professional navigates from a timeline entry to the full note.
- Exact field labels and Portuguese wording for all structured fields and UI copy.
- Visual treatment of the read-only session metadata header in the note composer.
- Loading/saving states and error handling for note persistence.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within Phase 3 scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CLIN-01 | Professional can register a session note from the completed appointment context. | Route `/sessions/[appointmentId]/note` entry points from agenda card and patient profile; server action `createClinicalNoteAction` following existing action patterns. |
| CLIN-02 | Session note supports free-text writing without forcing a rigid template. | Primary textarea leads the composer; `freeText` field in `ClinicalNote` model; no required structured fields. |
| CLIN-03 | Session note supports optional structured fields such as demand, observed mood, themes, evolution, and next steps. | Five optional `string | null` fields in model, always visible below free text, all free-text inputs. |
| CLIN-04 | Professional can edit a session note while preserving an audit trail of changes. | Recommended: single current version + `editedAt` timestamp + `clinical.note.updated` audit event; append-only audit log satisfies traceability contract from Phase 1. |
| CLIN-05 | Patient record shows a chronological timeline of sessions and clinical evolution. | New `ClinicalTimeline` section on patient profile page; `listByPatient` query on clinical repository sorted chronologically; session number derivation from appointment history. |
</phase_requirements>

---

## Summary

Phase 3 introduces the clinical record domain to PsiVault: a new `src/lib/clinical/` module following the exact same patterns as `src/lib/appointments/` and `src/lib/patients/`. The domain is composed of a model (`model.ts`), repository interface and in-memory implementation (`repository.ts`), singleton store (`store.ts`), and an audit helper (`audit.ts`). A server action file at `src/app/(vault)/sessions/[appointmentId]/actions.ts` drives note create and edit using `"use server"` and `redirect()` — identical to the appointment actions pattern.

The note composer at `/sessions/[appointmentId]/note` is a dedicated full-page route consistent with the "focused task = full route" pattern already used by `/appointments/new`. Session metadata (date, session number, duration, care mode) is computed server-side and rendered as a read-only header. The professional writes free text first; five optional structured fields follow below. No external packages are required — the entire domain uses only existing Next.js, React, and TypeScript infrastructure.

The patient profile page gains a new `ClinicalTimeline` section, rendered below the existing `QuickNextSessionCard`, showing appointments in reverse chronological order with the most recent first. Timeline entries for COMPLETED appointments link to the note page; other statuses appear as context (no-show, canceled) per Claude's discretion.

**Primary recommendation:** Mirror the `src/lib/appointments/` domain structure verbatim. Create `src/lib/clinical/` with model, repository, store, and audit modules. Add the note page route under `src/app/(vault)/sessions/[appointmentId]/note/`. Extend the patient profile page with a timeline section. No new libraries required.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | ^15.2.4 | Full-page route, server components, server actions | Already in use; `"use server"` + `redirect()` is the established action pattern |
| TypeScript | ^5.8.2 | Domain model typing, repository interface | Project-wide; all domain modules are `.ts` |
| React 19 | ^19.0.0 | Server components + minimal client components for UX (unsaved-draft guard) | Already in use |
| Vitest | ^3.0.9 | Unit tests for model, repository, and derived values | Existing test runner; config at `vitest.config.ts` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `globalThis` store pattern | N/A (native) | In-memory singleton repository (same as appointments) | Phase 3 — no DB persistence yet |
| `Intl.DateTimeFormat` | Native | Date formatting for timeline entries in pt-BR | Same approach as `getSummaryLabel` in `patients/summary.ts` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Single `editedAt` + audit event for CLIN-04 | Immutable snapshot per save (version array in model) | Snapshot approach is correct for production but requires more complex repository queries; single-version + audit event satisfies Phase 3 traceability requirement with less complexity, and is upgradeable in Phase 6 |
| Always-visible structured fields | Toggle/progressive disclosure | Locked decision — always visible, no toggles |

**Installation:** No new packages needed.

---

## Architecture Patterns

### Recommended Project Structure

```
src/lib/clinical/
├── model.ts          # ClinicalNote interface, create/update pure functions
├── repository.ts     # ClinicalNoteRepository interface + createInMemoryClinicalRepository
├── store.ts          # getClincialNoteRepository() singleton — globalThis pattern
└── audit.ts          # createClinicalNoteAuditEvent() — wraps Phase 1 createAuditEvent

src/app/(vault)/sessions/
└── [appointmentId]/
    ├── note/
    │   └── page.tsx  # Note composer — server component, reads appointment + existing note
    └── actions.ts    # createNoteAction, updateNoteAction — "use server"
```

### Pattern 1: Domain Model — ClinicalNote Shape

**What:** Immutable-friendly interface with optional structured fields, lifecycle timestamps, and an `editedAt` field for traceability.
**When to use:** All persistence and derivation in the clinical domain.

```typescript
// src/lib/clinical/model.ts
export interface ClinicalNote {
  id: string;
  workspaceId: string;
  patientId: string;
  appointmentId: string;

  // Primary content — always present (may be empty string initially)
  freeText: string;

  // Optional structured fields — null means "not filled"
  demand: string | null;          // demanda / queixa
  observedMood: string | null;    // humor observado
  themes: string | null;          // temas trabalhados
  clinicalEvolution: string | null; // evolução clínica
  nextSteps: string | null;       // próximos passos

  createdAt: Date;
  updatedAt: Date;
  editedAt: Date | null;          // non-null after first edit
}
```

### Pattern 2: Repository Interface — matching AppointmentRepository shape

**What:** Repository contract + in-memory implementation using a `Map<string, ClinicalNote>`.
**When to use:** All clinical data access — note creation, update, fetch by appointment, list by patient.

```typescript
// src/lib/clinical/repository.ts
export interface ClinicalNoteRepository {
  save(note: ClinicalNote): ClinicalNote;
  findById(id: string, workspaceId: string): ClinicalNote | null;
  findByAppointmentId(appointmentId: string, workspaceId: string): ClinicalNote | null;
  listByPatient(patientId: string, workspaceId: string): ClinicalNote[];
}
```

`listByPatient` returns notes sorted by `createdAt` descending (most recent first) — matching `AppointmentRepository.listByPatient` sort direction convention.

### Pattern 3: Store Singleton — globalThis pattern

**What:** Module-level in-memory singleton, exactly like `src/lib/appointments/store.ts`.

```typescript
// src/lib/clinical/store.ts
declare global {
  var __psivaultClinicalNoteRepository__: ClinicalNoteRepository | undefined;
}

export function getClinicalNoteRepository(): ClinicalNoteRepository {
  globalThis.__psivaultClinicalNoteRepository__ ??= createInMemoryClinicalRepository();
  return globalThis.__psivaultClinicalNoteRepository__;
}
```

### Pattern 4: Audit Helper — domain-specific wrapper

**What:** A thin wrapper around `createAuditEvent` from `src/lib/audit/events.ts`, exactly like `src/lib/appointments/audit.ts`.

```typescript
// src/lib/clinical/audit.ts
export type ClinicalNoteAuditEventType =
  | "clinical.note.created"
  | "clinical.note.updated";

// subject.kind = "clinical_note", subject.id = note.id
// metadata: { appointmentId } on create; { appointmentId, hadPreviousContent } on update
```

Sensitive fields (`freeText`, structured content) MUST NOT appear in audit metadata — consistent with the privacy contract established in `src/lib/appointments/audit.ts` (appointment IDs only, no patient data in subjects).

### Pattern 5: Server Action — create and update

**What:** Two actions following the exact `completeAppointmentAction` shape: read repo, call pure function, save, append audit event, `redirect()`.
**When to use:** Note creation (CLIN-01) and note editing (CLIN-04).

```typescript
// src/app/(vault)/sessions/[appointmentId]/actions.ts
"use server";

export async function createNoteAction(formData: FormData) {
  const repo = getClinicalNoteRepository();
  const audit = getAuditRepository();
  const now = new Date();
  // 1. Parse formData fields
  // 2. Guard: appointment must exist and be COMPLETED
  // 3. Guard: note must not already exist for this appointment
  // 4. Create note, save, append audit event
  // 5. redirect(`/patients/${patientId}`)
}

export async function updateNoteAction(formData: FormData) {
  const repo = getClinicalNoteRepository();
  const audit = getAuditRepository();
  const now = new Date();
  // 1. Parse formData fields (noteId, updated fields)
  // 2. Find existing note, guard against not found
  // 3. Apply update (set editedAt = now, updatedAt = now)
  // 4. Save, append audit event with type "clinical.note.updated"
  // 5. redirect(`/patients/${patientId}`)
}
```

### Pattern 6: Session Number Derivation

**What:** The session number ("Sessão 12") is derived from the appointment's position in the patient's full COMPLETED appointment history, sorted by `startsAt` ascending. The target appointment's 1-based index in that list is its session number.

```typescript
// Pure function — no external deps
export function deriveSessionNumber(
  targetAppointmentId: string,
  allPatientAppointments: Array<{ id: string; startsAt: Date; status: string }>,
): number | null {
  const completed = allPatientAppointments
    .filter((a) => a.status === "COMPLETED")
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const index = completed.findIndex((a) => a.id === targetAppointmentId);
  return index === -1 ? null : index + 1;
}
```

This function lives in `src/lib/clinical/model.ts` or a dedicated `src/lib/clinical/session-number.ts`.

### Pattern 7: Note Composer Page (CLIN-01, CLIN-02, CLIN-03)

**What:** Server component at `/sessions/[appointmentId]/note/page.tsx`.

Server-side: load appointment (guard COMPLETED status), load patient (for patientId context), load all patient appointments (for session number), load existing note if any (determines whether to render create or edit form).

Client boundary: The unsaved-draft guard (`beforeunload` event listener) requires a minimal `"use client"` wrapper component — similar to how `CompletedAppointmentNextSessionAction` isolates client interactivity. The form itself can remain a standard HTML form bound to a server action.

```typescript
// page.tsx (server component)
export default async function NoteComposerPage({ params }) {
  const { appointmentId } = await params;
  const appointment = appointmentRepo.findById(appointmentId, WORKSPACE_ID);
  if (!appointment || appointment.status !== "COMPLETED") notFound();
  const patient = patientRepo.findById(appointment.patientId, WORKSPACE_ID);
  if (!patient) notFound();
  const allAppointments = appointmentRepo.listByPatient(patient.id, WORKSPACE_ID);
  const sessionNumber = deriveSessionNumber(appointmentId, allAppointments);
  const existingNote = clinicalRepo.findByAppointmentId(appointmentId, WORKSPACE_ID);
  // render read-only header + NoteComposerForm (client component)
}
```

### Pattern 8: Clinical Timeline on Patient Profile (CLIN-05)

**What:** New `<ClinicalTimeline>` section added to `src/app/(vault)/patients/[patientId]/page.tsx`, below `QuickNextSessionCard`.

Data: `clinicalRepo.listByPatient(patient.id, WORKSPACE_ID)` gives notes; `appointmentRepo.listByPatient(patient.id, WORKSPACE_ID)` provides all appointments for the timeline.

Timeline entries show all appointments in reverse chronological order. COMPLETED appointments with a note link to `/sessions/[appointmentId]/note`. COMPLETED appointments without a note show the "Registrar evolução" action. CANCELED / NO_SHOW entries appear as muted context rows (Claude's discretion — recommended to include them for trajectory completeness).

### Anti-Patterns to Avoid

- **Importing patient/appointment domain types into clinical domain directly:** Use structural subsets (like `AppointmentForSummary`) to avoid circular dependencies — derive `AppointmentForClinical` in the clinical module if needed.
- **Storing free text in audit metadata:** Clinical content is sensitive data; audit events must reference note IDs only, never content.
- **Prefilling the textarea from previous notes:** Locked decision — writing area starts blank always.
- **Allowing note creation for non-COMPLETED appointments:** Guard in server action: appointment status must be COMPLETED before note can be created.
- **Creating duplicate notes per appointment:** Guard in `createNoteAction`: if `findByAppointmentId` returns an existing note, redirect to the edit path instead.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audit event creation | Custom audit logic | `createAuditEvent` from `src/lib/audit/events.ts` | Phase 1 contract, tested, redaction-aware |
| In-memory persistence | Custom Map wrapper | `createInMemoryClinicalRepository` following existing repository pattern | Consistent with appointment/patient repositories |
| Date formatting | Custom date-to-string | `Intl.DateTimeFormat` with `"pt-BR"` locale | Used throughout the app; correct locale handling |
| Rich text editor | Lexical, TipTap, Quill | Plain `<textarea>` | Locked decision: free text is a plain textarea; no rich text in Phase 3 |
| Form validation library | Zod, React Hook Form | Native HTML form + server-side guards | Consistent with appointment form pattern; no validation library in use |

**Key insight:** The clinical domain is structurally identical to the appointment domain — model, repository, store, audit, server action. Do not introduce new patterns or libraries for this phase.

---

## Common Pitfalls

### Pitfall 1: Duplicate note creation for the same appointment

**What goes wrong:** Professional clicks "Registrar evolução" multiple times or navigates to the note page for an appointment that already has a note, creating a second note row.
**Why it happens:** No guard on the create path.
**How to avoid:** In `createNoteAction`, call `findByAppointmentId` first. If a note exists, redirect to the edit page instead of creating a new one. In the note page server component, if an existing note is found, render the edit form pre-populated rather than a blank create form.
**Warning signs:** Duplicate entries in the clinical timeline for the same appointment date.

### Pitfall 2: Note page accessible for non-COMPLETED appointments

**What goes wrong:** A professional navigates directly to `/sessions/[appointmentId]/note` for a SCHEDULED appointment.
**Why it happens:** No server-side guard on appointment status.
**How to avoid:** In the page server component, `if (appointment.status !== "COMPLETED") notFound()`. This mirrors the guard pattern used in the patient archive page.

### Pitfall 3: Session number drift on re-ordering

**What goes wrong:** Session number "Sessão 12" is calculated at render time and can shift if appointments are backdated or imported.
**Why it happens:** `deriveSessionNumber` depends on all COMPLETED appointments sorted by `startsAt`; any change to history changes indices.
**How to avoid:** Accept this behavior for Phase 3 — the number is a display label, not a stored identifier. Do NOT store the session number in the note record itself (it would become stale).
**Warning signs:** Session number differs between agenda view and note page.

### Pitfall 4: Clinical content leaking into non-clinical surfaces

**What goes wrong:** Note text appears in patient list cards, search snippets, or appointment card tooltips.
**Why it happens:** `PatientOperationalSummary` or agenda cards accidentally include clinical fields.
**How to avoid:** The `ClinicalNote` model is never passed into patient list or agenda components. The clinical timeline is exclusively on the patient profile page. `PatientSummaryCards` does not render note text.

### Pitfall 5: `beforeunload` guard not working in Next.js App Router

**What goes wrong:** The unsaved-draft browser warning does not trigger when navigating via `<Link>` or `router.push()` in Next.js.
**Why it happens:** Next.js client-side navigation does not fire `beforeunload`; it fires its own navigation events.
**How to avoid:** Use the `useRouter` `beforePopState` hook (Next.js Pages Router approach) or intercept navigation with a custom client component using `window.addEventListener("beforeunload", ...)` for browser tab close, combined with a state-based "dirty" flag and a `<Link onClick>` confirmation dialog for in-app navigation. The simplest Phase 3 approach: use a `"use client"` `NoteComposerForm` component that tracks `isDirty` state and shows a browser-native `confirm()` dialog when the user clicks away via a link, while `beforeunload` handles tab close. This is a known limitation — document it in the plan.

### Pitfall 6: Appointment not found when accessing note from agenda

**What goes wrong:** After the agenda re-fetches on a different date, the appointmentId in the URL no longer resolves.
**Why it happens:** In-memory store resets between page loads in development hot-reload cycles.
**How to avoid:** This is a known Phase 3 limitation (in-memory persistence, no DB yet). The plan should acknowledge this and instruct testers to verify within a single server process session. The pattern is consistent with how appointment detail pages already work.

---

## Code Examples

Verified patterns from the existing codebase:

### Audit event for clinical domain

```typescript
// src/lib/clinical/audit.ts
// Pattern mirrors src/lib/appointments/audit.ts exactly.
import { createAuditEvent } from "../audit/events";
import type { AuditActor, AuditEvent } from "../audit/events";
import type { ClinicalNote } from "./model";

export type ClinicalNoteAuditEventType =
  | "clinical.note.created"
  | "clinical.note.updated";

const AUDIT_SUMMARIES: Record<ClinicalNoteAuditEventType, string> = {
  "clinical.note.created": "Evolução clínica registrada.",
  "clinical.note.updated": "Evolução clínica editada.",
};

export function createClinicalNoteAuditEvent(
  input: {
    type: ClinicalNoteAuditEventType;
    note: ClinicalNote;
    actor: AuditActor;
    metadata?: Record<string, unknown>;
  },
  deps: { now: Date; createId: () => string },
): AuditEvent {
  return createAuditEvent(
    {
      type: input.type,
      actor: input.actor,
      subject: { kind: "clinical_note", id: input.note.id },
      summary: AUDIT_SUMMARIES[input.type],
      // No clinical content in metadata — privacy baseline (SECU-05)
      metadata: { appointmentId: input.note.appointmentId, ...(input.metadata ?? {}) },
    },
    deps,
  );
}
```

### Store singleton

```typescript
// src/lib/clinical/store.ts
// Mirrors src/lib/appointments/store.ts exactly.
import { createInMemoryClinicalRepository } from "./repository";
import type { ClinicalNoteRepository } from "./repository";

declare global {
  var __psivaultClinicalNoteRepository__: ClinicalNoteRepository | undefined;
}

export function getClinicalNoteRepository(): ClinicalNoteRepository {
  globalThis.__psivaultClinicalNoteRepository__ ??= createInMemoryClinicalRepository();
  return globalThis.__psivaultClinicalNoteRepository__;
}
```

### Agenda card integration — "Registrar evolução" entry point

```typescript
// In agenda/page.tsx — build noteActions map for COMPLETED cards
// (mirrors nextSessionActions map pattern already in place)
const noteActions: Record<string, React.ReactNode> = {};
for (const appt of appointments) {
  if (appt.status !== "COMPLETED") continue;
  noteActions[appt.id] = (
    <Link href={`/sessions/${appt.id}/note`} style={registerNoteStyle}>
      Registrar evolução
    </Link>
  );
}
// Pass noteActions to AgendaDayView / AgendaWeekView alongside nextSessionActions
```

### Session number derivation (pure function)

```typescript
// src/lib/clinical/model.ts (or session-number.ts)
export function deriveSessionNumber(
  targetAppointmentId: string,
  allPatientAppointments: Array<{ id: string; startsAt: Date; status: string }>,
): number | null {
  const completed = allPatientAppointments
    .filter((a) => a.status === "COMPLETED")
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const index = completed.findIndex((a) => a.id === targetAppointmentId);
  return index === -1 ? null : index + 1;
}
```

### Read-only session metadata header

```typescript
// In note/page.tsx — render read-only header with session context
// All data comes from server-side query; no client state needed for header.
const sessionLabel = sessionNumber !== null
  ? `Sessão ${sessionNumber}`
  : "Consulta avulsa";
const dateLabel = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
}).format(appointment.startsAt);
const careModeLabel = appointment.careMode === "ONLINE" ? "Online" : "Presencial";
const durationLabel = `${appointment.durationMinutes} min`;
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate state for each form field with `useState` | Server actions with `<form action={serverAction}>` | Next.js 13+ App Router | No client-side form state management needed; use `formData.get()` in action |
| Client-side `fetch()` for persistence | `"use server"` + `redirect()` | Phase 1/2 established pattern | Actions are simpler, no API routes needed |
| Rich text editors for clinical notes | Plain `<textarea>` with `resize: vertical` | Locked decision | Simpler, faster, no dependency |

**Deprecated/outdated in this project:**
- Pages Router patterns (`getServerSideProps`, `getStaticProps`): Not used; this is App Router.
- Client-side form submission with `fetch`: Not used; server actions handle all mutations.

---

## Open Questions

1. **Unsaved-draft guard for in-app navigation**
   - What we know: `beforeunload` works for browser tab close; Next.js `<Link>` navigation does not trigger it.
   - What's unclear: Whether a `"use client"` `NoteComposerForm` with an `isDirty` state and `onClick` confirmation on navigation links is sufficient for Phase 3.
   - Recommendation: Implement `window.beforeunload` for tab close + a dirty-state `confirm()` dialog for in-app links inside `NoteComposerForm`. This is a "good enough for Phase 3" solution; the planner should scope this as a single contained task.

2. **Timeline density: show canceled/no-show appointments?**
   - What we know: Claude has discretion on this.
   - What's unclear: Whether muted "ghost" entries for canceled/no-show improve trajectory readability or add noise.
   - Recommendation: Include CANCELED and NO_SHOW entries as muted rows with a status chip. They represent clinical facts (patient did not attend) relevant to the trajectory. The professional can see the full picture without confusion. Link text is suppressed — no "Registrar evolução" for non-COMPLETED statuses.

3. **"Registrar evolução" label when note already exists**
   - What we know: A completed appointment can only have one note; the agenda card needs to distinguish "create note" from "view/edit note."
   - What's unclear: Whether the agenda card should check note existence at render time.
   - Recommendation: In `agenda/page.tsx`, query `getClinicalNoteRepository().listByPatient()` (or check all note appointment IDs) to build a `noteExistsSet`. Agenda cards then render "Ver evolução" (linking to the note page in read/edit mode) vs "Registrar evolução" (linking to the blank create form). This is O(appointments) and adds one repo call per agenda load — acceptable for Phase 3.

---

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json` — this section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.0.9 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run tests/clinical-domain.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CLIN-01 | Note created for COMPLETED appointment; duplicate creation redirects to edit | unit | `npx vitest run tests/clinical-domain.test.ts` | ❌ Wave 0 |
| CLIN-01 | Note creation blocked for non-COMPLETED appointment | unit | `npx vitest run tests/clinical-domain.test.ts` | ❌ Wave 0 |
| CLIN-02 | Note persists with only `freeText` filled; all structured fields null | unit | `npx vitest run tests/clinical-domain.test.ts` | ❌ Wave 0 |
| CLIN-03 | Note persists with all structured fields filled; individual fields nullable | unit | `npx vitest run tests/clinical-domain.test.ts` | ❌ Wave 0 |
| CLIN-04 | Edit sets `editedAt` and `updatedAt`; `createdAt` unchanged; audit event emitted | unit | `npx vitest run tests/clinical-domain.test.ts` | ❌ Wave 0 |
| CLIN-04 | Audit event type is `clinical.note.updated`; no clinical content in metadata | unit | `npx vitest run tests/clinical-domain.test.ts` | ❌ Wave 0 |
| CLIN-05 | `deriveSessionNumber` returns correct 1-based index for completed appointment | unit | `npx vitest run tests/clinical-session-number.test.ts` | ❌ Wave 0 |
| CLIN-05 | `deriveSessionNumber` returns null for appointment not in completed list | unit | `npx vitest run tests/clinical-session-number.test.ts` | ❌ Wave 0 |
| CLIN-05 | `listByPatient` returns notes sorted most recent first | unit | `npx vitest run tests/clinical-domain.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run tests/clinical-domain.test.ts tests/clinical-session-number.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/clinical-domain.test.ts` — covers CLIN-01, CLIN-02, CLIN-03, CLIN-04 (model, repository, audit event contract)
- [ ] `tests/clinical-session-number.test.ts` — covers CLIN-05 session number derivation
- [ ] No framework install needed — Vitest already configured

---

## Sources

### Primary (HIGH confidence)

- Codebase direct read: `src/lib/appointments/model.ts`, `repository.ts`, `store.ts`, `audit.ts` — domain module pattern confirmed
- Codebase direct read: `src/lib/audit/events.ts`, `repository.ts` — Phase 1 audit contract confirmed
- Codebase direct read: `src/app/(vault)/appointments/actions.ts` — server action pattern confirmed (`"use server"`, `redirect()`, globalThis audit repo)
- Codebase direct read: `src/app/(vault)/agenda/page.tsx` — `nextSessionActions` map pattern confirmed; how to add `noteActions` map alongside it
- Codebase direct read: `src/app/(vault)/patients/[patientId]/page.tsx` — patient profile page structure; where to add clinical timeline
- Codebase direct read: `src/lib/patients/summary.ts` — `AppointmentForSummary` structural subset pattern (avoid circular deps)
- Codebase direct read: `vitest.config.ts`, `tests/*.test.ts` — test infrastructure shape, import style, describe/it pattern
- `.planning/phases/03-clinical-record-core/03-CONTEXT.md` — all locked decisions and code context

### Secondary (MEDIUM confidence)

- Next.js App Router `beforeunload` limitation: documented behavior — client-side navigation does not trigger `beforeunload`; `"use client"` component with dirty-state guard is the established workaround.

### Tertiary (LOW confidence)

None — all findings are grounded in direct codebase inspection or confirmed Next.js behavior.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all confirmed by direct codebase read; no new libraries introduced
- Architecture: HIGH — exact mirror of existing appointment and patient domain patterns
- Pitfalls: HIGH — derived from existing code patterns and known Next.js App Router behavior
- Audit model recommendation: MEDIUM — Claude's discretion; single-version + editedAt is pragmatic for Phase 3; confirmed consistent with Phase 1 audit contract

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable stack; in-memory phase — low churn risk)
