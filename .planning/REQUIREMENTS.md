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

- [x] **CLIN-01**: Professional can register a session note from the completed appointment context.
- [x] **CLIN-02**: Session note supports free-text writing without forcing a rigid template.
- [x] **CLIN-03**: Session note supports optional structured fields such as demand, observed mood, themes, evolution, and next steps.
- [x] **CLIN-04**: Professional can edit a session note while preserving an audit trail of changes.
- [x] **CLIN-05**: Patient record shows a chronological timeline of sessions and clinical evolution.

### Documents

- [x] **DOCS-01**: Professional can generate a document from a predefined template without starting from a blank page.
- [x] **DOCS-02**: System pre-fills document templates with patient data, professional data, and relevant dates.
- [x] **DOCS-03**: Professional can create and store declarations of attendance.
- [x] **DOCS-04**: Professional can create and store receipts.
- [x] **DOCS-05**: Professional can create and store anamnesis records.
- [x] **DOCS-06**: Professional can create and store psychological reports.
- [x] **DOCS-07**: Professional can create and store consent-related and service-contract documents.
- [x] **DOCS-08**: Generated documents remain attached to the related patient record with stored provenance for later retrieval.

### Finance

- [x] **FIN-01**: Professional can define session price by appointment or patient context.
- [x] **FIN-02**: Professional can mark a charge as paid, pending, due today, or overdue.
- [x] **FIN-03**: Professional can record payment method including Pix, bank transfer, cash, or other simple options.
- [x] **FIN-04**: Professional can view the patient's payment history and outstanding balances.
- [x] **FIN-05**: Professional can view a monthly summary of sessions completed, amounts received, and amounts pending.

### Remote Care Support

- [x] **ONLN-01**: Professional can store the online session link associated with an appointment.
- [x] **ONLN-02**: Professional can view whether an appointment is online or in-person from agenda and patient context.
- [x] **ONLN-03**: Professional can register remote-session issues such as connection problems in the appointment history.

### Assisted Communication

- [x] **COMM-01**: Professional can open a prefilled reminder or confirmation message for a patient through an external channel such as WhatsApp or email.
- [x] **COMM-02**: Professional can open a prefilled reschedule or cancellation message from the appointment context.
- [x] **COMM-03**: Professional can open a prefilled message to send receipt, declaration, or online-session link.

### Tasks and Reminders

- [x] **TASK-01**: Professional can create reminders linked to a patient, appointment, document, or payment.
- [ ] **TASK-02**: Dashboard highlights overdue payments, upcoming sessions, and pending follow-ups.
- [x] **TASK-03**: Professional can mark reminders as complete without losing their history.

### Dashboard and Search

- [ ] **DASH-01**: Professional sees today's agenda, next appointments, reminders, and payment pendencies on the home screen.
- [ ] **DASH-02**: Professional sees a simple monthly operational summary with active patients, completed sessions, received payments, and pending payments.
- [x] **SRCH-01**: Professional can search patients quickly by name or identifying info.
- [x] **SRCH-02**: Professional can find past sessions, documents, canceled appointments, and pending payments from the product's search/navigation flows.

### Security and Governance

- [x] **SECU-01**: Clinical and financial records are visible only to the authenticated professional who owns the account.
- [x] **SECU-02**: System records an audit trail for sensitive create/update/delete actions on patient, clinical, document, and financial data.
- [x] **SECU-03**: Professional can export patient-related data when necessary.
- [x] **SECU-04**: System provides a backup and recovery path for practice data with restore verification.
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
| CLIN-01 | Phase 3 | Complete |
| CLIN-02 | Phase 3 | Complete |
| CLIN-03 | Phase 3 | Complete |
| CLIN-04 | Phase 3 | Complete |
| CLIN-05 | Phase 3 | Complete |
| DOCS-01 | Phase 4 | Complete |
| DOCS-02 | Phase 4 | Complete |
| DOCS-03 | Phase 4 | Complete |
| DOCS-04 | Phase 4 | Complete |
| DOCS-05 | Phase 4 | Complete |
| DOCS-06 | Phase 4 | Complete |
| DOCS-07 | Phase 4 | Complete |
| DOCS-08 | Phase 4 | Complete |
| FIN-01 | Phase 5 | Complete |
| FIN-02 | Phase 5 | Complete |
| FIN-03 | Phase 5 | Complete |
| FIN-04 | Phase 5 | Complete |
| FIN-05 | Phase 5 | Complete |
| ONLN-01 | Phase 5 | Complete |
| ONLN-02 | Phase 5 | Complete |
| ONLN-03 | Phase 5 | Complete |
| COMM-01 | Phase 5 | Complete |
| COMM-02 | Phase 5 | Complete |
| COMM-03 | Phase 5 | Complete |
| TASK-01 | Phase 6 | Complete |
| TASK-02 | Phase 6 | Pending |
| TASK-03 | Phase 6 | Complete |
| DASH-01 | Phase 6 | Pending |
| DASH-02 | Phase 6 | Pending |
| SRCH-01 | Phase 6 | Complete |
| SRCH-02 | Phase 6 | Complete |
| SECU-01 | Phase 1 | Complete |
| SECU-02 | Phase 1 | Complete |
| SECU-03 | Phase 6 | Complete |
| SECU-04 | Phase 6 | Complete |
| SECU-05 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 51 total
- Mapped to phases: 51
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after Phase 1 completion*
