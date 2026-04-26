# Phase 40: Integração com Atendimentos — Research

**Date:** 2026-04-25
**Phase:** 40 — Integração com Atendimentos
**Goal:** Documentos nascem do contexto clínico correto — ligados a atendimentos, com pre-fill preciso e fluxo contínuo

---

## Domain Analysis

### Schema Compatibility ✓

`PracticeDocument` in Prisma schema already has:
- `appointmentId String? @map("appointment_id")` (nullable)
- `@@index([appointmentId])` exists
- No migration needed for schema — Phase 37 already delivered this

`ClinicalNote` has:
- `appointmentId String @unique @map("appointment_id")` — 1:1 relationship with Appointment
- This allows looking up a clinical note by appointment, and vice versa

### Repository Layer ✓

**Document repository** (`src/lib/documents/repository.ts` + `.prisma.ts`):
- `findByAppointmentId(workspaceId, appointmentId)` already exists and is implemented
- `save()` uses upsert and handles `appointmentId` via `mapToPrisma`
- No repository changes needed for basic CRUD

**Appointment repository** (`src/lib/appointments/repository.ts` + `.prisma.ts`):
- `findById(id, workspaceId)` — needed to validate appointment on document creation
- `listByPatient(patientId, workspaceId)` — used in composer for pre-fill context
- No repository changes needed

### Domain Model ✓

**`CreatePracticeDocumentInput`** (`src/lib/documents/model.ts`):
- Already accepts `appointmentId?: string | null`
- `createPracticeDocument()` and `createDraftDocument()` both set `appointmentId: input.appointmentId ?? null`
- No model changes needed

### Integration Points Identified

#### 1. Document Creation Flow (`/patients/[patientId]/documents/new`)

**Current state:**
- Page reads `type` from searchParams only
- Does NOT read `appointmentId` from searchParams
- `buildDocumentContent()` receives `DocumentPreFillContext` without appointment data
- `createDocumentAction()` does NOT read `appointmentId` from FormData
- Redirects to `/patients/${patientId}` hardcoded, no `from` support

**Required changes:**
- Page: read `appointmentId` from searchParams, fetch appointment, validate (same patient/workspace)
- Page: extend `DocumentPreFillContext` with appointment-specific data
- Page: pass `appointmentId` to `DocumentComposerForm`
- `createDocumentAction`: read `appointmentId` from FormData, validate, include in create input
- `createDocumentAction`: read `from` from FormData, redirect accordingly

#### 2. Appointment Context in Pre-fill (`DocumentPreFillContext`)

**Current `DocumentPreFillContext`**:
```ts
export interface DocumentPreFillContext {
  patientFullName: string;
  professionalName: string;
  crp: string;
  todayLabel: string;
  sessionCount?: number | null;
  sessionDateRange?: string | null;
  intakeDate?: string | null;
  amountLabel?: string | null;
  paymentMethod?: string | null;
  patientRecordSummaryEntries?: PatientRecordSummaryEntry[] | null;
}
```

**Missing for appointment linkage:**
- `appointmentDateLabel?: string | null` — for attendance certificate
- `appointmentTimeLabel?: string | null` — for attendance certificate
- `appointmentCareModeLabel?: string | null` — "Presencial" / "Online"
- `singleSessionDateLabel?: string | null` — when creating from ONE appointment

**Template impacts:**
- `declaration_of_attendance`: currently uses `sessionCount` + `sessionDateRange` (all sessions). When linked to a single appointment, should use that specific appointment's date/time.
- `patient_record_summary`: currently uses ALL notes. When linked to appointment, should use only notes from sessions UP TO that appointment's date.
- `session_note`: when linked to appointment, pre-fill with appointment date/time.

#### 3. Document Timeline Badge

**Current `DocumentTimeline`** (`document-timeline.tsx`):
- Shows: type label, private badge, status badge, date/time, createdBy, actions
- Does NOT show appointment context

**Required addition:**
- If `doc.appointmentId` present, show discreet badge: "Atendimento de 25/04/2026, 14:00"
- Badge is clickable → links to `/agenda` filtered by patient+date (or just `/agenda` if deep-link not supported)
- If appointment deleted (findById returns null), show "Atendimento removido" in muted color
- Badge styling: neutral (`text-3`), font 0.72rem, no background color — secondary to status badge

#### 4. Document View Page Meta-info

**Current `DocumentViewPage`** (`[documentId]/page.tsx`):
- Shows A4 paper view inside `DocumentPaperScaler`
- Does NOT fetch or display appointment context

**Required addition:**
- Fetch appointment by `doc.appointmentId` if present
- Display appointment context ABOVE the `DocumentPaperScaler`, outside A4 area
- Format: "Atendimento de {date}, {time} · {careMode}" or "Atendimento removido"
- Must NOT appear inside `DocumentPaperView` (not in PDF)

