# Phase 6: Retrieval, Recovery, and Launch Polish - Research

**Researched:** 2026-03-14
**Domain:** Next.js 15 / React 19 in-memory SaaS — reminders domain, global search, dashboard aggregation, JSON export/backup
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Dashboard home surface**
- Dashboard lives at a new `/inicio` route, added to the main navigation (joining Agenda · Patients · Financeiro · Settings).
- The professional lands here after login — it is the primary orientation screen.
- Sections displayed:
  1. Today's sessions — all appointments scheduled for today (time, patient name, care mode). Primary daily anchor.
  2. Active reminders — reminders due today or overdue, surfaced prominently. (Monthly snapshot key numbers also appear here per DASH-02: active patients, sessions completed this month, received vs. pending amounts.)
- Payment pendencies: shown as a count badge + link to `/financeiro` (e.g., "3 cobranças em aberto"). No amounts on the dashboard surface — SECU-05 compliant.
- Empty state: each section shows a friendly message + quick-action shortcut when empty. Professional is never left with a broken-looking screen.

**Reminders model and UX**
- A reminder has: title (required), optional due date, and an optional contextual link to a patient, appointment, document, or charge. Free-text, no mandatory linking.
- Creation entry points: the dashboard ("Nova lembrete" button) and each patient profile (quick-add in the reminders section). No other entry points in v1.
- Completion: completed reminders move to a collapsed "Concluídas" section below the active list. History is always accessible by expanding — never deleted. Vault posture preserved (TASK-03).
- No dedicated `/lembretes` route — reminders surface in two places only: dashboard (all active, across patients) and patient profile (patient-linked reminders only).

**Search scope and UX**
- Persistent search bar in the top navigation header — always accessible from anywhere in the app.
- Searchable domains (full SRCH-01 + SRCH-02 coverage): Patients (name/info), Sessions (patient name, date, context), Documents (type and patient name), Charges (patient name and status).
- Results presentation: grouped by type in a dropdown below the search bar — four groups: Pacientes · Sessões · Documentos · Cobranças. Each group shows up to 3 matches with a "Ver todos" expand link.
- Timing: real-time as you type, debounced at ~300ms. In-memory search; no server calls needed.

**Export and Backup/Recovery**
- Patient data export (SECU-03): per-patient JSON export triggered from the patient profile page. Contains all records for that patient: profile, appointments, clinical notes, document metadata, and charges.
- Workspace backup (SECU-04): full workspace JSON backup from Settings. A separate "Verificar backup" flow lets the professional re-upload a backup file and confirms it is valid and complete.
- Location: both features live under Settings → "Dados e Privacidade" — a new sub-section.
- Re-authentication required before generating any export or backup. Consistent with Phase 1 vault posture: 10-minute re-auth window + explicit confirmation flow.

### Claude's Discretion
- Exact layout and visual treatment of the `/inicio` dashboard (grid vs. stacked sections, card styles).
- Portuguese copy for all dashboard labels, empty-state messages, and quick-action button text.
- Reminder data model internals (whether due date stores as ISO string or Date, sort order logic).
- Search result snippet format per domain type (what metadata is shown for a session result vs. a document result).
- Exact JSON schema for patient export and workspace backup files.
- How "Verificar backup" validates the file (schema check, record count comparison, or both).
- Whether the monthly snapshot numbers on the dashboard are computed inline on the page or extracted via a shared utility.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within Phase 6 scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TASK-01 | Professional can create reminders linked to a patient, appointment, document, or payment | Reminders domain: new `src/lib/reminders/` following clinical/finance pattern; optional contextual link fields |
| TASK-02 | Dashboard highlights overdue payments, upcoming sessions, and pending follow-ups | `/inicio` page aggregates finance repo + appointment repo + reminder repo for today-anchored view |
| TASK-03 | Professional can mark reminders as complete without losing their history | Completed reminders use `completedAt` timestamp, never deleted; `listActive` vs `listCompleted` repository selectors |
| DASH-01 | Professional sees today's agenda, next appointments, reminders, and payment pendencies on home screen | Server component aggregates `listByDateRange(today)` + reminder active list + pending charge count |
| DASH-02 | Professional sees a simple monthly operational summary with active patients, completed sessions, received payments, and pending payments | Reuses `listActive(workspaceId)` count + `listByDateRange(month)` completed count + `deriveMonthlyFinancialSummary` across all patients |
| SRCH-01 | Professional can search patients quickly by name or identifying info | In-memory search across `listActive` + `listArchived`; `fullName.toLowerCase().includes(query)` pattern |
| SRCH-02 | Professional can find past sessions, documents, canceled appointments, and pending payments from search/navigation flows | Search merges results from patient, appointment, document, and finance repos; results grouped by domain type in dropdown |
| SECU-03 | Professional can export patient-related data when necessary | Per-patient JSON export action behind re-auth gate; serializes patient + appointments + clinical notes + documents + charges |
| SECU-04 | System provides a backup and recovery path for practice data with restore verification | Full workspace JSON backup + "Verificar backup" upload flow; file-input + JSON.parse + schema/record-count check |
</phase_requirements>

