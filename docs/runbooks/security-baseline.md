# Security Baseline Runbook

## Purpose

This runbook captures the minimum security and trust posture established in Phase `01-03` so later phases do not quietly erode it.

## Current Security Controls

### Access control

- Authentication is required before vault routes.
- Email verification is required before full vault access.
- MFA is required before full vault access.
- Session validity depends on expiry and revocation state.
- Workspace ownership is explicit and must remain part of domain-level selectors.

### Trust controls

- `/settings/security` shows active sessions in non-technical language.
- Session revocation is a real backend capability in `src/lib/security/session-control.ts`.
- Sensitive actions now have a reusable re-auth guard in `src/lib/security/sensitive-actions.ts`.
- Activity history is rendered from structured audit events, not improvised UI strings.

### Privacy-safe defaults

- Redaction runs before sensitive metadata reaches logs or support-visible operational surfaces.
- Session activity descriptions avoid raw tokens, raw IPs, or sensitive content.
- The activity feed favors summaries that explain intent without showing protected details.

## Operational Rules

### 1. Emit audit events for privileged actions

When a later phase introduces create/update/delete behavior on sensitive entities, emit a structured audit event.
Do not treat a raw application log line as an acceptable substitute.

Minimum expectation:

- stable event type
- actor account/workspace/session
- subject reference when applicable
- human-readable summary
- redacted metadata only

### 2. Redact before logging

Before operational metadata is logged or surfaced outside the primary record context, pass it through `redactForLogs`.

At minimum redact:

- passwords
- secrets
- tokens
- patient-identifying labels
- clinical note content
- diagnosis/symptom details
- IP-like values

If a later phase adds a new sensitive field family, extend the redaction rules in the same change.

### 3. Keep session controls understandable

Session management copy should stay calm:

- explain device/browser access in plain language
- avoid security theater
- never expose raw session tokens
- block revocation of the current session unless a dedicated sign-out flow is being used

### 4. Gate sensitive actions with re-auth

Exports, account-security changes, high-risk edits, and similar actions should use the shared sensitive-action guard.

Expected flow:

1. create challenge
2. request fresh identity confirmation
3. require deliberate confirmation text
4. approve or reject with calm copy

If later phases need a different re-auth window, the change should be explicit and documented.

## Storage and Secrets Guidance

### Relational system of record

Use PostgreSQL/Prisma for:

- identity and ownership
- audit references and metadata
- file/document metadata
- finance and scheduling records

### Secrets

- keep environment secrets out of git
- do not log token plaintext
- store password and reset artifacts as hashes
- keep MFA material protected as encrypted/ciphertext data

### File assets

For signatures and later document assets:

- store file metadata in relational tables
- store binary content in dedicated object storage
- only expose files through authenticated, workspace-checked application paths

## Review Checklist for Later Plans

- Does the change preserve the account/workspace ownership boundary?
- Does it emit audit events for privileged operations?
- Does it redact operational metadata before logging?
- Does it keep secondary surfaces privacy-safe?
- Does it use re-auth for sensitive actions?
- Does it avoid leaking raw tokens, IPs, or clinical details into user-facing trust surfaces?

If any answer is no, the phase is weakening the vault posture and should be corrected before merge.
