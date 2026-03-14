# Roadmap: PsiVault

## Overview

PsiVault ships as a single v1 milestone focused on one thing: making the solo Brazilian psychologist feel fully in control of patient history, appointments, records, documents, and payment follow-up inside a trustworthy digital vault. The roadmap deliberately starts with security and operational foundations, then layers the real consultory loop in dependency order so later features never need to reinterpret the core data model.

Phase 1 is the global blocker because it defines authentication, security boundaries, and the professional account context that every other feature depends on. After that, the roadmap follows the real flow of work: patient and schedule first, then session records, then documents, then finance/assisted operations, and finally dashboard/search/export/polish.

## Milestones

- 📋 **v1 Vault MVP** - Phases 1-6 (planned)
- 🧭 **v2 Expansion** - Deferred features only after v1 validation (multi-user clinic, telehealth, AI, heavier integrations)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions if scope must be added later

- [x] **Phase 1: Vault Foundation** - Authentication, MFA, professional setup, audit trail, sensitive-data boundaries, and base architecture
- [x] **Phase 2: Patient and Agenda Core** - Patient profiles, summaries, agenda lifecycle, recurrence, conflict handling, and quick next-session flows (completed 2026-03-13)
- [x] **Phase 3: Clinical Record Core** - Session-note workflow, structured/freeform records, audit-preserving edits, and patient longitudinal timeline (completed 2026-03-14)
- [ ] **Phase 4: Document Vault** - Template-driven document creation, secure document storage, provenance, and patient-linked retrieval
- [ ] **Phase 5: Finance and Assisted Operations** - Minimal financial tracking, receipts, online-care organization, and assisted outbound communication
- [ ] **Phase 6: Retrieval, Recovery, and Launch Polish** - Dashboard, reminders, search, export/backup confidence, and launch hardening

## Phase Details

### Phase 1: Vault Foundation
**Goal**: The product has a trustworthy vault foundation: a professional can securely create and access an account, configure their practice identity, and operate inside clear privacy, audit, and storage boundaries that every later feature builds on.
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, PROF-01, PROF-02, SECU-01, SECU-02, SECU-05
**Success Criteria** (what must be TRUE):
  1. A professional can sign up, sign in, reset password, and complete MFA before accessing any sensitive application area.
  2. Practice-profile data including CRP and signature assets can be configured and reused by later document flows.
  3. Sensitive records are isolated to the owning account, and audit events exist for privileged create/update/delete actions.
  4. The initial architecture, storage, and observability foundation is documented and ready to support patient, document, and finance modules without redesign.
**Plans**: TBD

Plans:
- [x] 01-01: App scaffold, auth/session architecture, and secure environment baseline
- [x] 01-02: Professional profile, account settings, and signature/identity assets
- [x] 01-03: Audit/event model, sensitive-data boundaries, and logging/redaction baseline

### Phase 2: Patient and Agenda Core
**Goal**: A professional can register patients, understand patient context at a glance, and manage the real rhythm of scheduling with recurrence, conflict prevention, status transitions, and rapid rebooking.
**Depends on**: Phase 1
**Requirements**: PATI-01, PATI-02, PATI-03, PATI-04, SCHD-01, SCHD-02, SCHD-03, SCHD-04, SCHD-05, SCHD-06, SCHD-07
**Success Criteria** (what must be TRUE):
  1. A professional can create and archive patient profiles with the expected Brazilian-practice fields and reopen them later with full history intact.
  2. The agenda supports create, reschedule, cancel, no-show, complete, and recurring weekly sessions without ambiguity.
  3. Daily and weekly views show appointment mode and status clearly, and saving a conflicting appointment is blocked or warned before commit.
  4. From a patient or completed appointment context, the professional can quickly create the next session without re-entering core context.
**Plans**: TBD

Plans:
- [ ] 02-01: Patient data model, patient forms, archive flow, and profile summary
- [ ] 02-02: Appointment model, recurrence logic, status transitions, and conflict rules
- [ ] 02-03: Daily/weekly agenda UX and quick next-session workflow

### Phase 3: Clinical Record Core
**Goal**: The product becomes clinically useful: after a session, the professional can record evolution fast, use structured helpers when wanted, edit safely, and later reconstruct the patient's trajectory from one timeline.
**Depends on**: Phase 2
**Requirements**: CLIN-01, CLIN-02, CLIN-03, CLIN-04, CLIN-05
**Success Criteria** (what must be TRUE):
  1. A completed appointment can open directly into a session-record workflow tied to the correct patient and appointment context.
  2. The professional can use free text alone or combine it with optional structured blocks without the UX feeling rigid.
  3. Editing a record preserves traceability instead of silently overwriting history.
  4. The patient timeline clearly shows session evolution in chronological order and becomes the trusted summary of case progression.