---

## Summary

Phase 6 is a pure integration and surface phase — it introduces no new domain data that previous phases haven't already modeled. The work is about wiring existing repositories into new surfaces (dashboard, global search, nav), adding one new domain (reminders), and implementing data governance flows (export/backup). Every pattern needed already exists in the codebase and is well-established.

The reminders domain is the only new `src/lib/` module. It mirrors the clinical/finance/document four-file pattern: `model.ts`, `repository.ts`, `store.ts`, `audit.ts`. The data model is simple: title, optional dueAt (Date | null), optional contextual link fields, completedAt (Date | null). The `listActive` selector excludes completed; `listCompleted` returns them for the history panel.

Global search is the most architecturally interesting piece. Because all data is in-memory, search is a pure function across all repositories — no debounce on the server, only on the client. The nav needs to be upgraded from a plain `<nav>` with `<a>` links to a layout that accepts a client-side search bar component. The search bar holds query state, calls a server action or inline function to gather all records, filters in-memory, and renders a grouped dropdown. The SECU-05 constraint is critical: results MUST NOT expose clinical content, amounts, or document content — only type, patient name, date, and a navigation link.

Export and backup are the most security-sensitive tasks. Both must gate behind the existing `evaluateSensitiveAction` / `SENSITIVE_ACTION_REAUTH_WINDOW_MS` flow from `src/lib/security/sensitive-actions.ts`. JSON export is a client-initiated download triggered by a `Response` with `Content-Disposition: attachment` or a Blob URL. Backup verification is a file-input + JSON.parse + structural validation — not a full semantic diff.

**Primary recommendation:** Build in this order: (1) reminders domain + domain tests, (2) `/inicio` dashboard page, (3) reminders on patient profile, (4) nav search bar, (5) export/backup under Settings.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | ^15.2.4 | App Router, server components, server actions | Already in use across all phases |
| React | ^19.0.0 | Client components, hooks for search state | Already in use |
| TypeScript | ^5.8.2 | Type safety across domain models | Already in use |
| Vitest | ^3.0.9 | Unit tests for domain model/repository | Already in use; `tests/` pattern established |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `globalThis.__psivault*__` | n/a | In-memory store singleton | Every new domain store; follows established pattern |
| `Intl.DateTimeFormat` | native | Portuguese date formatting | Date display in dashboard, search results |
| `Intl.NumberFormat` (pt-BR, BRL) | native | Currency display | Already in financeiro — avoid on dashboard (SECU-05) |
| `crypto.getRandomValues` | native | ID generation | Already used in all action files |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `globalThis` singleton | Server-side DB (Prisma) | Prisma schema exists but in-memory is the v1 pattern; do not introduce DB reads in this phase |
| In-memory search function | Lunr.js / Fuse.js | No external dependency needed; in-memory data is small; keep zero new production deps |
| `Response` with blob for download | Next.js Route Handler | Route handler approach is cleaner for file downloads in App Router; use `GET /api/export/patient/[id]` pattern |

**Installation:** No new production dependencies required.

---

## Architecture Patterns

### Recommended Project Structure

