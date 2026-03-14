# Phase 5: Finance and Assisted Operations - Research

**Researched:** 2026-03-14
**Domain:** In-memory finance domain, WhatsApp/email deep links, inline appointment editing, new standalone route
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- The primary surface for charge management is a **FinanceSection on the patient profile page**, positioned below DocumentsSection.
- Charges are **auto-created when an appointment is marked COMPLETED**: initialized with status `pendente` and amount prefilled from `priceInCents`. The professional does not take an explicit "create charge" action.
- Marking a charge opens a **full inline form / modal**: payment status (pago / pendente / atrasado), amount in R$, and payment method (Pix, transferência, dinheiro, outro).
- FinanceSection shows the patient's full charge history (all completed sessions with charge status, amount, method).
- A **standalone `/financeiro` route** accessible from the main navigation covers FIN-05 with month picker, list/table of charges across all patients for that month, and totals (sessões concluídas, total recebido, total pendente).
- Phase 6 Dashboard (DASH-02) links to `/financeiro` for detail — it does NOT duplicate the monthly view.
- ONLN-02 (care mode visibility) is largely already implemented via `careMode` on Appointment — this phase ensures the link is surfaced where care mode is shown.
- ONLN-03: a simple free-text `remoteIssueNote` field on the appointment (ONLINE only, logged to audit) is acceptable.
- All three COMM requirements are prefilled outbound message actions (WhatsApp `wa.me` deep links or `mailto:` links). No in-app messaging.
- COMM action buttons placed on the appointment card in the agenda and on the appointment entry in the clinical timeline.
- Message templates use patient name, appointment date/time, professional name, and relevant context (document link, online session link) in Portuguese.
- COMM-03 also accessible from DocumentsSection on the patient profile.

### Claude's Discretion

- Exact charge domain model: separate `SessionCharge` entity vs. additional fields on `Appointment`.
- Audit event schema for charge create/update actions.
- Visual treatment of the FinanceSection (list vs. card per session, color coding for status).
- Exact month navigation UX on the `/financeiro` route (prev/next arrows vs. dropdown).
- Portuguese copy for all labels, status names, and message templates.
- Whether `priceInCents: null` appointments generate a charge record or show "Sem valor definido" placeholder.
- Best pattern for adding the online session link to an ONLINE appointment (recommended: `meetingLink` optional field on Appointment, editable via "Editar link" inline action on appointment detail/agenda card for ONLINE appointments).

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within Phase 5 scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FIN-01 | Professional can define session price by appointment or patient context | Auto-created charge from `priceInCents` on Appointment; charge update form allows editing the amount |
| FIN-02 | Professional can mark a charge as paid, pending, due today, or overdue | `ChargeStatus` enum on `SessionCharge`; inline charge form; status derived from charge data |
| FIN-03 | Professional can record payment method including Pix, bank transfer, cash, or other | `paymentMethod` field on `SessionCharge`; captured in same inline charge form as FIN-02 |
| FIN-04 | Professional can view the patient's payment history and outstanding balances | FinanceSection on patient profile page; reads all SessionCharge records for patient |
| FIN-05 | Professional can view a monthly summary of sessions completed, amounts received, and amounts pending | Standalone `/financeiro` route with month picker; aggregates charges by month across all patients |
| ONLN-01 | Professional can store the online session link associated with an appointment | `meetingLink` optional field added to Appointment model; editable via inline action for ONLINE appointments |
| ONLN-02 | Professional can view whether an appointment is online or in-person from agenda and patient context | Already implemented via `careMode`; phase ensures `meetingLink` is surfaced alongside care mode chip |
| ONLN-03 | Professional can register remote-session issues in the appointment history | `remoteIssueNote` free-text field on Appointment (ONLINE only); audited on save |
| COMM-01 | Professional can open a prefilled reminder or confirmation message for a patient | WhatsApp `wa.me` deep link with prefilled message template; placed on agenda appointment card |
| COMM-02 | Professional can open a prefilled reschedule or cancellation message from appointment context | WhatsApp deep link for reschedule/cancel context; placed on agenda card and clinical timeline |
| COMM-03 | Professional can open a prefilled message to send receipt, declaration, or online-session link | Deep link accessible from DocumentsSection on patient profile; includes document type and meeting link context |
</phase_requirements>

