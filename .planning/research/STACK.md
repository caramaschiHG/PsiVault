# Stack Research

**Domain:** Responsive web SaaS for solo Brazilian psychologists handling sensitive clinical data, documents, scheduling, and basic payment tracking
**Researched:** 2026-03-13
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js + React + TypeScript | Next.js 15, React 19, TypeScript 5 | Responsive web app and server-rendered product shell | Fastest path to a polished web-first product with strong typing, App Router, and mature SaaS patterns |
| PostgreSQL | 16 | Source of truth for transactional practice data | Strong fit for relational patient/scheduling/document/finance flows and future row-level tenancy boundaries |
| Auth.js + WebAuthn/TOTP | Auth.js current, SimpleWebAuthn current | Authentication, secure sessions, MFA | Matches the “vault” requirement with secure cookies, session control, and strong second factor options |
| Private object storage | S3-compatible | Document storage, exports, backups | Supports private files, signed URLs, retention controls, and versioned storage for sensitive artifacts |
| pg-boss or Graphile Worker | current | Background jobs | Lets the MVP run reminders, exports, document workflows, and audit fan-out without premature infra sprawl |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Prisma ORM | current | Database schema and access | Use for the main operational data model and migrations |
| Zod | current | Runtime validation | Use at API boundaries and form parsing |
| React Hook Form | current | Form state | Use for patient, appointment, and document forms |
| Tailwind CSS + shadcn/ui | Tailwind 4-compatible stack | UI system | Use for a controlled design system with fast implementation |
| Pino | current | Structured logging | Use with PHI redaction for operational logs |
| OpenTelemetry | current | Tracing and observability | Use for request tracing, background jobs, and incident analysis |
| date-fns + date-fns-tz | current | Date/time handling | Use for scheduling, recurrence, and timezone-safe UI logic |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| pnpm | Package management | Good workspace support if the codebase grows into `apps/` + `packages/` |
| Docker + Compose | Local/runtime parity | Useful for local Postgres, worker, and app orchestration |
| Vitest + Testing Library | Unit and UI testing | Keep domain logic and UI states covered early |
| Playwright | End-to-end verification | Critical for core office-loop regression tests |
| ESLint + Prettier | Code quality | Keep the new codebase consistent from day one |
| GitHub Actions | CI | Run lint, type-check, test, and basic build verification |

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js full-stack web app | Next.js + NestJS | Better if a public API or multiple clients are definitely near-term |
| PostgreSQL | Firestore/Firebase | Only if the product intentionally optimizes for loose mobile sync over relational consistency; not recommended here |
| Auth.js + MFA | Custom auth | Only if regulation or SSO requirements force bespoke identity behavior later |
| pg-boss / Graphile Worker | External queue stack | Use only when job volume or infrastructure complexity genuinely outgrows Postgres-backed jobs |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Firestore as primary clinical datastore | Weak fit for relational records, traceability, and document/finance joins | PostgreSQL |
| localStorage for auth or clinical cache | High exposure risk for sensitive data | Secure cookie sessions and controlled server-side fetches |
| Microservices/Kubernetes in v1 | Too much operational cost for an MVP | Modular monolith |
| Generic public file URLs | Poor control over sensitive documents | Private storage with expiring signed URLs |
| SMS/WhatsApp as primary MFA | Lower assurance and privacy/control risks | Passkeys or TOTP |

## Sources

- `.planning/PROJECT.md` — project direction and constraints
- LGPD — legal basis for sensitive data handling
- ANPD security and transfer guidance
- CFP/CRP guidance on record custody and online care
- Next.js self-hosting docs
- Prisma + Auth.js integration docs
- PostgreSQL row-level security docs
- OWASP authentication guidance

---
*Stack research for: responsive clinical-practice SaaS*
*Researched: 2026-03-13*