```
src/lib/reminders/
├── model.ts          # Reminder type, createReminder, completeReminder, linkTypes
├── repository.ts     # ReminderRepository interface + createInMemoryReminderRepository
├── store.ts          # globalThis.__psivaultReminders__ singleton
└── audit.ts          # createReminderAuditEvent (mirrors finance/audit.ts)

src/app/(vault)/
├── inicio/
│   └── page.tsx      # Dashboard — server component, aggregates all repos
├── settings/
│   ├── profile/      # (existing)
│   ├── security/     # (existing)
│   └── dados-e-privacidade/
│       ├── page.tsx  # Data & Privacy settings hub
│       └── components/
│           ├── patient-export-form.tsx     # Per-patient export trigger
│           ├── workspace-backup-button.tsx # Workspace backup trigger
│           └── verify-backup-form.tsx      # File upload + validation UI
├── patients/
│   └── [patientId]/
│       └── components/
│           └── reminders-section.tsx   # Patient-scoped reminder list + quick add

src/app/api/
├── export/
│   └── patient/[patientId]/route.ts    # GET: JSON download for patient export
└── backup/
    └── route.ts                         # GET: full workspace JSON backup
```

### Pattern 1: In-Memory Domain Module (Reminder)

**What:** Four-file domain module following the clinical/finance precedent.
**When to use:** Every new data entity in the in-memory phase.

```typescript
// src/lib/reminders/model.ts
export type ReminderLinkType = "patient" | "appointment" | "document" | "charge";

export interface ReminderLink {
  type: ReminderLinkType;
  id: string;
}

export interface Reminder {
  id: string;
  workspaceId: string;
  title: string;
  dueAt: Date | null;           // null = no due date
  link: ReminderLink | null;    // null = free-standing reminder
  completedAt: Date | null;     // null = active; Date = completed
  createdAt: Date;
  updatedAt: Date;
}

// Factory and update functions follow the createClinicalNote / updateClinicalNote pattern
```

```typescript
// src/lib/reminders/repository.ts
export interface ReminderRepository {
  save(reminder: Reminder): Reminder;
  findById(id: string, workspaceId: string): Reminder | null;
  listActive(workspaceId: string): Reminder[];
  listCompleted(workspaceId: string): Reminder[];
  listActiveByPatient(patientId: string, workspaceId: string): Reminder[];
  listCompletedByPatient(patientId: string, workspaceId: string): Reminder[];
}
```

```typescript
// src/lib/reminders/store.ts
declare global {
  var __psivaultReminders__: ReminderRepository | undefined;
}

export function getReminderRepository(): ReminderRepository {
  globalThis.__psivaultReminders__ ??= createInMemoryReminderRepository();
  return globalThis.__psivaultReminders__;
}
```

### Pattern 2: Dashboard Server Component Aggregation

**What:** Single server component page that loads from multiple repos and passes data as props.
**When to use:** The `/inicio` page aggregates four domains.

```typescript
// src/app/(vault)/inicio/page.tsx — server component
export default async function InicioPage() {
  const WORKSPACE_ID = "ws_1";
  const today = getTodayUTCMidnight();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  // Today's sessions
  const apptRepo = getAppointmentRepository();
  const todaySessions = apptRepo.listByDateRange(WORKSPACE_ID, today, tomorrow);

  // Patient name resolution
  const patientRepo = getPatientRepository();
  const activePatients = patientRepo.listActive(WORKSPACE_ID);
  const archivedPatients = patientRepo.listArchived(WORKSPACE_ID);
  const allPatients = [...activePatients, ...archivedPatients];

  // Active reminders (cross-patient)
  const reminderRepo = getReminderRepository();
  const activeReminders = reminderRepo.listActive(WORKSPACE_ID);

  // Payment pendencies count only (no amounts — SECU-05)
  const financeRepo = getFinanceRepository();
  // ... aggregate pending/atrasado counts

  // Monthly snapshot (DASH-02)
  const now = new Date();
  const monthlyCharges = getAllMonthlyCharges(financeRepo, allPatients, WORKSPACE_ID, now);
  const monthlySummary = deriveMonthlyFinancialSummary(monthlyCharges);

  return <InicioView ... />;
}
```

### Pattern 3: Client Search Bar in Nav

**What:** Nav upgrades from plain server-rendered links to a layout that includes a client search component. The search component uses `useState` + `useCallback` + debounced query, calls an inline async function to retrieve all searchable records, and renders a grouped dropdown.
**When to use:** Persistent global search (SRCH-01, SRCH-02).

**Key constraint:** `layout.tsx` is currently a server component. To add a client search bar, the nav portion must either become a client component or the search bar must be a separate client component embedded in an otherwise-server layout. The latter is cleaner and consistent with Next.js App Router conventions.

