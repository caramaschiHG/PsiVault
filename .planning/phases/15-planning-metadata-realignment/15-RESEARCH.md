# Phase 15: Planning Metadata Realignment - Research

**Researched:** 2026-03-18
**Domain:** GSD planning metadata consistency, active milestone boundary, phase artifact topology
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

No `15-CONTEXT.md` exists for this phase.

### Locked Decisions

None explicitly captured. The roadmap and milestone audit define the required outcomes:

- Active milestone metadata must stop conflicting across `.planning/PROJECT.md`, `.planning/STATE.md`, and `.planning/ROADMAP.md`
- Phase artifacts `07` and `08` must be reachable from the active `.planning/phases/` tree or by an equivalent structure that GSD resolves correctly
- GSD phase discovery must reflect roadmap reality for the current launch scope
- The current launch milestone boundary must be documented unambiguously

### Claude's Discretion

- Whether the canonical fix for phases `07` and `08` is a move or a copy, as long as one active canonical location exists and stale references are removed
- How much of the audit narrative should be updated versus left as historical evidence, as long as active documents stop contradicting each other
- Exact wording for the normalized milestone boundary in `PROJECT.md`, `ROADMAP.md`, and `STATE.md`

### Deferred Ideas (OUT OF SCOPE)

- Closing requirement-level verification gaps for phases `16`–`20`
- Changing GSD code under `$HOME/.codex/get-shit-done/`; this phase should fix project metadata first
- Re-implementing workspace identity or runtime hardening; those remain phase `18` and `20` concerns

</user_constraints>

---

<phase_requirements>
## Phase Requirements

This phase has no requirement IDs in `REQUIREMENTS.md`. Its scope is defined by roadmap success criteria and the milestone audit.

| Scope Item | Description | Research Support |
|------------|-------------|-----------------|
| Metadata alignment | Make the active milestone version and current phase consistent across project planning files | `PROJECT.md` says `v1.2`; `STATE.md` still says `v1.1` and `Ready to start Phase 10`; `ROADMAP.md` mixes both scopes |
| Artifact topology | Make phases `07` and `08` available in the active phases tree | `07` and `08` exist only under `.planning/milestones/v1.1-phases/` today |
| GSD continuity | Ensure `init`/phase discovery/next-phase resolution no longer fight the roadmap | `v1.1-MILESTONE-AUDIT.md` explicitly flags milestone automation continuity as broken |
| Launch-scope boundary | Document the current unarchived milestone cleanly | Current docs describe a merged launch scope but use different milestone labels |

</phase_requirements>

---

## Summary

Phase 15 is a planning-operations repair phase. The codebase is not the problem; the planning system metadata is. The current repository has one live launch scope spread across two milestone labels:

- `.planning/PROJECT.md` says the current milestone is `v1.2 Lançamento`
- `.planning/STATE.md` frontmatter still says `milestone: v1.1`, `status: Ready to start Phase 10`, and keeps pending todos for phases already completed
- `.planning/ROADMAP.md` contains both a `v1.1` section (phases `07`–`11`) and a `v1.2` section (phases `12`–`20`) in a single active file
- `.planning/milestones/v1.1-phases/` contains phases `07` and `08`, while `.planning/phases/` contains phases `09`–`20`

This split breaks the planning invariants that GSD expects: one active milestone label, one active phase tree, and one coherent “next phase” story. The milestone audit already captured the failure mode clearly in `.planning/v1.1-MILESTONE-AUDIT.md`.

**Primary recommendation:** execute this phase in three plans:

1. Canonicalize the active launch milestone metadata across `PROJECT.md`, `ROADMAP.md`, and `STATE.md`
2. Promote phases `07` and `08` into the active `.planning/phases/` tree and rewrite stale internal references
3. Run command-level GSD consistency checks and update the live planning narrative so the normalized structure is explicit for milestone closeout

---

## Root-Cause Findings

### 1. The active milestone label is split across live files

`PROJECT.md` was updated for `v1.2`, but `STATE.md` was not. `STATE.md` still describes the project as if phase `10` has not started, despite phase `14` being complete and phase `15` planned next.

### 2. The active phase tree is incomplete

The live tree `.planning/phases/` starts at phase `09`. Phases `07` and `08` remain in `.planning/milestones/v1.1-phases/`, which acts like an archive path even though those phases are still part of the current unarchived launch scope.

### 3. Roadmap scope and milestone scope are conflated

`ROADMAP.md` mixes “historical milestone labels” with “current execution scope.” That is acceptable for history, but only if the active scope is clearly marked and aligned with `STATE.md` and `PROJECT.md`.

### 4. Audit evidence is correct but still describes a broken present

`.planning/v1.1-MILESTONE-AUDIT.md` correctly explains the inconsistency. Once Phase 15 executes, that audit should remain historical evidence, but the active documents must stop reproducing the same contradictions.

