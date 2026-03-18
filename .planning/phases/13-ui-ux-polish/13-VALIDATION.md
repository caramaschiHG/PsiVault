---
phase: 13
slug: ui-ux-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (node env, globals: true) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm build` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~30 seconds (build) / ~10 seconds (tests) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm build` (valida TypeScript + Next.js file conventions)
- **After every plan wave:** Run `pnpm test` (suite completa de domain tests)
- **Before `/gsd:verify-work`:** Build verde + suite verde obrigatórios
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 0 | UIUX-05 | smoke | `pnpm build` | ❌ W0 | ⬜ pending |
| 13-01-02 | 01 | 0 | UIUX-05 | smoke | `pnpm build` | ❌ W0 | ⬜ pending |
| 13-01-03 | 01 | 0 | UIUX-05 | smoke | `pnpm build` | ❌ W0 | ⬜ pending |
| 13-01-04 | 01 | 0 | UIUX-05 | smoke | `pnpm build` | ❌ W0 | ⬜ pending |
| 13-01-05 | 01 | 0 | UIUX-05 | smoke | `pnpm build` | ❌ W0 | ⬜ pending |
| 13-02-01 | 02 | 1 | UIUX-01 | manual | inspeção visual em browser | N/A | ⬜ pending |
| 13-02-02 | 02 | 1 | UIUX-01 | manual | inspeção visual em browser | N/A | ⬜ pending |
| 13-03-01 | 03 | 2 | UIUX-06 | manual | inspeção visual em browser | N/A | ⬜ pending |
| 13-03-02 | 03 | 2 | UIUX-03 | manual | DevTools viewport resize | N/A | ⬜ pending |
| 13-04-01 | 04 | 3 | UIUX-02 | manual | inspeção visual em browser | N/A | ⬜ pending |
| 13-04-02 | 04 | 3 | UIUX-04 | manual | browser accessibility checker | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/app/(vault)/inicio/loading.tsx` — skeleton para UIUX-05
- [ ] `src/app/(vault)/inicio/error.tsx` — error boundary para UIUX-05
- [ ] `src/app/(vault)/agenda/loading.tsx` — skeleton para UIUX-05
- [ ] `src/app/(vault)/agenda/error.tsx` — error boundary para UIUX-05
- [ ] `src/app/(vault)/patients/loading.tsx` — skeleton para UIUX-05
- [ ] `src/app/(vault)/patients/error.tsx` — error boundary para UIUX-05
- [ ] `src/app/(vault)/patients/[patientId]/loading.tsx` — skeleton para UIUX-05
- [ ] `src/app/(vault)/patients/[patientId]/error.tsx` — error boundary para UIUX-05
- [ ] `src/app/(vault)/financeiro/loading.tsx` — skeleton para UIUX-05
- [ ] `src/app/(vault)/financeiro/error.tsx` — error boundary para UIUX-05

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Tokens CSS aplicados consistentemente | UIUX-01 | Verificação visual — CSS vars não testáveis em Node.js | Abrir browser, inspecionar variáveis CSS no DevTools |
| Visual profissional em views primárias | UIUX-02 | Julgamento estético — subjetivo | Revisão visual em início, agenda, patients, financeiro |
| Responsividade 375px–1440px | UIUX-03 | Requer rendering real de browser | DevTools → responsive mode, testar 375px e 1440px |
| WCAG 2.1 AA contraste | UIUX-04 | Requer rendering de cores em browser | Chrome Accessibility → color contrast checker |
| Active states e transições de navegação | UIUX-06 | Interação e animação visual | Navegar entre rotas, verificar highlight na sidebar |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
