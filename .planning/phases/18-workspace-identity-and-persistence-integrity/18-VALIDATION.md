---
phase: 18
slug: workspace-identity-and-persistence-integrity
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-21
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest / React Testing Library |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm run test:ui` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test:ui`
- **After every plan wave:** Run `npm run test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 18-01-01 | 01 | 1 | NTYPE-01..06 | — | N/A | manual | N/A | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/ui/__tests__/notification-item.test.tsx` — stubs for NTYPE-01..06

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Notification Icons & Colors | NTYPE-01..06 | Visual styling / Tailwind classes | Open dropdown and inspect SVG colors and backgrounds for each type. |
| Navigation Action | NTYPE-02..05 | React Router integration | Click on a session_reminder notification and verify it navigates to /agenda. |
| Accordion Expansion | NTYPE-01 | Interactive animation | Click on an update notification and verify it expands smoothly pushing others down. |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