```typescript
// src/app/(vault)/layout.tsx — stays server component
import { SearchBar } from "./components/search-bar"; // 'use client'

export default function VaultLayout({ children }) {
  return (
    <div style={vaultShellStyle}>
      <nav style={navStyle}>
        {/* existing nav links */}
        <SearchBar /> {/* client component island */}
      </nav>
      {children}
    </div>
  );
}
```

```typescript
// src/app/(vault)/components/search-bar.tsx
"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { searchAllAction } from "../actions/search";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setResults(null); return; }
    debounceRef.current = setTimeout(async () => {
      const r = await searchAllAction(value);
      setResults(r);
    }, 300);
  }, []);

  // ... dropdown render
}
```

```typescript
// src/app/(vault)/actions/search.ts
"use server";
export async function searchAllAction(query: string): Promise<SearchResults> {
  // Read all repos, filter in-memory, return grouped results
  // Results MUST NOT include: clinical content, amounts, document body (SECU-05)
}
```

### Pattern 4: JSON Export via Route Handler

**What:** Next.js Route Handler returns a `Response` with `Content-Disposition: attachment; filename=...` header. The client triggers the download via an `<a>` tag with `href` pointing to the route.
**When to use:** SECU-03 patient export and SECU-04 workspace backup.

```typescript
// src/app/api/export/patient/[patientId]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const { patientId } = await params;
  // Load all patient data
  // Serialize to JSON
  const payload = JSON.stringify(patientExport, null, 2);
  return new Response(payload, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="paciente-${patientId}-export.json"`,
    },
  });
}
```

### Pattern 5: Backup Verification (Client-Side File Input)

**What:** A client component accepts a file input, reads the JSON via `FileReader`, parses and validates structure, shows confirmation or error.
**When to use:** "Verificar backup" flow (SECU-04).

```typescript
"use client";
// FileReader API — no external libraries
const reader = new FileReader();
reader.onload = (e) => {
  try {
    const data = JSON.parse(e.target!.result as string);
    const valid = validateBackupSchema(data); // local function
    setVerificationResult(valid ? "valid" : "invalid");
  } catch {
    setVerificationResult("parse_error");
  }
};
reader.readAsText(file);
```

### Anti-Patterns to Avoid

- **Exposing amounts in dashboard or search results:** `amountInCents` must NEVER appear outside `/financeiro` or the patient profile finance section. The dashboard shows only a count badge. Search results for charges show status label only (e.g., "Pendente"), never amounts.
- **Deleting completed reminders:** Never call `store.delete()` on a reminder. Use `completedAt` timestamp. The "Concluídas" section reads `listCompleted`.
- **Adding clinical note content to search results:** Search results for sessions show: patient name, date, care mode. Never `freeText`, `demand`, `observedMood`, or any structured field.
- **Making layout.tsx a client component:** The vault layout should remain a server component. Only the SearchBar island uses `"use client"`.
- **Importing `next/navigation` in server actions:** Use `revalidatePath` from `next/cache`, `redirect` from `next/navigation`. This is already established and must not regress.
- **Hardcoding workspace/account IDs in new files:** Follow the established `const WORKSPACE_ID = "ws_1"` stub pattern and note it as a stub for production replacement.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ID generation | Custom UUID library | `crypto.getRandomValues` buffer pattern (already in every action file) | Zero deps, consistent |
| Date formatting | Custom date formatter | `Intl.DateTimeFormat("pt-BR", ...)` | Already used throughout, handles pt-BR locale |
| Debounce | Lodash debounce | `setTimeout` + ref pattern (trivial for single use case) | No new deps |
| File download | Third-party | `Response` with `Content-Disposition` header via Route Handler | Built into Next.js |
| JSON schema validation | Zod/Yup | Simple structural check function: check required top-level keys + record count | Backup validation needs are minimal; no new dep justified |
| Search indexing | Lunr.js / Fuse.js | `string.toLowerCase().includes(query.toLowerCase())` across in-memory arrays | Data volume is trivially small in v1 |

**Key insight:** Phase 6 adds zero new production dependencies. Everything needed is already in the runtime (Web APIs, Next.js, React).

---

## Common Pitfalls

### Pitfall 1: SECU-05 Leakage in Search Results
**What goes wrong:** A developer adds `amountInCents` or `freeText` to the search result snippet because it makes the result more useful.
**Why it happens:** Natural instinct is to show more context. The security constraint is not enforced by the type system.
**How to avoid:** Define a `SearchResultItem` type that explicitly only allows safe fields: `id`, `type`, `patientName`, `date`, `label`, `href`. Never include clinical or financial content fields.
**Warning signs:** Any `SessionCharge.amountInCents`, `ClinicalNote.freeText`, `ClinicalNote.demand`, etc. appearing in a search result object.

### Pitfall 2: layout.tsx Client Boundary Breaks Server Data Loading
**What goes wrong:** Making `layout.tsx` a client component to accommodate the search bar, which then breaks server data loading for child pages.
**Why it happens:** Developer adds `"use client"` to layout to use `useState` for the search bar.
**How to avoid:** Keep layout as a server component. Extract only the `SearchBar` into a `"use client"` component island. The layout renders `<SearchBar />` as a server-side import.
**Warning signs:** `"use client"` appearing at the top of `src/app/(vault)/layout.tsx`.

### Pitfall 3: listByMonth Requires workspaceId + patientId Pair
**What goes wrong:** When aggregating monthly charges across all patients for DASH-02, calling `financeRepo.listByMonth(workspaceId, patientId, year, month)` for each patient works but requires iterating all patients.
**Why it happens:** The existing `listByMonth` is scoped to a single patient. No workspace-wide monthly selector exists.
**How to avoid:** Either iterate all patients (acceptable for in-memory v1), or add a `listByWorkspaceAndMonth(workspaceId, year, month)` selector to the finance repository before the dashboard page needs it. The latter is cleaner and should be done in Wave 1.
**Warning signs:** Calling `listByMonth` in a loop without exhausting all patients (`listActive` + `listArchived`).

### Pitfall 4: Re-auth Gate Missing on Export/Backup Actions
**What goes wrong:** Export or backup works without re-authentication, violating the vault posture.
**Why it happens:** Developer skips the `evaluateSensitiveAction` check for convenience.
**How to avoid:** The Route Handler for export/backup must check the re-auth window before serving the file. Use the existing `evaluateSensitiveAction` from `src/lib/security/sensitive-actions.ts`. The confirmation label pattern ("EXPORTAR" / "FAZER BACKUP") is already established.
**Warning signs:** Export route that doesn't call `evaluateSensitiveAction` or doesn't check `reauthVerifiedAt`.

### Pitfall 5: Reminder "Nova lembrete" — Gender Agreement
**What goes wrong:** The button reads "Nova lembrete" but "lembrete" is masculine in Portuguese — it should be "Novo lembrete".
**Why it happens:** The CONTEXT.md uses "Nova lembrete" — this is a copy error in the context discussion that should be corrected in implementation.
**How to avoid:** Use "Novo lembrete" in all UI surfaces. This is Claude's Discretion territory (Portuguese copy).
**Warning signs:** "Nova lembrete" appearing in the rendered UI.

### Pitfall 6: Dashboard Today Range Misses Late-Evening Sessions
**What goes wrong:** Using `today midnight UTC` to `today + 24h UTC` misses sessions scheduled for late evening in `America/Sao_Paulo` (UTC-3), which are at UTC+0 the next day.
**Why it happens:** UTC-midnight boundaries don't align with local calendar days.
**How to avoid:** Use the same ±1 day buffer pattern established in `agenda/page.tsx` — load `[today - 1day, today + 2days)` and filter by local date using `Intl.DateTimeFormat` with `timeZone: "America/Sao_Paulo"`. Or use `today midnight BRT` = `today midnight UTC + 3h` as the start boundary.
**Warning signs:** Sessions at 21:00, 22:00, 23:00 BRT not appearing on the dashboard.

---

## Code Examples

Verified patterns from existing codebase:

### Store Singleton Pattern

```typescript
// Source: src/lib/clinical/store.ts (established pattern)
declare global {
  var __psivaultClinicalNoteRepository__: ClinicalNoteRepository | undefined;
}

