# Phase 6: Retrieval, Recovery, and Launch Polish - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 6 completes the product for launch. It delivers: (a) a home dashboard that orients the professional immediately on opening the app, (b) reminders/tasks linked to patients, appointments, documents, or payments — with preserved completion history, (c) global search across patients, sessions, documents, and charges from the nav bar, and (d) per-patient data export (SECU-03) and a full workspace backup/restore verification flow (SECU-04). Everything is hardened for first real users. This phase does NOT add new clinical, scheduling, finance, or document capabilities — those domains are complete.

</domain>

<decisions>
## Implementation Decisions

### Dashboard home surface
- Dashboard lives at a new **`/inicio` route**, added to the main navigation (joining Agenda · Patients · Financeiro · Settings).
- The professional lands here after login — it is the primary orientation screen.
- **Sections displayed:**
  1. **Today's sessions** — all appointments scheduled for today (time, patient name, care mode). Primary daily anchor.
  2. **Active reminders** — reminders due today or overdue, surfaced prominently. (Monthly snapshot key numbers also appear here per DASH-02: active patients, sessions completed this month, received vs. pending amounts.)
- **Payment pendencies**: shown as a count badge + link to `/financeiro` (e.g., "3 cobranças em aberto"). No amounts on the dashboard surface — SECU-05 compliant.
- **Empty state**: each section shows a friendly message + quick-action shortcut when empty (e.g., "Nenhuma sessão hoje — Agendar consulta"). Professional is never left with a broken-looking screen.

### Reminders model and UX
- A reminder has: **title (required)**, **optional due date**, and an **optional contextual link** to a patient, appointment, document, or charge. Free-text, no mandatory linking.
- **Creation entry points**: the dashboard ("Nova lembrete" button) and each patient profile (quick-add in the reminders section). No other entry points in v1.
- **Completion**: completed reminders move to a collapsed **"Concluídas"** section below the active list. History is always accessible by expanding — never deleted. Vault posture preserved (TASK-03).
- **No dedicated `/lembretes` route** — reminders surface in two places only: dashboard (all active, across patients) and patient profile (patient-linked reminders only).

### Search scope and UX
- **Persistent search bar in the top navigation header** — always accessible from anywhere in the app.
- **Searchable domains (full SRCH-01 + SRCH-02 coverage)**:
  - Patients — by name or identifying info
  - Sessions — by patient name, date, or appointment context
  - Documents — by type and patient name
  - Charges — by patient name and status (pendente/atrasado)
- **Results presentation**: grouped by type in a **dropdown below the search bar** — four groups: Pacientes · Sessões · Documentos · Cobranças. Each group shows up to 3 matches with a "Ver todos" expand link.
- **Timing**: **real-time as you type**, debounced at ~300ms. In-memory search is cheap; no performance risk.
- Search runs against the in-memory store — no server calls needed for the in-memory v1 data.

### Export and Backup/Recovery
- **Patient data export (SECU-03)**: per-patient JSON export triggered from the patient profile page. Contains all records for that patient: profile, appointments, clinical notes, document metadata, and charges.
- **Workspace backup (SECU-04)**: full workspace JSON backup available from Settings. A separate "Verificar backup" flow lets the professional re-upload a backup file and confirms it is valid and complete — making the vault positioning credible at launch.
- **Location**: both features live under **Settings → "Dados e Privacidade"** — a new sub-section separate from profile and security settings. Groups all data governance in one place consistent with the vault trust surface.
- **Re-authentication required** before generating any export or backup (patient export and workspace backup both). Consistent with Phase 1 vault posture: sensitive data operations use the existing 10-minute re-auth window + explicit confirmation flow.

### Claude's Discretion
- Exact layout and visual treatment of the `/inicio` dashboard (grid vs. stacked sections, card styles).
- Portuguese copy for all dashboard labels, empty-state messages, and quick-action button text.
- Reminder data model internals (whether due date stores as ISO string or Date, sort order logic).
- Search result snippet format per domain type (what metadata is shown for a session result vs. a document result).
- Exact JSON schema for patient export and workspace backup files.
- How "Verificar backup" validates the file (schema check, record count comparison, or both).
- Whether the monthly snapshot numbers on the dashboard are computed inline on the page or extracted via a shared utility.

</decisions>

<specifics>
## Specific Ideas

- The `/inicio` dashboard is where the professional's day starts — it should feel calm and oriented, not alarming. Overdue items surface as counts, not as big red warnings. The professional can navigate to details from there.
- The "Concluídas" section for reminders should feel like a logbook entry — done things don't disappear, they settle into a history section below the active work.
- Grouped search dropdown mirrors how professionals think: "I'm looking for a patient" or "I need a document" — the type grouping makes results instantly scannable without reading everything.
- Backup/restore verification is the final vault credibility signal: the professional should be able to feel that their data is safe to download, portable, and verifiable. The verify flow is what separates "download JSON" from an actual recovery posture.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/appointments/repository.ts` → `listByDateRange(workspaceId, from, to)`: powers "today's sessions" on the dashboard (date range = today midnight to today end).
- `src/lib/patients/repository.ts` → `listActive(workspaceId)` + `listArchived(workspaceId)`: aggregate for monthly snapshot (active patient count) and for search across all patients.
- `src/lib/finance/repository.ts` → `listByPatient` + `listByMonth`: pending/overdue charge count for dashboard badge and for monthly snapshot totals.
- `src/lib/finance/model.ts` → `deriveFinancialStatus(charges)`: existing `FinancialStatus` derivation (`overdue | pending_payment | up_to_date | no_data`) — reusable for payment badge count.
- `src/lib/clinical/repository.ts` → `listByPatient`: clinical notes searchable by patient context.
- `src/lib/documents/repository.ts` → `listActiveByPatient`: documents searchable by type and patient.
- `src/lib/audit/repository.ts` → `listForWorkspace`: available for export/backup to include audit trail in JSON output.
- Phase 1 re-auth flow (sensitive action 10-minute window + confirmation): export and backup gate behind the same re-auth mechanism already in place.

### Established Patterns
- In-memory singleton via `globalThis.__psivault*__` — reminder store follows the same pattern as clinical, document, and finance stores: `src/lib/reminders/store.ts`.
- Workspace-scoped ownership (`workspaceId`) — all reminder records follow the same boundary.
- Server actions passed as props to client components — reminder form server actions follow the same colocation approach.
- Privacy baseline (SECU-05): search results must NOT expose clinical content, payment amounts, or document content — only type, patient name, date, and a navigation link.
- Soft archive / vault posture: completed reminders are never deleted; history is always accessible.

### Integration Points
- `src/app/(vault)/layout.tsx`: Add `/inicio` to the main navigation (new first nav item, or after the existing first item).
- `src/app/(vault)/inicio/page.tsx` (new): loads today's appointments, active reminders, and monthly snapshot stats in one server component page.
- `src/app/(vault)/patients/[patientId]/page.tsx`: Add reminders quick-add section and patient-scoped reminder list below (or above) the existing DocumentsSection and FinanceSection.
- Navigation header component: Add search bar as a persistent element in the nav, replacing or augmenting the current plain link strip.
- `src/app/(vault)/settings/`: Add a new "Dados e Privacidade" route/section with patient export and workspace backup flows.
- `src/lib/reminders/` (new domain): `model.ts`, `store.ts`, `repository.ts` following the established clinical/finance pattern.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 6 scope.

</deferred>

---

*Phase: 06-retrieval-recovery-and-launch-polish*
*Context gathered: 2026-03-14*
