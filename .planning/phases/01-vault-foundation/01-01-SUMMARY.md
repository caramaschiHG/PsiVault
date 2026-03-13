---
phase: 01-vault-foundation
plan: 01
subsystem: auth
tags: [nextjs, prisma, vitest, mfa, session, typescript]
requires: []
provides:
  - Next.js App Router scaffold for PsiVault
  - Prisma account/workspace/session/token baseline
  - TOTP-based MFA and password-recovery domain helpers
  - Protected vault route policy and setup-hub shell
affects: [phase-01-plan-02, phase-01-plan-03, patient-core, document-vault]
tech-stack:
  added: [next, react, prisma, @prisma/client, vitest]
  patterns: [owner-scoped workspace boundary, route-policy auth gating, wave-0 contract tests]
key-files:
  created:
    - package.json
    - prisma/schema.prisma
    - src/lib/auth/session.ts
    - src/lib/auth/tokens.ts
    - src/lib/auth/mfa.ts
    - src/lib/db.ts
    - src/middleware.ts
    - tests/auth-session.test.ts
  modified:
    - next-env.d.ts
    - src/app/layout.tsx
    - src/app/page.tsx
    - src/app/(vault)/setup/page.tsx
key-decisions:
  - "Use TOTP as the first mandatory MFA factor so Phase 1 enforces MFA now without blocking future passkey expansion."
  - "Model a single owner workspace from day one and expose owner-scoped selectors so later domains inherit the account boundary."
  - "Keep vault access policy explicit in shared session helpers and middleware: sign-in, verify-email, then MFA setup."
patterns-established:
  - "Wave 0 tests start as contract coverage and are deepened into behavior tests where the plan demands TDD."
  - "Protected routes depend on session validity plus readiness state, not on ad hoc page-level checks."
requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, SECU-01]
duration: 14min
completed: 2026-03-13
---

# Phase 01 Plan 01: Vault Foundation Summary

**Next.js vault scaffold with Prisma account/workspace schema, TOTP-gated session policy, and Wave 0 auth contract tests**

## Performance

- **Duration:** 14 min
- **Started:** 2026-03-13T14:36:00Z
- **Completed:** 2026-03-13T14:50:33Z
- **Tasks:** 3
- **Files modified:** 26

## Accomplishments

- Bootstrapped PsiVault as a Next.js App Router + TypeScript project with pnpm, Prisma, and Vitest.
- Implemented the foundational auth domain: signup artifacts, secure password hashing/reset flow, persistent session records, TOTP MFA, and explicit vault redirects.
- Established the owner-workspace boundary and turned the protected setup hub into the intended post-auth landing surface for later plans.

## Task Commits

1. **Task 1: Scaffold the web app, workspace model, and Wave 0 test baseline** - `fbb45ab` (`feat`)
2. **Task 2: RED - auth lifecycle tests** - `b3a82fb` (`test`)
3. **Task 2: GREEN - auth lifecycle and protected vault gating** - `af1fd70` (`feat`)
4. **Task 3: Establish ownership boundary and initial app shell** - `000bd49` (`feat`)
5. **Post-verification fix: Next middleware-compatible session helper** - `23907d7` (`fix`)

## Files Created/Modified

- `package.json` - runtime, build, and Vitest entrypoints for the new app scaffold
- `prisma/schema.prisma` - account, workspace, session, verification, reset, and MFA persistence primitives
- `src/lib/auth/config.ts` - shared auth route and session policy constants
- `src/lib/auth/session.ts` - session lifecycle and vault-access decision logic
- `src/lib/auth/tokens.ts` - signup and password-reset token helpers with password hashing
- `src/lib/auth/mfa.ts` - TOTP enrollment, code generation, and verification
- `src/lib/db.ts` - Prisma singleton and owner-scoped workspace helpers
- `src/middleware.ts` - protected-route enforcement for the vault/setup paths
- `src/app/(auth)/*` - sign-up, sign-in, verify-email, reset-password, and MFA setup shells
- `src/app/(vault)/setup/page.tsx` - protected setup hub placeholder for later readiness work
- `tests/auth-session.test.ts` - behavior coverage for signup, session persistence, MFA, recovery, and account boundary

## Decisions Made

- TOTP is the first MFA implementation path because it satisfies the immediate mandatory-MFA requirement and keeps the model extensible.
- Workspace ownership is explicit in both schema and code so later patient, document, and finance records can inherit a stable owner boundary.
- The public root shell points professionals toward `/vault/setup` after authentication, preserving a single post-auth entry point for Phase 1.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Corrected the signup slug helper syntax**
- **Found during:** Task 2 (auth lifecycle implementation)
- **Issue:** The new signup/token helper used an invalid `||` and `??` combination, preventing the focused auth suite from loading.
- **Fix:** Parenthesized the email fallback branch in `createSlug` so the helper compiles and the RED/GREEN cycle can proceed.
- **Files modified:** `src/lib/auth/tokens.ts`
- **Verification:** `pnpm vitest run tests/auth-session.test.ts`
- **Committed in:** `af1fd70`

**2. [Rule 3 - Blocking] Made the shared session helper safe for Next middleware builds**
- **Found during:** Final verification after Task 3
- **Issue:** `pnpm build` failed because the middleware bundle inherited a Node-only crypto import from `src/lib/auth/session.ts`.
- **Fix:** Replaced the Node-specific random ID generator with a Web Crypto implementation compatible with the middleware runtime.
- **Files modified:** `src/lib/auth/session.ts`, `next-env.d.ts`
- **Verification:** `pnpm build` and `pnpm test`
- **Committed in:** `23907d7`

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes were required for a working scaffold and did not expand scope beyond the planned auth/session baseline.

## Issues Encountered

- Initial `pnpm install` failed inside the sandbox due registry DNS restrictions; installation completed after rerunning with approved escalation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 1 now has a stable runtime, auth boundary, protected setup route, and test harness for the professional-profile and audit-focused follow-up plans.
- The remaining setup-readiness and audit tests are still contract placeholders and should be expanded by Plans `01-02` and `01-03`.

## Self-Check

PASSED
