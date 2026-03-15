# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

---

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-15
**Phases:** 6 | **Plans:** 21 | **Commits:** 116

### What Was Built

- **Phase 1 — Vault Foundation:** Next.js App Router scaffold with Prisma, TOTP MFA, session management, professional profile, and a structured audit trail with SECU-05 privacy enforcement from day one.
- **Phase 2 — Patient & Agenda Core:** Patient aggregate with soft-archive semantics, appointment lifecycle (5 states), recurrence, hard-block conflict engine, daily/weekly agenda views, and quick next-session workflow.
- **Phase 3 — Clinical Record Core:** Session-note domain with structured + freetext fields, audit-preserving edits, session numbering, and patient longitudinal clinical timeline.
- **Phase 4 — Document Vault:** Template-driven document generation (5 types), signature gate, secure storage with provenance, patient-linked retrieval surface with archive and edit flows.
- **Phase 5 — Finance & Assisted Operations:** SessionCharge lifecycle with auto-creation on appointment completion, Pix-oriented manual payment marking, monthly finance view, online-care meeting link management, and WhatsApp-prefilled communication actions.
- **Phase 6 — Retrieval, Recovery & Launch Polish:** `/inicio` dashboard aggregating today's sessions, reminders, and pending payment count; Reminder domain with patient linking; persistent global search across all domains; per-patient JSON export and full workspace backup with verification; settings sub-navigation.

### What Worked

- **Domain-first TDD:** Writing tests before implementation (especially in Phases 1–3) caught interface mismatches early and made the later UI layers predictable. The test suite reached 289 tests at ship.
- **In-memory repository pattern:** The decision to use DB-swap-ready in-memory repositories from Phase 1 removed all database-blocking friction from all 6 phases. Every domain module shipped without a single Prisma migration delay.
- **SECU-05 type enforcement:** Encoding privacy constraints into TypeScript types (`SearchResultItem`, audit metadata) rather than runtime checks meant the verifier never found leakage issues after Phase 1.
- **Server-first component model:** Keeping all domain data in server components and using client islands only where interactivity was unavoidable made the rendering model simple and easy to audit.
- **Wave-based plan execution:** Plans with no dependencies ran in parallel within a phase. This was especially effective in Phase 6 where domain (06-01) and export (06-04) ran simultaneously.
- **Gap closure loop:** The plan → execute → verify → plan-gaps → execute → re-verify cycle worked cleanly. Phase 6's gap (settings navigation discoverability) was identified, planned, executed, and re-verified in one tight loop.

### What Was Inefficient

- **ROADMAP.md plan checkbox drift:** Plan completion checkboxes in ROADMAP.md required manual updates and were sometimes stale (Phase 4 showed "1/3" at Phase 6 completion). The CLI tools maintain them but aren't always invoked consistently.
- **Phase 2 plan count discrepancy:** ROADMAP.md showed 3 plans for Phase 2 but 4 were executed (02-04 was added mid-phase). The plan count in the roadmap wasn't updated retroactively, causing minor confusion.
- **Summary extraction fields:** The `summary-extract` CLI tool returned `None` for `one_liner` because SUMMARY.md files use YAML `provides` arrays rather than a flat `one_liner` field. Accomplishments had to be extracted manually from `provides` arrays.
- **Settings navigation gap:** Truth #15 (settings sub-nav discoverability) could have been caught earlier if the plan had explicitly considered how users would discover all three settings pages. The pattern of adding a `settings/layout.tsx` was obvious in hindsight but wasn't in the original plan.

### Patterns Established

- **In-memory store singleton pattern:** `globalThis.__psivault{Domain}__` with a typed global for each domain. All 6 domains follow this exactly — copy-paste safe for next milestone.
- **SECU-05 at type boundaries:** Sensitive content is excluded by type, not by runtime filter. Applied to SearchResultItem, audit event metadata, and dashboard aggregations.
- **Server action pattern:** `"use server"`, crypto ID, audit event, revalidatePath. All 9 server actions in Phase 6 follow this exactly.
- **Nested layout for route-group sub-nav:** `(vault)/settings/layout.tsx` applied to all `/settings/*` routes without touching existing pages — clean pattern for any future sub-navigation grouping.
- **Re-auth gate pattern:** Cookie with 10-minute window checked at the top of sensitive route handlers. Two handlers follow this pattern — reusable for future sensitive operations.

### Key Lessons

1. **Plan the full navigation surface in the plan, not just the page.** Truth #15 failed because the plan for `/settings/dados-e-privacidade` implemented the page but didn't include wiring it into the navigation. Future plans should include a "discoverability" check: how does a user who doesn't know the URL find this feature?
2. **SUMMARY.md `provides` arrays are the reliable one-liner source.** The `one_liner` CLI field doesn't work; always extract from `provides` when building milestone summaries.
3. **Gap closure is fast when the gap is well-described.** The VERIFICATION.md gap description was precise enough (exact files, exact missing behavior, 3 fix options) that the planner could generate a correct plan in one pass and the plan checker passed on the first iteration.
4. **Two days for a full 6-phase product is achievable with GSD.** The entire PsiLock v1.0 office workflow — auth, patients, clinical, documents, finance, search, backup — was planned, executed, and verified in 2 days.

### Cost Observations

- Model mix: Primarily Sonnet 4.6 (executor, verifier, planner, checker) throughout all 6 phases
- Sessions: ~12-15 context windows (one per major phase + gap closures)
- Notable: Yolo mode kept overhead minimal; interactive checkpoints only for human-verification items that genuinely required browser interaction

---

## Cross-Milestone Trends

| Metric | v1.0 |
|--------|------|
| Phases | 6 |
| Plans | 21 |
| Tests at ship | 289 |
| Files | 214 |
| LOC (TS/TSX) | ~15,935 |
| Timeline | 2 days |
| Commits | 116 |
| Gaps found at verify | 1 (settings nav) |
| Gap closure iterations | 1 |

| Pattern | First appeared | Status |
|---------|---------------|--------|
| In-memory store singleton | Phase 1 | ✓ Established |
| SECU-05 type enforcement | Phase 1 | ✓ Established |
| Server action template | Phase 2 | ✓ Established |
| Re-auth gate | Phase 6 | ✓ Established |
| Nested layout sub-nav | Phase 6 | ✓ Established |