---

## Summary

Phase 5 introduces three new capability clusters onto a codebase that has already proven its core patterns: in-memory repositories with `globalThis` singleton, domain model pure functions with dependency injection, server actions with `redirect`, and pure presentational server components receiving all data via props.

The finance domain is the most substantial new addition. It requires a new `SessionCharge` domain model, repository, store, and server actions — all following the Phase 4 document domain shape exactly. Charge auto-creation happens as a side effect inside the `completeAppointmentAction` server action rather than in the domain model itself. The FinanceSection on the patient profile page and the standalone `/financeiro` route are two new UI surfaces that consume charge data.

The online care and communication additions are lower scope: two optional fields added to the `Appointment` model (`meetingLink`, `remoteIssueNote`) with a small inline edit form, plus action button groups rendered conditionally on appointment cards that open prefilled `wa.me` or `mailto:` URLs in the browser. These require no new repositories — they extend the existing appointment model, store, and actions.

**Primary recommendation:** Model `SessionCharge` as a separate entity (not fields on Appointment) so the finance domain can evolve independently, the repository contract stays clean, and the `/financeiro` monthly view can query charges independently without touching the appointment repository.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | ^15.2.4 | Routing, Server Actions, server components | Already in use — all patterns established |
| React 19 | ^19.0.0 | UI components | Project baseline |
| TypeScript | ^5.8.2 | Type safety | Project baseline |
| Vitest | ^3.0.9 | Unit tests | Already configured at `vitest.config.ts` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `Intl.NumberFormat` | Native | Format R$ currency amounts | All charge amount display |
| `Intl.DateTimeFormat` | Native | Format dates in pt-BR | All date labels |
| `wa.me` URL scheme | Web standard | WhatsApp deep link | COMM-01, COMM-02, COMM-03 |
| `mailto:` URL scheme | Web standard | Email fallback | COMM-01, COMM-02, COMM-03 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Separate SessionCharge entity | Fields on Appointment | Fields on Appointment couples finance queries to the appointment repository and makes the monthly view harder to implement cleanly |
| `wa.me` deep link (opens WhatsApp) | In-app message composer | Deep link matches product scope — no messaging infrastructure needed |
| Month prev/next arrows | Dropdown month picker | Arrows are simpler to implement and match the agenda toolbar pattern already in the codebase |

**Installation:** No new packages needed. All capabilities use existing dependencies.

---

## Architecture Patterns

### Recommended Project Structure

```
src/lib/finance/
├── model.ts           # SessionCharge entity, create/update pure functions
├── repository.ts      # SessionChargeRepository interface + in-memory impl
├── store.ts           # globalThis.__psivaultFinance__ singleton
└── audit.ts           # createChargeAuditEvent helper

src/app/(vault)/
├── financeiro/
│   └── page.tsx       # Monthly summary route — new nav destination
└── patients/[patientId]/
    └── components/
        └── finance-section.tsx    # FinanceSection component

src/app/(vault)/appointments/
└── actions.ts         # Extended: charge auto-creation in completeAppointmentAction
                       # New: updateChargeAction, editMeetingLinkAction, addRemoteIssueNoteAction
```

### Pattern 1: Finance Domain Model (SessionCharge as Separate Entity)

**What:** `SessionCharge` is its own aggregate with `appointmentId` as a foreign key. It is not embedded in the `Appointment` record.
**When to use:** Always — this is the locked architectural choice.
**Example:**

```typescript
// src/lib/finance/model.ts

export type ChargeStatus = "pendente" | "pago" | "atrasado";
export type PaymentMethod = "pix" | "transferencia" | "dinheiro" | "outro" | null;

export interface SessionCharge {
  id: string;
  workspaceId: string;
  patientId: string;
  appointmentId: string;          // FK to Appointment — 1:1 relationship
  status: ChargeStatus;
  amountInCents: number | null;   // null when appointment had no priceInCents
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
  paidAt: Date | null;            // set when status transitions to "pago"
}
```

