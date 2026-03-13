# PsiVault

## What This Is

PsiVault is a digital vault for Brazilian psychologists who run their own practice. It brings patients, schedule, clinical notes, documents, simple financial tracking, and operational reminders into one discreet and professional web app so the psychologist can attend well, document safely, and stop losing information across scattered tools.

The product is positioned as a lightweight digital office for solo practice, not a cold enterprise clinic system. It should feel secure, simple, organized, and elegant without excess.

## Core Value

The psychologist can finish a session, register everything correctly in a few minutes, and trust that the clinical and operational history is safe, findable, and under control.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] A solo Brazilian psychologist can manage patients, sessions, clinical records, key documents, and simple payment tracking in one responsive web app.
- [ ] The product supports the real rhythm of Brazilian private practice, including recurring appointments, rescheduling, WhatsApp-adjacent workflows, Pix-oriented payment tracking, and hybrid online/presential care.
- [ ] Sensitive health data is treated like a vault from day one, with strong access protection, auditability, backup/export paths, and a UX that communicates discretion and trust.

### Out of Scope

- AI-generated clinical writing — excluded from v1 to avoid trust, compliance, and scope risks before the core workflow is proven.
- Internal chat or social-style messaging — excluded from v1 because the product should centralize useful communication, not become another inbox.
- Multi-user clinic management — excluded from v1 to keep the initial product focused on the solo professional and avoid premature permissions complexity.
- Large-clinic operations, deep integrations, and advanced analytics — excluded from v1 because they are not required to validate the product's core value.
- Built-in teleconferencing platform — excluded from v1; online care support is organizational, not a full video stack.

## Context

PsiVault starts as a concept-stage SaaS MVP intended to validate demand with autonomous psychologists in Brazil. The core product hypothesis is that many professionals currently split patient data, notes, schedule, receipts, documents, and reminders across WhatsApp, calendars, paper notes, cloud drives, and improvised spreadsheets, creating friction, risk, and loss of control.

The strongest product signals in discovery are:
- private and updated clinical records matter structurally to practice, not as an optional extra;
- documents such as declarations, receipts, reports, anamnesis, and consent-related materials are central to the day-to-day workflow;
- hybrid care is common, but the product should organize remote appointments rather than overreach into heavy telehealth infrastructure;
- the product must feel local to Brazilian practice, including plain-language financial tracking and communication patterns built around WhatsApp and Pix.

The first launch is defined as a complete office flow: create patient, schedule session, register the session, issue a professional document, and mark financial status. If that loop is solid and trustworthy, the MVP is doing its job.

## Constraints

- **Platform**: Responsive web app first — chosen for fastest validated delivery across desktop and mobile browser usage.
- **Audience**: Solo psychologist in Brazil — the product must optimize for one professional account before expanding to clinic/team models.
- **Security**: Maximum-from-day-one posture for sensitive data — health-related information demands stronger protection, audit history, and operational trust from the start.
- **Scope**: Lightweight office system, not a bloated ERP — every v1 feature must support the core clinical/operational loop directly.
- **Go-to-market**: MVP for market validation — enough breadth to prove value, but without side modules that dilute focus.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build web-first, responsive | Faster launch and easier use across desktop consultory workflow and mobile check-ins | — Pending |
| Target solo psychologists first | Keeps permissions, tenancy, and workflow complexity contained while matching the clearest initial user | — Pending |
| Include the full office loop in v1 | Validation requires the app to feel truly useful, not like an incomplete notes tool | — Pending |
| Keep communication as assisted outbound flows | WhatsApp/e-mail support is useful, but chat infrastructure would distract from the product core | — Pending |
| Treat security and auditability as a first-class foundation | The product handles sensitive health data and must feel like a vault, not an improvised notebook | — Pending |
| Support broad document workflows in v1 | Documents are central to the psychologist's real work and part of the product's operational value | — Pending |

---
*Last updated: 2026-03-13 after project initialization*
