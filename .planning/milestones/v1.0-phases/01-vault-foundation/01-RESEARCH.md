# Phase 1: Vault Foundation — Research

**Researched:** 2026-03-13
**Domain:** Greenfield vault foundation for a secure web SaaS for solo Brazilian psychologists: app scaffold, authentication and MFA baseline, professional setup hub, audit/event model, sensitive-data boundaries, and trust-surface primitives
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | Professional can create an account with email and password | Standard secure web auth flow documented; use email/password signup plus email verification |
| AUTH-02 | Professional can sign in and stay signed in across browser refreshes | Session-cookie architecture and server-validated sessions are standard and appropriate |
| AUTH-03 | Professional must complete a second authentication factor to access clinical data | MFA before vault access is supported by passkeys/WebAuthn or TOTP patterns |
| AUTH-04 | Professional can reset password through a secure recovery flow | Reset-token and verified-email recovery are standard, low-risk patterns |
| PROF-01 | Professional can store and edit profile details including full name, CRP, contact data, and signature assets | Professional profile should be modeled as account-owned practice identity data |
| PROF-02 | Professional can configure default appointment duration, session price, and service preferences used across the app | Setup hub can capture lightweight practice defaults without entering later module scope |
| SECU-01 | Clinical and financial records are visible only to the authenticated professional who owns the account | Single-workspace ownership boundary and object-level authorization must be established now |
| SECU-02 | System records an audit trail for sensitive create/update/delete actions on patient, clinical, document, and financial data | Audit event architecture should be introduced in foundation to avoid retrofitting later |
| SECU-05 | System avoids unnecessary sensitive data exposure in lists, notifications, and secondary UI surfaces | Trust surface and privacy-safe UI defaults must be designed from the first scaffold |

</phase_requirements>

---

## Summary

Phase 1 is the global blocker for PsiVault because every later capability depends on a secure, identity-aware foundation. The recommended approach is to start with a modular-monolith TypeScript stack using Next.js, PostgreSQL, Auth.js-compatible session architecture, MFA, and a clear separation between account identity, practice profile, and future clinical domains.

The user locked several non-negotiables in `01-CONTEXT.md`: classic email/password signup, email verification, mandatory MFA before any vault access, persistent sessions with re-auth on sensitive actions, multi-device visibility/revocation, a guided setup checklist, and a dedicated setup hub instead of the normal dashboard. These decisions are now fixed input to planning.

The main planning implication is that Phase 1 should not try to solve “all privacy and compliance,” but it must create the primitives that make later phases safe: session model, account/workspace boundary, professional profile setup, audit/event logging contract, and privacy-safe UI defaults. The product must feel calm and trustworthy, not enterprise-heavy or security-alarmist.

---

## Standard Stack

### Core (Phase 1 scope)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x | Web app scaffold, routing, server actions/API handlers | Strong web-first fit for authenticated SaaS with setup and settings flows |
| React | 19.x | UI composition | Modern app baseline with mature ecosystem |
| TypeScript | 5.x | Type safety | Needed to keep auth, audit, and future domain boundaries explicit |
| PostgreSQL | 16.x | Account/profile/audit persistence | Best fit for future relational clinical and financial domains |
| Prisma | current | Schema and data access | Fastest path to a typed greenfield data model |
| Auth.js | current | Session/auth foundation | Works well with Next.js and secure session-cookie flows |
| SimpleWebAuthn and/or TOTP library | current | MFA implementation | Supports the “MFA before vault access” requirement |
| Tailwind CSS + shadcn/ui | current | Initial design system | Good fit for building a calm, intentional setup and settings UX |

### Supporting

| Library | Purpose | When to Use |
|---------|---------|-------------|
| Zod | Runtime validation | Form and API boundary validation |
| React Hook Form | Form state | Guided checklist/setup flow |
| Pino | Structured logging | Application logs with redaction |
| OpenTelemetry | Tracing | Request and audit-path observability |
| pg-boss / Graphile Worker | Background jobs | Not required to ship all jobs in Phase 1, but useful if re-auth/session notifications grow |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Next.js + Auth.js | External hosted auth platform | Faster security hardening, but more vendor coupling and product-surface fragmentation |
| Prisma | Drizzle | Drizzle is viable, but Prisma remains a faster greenfield default for typed schema work |
| WebAuthn + TOTP flexibility | TOTP only | Simpler, but less future-friendly for stronger trust posture |