**Plans**: 3 plans

Plans:
- [ ] 03-01-PLAN.md — Clinical domain module (model, repository, store, audit) + unit tests (TDD)
- [ ] 03-02-PLAN.md — Note composer page, server actions, and agenda entry point integration
- [ ] 03-03-PLAN.md — Patient longitudinal clinical timeline on the patient profile page

### Phase 4: Document Vault
**Goal**: The professional can generate real practice documents from templates, store them securely with provenance, and retrieve them later from the patient context without breaking trust.
**Depends on**: Phase 3
**Requirements**: DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05, DOCS-06, DOCS-07, DOCS-08
**Success Criteria** (what must be TRUE):
  1. Template-driven document generation pre-fills patient, professional, and date context without forcing blank-start drafting.
  2. Declaration, receipt, anamnesis, report, and consent/service-related document flows all produce storable outputs inside the patient record.
  3. Generated documents carry provenance metadata and remain retrievable later from the related patient context.
  4. File storage and retrieval behavior preserves the vault posture instead of exposing documents through casual access patterns.
**Plans**: TBD

Plans:
- [ ] 04-01: Document taxonomy, metadata model, and secure storage workflow
- [ ] 04-02: Template engine and prefilled generation for core document types
- [ ] 04-03: Patient-linked document vault retrieval and provenance display

### Phase 5: Finance and Assisted Operations
**Goal**: The office loop closes operationally: the professional can track whether a session was paid, issue/attach receipts, organize online-care context, and open useful reminder/communication flows without turning the product into an ERP or chat app.
**Depends on**: Phase 4
**Requirements**: FIN-01, FIN-02, FIN-03, FIN-04, FIN-05, ONLN-01, ONLN-02, ONLN-03, COMM-01, COMM-02, COMM-03
**Success Criteria** (what must be TRUE):
  1. A professional can track session charges by status and payment method, including Pix-oriented manual marking, from both patient and monthly views.
  2. Receipt flows fit naturally into the financial context instead of feeling like a detached document action.
  3. Online appointments carry link, mode, and issue-tracking context without pretending to be a built-in telehealth platform.
  4. Reminder, reschedule, and document-send actions can open prefilled outbound messages from the right context while keeping the app as the source of truth.
**Plans**: TBD

Plans:
- [ ] 05-01: Financial ledger, payment-state UX, and monthly financial summary
- [ ] 05-02: Online-care organization and appointment communication context
- [ ] 05-03: Assisted outbound message actions for reminders, reschedules, and document delivery

### Phase 6: Retrieval, Recovery, and Launch Polish
**Goal**: The product is launch-ready: the home experience surfaces what matters today, information is easy to find anywhere, reminders are actionable, and backup/export confidence completes the vault promise.
**Depends on**: Phase 5
**Requirements**: TASK-01, TASK-02, TASK-03, DASH-01, DASH-02, SRCH-01, SRCH-02, SECU-03, SECU-04
**Success Criteria** (what must be TRUE):
  1. The home screen shows today's agenda, upcoming work, reminders, and payment pendencies in a way that helps the professional orient immediately.
  2. Search and retrieval flows can find a patient, session, document, canceled appointment, or pending payment quickly enough to be trusted in daily work.
  3. Reminders can be created and completed without losing history, and operational pendencies surface clearly.
  4. Export and backup/recovery paths exist with enough confidence to make the “vault” positioning credible at launch.
**Plans**: TBD

Plans:
- [ ] 06-01: Dashboard and operational summary
- [ ] 06-02: Global retrieval/search and reminders
- [ ] 06-03: Export, backup/recovery verification, and launch hardening

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6
Parallel execution is allowed at the plan level where dependencies permit it, but the roadmap order stays fixed.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Vault Foundation | 3/3 | Complete | 2026-03-13 |
| 2. Patient and Agenda Core | 3/3 | Complete    | 2026-03-14 |
| 3. Clinical Record Core | 3/3 | Complete   | 2026-03-14 |
| 4. Document Vault | 0/3 | Not started | - |
| 5. Finance and Assisted Operations | 0/3 | Not started | - |
| 6. Retrieval, Recovery, and Launch Polish | 0/3 | Not started | - |
