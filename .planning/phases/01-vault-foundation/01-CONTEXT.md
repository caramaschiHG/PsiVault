# Phase 1: Vault Foundation - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers the vault foundation for PsiVault: secure account creation and access, MFA before any vault entry, professional setup basics, audit/event visibility foundations, and the product/security baseline that every later patient, record, document, and finance flow will rely on.

</domain>

<decisions>
## Implementation Decisions

### Access flow
- Account creation should use the classic path: email + password + email verification.
- MFA must be mandatory before the professional can access any vault area.
- Sessions should stay active for practical day-to-day use, but sensitive actions must require calm re-authentication.
- The account should support multiple active devices, but the professional must be able to see and revoke active sessions.

### Setup flow
- First setup should be a guided checklist, not a single long form or a barely-configured quick start.
- The vault is not considered ready until the professional completes identity, CRP, and core practice data.
- After secure setup, the user should land in a dedicated setup hub rather than the normal dashboard.
- Signature assets are optional in Phase 1, but later document workflows should require them before use.

### Trust surface
- Privacy and control signals should be visible but discreet, not loud in every screen and not buried in settings.
- Audit visibility should be human-readable and understandable by the psychologist, not only a technical compliance log.
- Sensitive actions such as exports, account-security changes, or major edits should use calm confirmation plus re-authentication.
- Session/access control should be the most visible trust-control area in settings from day one.

### Claude's Discretion
- Exact wording and visual treatment of verification, re-auth, and trust cues.
- Specific MFA factor implementation choice inside the already locked “MFA before access” requirement.
- Exact checklist step order inside the setup hub.
- Exact information density and layout for the human-readable activity view.

</decisions>

<specifics>
## Specific Ideas

- The vault should feel secure and professional without becoming cold or punitive.
- Re-auth and sensitive confirmations should feel calm, not alarmist.
- Setup should communicate “you are preparing your vault” rather than “you are filling enterprise admin forms.”

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — the repository is greenfield and currently contains only `.planning/` artifacts.

### Established Patterns
- GSD planning structure is already in place and should remain the source of truth for scope and dependency order.
- The research corpus already points toward a modular-monolith, web-first architecture with strong auth, private file storage, and auditability.

### Integration Points
- Phase 1 should create the base application/runtime structure that later phases connect to.
- Professional profile and secure session context must become shared dependencies for later document, finance, and dashboard work.
- Audit/event foundations created here must be reusable by later patient, clinical, document, and export flows.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-vault-foundation*
*Context gathered: 2026-03-13*
