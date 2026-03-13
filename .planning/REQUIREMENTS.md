# Requirements: PsiVault

**Defined:** 2026-03-13
**Core Value:** The psychologist can finish a session, register everything correctly in a few minutes, and trust that the clinical and operational history is safe, findable, and under control.

## v1 Requirements

### Authentication

- [x] **AUTH-01**: Professional can create an account with email and password.
- [x] **AUTH-02**: Professional can sign in and stay signed in across browser refreshes.
- [x] **AUTH-03**: Professional must complete a second authentication factor to access clinical data.
- [x] **AUTH-04**: Professional can reset password through a secure recovery flow.

### Professional Setup

- [x] **PROF-01**: Professional can store and edit profile details including full name, CRP, contact data, and signature assets.
- [x] **PROF-02**: Professional can configure default appointment duration, session price, and service preferences used across the app.

### Patients

- [x] **PATI-01**: Professional can create a patient profile with basic identification and contact data.
- [x] **PATI-02**: Professional can record social name, emergency contact, legal guardian, and important observations when relevant.
- [x] **PATI-03**: Professional can open a patient profile and immediately see last session, pending items, documents, and financial status.
- [x] **PATI-04**: Professional can archive a patient without deleting the clinical history.

### Scheduling

- [x] **SCHD-01**: Professional can create an appointment linked to a patient with date, time, duration, and care mode (online or in-person).
- [x] **SCHD-02**: Professional can reschedule or cancel an appointment.
- [x] **SCHD-03**: Professional can mark an appointment as confirmed, completed, canceled, or no-show.
- [x] **SCHD-04**: Professional can create recurring weekly appointments.
- [x] **SCHD-05**: Professional can view agenda in daily and weekly layouts.
- [x] **SCHD-06**: System warns about conflicting appointment times before saving.
- [x] **SCHD-07**: Professional can create the next session quickly from an existing appointment or patient context.

### Clinical Records

- [ ] **CLIN-01**: Professional can register a session note from the completed appointment context.
- [ ] **CLIN-02**: Session note supports free-text writing without forcing a rigid template.
- [ ] **CLIN-03**: Session note supports optional structured fields such as demand, observed mood, themes, evolution, and next steps.
- [ ] **CLIN-04**: Professional can edit a session note while preserving an audit trail of changes.
- [ ] **CLIN-05**: Patient record shows a chronological timeline of sessions and clinical evolution.

### Documents

- [ ] **DOCS-01**: Professional can generate a document from a predefined template without starting from a blank page.
- [ ] **DOCS-02**: System pre-fills document templates with patient data, professional data, and relevant dates.
- [ ] **DOCS-03**: Professional can create and store declarations of attendance.
- [ ] **DOCS-04**: Professional can create and store receipts.
- [ ] **DOCS-05**: Professional can create and store anamnesis records.
- [ ] **DOCS-06**: Professional can create and store psychological reports.
- [ ] **DOCS-07**: Professional can create and store consent-related and service-contract documents.
- [ ] **DOCS-08**: Generated documents remain attached to the related patient record with stored provenance for later retrieval.

### Finance

- [ ] **FIN-01**: Professional can define session price by appointment or patient context.
- [ ] **FIN-02**: Professional can mark a charge as paid, pending, due today, or overdue.
- [ ] **FIN-03**: Professional can record payment method including Pix, bank transfer, cash, or other simple options.
- [ ] **FIN-04**: Professional can view the patient's payment history and outstanding balances.
- [ ] **FIN-05**: Professional can view a monthly summary of sessions completed, amounts received, and amounts pending.

### Remote Care Support

- [ ] **ONLN-01**: Professional can store the online session link associated with an appointment.
- [ ] **ONLN-02**: Professional can view whether an appointment is online or in-person from agenda and patient context.
- [ ] **ONLN-03**: Professional can register remote-session issues such as connection problems in the appointment history.

### Assisted Communication

- [ ] **COMM-01**: Professional can open a prefilled reminder or confirmation message for a patient through an external channel such as WhatsApp or email.
- [ ] **COMM-02**: Professional can open a prefilled reschedule or cancellation message from the appointment context.
- [ ] **COMM-03**: Professional can open a prefilled message to send receipt, declaration, or online-session link.

### Tasks and Reminders

- [ ] **TASK-01**: Professional can create reminders linked to a patient, appointment, document, or payment.
- [ ] **TASK-02**: Dashboard highlights overdue payments, upcoming sessions, and pending follow-ups.
- [ ] **TASK-03**: Professional can mark reminders as complete without losing their history.

### Dashboard and Search

