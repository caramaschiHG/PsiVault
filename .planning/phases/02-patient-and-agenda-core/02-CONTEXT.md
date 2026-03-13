# Phase 2: Patient and Agenda Core - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 delivers the operational core after the vault foundation: patient registration, patient profile access, patient archival/recovery, appointment scheduling, recurrence, conflict handling, status transitions, daily/weekly agenda views, and a rapid next-session workflow from patient or completed-appointment context.

This phase clarifies how patients and agenda behavior should work inside the already defined solo-psychologist vault. It does not add clinical-note authoring, document generation, finance expansion, search, reminders, or new communication modules.

</domain>

<decisions>
## Implementation Decisions

### Patient intake and profile shape
- Patient creation should start with essential identity and contact fields first, with guardian, emergency contact, and important observations revealed only when relevant.
- The patient profile should open with identity first, not with an operations-heavy dashboard header.
- Social name should not replace the main legal name label by default; legal name leads, with social name shown as secondary context when present.
- Patient lists and search results should stay privacy-safe and minimal, showing identity plus at most one or two safe operational fields.

### Patient summary and archive behavior
- The operational summary should live immediately below the identity header, not in tabs and not hidden behind a drawer-first pattern.
- That summary should surface next/last session, payment state, pending items, and document count in one glance block.
- Important observations belong inside the patient profile/form only and should not leak into agenda, lists, or other secondary surfaces.
- Archived patients should leave active flows and live in a dedicated archive view with explicit recovery.
- When a patient is reactivated, the product should restore the record and open the patient profile immediately.

### Scheduling rules and appointment lifecycle
- Overlapping appointments should be hard-blocked in the normal save flow.
- Recurring weekly appointments should support the standard edit scopes: this occurrence, this and future occurrences, or the whole series.
- `Confirmed` is a real, explicit operational status and should not be collapsed away or made fully automatic.
- Reschedules and cancellations should preserve clear visible history in patient/appointment context, not only in hidden audit logs.

### Agenda workflow and quick rebooking
- The agenda should feel daily-first; weekly view is still required, but daily rhythm is the primary operating posture.
- Appointments in agenda views should read as clear blocks/cards with visible status and care-mode chips, not as dense spreadsheet rows.
- Care mode should be communicated with icon plus label so online vs presencial is fast to parse without ambiguity.
- Quick next-session creation should prefill the patient plus the most recent relevant operational defaults: duration, care mode, and price.
- Quick next-session should still ask the professional to choose the new date/time rather than silently assume one.

### Claude's Discretion
- Exact field ordering inside the essentials-first patient form.
- Exact wording and visual treatment of archive/recover actions.
- Exact composition of the operational summary cards/chips as long as identity stays first and the summary comes immediately after.
- Exact agenda spacing, typography, and block sizing.
- Exact UI treatment for recurrence edit-scope selection.

</decisions>

<specifics>
## Specific Ideas

- Patient surfaces should feel operationally useful without turning secondary lists into sensitive-data dumps.
- Identity should lead the patient profile, but operational context must still be visible within the first screenful.
- Agenda interaction should stay explicit and calm rather than clever or overly automated.
- Quick rebooking should save repetitive work by carrying forward the practical defaults from the last relevant context.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/setup/profile.ts` and the `PracticeProfile` model already hold default appointment duration, service modes, and default session price that Phase 2 can reuse for scheduling prefills.
- `src/app/(vault)/settings/profile/page.tsx` establishes a calm form/settings language and shows how practice defaults are already presented to the professional.
- `src/lib/audit/events.ts` and `src/lib/audit/repository.ts` provide the event contract needed for patient create/archive/restore and appointment state changes.
- `src/lib/logging/redaction.ts` already defines the privacy baseline secondary surfaces must respect when Phase 2 introduces patient-identifying data.

### Established Patterns
- Ownership stays workspace-scoped and explicit. New patient and appointment records should resolve through the Phase 1 account/workspace boundary rather than introducing a second ownership model.
- Secondary UI surfaces should remain privacy-safe and human-readable, consistent with the Phase 1 trust-surface decisions.
- The repository is a Next.js App Router + Prisma modular monolith, so patient and scheduling domains should extend the existing `src/lib/` and `src/app/` boundaries rather than inventing separate service layers.

### Integration Points
- Patient and appointment data should connect to the existing workspace and practice-profile defaults.
- Archive, restore, reschedule, cancel, no-show, confirm, and complete actions should plug into the existing audit/event foundation.
- Agenda and patient profile surfaces should inherit the same calm settings/setup visual language already established in Phase 1.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 2 scope.

</deferred>

---

*Phase: 02-patient-and-agenda-core*
*Context gathered: 2026-03-13*
