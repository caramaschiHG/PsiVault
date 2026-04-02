---
phase: 24
slug: continuidade-e-fluxo
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-02
---

# Phase 24 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (node env, globals) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test tests/prontuario-timeline.test.ts -x` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test tests/prontuario-timeline.test.ts -x`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 24-01-01 | 01 | 0 | CONT-01, CONT-02, CONT-04 | unit | `pnpm test tests/prontuario-timeline.test.ts -x` | ❌ W0 | ⬜ pending |
| 24-02-01 | 02 | 1 | CONT-01 | unit | `pnpm test tests/prontuario-timeline.test.ts -x` | ❌ W0 | ⬜ pending |
| 24-02-02 | 02 | 1 | CONT-02 | unit | `pnpm test tests/prontuario-timeline.test.ts -x` | ❌ W0 | ⬜ pending |
| 24-02-03 | 02 | 1 | CONT-03 | manual | — | N/A | ⬜ pending |
| 24-02-04 | 02 | 1 | CONT-04 | unit | `pnpm test tests/prontuario-timeline.test.ts -x` | ❌ W0 | ⬜ pending |
| 24-03-01 | 03 | 2 | CONT-01, CONT-04 | unit | `pnpm test tests/prontuario-timeline.test.ts -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/prontuario-timeline.test.ts` — stubs para CONT-01 (ordenação cronológica, upcoming como primeiro), CONT-02 (lookup notesByAppointment), CONT-04 (empty state, badge "Novo acompanhamento")
- [ ] Fixtures de atendimentos (upcoming, completed, dismissed) para montar cenários de timeline

*Infraestrutura existente (vitest, repositórios in-memory) cobre o setup — nenhum pacote novo.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Breadcrumb renderiza com link para `/prontuario` | CONT-03 | Markup estático — sem lógica testável em unit | Navegar para `/prontuario/[qualquer-id]` e verificar que o breadcrumb exibe "Prontuário → [Nome]" com link funcional |
| Hierarquia visual (H1 serif, h2 + separadores, flow linear) | CONT-03 | Verificação visual de CSS tokens | Inspecionar elemento: H1 usa `var(--font-serif)`, seções separadas por `<hr>`, sem cards soltos |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