export function getClinicalNoteRepository(): ClinicalNoteRepository {
  globalThis.__psivaultClinicalNoteRepository__ ??= createInMemoryClinicalRepository();
  return globalThis.__psivaultClinicalNoteRepository__;
}
// Reminder store: __psivaultReminders__: ReminderRepository | undefined
```

### Server Action with revalidatePath

```typescript
// Source: src/app/(vault)/appointments/actions.ts
import { revalidatePath } from "next/cache";
// After mutation:
revalidatePath(`/patients/${charge.patientId}`);
// For reminders: revalidatePath("/inicio"); revalidatePath(`/patients/${reminder.patientId ?? ""}`);
```

### Today Date Range for Dashboard

```typescript
// Source: src/app/(vault)/agenda/page.tsx (adapted)
function getTodayUTCMidnight(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}
// For dashboard today's sessions:
const today = getTodayUTCMidnight();
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
const todaySessions = appointmentRepo.listByDateRange(WORKSPACE_ID, today, tomorrow);
// Then filter by America/Sao_Paulo local date for display accuracy
```

### deriveFinancialStatus (for dashboard badge)

```typescript
// Source: src/lib/finance/model.ts
export function deriveFinancialStatus(charges: SessionCharge[]): FinancialStatus {
  if (charges.length === 0) return "no_data";
  const hasOverdue = charges.some((c) => c.status === "atrasado");
  if (hasOverdue) return "overdue";
  const hasPending = charges.some((c) => c.status === "pendente");
  if (hasPending) return "pending_payment";
  return "up_to_date";
}
// For dashboard pending count: count charges where status === "pendente" || "atrasado"
// across ALL patients — not per-patient. Sum counts, do NOT expose amountInCents.
```

### Re-auth Check Pattern

```typescript
// Source: src/lib/security/sensitive-actions.ts
import { evaluateSensitiveAction, SENSITIVE_ACTION_REAUTH_WINDOW_MS } from "...";
// Before export/backup:
const decision = evaluateSensitiveAction({
  challenge,
  confirmationValue: formData.get("confirmation") as string,
  reauthVerifiedAt: /* from session */,
  now: new Date(),
});
if (!decision.allowed) {
  // Return error; do not serve file
}
```

### Patient Profile Page Multi-Repo Load Pattern

```typescript
// Source: src/app/(vault)/patients/[patientId]/page.tsx
// Each domain repo is loaded independently, data is passed to presentational sections as props:
const clinicalRepo = getClinicalNoteRepository();
const docRepo = getDocumentRepository();
const financeRepo = getFinanceRepository();
// Phase 6 adds:
const reminderRepo = getReminderRepository();
const patientReminders = {
  active: reminderRepo.listActiveByPatient(patient.id, WORKSPACE_ID),
  completed: reminderRepo.listCompletedByPatient(patient.id, WORKSPACE_ID),
};
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Nav as plain server links | Nav with client search bar island | Phase 6 | Layout needs to embed `"use client"` SearchBar without becoming a client component itself |
| Settings with profile + security only | Settings with third section "Dados e Privacidade" | Phase 6 | New sub-route; follows existing `settings/security/page.tsx` structural precedent |