- [ ] **DASH-01**: Professional sees today's agenda, next appointments, reminders, and payment pendencies on the home screen.
- [ ] **DASH-02**: Professional sees a simple monthly operational summary with active patients, completed sessions, received payments, and pending payments.
- [ ] **SRCH-01**: Professional can search patients quickly by name or identifying info.
- [ ] **SRCH-02**: Professional can find past sessions, documents, canceled appointments, and pending payments from the product's search/navigation flows.

### Security and Governance

- [x] **SECU-01**: Clinical and financial records are visible only to the authenticated professional who owns the account.
- [x] **SECU-02**: System records an audit trail for sensitive create/update/delete actions on patient, clinical, document, and financial data.
- [ ] **SECU-03**: Professional can export patient-related data when necessary.
- [ ] **SECU-04**: System provides a backup and recovery path for practice data with restore verification.
- [x] **SECU-05**: System avoids unnecessary sensitive data exposure in lists, notifications, and secondary UI surfaces.

## v2 Requirements

### Team and Clinic

- **TEAM-01**: Clinic can add multiple professionals to the same workspace with role-based access.
- **TEAM-02**: Clinic can separate patient access by professional or team.

### Automations and Integrations

- **AUTO-01**: System sends automated reminders and follow-ups through integrated external providers.
- **AUTO-02**: System integrates directly with payment and invoicing providers.
- **AUTO-03**: System integrates with external calendar providers.

### Advanced Care Experience

- **CARE-01**: System supports richer telehealth workflows beyond organizational support.
- **CARE-02**: System offers advanced analytics and reporting for the practice.
- **CARE-03**: System assists document or note drafting with AI under explicit safeguards.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Internal chat inbox | Not part of the validated core loop; increases privacy and moderation burden |
| Built-in video platform | Remote care support is organizational in v1, not a full telehealth stack |
| Multi-user clinic operations | Deliberately deferred to keep the MVP focused on the solo professional |
| Heavy integrations at launch | Core workflow must prove value before adding operational coupling |
| AI-generated clinical records | Too risky for trust and scope before the manual workflow is validated |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| PROF-01 | Phase 1 | Complete |
| PROF-02 | Phase 1 | Complete |
| PATI-01 | Phase 2 | Complete |
| PATI-02 | Phase 2 | Complete |
| PATI-03 | Phase 2 | Complete |
| PATI-04 | Phase 2 | Complete |
| SCHD-01 | Phase 2 | Complete |
| SCHD-02 | Phase 2 | Complete |
| SCHD-03 | Phase 2 | Complete |
| SCHD-04 | Phase 2 | Complete |
| SCHD-05 | Phase 2 | Complete |
| SCHD-06 | Phase 2 | Complete |
| SCHD-07 | Phase 2 | Complete |
| CLIN-01 | Phase 3 | Pending |
| CLIN-02 | Phase 3 | Pending |
| CLIN-03 | Phase 3 | Pending |
| CLIN-04 | Phase 3 | Pending |
| CLIN-05 | Phase 3 | Pending |
| DOCS-01 | Phase 4 | Pending |
| DOCS-02 | Phase 4 | Pending |
| DOCS-03 | Phase 4 | Pending |
| DOCS-04 | Phase 4 | Pending |
| DOCS-05 | Phase 4 | Pending |
| DOCS-06 | Phase 4 | Pending |
| DOCS-07 | Phase 4 | Pending |
| DOCS-08 | Phase 4 | Pending |
| FIN-01 | Phase 5 | Pending |
| FIN-02 | Phase 5 | Pending |
| FIN-03 | Phase 5 | Pending |
| FIN-04 | Phase 5 | Pending |
| FIN-05 | Phase 5 | Pending |
| ONLN-01 | Phase 5 | Pending |
| ONLN-02 | Phase 5 | Pending |
| ONLN-03 | Phase 5 | Pending |
| COMM-01 | Phase 5 | Pending |
| COMM-02 | Phase 5 | Pending |
| COMM-03 | Phase 5 | Pending |
| TASK-01 | Phase 6 | Pending |
| TASK-02 | Phase 6 | Pending |
| TASK-03 | Phase 6 | Pending |
| DASH-01 | Phase 6 | Pending |
| DASH-02 | Phase 6 | Pending |
| SRCH-01 | Phase 6 | Pending |
| SRCH-02 | Phase 6 | Pending |
| SECU-01 | Phase 1 | Complete |
| SECU-02 | Phase 1 | Complete |
| SECU-03 | Phase 6 | Pending |
| SECU-04 | Phase 6 | Pending |
| SECU-05 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 51 total
- Mapped to phases: 51
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after Phase 1 completion*