---

## Standard Stack

| Tool | Purpose | Why It Matters |
|------|---------|----------------|
| Markdown planning artifacts | `PROJECT.md`, `ROADMAP.md`, `STATE.md`, phase docs | Phase 15 is entirely metadata/document topology work |
| `node "$HOME/.codex/get-shit-done/bin/gsd-tools.cjs"` | GSD init and roadmap resolution | Must prove the normalized metadata is consumable by GSD |
| `rg`, `find` | Consistency checks | Fastest way to confirm stale milestone labels and misplaced paths are gone |

No application-runtime libraries are involved in this phase.

---

## Architecture Patterns

### Pattern 1: One Active Milestone, One Active State

The active milestone should be expressible without interpretation:

- `PROJECT.md` declares the launch milestone
- `ROADMAP.md` makes the live scope explicit
- `STATE.md` names the same milestone and the same current focus

If one file requires “special interpretation,” planning automation drifts.

### Pattern 2: One Canonical Active Phase Tree

Completed-but-unarchived phases that still belong to the current launch scope should live under `.planning/phases/`. Historical archive trees under `.planning/milestones/` should not be the only source of truth for active phases.

### Pattern 3: Historical Evidence Can Stay, But Active References Must Follow Canonical Paths

It is acceptable to keep historical milestone folders for provenance. It is not acceptable for active plan/research/context files to keep pointing at those locations after a canonical move.

### Pattern 4: Command-Level Validation for Metadata Phases

This phase should not rely on prose-only confidence. It needs executable checks such as:

- `gsd-tools init plan-phase 15`
- `gsd-tools roadmap get-phase 16`
- `find .planning/phases -maxdepth 1 -name '07-*' -o -name '08-*'`
- `rg` checks proving milestone labels and stale paths were removed from live docs

## Validation Architecture

Phase 15 can be fully validated with deterministic file-system and CLI checks. No browser verification is needed.

**Quick loop**
- `node "$HOME/.codex/get-shit-done/bin/gsd-tools.cjs" init plan-phase "15"`
- `find .planning/phases -maxdepth 1 \\( -name '07-*' -o -name '08-*' \\) | sort`

**Full loop**
- `node "$HOME/.codex/get-shit-done/bin/gsd-tools.cjs" init plan-phase "15"`
- `node "$HOME/.codex/get-shit-done/bin/gsd-tools.cjs" roadmap get-phase "16"`
- `rg -n "milestone: v1\\.2|Current Milestone: v1\\.2|# Execution Roadmap: PsiVault v1\\.2" .planning/STATE.md .planning/PROJECT.md .planning/ROADMAP.md`
- `rg -n "\\.planning/milestones/v1\\.1-phases/(07|08)-" .planning/phases .planning/ROADMAP.md .planning/STATE.md .planning/PROJECT.md`

**Pass condition**
- GSD resolves the current scope without conflicting milestone labels
- phases `07` and `08` are reachable from `.planning/phases/`
- live planning docs stop pointing at stale milestone-only paths for active work

---

## Recommended Implementation Waves

| Wave | Plans | Purpose |
|------|-------|---------|
| 1 | `15-01`, `15-02` | Normalize metadata first, then promote `07`/`08` into the active phase tree |
| 2 | `15-03` | Run GSD continuity checks and update the live planning narrative with the normalized structure |

---

## Risks and Pitfalls

### Pitfall 1: Copying `07`/`08` without updating internal references

If plan files inside the moved directories still point to `.planning/milestones/v1.1-phases/...`, execution will continue to leak the old topology.

### Pitfall 2: Updating milestone labels but leaving stale current-position text

Changing only frontmatter is insufficient. `STATE.md` also has prose sections, progress, current focus, and pending todos that still describe a pre-phase-10 world.

### Pitfall 3: “Preserving history” by keeping two active sources of truth

Historical preservation should not create two canonical locations for the same phase. Choose one active path and make the rest archival-only.

### Pitfall 4: Fixing documents without proving GSD resolution

Because the bug is about planning automation continuity, command-level verification is mandatory. This phase is not complete until `gsd-tools` behavior matches the normalized structure.

---

## Files Most Likely to Change

- `.planning/PROJECT.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/v1.1-MILESTONE-AUDIT.md`
- `.planning/phases/07-infrastructure-foundation/*`
- `.planning/phases/08-authentication-workspaces/*`
- `.planning/milestones/v1.1-phases/07-infrastructure-foundation/*` or archival pointer docs
- `.planning/milestones/v1.1-phases/08-authentication-workspaces/*` or archival pointer docs

---

## Research Conclusion

Phase 15 does not need product design input to be plannable. The failure mode is already concrete, reproducible, and bounded. The only correct outcome is a single active launch milestone narrative backed by a single active phase tree, with command-level proof that GSD now resolves the same reality the roadmap describes.