**No deprecated patterns are being introduced.** This phase extends the established patterns without changing them.

---

## Open Questions

1. **Finance repository lacks a workspace-wide monthly selector**
   - What we know: `listByMonth(workspaceId, patientId, year, month)` is per-patient.
   - What's unclear: Whether to add `listByWorkspaceAndMonth` or iterate all patients at the page level.
   - Recommendation: Add `listByWorkspaceAndMonth(workspaceId, year, month): SessionCharge[]` to `SessionChargeRepository` and `createInMemorySessionChargeRepository`. This is a clean extension and simplifies DASH-02 aggregation.

2. **Export route re-auth session persistence**
   - What we know: `evaluateSensitiveAction` requires `reauthVerifiedAt: Date | null`. There is no real session store yet — workspace stub uses `ws_1`.
   - What's unclear: How to pass `reauthVerifiedAt` to the Route Handler GET request without a real session.
   - Recommendation: For v1, implement re-auth as a two-step form action: (1) server action validates re-auth + confirmation and sets a short-lived cookie or flag; (2) Route Handler checks the cookie before serving the file. Mark as a stub for production session integration.

3. **Search server action vs. inline client-side filtering**
   - What we know: All data is in-memory on the server process. The client cannot access the in-memory store directly.
   - What's unclear: Whether to use a server action (`"use server"`) or a Route Handler (`GET /api/search?q=...`) for search.
   - Recommendation: Use a server action (`searchAllAction(query: string): Promise<SearchResults>`). Server actions called from client components are the established pattern in this codebase (e.g., `updateChargeAction` passed as prop). Simpler than a Route Handler for this case.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.0.9 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |
