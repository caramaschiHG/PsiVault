---
phase: 12
slug: authentication-ux
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `pnpm test --run` |
| **Full suite command** | `pnpm test --run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test --run`
- **After every plan wave:** Run `pnpm test --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 12-01-T1 | 01 | 1 | AUTHUX-04 | unit | `pnpm test --run tests/auth-errors.test.ts` | ❌ W0 | ⬜ pending |
| 12-01-T2 | 01 | 1 | AUTHUX-04 | compile | `pnpm tsc --noEmit` | ✅ | ⬜ pending |
| 12-02-T1 | 02 | 2 | AUTHUX-01 | compile | `pnpm tsc --noEmit` | ✅ | ⬜ pending |
| 12-02-T2 | 02 | 2 | AUTHUX-02 | compile | `pnpm tsc --noEmit` | ✅ | ⬜ pending |
| 12-03-T1 | 03 | 2 | AUTHUX-03 | compile | `pnpm tsc --noEmit` | ✅ | ⬜ pending |
| 12-03-T2 | 03 | 2 | AUTHUX-03 | compile | `pnpm tsc --noEmit` | ✅ | ⬜ pending |
| 12-04-T1 | 04 | 2 | AUTHUX-05 | manual | Browser: log in → navigate to /sign-in → verify redirect to /inicio or /mfa-setup | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/auth-errors.test.ts` — testes do mapa `AUTH_ERRORS`: cobertura das mensagens Supabase → pt-BR e fallback genérico (criado na Task 1 do Plan 01, ciclo TDD)

*Existing infrastructure covers vitest setup — only new test files needed.*

*Note: `tests/auth-middleware.test.ts` is NOT required. AUTHUX-05 (middleware redirect) is manual-only per RESEARCH.md — middleware uses Next.js request context + @supabase/ssr which is not unit-testable without integration harness (out of scope for Phase 12).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sign-in form submits and authenticates | AUTHUX-01 | Requires live Supabase session | 1. Open `/sign-in` 2. Enter valid credentials 3. Verify redirect to `/inicio` |
| Sign-in inline error display | AUTHUX-01 | Requires Supabase error response | 1. Submit invalid credentials 2. Verify error block appears below submit button in pt-BR |
| Sign-up creates account | AUTHUX-02 | Requires live Supabase + email | 1. Open `/sign-up` 2. Fill form 3. Verify success state |
| Spinner + inputs disabled during submit | AUTHUX-04 | Visual/timing — hard to automate | 1. Submit any auth form 2. Verify spinner replaces button text + all inputs disabled |
| Password reset email sent | AUTHUX-03 | Requires live Supabase email | 1. Open `/reset-password` (no token) 2. Enter email 3. Verify success message |
| Reset link → new password form | AUTHUX-03 | Requires Supabase callback URL with PKCE code | 1. Follow reset link from email 2. Verify new password form shows 3. Submit new password 4. Verify redirect to `/sign-in?success=...` |
| Expired token message | AUTHUX-03 | Requires expired/used Supabase token | 1. Use expired link 2. Verify "Este link expirou" message with link to `/reset-password` |
| Autenticado redireciona de /sign-in | AUTHUX-05 | Requires active session — middleware not unit-testable without integration harness | 1. Log in 2. Navigate to `/sign-in` 3. Verify redirect to `/inicio` or `/mfa-setup` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