### Pattern 2: Charge Auto-Creation Side Effect in Server Action

**What:** When `completeAppointmentAction` transitions an appointment to COMPLETED, it immediately creates a `SessionCharge` with status `pendente` and amount from `priceInCents`. This is a side effect in the action, not in the domain model.
**When to use:** Always — mirrors the clinical note availability pattern (Phase 3).
**Example:**

```typescript
// Inside completeAppointmentAction (src/app/(vault)/appointments/actions.ts)
// After repo.save(completed):

import { getFinanceRepository } from "../../../lib/finance/store";
import { createSessionCharge } from "../../../lib/finance/model";

const financeRepo = getFinanceRepository();
const charge = createSessionCharge(
  {
    workspaceId: DEFAULT_WORKSPACE_ID,
    patientId: existing.patientId,
    appointmentId: existing.id,
    amountInCents: existing.priceInCents ?? null,  // null if no price set
  },
  { now, createId: generateId },
);
financeRepo.save(charge);
// audit.append(createChargeAuditEvent(...))
```

**Note:** The `priceInCents` field must be added to the `Appointment` model in this phase (it was reserved in Phase 2 but `priceInCents: null` was hardcoded in the page and defaults). The appointment creation form already accepts it via URL param but does not forward it to the model.

### Pattern 3: Finance Store (globalThis Singleton)

**What:** Mirrors `src/lib/documents/store.ts` exactly.
**Example:**

```typescript
// src/lib/finance/store.ts
import { createInMemorySessionChargeRepository } from "./repository";
import type { SessionChargeRepository } from "./repository";

declare global {
  var __psivaultFinance__: SessionChargeRepository | undefined;
}

export function getFinanceRepository(): SessionChargeRepository {
  globalThis.__psivaultFinance__ ??= createInMemorySessionChargeRepository();
  return globalThis.__psivaultFinance__;
}
```

### Pattern 4: SessionChargeRepository Interface

**What:** Mirrors the document repository interface shape. O(1) by id, O(n) list operations.
**Example:**

```typescript
// src/lib/finance/repository.ts
export interface SessionChargeRepository {
  save(charge: SessionCharge): SessionCharge;
  findById(id: string, workspaceId: string): SessionCharge | null;
  findByAppointmentId(appointmentId: string, workspaceId: string): SessionCharge | null;
  listByPatient(patientId: string, workspaceId: string): SessionCharge[];
  listByMonth(workspaceId: string, year: number, month: number): SessionCharge[];
}
```

`listByMonth` filters by `createdAt` year+month (or links to appointment `completedAt` via the charge's `createdAt` — both are set at the same time since charge is auto-created at completion).

### Pattern 5: WhatsApp and Email Deep Links

**What:** Pure functions that build `wa.me` or `mailto:` URL strings from appointment context. Rendered as `<a href={url}>` tags — no server action needed.
**When to use:** All COMM-01, COMM-02, COMM-03 surfaces.
**Example:**

```typescript
// src/lib/communication/templates.ts

export interface ReminderMessageContext {
  patientName: string;
  patientPhone?: string | null;
  appointmentDate: string;   // pre-formatted date string
  appointmentTime: string;
  professionalName: string;
}

export function buildReminderWhatsAppUrl(ctx: ReminderMessageContext): string {
  const body = encodeURIComponent(
    `Olá, ${ctx.patientName}! Lembrando da sua consulta com ${ctx.professionalName} ` +
    `no dia ${ctx.appointmentDate} às ${ctx.appointmentTime}. Confirma presença?`
  );
  const phone = ctx.patientPhone?.replace(/\D/g, "") ?? "";
  return `https://wa.me/${phone}?text=${body}`;
}

