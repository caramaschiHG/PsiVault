# Phase 01 Vault Foundation

## Runtime Structure

PsiVault currently runs as a Next.js App Router application with TypeScript and Prisma.
The Phase 1 foundation intentionally keeps the runtime small:

- `src/app/` owns route composition and the first authenticated shells.
- `src/lib/auth/` owns account lifecycle, MFA helpers, token helpers, and vault-access decisions.
- `src/lib/security/` owns reusable trust controls that act on sessions and sensitive actions.
- `src/lib/audit/` owns the structured audit contract, activity rendering helpers, and the current repository abstraction.
- `src/lib/logging/` owns redaction rules before sensitive values can leak into logs or secondary UI surfaces.

This is a modular-monolith posture. Later patient, clinical, document, and finance modules should add domain libraries under `src/lib/` and route groups under `src/app/` without moving the auth, audit, or security primitives out of their current boundaries.

## Account, Workspace, Auth, and Session Boundary

The ownership boundary is account-first and workspace-scoped:

- `Account` is the professional identity used for authentication.
- `Workspace` is a one-to-one owner scope for the solo professional in v1.
- `Session` belongs to both `Account` and `Workspace`.
- `VerificationToken`, `PasswordResetToken`, and `MfaEnrollment` remain account-scoped auth artifacts.

Current guarantees:

- Vault routes stay blocked until the account is authenticated, email-verified, and MFA-ready.
- Session validity is determined from expiry and revocation state, not only token presence.
- Workspace ownership remains explicit through `ownerAccountId`, which later domain tables must reference instead of inventing a second ownership model.

Later phases should preserve the rule that every sensitive record resolves through the owning workspace and can be checked against the current authenticated account.

## Storage Baseline

### Relational data

PostgreSQL via Prisma is the relational system of record for:

- account identity
- workspace ownership
- sessions
- verification and recovery tokens
- MFA enrollment material

No separate audit table exists yet. Phase `01-03` introduces the audit event contract and repository abstraction without hard-coding the persistence backend. That keeps later domain work free to choose the final append-only audit storage without redesigning the event shape.

### Secrets and credentials

Sensitive auth material should never be stored as plain operational strings:

- account passwords are stored as hashes
- verification and reset tokens are stored as hashes
- MFA secrets are modeled as ciphertext material

Environment-backed secrets remain outside the repo and outside application logs.

### Future file assets

Signature assets and later document/file uploads should use file-object storage plus metadata in relational tables.
Phase `01-02` already introduces profile-related setup modules, so later file features should preserve this split:

- file metadata in PostgreSQL
- object/blob content in dedicated file storage
- access only through authenticated, workspace-bound application flows

## Logging and Redaction Baseline

`src/lib/logging/redaction.ts` is the current redaction gate for operational logging and audit-adjacent metadata.

Current baseline:

- token-like fields are redacted
- password- and secret-like fields are redacted
- patient-identifying keys are redacted
- note/diagnosis-like content is redacted
- IP-like values are redacted

The rule for later phases is simple: if a value is not required for a human to safely operate the product, it should not appear in logs, secondary UI lists, or support-facing summaries.

## Audit Event Purpose and Reuse

`src/lib/audit/events.ts` defines the canonical event shape:

- stable event `type`
- `actor` scoped to account/workspace/session
- optional `subject`
- human-readable `summary`
- redacted `metadata`
- deterministic rendering helpers for activity surfaces

`src/lib/audit/repository.ts` currently exposes an in-memory repository. This is deliberate: later phases can wire the same event contract into a durable append-only store without changing how domains create or describe events.

Expected reuse:

- patient create/update/archive events
- clinical record creation and edit history
- document generation, replacement, and export actions
- finance status changes
- security and account changes

The audit contract should remain append-oriented and human-readable. Domain code should emit structured events rather than hand-writing raw log strings.

## Trust Surface Baseline

The first visible trust-control surface now lives at `/settings/security`.

Phase `01-03` establishes three user-facing trust primitives:

- human-readable session visibility
- real session revocation logic
- a calm activity feed driven by structured audit events

The intent is discreet control, not forensic overload. Later security UX should remain understandable to a solo psychologist and should avoid exposing technical noise when a plain-language explanation is enough.

## Non-Negotiable Assumptions for Later Phases

- MFA stays mandatory before any vault route.
- Sensitive actions should use re-auth plus deliberate confirmation, not one-click execution.
- Audit history should describe what happened without exposing protected content.
- Secondary surfaces should default to privacy-safe summaries.
- Ownership remains workspace-scoped and explicit in data access code.
- File and document access should inherit the same auth/session boundary already used for vault routes.
