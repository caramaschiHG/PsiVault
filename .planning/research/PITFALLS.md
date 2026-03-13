# Pitfalls Research

**Domain:** Solo-psychologist practice management, clinical records, privacy, security, scheduling, and document workflows in Brazil
**Researched:** 2026-03-13
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Building a generic CRM instead of a clinical record system

**What goes wrong:**
The product ends up as “calendar + notes” and fails to support proper prontuario and document workflows.

**Why it happens:**
It is easier to model generic entities than distinct clinical and documentary concepts.

**How to avoid:**
Separate patients, appointments, clinical records, issued documents, and finance clearly in the data model and UI.

**Warning signs:**
One generic notes bucket starts absorbing session evolution, declarations, and document text.

**Phase to address:**
Phase 1 and Phase 3

---

### Pitfall 2: Treating LGPD/security as documentation instead of architecture

**What goes wrong:**
The product ships with policies but weak technical control over sensitive data, exports, audit, and access boundaries.

**Why it happens:**
Teams defer privacy work until late because it does not look like visible feature work.

**How to avoid:**
Put auth, auditability, data classification, storage decisions, and export/backup design in the foundation phase.

**Warning signs:**
No clear answer for where data lives, who can access it, how it is exported, or how incidents are handled.

**Phase to address:**
Phase 1

---

### Pitfall 3: Underestimating scheduling reliability

**What goes wrong:**
Recurring appointments, reschedules, no-shows, and reminders become inconsistent, causing trust loss.

**Why it happens:**
Scheduling is treated as a simple CRUD calendar instead of a timeline with operational history.

**How to avoid:**
Model appointment status transitions, recurrence rules, conflict checks, and preserved history explicitly.

**Warning signs:**
Rescheduling overwrites history or reminder state does not match actual patient confirmation.

**Phase to address:**
Phase 2

---

### Pitfall 4: Treating documents as PDF output only

**What goes wrong:**
Generated files lack provenance, wrong modality, or safe retrieval context.

**Why it happens:**
PDF generation feels like “done” even when document semantics and retention are weak.

**How to avoid:**
Model document types, generation context, metadata, and immutable stored versions.

**Warning signs:**
Issued documents remain freely editable with no origin trace.

**Phase to address:**
Phase 4

---

### Pitfall 5: Letting finance sprawl too early

**What goes wrong:**
The finance area balloons into ERP/accounting complexity and pollutes the core product loop.

**Why it happens:**
Payment tracking invites broader billing/tax ambitions once the first ledger exists.

**How to avoid:**
Keep v1 finance tied to session payment state, receipts, and monthly practice visibility only.

**Warning signs:**
Requirements start expanding into bookkeeping, taxes, or advanced charging automation.

**Phase to address:**
Phase 5

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Generic `notes` storage for every artifact | Faster schema start | Weak compliance, retrieval, and provenance | Never |
| Route-level auth only | Faster endpoint delivery | Object-level access gaps for sensitive records | Never |
| Soft-delete as only retention strategy | Simple deletion semantics | Poor legal/operational data lifecycle control | Only as one small part of a wider retention model |
| Request-thread reminders and exports | Less infrastructure upfront | Retry, reliability, and timeout issues | Never for core async work |
| Overloading finance scope early | Feels more complete | Scope explosion and compliance drag | Acceptable only after core loop is stable |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Logging PHI or document content | Sensitive-data exposure in tooling | Structured logs with redaction and strict logging policy |
| Weak object authorization | Unauthorized access to patient data | Object-level checks on every sensitive resource |
| Public file links | Document leakage | Private storage with signed URLs |
| No incident/export auditing | Invisible high-risk actions | Audit exports, downloads, and sensitive view/update flows |
| Reusing production data in non-production contexts | Secondary data exposure | Strict environment separation and sanitized fixtures |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Overly heavy note-entry workflow | Psychologist avoids documenting on time | Optimize for 2-3 minute post-session recording |
| Reminder sent equals attendance confirmed | False sense of control | Keep reminder state separate from confirmation state |
| Hidden privacy posture | Product feels unsafe or vague | Make trust cues and privacy controls visible |
| Confusing document types | Wrong document emitted | Use plain-language guidance and clear template labels |
| Too many modules in v1 | Product feels bloated and cold | Keep the focus on the core office loop |

## "Looks Done But Isn't" Checklist

- [ ] Scheduling supports recurrence, reschedule history, no-shows, and conflict checks
- [ ] Audit trail covers sensitive create/update/delete/export flows
- [ ] Session notes are structured enough for compliant longitudinal records
- [ ] Generated documents have provenance and safe storage metadata
- [ ] Online care has explicit confidentiality and fallback considerations
- [ ] Backup exists and restore has been verified
- [ ] Finance remains within the agreed minimal scope

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Generic CRM instead of clinical system | Phase 1 / Phase 3 | Data model and UI separate clinical/document concepts clearly |
| LGPD/security as afterthought | Phase 1 | Auth, audit, storage, export, and backup decisions are implemented early |
| Scheduling unreliability | Phase 2 | Recurrence, status flow, and conflict handling are tested |
| Documents treated as plain PDFs | Phase 4 | Template, provenance, and immutable retrieval flows work |
| Finance scope creep | Phase 5 | Delivered finance stays tied to session/payment visibility only |

## Sources

- `.planning/PROJECT.md`
- LGPD and ANPD guidance
- CFP/CRP guidance on online care, record handling, and psychological documents
- Receita Federal material for the edge of financial scope
- OWASP logging, authorization, authentication, and key-management guidance

---
*Pitfalls research for: psychology-practice vault SaaS*
*Researched: 2026-03-13*