export function buildReminderMailtoUrl(ctx: ReminderMessageContext): string {
  const subject = encodeURIComponent(`Lembrete de consulta — ${ctx.appointmentDate}`);
  const body = encodeURIComponent(
    `Olá, ${ctx.patientName}!\n\n` +
    `Lembrando da sua consulta com ${ctx.professionalName} no dia ${ctx.appointmentDate} às ${ctx.appointmentTime}.\n\n` +
    `Por favor, confirme sua presença.\n\nAtenciosamente,\n${ctx.professionalName}`
  );
  return `mailto:?subject=${subject}&body=${body}`;
}
```

The `src/lib/communication/` module is new but thin — only template builder functions. No repository, no store. Client-side `<a>` tags with `target="_blank"` open the user's WhatsApp or email app.

### Pattern 6: Inline meetingLink Edit for ONLINE Appointments

**What:** Small client form that submits to a `editMeetingLinkAction` server action. Displayed only when `careMode === "ONLINE"`. No new route needed — it's an inline section within the appointment card or appointment detail page.
**When to use:** ONLN-01.

### Pattern 7: derivePatientSummaryFromAppointments Extension for financialStatus

**What:** The patient profile page must pass `financialStatus` derived from charge data into `derivePatientSummaryFromAppointments` (or call `derivePatientSummary` with it). Since `derivePatientSummaryFromAppointments` already returns `financialStatus: "no_data"`, Phase 5 adds a `financialStatus` input to this function derived from the patient's charges.

The derivation logic:
- No charges → `"no_data"`
- All charges `pago` → `"up_to_date"`
- Any charge `atrasado` → `"overdue"` (highest priority)
- Any charge `pendente` → `"pending_payment"`

### Anti-Patterns to Avoid

- **Embedding charge fields on Appointment:** Coupling domains makes the monthly view query both repositories and prevents clean separation.
- **Creating charges inside the `completeAppointment` domain function:** Domain functions are pure — side effects live in server actions only.
- **Using JavaScript `Date` month math without UTC anchoring:** Month boundaries are tricky. Use UTC year/month extraction consistently with the existing date anchor pattern.
- **Leaking amountInCents or paymentMethod in patient list surfaces:** SECU-05 explicitly prohibits this. The FinanceSection only appears on the individual patient profile page and `/financeiro`.
- **Making communication actions server actions:** They are just `<a href={url}>` tags. No server round-trip needed.
- **Phone number format assumptions:** Brazilian mobile numbers can be +55 11 9xxxx-xxxx (9-digit) or older 8-digit formats. Always strip all non-digits for the `wa.me` URL and let WhatsApp handle format normalization.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Currency formatting | Custom R$ formatter | `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })` | Handles centavos, decimal commas, BRL symbol correctly |
| Month date range | Manual date arithmetic | `new Date(Date.UTC(year, month - 1, 1))` / `new Date(Date.UTC(year, month, 1))` | UTC anchoring avoids DST edge cases |
| WhatsApp deep link | Custom URI builder | `wa.me/{phone}?text={encoded}` URL string | Standard WhatsApp link scheme — no library needed |
| Charge status derivation | Ad-hoc if/else in UI | `deriveFinancialStatus(charges: SessionCharge[]): FinancialStatus` pure function in model | Testable, reusable in patient summary and `/financeiro` |

**Key insight:** This phase is mostly about wiring existing patterns into new surfaces. The domain logic is straightforward — resist the temptation to over-engineer the charge model.

---

## Common Pitfalls

### Pitfall 1: priceInCents Not Forwarded to Appointment Model

**What goes wrong:** The appointment creation form accepts `priceInCents` as a URL param, and `deriveNextSessionDefaults` uses it — but the `Appointment` model and repository do not have this field yet. The `completeAppointmentAction` can't read it to initialize the charge.
**Why it happens:** Phase 2 decision [02-04] explicitly deferred the price domain to Phase 5. The field is in the defaults contract but not in the model.
**How to avoid:** Plan 05-01 Wave 0 must add `priceInCents: number | null` to the `Appointment` interface, `createAppointment` input, and in-memory store. The form already submits it. The action already reads the profile default. Only the model persistence was deferred.
**Warning signs:** `existing.priceInCents` is undefined when trying to auto-create the charge.

### Pitfall 2: Month Boundary Off-By-One in listByMonth

**What goes wrong:** Charges created at the last millisecond of a month appear in the wrong month bucket, or charges on the 1st of the next month are included.
**Why it happens:** JavaScript month is 0-indexed; Date arithmetic around month boundaries is error-prone.
**How to avoid:** Use UTC Date construction: `from = new Date(Date.UTC(year, month - 1, 1))`, `to = new Date(Date.UTC(year, month, 1))` (exclusive). Filter `charge.createdAt >= from && charge.createdAt < to`.

### Pitfall 3: Charge Created Twice on Retry

**What goes wrong:** If the server action is retried (e.g., network glitch), `completeAppointmentAction` runs twice and creates two charge records for the same appointment.
**Why it happens:** No idempotency check before creating the charge.
**How to avoid:** In `completeAppointmentAction`, check `financeRepo.findByAppointmentId(appointmentId)` before creating. If a charge already exists, skip creation. This is safe because COMPLETED status is also idempotent (the appointment model guards it).

### Pitfall 4: wa.me URL Without Country Code

**What goes wrong:** `wa.me/11999998888` fails. WhatsApp requires full international format.
**Why it happens:** Brazilian phone numbers stored without country code are common.
**How to avoid:** Build the URL as `https://wa.me/55${strippedPhone}?text=...` when no country code is present. Document that the phone field in Patient may not include the country code and the template builder must prepend `55`.