| Test location | `tests/**/*.test.ts` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TASK-01 | `createReminder` factory sets correct defaults; link fields stored correctly | unit | `pnpm test -- --reporter=verbose tests/reminder-domain.test.ts` | ❌ Wave 0 |
| TASK-03 | `completeReminder` sets `completedAt`; completed reminders excluded from `listActive`; included in `listCompleted` | unit | `pnpm test -- --reporter=verbose tests/reminder-domain.test.ts` | ❌ Wave 0 |
| TASK-02 | Dashboard pending count derived from finance charges; overdue count correct | unit | `pnpm test -- --reporter=verbose tests/dashboard-aggregation.test.ts` | ❌ Wave 0 |
| DASH-01 | Today's sessions filtered correctly by UTC date range | unit | `pnpm test -- --reporter=verbose tests/dashboard-aggregation.test.ts` | ❌ Wave 0 |
| DASH-02 | Monthly snapshot counts (active patients, sessions, received, pending) computed correctly across multiple patients | unit | `pnpm test -- --reporter=verbose tests/dashboard-aggregation.test.ts` | ❌ Wave 0 |
| SRCH-01 | Patient search returns matches for partial name; excludes non-matching patients | unit | `pnpm test -- --reporter=verbose tests/search-domain.test.ts` | ❌ Wave 0 |
| SRCH-02 | Search across sessions, documents, and charges; results grouped correctly; no clinical content in results (SECU-05) | unit | `pnpm test -- --reporter=verbose tests/search-domain.test.ts` | ❌ Wave 0 |
| SECU-03 | Patient export serializer includes all required fields; no extra sensitive fields | unit | `pnpm test -- --reporter=verbose tests/export-backup.test.ts` | ❌ Wave 0 |
| SECU-04 | Backup serializer produces valid structure; `validateBackupSchema` accepts valid and rejects malformed files | unit | `pnpm test -- --reporter=verbose tests/export-backup.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/reminder-domain.test.ts` — covers TASK-01, TASK-03 (model + repository)
- [ ] `tests/dashboard-aggregation.test.ts` — covers TASK-02, DASH-01, DASH-02 (aggregation utilities)
- [ ] `tests/search-domain.test.ts` — covers SRCH-01, SRCH-02 (search function + SECU-05 guard)
- [ ] `tests/export-backup.test.ts` — covers SECU-03, SECU-04 (serializer + validator)

---

## Sources

### Primary (HIGH confidence)

- Direct codebase inspection — `src/lib/clinical/`, `src/lib/finance/`, `src/lib/security/sensitive-actions.ts`, `src/lib/appointments/repository.ts`, `src/lib/patients/repository.ts`, `src/lib/audit/repository.ts`, `src/lib/documents/repository.ts`
- Direct codebase inspection — `src/app/(vault)/layout.tsx`, `src/app/(vault)/agenda/page.tsx`, `src/app/(vault)/patients/[patientId]/page.tsx`, `src/app/(vault)/appointments/actions.ts`
- Direct codebase inspection — `vitest.config.ts`, `package.json`, `tests/` directory listing
- `.planning/phases/06-retrieval-recovery-and-launch-polish/06-CONTEXT.md` — locked decisions and code insights

### Secondary (MEDIUM confidence)

- Next.js App Router documentation pattern for client component islands in server layouts — consistent with established Next.js 15 conventions verified by codebase behavior
- `Content-Disposition: attachment` header for file download via Route Handler — standard HTTP pattern, widely documented

### Tertiary (LOW confidence)

None — all findings grounded in direct codebase inspection or well-established platform APIs.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new deps; all libraries already in use
- Architecture patterns: HIGH — all patterns are extensions of existing codebase patterns with direct code evidence
- Pitfalls: HIGH — derived from direct codebase inspection (SECU-05 policy, UTC date handling, layout boundary)
- Validation architecture: HIGH — Vitest config and test directory structure confirmed directly

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable stack; in-memory pattern unlikely to change before launch)
