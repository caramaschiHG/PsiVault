# Phase 5: Finance and Assisted Operations - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 5 closes the operational office loop: the professional can track whether a session was paid (status, amount, payment method), view a patient's full charge history, see a monthly financial summary across all patients, store the online session link for ONLINE appointments, log remote-session issues, and open prefilled outbound messages (WhatsApp / email) for reminders, reschedules, and document delivery. This phase does NOT build a telehealth platform, payment processor integration, or automated messaging system — those are v2 scope.

</domain>

<decisions>
## Implementation Decisions

### Finance entry surface
- The primary surface for charge management is a **FinanceSection on the patient profile page**, positioned below DocumentsSection (following the established vertical structure: identity → summary → quick actions → clinical timeline → documents → finance).
- Charges are **auto-created when an appointment is marked COMPLETED**: a charge record is automatically initialized with status `pendente` and amount prefilled from the appointment's `priceInCents`. The professional does not need to take an explicit "create charge" action.
- Marking a charge opens a **full inline form / modal**: payment status (pago / pendente / atrasado), amount in R$, and payment method (Pix, transferência, dinheiro, outro). This captures FIN-01, FIN-02, and FIN-03 in one action.
- The FinanceSection on the patient profile shows the patient's full charge history (FIN-04) — all completed sessions with their charge status, amount, and method.

### Monthly finance view
- A **standalone `/financeiro` route** accessible from the main navigation covers FIN-05.
- Provides: month picker, list/table of charges for that month across all patients, and totals at the top (sessões concluídas, total recebido, total pendente).
- Phase 6 Dashboard (DASH-02) surfaces key metrics from this domain but does NOT duplicate the full monthly view — it links to `/financeiro` for detail.

### Online care (ONLN-01 to ONLN-03)
- **Claude's Discretion**: Researcher should investigate the best pattern for adding the online session link to an ONLINE appointment. Reasonable approach: a `meetingLink` optional field on the `Appointment` model, editable via an "Editar link" action on the appointment detail / agenda card for ONLINE appointments. Not a new full-page route — a small inline edit is sufficient.
- ONLN-02 (viewing care mode from agenda/patient context) is largely already implemented via `careMode: "IN_PERSON" | "ONLINE"` on the appointment model — this phase ensures the link is surfaced where the care mode is shown.
- ONLN-03 (remote-session issues): Claude's Discretion on the exact model — a simple free-text `remoteIssueNote` field on the appointment (set only for ONLINE, logged to audit) is acceptable if it meets the "register in appointment history" requirement.

### Assisted communication (COMM-01 to COMM-03)
- **Claude's Discretion**: All three COMM requirements are prefilled outbound message actions (WhatsApp `wa.me` deep links or `mailto:` links with subject/body). They do NOT require in-app messaging.
- Reasonable placement: a "Comunicação" group of action buttons on the appointment card in the agenda and on the appointment entry in the clinical timeline — surfaces where the professional has appointment context.
- Message templates are prefilled in Portuguese using patient name, appointment date/time, professional name, and relevant context (document link, online session link). The professional reviews and sends via their own WhatsApp / email app.
- COMM-03 (receipt/declaration/online-link delivery) should also be accessible from the DocumentsSection on the patient profile, where the document is already visible.

### Claude's Discretion
- Exact charge domain model (whether charges are stored as a separate `SessionCharge` entity or as additional fields on `Appointment`).
- Audit event schema for charge create/update actions.
- Visual treatment of the FinanceSection (list vs. card per session, color coding for status).
- Exact month navigation UX on the `/financeiro` route (prev/next arrows vs. dropdown).
- Portuguese copy for all labels, status names, and message templates.
- Whether `priceInCents: null` appointments (no price set) generate a charge record or show a "Sem valor definido" placeholder in the FinanceSection.

</decisions>

<specifics>
## Specific Ideas

- Auto-creating a charge on appointment completion mirrors how clinical notes behave: the system creates the record context automatically; the professional fills in the details. This is the lowest-friction finance model consistent with the product's real rhythm.
- The `/financeiro` route should feel like a clean monthly ledger — not a spreadsheet, not a dashboard widget. Month totals at a glance, then a scrollable list of sessions per patient with their status indicators.
- WhatsApp deep links are the primary assisted-communication vector because Brazilian psychologists use WhatsApp as the de-facto professional communication channel. `mailto:` is a secondary fallback.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/patients/summary.ts` → `FinancialStatus` type (`no_data | up_to_date | pending_payment | overdue`) and `derivePatientSummary` inputs already have a `financialStatus` slot — Phase 5 finance domain will hydrate this field on the patient profile.
- `src/lib/appointments/defaults.ts` → `priceInCents` already flows from practice profile → appointment defaults → quick-session card. The charge auto-creation uses this value as the default amount.
- `src/lib/appointments/model.ts` → `careMode: "IN_PERSON" | "ONLINE"` and `completedAt` timestamps are available for charge initialization and for filtering charges by month.
- `src/lib/audit/events.ts` + `src/lib/audit/repository.ts` → Charge create and update events extend the existing `AuditEvent` contract (same pattern as clinical and document events).
- `src/lib/documents/store.ts` (in-memory singleton pattern) → Finance domain creates `src/lib/finance/store.ts` following the same `globalThis.__psivault_finance__` pattern.

### Established Patterns
- Auto-created domain records on lifecycle transitions: charge on COMPLETED mirrors clinical note availability on appointment completion — consistent behavior model.
- In-memory repository singleton via `globalThis.__psivault*__` — no database in v1.
- Workspace-scoped ownership (`workspaceId`) — all charge records follow the same boundary.
- Server actions passed as props to client form components (Phase 3/4 pattern) — finance form server actions follow the same colocation approach.
- Privacy baseline (SECU-05): charge amounts and payment method must NOT appear in patient list surfaces or search snippets — only within the FinanceSection on the specific patient profile and the `/financeiro` route.

### Integration Points
- `src/app/(vault)/patients/[patientId]/page.tsx`: FinanceSection added below DocumentsSection. The page loads the finance repository alongside existing repositories.
- `src/lib/patients/summary.ts` → `derivePatientSummaryFromAppointments`: Phase 5 extends this to accept `financialStatus` derived from charge records, hydrating the `PatientSummaryCards` financial status indicator.
- `src/app/(vault)/agenda/` appointment cards: ONLINE appointments get an "Editar link" inline action and a "Comunicação" action group with prefilled message triggers.
- Main navigation: `/financeiro` route added as a new nav item (joining `/patients` and `/agenda`).
- `completeAppointment()` in `src/lib/appointments/model.ts`: charge auto-creation is triggered as a side effect from the server action that calls this function — not inside the domain model itself.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 5 scope.

</deferred>

---

*Phase: 05-finance-and-assisted-operations*
*Context gathered: 2026-03-14*
