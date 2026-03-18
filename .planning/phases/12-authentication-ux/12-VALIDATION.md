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
| 12-01-01 | 01 | 1 | AUTHUX-05 | unit | `pnpm test --run tests/auth-middleware.test.ts` | ❌ W0 | ⬜ pending |
| 12-01-02 | 01 | 1 | AUTHUX-01 | manual | Browser: navigate to /login, submit form | ✅ | ⬜ pending |
| 12-02-01 | 02 | 1 | AUTHUX-02 | manual | Browser: navigate to /sign-up, submit form | ✅ | ⬜ pending |
| 12-03-01 | 03 | 1 | AUTHUX-03 | manual | Browser: request password reset email | ✅ | ⬜ pending |
| 12-03-02 | 03 | 1 | AUTHUX-03 | manual | Browser: follow reset link, set new password | ✅ | ⬜ pending |
| 12-04-01 | 04 | 2 | AUTHUX-04 | manual | Browser: visit /login as logged-in user → redirects to /inicio | ✅ | ⬜ pending |
| 12-04-02 | 04 | 2 | AUTHUX-05 | unit | `pnpm test --run tests/auth-errors.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/auth-middleware.test.ts` — testes do middleware: redirect de autenticado para `/inicio` ou `/mfa-setup` em rotas (auth)
- [ ] `tests/auth-errors.test.ts` — testes do mapa `AUTH_ERRORS`: cobertura das mensagens Supabase → pt-BR e fallback genérico

*Existing infrastructure covers vitest setup — only new test files needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sign-in form submits and authenticates | AUTHUX-01 | Requires live Supabase session | 1. Open `/login` 2. Enter valid credentials 3. Verify redirect to `/inicio` |
| Sign-in inline error display | AUTHUX-01 | Requires Supabase error response | 1. Submit invalid credentials 2. Verify error block appears below submit button in pt-BR |
| Sign-up creates account | AUTHUX-02 | Requires live Supabase + email | 1. Open `/sign-up` 2. Fill form 3. Verify success state |
| Password reset email sent | AUTHUX-03 | Requires live Supabase email | 1. Open `/reset-password` (no token) 2. Enter email 3. Verify success message |
| Reset link → new password form | AUTHUX-03 | Requires Supabase callback URL with PKCE code | 1. Follow reset link from email 2. Verify new password form shows 3. Submit new password 4. Verify redirect to `/sign-in?success=...` |
| Expired token message | AUTHUX-03 | Requires expired/used Supabase token | 1. Use expired link 2. Verify "Este link expirou" message with link to `/reset-password` |
| Spinner during form submit | AUTHUX-04 | Visual/timing — hard to automate | 1. Submit any auth form 2. Verify spinner replaces button text + inputs disabled |
| Autenticado redireciona de /login | AUTHUX-05 | Requires active session | 1. Log in 2. Navigate to `/login` 3. Verify redirect to `/inicio` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