### Pitfall 5: SECU-05 Violation in Audit Metadata

**What goes wrong:** Charge `amountInCents` or `paymentMethod` appears in audit event metadata, which could be surfaced in audit logs visible beyond the finance context.
**Why it happens:** The audit event for `charge.updated` might naively include all changed fields.
**How to avoid:** Audit metadata for charge events should include only `chargeId`, `appointmentId`, and `status` — not amount or payment method. Follow the same redaction discipline as clinical notes (Phase 3 decision).

### Pitfall 6: FinancialStatus Derivation Returns "up_to_date" When All Charges Are Null Amount

**What goes wrong:** A patient with appointments completed but `priceInCents: null` has charges with `amountInCents: null`. If all are `pendente`, the status should be `pending_payment`, not `up_to_date`.
**Why it happens:** Status is determined by the `ChargeStatus` enum values, not the amount. Null amount does not affect the status derivation.
**How to avoid:** Confirm that the derivation logic uses `charge.status` values only. The user constraint says `priceInCents: null` appointments should show "Sem valor definido" placeholder — this is a display concern, not a status concern.

---

## Code Examples

### Monthly Totals Calculation

```typescript
// Pure function — no repository interaction
export interface MonthlyFinancialSummary {
  totalSessions: number;
  totalReceivedCents: number;
  totalPendingCents: number;
}

export function deriveMonthlyFinancialSummary(
  charges: SessionCharge[],
): MonthlyFinancialSummary {
  const totalSessions = charges.length;
  const totalReceivedCents = charges
    .filter((c) => c.status === "pago" && c.amountInCents !== null)
    .reduce((sum, c) => sum + (c.amountInCents ?? 0), 0);
  const totalPendingCents = charges
    .filter((c) => (c.status === "pendente" || c.status === "atrasado") && c.amountInCents !== null)
    .reduce((sum, c) => sum + (c.amountInCents ?? 0), 0);
  return { totalSessions, totalReceivedCents, totalPendingCents };
}
```

### Currency Display

```typescript
const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// BRL.format(15000 / 100) → "R$ 150,00"
// BRL.format(0) → "R$ 0,00"
```

### Charge Status Color Coding (matching existing STATUS_COLORS pattern)

```typescript
const CHARGE_STATUS_COLORS = {
  pago: { background: "rgba(236, 253, 245, 0.9)", color: "#065f46", border: "rgba(16, 185, 129, 0.22)" },
  pendente: { background: "rgba(255, 247, 237, 0.9)", color: "#92400e", border: "rgba(146, 64, 14, 0.22)" },
  atrasado: { background: "rgba(255, 241, 242, 0.9)", color: "#9f1239", border: "rgba(159, 18, 57, 0.2)" },
};
```