**Recommendation:** Plan Phase 1 around Next.js + TypeScript + PostgreSQL + Prisma + Auth.js-compatible secure sessions, with MFA choice left to planner discretion inside the already locked “mandatory before access” boundary.

---

## Architecture Patterns

### Pattern 1: Account + practice profile split

**What:** Separate identity/account data from practice profile data.
**Why:** Auth lifecycle and practice identity (name, CRP, defaults, signature assets) evolve differently and should not collapse into a single generic user record.

### Pattern 2: Setup hub as stateful checklist

**What:** Treat onboarding as a guided readiness flow with explicit completion states.
**Why:** The user chose a dedicated setup hub and a “vault readiness” concept, not just a one-shot profile form.

### Pattern 3: Sensitive action re-auth boundary

**What:** Keep everyday sessions persistent, but define a reusable re-auth gate for exports, account-security changes, and similarly risky flows.
**Why:** This balances low-friction daily use with strong vault behavior.

### Pattern 4: Human-readable audit model

**What:** Record machine-usable audit events, but design the schema so a user-facing “activity history” view can later render them in plain language.
**Why:** The user explicitly wants auditability to be visible and understandable, not just buried for compliance.

---

## Planning Implications

### Recommended plan breakdown

1. **Scaffold + auth/session baseline**
   - App runtime, typed DB/schema baseline, secure session architecture, signup/login/recovery path, MFA gating stub or full implementation path, basic route protection.
2. **Practice setup hub**
   - Guided setup shell, profile/practice defaults, readiness state, dedicated post-auth landing area.
3. **Audit + privacy-safe trust surface**
   - Audit event contract, redacted logging baseline, session visibility/revocation UX, privacy-safe defaults for future lists/secondary surfaces.

### Recommended wave structure

- **Wave 1:** Scaffold/auth/session baseline
- **Wave 2:** Practice setup hub + audit/trust primitives in parallel, both depending on Wave 1

### Open decisions still safe for planner discretion

- Exact MFA factor chosen first (passkey-first, TOTP-first, or both)
- Exact UI composition and checklist step order
- Exact implementation of the human-readable activity feed, as long as the event model supports it

---

## Validation Architecture

Phase 1 should establish Wave 0 test infrastructure because there is no codebase yet.

### Required verification layers

1. **Unit / integration baseline**
   - Auth/session utilities
   - Setup readiness logic
   - Audit event creation helpers
2. **Route / page verification**
   - Signup/login/setup screens render and protect transitions correctly
3. **Manual verification**
   - Trust surface tone feels calm and professional
   - Setup hub reads as “prepare your vault,” not “enterprise admin”

### Wave 0 recommendation

- Install and configure test runner in the same plan that scaffolds the app
- Add at least one test file each for auth/session behavior, setup readiness logic, and audit event creation contract
- Keep one short automated command for per-task verification and one fuller command for per-wave verification

### Manual-only checks likely needed

- Trust-surface wording and information density
- Perceived calmness of re-auth/confirmation flows
- Setup hub emotional framing

---

## Risks and Pitfalls Specific to Phase 1

- Building auth and account setup without a clear future workspace boundary creates pain for every later domain.
- Treating audit logging as raw developer logs instead of a proper event model will block the human-readable activity surface.
- Shipping a setup flow that feels bureaucratic or incomplete undermines the “vault” promise immediately.
- Letting sensitive information leak into list placeholders, error states, or session indicators weakens trust before the product has earned it.

---

## Sources

- `.planning/PROJECT.md`
- `.planning/phases/01-vault-foundation/01-CONTEXT.md`
- `.planning/research/SUMMARY.md`
- `.planning/research/STACK.md`
- `.planning/research/ARCHITECTURE.md`
- `.planning/research/PITFALLS.md`

---
*Research completed: 2026-03-13*
*Ready for planning: yes*
