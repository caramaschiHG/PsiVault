---
phase: 24-wave-2-auth-deduplication
plan: 01
subsystem: middleware
tags: [auth, performance, mfa, jwt]
dependency_graph:
  requires: []
  provides: [middleware-aal-fast-path]
  affects: [src/middleware.ts]
tech_stack:
  added: []
  patterns: [JWT decode from cookie, fast-path early return]
key_files:
  created: []
  modified: [src/middleware.ts]
decisions:
  - "JWT aal claim is safe to read after updateSession() has validated the token via getUser()"
  - "Catch block falls through to full AAL check — no security downgrade on decode failure"
metrics:
  duration: "5m"
  completed: "2026-04-22"
  tasks_completed: 1
  files_changed: 1
---

# Phase 24 Plan 01: JWT AAL Fast-Path in Middleware Summary

**One-liner:** Added JWT decode fast-path in vault middleware to skip `getAuthenticatorAssuranceLevel()` API call for aal2 users, reading the `aal` claim directly from the session cookie.

## What Was Done

### AUTH-01 (documented, no code change)
The `user` object returned by `updateSession()` is already reused directly in the vault routes block — no separate `getUser()` call exists anywhere in `src/middleware.ts`. AUTH-01 was already satisfied; a comment was added documenting this fact.

### AUTH-02 (implemented)
Added a JWT fast-path between the `!user` guard and the `getAuthenticatorAssuranceLevel()` call:

1. `supabase.auth.getSession()` reads the access token from the HttpOnly cookie — no network call.
2. The JWT payload is base64-decoded and the `aal` claim is checked.
3. If `aal === "aal2"`, return early — user already at required level, no API round-trip needed.
4. If decode fails (any exception), fall through to the full `getAuthenticatorAssuranceLevel()` check — no security downgrade possible.
5. aal1 users never match the fast-path condition and always reach the full check + `/mfa-verify` redirect.

## Verification

```
src/middleware.ts:58: if (payload?.aal === "aal2") {
src/middleware.ts:51: const { data: sessionData } = await supabase.auth.getSession();
src/middleware.ts:67: const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
```

- 407 tests pass (36 test files) — baseline preserved, no regression.

## Deviations from Plan

None — plan executed exactly as written.

## Threat Surface

No new network endpoints or auth paths introduced. The JWT decode reads a pre-validated cookie-side token; the existing threat model (T-24-01, T-24-02, T-24-03) covers all cases.

## Self-Check: PASSED

- [x] `src/middleware.ts` contains `payload?.aal === "aal2"`
- [x] `src/middleware.ts` contains `supabase.auth.getSession()`
- [x] `getAuthenticatorAssuranceLevel` still present for fallback
- [x] Auth routes block (Promise.all) untouched
- [x] 407 tests pass
