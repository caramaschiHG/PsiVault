# Project Research Summary

**Project:** PsiVault
**Domain:** Secure digital vault and lightweight practice-management SaaS for solo Brazilian psychologists
**Researched:** 2026-03-13
**Confidence:** HIGH

## Executive Summary

PsiVault fits the pattern of a web-first, security-heavy SaaS with a relatively standard application architecture but unusually high sensitivity around data, documentation quality, and trust cues. The recommended implementation is a modular monolith with strong authentication, auditability, private file storage, and a relational core centered on patients, appointments, clinical records, documents, and simple finance.

Research reinforces that the product should behave like a clinical vault, not a generic office CRM. The launch must cover table-stakes office workflows for Brazilian solo psychologists, while explicitly avoiding distracting modules such as chat, embedded telehealth, AI note-writing, or clinic-wide administration.

The main risk is not lack of features; it is shipping a product that looks polished but is weak on record semantics, scheduling reliability, provenance of documents, or practical privacy control. The roadmap should therefore front-load security and operational correctness before broader comfort features.

## Key Findings

### Recommended Stack

Use a web-first TypeScript stack with Next.js, PostgreSQL, Auth.js-backed MFA, private object storage, and Postgres-backed background jobs. This provides the fastest route to a polished responsive product while keeping strong control over sensitive records, document storage, auditability, and future SaaS boundaries.

**Core technologies:**
- Next.js + React + TypeScript: responsive product shell and server-driven workflows
- PostgreSQL: operational source of truth for patient, agenda, clinical, document, and finance records
- Private object storage: document files, exports, backups, and signed access
- Auth.js + MFA: secure session model aligned with vault positioning
- Background jobs: reminders, document jobs, exports, and operational async work

### Expected Features

**Must have (table stakes):**
- Patient record with clear summary and timeline
- Scheduling with recurrence, rescheduling, and status handling
- Session records and prontuario
- Document templates and secure storage
- Basic financial tracking and receipts
- Security baseline with audit, backup, and export

**Should have (competitive):**
- Vault-first trust cues
- Unified patient timeline
- Brazil-native document kit
- Pix/WhatsApp-adjacent assistive operations
- Hybrid-care organization without telehealth bloat

**Defer (v2+):**
- Multi-user clinic mode
- Built-in telehealth
- AI note generation
- Heavy integrations and advanced analytics

### Architecture Approach

The product should start as a modular monolith. Keep the web app, domain services, background jobs, relational data, private storage, and observability separate in structure, but not split into microservices. Model `workspace_id` and strict authorization now so the MVP remains compatible with future SaaS evolution without carrying clinic complexity in v1.

**Major components:**
1. Web application — responsive UI and secure workflows
2. API/BFF + domain services — orchestration, validation, authorization
3. Postgres + private storage — source of truth and files
4. Worker/audit layer — reminders, exports, document jobs, operational history

### Critical Pitfalls

1. **Generic CRM architecture** — avoid collapsing clinical and document concepts into generic notes
2. **Late privacy/security work** — make auth, audit, export, backup, and storage decisions foundational
3. **Under-modeled scheduling** — recurrence, status transitions, and preserved history are core
4. **Documents as PDF-only output** — provenance and retrieval context matter as much as generation
5. **Finance scope creep** — keep finance minimal and tied to the session/payment loop

## Implications for Roadmap

### Phase 1: Vault Foundation
**Rationale:** Security, tenancy boundaries, audit, storage, and professional setup underpin every other feature.
**Delivers:** Auth, MFA, account/professional setup, sensitive-data boundaries, audit trail baseline.
**Addresses:** Authentication and core security requirements.
**Avoids:** Privacy theater and weak vault positioning.

### Phase 2: Patients and Scheduling Core
**Rationale:** The office loop starts with patient context and reliable agenda behavior.
**Delivers:** Patient records, summaries, appointment lifecycle, recurrence, and conflict prevention.
**Uses:** Postgres relational model and date/time rules.
**Implements:** Patient and scheduling modules.

### Phase 3: Clinical Record Core
**Rationale:** The product becomes clinically useful only once session evolution is captured well.
**Delivers:** Session note workflow, structured/freeform records, patient timeline.
**Avoids:** Generic note modeling and weak documental continuity.

### Phase 4: Document Vault
**Rationale:** Documents are central to the psychologist's real work and a key differentiator.
**Delivers:** Template-driven document generation, secure storage, provenance, patient-linked retrieval.
**Uses:** Private storage, document service, and contextual template filling.

### Phase 5: Finance and Assisted Operations
**Rationale:** Finance closes the office loop, and assisted communication should build on stable schedule/document flows.
**Delivers:** Payment states, receipts, online-care organization, and message assistance.
**Avoids:** Finance bloat and premature communication complexity.

### Phase 6: Recovery, Search, and Launch Polish
**Rationale:** Search, dashboard, backup/export confidence, and launch readiness depend on stable prior domains.
**Delivers:** Dashboard, transversal retrieval, reminders, export/backup confidence, final trust polish.

### Phase Ordering Rationale

- Security and tenancy boundaries come first because every later domain touches sensitive data.
- Patient and schedule modules must precede records, documents, and finance because they provide the primary context.
- Clinical notes should exist before rich documents so document generation can rely on strong source records.
- Finance and assisted communication should layer on top of stable appointment and patient states.
- Search/export/polish should close the roadmap because they depend on all major data domains existing.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** infrastructure/security implementation details, especially hosting and key management
- **Phase 4:** exact document taxonomy and provenance rules
- **Phase 5:** finance boundaries, Pix-adjacent behavior, and Receita-related limits

Phases with standard patterns:
- **Phase 2:** patient and scheduling CRUD + workflow patterns
- **Phase 3:** structured/freeform record patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Strong modern web/SaaS fit |
| Features | MEDIUM | Solid domain fit; competitor evidence is lighter than official security/compliance guidance |
| Architecture | HIGH | Standard secure modular-monolith pattern |
| Pitfalls | HIGH | Domain and compliance risks are clear and concrete |

**Overall confidence:** HIGH

### Gaps to Address

- Confirm final infrastructure choice and hosting region strategy during Phase 1 planning.
- Validate document taxonomy and retention/provenance decisions against the exact desired product/legal posture.
- Keep finance scope intentionally narrow during Phase 5 planning.

## Sources

### Primary (HIGH confidence)
- `.planning/PROJECT.md`
- LGPD / ANPD guidance
- CFP / CRP materials on records, online care, and documents
- OWASP security guidance

### Secondary (MEDIUM confidence)
- Public feature pages from Brazilian psychology software products
- Pix ecosystem references from Banco Central

---
*Research completed: 2026-03-13*
*Ready for roadmap: yes*