### Charge Audit Event

```typescript
// src/lib/finance/audit.ts
export function createChargeAuditEvent(
  input: {
    type: "charge.created" | "charge.updated";
    chargeId: string;
    appointmentId: string;
    newStatus: ChargeStatus;
    actor: AuditActor;
  },
  deps: { now: Date; createId: () => string },
): AuditEvent {
  return createAuditEvent(
    {
      type: input.type,
      actor: input.actor,
      subject: { kind: "charge", id: input.chargeId },
      summary: input.type === "charge.created"
        ? "Cobrança criada automaticamente ao concluir sessão."
        : `Status da cobrança atualizado para "${input.newStatus}".`,
      metadata: {
        chargeId: input.chargeId,
        appointmentId: input.appointmentId,
        // NOTE: amount and paymentMethod are NEVER included — SECU-05
      },
    },
    deps,
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `priceInCents: null` hardcoded in patient page and agenda page | `priceInCents` field added to Appointment model and forwarded from form | Phase 5 Wave 0 | Enables charge auto-creation with correct default amount |
| `financialStatus: "no_data"` hardcoded in `derivePatientSummaryFromAppointments` | `financialStatus` derived from charge records and passed in | Phase 5 | PatientSummaryCards financial chip becomes meaningful |
| nextSessionActions React.Fragment has only note + next-session links | COMM action buttons added to nextSessionActions for ONLINE/any appointment | Phase 5 | Agenda cards get communication context without view component signature change |

**Deprecated/outdated:**
- `priceInCents: null` hardcoded in `src/app/(vault)/patients/[patientId]/page.tsx` line 89 and `src/app/(vault)/agenda/page.tsx` line 109 — these stubs must be replaced with real appointment price reads in Phase 5.

---

## Open Questions

1. **Does `Appointment` model need `priceInCents` as a stored field, or should it be derived from `deriveNextSessionDefaults` at action time?**
   - What we know: The form already emits `priceInCents` as a FormData field. The `createAppointmentAction` reads `priceInCents` from FormData but does not persist it (it's not in the `Appointment` interface).
   - What's unclear: Whether the Phase 2 appointment store implementation actually ignores the field silently or whether the model needs a schema change.
   - Recommendation: Add `priceInCents: number | null` to the `Appointment` interface and `CreateAppointmentInput`. This is the cleanest path — the field is already expected by the form and defaults contracts.

2. **Should the `/financeiro` route show ALL charges (including those with null amounts) or only charges with an amount set?**
   - What we know: User constraint says Claude has discretion on the `priceInCents: null` placeholder behavior.
   - Recommendation: Show all charges. Null-amount charges display "Sem valor definido" instead of a currency amount. They count toward session total but not toward received/pending totals.

3. **Where is the `meetingLink` edit surface for ONLINE appointments?**
   - What we know: Context says "a small inline edit is sufficient" — not a new route.
   - Recommendation: Add an "Editar link" button that reveals a small inline form within the appointment detail page (`/appointments/[id]/page.tsx`). This keeps it close to the appointment context without polluting the agenda card itself. For the agenda card, show the link as a small "Abrir link" anchor when `meetingLink` is set.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.0.9 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run tests/finance-domain.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FIN-01 | charge auto-created with priceInCents from appointment | unit | `npx vitest run tests/finance-domain.test.ts` | ❌ Wave 0 |
| FIN-01 | charge with null amount when appointment has no price | unit | `npx vitest run tests/finance-domain.test.ts` | ❌ Wave 0 |
| FIN-02 | charge status transitions (pendente → pago, pendente → atrasado) | unit | `npx vitest run tests/finance-domain.test.ts` | ❌ Wave 0 |
| FIN-03 | paymentMethod stored and retrieved on charge | unit | `npx vitest run tests/finance-domain.test.ts` | ❌ Wave 0 |
| FIN-04 | repository listByPatient returns all charges for patient | unit | `npx vitest run tests/finance-domain.test.ts` | ❌ Wave 0 |
| FIN-05 | deriveMonthlyFinancialSummary calculates totals correctly | unit | `npx vitest run tests/finance-domain.test.ts` | ❌ Wave 0 |
| FIN-05 | listByMonth boundaries correct (inclusive start, exclusive end) | unit | `npx vitest run tests/finance-domain.test.ts` | ❌ Wave 0 |
| FIN-02 | deriveFinancialStatus — overdue takes priority over pending | unit | `npx vitest run tests/finance-domain.test.ts` | ❌ Wave 0 |
| FIN-02 | deriveFinancialStatus — all paid returns up_to_date | unit | `npx vitest run tests/finance-domain.test.ts` | ❌ Wave 0 |
| ONLN-01 | meetingLink stored on Appointment after edit | unit | `npx vitest run tests/appointment-online-care.test.ts` | ❌ Wave 0 |
| ONLN-03 | remoteIssueNote stored on Appointment (ONLINE only) | unit | `npx vitest run tests/appointment-online-care.test.ts` | ❌ Wave 0 |
| COMM-01 | buildReminderWhatsAppUrl produces valid wa.me URL | unit | `npx vitest run tests/communication-templates.test.ts` | ❌ Wave 0 |
| COMM-02 | buildRescheduleWhatsAppUrl includes patient name and date | unit | `npx vitest run tests/communication-templates.test.ts` | ❌ Wave 0 |
| COMM-03 | buildDocumentDeliveryWhatsAppUrl includes document type | unit | `npx vitest run tests/communication-templates.test.ts` | ❌ Wave 0 |
| SECU-05 | charge audit event metadata excludes amountInCents and paymentMethod | unit | `npx vitest run tests/finance-domain.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run tests/finance-domain.test.ts tests/communication-templates.test.ts tests/appointment-online-care.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/finance-domain.test.ts` — covers FIN-01 through FIN-05, SECU-05 audit check
- [ ] `tests/appointment-online-care.test.ts` — covers ONLN-01, ONLN-03
- [ ] `tests/communication-templates.test.ts` — covers COMM-01, COMM-02, COMM-03 URL construction

*(No framework install needed — Vitest already configured)*

---

## Sources

### Primary (HIGH confidence)

- Codebase inspection: `src/lib/documents/model.ts`, `src/lib/documents/repository.ts`, `src/lib/documents/store.ts` — confirmed repository/store/model pattern
- Codebase inspection: `src/lib/audit/events.ts`, `src/lib/audit/repository.ts` — confirmed audit contract
- Codebase inspection: `src/lib/appointments/model.ts` — confirmed `Appointment` interface and lifecycle functions
- Codebase inspection: `src/lib/patients/summary.ts` — confirmed `FinancialStatus` type and `derivePatientSummaryFromAppointments` with `financialStatus: "no_data"` stub
- Codebase inspection: `src/app/(vault)/appointments/actions.ts` — confirmed server action pattern with audit side effect
- Codebase inspection: `src/app/(vault)/agenda/page.tsx` — confirmed `nextSessionActions` React.Fragment extension point
- Codebase inspection: `src/app/(vault)/patients/[patientId]/page.tsx` — confirmed DocumentsSection position and page loading pattern
- `vitest.config.ts` + `tests/` directory scan — confirmed test framework and file pattern

### Secondary (MEDIUM confidence)

- WhatsApp `wa.me` URL scheme: `https://wa.me/PHONE?text=ENCODED_TEXT` — widely documented Web standard, no library needed
- `Intl.NumberFormat` with `style: "currency"` for BRL — MDN Web Docs pattern, confirmed working in Node.js environment (consistent with `Intl.DateTimeFormat` usage already in codebase)

### Tertiary (LOW confidence)

- None.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all established project patterns
- Architecture: HIGH — based on direct codebase inspection of Phase 3/4 analogs
- Pitfalls: HIGH — specific to gaps found in codebase (priceInCents stubs, audit redaction policy)
- Communication deep links: HIGH — simple URL scheme construction, no external dependencies

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable patterns; only invalidated if Next.js 15 introduces breaking App Router changes)
