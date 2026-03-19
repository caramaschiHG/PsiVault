# PsiVault

## What This Is

PsiVault is a digital vault for Brazilian psychologists who run their own practice. It brings patients, schedule, clinical notes, documents, simple financial tracking, operational reminders, and backup/export into one discreet and professional web app so the psychologist can attend well, document safely, and stop losing information across scattered tools.

**Status: v1.0 shipped (2026-03-15).** The complete office loop — create patient, schedule session, register the session, issue a professional document, track payment, and find anything later — is fully functional and launch-ready.

## Current Milestone: v1.2 Lançamento

**Goal:** Ship PsiVault to real users — complete all remaining Supabase persistence, add professional authentication UX, apply full UI/UX polish, and harden the app to production standards.

**Current unarchived launch scope:** phases `07`–`20` in `.planning/phases/`, with Phase 15 focused on planning metadata realignment before the remaining verification and launch sign-off phases.

**Target features:**
- Complete Supabase persistence for all remaining domains (Clinical, Document, Finance, Ops, Audit)
- Professional authentication UX — real login, signup, and password reset flows with Supabase Auth
- Full UI/UX polish — design system, typography, color, responsive layout, accessibility
- Production best practices — error handling, security hardening, code quality, performance
- Production deployment readiness

**Merges remaining v1.1 work (phases 07–11) with the v1.2 polish and verification layers into one coherent launch release.**

## Core Value

The psychologist can finish a session, register everything correctly in a few minutes, and trust that the clinical and operational history is safe, findable, and under control.

## Requirements

### Validated

- ✓ A solo Brazilian psychologist can manage patients, sessions, clinical records, key documents, and simple payment tracking in one responsive web app — v1.0
- ✓ The product supports the real rhythm of Brazilian private practice, including recurring appointments, rescheduling, WhatsApp-adjacent workflows, Pix-oriented payment tracking, and hybrid online/presential care — v1.0
- ✓ Sensitive health data is treated like a vault from day one, with strong access protection, auditability, backup/export paths, and a UX that communicates discretion and trust — v1.0

### Active

- [ ] Setup Supabase project and Prisma schema
- [ ] Migrate Patient & Agenda domains to Supabase
- [ ] Migrate Clinical Record & Document domains to Supabase
- [ ] Migrate Finance & Ops domains to Supabase
- [ ] Establish authentication/workspace bindings with Supabase

### Out of Scope

- AI-generated clinical writing — excluded from v1 to avoid trust, compliance, and scope risks before the core workflow is proven.
- Internal chat or social-style messaging — excluded from v1 because the product should centralize useful communication, not become another inbox.
- Multi-user clinic management — excluded from v1 to keep the initial product focused on the solo professional and avoid premature permissions complexity.
- Large-clinic operations, deep integrations, and advanced analytics — excluded from v1 because they are not required to validate the product's core value.
- Built-in teleconferencing platform — excluded from v1; online care support is organizational, not a full video stack.

## Context

**Current codebase state (v1.0):**
- ~15,935 lines of TypeScript/TSX across 214 files
- Stack: Next.js 15 App Router, Vitest, in-memory repositories (DB-swap ready), inline styles
- 289 tests green across all domains
- 6 phases, 21 plans, 116 commits over 2 days

**Architecture decisions that shaped v1:**
- In-memory repositories throughout — all repositories follow the same interface pattern, making future DB swap straightforward
- Server-only data model — no domain state leaks to client components; client islands only where interactivity is unavoidable
- SECU-05 enforced at the type level — SearchResultItem, audit events, and dashboard aggregations exclude clinical and financial content by type
- v1 workspace stub (`WORKSPACE_ID = "ws_1"`) — intentional; production multi-tenancy swap is a single-point replacement per domain

**Known v1 technical debt for next milestone:**
- Re-auth gate in export/backup routes uses a cookie stub instead of the full `evaluateSensitiveAction` from `src/lib/security/sensitive-actions.ts`
- Workspace backup omits audit trail (`auditEvents: never[]`) — documented as v1 limitation with production-replacement comment
- All domain repositories are in-memory — no persistence across restarts (expected for MVP validation phase)

## Constraints

- **Platform**: Responsive web app first — chosen for fastest validated delivery across desktop and mobile browser usage.
- **Audience**: Solo psychologist in Brazil — the product must optimize for one professional account before expanding to clinic/team models.
- **Security**: Maximum-from-day-one posture for sensitive data — health-related information demands stronger protection, audit history, and operational trust from the start.
- **Scope**: Lightweight office system, not a bloated ERP — every v1 feature must support the core clinical/operational loop directly.
- **Go-to-market**: MVP for market validation — enough breadth to prove value, but without side modules that dilute focus.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build web-first, responsive | Faster launch and easier use across desktop consultory workflow and mobile check-ins | ✓ Good — delivered in 2 days; no mobile friction reported |
| Target solo psychologists first | Keeps permissions, tenancy, and workflow complexity contained while matching the clearest initial user | ✓ Good — single-workspace model stayed clean throughout all 6 phases |
| Include the full office loop in v1 | Validation requires the app to feel truly useful, not like an incomplete notes tool | ✓ Good — all 5 loop stages (create patient → schedule → record → document → pay) shipped |
| Keep communication as assisted outbound flows | WhatsApp/e-mail support is useful, but chat infrastructure would distract from the product core | ✓ Good — communication actions opened correct prefilled flows without building an inbox |
| Treat security and auditability as a first-class foundation | The product handles sensitive health data and must feel like a vault, not an improvised notebook | ✓ Good — audit trail, SECU-05 type enforcement, re-auth gate, MFA all in place from Phase 1 |
| Support broad document workflows in v1 | Documents are central to the psychologist's real work and part of the product's operational value | ✓ Good — 5 document types, template-driven generation, full retrieval surface shipped |
| In-memory repositories + DB-swap-ready interfaces | Fastest path to end-to-end working product without a Prisma/DB integration blocking domain work | ✓ Good — all 6 phases executed without DB blocking; swap path is single-point per domain |
| SECU-05 enforced at type level | Prevent accidental clinical/financial leakage to search, dashboard, or audit surfaces | ✓ Good — SearchResultItem type and audit contracts prevent leakage by construction |
| Next.js nested layouts for settings sub-nav | One new `layout.tsx` file applies sub-navigation to all `/settings/*` routes automatically | ✓ Good — zero modifications to existing pages needed; gap closed in 1 task |

---
*Last updated: 2026-03-17 after v1.2 milestone defined*
