# Phase 3: Clinical Record Core - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 makes the product clinically useful: after a session is marked as completed, the professional can record clinical evolution using free text and optional structured helpers, edit the note with traceability preserved, and later see the patient's full trajectory in a chronological timeline. Document generation, finance, and search are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Note composition layout
- Free text is the primary and leading element — the main textarea appears at the top of the note composer.
- Optional structured fields (demanda/queixa, humor observado, temas trabalhados, evolução clínica, próximos passos) appear below the free text area, always visible, clearly secondary.
- No progressive disclosure, no toggles — the structured section is always shown as optional fields with placeholder text indicating they can be left blank.
- All structured fields are free-text inputs (short textarea or text input) — no dropdowns, no predefined vocabulary, no chip/scale pickers. The professional writes what they want.

### Note context and prefill
- When the note opens, the session metadata appears as a read-only header: date, session number (e.g., "Sessão 12"), duration, and care mode (presencial/online).
- The writing area starts blank — no content is prefilled from previous sessions.
- The session number context is derived from the appointment's position in the patient's appointment history.

### Note entry flow
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

</decisions>

<specifics>
## Specific Ideas

- The note should feel like writing in a clinical notebook, not filling a hospital form — free text leads, structure supports.
- The page-route approach is consistent with the rest of the app's "focused task = full route" pattern established in phases 1 and 2.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/audit/events.ts` + `src/lib/audit/repository.ts`: Clinical note create and edit events should extend this existing event contract (same `AuditEvent` shape, same `AuditActor`/`AuditSubject` types).
- `src/lib/appointments/model.ts`: `COMPLETED` status is the entry trigger for note creation. The `Appointment` interface provides `id`, `patientId`, `workspaceId`, `startsAt`, `durationMinutes`, `careMode`, `completedAt` — all usable as note header context.
- `src/lib/appointments/repository.ts` + `src/lib/patients/repository.ts`: Note pages will follow the same workspace-scoped, in-memory repository pattern for Phase 3, with a new `src/lib/clinical/` module.
- `src/lib/patients/summary.ts` (`derivePatientSummaryFromAppointments`): Phase 3 will extend or supplement this to include the clinical record count and last note date in the patient operational summary.

### Established Patterns
- Ownership is workspace-scoped (`workspaceId`) — clinical records follow the same boundary.
- Full-page routes for focused tasks: `/appointments/new`, `/sessions/[id]/note` fits this pattern naturally.
- In-memory repository with a `store.ts` singleton: `src/lib/clinical/store.ts` will follow this pattern for Phase 3.
- Privacy baseline from Phase 1: clinical content must not appear in patient list surfaces, search snippets, or secondary cards — only inside the patient's own clinical context.
- Audit events are fire-and-forget from server actions; Phase 3 clinical note events follow the same contract.

### Integration Points
- Agenda page (`src/app/(vault)/agenda/`) — completed appointment cards need a "Registrar evolução" action that links to `/sessions/[appointmentId]/note`.
- Patient profile page (`src/app/(vault)/patients/[patientId]/page.tsx`) — after note save, this is the landing destination. The timeline section (CLIN-05) will be added as a new section on this page.
- `PatientSummaryCards` or adjacent component — may need to surface the presence of a session note on the operational summary.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 3 scope.

</deferred>

---

*Phase: 03-clinical-record-core*
*Context gathered: 2026-03-14*