#### 5. Agenda Quick Action

**Current `AppointmentCard`**:
- Accepts `quickActions?: React.ReactNode` and `nextSessionAction?: React.ReactNode`
- `quickActions` rendered in `quickActionsRowStyle`
- `nextSessionAction` rendered below with top border

**Pattern to follow:**
- `CompletedAppointmentNextSessionAction` uses query params: `?patientId=&durationMinutes=&careMode=&priceInCents=`
- Similar pattern for document creation: `?type=declaration_of_attendance&appointmentId=&from=/agenda`

**Required addition:**
- In agenda page (where `AppointmentCard` is used), for COMPLETED appointments, add a quick action link to create document
- Link should include `patientId`, `appointmentId`, `from=/agenda`
- For completed appointments, show "Criar declaração" or "Criar nota" links

#### 6. Navigation (`from` parameter)

**Current state:**
- Composer page breadcrumb is static, no back button
- `createDocumentAction` redirects hardcoded to `/patients/${patientId}`

**Required changes:**
- Composer page: read `from` from searchParams, show "Voltar" button if present
- `DocumentComposerForm`: accept `from` prop, include as hidden field
- `createDocumentAction`: read `from` from FormData, redirect to `from` if valid and present, else fallback to `/patients/${patientId}?tab=documentos`
- Validation of `from`: must be internal path (starts with `/`), reject external URLs (security)

#### 7. Smart Pre-fill for Reports (`patient_record_summary`)

**Current `buildPatientRecordSummaryEntries`:**
- Fetches ALL clinical notes for patient
- Maps ALL notes to entries
- Sorts by date ascending

**Required change when `appointmentId` provided:**
- Fetch the appointment to get `startsAt`
- Filter clinical notes to only those whose appointment's `startsAt` <= the linked appointment's `startsAt`
- Limit to last 20 sessions (or all up to that date, whichever is smaller)
- Count sessions up to that date (not total sessions)

#### 8. Attendance Certificate Restriction (APPT-03)

**Requirement:** `declaration_of_attendance` MUST be created with an appointment linked.

**Implementation approach:**
- In composer page: if `type=declaration_of_attendance` and no `appointmentId` in searchParams, show error/redirect
- In `createDocumentAction`: if `type=declaration_of_attendance` and no `appointmentId`, reject with clear error
- Alternative: only allow creating `declaration_of_attendance` from appointment context (agenda quick action)

---

## File Inventory (files to modify)

| File | Role | Changes |
|------|------|---------|
| `src/lib/documents/templates.ts` | Domain | Extend `DocumentPreFillContext`, update `buildDocumentContent`, add appointment-aware pre-fill |
| `src/app/(vault)/patients/[patientId]/documents/new/page.tsx` | Server Component | Read `appointmentId` + `from` from searchParams, fetch appointment, validate, build enriched context, pass to form |
| `src/app/(vault)/patients/[patientId]/documents/new/actions.ts` | Server Action | Accept `appointmentId` + `from` in FormData, validate, create with appointmentId, redirect with from support |
| `src/app/(vault)/patients/[patientId]/documents/new/components/document-composer-form.tsx` | Client Component | Accept `appointmentId` + `from` props, include as hidden fields, add "Voltar" button respecting `from` |
| `src/app/(vault)/patients/[patientId]/components/document-timeline.tsx` | Client Component | Add appointment badge with date/time, link to agenda, handle deleted appointment gracefully |
| `src/app/(vault)/patients/[patientId]/documents/[documentId]/page.tsx` | Server Component | Fetch appointment if `doc.appointmentId` present, render meta-info above A4 paper |
| `src/app/(vault)/agenda/page.tsx` or agenda list component | Server Component | Add "Criar documento" quick action to completed appointment cards |
| `src/app/(vault)/patients/[patientId]/page.tsx` | Server Component | Ensure `tab=documentos` deep-link works (if not already) |

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Cross-workspace appointment linking | High | Validate `appointment.workspaceId === workspaceId` in action + page |
| Cross-patient appointment linking | High | Validate `appointment.patientId === patientId` in action + page |
| Appointment deleted after document created | Low | `appointmentId` preserved in DB; UI shows "Atendimento removido" |
| Pre-fill with many notes slow | Low | Filter by date + limit 20; Prisma query with `take: 20` |
| Open redirect via `from` param | Medium | Validate `from` starts with `/` and is internal; reject external URLs |
| `declaration_of_attendance` without appointment | Medium | Guard in page + action; only allow from appointment context |

## No-Go Areas (deferred)

- Dashboard global `/documentos` — Phase 41
- Full-text search — v2
- Batch export — v2
- Inline drawer for document creation — v2

---

*Research complete: schema ready, repositories ready, integration points identified, 8 files to modify.*
