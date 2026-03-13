# Feature Research

**Domain:** Digital vault and lightweight practice-management SaaS for solo Brazilian psychologists
**Researched:** 2026-03-13
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Patient record with timeline | The patient is the anchor of the office workflow | MEDIUM | Must summarize clinical, documentary, and financial context quickly |
| Agenda with recurrence and rescheduling | Private practice lives on schedule reliability | MEDIUM | Needs status history, no-show handling, and conflict detection |
| Session records and prontuario | Core clinical value of the product | MEDIUM | Must support fast writing plus structured fields |
| Document generation and storage | Brazilian psychologists issue and store routine documents constantly | MEDIUM | Needs templates, provenance, and future retrieval |
| Basic financial tracking | Professionals need to know who paid and who did not | MEDIUM | Keep language simple and tied to sessions/patients |
| Responsive web UX | Product must work across desktop and mobile browser | LOW | Desktop-first for consultory use, mobile-safe for quick operations |
| Vault baseline | Trust collapses without privacy, auditability, backup, and export | MEDIUM-HIGH | Security must be felt and real |
| Online-care organization | Hybrid care is normal | LOW | Support context and links, not native telehealth |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Vault-first trust surface | Makes privacy, auditability, and export visible instead of invisible plumbing | MEDIUM | Strong product signal for this audience |
| Unified patient timeline | Reduces hunting across modules | MEDIUM | Brings sessions, documents, reminders, and payments together |
| Brazil-native document kit | Feels made for the psychologist's real work | MEDIUM | Plain-language templates and everyday artifacts matter |
| Pix + WhatsApp-adjacent operations | Fits the actual operating rhythm of solo practice in Brazil | MEDIUM | Keep it assistive, not overly automated |
| Low-friction migration mindset | Helps replace paper, Drive folders, and spreadsheets | MEDIUM | Important for adoption and future onboarding |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| AI-generated clinical notes | Sounds modern and time-saving | Trust, scope, and compliance risk too early | Fast manual note workflow |
| Internal chat or inbox | Seems convenient for patient communication | Turns product into another communication channel with higher privacy burden | Assisted outbound messages |
| Built-in telehealth/video | Seems like a natural expansion of online care | Heavy scope and operational complexity | Online-session organization only |
| Multi-user clinic admin | Increases market size on paper | Permissions and tenancy explode early | Solo-practice-first design with future-ready boundaries |
| Advanced BI/ERP | Feels “complete” | Distracts from the core clinical office loop | Simple operational dashboard |

## Feature Dependencies

```text
Authentication / Security
    └──requires──> Patient records
                         ├──requires──> Scheduling
                         │                  └──requires──> Session records
                         ├──requires──> Documents
                         └──requires──> Finance

Scheduling ──enables──> Assisted communication
Scheduling ──enables──> Online-care organization
Patient + Session context ──enables──> Document generation
```

### Dependency Notes

- Security, auth, auditability, and backup underpin every other capability.
- Patient records are the anchor for agenda, notes, documents, reminders, and payment tracking.
- Appointment state is required before session notes, assisted reminders, and payment status make sense.
- Document generation depends on patient and session context plus secure file storage.
- Finance depends on appointment/session context and receipt/document templates.

## MVP Definition

### Launch With (v1)

- [ ] Patient records and patient profile summary
- [ ] Scheduling with recurrence, rescheduling, status handling, and conflict warning
- [ ] Session notes and longitudinal prontuario
- [ ] Broad document kit with templates and secure storage
- [ ] Basic financial tracking with receipt support
- [ ] Security baseline, export, backup, and audit trail
- [ ] Online-care organization and assisted communication

### Add After Validation (v1.x)

- [ ] Better intake/anamnese capture flows
- [ ] Stronger migration/import helpers
- [ ] Selective external integrations where they clearly remove friction

### Future Consideration (v2+)

- [ ] Multi-user clinic mode
- [ ] Built-in telehealth
- [ ] AI note assistance
- [ ] Self-booking and heavier workflow automations

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Patient record + timeline | HIGH | MEDIUM | P1 |
| Scheduling core | HIGH | MEDIUM | P1 |
| Session records | HIGH | MEDIUM | P1 |
| Documents | HIGH | MEDIUM | P1 |
| Finance | HIGH | MEDIUM | P1 |
| Security / audit / export / backup | HIGH | MEDIUM-HIGH | P1 |
| Assisted communication | MEDIUM-HIGH | MEDIUM | P2 |
| Online-care organization | MEDIUM | LOW | P2 |
| Migration helpers | MEDIUM | MEDIUM | P3 |

## Sources

- `.planning/PROJECT.md`
- CFP/CRP guidance on online care and document handling
- ANPD guidance on sensitive data
- Banco Central references for Pix context
- Public feature pages from Brazilian psychology software products

---
*Feature research for: psychology practice vault SaaS*
*Researched: 2026-03-13*
