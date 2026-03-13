# Architecture Research

**Domain:** Secure responsive web SaaS for solo psychologists in Brazil
**Researched:** 2026-03-13
**Confidence:** HIGH

## Standard Architecture

### System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    Responsive Web Application               │
├─────────────────────────────────────────────────────────────┤
│  Dashboard  Patients  Agenda  Notes  Documents  Finance    │
└───────────────┬─────────────────────────────────────────────┘
                │ HTTPS + secure session
┌───────────────▼─────────────────────────────────────────────┐
│                      API / BFF Layer                        │
├─────────────────────────────────────────────────────────────┤
│ Auth │ Patient │ Scheduling │ Clinical │ Documents │ Money  │
└───────────────┬─────────────────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────────────┐
│                    Domain + Worker Layer                    │
├─────────────────────────────────────────────────────────────┤
│ Audit │ Reminders │ Document jobs │ Exports │ Webhooks      │
└───────────────┬─────────────────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────────────┐
│                  PostgreSQL + Private Storage               │
│    relational records, audit trail, files, backup assets   │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Web app | Responsive UX and secure session-driven workflows | Next.js app router with server/client components |
| API/BFF | Validation, auth context, orchestration, domain endpoints | Next.js server routes or separate Node service |
| Patient module | Profiles, summaries, patient lifecycle | Domain services + relational tables |
| Scheduling module | Appointments, recurrence, statuses, conflicts | Domain rules + worker-backed reminders |
| Clinical module | Session records, timeline, retention-aware notes | Relational records plus metadata/audit hooks |
| Documents module | Templates, file metadata, generation, retrieval | Private storage + document service |
| Finance module | Charges, payment status, receipt context | Relational ledger tied to patients/sessions |
| Audit/worker module | Logs, exports, reminders, async jobs | pg-boss/Graphile Worker-style background jobs |

## Recommended Project Structure

```text
apps/
├── web/               # Next.js UI and server-rendered routes
├── api/               # Optional separated API/BFF if the app outgrows in-app routes
└── worker/            # Async jobs, reminders, exports, document tasks

packages/
├── domain/            # Entities, use-cases, policies
├── db/                # Prisma schema, migrations, repositories
├── auth/              # Session, MFA, authorization helpers
├── documents/         # Template and file services
├── notifications/     # Assisted/outbound message helpers
├── payments/          # Payment adapters and reconciliation helpers
├── ui/                # Shared components and design tokens
└── observability/     # Logging, tracing, audit utilities
```

### Structure Rationale

- **`apps/`** separates runtime responsibilities without forcing microservices too early.
- **`packages/domain`** prevents business rules from dissolving into UI handlers.
- **`packages/db`** keeps schema and repositories explicit for future compliance changes.
- **`packages/observability`** centralizes redaction, audit events, and incident-friendly logging.

## Data Flow

### Request Flow

```text
Psychologist action
    ↓
Web route / UI action
    ↓
Validation + auth context
    ↓
Domain service
    ↓
PostgreSQL / private storage
    ↓
Audit event + optional async job
    ↓
Updated UI state
```

### Key Data Flows

1. **Create/update patient:** UI submits patient form -> API validates and authorizes -> patient service persists record -> audit event recorded.
2. **Schedule session:** scheduling service checks conflicts -> persists appointment and recurrence metadata -> queues reminder jobs if needed.
3. **Register session note:** completed session context opens note workflow -> note saved with audit history -> patient timeline updates.
4. **Generate document:** document service loads template + patient/professional/session context -> stores generated file metadata in DB and file in private storage -> audit event recorded.
5. **Mark payment:** finance service updates ledger state -> receipt context becomes available -> dashboard and patient summary update.

## Anti-Patterns

- Microservices before the MVP proves itself.
- Browser-to-database or browser-to-admin-storage shortcuts.
- A single generic `notes` bucket for clinical notes, documents, and legal records.
- Public file links for sensitive documents.
- Route-only authorization with no object-level checks.
- Treating WhatsApp or e-mail as the source of truth instead of the app.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Identity provider | Secure session + MFA integration | Must support strong second factor |
| Private object storage | Signed upload/download URLs | Keep documents private by default |
| Payment provider | Webhook-driven state updates | Pix-capable support is preferred |
| Email / outbound messaging | Assisted sending and reminders | Messaging stays auxiliary, not authoritative |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Web ↔ Domain | direct service calls / API handlers | Keep validation at the edge |
| Domain ↔ DB | repository layer | Explicit boundaries help auditing and future evolution |
| Domain ↔ Worker | durable jobs | Needed for exports, reminders, and document tasks |

## Sources

- `.planning/PROJECT.md`
- OWASP ASVS and authentication/logging guidance
- AWS SaaS and secure storage patterns
- PostgreSQL row-level tenancy guidance
- Brazilian privacy and psychology-practice regulatory context

---
*Architecture research for: secure clinical-practice SaaS*
*Researched: 2026-03-13*
